import { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, LayersControl, ZoomControl } from 'react-leaflet';
import { useTranslation } from 'react-i18next';
import L from 'leaflet';

// Fix for default marker icon in Leaflet + React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

import { forwardGeocode } from '../../utils/locationAPI';

const LIQ_KEY = import.meta.env.VITE_LOCATIONIQ_KEY;

// Internal component to handle center changes from parent
function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center[0] && center[1]) {
      console.log(`[ChangeView] Flying to: ${center[0]}, ${center[1]}`);
      map.flyTo(center, 16, {
        duration: 1.5,
        animate: true
      });
    }
  }, [center, map]);
  return null;
}

// Custom Zoom component for Bottom Right placement
function CustomZoomControl() {
  const map = useMap();
  return (
    <div className="leaflet-bottom leaflet-right" style={{ marginBottom: '30px', marginRight: '10px', zIndex: 1000 }}>
      <div className="leaflet-control-zoom leaflet-bar leaflet-control">
        <a 
          className="leaflet-control-zoom-in" 
          href="#" 
          title="Zoom in" 
          role="button" 
          onClick={(e) => { e.preventDefault(); map.zoomIn(); }}
          style={{ cursor: 'pointer', background: 'white', color: 'black' }}
        >+</a>
        <a 
          className="leaflet-control-zoom-out" 
          href="#" 
          title="Zoom out" 
          role="button" 
          onClick={(e) => { e.preventDefault(); map.zoomOut(); }}
          style={{ cursor: 'pointer', background: 'white', color: 'black' }}
        >-</a>
      </div>
    </div>
  );
}

export default function MapPicker({ lat, lng, onChange, height = '300px' }) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  
  // Default to Gandhinagar if no coords passed
  const center = useMemo(() => [lat || 23.2156, lng || 72.6369], [lat, lng]);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setSearchError(null);
    
    try {
      // Append context to make sure it finds strictly Indian/Gujarat cities
      const query = searchQuery.toLowerCase().includes('gujarat') 
        ? searchQuery 
        : `${searchQuery}, Gujarat, India`;
        
      console.log(`[MapPicker] Initiating forward geocode for: "${query}"`);
      
      const { lat: newLat, lng: newLng } = await forwardGeocode(query);
      
      console.log(`[MapPicker] Found coordinates: ${newLat}, ${newLng}`);
      onChange(newLat, newLng); // This updates the parent and moves the pin!
      
    } catch (err) {
      console.error('[MapPicker] Search Error:', err);
      // Clean up error message to be more user-friendly
      setSearchError("Location not found. Try a different name.");
    } finally {
      setIsSearching(false);
    }
  };

  function DraggableMarker() {
    const eventHandlers = useMemo(
      () => ({
        dragend(e) {
          const marker = e.target;
          if (marker != null) {
            const pos = marker.getLatLng();
            onChange(pos.lat, pos.lng);
          }
        },
      }),
      []
    );

    return (
      <Marker
        draggable={true}
        eventHandlers={eventHandlers}
        position={center}
      />
    );
  }

  function MapEvents() {
    useMapEvents({
      click(e) {
        onChange(e.latlng.lat, e.latlng.lng);
      },
    });
    return null;
  }

  return (
    <div style={{ height, width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', position: 'relative' }}>
      
      {/* Search Overlay */}
      <div style={{ 
        position: 'absolute', top: 12, left: 12, right: 12, zIndex: 3000, 
        pointerEvents: 'none' // Let clicks pass through empty space
      }}>
        <div style={{ display: 'flex', gap: 6, maxWidth: '420px', pointerEvents: 'auto' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input 
              type="text"
              className="input-dark"
              placeholder={t('common.mapSearch') || 'Search for area (e.g. Surat)...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(e); }}
              style={{ 
                height: '46px', fontSize: '1rem', width: '100%',
                background: 'rgba(15, 23, 42, 0.95)',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                border: '1px solid rgba(255,255,255,0.15)',
                paddingLeft: '16px', borderRadius: '12px'
              }}
            />
            {searchError && (
              <div style={{ 
                position: 'absolute', top: '100%', left: 0, right: 0, 
                backgroundColor: 'rgba(239, 68, 68, 0.9)', color: 'white',
                padding: '4px 12px', borderRadius: '4px', fontSize: '0.75rem', marginTop: '4px'
              }}>
                ⚠️ {searchError}
              </div>
            )}
          </div>
          <button 
            type="button" 
            onClick={handleSearch}
            disabled={isSearching}
            className="glow-btn"
            style={{
              width: '56px', height: '46px', borderRadius: '12px',
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              color: 'white', cursor: 'pointer', border: 'none',
              fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 16px rgba(37, 99, 235, 0.3)'
            }}
          >
            {isSearching ? <span className="spinner-mini"></span> : '🔍'}
          </button>
        </div>
      </div>

      <MapContainer 
        center={center} 
        zoom={13} 
        scrollWheelZoom={true} 
        zoomControl={false}
        style={{ height: '100%', width: '100%' }}
      >
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name={t('common.mapStandard') || "Standard Map"}>
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>
          
          <LayersControl.BaseLayer name={t('common.mapSatellite') || "Satellite View"}>
            <TileLayer
              attribution='&copy; Esri World Imagery'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        <ChangeView center={center} />
        <MapEvents />
        <DraggableMarker />
        <CustomZoomControl />
      </MapContainer>

      <style>{`
        .spinner-mini {
          width: 18px; height: 18px;
          border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff;
          border-radius: 50%; animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
