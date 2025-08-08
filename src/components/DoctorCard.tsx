import React from 'react';
import { Star, Calendar, Award } from 'lucide-react';
import FavoriteButton from './FavoriteButton';

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  experience: number;
  rating: number;
  image: string;
  hospital_id?: string;
  available: boolean;
}

interface DoctorCardProps {
  doctor: Doctor;
  onBookAppointment: (doctorId: string) => void;
}

const DoctorCard: React.FC<DoctorCardProps> = ({ doctor, onBookAppointment }) => {
  const reviewCount = doctor.rating > 0 ? Math.floor(Math.random() * 30) + 5 : 0;
  const nextAvailable = doctor.available ? 'Today' : 'Not available';

  const handleFavoriteToggle = (doctorId: string, isFavorite: boolean) => {
    // This could be connected to a favorites service in the future
    console.log(`Doctor ${doctorId} ${isFavorite ? 'added to' : 'removed from'} favorites`);
  };

  return (
    <div className="card-3d rounded-2xl overflow-hidden hover-lift border border-white/20 hover:border-red-200 animate-scaleIn">
      <div className="p-8">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
        <div className="flex items-center space-x-4 mb-4">
          <img 
            src={doctor.image} 
            alt={doctor.name}
            className="w-20 h-20 rounded-full object-cover ring-4 ring-white/50 shadow-lg"
          />
          <div className="flex-1">
            <h3 className="text-xl font-bold text-dark">{doctor.name}</h3>
            <p className="text-red-600 font-bold text-lg">{doctor.specialization}</p>
            <div className="flex items-center space-x-1 mt-1">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm text-dark-secondary font-medium">
                {doctor.rating > 0 ? doctor.rating.toFixed(1) : 'New'}
              </span>
              <span className="text-xs text-dark-muted ml-1">
                {doctor.rating > 0 ? `(${reviewCount} reviews)` : '(No reviews yet)'}
              </span>
            </div>
          </div>
        </div>
          </div>
          <FavoriteButton
            doctorId={doctor.id}
            onToggle={handleFavoriteToggle}
          />
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center space-x-2 text-dark-secondary">
            <Award className="h-5 w-5 text-red-600" />
            <span className="text-sm font-bold">{doctor.experience} years experience</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${doctor.available ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className={`text-sm font-bold ${doctor.available ? 'text-green-600' : 'text-red-600'}`}>
              {nextAvailable}
            </span>
            </div>
            {doctor.available && (
              <span className="badge-success text-xs animate-glow">
                ⚡ Quick Book
              </span>
            )}
          </div>
        </div>

        <button 
          onClick={() => onBookAppointment(doctor.id)}
          disabled={!doctor.available}
          className={`w-full py-4 px-6 rounded-xl transition-all-smooth font-bold text-lg ${
            doctor.available 
              ? 'btn-danger-3d text-white hover-lift animate-glow' 
              : 'bg-gray-200 text-gray-500 cursor-not-allowed opacity-50'
          }`}
        >
          <Calendar className="h-5 w-5 inline mr-3" />
          {doctor.available ? '📅 Book Appointment' : '❌ Currently Unavailable'}
        </button>
      </div>
    </div>
  );
};

export default DoctorCard;