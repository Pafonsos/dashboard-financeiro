const { executeQuery } = require('../config/database');
const logger = require('../utils/logger');
const { validateDate } = require('../utils/validators');

// Relatório financeiro completo
const getFinancialReport = async (req, res) => {
  try {
    const { startDate, endDate, format = 'json' } = req.query;
    const userId = req.user.id;
    
    // Validar datas
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Data inicial e final são obrigatórias'
      });
    }
    
    if (!validateDate(startDate) || !validateDate(endDate)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de data inválido'
      });
    }
    
    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({
        success: false,
        message: 'Data inicial deve ser anterior à data final'
      });
    }
    
    // Resumo geral
    const summaryResult = await executeQuery(`
      SELECT 
        COUNT(*) as total_transactions,
        COUNT(CASE WHEN type = 'income' THEN 1 END) as income_transactions,
        COUNT(CASE WHEN type = 'expense' THEN 1 END) as expense_transactions,
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount END), 0) as total_income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount END), 0) as total_expenses,
        COALESCE(AVG(CASE WHEN type = 'income' THEN amount END), 0) as avg_income,
        COALESCE(AVG(CASE WHEN type = 'expense' THEN amount END), 0) as avg_expense
      FROM transactions 
      WHERE user_id = ? AND DATE(created_at) BETWEEN ? AND ?
    `, [userId, startDate, endDate]);
    
    const summary = summaryResult.data[0];
    const netIncome = parseFloat(summary.total_income) - parseFloat(summary.total_expenses);
    
    // Transações por categoria
    const categoriesResult = await executeQuery(`
      SELECT 
        category,
        type,
        COUNT(*) as count,
        SUM(amount) as total,
        AVG(amount) as average,
        MIN(amount) as minimum,
        MAX(amount) as maximum
      FROM transactions 
      WHERE user_id = ? AND DATE(created_at) BETWEEN ? AND ?
      GROUP BY category, type
      ORDER BY total DESC
    `, [userId, startDate, endDate]);
    
    // Transações por mês
    const monthlyResult = await executeQuery(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        MONTHNAME(created_at) as month_name,
        YEAR(created_at) as year,
        COUNT(*) as transactions,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expenses
      FROM transactions 
      WHERE user_id = ? AND DATE(created_at) BETWEEN ? AND ?
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY created_at
    `, [userId, startDate, endDate]);
    
    // Top clientes por receita
    const topClientsResult = await executeQuery(`
      SELECT 
        c.name,
        c.email,
        COUNT(t.id) as transactions,
        SUM(t.amount) as total_revenue
      FROM clients c
      JOIN transactions t ON c.id = t.client_id
      WHERE t.user_id = ? AND t.type = 'income' AND DATE(t.created_at) BETWEEN ? AND ?
      GROUP BY c.id, c.name, c.email
      ORDER BY total_revenue DESC
      LIMIT 10
    `, [userId, startDate, endDate]);
    
    // Status das transações
    const statusResult = await executeQuery(`
      SELECT 
        status,
        COUNT(*) as count,
        SUM(amount) as total
      FROM transactions 
      WHERE user_id = ? AND DATE(created_at) BETWEEN ? AND ?
      GROUP BY status
    `, [userId, startDate, endDate]);
    
    const report = {
      period: {
        startDate,
        endDate,
        totalDays: Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1
      },
      summary: {
        totalTransactions: parseInt(summary.total_transactions),
        incomeTransactions: parseInt(summary.income_transactions),
        expenseTransactions: parseInt(summary.expense_transactions),
        totalIncome: parseFloat(summary.total_income),
        totalExpenses: parseFloat(summary.total_expenses),
        netIncome: netIncome,
        avgIncome: parseFloat(summary.avg_income),
        avgExpense: parseFloat(summary.avg_expense),
        profitMargin: summary.total_income > 0 ? (netIncome / parseFloat(summary.total_income)) * 100 : 0
      },
      categoriesBreakdown: categoriesResult.data.map(row => ({
        category: row.category,
        type: row.type,
        count: parseInt(row.count),
        total: parseFloat(row.total),
        average: parseFloat(row.average),
        minimum: parseFloat(row.minimum),
        maximum: parseFloat(row.maximum),
        percentage: summary.total_income > 0 ? (parseFloat(row.total) / parseFloat(summary.total_income)) * 100 : 0
      })),
      monthlyBreakdown: monthlyResult.data.map(row => ({
        month: row.month,
        monthName: row.month_name,
        year: parseInt(row.year),
        transactions: parseInt(row.transactions),
        income: parseFloat(row.income),
        expenses: parseFloat(row.expenses),
        netIncome: parseFloat(row.income) - parseFloat(row.expenses)
      })),
      topClients: topClientsResult.data.map(row => ({
        name: row.name,
        email: row.email,
        transactions: parseInt(row.transactions),
        totalRevenue: parseFloat(row.total_revenue)
      })),
      statusBreakdown: statusResult.data.map(row => ({
        status: row.status,
        count: parseInt(row.count),
        total: parseFloat(row.total)
      })),
      generatedAt: new Date().toISOString(),
      generatedBy: req.user.email
    };
    
    // Log da geração do relatório
    logger.info(`Relatório financeiro gerado: ${startDate} a ${endDate} por ${req.user.email}`);
    
    res.json({
      success: true,
      data: report
    });
    
  } catch (error) {
    logger.error('Erro ao gerar relatório financeiro:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Relatório de fluxo de caixa
const getCashFlowReport = async (req, res) => {
  try {
    const { period = 'month', months = 12 } = req.query;
    const userId = req.user.id;
    
    let dateFormat, intervalMonths;
    
    switch (period) {
      case 'week':
        dateFormat = '%Y-%u';
        intervalMonths = 3;
        break;
      case 'month':
        dateFormat = '%Y-%m';
        intervalMonths = parseInt(months);
        break;
      case 'quarter':
        dateFormat = '%Y-%q';
        intervalMonths = 24;
        break;
      case 'year':
        dateFormat = '%Y';
        intervalMonths = 60;
        break;
      default:
        dateFormat = '%Y-%m';
        intervalMonths = 12;
    }
    
    const cashFlowResult = await executeQuery(`
      SELECT 
        DATE_FORMAT(created_at, ?) as period,
        DATE_FORMAT(created_at, '%Y-%m-%d') as date,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as cash_in,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as cash_out,
        COUNT(CASE WHEN type = 'income' THEN 1 END) as income_count,
        COUNT(CASE WHEN type = 'expense' THEN 1 END) as expense_count
      FROM transactions 
      WHERE user_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL ? MONTH)
      GROUP BY DATE_FORMAT(created_at, ?)
      ORDER BY created_at
    `, [dateFormat, userId, intervalMonths, dateFormat]);
    
    let cumulativeCash = 0;
    const cashFlow = cashFlowResult.data.map(row => {
      const cashIn = parseFloat(row.cash_in);
      const cashOut = parseFloat(row.cash_out);
      const netCash = cashIn - cashOut;
      cumulativeCash += netCash;
      
      return {
        period: row.period,
        date: row.date,
        cashIn,
        cashOut,
        netCash,
        cumulativeCash,
        incomeCount: parseInt(row.income_count),
        expenseCount: parseInt(row.expense_count)
      };
    });
    
    // Projeção básica (baseada na média dos últimos períodos)
    const recentPeriods = cashFlow.slice(-6);
    const avgCashIn = recentPeriods.reduce((sum, p) => sum + p.cashIn, 0) / recentPeriods.length;
    const avgCashOut = recentPeriods.reduce((sum, p) => sum + p.cashOut, 0) / recentPeriods.length;
    
    const projection = [];
    let projectedCumulative = cumulativeCash;
    
    for (let i = 1; i <= 6; i++) {
      const projectedNet = avgCashIn - avgCashOut;
      projectedCumulative += projectedNet;
      
      projection.push({
        period: `Projeção +${i}`,
        cashIn: avgCashIn,
        cashOut: avgCashOut,
        netCash: projectedNet,
        cumulativeCash: projectedCumulative,
        isProjection: true
      });
    }
    
    res.json({
      success: true,
      data: {
        period,
        months: intervalMonths,
        cashFlow,
        projection,
        summary: {
          totalCashIn: cashFlow.reduce((sum, p) => sum + p.cashIn, 0),
          totalCashOut: cashFlow.reduce((sum, p) => sum + p.cashOut, 0),
          currentBalance: cumulativeCash,
          avgMonthlyIncome: avgCashIn,
          avgMonthlyExpenses: avgCashOut,
          projectedBalance: projectedCumulative
        }
      }
    });
    
  } catch (error) {
    logger.error('Erro ao gerar relatório de fluxo de caixa:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Relatório de clientes
const getClientsReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.user.id;
    
    let dateFilter = '';
    const params = [userId];
    
    if (startDate && endDate) {
      if (!validateDate(startDate) || !validateDate(endDate)) {
        return res.status(400).json({
          success: false,
          message: 'Formato de data inválido'
        });
      }
      dateFilter = 'AND DATE(t.created_at) BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }
    
    const clientsResult = await executeQuery(`
      SELECT 
        c.id,
        c.name,
        c.email,
        c.phone,
        c.company,
        c.status,
        c.created_at as client_since,
        COUNT(t.id) as total_transactions,
        COUNT(CASE WHEN t.type = 'income' THEN 1 END) as income_transactions,
        COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount END), 0) as total_revenue,
        COALESCE(MAX(t.created_at), NULL) as last_transaction,
        COALESCE(AVG(CASE WHEN t.type = 'income' THEN t.amount END), 0) as avg_transaction_value
      FROM clients c
      LEFT JOIN transactions t ON c.id = t.client_id ${dateFilter ? 'AND ' + dateFilter.replace('AND ', '') : ''}
      WHERE c.user_id = ?
      GROUP BY c.id, c.name, c.email, c.phone, c.company, c.status, c.created_at
      ORDER BY total_revenue DESC
    `, params);
    
    // Análise de segmentação de clientes
    const totalRevenue = clientsResult.data.reduce((sum, client) => sum + parseFloat(client.total_revenue), 0);
    
    const clientsAnalysis = clientsResult.data.map(client => {
      const revenue = parseFloat(client.total_revenue);
      const revenuePercentage = totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0;
      
      let segment = 'Bronze';
      if (revenuePercentage >= 20) segment = 'Platinum';
      else if (revenuePercentage >= 10) segment = 'Gold';
      else if (revenuePercentage >= 5) segment = 'Silver';
      
      // Calcular dias desde última transação
      const daysSinceLastTransaction = client.last_transaction ? 
        Math.floor((new Date() - new Date(client.last_transaction)) / (1000 * 60 * 60 * 24)) : null;
      
      return {
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        company: client.company,
        status: client.status,
        clientSince: client.client_since,
        totalTransactions: parseInt(client.total_transactions),
        incomeTransactions: parseInt(client.income_transactions),
        totalRevenue: revenue,
        revenuePercentage: parseFloat(revenuePercentage.toFixed(2)),
        avgTransactionValue: parseFloat(client.avg_transaction_value),
        lastTransaction: client.last_transaction,
        daysSinceLastTransaction,
        segment,
        isActive: daysSinceLastTransaction === null || daysSinceLastTransaction <= 90
      };
    });
    
    // Estatísticas por segmento
    const segmentStats = {
      Platinum: { count: 0, revenue: 0 },
      Gold: { count: 0, revenue: 0 },
      Silver: { count: 0, revenue: 0 },
      Bronze: { count: 0, revenue: 0 }
    };
    
    clientsAnalysis.forEach(client => {
      segmentStats[client.segment].count++;
      segmentStats[client.segment].revenue += client.totalRevenue;
    });
    
    res.json({
      success: true,
      data: {
        clients: clientsAnalysis,
        summary: {
          totalClients: clientsAnalysis.length,
          activeClients: clientsAnalysis.filter(c => c.isActive).length,
          totalRevenue,
          avgRevenuePerClient: clientsAnalysis.length > 0 ? totalRevenue / clientsAnalysis.length : 0,
          segments: segmentStats
        },
        period: startDate && endDate ? { startDate, endDate } : 'all_time'
      }
    });
    
  } catch (error) {
    logger.error('Erro ao gerar relatório de clientes:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Relatório de serviços
const getServicesReport = async (req, res) => {
  try {
    const { startDate, endDate, status = 'all' } = req.query;
    const userId = req.user.id;
    
    let dateFilter = '';
    let statusFilter = '';
    const params = [userId];
    
    if (startDate && endDate) {
      if (!validateDate(startDate) || !validateDate(endDate)) {
        return res.status(400).json({
          success: false,
          message: 'Formato de data inválido'
        });
      }
      dateFilter = 'AND DATE(s.created_at) BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }
    
    if (status !== 'all') {
      statusFilter = 'AND s.status = ?';
      params.push(status);
    }
    
    const servicesResult = await executeQuery(`
      SELECT 
        s.id,
        s.name,
        s.description,
        s.price,
        s.status,
        s.estimated_hours,
        s.actual_hours,
        s.created_at,
        s.completed_at,
        c.name as client_name,
        c.company as client_company,
        COUNT(t.id) as transactions_count,
        COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount END), 0) as revenue_generated,
        COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount END), 0) as expenses_incurred
      FROM services s
      LEFT JOIN clients c ON s.client_id = c.id
      LEFT JOIN transactions t ON s.id = t.service_id
      WHERE s.user_id = ? ${dateFilter} ${statusFilter}
      GROUP BY s.id, s.name, s.description, s.price, s.status, s.estimated_hours, 
               s.actual_hours, s.created_at, s.completed_at, c.name, c.company
      ORDER BY s.created_at DESC
    `, params);
    
    const servicesAnalysis = servicesResult.data.map(service => {
      const revenue = parseFloat(service.revenue_generated);
      const expenses = parseFloat(service.expenses_incurred);
      const profit = revenue - expenses;
      const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;
      
      // Calcular eficiência de horas
      const estimatedHours = parseFloat(service.estimated_hours) || 0;
      const actualHours = parseFloat(service.actual_hours) || 0;
      const hoursEfficiency = estimatedHours > 0 && actualHours > 0 ? 
        ((estimatedHours - actualHours) / estimatedHours) * 100 : null;
      
      // Calcular duração do projeto
      const startDate = new Date(service.created_at);
      const endDate = service.completed_at ? new Date(service.completed_at) : new Date();
      const durationDays = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));
      
      return {
        id: service.id,
        name: service.name,
        description: service.description,
        price: parseFloat(service.price),
        status: service.status,
        estimatedHours,
        actualHours,
        hoursEfficiency: hoursEfficiency ? parseFloat(hoursEfficiency.toFixed(2)) : null,
        createdAt: service.created_at,
        completedAt: service.completed_at,
        durationDays,
        clientName: service.client_name,
        clientCompany: service.client_company,
        transactionsCount: parseInt(service.transactions_count),
        revenueGenerated: revenue,
        expensesIncurred: expenses,
        profit,
        profitMargin: parseFloat(profitMargin.toFixed(2))
      };
    });
    
    // Estatísticas por status
    const statusStats = {};
    const serviceStatuses = [...new Set(servicesAnalysis.map(s => s.status))];
    
    serviceStatuses.forEach(status => {
      const servicesWithStatus = servicesAnalysis.filter(s => s.status === status);
      statusStats[status] = {
        count: servicesWithStatus.length,
        totalRevenue: servicesWithStatus.reduce((sum, s) => sum + s.revenueGenerated, 0),
        totalProfit: servicesWithStatus.reduce((sum, s) => sum + s.profit, 0),
        avgDuration: servicesWithStatus.reduce((sum, s) => sum + s.durationDays, 0) / servicesWithStatus.length || 0
      };
    });
    
    // Top serviços por receita
    const topServices = [...servicesAnalysis]
      .sort((a, b) => b.revenueGenerated - a.revenueGenerated)
      .slice(0, 10);
    
    res.json({
      success: true,
      data: {
        services: servicesAnalysis,
        topServices,
        summary: {
          totalServices: servicesAnalysis.length,
          totalRevenue: servicesAnalysis.reduce((sum, s) => sum + s.revenueGenerated, 0),
          totalExpenses: servicesAnalysis.reduce((sum, s) => sum + s.expensesIncurred, 0),
          totalProfit: servicesAnalysis.reduce((sum, s) => sum + s.profit, 0),
          avgServiceValue: servicesAnalysis.length > 0 ? 
            servicesAnalysis.reduce((sum, s) => sum + s.price, 0) / servicesAnalysis.length : 0,
          avgDuration: servicesAnalysis.length > 0 ? 
            servicesAnalysis.reduce((sum, s) => sum + s.durationDays, 0) / servicesAnalysis.length : 0,
          statusBreakdown: statusStats
        },
        period: startDate && endDate ? { startDate, endDate } : 'all_time'
      }
    });
    
  } catch (error) {
    logger.error('Erro ao gerar relatório de serviços:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Relatório de performance mensal comparativa
const getPerformanceReport = async (req, res) => {
  try {
    const { months = 12 } = req.query;
    const userId = req.user.id;
    
    const performanceResult = await executeQuery(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        MONTHNAME(created_at) as month_name,
        YEAR(created_at) as year,
        COUNT(*) as total_transactions,
        COUNT(DISTINCT client_id) as unique_clients,
        COUNT(DISTINCT service_id) as unique_services,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as revenue,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expenses,
        AVG(CASE WHEN type = 'income' THEN amount END) as avg_income_per_transaction,
        AVG(CASE WHEN type = 'expense' THEN amount END) as avg_expense_per_transaction
      FROM transactions 
      WHERE user_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL ? MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY created_at
    `, [userId, parseInt(months)]);
    
    const performanceData = performanceResult.data.map((row, index, array) => {
      const revenue = parseFloat(row.revenue);
      const expenses = parseFloat(row.expenses);
      const profit = revenue - expenses;
      
      // Comparação com mês anterior
      let revenueGrowth = null;
      let profitGrowth = null;
      
      if (index > 0) {
        const prevRevenue = parseFloat(array[index - 1].revenue);
        const prevProfit = parseFloat(array[index - 1].revenue) - parseFloat(array[index - 1].expenses);
        
        revenueGrowth = prevRevenue > 0 ? ((revenue - prevRevenue) / prevRevenue) * 100 : null;
        profitGrowth = prevProfit !== 0 ? ((profit - prevProfit) / Math.abs(prevProfit)) * 100 : null;
      }
      
      return {
        month: row.month,
        monthName: row.month_name,
        year: parseInt(row.year),
        totalTransactions: parseInt(row.total_transactions),
        uniqueClients: parseInt(row.unique_clients),
        uniqueServices: parseInt(row.unique_services),
        revenue,
        expenses,
        profit,
        profitMargin: revenue > 0 ? (profit / revenue) * 100 : 0,
        avgIncomePerTransaction: parseFloat(row.avg_income_per_transaction || 0),
        avgExpensePerTransaction: parseFloat(row.avg_expense_per_transaction || 0),
        revenueGrowth: revenueGrowth ? parseFloat(revenueGrowth.toFixed(2)) : null,
        profitGrowth: profitGrowth ? parseFloat(profitGrowth.toFixed(2)) : null
      };
    });
    
    // Calcular médias e tendências
    const avgRevenue = performanceData.reduce((sum, p) => sum + p.revenue, 0) / performanceData.length;
    const avgProfit = performanceData.reduce((sum, p) => sum + p.profit, 0) / performanceData.length;
    const avgGrowth = performanceData
      .filter(p => p.revenueGrowth !== null)
      .reduce((sum, p) => sum + p.revenueGrowth, 0) / performanceData.filter(p => p.revenueGrowth !== null).length || 0;
    
    // Identificar melhor e pior mês
    const bestMonth = performanceData.reduce((best, current) => 
      current.profit > best.profit ? current : best, performanceData[0]);
    const worstMonth = performanceData.reduce((worst, current) => 
      current.profit < worst.profit ? current : worst, performanceData[0]);
    
    res.json({
      success: true,
      data: {
        performance: performanceData,
        insights: {
          avgMonthlyRevenue: parseFloat(avgRevenue.toFixed(2)),
          avgMonthlyProfit: parseFloat(avgProfit.toFixed(2)),
          avgGrowthRate: parseFloat(avgGrowth.toFixed(2)),
          bestMonth: {
            month: bestMonth.monthName,
            year: bestMonth.year,
            profit: bestMonth.profit
          },
          worstMonth: {
            month: worstMonth.monthName,
            year: worstMonth.year,
            profit: worstMonth.profit
          },
          trend: performanceData.length > 6 ? 
            (performanceData.slice(-3).reduce((sum, p) => sum + p.profit, 0) / 3) > 
            (performanceData.slice(-6, -3).reduce((sum, p) => sum + p.profit, 0) / 3) ? 'crescimento' : 'declinio' 
            : 'insuficiente'
        }
      }
    });
    
  } catch (error) {
    logger.error('Erro ao gerar relatório de performance:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

module.exports = {
  getFinancialReport,
  getCashFlowReport,
  getClientsReport,
  getServicesReport,
  getPerformanceReport
};
