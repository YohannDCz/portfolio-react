'use client';

import { useState, type SyntheticEvent } from 'react';
import Image from 'next/image';

// =====================================
// TYPE DEFINITIONS
// =====================================

interface ProjectImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  fallbackGradient?: string;
  onError?: (event: SyntheticEvent<HTMLImageElement, Event>) => void;
}

// =====================================
// PROJECT IMAGE COMPONENT
// =====================================

/**
 * Project image component with fallback gradient and loading states
 * @param props - Project image properties
 * @returns JSX Element for project image with fallback
 */
export default function ProjectImage({
  src,
  alt,
  className = '',
  fallbackGradient = 'from-muted/50 to-muted/20',
  onError,
}: ProjectImageProps): JSX.Element {
  const [imageError, setImageError] = useState<boolean>(false);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);

  /**
   * Handle image loading error
   * @param e - Image error event
   */
  const handleImageError = (e: SyntheticEvent<HTMLImageElement, Event>): void => {
    setImageError(true);
    if (onError) onError(e);
  };

  /**
   * Handle successful image load
   */
  const handleImageLoad = (): void => {
    setImageLoaded(true);
  };

  // Si pas d'image source ou erreur de chargement
  if (!src || imageError) {
    return (
      <div
        className={`bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 dark:from-slate-800 dark:via-slate-700 dark:to-slate-600 ${className} relative overflow-hidden`}
      >
        {/* Beautiful geometric pattern */}
        <div className="absolute inset-0">
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent dark:via-blue-400/20 animate-pulse"></div>

          {/* Geometric shapes */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 dark:bg-blue-400/20 rounded-full transform translate-x-16 -translate-y-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/15 dark:bg-purple-400/25 rounded-full transform -translate-x-12 translate-y-12"></div>
          <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-white/20 dark:bg-cyan-400/30 transform rotate-45 -translate-x-1/2 -translate-y-1/2"></div>

          {/* Additional dark mode elements */}
          <div className="absolute top-1/4 right-1/4 w-6 h-6 bg-transparent dark:bg-green-400/20 rounded-full"></div>
          <div className="absolute bottom-1/4 left-1/4 w-4 h-4 bg-transparent dark:bg-yellow-400/25 rounded-full"></div>

          {/* Subtle grid pattern */}
          <div className="absolute inset-0 opacity-20 dark:opacity-30">
            <div className="grid grid-cols-6 grid-rows-4 h-full w-full">
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className="border border-white/10 dark:border-slate-400/20"></div>
              ))}
            </div>
          </div>

          {/* Code-like pattern overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white/30 dark:text-slate-300/40 font-mono text-xs space-y-1 transform -rotate-12">
              <div>&lt;/&gt; React</div>
              <div>&#123; &#125; JS</div>
              <div>&lt;&gt; Next.js</div>
            </div>
          </div>

          {/* Dark mode accent glow */}
          <div className="absolute inset-0 bg-transparent dark:bg-gradient-to-br dark:from-blue-500/10 dark:via-transparent dark:to-purple-500/10 pointer-events-none"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Placeholder pendant le chargement */}
      {!imageLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 dark:from-slate-700/50 dark:via-slate-600/50 dark:to-slate-500/50 animate-pulse" />
      )}

      {/* Image principale */}
      <Image
        src={src}
        alt={alt}
        fill
        className={`object-contain transition-all duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
        onError={handleImageError}
        onLoad={handleImageLoad}
        loading="lazy"
      />
    </div>
  );
}
