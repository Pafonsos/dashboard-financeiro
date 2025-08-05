const { executeQuery, executeTransaction } = require('../config/database');
const { hashPassword, comparePassword } = require('../config/auth');
const logger = require('../utils/logger');

class User {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.password = data.password;
    this.role = data.role || 'user';
    this.status = data.status || 'active';
    this.avatar = data.avatar;
    this.phone = data.phone;
    this.company = data.company;
    this.position = data.position;
    this.preferences = data.preferences;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
    this.lastLogin = data.last_login;
  }

  // Métodos estáticos para consultas no banco

  // Buscar usuário por ID
  static async findById(id) {
    try {
      const result = await executeQuery(
        `SELECT id, name, email, role, status, avatar, phone, company, position, 
                preferences, created_at, updated_at, last_login 
         FROM users WHERE id = ? AND status != 'deleted'`,
        [id]
      );

      if (result.success && result.data.length > 0) {
        return new User(result.data[0]);
      }
      return null;
    } catch (error) {
      logger.error('Erro ao buscar usuário por ID:', error);
      throw error;
    }
  }

  // Buscar usuário por email
  static async findByEmail(email) {
    try {
      const result = await executeQuery(
        `SELECT id, name, email, password, role, status, avatar, phone, company, 
                position, preferences, created_at, updated_at, last_login 
         FROM users WHERE email = ? AND status != 'deleted'`,
        [email.toLowerCase()]
      );

      if (result.success && result.data.length > 0) {
        return new User(result.data[0]);
      }
      return null;
    } catch (error) {
      logger.error('Erro ao buscar usuário por email:', error);
      throw error;
    }
  }

  // Criar novo usuário
  static async create(userData) {
    try {
      const { name, email, password, role = 'user', phone, company, position } = userData;

      // Verificar se email já existe
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        throw new Error('Email já cadastrado');
      }

      // Hash da senha
      const hashedPassword = await hashPassword(password);

      const result = await executeQuery(
        `INSERT INTO users (name, email, password, role, phone, company, position, status, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, 'active', NOW())`,
        [name, email.toLowerCase(), hashedPassword, role, phone || null, company || null, position || null]
      );

      if (result.success) {
        return await User.findById(result.data.insertId);
      }
      throw new Error('Erro ao criar usuário');
    } catch (error) {
      logger.error('Erro ao criar usuário:', error);
      throw error;
    }
  }

  // Listar usuários com paginação
  static async findAll(options = {}) {
    try {
      const { limit = 10, offset = 0, role, status = 'active', search } = options;

      let query = `
        SELECT id, name, email, role, status, avatar, phone, company, position, 
               created_at, updated_at, last_login 
        FROM users 
        WHERE status != 'deleted'
      `;
      const params = [];

      if (role) {
        query += ' AND role = ?';
        params.push(role);
      }

      if (status !== 'all') {
        query += ' AND status = ?';
        params.push(status);
      }

      if (search) {
        query += ' AND (name LIKE ? OR email LIKE ? OR company LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(parseInt(limit), parseInt(offset));

      const result = await executeQuery(query, params);

      if (result.success) {
        const users = result.data.map(userData => new User(userData));
        
        // Contar total de registros
        let countQuery = 'SELECT COUNT(*) as total FROM users WHERE status != "deleted"';
        const countParams = [];
        
        if (role) {
          countQuery += ' AND role = ?';
          countParams.push(role);
        }
        
        if (status !== 'all') {
          countQuery += ' AND status = ?';
          countParams.push(status);
        }
        
        if (search) {
          countQuery += ' AND (name LIKE ? OR email LIKE ? OR company LIKE ?)';
          const searchTerm = `%${search}%`;
          countParams.push(searchTerm, searchTerm, searchTerm);
        }
        
        const countResult = await executeQuery(countQuery, countParams);
        const total = countResult.success ? countResult.data[0].total : 0;
        
        return { users, total };
      }
      return { users: [], total: 0 };
    } catch (error) {
      logger.error('Erro ao listar usuários:', error);
      throw error;
    }
  }

  // Atualizar usuário
  async update(updateData) {
    try {
      const allowedFields = ['name', 'phone', 'company', 'position', 'avatar', 'preferences'];
      const updates = [];
      const params = [];

      for (const [key, value] of Object.entries(updateData)) {
        if (allowedFields.includes(key) && value !== undefined) {
          updates.push(`${key} = ?`);
          params.push(value);
        }
      }

      if (updates.length === 0) {
        throw new Error('Nenhum campo válido para atualizar');
      }

      updates.push('updated_at = NOW()');
      params.push(this.id);

      const result = await executeQuery(
        `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
        params
      );

      if (result.success) {
        // Recarregar dados do usuário
        const updatedUser = await User.findById(this.id);
        Object.assign(this, updatedUser);
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Erro ao atualizar usuário:', error);
      throw error;
    }
  }

  // Alterar senha
  async changePassword(currentPassword, newPassword) {
    try {
      // Verificar senha atual
      const isValidPassword = await comparePassword(currentPassword, this.password);
      if (!isValidPassword) {
        throw new Error('Senha atual incorreta');
      }

      // Hash da nova senha
      const hashedNewPassword = await hashPassword(newPassword);

      const result = await executeQuery(
        'UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?',
        [hashedNewPassword, this.id]
      );

      if (result.success) {
        // Invalidar todos os refresh tokens do usuário
        await executeQuery(
          'DELETE FROM refresh_tokens WHERE user_id = ?',
          [this.id]
        );
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Erro ao alterar senha:', error);
      throw error;
    }
  }

  // Alterar status do usuário
  async changeStatus(newStatus) {
    try {
      const validStatuses = ['active', 'inactive', 'suspended'];
      if (!validStatuses.includes(newStatus)) {
        throw new Error('Status inválido');
      }

      const result = await executeQuery(
        'UPDATE users SET status = ?, updated_at = NOW() WHERE id = ?',
        [newStatus, this.id]
      );

      if (result.success) {
        this.status = newStatus;
        
        // Se desativando usuário, invalidar tokens
        if (newStatus !== 'active') {
          await executeQuery(
            'DELETE FROM refresh_tokens WHERE user_id = ?',
            [this.id]
          );
        }
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Erro ao alterar status do usuário:', error);
      throw error;
    }
  }

  // Alterar role do usuário
  async changeRole(newRole) {
    try {
      const validRoles = ['user', 'manager', 'admin'];
      if (!validRoles.includes(newRole)) {
        throw new Error('Role inválido');
      }

      const result = await executeQuery(
        'UPDATE users SET role = ?, updated_at = NOW() WHERE id = ?',
        [newRole, this.id]
      );

      if (result.success) {
        this.role = newRole;
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Erro ao alterar role do usuário:', error);
      throw error;
    }
  }

  // Soft delete
  async delete() {
    try {
      const queries = [
        {
          query: 'UPDATE users SET status = "deleted", updated_at = NOW() WHERE id = ?',
          params: [this.id]
        },
        {
          query: 'DELETE FROM refresh_tokens WHERE user_id = ?',
          params: [this.id]
        },
        {
          query: 'DELETE FROM password_resets WHERE user_id = ?',
          params: [this.id]
        }
      ];

      const result = await executeTransaction(queries);
      
      if (result.success) {
        this.status = 'deleted';
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Erro ao deletar usuário:', error);
      throw error;
    }
  }

  // Atualizar último login
  async updateLastLogin() {
    try {
      const result = await executeQuery(
        'UPDATE users SET last_login = NOW(), updated_at = NOW() WHERE id = ?',
        [this.id]
      );

      if (result.success) {
        this.lastLogin = new Date();
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Erro ao atualizar último login:', error);
      throw error;
    }
  }

  // Buscar estatísticas do usuário
  async getStats() {
    try {
      const statsResult = await executeQuery(`
        SELECT 
          COUNT(DISTINCT t.id) as total_transactions,
          COUNT(DISTINCT c.id) as total_clients,
          COUNT(DISTINCT s.id) as total_services,
          COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount END), 0) as total_revenue,
          COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount END), 0) as total_expenses
        FROM users u
        LEFT JOIN transactions t ON u.id = t.user_id
        LEFT JOIN clients c ON u.id = c.user_id
        LEFT JOIN services s ON u.id = s.user_id
        WHERE u.id = ?
      `, [this.id]);

      if (statsResult.success && statsResult.data.length > 0) {
        const stats = statsResult.data[0];
        return {
          totalTransactions: parseInt(stats.total_transactions || 0),
          totalClients: parseInt(stats.total_clients || 0),
          totalServices: parseInt(stats.total_services || 0),
          totalRevenue: parseFloat(stats.total_revenue || 0),
          totalExpenses: parseFloat(stats.total_expenses || 0),
          netProfit: parseFloat(stats.total_revenue || 0) - parseFloat(stats.total_expenses || 0)
        };
      }
      return null;
    } catch (error) {
      logger.error('Erro ao buscar estatísticas do usuário:', error);
      throw error;
    }
  }

  // Verificar permissão
  hasPermission(requiredRole) {
    const roleHierarchy = {
      'user': 1,
      'manager': 2,
      'admin': 3
    };

    const userLevel = roleHierarchy[this.role] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;

    return userLevel >= requiredLevel;
  }

  // Método para serializar dados seguros (sem senha)
  toJSON() {
    const { password, ...safeUser } = this;
    return safeUser;
  }

  // Método para dados públicos (ainda mais limitado)
  toPublic() {
    return {
      id: this.id,
      name: this.name,
      avatar: this.avatar,
      company: this.company,
      position: this.position
    };
  }

  // Validar se usuário está ativo
  isActive() {
    return this.status === 'active';
  }

  // Verificar se é admin
  isAdmin() {
    return this.role === 'admin';
  }

  // Verificar se é manager ou admin
  isManager() {
    return ['manager', 'admin'].includes(this.role);
  }
}

module.exports = User;
