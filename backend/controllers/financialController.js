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
        COUNT(DISTINCT CASE WHEN c.status = 'active' THEN c.id END) as active_
