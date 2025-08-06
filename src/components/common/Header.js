import React from 'react';
import Logo from './Logo';
import { Calendar, Download, Bell, Settings } from 'lucide-react';

const Header = ({ selectedPeriod, onPeriodChange }) => {
  const currentDate = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const handleExport = () => {
    // Função para exportar dados (implementar conforme necessidade)
    alert('Funcionalidade de exportação em desenvolvimento');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo e título */}
          <div className="flex items-center space-x-4">
            <Logo />
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold text-gray-900">Dashboard Financeiro</h1>
              <p className="text-sm text-gray-600 capitalize">{currentDate}</p>
            </div>
          </div>

          {/* Controles do header */}
          <div className="flex items-center space-x-4">
            {/* Seletor de período */}
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <select 
                value={selectedPeriod}
                onChange={(e) => onPeriodChange(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-proteq-blue focus:border-transparent"
              >
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
                <option value="custom">Período personalizado</option>
              </select>
            </div>

            {/* Botões de ação */}
            <button
              onClick={handleExport}
              className="flex items-center space-x-1 px-3 py-2 text-sm bg-proteq-blue text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:block">Exportar</span>
            </button>

            {/* Notificações */}
            <button className="relative p-2 text-gray-500 hover:text-gray-700 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>

            {/* Configurações */}
            <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Informações adicionais em mobile */}
        <div className="sm:hidden pb-3">
          <h1 className="text-lg font-semibold text-gray-900">Dashboard Financeiro</h1>
          <p className="text-sm text-gray-600">Última atualização: {new Date().toLocaleTimeString('pt-BR')}</p>
        </div>
      </div>
    </header>
export default Header;
