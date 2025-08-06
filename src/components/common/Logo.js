import React from 'react';

const Logo = ({ size = 'default' }) => {
  const sizeClasses = {
    small: 'w-6 h-6',
    default: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  const textSizeClasses = {
    small: 'text-lg',
    default: 'text-xl',
    large: 'text-3xl'
  };

  const dotSizeClasses = {
    small: { dot: 'w-1 h-1', leaf: 'w-2 h-1.5' },
    default: { dot: 'w-1.5 h-1.5', leaf: 'w-3 h-2' },
    large: { dot: 'w-2 h-2', leaf: 'w-4 h-3' }
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="relative">
        <div className={`${sizeClasses[size]} rounded-full border-3 border-proteq-blue flex items-center justify-center bg-white`}>
          <div className="flex items-center">
            <div className={`${dotSizeClasses[size].dot} bg-blue-400 rounded-sm mr-0.5`}></div>
            <div className={`${dotSizeClasses[size].leaf} bg-proteq-green rounded-full transform rotate-12`}></div>
          </div>
        </div>
      </div>
      <span className={`${textSizeClasses[size]} font-bold text-proteq-blue`}>
        PROTEQ
      </span>
    </div>
  );
};

export default Logo;
