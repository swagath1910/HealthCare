import React, { useState } from 'react';
import { Heart } from 'lucide-react';

interface FavoriteButtonProps {
  doctorId: string;
  initialFavorite?: boolean;
  onToggle?: (doctorId: string, isFavorite: boolean) => void;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ 
  doctorId, 
  initialFavorite = false, 
  onToggle 
}) => {
  const [isFavorite, setIsFavorite] = useState(initialFavorite);

  const handleToggle = () => {
    const newFavoriteState = !isFavorite;
    setIsFavorite(newFavoriteState);
    onToggle?.(doctorId, newFavoriteState);
  };

  return (
    <button
      onClick={handleToggle}
      className={`p-2 rounded-full transition-all duration-200 ${
        isFavorite 
          ? 'text-red-600 bg-red-50 hover:bg-red-100' 
          : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
      }`}
      title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart 
        className={`h-5 w-5 transition-all duration-200 ${
          isFavorite ? 'fill-current scale-110' : 'scale-100'
        }`} 
      />
    </button>
  );
};

export default FavoriteButton;