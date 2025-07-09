import React from 'react';

const MagicalCard = ({ children, className = '', variant = 'default' }) => {
  const variants = {
    default: 'bg-white/10 border-white/20',
    form: 'bg-purple-900/30 border-purple-300/30',
    question: 'bg-blue-900/40 border-blue-300/40',
    answer: 'bg-indigo-900/30 border-indigo-300/30'
  };

  return (
    <div className={`
      ${variants[variant]}
      border rounded-2xl p-6 shadow-2xl
      transform transition-all duration-300 hover:scale-105 hover:shadow-purple-500/25
      ${className}
    `}>
      {children}
    </div>
  );
};

export default MagicalCard;
