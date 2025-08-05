const mysql = require('mysql2/promise');
const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT } = process.env;

// Pool de conexões para melhor performance
const pool = mysql.createPool({
  host: DB_HOST || 'localhost',
  user: DB_USER || 'root',
  password: DB_PASSWORD || '',
  database: DB_NAME || 'financial_dashboard',
  port: DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  charset: 'utf8mb4',
  timezone: 'America/Sao_Paulo'
});

// Teste de conexão
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conexão com banco de dados estabelecida');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar com banco de dados:', error.message);
    return false;
  }
};

// Função para executar queries com tratamento de erro
const executeQuery = async (query, params = []) => {
  try {
    const [results] = await pool.execute(query, params);
    return { success: true, data: results };
  } catch (error) {
    console.error('Erro na query:', error.message);
    return { success: false, error: error.message };
  }
};

// Função para transações
const executeTransaction = async (queries) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const results = [];
    for (const { query, params } of queries) {
      const [result] = await connection.execute(query, params);
      results.push(result);
    }
    
    await connection.commit();
    return { success: true, data: results };
  } catch (error) {
    await connection.rollback();
    console.error('Erro na transação:', error.message);
    return { success: false, error: error.message };
  } finally {
    connection.release();
  }
};

module.exports = {
  pool,
  testConnection,
  executeQuery,
  executeTransaction
};
