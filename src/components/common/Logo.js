import React from 'react';

const Logo = ({ size = 'default' }) => {
  const sizeClasses = {
    small: 'h-6',
    default: 'h-10',
    large: 'h-14'
  };

  return (
    <div className="flex items-center">
      <img 
        src="/logo-proteq.png" 
        alt="PROTEQ" 
        className={`${sizeClasses[size]} w-auto object-contain`}
        onError={(e) => {
          // Fallback para o logo SVG original se a imagem PNG não carregar
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'flex';
        }}
      />
      
      {/* Fallback - Logo SVG original */}
      <div className="hidden items-center space-x-2">
        <div className="relative">
          <div className="w-8 h-8 rounded-full border-3 border-proteq-blue flex items-center justify-center bg-white">
            <div className="flex items-center">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-sm mr-0.5"></div>
              <div className="w-3 h-2 bg-proteq-green rounded-full transform rotate-12"></div>
            </div>
          </div>
        </div>
        <span className="text-xl font-bold text-proteq-blue">PROTEQ</span>
      </div>
    </div>
  );
};

export default Logo;
