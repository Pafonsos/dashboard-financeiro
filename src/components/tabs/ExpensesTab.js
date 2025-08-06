import React, { useState } from 'react';
import BarChart from '../charts/BarChart';
import PieChart from '../charts/PieChart';
import { formatCurrency, formatDueDate } from '../../utils/formatters';
import { TrendingDown, AlertTriangle, Calendar, CreditCard } from 'lucide-react';

const ExpensesTab = ({ data }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  if (!data) return <div>Carregando...</div>;

  const totalExpenses = data.monthlyRevenue.reduce((sum, month) => sum + month.despesas, 0);
  const avgMonthlyExpense = totalExpenses / data.monthlyRevenue.length;

  // Métricas de despesas
  const expenseMetrics = [
    {
      title: 'Despesas Totais',
      value: formatCurrency(totalExpenses),
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      change: -5.2
    },
    {
      title: 'Média Mensal',
      value: formatCurrency(avgMonthlyExpense),
      icon: Calendar,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      change: 2.1
    },
    {
      title: 'A Pagar (30 dias)',
      value: formatCurrency(data.kpiData.accountsPayableTotal),
      icon: CreditCard,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      change: -8.7
    },
    {
      title: 'Vencidas',
      value: formatCurrency(12300),
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      change: -15.3
    }
  ];

  // Configuração do gráfico
  const expenseBars = [
    { dataKey: 'despesas', name: 'Despesas Mensais' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Controle de Despesas</h2>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-proteq-blue"
          >
            <option value="all">Todas as categorias</option>
            <option value="payroll">Folha de Pagamento</option>
            <option value="suppliers">Fornecedores</option>
            <option value="infrastructure">Infraestrutura</option>
            <option value="marketing">Marketing</option>
          </select>
        </div>
      </div>

      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {expenseMetrics.map((metric, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
                <div className="flex items-center mt-2">
                  <span className={`text-sm font-medium ${metric.change > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {metric.change > 0 ? '+' : ''}{metric.change}% vs mês anterior
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

      {/* Gráfico de evolução */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <BarChart
          title="Evolução das Despesas Mensais"
          data={data.monthlyRevenue}
          bars={expenseBars}
          height={350}
          colors={['#ef5350']}
        />
      </div>

      {/* Análises detalhadas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Despesas por categoria */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Despesas por Categoria</h3>
          <div className="space-y-4">
            {data.expenseCategories.map((category, index) => (
              <div key={index} className="flex items-center justify-between p-4 border-l-4 bg-gray-50 rounded-r-lg"
                   style={{ borderLeftColor: category.color }}>
                <div>
                  <span className="font-medium text-gray-900">{category.name}</span>
                  <p className="text-sm text-gray-600">{category.value}% do total</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-gray-900">
                    {formatCurrency(category.amount)}
                  </span>
                  <p className="text-sm text-gray-600">Mensal</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Distribuição visual */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <PieChart
            title="Distribuição das Despesas"
            data={data.expenseCategories}
            height={280}
          />
        </div>
      </div>

      {/* Contas a pagar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Contas a Pagar</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fornecedor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vencimento
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
              {data.accountsPayable.map((account, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{account.supplier}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900">
                      {formatCurrency(account.amount)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDueDate(account.dueDate)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      account.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
                      account.status === 'agendado' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {account.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-proteq-blue hover:text-blue-900 mr-3">
                      Pagar
                    </button>
                    <button className="text-gray-600 hover:text-gray-900">
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comparativo e tendências */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Análise de Tendências</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <TrendingDown className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-red-600">-5.2%</p>
            <p className="text-sm text-gray-600">Redução vs mês anterior</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <Calendar className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600">23.4%</p>
            <p className="text-sm text-gray-600">Economia no trimestre</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <CreditCard className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-600">95%</p>
            <p className="text-sm text-gray-600">Contas pagas em dia</p>
          </div>
        </div>
      </div>

      {/* Recomendações */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-lg p-6 text-white">
        <h3 className="text-lg font-semibold mb-4">Recomendações de Otimização</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <h4 className="font-semibold mb-2">Fornecedores</h4>
            <p className="text-sm opacity-90">
              Renegociar contratos com fornecedores pode gerar economia de até 8% nos custos mensais.
            </p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <h4 className="font-semibold mb-2">Infraestrutura</h4>
            <p className="text-sm opacity-90">
              Migração para nuvem pode reduzir custos de infraestrutura em 15-20% no próximo ano.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpensesTab;
