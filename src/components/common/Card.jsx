import React from 'react';

export function Card({ children, className = '', onClick }) {
  return (
    <div
      onClick={onClick}
      className={`card-modern p-6 ${
        onClick ? 'cursor-pointer hover:shadow-md' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}
