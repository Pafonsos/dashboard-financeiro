import React from 'react';
import { 
  AlertCircle, 
  Target, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle,
  Info,
  X
} from 'lucide-react';

const AlertCard = ({ 
  type = 'info', 
  title, 
  message, 
  value, 
  action,
  onDismiss,
  dismissible = false 
}) => {
  const alertTypes = {
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: AlertCircle,
      iconColor: 'text-yellow-600',
      titleColor: 'text-yellow-800',
      messageColor: 'text-yellow-600'
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: CheckCircle,
      iconColor: 'text-green-600',
      titleColor: 'text-green-800',
      messageColor: 'text-green-600'
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: XCircle,
      iconColor: 'text-red-600',
      titleColor: 'text-red-800',
      messageColor: 'text-red-600'
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: Info,
      iconColor: 'text-blue-600',
      titleColor: 'text-blue-800',
      messageColor: 'text-blue-600'
    },
    target: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      icon: Target,
      iconColor: 'text-purple-600',
      titleColor: 'text-purple-800',
      messageColor: 'text-purple-600'
    },
    trend: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      icon: TrendingUp,
      iconColor: 'text-emerald-600',
      titleColor: 'text-emerald-800',
      messageColor: 'text-emerald-600'
    }
  };

  const config = alertTypes[type] || alertTypes.info;
  const Icon = config.icon;

  return (
    <div className={`flex items-start space-x-3 p-4 ${config.bg} border ${config.border} rounded-lg relative group hover:shadow-sm transition-all duration-200`}>
      <Icon className={`w-5 h-5 ${config.iconColor} mt-0.5 flex-shrink-0`} />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className={`font-medium ${config.titleColor} text-sm`}>
              {title}
            </p>
            {message && (
              <p className={`text-sm ${config.messageColor} mt-1 leading-relaxed`}>
                {message}
              </p>
            )}
            {value && (
              <p className={`text-lg font-bold ${config.titleColor} mt-2`}>
                {value}
              </p>
            )}
          </div>
          
          {dismissible && onDismiss && (
            <button
              onClick={onDismiss}
              className={`${config.iconColor} hover:bg-white hover:bg-opacity-50 rounded-full p-1 transition-colors ml-2`}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        
        {action && (
          <div className="mt-3">
            <button className={`text-sm font-medium ${config.iconColor} hover:underline focus:outline-none`}>
              {action}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Componente para lista de alertas
export const AlertList = ({ alerts, onDismiss }) => {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <p className="text-gray-500">Nenhum alerta no momento</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert, index) => (
        <AlertCard
          key={index}
          {...alert}
          onDismiss={onDismiss ? () => onDismiss(index) : undefined}
          dismissible={!!onDismiss}
        />
      ))}
    </div>
  );
};

export default AlertCard;
