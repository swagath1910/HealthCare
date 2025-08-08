import React from 'react';
import { Clock, Star, MapPin, Filter } from 'lucide-react';

interface QuickFiltersProps {
  onFilterChange: (filters: {
    availability: string;
    rating: string;
    distance: string;
    specialization: string;
  }) => void;
  specializations: string[];
}

const QuickFilters: React.FC<QuickFiltersProps> = ({ onFilterChange, specializations }) => {
  const [filters, setFilters] = React.useState({
    availability: '',
    rating: '',
    distance: '',
    specialization: ''
  });

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      availability: '',
      rating: '',
      distance: '',
      specialization: ''
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const hasActiveFilters = Object.values(filters).some(filter => filter !== '');

  return (
    <div className="medical-glass rounded-3xl shadow-2xl p-8 mb-8 card-3d">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-bold flex items-center text-medical-gradient">
          <Filter className="h-7 w-7 mr-3 text-medical-primary" />
          🔍 Smart Filters
        </h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="btn-medical-secondary px-6 py-3 rounded-2xl font-bold text-sm"
          >
            ✕ Clear All
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Availability Filter */}
        <div>
          <label className="block text-sm font-bold text-medical-dark mb-3">
            <Clock className="h-5 w-5 inline mr-2 text-medical-primary" />
            Availability
          </label>
          <select
            value={filters.availability}
            onChange={(e) => handleFilterChange('availability', e.target.value)}
            className="w-full px-4 py-3 input-medical focus:outline-none"
          >
            <option value="">Any time</option>
            <option value="today">Available today</option>
            <option value="tomorrow">Available tomorrow</option>
            <option value="week">This week</option>
          </select>
        </div>

        {/* Rating Filter */}
        <div>
          <label className="block text-sm font-bold text-medical-dark mb-3">
            <Star className="h-5 w-5 inline mr-2 text-yellow-500" />
            Minimum Rating
          </label>
          <select
            value={filters.rating}
            onChange={(e) => handleFilterChange('rating', e.target.value)}
            className="w-full px-4 py-3 input-medical focus:outline-none"
          >
            <option value="">Any rating</option>
            <option value="4.5">4.5+ stars</option>
            <option value="4.0">4.0+ stars</option>
            <option value="3.5">3.5+ stars</option>
          </select>
        </div>

        {/* Distance Filter */}
        <div>
          <label className="block text-sm font-bold text-medical-dark mb-3">
            <MapPin className="h-5 w-5 inline mr-2 text-medical-primary" />
            Distance
          </label>
          <select
            value={filters.distance}
            onChange={(e) => handleFilterChange('distance', e.target.value)}
            className="w-full px-4 py-3 input-medical focus:outline-none"
          >
            <option value="">Any distance</option>
            <option value="2">Within 2 km</option>
            <option value="5">Within 5 km</option>
            <option value="10">Within 10 km</option>
            <option value="20">Within 20 km</option>
          </select>
        </div>

        {/* Specialization Filter */}
        <div>
          <label className="block text-sm font-bold text-medical-dark mb-3">
            <span className="text-emerald-500">🩺</span>
            Specialization
          </label>
          <select
            value={filters.specialization}
            onChange={(e) => handleFilterChange('specialization', e.target.value)}
            className="w-full px-4 py-3 input-medical focus:outline-none"
          >
            <option value="">All specializations</option>
            {specializations.map(spec => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default QuickFilters;