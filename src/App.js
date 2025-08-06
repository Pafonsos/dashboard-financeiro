import React, { useState, useEffect } from 'react';
import Header from './components/common/Header';
import Navigation from './components/common/Navigation';
import OverviewTab from './components/tabs/OverviewTab';
import RevenueTab from './components/tabs/RevenueTab';
import ExpensesTab from './components/tabs/ExpensesTab';
import CashFlowTab from './components/tabs/CashFlowTab';
import ClientsTab from './components/tabs/ClientsTab';
import { generateMockData } from './data/mockData';

const App = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState(generateMockData());
  const [selectedPeriod, setSelectedPeriod] = useState('2024');

  // Simular atualização de dados em tempo real
  useEffect(() => {
    const interval = setInterval(() => {
      setData(generateMockData());
    }, 60000); // Atualiza a cada minuto

    return () => clearInterval(interval);
  }, []);

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    // Aqui você poderia filtrar os dados baseado no período
    setData(generateMockData());
  };

  const renderActiveTab = () => {
    const tabProps = {
      data,
      selectedPeriod
    };

    switch (activeTab) {
      case 'overview':
        return <OverviewTab {...tabProps} />;
      case 'revenue':
        return <RevenueTab {...tabProps} />;
      case 'expenses':
        return <ExpensesTab {...tabProps} />;
      case 'cashflow':
        return <CashFlowTab {...tabProps} />;
      case 'clients':
        return <ClientsTab {...tabProps} />;
      default:
        return <OverviewTab {...tabProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        selectedPeriod={selectedPeriod} 
        onPeriodChange={handlePeriodChange}
      />
      <Navigation 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 fade-in">
        {renderActiveTab()}
      </main>
    </div>
  );
};

export default App;
