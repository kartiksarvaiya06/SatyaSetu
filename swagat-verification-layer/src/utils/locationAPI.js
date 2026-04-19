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
//  LOCATIONIQ  — Primary reverse geocoder (free 5K/day, India accurate)
//  BigDataCloud — Fallback (free, no key)
//  Nominatim   — Final fallback (free, rate-limited)
// ─────────────────────────────────────────────────────────────────
const LIQ_KEY = import.meta.env.VITE_LOCATIONIQ_KEY;

// Parse a structured address object (works for both LocationIQ & Nominatim)
const parseAddressObj = (a = {}) => {
  const parts = [
    a.road || a.pedestrian || a.footway || a.hamlet,
    a.neighbourhood || a.suburb || a.village || a.town || a.city_district,
    a.city || a.county,
    a.state,
  ].filter(Boolean);
  return parts.length >= 2 ? parts.join(', ') : null;
};

export const reverseGeocode = async (lat, lng) => {
  // ── 1. Nominatim (OpenStreetMap) ────────────────────────────────
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=jsonv2&addressdetails=1&accept-language=en`,
      {
        headers: { 'User-Agent': 'SatyaSetu/1.0' },
        signal: AbortSignal.timeout(5000),
      }
    );
    if (!res.ok) throw new Error('Nominatim error');
    const d = await res.json();
    const addr = parseAddressObj(d.address);
    if (addr) return addr;
    if (d.display_name) return d.display_name.split(',').slice(0, 3).join(',').trim();
  } catch (e) {
    console.warn('[LocationAPI] Nominatim failed:', e.message);
  }

  // ── 2. BigDataCloud (free, no key needed backup) ────────────────
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!res.ok) throw new Error('BigDataCloud error');
    const d = await res.json();
    const parts = [
      d.locality,
      d.city || d.principalSubdivision,
      d.countryName,
    ].filter(Boolean);
    if (parts.length >= 2) return parts.join(', ');
  } catch (e) {
    console.warn('[LocationAPI] BigDataCloud failed:', e.message);
  }

  // ── 3. Raw coordinates as absolute last resort ─────────────────
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
};

// ─────────────────────────────────────────────────────────────────
//  FORWARD GEOCODE (for Map Search)
// ─────────────────────────────────────────────────────────────────
export const forwardGeocode = async (query) => {
  // 1. Nominatim (OpenStreetMap)
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (res.ok) {
      const data = await res.json();
      if (data && data.length > 0) {
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      }
    }
  } catch (e) {
    console.warn('[LocationAPI] Nominatim forward failed:', e.message);
  }

  throw new Error("Location not found");
};

// ─────────────────────────────────────────────────────────────────
//  IP-BASED FALLBACK (when GPS is denied)
//  ipinfo.io → ipapi.co → Gandhinagar (Gujarat capital)
// ─────────────────────────────────────────────────────────────────
const getIpLocation = async () => {
  // ipinfo.io — 50K/month free, very reliable
  try {
    const res = await fetch('https://ipinfo.io/json?token=', {
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) throw new Error();
    const d = await res.json();
    if (d.loc) {
      const [lat, lng] = d.loc.split(',').map(Number);
      if (lat && lng) return { lat, lng };
    }
  } catch { /* fall through */ }

  // ipapi.co — 1000/day free backup
  try {
    const res = await fetch('https://ipapi.co/json/', {
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) throw new Error();
    const d = await res.json();
    if (d.latitude && d.longitude) {
      return { lat: parseFloat(d.latitude), lng: parseFloat(d.longitude) };
    }
  } catch { /* fall through */ }

  // Absolute final fallback — Gandhinagar, Gujarat
  console.warn('[LocationAPI] All IP APIs failed, using Gandhinagar as fallback');
  return { lat: 23.2156, lng: 72.6369 };
};

// ─────────────────────────────────────────────────────────────────
//  MAIN EXPORT  — Used by GrievanceForm.jsx & FieldOfficerTasks.jsx
// ─────────────────────────────────────────────────────────────────
export async function captureSharedLocation() {
  return new Promise((resolve) => {
    const useFallback = async () => {
      console.log('[LocationAPI] GPS unavailable, falling back to IP location');
      const { lat, lng } = await getIpLocation();
      const address = await reverseGeocode(lat, lng);
      resolve({ lat, lng, address, source: 'ip' });
    };

    if (!('geolocation' in navigator)) {
      useFallback();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng, accuracy } = pos.coords;
        console.log(`[LocationAPI] GPS acquired: ${lat}, ${lng} (±${Math.round(accuracy)}m)`);
        const address = await reverseGeocode(lat, lng);
        resolve({ lat, lng, address, accuracy, source: 'gps' });
      },
      async (err) => {
        console.warn('[LocationAPI] GPS denied/failed:', err.message);
        await useFallback();
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
}
