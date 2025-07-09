import React from 'react';

const CrystalBall = ({ size = 'large', children, className = '' }) => {
  const sizes = {
    small: 'w-24 h-24',
    medium: 'w-32 h-32',
    large: 'w-48 h-48 md:w-56 md:h-56'
  };

  return (
    <div className={`relative ${sizes[size]} mx-auto ${className}`}>
      {/* Crystal ball base */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-200/30 via-blue-200/20 to-pink-200/30 backdrop-blur-sm border border-white/20 shadow-2xl">
        {/* Inner glow */}
        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-white/10 to-transparent" />
        {/* Highlight */}
        <div className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white/40 blur-sm" />
      </div>
      
      {/* Content */}
      <div className="absolute inset-0 flex items-center justify-center text-white">
        {children}
      </div>
      
      {/* Floating particles around ball */}
      <div className="absolute inset-0 animate-spin-slow">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-purple-300/60 rounded-full animate-pulse"
            style={{
              top: `${20 + Math.sin(i * Math.PI / 3) * 40}%`,
              left: `${50 + Math.cos(i * Math.PI / 3) * 40}%`,
              animationDelay: `${i * 0.3}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default CrystalBall;
