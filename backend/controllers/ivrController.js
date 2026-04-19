import twilio from 'twilio';
import Grievance from '../models/Grievance.js';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

/**
 * POST /api/ivr/call/:grievanceId
 * Dept officer triggers a real Twilio IVR call to the citizen
 */
export const initiateIvrCall = async (req, res) => {
  try {
    const { grievanceId } = req.params;
    const grievance = await Grievance.findOne({ grievanceId });

    if (!grievance) {
      return res.status(404).json({ message: 'Grievance not found' });
    }

    const toNumber = grievance.ivrMobile || grievance.complainantMobile;
    if (!toNumber) {
      return res.status(400).json({ message: 'No IVR mobile number found for this grievance' });
    }

    // Format number to E.164 for India (+91)
    const formattedNumber = toNumber.startsWith('+') ? toNumber : `+91${toNumber}`;

    const call = await client.calls.create({
      to: formattedNumber,
      from: process.env.TWILIO_PHONE_NUMBER,
      url: `${BACKEND_URL}/api/ivr/twiml/${grievanceId}`,
      statusCallback: `${BACKEND_URL}/api/ivr/status/${grievanceId}`,
      statusCallbackMethod: 'POST',
    });

    await Grievance.findOneAndUpdate(
      { grievanceId },
      { $push: { resolutionAttempts: { updatedAt: new Date(), note: `IVR call initiated to ${formattedNumber}`, status: 'field_verified' } } }
    );

    res.status(200).json({ message: 'IVR call initiated', callSid: call.sid, to: formattedNumber });
  } catch (error) {
    console.error('Twilio IVR error:', error);
    res.status(500).json({ message: 'Failed to initiate IVR call', error: error.message });
  }
};

/**
 * GET /api/ivr/twiml/:grievanceId
 * Returns TwiML XML for Twilio to play to the citizen.
 * Uses Google.gu-IN-Wavenet-A — proper Gujarati female voice via Twilio+Google TTS.
 */
export const ivrTwiml = async (req, res) => {
  const { grievanceId } = req.params;

  try {
    const grievance = await Grievance.findOne({ grievanceId });

    if (!grievance) {
      const errTwiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Say language="gu-IN" voice="Google.gu-IN-Wavenet-A">ફરિયાદ મળી નહીં.</Say></Response>`;
      res.set('Content-Type', 'text/xml');
      return res.send(errTwiml);
    }

    const category = grievance.category || 'general';

    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather numDigits="1" action="${BACKEND_URL}/api/ivr/input/${grievanceId}" method="POST" timeout="15">
    <Say language="gu-IN" voice="Google.gu-IN-Wavenet-A">સત્યસેતુ તરફથી હું વાત કરી રહ્યો છું. તમારી શ્રેણી ${category} માંથી ફરિયાદ નોંધાઈ છે. જો ફરિયાદ ઉકેલાઈ ગઈ હોય, તો એક દબાવો. જો ન ઉકેલાઈ હોય, તો બે દબાવો.</Say>
  </Gather>
  <Say language="gu-IN" voice="Google.gu-IN-Wavenet-A">કૃપા કરીને માન્ય ઇનપુટ દાખલ કરો.</Say>
</Response>`;

    res.set('Content-Type', 'text/xml');
    res.send(twiml);
  } catch (error) {
    console.error('TwiML Error:', error);
    const errTwiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Say language="gu-IN" voice="Google.gu-IN-Wavenet-A">ભૂલ આવી. કૃપા કરીને ફરી પ્રયાસ કરો.</Say></Response>`;
    res.set('Content-Type', 'text/xml');
    res.send(errTwiml);
  }
};

/**
 * POST /api/ivr/input/:grievanceId
 * Twilio webhook — citizen pressed a key
 */
export const ivrInput = async (req, res) => {
  const { grievanceId } = req.params;
  const digit = req.body?.Digits;

  let status, note, responseText;

  if (digit === '1') {
    status = 'verified_resolved';
    note = 'IVR: Citizen confirmed resolution (pressed 1)';
    responseText = 'ધન્યવાદ.';
  } else if (digit === '2') {
    status = 'auto_reopened';
    note = 'IVR: Citizen reported issue unresolved (pressed 2). Reopened for field re-verification.';
    responseText = 'ધન્યવાદ.';
  } else {
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="gu-IN" voice="Google.gu-IN-Wavenet-A">કૃપા કરીને માન્ય ઇનપુટ દાખલ કરો.</Say>
</Response>`;
    res.set('Content-Type', 'text/xml');
    return res.send(twiml);
  }

  try {
    await Grievance.findOneAndUpdate(
      { grievanceId },
      {
        status,
        $push: { resolutionAttempts: { updatedAt: new Date(), note, status } }
      }
    );
  } catch (err) {
    console.error('IVR status update error:', err);
  }

  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="gu-IN" voice="Google.gu-IN-Wavenet-A">${responseText}</Say>
</Response>`;
  res.set('Content-Type', 'text/xml');
  res.send(twiml);
};

/**
 * POST /api/ivr/status/:grievanceId
 * Twilio status callback
 */
export const ivrStatus = async (req, res) => {
  const { grievanceId } = req.params;
  const { CallStatus } = req.body;
  console.log(`IVR Call status for ${grievanceId}: ${CallStatus}`);
  res.sendStatus(200);
};
