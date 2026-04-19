import exifr from 'exifr';

// ─────────────────────────────────────────────────────────────────
// 1. HAVERSINE FORMULA — distance in metres between two GPS points
// ─────────────────────────────────────────────────────────────────
export function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth radius in metres
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─────────────────────────────────────────────────────────────────
// 2. LOCATION VERDICT — 50m / 500m thresholds
// ─────────────────────────────────────────────────────────────────
export function getLocationVerdict(distanceMetres) {
  if (distanceMetres <= 50) {
    return {
      status: 'PASS',
      level: 'perfect',
      label: '✅ Perfect Match',
      detail: `Only ${Math.round(distanceMetres)}m away from citizen location.`,
      color: '#10b981',
      bg: 'rgba(16,185,129,0.12)',
      border: 'rgba(16,185,129,0.35)',
    };
  } else if (distanceMetres <= 500) {
    return {
      status: 'WARN',
      level: 'acceptable',
      label: '⚠️ Acceptable — Location Slightly Off',
      detail: `${Math.round(distanceMetres)}m from citizen location (within 500m tolerance).`,
      color: '#f59e0b',
      bg: 'rgba(245,158,11,0.12)',
      border: 'rgba(245,158,11,0.35)',
    };
  } else {
    return {
      status: 'FAIL',
      level: 'suspicious',
      label: '🚨 FAILED — Suspicious Location Mismatch',
      detail: `${Math.round(distanceMetres)}m away — far outside the 500m tolerance. Possible fraud.`,
      color: '#ef4444',
      bg: 'rgba(239,68,68,0.12)',
      border: 'rgba(239,68,68,0.35)',
    };
  }
}

// ─────────────────────────────────────────────────────────────────
// 3. TIMESTAMP VERDICT — officer photo must be AFTER citizen photo
// ─────────────────────────────────────────────────────────────────
export function getTimestampVerdict(citizenTimestamp, officerTimestamp) {
  if (!citizenTimestamp || !officerTimestamp) {
    return { status: 'SKIP', label: 'Timestamp unavailable', color: '#6b7280' };
  }
  const cDate = new Date(citizenTimestamp);
  const oDate = new Date(officerTimestamp);
  if (oDate > cDate) {
    return {
      status: 'PASS',
      label: '✅ Timestamp Valid',
      detail: `Officer photo taken ${Math.round((oDate - cDate) / 60000)} min after citizen.`,
      color: '#10b981',
    };
  } else {
    return {
      status: 'FAIL',
      label: '🚨 FAILED — Fraudulent Old Image',
      detail: `Officer photo timestamp (${oDate.toLocaleString()}) is BEFORE citizen submission (${cDate.toLocaleString()}).`,
      color: '#ef4444',
    };
  }
}

// ─────────────────────────────────────────────────────────────────
// 4. EXIF EXTRACTOR — parses GPS + timestamp from raw File object
// ─────────────────────────────────────────────────────────────────
export async function extractExifMetadata(file) {
  try {
    const parsed = await exifr.parse(file, {
      tiff: true,
      gps: true,
      exif: true,
      pick: ['latitude', 'longitude', 'DateTimeOriginal', 'DateTime', 'GPSLatitude', 'GPSLongitude'],
    });

    if (!parsed) {
      return { hasExif: false, error: 'No EXIF data found. Please upload an original photo directly from your camera.' };
    }

    const lat = parsed.latitude ?? null;
    const lng = parsed.longitude ?? null;
    const timestamp = parsed.DateTimeOriginal ?? parsed.DateTime ?? null;

    return {
      hasExif: true,
      lat,
      lng,
      hasGps: lat !== null && lng !== null,
      timestamp,
      hasTimestamp: timestamp !== null,
    };
  } catch (err) {
    return { hasExif: false, error: 'Could not read image metadata. Please upload an original camera photo.' };
  }
}

// ─────────────────────────────────────────────────────────────────
// 5. MASTER VERIFICATION FUNCTION
//    citizenMeta: { lat, lng, timestamp }  (from DB/Redux)
//    officerFile: File object              (just uploaded)
// ─────────────────────────────────────────────────────────────────
export async function verifyFieldPhoto(citizenMeta, officerFile) {
  const officerExif = await extractExifMetadata(officerFile);

  // ── Missing EXIF → hard fail ──────────────────────────────────
  if (!officerExif.hasExif) {
    return {
      passed: false,
      blockSubmit: true,
      exifError: officerExif.error,
      locationVerdict: null,
      timestampVerdict: null,
      distanceMetres: null,
    };
  }

  // ── GPS check ─────────────────────────────────────────────────
  let locationVerdict = null;
  let distanceMetres = null;

  if (officerExif.hasGps && citizenMeta?.lat && citizenMeta?.lng) {
    distanceMetres = haversineDistance(
      citizenMeta.lat, citizenMeta.lng,
      officerExif.lat, officerExif.lng
    );
    locationVerdict = getLocationVerdict(distanceMetres);
  } else if (!officerExif.hasGps) {
    locationVerdict = {
      status: 'FAIL',
      level: 'no_gps',
      label: '🚨 FAILED — No GPS in Photo',
      detail: 'EXIF found but no GPS coordinates. Upload a photo taken outdoors with location enabled.',
      color: '#ef4444',
      bg: 'rgba(239,68,68,0.12)',
      border: 'rgba(239,68,68,0.35)',
    };
  }

  // ── Timestamp check ───────────────────────────────────────────
  const timestampVerdict = getTimestampVerdict(citizenMeta?.submittedAt, officerExif.timestamp);

  // ── Overall pass/fail ─────────────────────────────────────────
  const locFail = locationVerdict?.status === 'FAIL';
  const timeFail = timestampVerdict?.status === 'FAIL';
  const passed = !locFail && !timeFail;

  return {
    passed,
    blockSubmit: locFail || timeFail,
    exifError: null,
    officerExif,
    locationVerdict,
    timestampVerdict,
    distanceMetres,
  };
}
