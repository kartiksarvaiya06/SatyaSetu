import express from 'express';
import { initiateIvrCall, ivrTwiml, ivrInput, ivrStatus } from '../controllers/ivrController.js';

const router = express.Router();

// Dept officer triggers the call
router.post('/call/:grievanceId', initiateIvrCall);

// Twilio fetches TwiML script to play to citizen (Twilio uses POST)
router.get('/twiml/:grievanceId', ivrTwiml);
router.post('/twiml/:grievanceId', ivrTwiml);

// Twilio sends citizen's key press here
router.post('/input/:grievanceId', ivrInput);

// Twilio call status callback
router.post('/status/:grievanceId', ivrStatus);

export default router;
