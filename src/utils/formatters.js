// Formatadores de dados para o dashboard

// Formatar valores monetários para Real brasileiro
export const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

// Formatar valores monetários com decimais
export const formatCurrencyWithDecimals = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

// Formatar números grandes (K, M, B)
export const formatCompactNumber = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    notation: 'compact',
    compactDisplay: 'short'
  }).format(value);
};

// Formatar percentuais
export const formatPercentage = (value, decimals = 1) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value / 100);
};

// Formatar datas para padrão brasileiro
export const formatDate = (date) => {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
};

// Formatar data e hora
export const formatDateTime = (date) => {
  return new Intl.DateTimeFormat('pt-BR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
};

// Calcular variação percentual
export const calculatePercentageChange = (current, previous) => {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

// Determinar cor baseada em valor positivo/negativo
export const getChangeColor = (value) => {
  if (value > 0) return 'text-green-600';
  if (value < 0) return 'text-red-600';
  return 'text-gray-600';
};

// Determinar ícone baseado em valor positivo/negativo
export const getChangeIcon = (value) => {
  if (value > 0) return 'ArrowUpRight';
  if (value < 0) return 'ArrowDownRight';
  return 'Minus';
};

// Truncar texto com reticências
export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Validar CNPJ (simplificado)
export const validateCNPJ = (cnpj) => {
  const cleanCNPJ = cnpj.replace(/[^\d]/g, '');
  return cleanCNPJ.length === 14;
};

// Formatar CNPJ
export const formatCNPJ = (cnpj) => {
  const cleanCNPJ = cnpj.replace(/[^\d]/g, '');
  return cleanCNPJ.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
};

// Formatar telefone
export const formatPhone = (phone) => {
  const cleanPhone = phone.replace(/[^\d]/g, '');
  if (cleanPhone.length === 11) {
    return cleanPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (cleanPhone.length === 10) {
    return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return phone;
};

// Gerar cores aleatórias para gráficos
export const generateColors = (count) => {
  const colors = [
    '#1e5091', '#8bc34a', '#64b5f6', '#81c784', '#ef5350',
    '#ff9800', '#9c27b0', '#607d8b', '#795548', '#009688'
  ];
  
  const result = [];
  for (let i = 0; i < count; i++) {
    result.push(colors[i % colors.length]);
  }
  return result;
};

// Calcular média de array
export const calculateAverage = (array, key) => {
  if (!array.length) return 0;
  const sum = array.reduce((acc, item) => acc + (key ? item[key] : item), 0);
  return sum / array.length;
};

// Calcular soma de array
export const calculateSum = (array, key) => {
  return array.reduce((acc, item) => acc + (key ? item[key] : item), 0);
};

// Encontrar valor máximo em array
export const findMax = (array, key) => {
  if (!array.length) return 0;
  return Math.max(...array.map(item => key ? item[key] : item));
};

// Encontrar valor mínimo em array
export const findMin = (array, key) => {
  if (!array.length) return 0;
  return Math.min(...array.map(item => key ? item[key] : item));
};

// Status das contas (cores e textos)
export const getAccountStatus = (status) => {
  const statusMap = {
    'pendente': { color: 'bg-yellow-100 text-yellow-800', text: 'Pendente' },
    'vencido': { color: 'bg-red-100 text-red-800', text: 'Vencido' },
    'pago': { color: 'bg-green-100 text-green-800', text: 'Pago' },
    'agendado': { color: 'bg-blue-100 text-blue-800', text: 'Agendado' },
    'cancelado': { color: 'bg-gray-100 text-gray-800', text: 'Cancelado' }
  };
  
  return statusMap[status] || statusMap['pendente'];
};

// Calcular dias até vencimento
export const getDaysUntilDue = (dueDate) => {
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = due - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Formatar prazo de vencimento
export const formatDueDate = (dueDate) => {
  const days = getDaysUntilDue(dueDate);
  
  if (days < 0) {
    return `Vencido há ${Math.abs(days)} dias`;
  } else if (days === 0) {
    return 'Vence hoje';
  } else if (days === 1) {
    return 'Vence amanhã';
  } else if (days <= 7) {
    return `Vence em ${days} dias`;
  } else {
    return formatDate(dueDate);
  }
};
