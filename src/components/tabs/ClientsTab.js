import React, { useState } from 'react';
import BarChart from '../charts/BarChart';
import { formatCurrency } from '../../utils/formatters';
import { Users, UserPlus, Star, TrendingUp, Search, Filter } from 'lucide-react';

const ClientsTab = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('revenue');
  
  if (!data) return <div>Carregando...</div>;

  // Métricas de clientes
  const clientMetrics = [
    {
      title: 'Total de Clientes',
      value: data.kpiData.activeClients.toString(),
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: '+8'
    },
    {
      title: 'Novos este Mês',
      value: '12',
      icon: UserPlus,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: '+3'
    },
    {
      title: 'Satisfação Média',
      value: '93.2%',
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      change: '+2.1'
    },
    {
      title: 'Receita por Cliente',
      value: formatCurrency(data.kpiData.averageTicket),
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      change: '+15.3'
    }
  ];

  // Filtrar e ordenar clientes
  const filteredClients = data.topClients
    .filter(client => {
      const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all' || 
        (filterStatus === 'active' && client.projects > 0) ||
        (filterStatus === 'inactive' && client.projects === 0) ||
        (filterStatus === 'high-value' && client.revenue > 80000);
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'revenue':
          return b.revenue - a.revenue;
        case 'projects':
          return b.projects - a.projects;
        case 'satisfaction':
          return b.satisfaction - a.satisfaction;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  // Dados para o gráfico de distribuição de receita
  const revenueDistribution = [
    { range: '< R$ 50k', count: 45, color: '#ef5350' },
    { range: 'R$ 50k - 100k', count: 68, color: '#ff9800' },
    { range: 'R$ 100k - 200k', count: 23, color: '#8bc34a' },
    { range: '> R$ 200k', count: 9, color: '#1e5091' }
  ];

  return (
    <div className="space-y-6">
      {/* Header com filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <h2 className="text-xl font-bold text-gray-900">Gestão de Clientes</h2>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            {/* Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar clientes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-proteq-blue focus:border-transparent"
              />
            </div>

            {/* Filtro por status */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-proteq-blue"
            >
              <option value="all">Todos os clientes</option>
              <option value="active">Com projetos ativos</option>
              <option value="inactive">Sem projetos</option>
              <option value="high-value">Alto valor (>R$ 80k)</option>
            </select>

            {/* Ordenação */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-proteq-blue"
            >
              <option value="revenue">Ordenar por receita</option>
              <option value="projects">Ordenar por projetos</option>
              <option value="satisfaction">Ordenar por satisfação</option>
              <option value="name">Ordenar por nome</option>
            </select>
          </div>
        </div>
      </div>

      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {clientMetrics.map((metric, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
                <div className="flex items-center mt-2">
                  <span className="text-sm font-medium text-green-600">
                    {metric.change} vs mês anterior
                  </span>
                </div>
              </div>
              <div className={`${metric.bgColor} ${metric.color} p-3 rounded-lg`}>
                <metric.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Análises */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribuição por faixa de receita */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribuição por Faixa de Receita</h3>
          <div className="space-y-4">
            {revenueDistribution.map((range, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: range.color }}
                  />
                  <span className="text-sm font-medium text-gray-700">{range.range}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-bold text-gray-900">{range.count} clientes</span>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full" 
                      style={{ 
                        backgroundColor: range.color, 
                        width: `${(range.count / 145) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top 5 clientes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 5 Clientes por Receita</h3>
          <div className="space-y-4">
            {data.topClients.slice(0, 5).map((client, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-proteq-blue text-white rounded-full flex items-center justify-center text-sm font-bold">
                    #{index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{client.name}</p>
                    <p className="text-sm text-gray-600">{client.projects} projetos ativos</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-proteq-blue">{formatCurrency(client.revenue)}</p>
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 text-yellow-500" />
                    <span className="text-sm text-gray-600">{client.satisfaction}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lista completa de clientes */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Lista de Clientes</h3>
          <span className="text-sm text-gray-600">
            {filteredClients.length} de {data.topClients.length} clientes
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Receita Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Projetos Ativos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Satisfação
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClients.map((client, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-proteq-blue text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                        {client.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{client.name}</div>
                        <div className="text-sm text-gray-500">Cliente desde 2021</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-proteq-blue">
                      {formatCurrency(client.revenue)}
                    </div>
                    <div className="text-sm text-gray-500">Últimos 12 meses</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{client.projects}</div>
                    <div className="text-sm text-gray-500">
                      {client.projects > 0 ? 'Em andamento' : 'Sem projetos'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900">{client.satisfaction}%</div>
                      <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            client.satisfaction >= 90 ? 'bg-green-500' :
                            client.satisfaction >= 80 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${client.satisfaction}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      client.projects > 0 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {client.projects > 0 ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-proteq-blue hover:text-blue-900 mr-3">
                      Ver detalhes
                    </button>
                    <button className="text-gray-600 hover:text-gray-900">
                      Contatar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredClients.length === 0 && (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum cliente encontrado com os filtros aplicados</p>
          </div>
        )}
      </div>

      {/* Insights sobre clientes */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-6 text-white">
        <h3 className="text-lg font-semibold mb-4">Insights de Clientes</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <h4 className="font-semibold mb-2">Retenção</h4>
            <p className="text-sm opacity-90">
              Taxa de retenção de 94% nos últimos 12 meses, indicando alta satisfação e fidelidade.
            </p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <h4 className="font-semibold mb-2">Crescimento</h4>
            <p className="text-sm opacity-90">
              12 novos clientes este mês, com foco em empresas de médio porte do setor industrial.
            </p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <h4 className="font-semibold mb-2">Oportunidade</h4>
            <p className="text-sm opacity-90">
              45 clientes na faixa baixa de receita têm potencial para upgrade de serviços.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientsTab;
