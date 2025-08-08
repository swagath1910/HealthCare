import React from 'react';
import { Heart } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  return (
    <div className="flex flex-col items-center justify-center p-12 animate-fadeIn">
      <div className="relative mb-4">
        {/* Outer spinning ring */}
        <div className={`${sizeClasses[size]} border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin`}></div>
        
        {/* Inner pulsing heart */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Heart className={`${size === 'sm' ? 'h-4 w-4' : size === 'md' ? 'h-6 w-6' : 'h-8 w-8'} text-red-600 animate-glow fill-current`} />
        </div>
        
        {/* Subtle glow effect */}
        <div className={`absolute inset-0 ${sizeClasses[size]} bg-blue-600 rounded-full opacity-10 animate-ping`}></div>
      </div>
      
      <div className="text-center">
        <p className="text-dark font-bold mb-2 text-lg">{text}</p>
        <div className="flex space-x-1 justify-center">
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;