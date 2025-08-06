import React from 'react';
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatCurrency, formatPercentage } from '../../utils/formatters';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900 mb-1">{data.name}</p>
        <div className="text-sm space-y-1">
          {data.amount && (
            <p className="text-gray-600">
              Valor: <span className="font-medium text-gray-900">{formatCurrency(data.amount)}</span>
            </p>
          )}
          <p className="text-gray-600">
            Percentual: <span className="font-medium text-gray-900">{data.value}%</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value, name }) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return value > 5 ? (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      fontSize={12}
      fontWeight="bold"
    >
      {`${value}%`}
    </text>
  ) : null;
};

const PieChart = ({ 
  data, 
  height = 300, 
  showLegend = true,
  showLabels = true,
  colors = ['#1e5091', '#8bc34a', '#64b5f6', '#81c784', '#ef5350'],
  title,
  innerRadius = 0,
  outerRadius = 80
}) => {
  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      
      <div style={{ height: `${height}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsPieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={showLabels ? CustomLabel : false}
              outerRadius={outerRadius}
              innerRadius={innerRadius}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color || colors[index % colors.length]} 
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            {showLegend && (
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value, entry) => (
                  <span style={{ color: entry.color }}>{value}</span>
                )}
              />
            )}
          </RechartsPieChart>
        </ResponsiveContainer>
      </div>

      {/* Lista customizada para mobile */}
      <div className="md:hidden mt-4 space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <div className="flex items-center space-x-2">
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: item.color || colors[index % colors.length] }}
              />
              <span className="text-sm font-medium text-gray-700">{item.name}</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-gray-900">{item.value}%</span>
              {item.amount && (
                <p className="text-xs text-gray-500">{formatCurrency(item.amount)}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PieChart;
