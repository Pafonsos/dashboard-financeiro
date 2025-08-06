import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { getChangeColor, getChangeIcon } from '../../utils/formatters';

const KPICard = ({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  color = 'text-blue-600', 
  bgColor = 'bg-blue-50',
  subtitle,
  trend,
  loading = false
}) => {
  const changeValue = parseFloat(change) || 0;
  const changeColor = getChangeColor(changeValue);
  
  const ChangeIcon = () => {
    if (changeValue > 0) return <ArrowUpRight className="w-4 h-4 text-green-500" />;
    if (changeValue < 0) return <ArrowDownRight className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
          <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 group">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-medium text-gray-600 group-hover:text-gray-700 transition-colors">
              {title}
            </p>
            {trend && (
              <span className={`text-xs px-2 py-1 rounded-full ${
                trend === 'up' ? 'bg-green-100 text-green-700' :
                trend === 'down' ? 'bg-red-100 text-red-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {trend === 'up' ? 'Crescendo' : trend === 'down' ? 'Decrescendo' : 'Estável'}
              </span>
            )}
          </div>
          
          <p className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-gray-800 transition-colors">
            {value}
          </p>
          
          {subtitle && (
            <p className="text-xs text-gray-500 mb-2">{subtitle}</p>
          )}
          
          <div className="flex items-center">
            <ChangeIcon />
            <span className={`text-sm font-medium ml-1 ${changeColor}`}>
              {Math.abs(changeValue).toFixed(1)}%
            </span>
            <span className="text-sm text-gray-500 ml-1">vs mês anterior</span>
          </div>
        </div>
        
        <div className={`${bgColor} ${color} p-3 rounded-lg group-hover:scale-105 transition-transform duration-200`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

export default KPICard;
