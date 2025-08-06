import React, { useState } from 'react';
import BarChart from '../charts/BarChart';
import LineChart from '../charts/LineChart';
import AlertCard from '../cards/AlertCard';
import { formatCurrency, formatDueDate, getDaysUntilDue } from '../../utils/formatters';
import { Wallet, CreditCard, AlertCircle, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const CashFlowTab = ({ data }) => {
  const [viewType, setViewType] = useState('overview');
  
  if (!data) return <div>Carregando...</div>;

  // Métricas principais do fluxo de caixa
  const cashFlowMetrics = [
    {
      title: 'Saldo Atual',
      value: formatCurrency(data.kpiData.cashBalance),
      icon: Wallet,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      subtitle: 'Posição atual do caixa'
    },
    {
      title: 'A Receber (30 dias)',
      value: formatCurrency(data.kpiData.accountsReceivableTotal),
      icon: ArrowDownRight,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      subtitle: 'Entradas previstas'
    },
    {
      title: 'A Pagar (30 dias)',
      value: formatCurrency(data.kpiData.accountsPayableTotal),
      icon: ArrowUpRight,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      subtitle: 'Saídas programadas'
    },
    {
      title: 'Projeção Líquida',
      value: formatCurrency(data.kpiData.accountsReceivableTotal - data.kpiData.accountsPayableTotal),
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      subtitle: 'Resultado em 30 dias'
    }
  ];

  // Configuração dos gráficos
  const cashFlowBars = [
    { dataKey: 'entrada', name: 'Entradas' },
    { dataKey: 'saida', name: 'Saídas' }
  ];

  const balanceLines = [
    { dataKey: 'saldo', name: 'Saldo Acumulado' }
  ];

  // Alertas de fluxo de caixa
  const cashFlowAlerts = [
    {
      type: 'warning',
      title: 'Saldo baixo previsto',
      message: 'Saldo pode ficar abaixo de R$ 50.000 na próxima semana',
      action: 'Ver detalhes'
    },
    {
      type: 'info',
      title: 'Grande entrada confirmada',
      message: 'R$ 85.000 confirmados para recebimento em 15 dias',
      action: 'Ver cronograma'
    }
  ];

  // Contas com vencimento próximo
  const upcomingDues = [
    ...data.accountsReceivable.filter(item => getDaysUntilDue(item.dueDate) <= 7),
    ...data.accountsPayable.filter(item => getDaysUntilDue(item.dueDate) <= 7)
  ].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  return (
    <div className="space-y-6">
      {/* Header com controles */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Fluxo de Caixa</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setViewType('overview')}
              className={`px-3 py-2 text-sm rounded-md ${viewType === 'overview' ? 'bg-proteq-blue text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              Visão Geral
            </button>
            <button
              onClick={() => setViewType('projection')}
              className={`px-3 py-2 text-sm rounded-md ${viewType === 'projection' ? 'bg-proteq-blue text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              Projeções
            </button>
          </div>
        </div>
      </div>

      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cashFlowMetrics.map((metric, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
                <p className="text-xs text-gray-500 mt-1">{metric.subtitle}</p>
              </div>
              <div className={`${metric.bgColor} ${metric.color} p-3 rounded-lg`}>
                <metric.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Gráficos principais */}
      {viewType === 'overview' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Entradas vs Saídas */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <BarChart
              title="Entradas vs Saídas - Últimos 6 Meses"
              data={data.cashFlow}
              bars={cashFlowBars}
              height={300}
              colors={['#8bc34a', '#ef5350']}
            />
          </div>

          {/* Evolução do Saldo */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <LineChart
              title="Evolução do Saldo"
              data={data.cashFlow}
              lines={balanceLines}
              height={300}
              colors={['#1e5091']}
            />
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Projeção de Fluxo de Caixa - Próximos 90 dias</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Período</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entradas</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Saídas</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Saldo Líquido</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Saldo Acumulado</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[
                  { period: 'Semana 1', entrada: 45000, saida: 32000, saldoInicial: 125430 },
                  { period: 'Semana 2', entrada: 38000, saida: 28000, saldoInicial: 138430 },
                  { period: 'Semana 3', entrada: 52000, saida: 35000, saldoInicial: 148430 },
                  { period: 'Semana 4', entrada: 41000, saida: 31000, saldoInicial: 165430 }
                ].map((row, index) => {
                  const saldoLiquido = row.entrada - row.saida;
                  const saldoAcumulado = row.saldoInicial + saldoLiquido;
                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {row.period}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">
                        {formatCurrency(row.entrada)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-semibold">
                        {formatCurrency(row.saida)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                        <span className={saldoLiquido > 0 ? 'text-green-600' : 'text-red-600'}>
                          {formatCurrency(saldoLiquido)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        {formatCurrency(saldoAcumulado)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Alertas e vencimentos próximos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alertas */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertas de Fluxo de Caixa</h3>
          <div className="space-y-3">
            {cashFlowAlerts.map((alert, index) => (
              <AlertCard key={index} {...alert} />
            ))}
          </div>
        </div>

        {/* Vencimentos próximos */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Vencimentos nos Próximos 7 Dias</h3>
          <div className="space-y-3">
            {upcomingDues.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Nenhum vencimento próximo</p>
            ) : (
              upcomingDues.slice(0, 5).map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {item.client || item.supplier}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatDueDate(item.dueDate)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${item.client ? 'text-green-600' : 'text-red-600'}`}>
                      {item.client ? '+' : '-'}{formatCurrency(item.amount)}
                    </p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      getDaysUntilDue(item.dueDate) <= 2 
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {getDaysUntilDue(item.dueDate) === 0 
                        ? 'Hoje' 
                        : `${getDaysUntilDue(item.dueDate)} dias`}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Resumo executivo */}
      <div className="bg-gradient-to-r from-proteq-blue to-blue-700 rounded-lg p-6 text-white">
        <h3 className="text-lg font-semibold mb-4">Resumo Executivo - Fluxo de Caixa</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <h4 className="font-semibold mb-2">Posição Atual</h4>
            <p className="text-sm opacity-90">
              Saldo saudável de {formatCurrency(data.kpiData.cashBalance)} oferece boa margem de segurança operacional.
            </p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <h4 className="font-semibold mb-2">Próximos 30 Dias</h4>
            <p className="text-sm opacity-90">
              Entrada líquida positiva de {formatCurrency(data.kpiData.accountsReceivableTotal - data.kpiData.accountsPayableTotal)} esperada.
            </p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <h4 className="font-semibold mb-2">Recomendação</h4>
            <p className="text-sm opacity-90">
              Manter reserva mínima de R$ 50.000 para emergências e sazonalidade.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashFlowTab;
