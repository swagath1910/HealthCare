import React from 'react';
import { Heart, Brain, Baby, Eye, Bone, Stethoscope, Zap, Scissors, Activity, Shield } from 'lucide-react';

interface SpecializationGridProps {
  specializations: string[];
  onSpecializationSelect: (specialization: string) => void;
}

const SpecializationGrid: React.FC<SpecializationGridProps> = ({
  specializations,
  onSpecializationSelect
}) => {
  const specializationIcons: { [key: string]: React.ComponentType<any> } = {
    'Cardiology': Heart,
    'Neurology': Brain,
    'Pediatrics': Baby,
    'Ophthalmology': Eye,
    'Orthopedics': Bone,
    'Internal Medicine': Stethoscope,
    'Emergency Medicine': Zap,
    'Surgery': Scissors,
    'Radiology': Activity,
    'Dermatology': Shield,
    'Psychiatry': Brain,
    'Oncology': Shield,
    'Gynecology': Heart,
    'Urology': Activity,
    'ENT': Eye,
    'Anesthesiology': Stethoscope,
    'Pathology': Activity,
    'General Medicine': Stethoscope
  };

  const getSpecializationColor = (specialization: string) => {
    const colors = [
      'bg-red-100 text-red-600 border-red-200',
      'bg-blue-100 text-blue-600 border-blue-200',
      'bg-green-100 text-green-600 border-green-200',
      'bg-purple-100 text-purple-600 border-purple-200',
      'bg-yellow-100 text-yellow-600 border-yellow-200',
      'bg-pink-100 text-pink-600 border-pink-200',
      'bg-indigo-100 text-indigo-600 border-indigo-200',
      'bg-teal-100 text-teal-600 border-teal-200'
    ];
    const index = specialization.length % colors.length;
    return colors[index];
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {specializations.map((specialization) => {
        const Icon = specializationIcons[specialization] || Stethoscope;
        const colorClass = getSpecializationColor(specialization);
        
        return (
          <button
            key={specialization}
            onClick={() => onSpecializationSelect(specialization)}
            className={`p-6 rounded-xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg transform hover:-translate-y-1 ${colorClass}`}
          >
            <div className="flex flex-col items-center space-y-2">
              <div className="p-3 rounded-full bg-white bg-opacity-50">
                <Icon className="h-8 w-8" />
              </div>
              <span className="text-sm font-semibold text-center leading-tight">{specialization}</span>
              <span className="text-xs opacity-75">Click to explore</span>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default SpecializationGrid;