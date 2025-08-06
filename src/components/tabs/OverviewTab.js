import React from 'react';
import KPICard from '../cards/KPICard';
import AlertCard from '../cards/AlertCard';
import LineChart from '../charts/LineChart';
import PieChart from '../charts/PieChart';
import { DollarSign, TrendingUp, Users, FileText, Target, AlertCircle } from 'lucide-react';
import { formatCurrency, calculatePercentageChange } from '../../utils/formatters';

const OverviewTab = ({ data }) => {
  if (!data) return <div>Carregando...</div>;

  const currentMonth = data.monthlyRevenue[data.monthlyRevenue.length - 1];
  const previousMonth = data.monthlyRevenue[data.monthlyRevenue.length - 2];

  // KPIs principais
  const kpis = [
    {
      title: 'Receita Total',
      value: formatCurrency(data.kpiData.totalRevenue),
      change: calculatePercentageChange(currentMonth.receita, previousMonth.receita).toFixed(1),
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      trend: 'up'
    },
    {
      title: 'Lucro Líquido',
      value: formatCurrency(data.kpiData.netProfit),
      change: '12.5',
      icon: TrendingUp,
      color: 'text-proteq-blue',
      bgColor: 'bg-blue-50',
      trend: 'up'
    },
    {
      title: 'Clientes Ativos',
      value: data.kpiData.activeClients.toString(),
      change: '5.8',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      trend: 'up'
    },
    {
      title: 'Projetos Ativos',
      value: data.kpiData.activeProjects.toString(),
      change: '15.2',
      icon: FileText,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      trend: 'up'
    }
  ];

  // Alertas do sistema
  const alerts = [
    {
      type: 'warning',
      title: '5 faturas vencem esta semana',
      message: 'Total: ' + formatCurrency(87230),
      action: 'Ver detalhes'
    },
    {
      type: 'target',
      title: 'Meta mensal: 87% atingida',
      message: 'Faltam ' + formatCurrency(15230) + ' para a meta',
      action: 'Ver progresso'
    },
    {
      type: 'trend',
      title: 'Crescimento de 15% no mês',
      message: 'Melhor performance do ano',
      action: 'Ver análise'
    }
  ];

  // Configuração dos gráficos
  const revenueLines = [
    { dataKey: 'receita', name: 'Receita' },
    { dataKey: 'despesas', name: 'Despesas' },
    { dataKey: 'lucro', name: 'Lucro' }
  ];

  return (
    <div className="space-y-6">
      {/* KPIs principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <KPICard key={index} {...kpi} />
        ))}
      </div>

      {/* Gráficos principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Receita vs Despesas */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Receita vs Despesas</h3>
            <select className="text-sm border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-proteq-blue">
              <option>Últimos 12 meses</option>
              <option>Últimos 6 meses</option>
              <option>Últimos 3 meses</option>
            </select>
          </div>
          <LineChart
            data={data.monthlyRevenue}
            lines={revenueLines}
            height={280}
            colors={['#1e5091', '#ef5350', '#8bc34a']}
          />
        </div>

        {/* Tipos de Serviço */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <PieChart
            title="Distribuição por Tipo de Serviço"
            data={data.serviceTypes}
            height={280}
            colors={['#1e5091', '#8bc34a', '#64b5f6', '#81c784']}
          />
        </div>
      </div>

      {/* Estatísticas de clientes e alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status dos Clientes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status dos Clientes</h3>
          <div className="space-y-3">
            {data.clientStats.map((stat, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="font-medium text-gray-700">{stat.status}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-xl font-bold text-gray-900">{stat.count}</span>
                  <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                    stat.change > 0 
                      ? 'bg-green-100 text-green-700' 
                      : stat.change < 0 
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-700'
                  }`}>
                    {stat.change > 0 ? '+' : ''}{stat.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alertas e Lembretes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertas e Lembretes</h3>
          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <AlertCard key={index} {...alert} />
            ))}
          </div>
        </div>
      </div>

      {/* Métricas adicionais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div className="text-3xl font-bold text-proteq-blue mb-2">
            {formatCurrency(data.kpiData.averageTicket)}
          </div>
          <p className="text-gray-600">Ticket Médio</p>
          <p className="text-sm text-green-600 mt-1">↗ +8.3% vs mês anterior</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div className="text-3xl font-bold text-proteq-green mb-2">
            {formatCurrency(data.kpiData.recurringRevenue)}
          </div>
          <p className="text-gray-600">Receita Recorrente</p>
          <p className="text-sm text-green-600 mt-1">↗ +15.2% vs mês anterior</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {data.kpiData.growthRate.toFixed(1)}%
          </div>
          <p className="text-gray-600">Taxa de Crescimento</p>
          <p className="text-sm text-green-600 mt-1">Meta: 10%</p>
        </div>
      </div>
    </div>
  );
