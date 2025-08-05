const { executeQuery, executeTransaction } = require('../config/database');
const logger = require('../utils/logger');
const { sanitizeInput, validateCurrency, validateDate } = require('../utils/validators');

// Dashboard - Dados gerais
const getDashboardData = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const userId = req.user.id;
    
    // Definir período
    let dateFilter = '';
    switch (period) {
      case 'week':
        dateFilter = 'AND t.created_at >= DATE_SUB(NOW(), INTERVAL 1 WEEK)';
        break;
      case 'month':
        dateFilter = 'AND t.created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)';
        break;
      case 'quarter':
        dateFilter = 'AND t.created_at >= DATE_SUB(NOW(), INTERVAL 3 MONTH)';
        break;
      case 'year':
        dateFilter = 'AND t.created_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR)';
        break;
      default:
        dateFilter = 'AND t.created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)';
    }
    
    // Receita total
    const revenueResult = await executeQuery(`
      SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_revenue,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expenses,
        COUNT(CASE WHEN type = 'income' THEN 1 END) as income_count,
        COUNT(CASE WHEN type = 'expense' THEN 1 END) as expense_count
      FROM transactions t 
      WHERE t.user_id = ? ${dateFilter}
    `, [userId]);
    
    // Clientes ativos
    const clientsResult = await executeQuery(`
      SELECT 
        COUNT(DISTINCT c.id) as total_clients,
        COUNT(DISTINCT CASE WHEN c.status = 'active' THEN c.id END) as active_clients
      FROM clients c 
      WHERE c.user_id = ?
    `, [userId]);
    
    // Serviços ativos
    const servicesResult = await executeQuery(`
      SELECT 
        COUNT(s.id) as total_services,
        COUNT(CASE WHEN s.status = 'active' THEN 1 END) as active_services,
        COUNT(CASE WHEN s.status = 'completed' THEN 1 END) as completed_services
      FROM services s 
      WHERE s.user_id = ? ${dateFilter}
    `, [userId]);
    
    // Faturas pendentes
    const invoicesResult = await executeQuery(`
      SELECT 
        COUNT(i.id) as total_invoices,
        COUNT(CASE WHEN i.status = 'pending' THEN 1 END) as pending_invoices,
        COUNT(CASE WHEN i.status = 'overdue' THEN 1 END) as overdue_invoices,
        COALESCE(SUM(CASE WHEN i.status = 'pending' THEN i.amount END), 0) as pending_amount,
        COALESCE(SUM(CASE WHEN i.status = 'overdue' THEN i.amount END), 0) as overdue_amount
      FROM invoices i 
      WHERE i.user_id = ? ${dateFilter}
    `, [userId]);
    
    const revenue = revenueResult.data[0] || {};
    const clients = clientsResult.data[0] || {};
    const services = servicesResult.data[0] || {};
    const invoices = invoicesResult.data[0] || {};
    
    const netProfit = revenue.total_revenue - revenue.total_expenses;
    const profitMargin = revenue.total_revenue > 0 ? 
      (netProfit / revenue.total_revenue) * 100 : 0;
    
    res.json({
      success: true,
      data: {
        totalRevenue: parseFloat(revenue.total_revenue || 0),
        totalExpenses: parseFloat(revenue.total_expenses || 0),
        netProfit: parseFloat(netProfit),
        profitMargin: parseFloat(profitMargin.toFixed(2)),
        clientsCount: parseInt(clients.total_clients || 0),
        activeClients: parseInt(clients.active_clients || 0),
        servicesCount: parseInt(services.total_services || 0),
        activeServices: parseInt(services.active_services || 0),
        completedServices: parseInt(services.completed_services || 0),
        totalInvoices: parseInt(invoices.total_invoices || 0),
        pendingInvoices: parseInt(invoices.pending_invoices || 0),
        overdueInvoices: parseInt(invoices.overdue_invoices || 0),
        pendingAmount: parseFloat(invoices.pending_amount || 0),
        overdueAmount: parseFloat(invoices.overdue_amount || 0),
        period
      }
    });
    
  } catch (error) {
    logger.error('Erro ao buscar dados do dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Dados mensais para gráficos
const getMonthlyData = async (req, res) => {
  try {
    const { months = 12 } = req.query;
    const userId = req.user.id;
    
    const result = await executeQuery(`
      SELECT 
        DATE_FORMAT(t.created_at, '%Y-%m') as month,
        MONTHNAME(t.created_at) as month_name,
        YEAR(t.created_at) as year,
        COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END), 0) as revenue,
        COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) as expenses,
        COUNT(CASE WHEN t.type = 'income' THEN 1 END) as income_transactions,
        COUNT(CASE WHEN t.type = 'expense' THEN 1 END) as expense_transactions
      FROM transactions t
      WHERE t.user_id = ? 
        AND t.created_at >= DATE_SUB(NOW(), INTERVAL ? MONTH)
      GROUP BY DATE_FORMAT(t.created_at, '%Y-%m')
      ORDER BY t.created_at ASC
    `, [userId, parseInt(months)]);
    
    const monthlyData = result.data.map(row => ({
      month: row.month,
      monthName: row.month_name,
      year: row.year,
      revenue: parseFloat(row.revenue),
      expenses: parseFloat(row.expenses),
      profit: parseFloat(row.revenue) - parseFloat(row.expenses),
      incomeTransactions: parseInt(row.income_transactions),
      expenseTransactions: parseInt(row.expense_transactions)
    }));
    
    res.json({
      success: true,
      data: monthlyData
    });
    
  } catch (error) {
    logger.error('Erro ao buscar dados mensais:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Transações recentes
const getRecentTransactions = async (req, res) => {
  try {
    const { limit = 10, offset = 0, type = 'all' } = req.query;
    const userId = req.user.id;
    
    let typeFilter = '';
    if (type !== 'all') {
      typeFilter = 'AND t.type = ?';
    }
    
    const params = [userId];
    if (type !== 'all') {
      params.push(type);
    }
    params.push(parseInt(limit), parseInt(offset));
    
    const result = await executeQuery(`
      SELECT 
        t.id,
        t.description,
        t.amount,
        t.type,
        t.category,
        t.status,
        t.created_at,
        c.name as client_name,
        s.name as service_name
      FROM transactions t
      LEFT JOIN clients c ON t.client_id = c.id
      LEFT JOIN services s ON t.service_id = s.id
      WHERE t.user_id = ? ${typeFilter}
      ORDER BY t.created_at DESC
      LIMIT ? OFFSET ?
    `, params);
    
    const transactions = result.data.map(row => ({
      id: row.id,
      description: row.description,
      amount: parseFloat(row.amount),
      type: row.type,
      category: row.category,
      status: row.status,
      createdAt: row.created_at,
      clientName: row.client_name,
      serviceName: row.service_name
    }));
    
    res.json({
      success: true,
      data: transactions
    });
    
  } catch (error) {
    logger.error('Erro ao buscar transações recentes:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Criar transação
const createTransaction = async (req, res) => {
  try {
    const {
      description,
      amount,
      type,
      category,
      clientId,
      serviceId,
      dueDate,
      status = 'pending'
    } = req.body;
    
    const userId = req.user.id;
    
    // Validações
    if (!description || !amount || !type || !category) {
      return res.status(400).json({
        success: false,
        message: 'Descrição, valor, tipo e categoria são obrigatórios'
      });
    }
    
    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo deve ser "income" ou "expense"'
      });
    }
    
    if (!validateCurrency(amount)) {
      return res.status(400).json({
        success: false,
        message: 'Valor inválido'
      });
    }
    
    if (dueDate && !validateDate(dueDate)) {
      return res.status(400).json({
        success: false,
        message: 'Data de vencimento inválida'
      });
    }
    
    const result = await executeQuery(`
      INSERT INTO transactions 
      (user_id, description, amount, type, category, client_id, service_id, due_date, status, created_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      userId,
      sanitizeInput(description),
      parseFloat(amount),
      type,
      sanitizeInput(category),
      clientId || null,
      serviceId || null,
      dueDate || null,
      status
    ]);
    
    if (!result.success) {
      throw new Error('Erro ao criar transação');
    }
    
    logger.info(`Transação criada: ${description} - ${amount} (${type})`);
    
    res.status(201).json({
      success: true,
      message: 'Transação criada com sucesso',
      data: { id: result.data.insertId }
    });
    
  } catch (error) {
    logger.error('Erro ao criar transação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Atualizar transação
const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      description,
      amount,
      type,
      category,
      clientId,
      serviceId,
      dueDate,
      status
    } = req.body;
    
    const userId = req.user.id;
    
    // Verificar se transação existe e pertence ao usuário
    const existingTransaction = await executeQuery(
      'SELECT id FROM transactions WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    
    if (!existingTransaction.success || existingTransaction.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Transação não encontrada'
      });
    }
    
    // Validações
    if (amount && !validateCurrency(amount)) {
      return res.status(400).json({
        success: false,
        message: 'Valor inválido'
      });
    }
    
    if (type && !['income', 'expense'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo deve ser "income" ou "expense"'
      });
    }
    
    if (dueDate && !validateDate(dueDate)) {
      return res.status(400).json({
        success: false,
        message: 'Data de vencimento inválida'
      });
    }
    
    // Construir query de atualização dinamicamente
    const updates = [];
    const params = [];
    
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(sanitizeInput(description));
    }
    if (amount !== undefined) {
      updates.push('amount = ?');
      params.push(parseFloat(amount));
    }
    if (type !== undefined) {
      updates.push('type = ?');
      params.push(type);
    }
    if (category !== undefined) {
      updates.push('category = ?');
      params.push(sanitizeInput(category));
    }
    if (clientId !== undefined) {
      updates.push('client_id = ?');
      params.push(clientId);
    }
    if (serviceId !== undefined) {
      updates.push('service_id = ?');
      params.push(serviceId);
    }
    if (dueDate !== undefined) {
      updates.push('due_date = ?');
      params.push(dueDate);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      params.push(status);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum campo para atualizar'
      });
    }
    
    updates.push('updated_at = NOW()');
    params.push(id, userId);
    
    const result = await executeQuery(`
      UPDATE transactions 
      SET ${updates.join(', ')} 
      WHERE id = ? AND user_id = ?
    `, params);
    
    if (!result.success) {
      throw new Error('Erro ao atualizar transação');
    }
    
    logger.info(`Transação atualizada: ID ${id}`);
    
    res.json({
      success: true,
      message: 'Transação atualizada com sucesso'
    });
    
  } catch (error) {
    logger.error('Erro ao atualizar transação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Deletar transação
const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Verificar se transação existe e pertence ao usuário
    const existingTransaction = await executeQuery(
      'SELECT id FROM transactions WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    
    if (!existingTransaction.success || existingTransaction.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Transação não encontrada'
      });
    }
    
    const result = await executeQuery(
      'DELETE FROM transactions WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    
    if (!result.success) {
      throw new Error('Erro ao deletar transação');
    }
    
    logger.info(`Transação deletada: ID ${id}`);
    
    res.json({
      success: true,
      message: 'Transação deletada com sucesso'
    });
    
  } catch (error) {
    logger.error('Erro ao deletar transação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Categorias de receita/despesa
const getCategories = async (req, res) => {
  try {
    const { type } = req.query;
    const userId = req.user.id;
    
    let typeFilter = '';
    const params = [userId];
    
    if (type && ['income', 'expense'].includes(type)) {
      typeFilter = 'AND type = ?';
      params.push(type);
    }
    
    const result = await executeQuery(`
      SELECT 
        category,
        type,
        COUNT(*) as transaction_count,
        SUM(amount) as total_amount,
        AVG(amount) as avg_amount
      FROM transactions 
      WHERE user_id = ? ${typeFilter}
      GROUP BY category, type
      ORDER BY total_amount DESC
    `, params);
    
    const categories = result.data.map(row => ({
      category: row.category,
      type: row.type,
      transactionCount: parseInt(row.transaction_count),
      totalAmount: parseFloat(row.total_amount),
      avgAmount: parseFloat(row.avg_amount)
    }));
    
    res.json({
      success: true,
      data: categories
    });
    
  } catch (error) {
    logger.error('Erro ao buscar categorias:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

module.exports = {
  getDashboardData,
  getMonthlyData,
  getRecentTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getCategories
};
