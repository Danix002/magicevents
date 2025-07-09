import React from 'react';

const MysticalBackground = ({ children, variant = 'default' }) => {
  const variants = {
    default: 'from-purple-900 via-blue-900 to-indigo-900',
    form: 'from-indigo-900 via-purple-800 to-pink-900',
    game: 'from-blue-900 via-purple-900 to-pink-800'
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${variants[variant]} relative overflow-hidden`}>
      {/* Animated stars */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>
      
      {/* Floating orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-500/20 rounded-full blur-xl animate-float" />
        <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-blue-500/20 rounded-full blur-xl animate-float-delayed" />
        <div className="absolute bottom-1/4 left-1/2 w-40 h-40 bg-pink-500/10 rounded-full blur-2xl animate-float-slow" />
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default MysticalBackground;
