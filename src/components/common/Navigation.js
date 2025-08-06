import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Users,
  FileText,
  PieChart
} from 'lucide-react';

const Navigation = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { 
      id: 'overview', 
      name: 'Visão Geral', 
      icon: BarChart3,
      description: 'Dashboard principal com KPIs'
    },
    { 
      id: 'revenue', 
      name: 'Receitas', 
      icon: TrendingUp,
      description: 'Análise de faturamento'
    },
    { 
      id: 'expenses', 
      name: 'Despesas', 
      icon: TrendingDown,
      description: 'Controle de gastos'
    },
    { 
      id: 'cashflow', 
      name: 'Fluxo de Caixa', 
      icon: Wallet,
      description: 'Entradas e saídas'
    },
    { 
      id: 'clients', 
      name: 'Clientes', 
      icon: Users,
      description: 'Gestão de clientes'
    }
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-16 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-proteq-blue text-proteq-blue'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              title={tab.description}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <div className="py-2">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-proteq-blue focus:border-transparent"
            >
              {tabs.map((tab) => (
                <option key={tab.id} value={tab.id}>
                  {tab.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tab Indicator for Mobile */}
        <div className="md:hidden border-b-2 border-proteq-blue w-full"></div>
      </div>
    </nav>
  );
};

export default Navigation;
