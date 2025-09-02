'use client';

import { useState } from 'react';

export default function ProjectImage({ 
  src, 
  alt, 
  className = "", 
  fallbackGradient = "from-muted/50 to-muted/20",
  onError 
}) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageError = (e) => {
    setImageError(true);
    if (onError) onError(e);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  // Si pas d'image source ou erreur de chargement
  if (!src || imageError) {
    return (
      <div className={`bg-gradient-to-br ${fallbackGradient} ${className} flex items-center justify-center`}>
        <div className="text-muted-foreground/50 text-center">
          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-xs">Image du projet</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Placeholder pendant le chargement */}
      {!imageLoaded && (
        <div className={`absolute inset-0 bg-gradient-to-br ${fallbackGradient} animate-pulse`} />
      )}
      
      {/* Image principale */}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-all duration-300 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onError={handleImageError}
        onLoad={handleImageLoad}
        loading="lazy"
      />
    </div>
  );
}
