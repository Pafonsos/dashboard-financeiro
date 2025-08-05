const express = require('express');
const {
  register,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');

const {
  validateRegister,
  validateLogin,
  validateRefreshToken,
  validateForgotPassword,
  validateResetPassword
} = require('../middleware/validation');

const {
  authenticateToken,
  requireAdmin,
  logAction
} = require('../middleware/auth');

const {
  registerLimiter,
  passwordResetLimiter,
  addRandomDelay
} = require('../middleware/security');

const router = express.Router();

// Registro de usuário
router.post('/register', 
  registerLimiter,
  validateRegister,
  addRandomDelay(200, 800),
  logAction('REGISTER'),
  register
);

// Login
router.post('/login',
  validateLogin,
  addRandomDelay(300, 1000),
  logAction('LOGIN'),
  login
);

// Refresh token
router.post('/refresh',
  validateRefreshToken,
  logAction('REFRESH_TOKEN'),
  refreshToken
);

// Logout
router.post('/logout',
  authenticateToken,
  logAction('LOGOUT'),
  logout
);

// Esqueci minha senha
router.post('/forgot-password',
  passwordResetLimiter,
  validateForgotPassword,
  addRandomDelay(500, 1500),
  logAction('FORGOT_PASSWORD'),
  forgotPassword
);

// Reset de senha
router.post('/reset-password',
  passwordResetLimiter,
  validateResetPassword,
  addRandomDelay(500, 1500),
  logAction('RESET_PASSWORD'),
  resetPassword
);

// Verificar token (middleware para frontend)
router.get('/verify',
  authenticateToken,
  (req, res) => {
    res.json({
      success: true,
      data: {
        user: req.user,
        valid: true
      }
    });
  }
);

// Perfil do usuário
router.get('/profile',
  authenticateToken,
  async (req, res) => {
    try {
      const User = require('../models/User');
      const user = await User.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      const stats = await user.getStats();

      res.json({
        success: true,
        data: {
          user: user.toJSON(),
          stats
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
);

// Atualizar perfil
router.put('/profile',
  authenticateToken,
  async (req, res) => {
    try {
      const User = require('../models/User');
      const user = await User.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      const updated = await user.update(req.body);
      
      if (updated) {
        res.json({
          success: true,
          message: 'Perfil atualizado com sucesso',
          data: { user: user.toJSON() }
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Erro ao atualizar perfil'
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  }
);

// Alterar senha
router.put('/change-password',
  authenticateToken,
  async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Senha atual e nova senha são obrigatórias'
        });
      }

      const User = require('../models/User');
      const user = await User.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      const changed = await user.changePassword(currentPassword, newPassword);
      
      if (changed) {
        res.json({
          success: true,
          message: 'Senha alterada com sucesso'
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Erro ao alterar senha'
        });
      }
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  }
);

module.exports = router;
