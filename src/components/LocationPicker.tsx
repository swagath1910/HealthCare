import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation } from 'lucide-react';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  initialLocation?: { lat: number; lng: number };
}

const LocationPicker: React.FC<LocationPickerProps> = ({ onLocationSelect, initialLocation }) => {
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(
    initialLocation || null
  );
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const handleLocationSelect = (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
    onLocationSelect(lat, lng);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsGettingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          handleLocationSelect(latitude, longitude);
          setIsGettingLocation(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsGettingLocation(false);
          alert('Unable to get your current location. Please click on the map to select a location.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser. Please click on the map to select a location.');
    }
  };

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    const defaultCenter: [number, number] = selectedLocation 
      ? [selectedLocation.lat, selectedLocation.lng] 
      : [40.7128, -74.0060]; // Default to NYC

    const map = L.map(mapRef.current).setView(defaultCenter, 13);
    mapInstanceRef.current = map;

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Add marker if location is selected
    if (selectedLocation) {
      const marker = L.marker([selectedLocation.lat, selectedLocation.lng])
        .addTo(map)
        .bindPopup('Selected Location')
        .openPopup();
      markerRef.current = marker;
    }

    // Handle map clicks
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      handleLocationSelect(lat, lng);
      
      // Remove existing marker
      if (markerRef.current) {
        map.removeLayer(markerRef.current);
      }
      
      // Add new marker
      const marker = L.marker([lat, lng])
        .addTo(map)
        .bindPopup('Selected Location')
        .openPopup();
      markerRef.current = marker;
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      markerRef.current = null;
    };
  }, []);

  // Update marker when selectedLocation changes
  useEffect(() => {
    if (mapInstanceRef.current && selectedLocation) {
      // Remove existing marker
      if (markerRef.current) {
        mapInstanceRef.current.removeLayer(markerRef.current);
      }
      
      // Add new marker
      const marker = L.marker([selectedLocation.lat, selectedLocation.lng])
        .addTo(mapInstanceRef.current)
        .bindPopup('Selected Location')
        .openPopup();
      markerRef.current = marker;
      
      // Center map on new location
      mapInstanceRef.current.setView([selectedLocation.lat, selectedLocation.lng], 13);
    }
  }, [selectedLocation]);

  return (
    <div className="space-y-4 glass-effect p-6 rounded-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <label className="block text-sm font-bold text-dark">
          <MapPin className="h-5 w-5 inline mr-2" />
          Select Location on Map
        </label>
        <button
          type="button"
          onClick={getCurrentLocation}
          disabled={isGettingLocation}
          className="flex items-center space-x-2 text-sm btn-primary-3d px-4 py-2 rounded-xl font-bold text-white disabled:opacity-50 hover-lift"
        >
          <Navigation className="h-5 w-5" />
          <span>{isGettingLocation ? 'Getting Location...' : 'Use Current Location'}</span>
        </button>
      </div>
      
      {/* Interactive Map */}
      <div className="h-64 w-full map-container-3d">
        <div ref={mapRef} className="h-full w-full" />
      </div>
      
      {/* Manual coordinate input */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-dark mb-2">Latitude</label>
          <input
            type="number"
            step="any"
            value={selectedLocation?.lat || ''}
            onChange={(e) => {
              const lat = parseFloat(e.target.value);
              if (!isNaN(lat) && selectedLocation) {
                handleLocationSelect(lat, selectedLocation.lng);
              }
            }}
            className="input-3d w-full px-3 py-2 text-sm"
            placeholder="40.7128"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-dark mb-2">Longitude</label>
          <input
            type="number"
            step="any"
            value={selectedLocation?.lng || ''}
            onChange={(e) => {
              const lng = parseFloat(e.target.value);
              if (!isNaN(lng) && selectedLocation) {
                handleLocationSelect(selectedLocation.lat, lng);
              }
            }}
            className="input-3d w-full px-3 py-2 text-sm"
            placeholder="-74.0060"
          />
        </div>
      </div>
      
      {selectedLocation && (
        <div className="success-popup p-4 rounded-xl border border-green-200">
          <div className="flex items-center space-x-3 text-sm text-green-800">
            <MapPin className="h-5 w-5 animate-glow" />
            <span>Location selected: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}</span>
          </div>
        </div>
      )}
      
      <p className="text-xs text-dark-muted font-medium">
        Click on the map to select a location, use "Use Current Location" to automatically detect your position, or enter coordinates manually.
      </p>
    </div>
  );
};

export default LocationPicker;