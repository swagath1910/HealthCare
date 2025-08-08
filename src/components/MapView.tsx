import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, MapPin } from 'lucide-react';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Hospital {
  id: string;
  name: string;
  address: string;
  phone: string;
  rating: number;
  lat: number;
  lng: number;
  image?: string;
  distance?: number;
  doctors?: any[];
}

interface MapViewProps {
  hospitals: Hospital[];
  userLocation?: { lat: number; lng: number };
  onHospitalSelect?: (hospitalId: string) => void;
  selectedHospitalId?: string;
}

const MapView: React.FC<MapViewProps> = ({
  hospitals,
  userLocation,
  onHospitalSelect,
  selectedHospitalId,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const userMarkerRef = useRef<L.Marker | null>(null);
  const userCircleRef = useRef<L.Circle | null>(null);

  const [hoveredHospital, setHoveredHospital] = useState<Hospital | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [currentUserLocation, setCurrentUserLocation] = useState<{ lat: number; lng: number } | null>(
    userLocation || null
  );

  const openGoogleMapsDirections = (hospital: Hospital) => {
    const destination = `${hospital.lat},${hospital.lng}`;
    let googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
    if (currentUserLocation) {
      const origin = `${currentUserLocation.lat},${currentUserLocation.lng}`;
      googleMapsUrl += `&origin=${origin}`;
    }
    window.open(googleMapsUrl, '_blank');
  };

  const updateUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newLocation = { lat: latitude, lng: longitude };
          setCurrentUserLocation(newLocation);

          if (mapInstanceRef.current) {
            // Remove existing user marker and circle
            if (userMarkerRef.current) {
              mapInstanceRef.current.removeLayer(userMarkerRef.current);
            }
            if (userCircleRef.current) {
              mapInstanceRef.current.removeLayer(userCircleRef.current);
            }

            // Create blue dot for user location
            const userIcon = L.divIcon({
              html: `<div style="
                background: #3b82f6; 
                width: 16px; 
                height: 16px; 
                border-radius: 50%; 
                border: 3px solid white; 
                box-shadow: 0 0 15px rgba(59, 130, 246, 0.8);
                animation: pulse 2s infinite;
              "></div>
              <style>
                @keyframes pulse {
                  0% { box-shadow: 0 0 15px rgba(59, 130, 246, 0.8); }
                  50% { box-shadow: 0 0 25px rgba(59, 130, 246, 1); }
                  100% { box-shadow: 0 0 15px rgba(59, 130, 246, 0.8); }
                }
              </style>`,
              className: 'user-location-marker',
              iconSize: [22, 22],
              iconAnchor: [11, 11],
            });
            
            const userMarker = L.marker([latitude, longitude], { icon: userIcon }).addTo(mapInstanceRef.current);
            const userCircle = L.circle([latitude, longitude], {
              color: '#3b82f6',
              fillColor: '#3b82f6',
              fillOpacity: 0.1,
              radius: 1000,
              weight: 2,
            }).addTo(mapInstanceRef.current);

            userMarkerRef.current = userMarker;
            userCircleRef.current = userCircle;

            mapInstanceRef.current.setView([latitude, longitude], 13);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Could not get your location. Please ensure location services are enabled.');
        }
      );
    }
  };

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const defaultCenter: [number, number] = userLocation ? [userLocation.lat, userLocation.lng] : [28.6139, 77.2090];
    const map = L.map(mapRef.current).setView(defaultCenter, 12);
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    if (!userLocation) {
      updateUserLocation();
    } else {
      // Add user location marker if provided
      const userIcon = L.divIcon({
        html: `<div style="
          background: #3b82f6; 
          width: 16px; 
          height: 16px; 
          border-radius: 50%; 
          border: 3px solid white; 
          box-shadow: 0 0 15px rgba(59, 130, 246, 0.8);
        "></div>`,
        className: 'user-location-marker',
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });
      
      const userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon }).addTo(map);
      const userCircle = L.circle([userLocation.lat, userLocation.lng], {
        color: '#3b82f6',
        fillColor: '#3b82f6',
        fillOpacity: 0.1,
        radius: 1000,
        weight: 2,
      }).addTo(map);

      userMarkerRef.current = userMarker;
      userCircleRef.current = userCircle;
    }

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing hospital markers
    Object.values(markersRef.current).forEach(marker => map.removeLayer(marker));
    markersRef.current = {};

    hospitals.forEach(hospital => {
      if (hospital.lat && hospital.lng) {
        const isSelected = selectedHospitalId === hospital.id;
        
        // Hospital marker with H logo
        const hospitalIcon = L.divIcon({
          html: `<div style="
            background: ${isSelected ? '#dc2626' : '#ef4444'}; 
            color: white; 
            width: 32px; 
            height: 32px; 
            border-radius: 50%; 
            border: 3px solid white; 
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 16px;
            font-family: sans-serif;
            cursor: pointer;
            transition: all 0.3s ease;
            transform: ${isSelected ? 'scale(1.2)' : 'scale(1)'};
          ">H</div>`,
          className: 'hospital-marker',
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker([hospital.lat, hospital.lng], { icon: hospitalIcon }).addTo(map);

        marker.on('mouseover', (e) => {
          setHoveredHospital(hospital);
          const mapContainer = mapRef.current?.getBoundingClientRect();
          if (mapContainer) {
            setMousePosition({ 
              x: e.originalEvent.clientX - mapContainer.left, 
              y: e.originalEvent.clientY - mapContainer.top 
            });
          }
        });

        marker.on('mouseout', () => {
          setHoveredHospital(null);
        });

        marker.on('click', () => {
          onHospitalSelect?.(hospital.id);
          map.setView([hospital.lat, hospital.lng], 15);
        });
        
        markersRef.current[hospital.id] = marker;
      }
    });

    if (hospitals.length > 0) {
      const allMarkers = Object.values(markersRef.current);
      if (allMarkers.length > 0) {
        const group = new L.FeatureGroup(allMarkers);
        map.fitBounds(group.getBounds().pad(0.2));
      }
    }
  }, [hospitals, selectedHospitalId]);

  return (
    <div className="relative h-full w-full rounded-xl overflow-hidden shadow-2xl border border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div ref={mapRef} className="h-full w-full" />
      
      {/* Hover tooltip */}
      {hoveredHospital && (
        <div
          className="absolute bg-white rounded-xl shadow-2xl border border-gray-200 p-4 max-w-xs z-[1000] pointer-events-none transform -translate-x-1/2 -translate-y-full -translate-y-4 backdrop-blur-sm bg-white/95"
          style={{
            left: mousePosition.x,
            top: mousePosition.y,
          }}
        >
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">
              H
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-base">{hoveredHospital.name}</h4>
              <div className="flex items-center space-x-1">
                <span className="text-yellow-400">★</span>
                <span className="text-sm text-gray-600">{hoveredHospital.rating}</span>
              </div>
            </div>
          </div>
          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-gray-400" />
              <span className="truncate">{hoveredHospital.address}</span>
            </div>
            {hoveredHospital.distance && (
              <div className="flex items-center">
                <Navigation className="h-4 w-4 mr-2 text-gray-400" />
                <span>{hoveredHospital.distance.toFixed(1)} km away</span>
              </div>
            )}
            <div className="flex items-center">
              <span className="mr-2 text-lg">👨‍⚕️</span>
              <span className="text-red-600 font-semibold">
                {hoveredHospital.doctors?.length || 0} doctor{hoveredHospital.doctors?.length !== 1 ? 's' : ''} available
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Map controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-[500]">
        <button
          onClick={updateUserLocation}
          className="p-3 bg-white/90 backdrop-blur-sm text-gray-700 rounded-xl shadow-lg border border-gray-200 hover:bg-white hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          title="Find My Location"
        >
          <MapPin className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default MapView;