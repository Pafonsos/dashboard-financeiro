export const generateMockData = () => {
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  
  // Dados de receita mensal com crescimento orgânico
  const monthlyRevenue = months.map((month, index) => ({
    month,
    receita: 45000 + Math.random() * 15000 + (index * 2000),
    despesas: 25000 + Math.random() * 8000 + (index * 1000),
    lucro: 20000 + Math.random() * 7000 + (index * 1000),
    meta: 55000 + (index * 1500) // Meta crescente
  }));

  // Tipos de serviço com cores da marca
  const serviceTypes = [
    { name: 'Consultoria', value: 35, color: '#1e5091', revenue: 82500 },
    { name: 'Manutenção', value: 28, color: '#8bc34a', revenue: 66000 },
    { name: 'Instalação', value: 22, color: '#64b5f6', revenue: 51800 },
    { name: 'Suporte', value: 15, color: '#81c784', revenue: 35300 }
  ];

  // Estatísticas de clientes
  const clientStats = [
    { status: 'Ativos', count: 145, change: 8, icon: 'users' },
    { status: 'Novos (mês)', count: 12, change: 3, icon: 'user-plus' },
    { status: 'Inativos', count: 8, change: -2, icon: 'user-minus' },
    { status: 'Potenciais', count: 23, change: 5, icon: 'target' }
  ];

  // Fluxo de caixa dos últimos 6 meses
  const cashFlow = months.slice(0, 6).map((month, index) => ({
    month,
    entrada: 50000 + Math.random() * 20000,
    saida: 30000 + Math.random() * 15000,
    saldo: 20000 + Math.random() * 10000 + (index * 2000)
  }));

  // Despesas por categoria
  const expenseCategories = [
    { name: 'Folha de Pagamento', value: 45, amount: 135000, color: '#ef5350' },
    { name: 'Fornecedores', value: 25, amount: 75000, color: '#ff9800' },
    { name: 'Infraestrutura', value: 15, amount: 45000, color: '#9c27b0' },
    { name: 'Marketing', value: 10, amount: 30000, color: '#607d8b' },
    { name: 'Outros', value: 5, amount: 15000, color: '#795548' }
  ];

  // Contas a receber
  const accountsReceivable = [
    { client: 'Empresa ABC Ltda', amount: 25000, dueDate: '2024-08-15', status: 'pendente' },
    { client: 'Indústrias XYZ S.A.', amount: 18500, dueDate: '2024-08-20', status: 'pendente' },
    { client: 'Comércio 123', amount: 12300, dueDate: '2024-08-25', status: 'vencido' },
    { client: 'Serviços DEF', amount: 31200, dueDate: '2024-09-01', status: 'pendente' }
  ];

  // Contas a pagar
  const accountsPayable = [
    { supplier: 'Fornecedor A', amount: 15000, dueDate: '2024-08-18', status: 'pendente' },
    { supplier: 'Fornecedor B', amount: 8500, dueDate: '2024-08-22', status: 'pendente' },
    { supplier: 'Aluguel Escritório', amount: 12000, dueDate: '2024-08-30', status: 'agendado' },
    { supplier: 'Energia Elétrica', amount: 6620, dueDate: '2024-09-05', status: 'pendente' }
  ];

  // Top clientes
  const topClients = [
    { name: 'Empresa ABC Ltda', revenue: 125000, projects: 8, satisfaction: 95 },
    { name: 'Indústrias XYZ S.A.', revenue: 98500, projects: 6, satisfaction: 92 },
    { name: 'Grupo Comercial 456', revenue: 87300, projects: 5, satisfaction: 89 },
    { name: 'Serviços Especializados', revenue: 76200, projects: 4, satisfaction: 97 },
    { name: 'Tecnologia Avançada', revenue: 65400, projects: 3, satisfaction: 94 }
  ];

  // Projetos ativos
  const activeProjects = [
    { name: 'Projeto Alpha', client: 'Empresa ABC', progress: 75, budget: 45000, spent: 33750 },
    { name: 'Implementação Beta', client: 'Indústrias XYZ', progress: 60, budget: 32000, spent: 19200 },
    { name: 'Consultoria Gamma', client: 'Grupo 456', progress: 90, budget: 25000, spent: 22500 },
    { name: 'Suporte Delta', client: 'Serviços ESP', progress: 40, budget: 18000, spent: 7200 }
  ];

  // Indicadores de performance
  const kpiData = {
    totalRevenue: monthlyRevenue.reduce((acc, month) => acc + month.receita, 0),
    totalExpenses: monthlyRevenue.reduce((acc, month) => acc + month.despesas, 0),
    netProfit: monthlyRevenue.reduce((acc, month) => acc + month.lucro, 0),
    activeClients: 145,
    activeProjects: 23,
    averageTicket: 5847,
    recurringRevenue: 234560,
    growthRate: 12.5,
    cashBalance: 125430,
    accountsReceivableTotal: accountsReceivable.reduce((acc, item) => acc + item.amount, 0),
    accountsPayableTotal: accountsPayable.reduce((acc, item) => acc + item.amount, 0)
  };

  return {
    monthlyRevenue,
    serviceTypes,
    clientStats,
    cashFlow,
    expenseCategories,
    accountsReceivable,
    accountsPayable,
    topClients,
    activeProjects,
    kpiData
  };
};

// Dados estáticos para demonstração
export const staticData = {
  companyInfo: {
    name: 'PROTEQ',
    cnpj: '12.345.678/0001-90',
    address: 'Rua Exemplo, 123 - São Paulo/SP',
    phone: '(11) 3456-7890',
    email: 'contato@proteq.com.br'
  },
  
  colors: {
    primary: '#1e5091',
    secondary: '#8bc34a',
    accent1: '#64b5f6',
    accent2: '#81c784',
    danger: '#ef5350',
    warning: '#ff9800',
    success: '#4caf50'
  }
};
