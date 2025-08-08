import React from 'react';
import { MapPin, Phone, Star, Navigation } from 'lucide-react';

interface Hospital {
  id: string;
  name: string;
  address: string;
  phone: string;
  image: string;
  rating: number;
  distance: number;
}

interface HospitalCardProps {
  hospital: Hospital;
  onViewDoctors: (hospitalId: string) => void;
  onTabletBooking: (hospitalId: string) => void;
  onTabletBooking: (hospitalId: string) => void;
}

const HospitalCard: React.FC<HospitalCardProps> = ({ hospital, onViewDoctors, onTabletBooking }) => {
  const availableDoctors = hospital.doctors?.filter(d => d.available).length || 0;
  const totalDoctors = hospital.doctors?.length || 0;

  const openDirections = () => {
    const destination = `${hospital.lat},${hospital.lng}`;
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
    window.open(googleMapsUrl, '_blank');
  };
  return (
    <div className="card-3d overflow-hidden rounded-3xl animate-fadeIn transform hover:scale-105 transition-all duration-300">
      <img 
        src={hospital.image} 
        alt={hospital.name}
        className="w-full h-48 object-cover hover:scale-110 transition-all duration-300"
      />
      <div className="p-8">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-2xl font-bold text-medical-gradient">{hospital.name}</h3>
          <div className="flex items-center space-x-1 medical-glass px-4 py-2 rounded-2xl">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-sm font-bold text-medical-dark">
              {hospital.rating > 0 ? hospital.rating.toFixed(1) : 'New'}
            </span>
          </div>
        </div>
        
        <div className="space-y-3 mb-6">
          <div className="flex items-center space-x-3 text-medical-secondary">
            <MapPin className="h-5 w-5 text-medical-primary" />
            <span className="text-sm font-bold">{hospital.address}</span>
          </div>
          <div className="flex items-center space-x-3 text-medical-secondary">
            <Phone className="h-5 w-5 text-medical-primary" />
            <span className="text-sm font-bold">{hospital.phone}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">👨‍⚕️</span>
              <span className="text-sm font-bold text-green-600">{availableDoctors} available</span>
              <span className="text-sm text-medical-muted">/ {totalDoctors} total</span>
            </div>
            {availableDoctors > 0 && (
              <span className="badge-medical-success text-xs animate-glow">
                Online
              </span>
            )}
          </div>
          {hospital.distance && (
            <div className="flex items-center space-x-3 text-medical-secondary">
              <Navigation className="h-5 w-5 text-medical-primary" />
              <span className="text-sm font-bold text-medical-primary">{hospital.distance} km away</span>
            </div>
          )}
        </div>

        <div className="flex space-x-3">
          <button 
            onClick={() => onViewDoctors(hospital.id)}
            className="flex-1 btn-medical-primary text-white py-4 px-4 rounded-2xl font-bold text-sm flex items-center justify-center space-x-2"
          >
            <span>🩺</span>
            <span>View {totalDoctors} Doctor{totalDoctors !== 1 ? 's' : ''}</span>
          </button>
          <button
            onClick={() => onTabletBooking?.(hospital.id)}
            className="flex-1 btn-medical-secondary py-4 px-4 rounded-2xl font-bold text-sm flex items-center justify-center space-x-2"
          >
            <span>💊</span>
            <span>Order Medicines</span>
          </button>
          <button
            onClick={openDirections}
            className="btn-medical-primary text-white px-6 py-4 rounded-2xl flex items-center justify-center group"
            title="Get Directions"
          >
            <Navigation className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default HospitalCard;