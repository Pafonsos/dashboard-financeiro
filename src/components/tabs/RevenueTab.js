import React, { useState } from 'react';
import BarChart from '../charts/BarChart';
import PieChart from '../charts/PieChart';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { TrendingUp, DollarSign, Target, Users } from 'lucide-react';

const RevenueTab = ({ data }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('12months');
  
  if (!data) return <div>Carregando...</div>;

  // Filtrar dados baseado no período selecionado
  const getFilteredData = () => {
    switch (selectedPeriod) {
      case '3months':
        return data.monthlyRevenue.slice(-3);
      case '6months':
        return data.monthlyRevenue.slice(-6);
      default:
        return data.monthlyRevenue;
    }
  };

  const filteredData = getFilteredData();
  const totalRevenue = filteredData.reduce((sum, month) => sum + month.receita, 0);

  // Configuração do gráfico de barras
  const revenueBars = [
    { dataKey: 'receita', name: 'Receita Mensal' }
  ];

  // Métricas principais
  const revenueMetrics = [
    {
      title: 'Receita Total',
      value: formatCurrency(totalRevenue),
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Média Mensal',
      value: formatCurrency(totalRevenue / filteredData.length),
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Melhor Mês',
      value: formatCurrency(Math.max(...filteredData.map(m => m.receita))),
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Clientes Únicos',
      value: data.kpiData.activeClients.toString(),
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Controles do período */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Análise de Receitas</h2>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-proteq-blue focus:border-transparent"
          >
            <option value="12months">Últimos 12 meses</option>
            <option value="6months">Últimos 6 meses</option>
            <option value="3months">Últimos 3 meses</option>
          </select>
        </div>
      </div>

      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {revenueMetrics.map((metric, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
              </div>
              <div className={`${metric.bgColor} ${metric.color} p-3 rounded-lg`}>
                <metric.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Gráfico de evolução da receita */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <BarChart
          title="Evolução da Receita Mensal"
          data={filteredData}
          bars={revenueBars}
          height={350}
          colors={['#1e5091']}
        />
      </div>

      {/* Análises detalhadas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Receita por Tipo de Serviço */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Receita por Tipo de Serviço</h3>
          <div className="space-y-4">
            {data.serviceTypes.map((service, index) => (
              <div key={index} className="flex items-center justify-between p-4 border-l-4 bg-gray-50 rounded-r-lg" 
                   style={{ borderLeftColor: service.color }}>
                <div>
                  <span className="font-medium text-gray-900">{service.name}</span>
                  <p className="text-sm text-gray-600">{service.value}% do total</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-gray-900">
                    {formatCurrency(service.revenue)}
                  </span>
                  <p className="text-sm text-green-600">+{(Math.random() * 10 + 5).toFixed(1)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Distribuição Visual */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <PieChart
            title="Distribuição da Receita"
            data={data.serviceTypes.map(service => ({
              name: service.name,
              value: service.value,
              amount: service.revenue,
              color: service.color
            }))}
            height={280}
          />
        </div>
      </div>

      {/* Tabela de top clientes */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 5 Clientes por Receita</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Receita
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Projetos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Satisfação
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.topClients.map((client, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{client.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-green-600">
                      {formatCurrency(client.revenue)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{client.projects}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm text-gray-900">{client.satisfaction}%</div>
                      <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${client.satisfaction}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Ativo
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights e recomendações */}
      <div className="bg-gradient-to-r from-proteq-blue to-blue-700 rounded-lg p-6 text-white">
        <h3 className="text-lg font-semibold mb-4">Insights de Receita</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <h4 className="font-semibold mb-2">Crescimento</h4>
            <p className="text-sm opacity-90">
              Receita cresceu 12.5% comparado ao período anterior, principalmente impulsionada por consultoria.
            </p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <h4 className="font-semibold mb-2">Oportunidade</h4>
            <p className="text-sm opacity-90">
              Serviços de suporte têm margem para crescimento, representando apenas 15% da receita.
            </p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <h4 className="font-semibold mb-2">Meta</h4>
            <p className="text-sm opacity-90">
              Para atingir a meta anual, precisamos manter crescimento de 8% nos próximos meses.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueTab;
