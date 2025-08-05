const { body, param, query, validationResult } = require('express-validator');
const { validateEmail, validateCurrency, validateDate, sanitizeInput } = require('../utils/validators');

// Middleware para processar erros de validação
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }));
    
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      errors: errorMessages
    });
  }
  
  next();
};

// Validações para autenticação
const validateRegister = [
  body('name')
    .notEmpty()
    .withMessage('Nome é obrigatório')
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres')
    .customSanitizer(sanitizeInput),
  
  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail()
    .custom(value => {
      if (!validateEmail(value)) {
        throw new Error('Formato de email inválido');
      }
      return true;
    }),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Senha deve ter pelo menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula, 1 número e 1 caractere especial'),
  
  body('role')
    .optional()
    .isIn(['user', 'manager', 'admin'])
    .withMessage('Role deve ser: user, manager ou admin'),
  
  handleValidationErrors
];

const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Senha é obrigatória'),
  
  handleValidationErrors
];

const validateRefreshToken = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token é obrigatório'),
  
  handleValidationErrors
];

const validateForgotPassword = [
  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  
  handleValidationErrors
];

const validateResetPassword = [
  body('token')
    .notEmpty()
    .withMessage('Token é obrigatório'),
  
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Nova senha deve ter pelo menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Nova senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula, 1 número e 1 caractere especial'),
  
  handleValidationErrors
];

// Validações para transações
const validateCreateTransaction = [
  body('description')
    .notEmpty()
    .withMessage('Descrição é obrigatória')
    .isLength({ min: 3, max: 255 })
    .withMessage('Descrição deve ter entre 3 e 255 caracteres')
    .customSanitizer(sanitizeInput),
  
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Valor deve ser maior que zero')
    .custom(value => {
      if (!validateCurrency(value)) {
        throw new Error('Formato de valor inválido');
      }
      return true;
    }),
  
  body('type')
    .isIn(['income', 'expense'])
    .withMessage('Tipo deve ser "income" ou "expense"'),
  
  body('category')
    .notEmpty()
    .withMessage('Categoria é obrigatória')
    .isLength({ min: 2, max: 50 })
    .withMessage('Categoria deve ter entre 2 e 50 caracteres')
    .customSanitizer(sanitizeInput),
  
  body('clientId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID do cliente deve ser um número inteiro positivo'),
  
  body('serviceId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID do serviço deve ser um número inteiro positivo'),
  
  body('dueDate')
    .optional()
    .custom(value => {
      if (value && !validateDate(value)) {
        throw new Error('Data de vencimento inválida');
      }
      return true;
    }),
  
  body('status')
    .optional()
    .isIn(['pending', 'paid', 'overdue', 'cancelled'])
    .withMessage('Status deve ser: pending, paid, overdue ou cancelled'),
  
  handleValidationErrors
];

const validateUpdateTransaction = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID da transação deve ser um número inteiro positivo'),
  
  body('description')
    .optional()
    .isLength({ min: 3, max: 255 })
    .withMessage('Descrição deve ter entre 3 e 255 caracteres')
    .customSanitizer(sanitizeInput),
  
  body('amount')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Valor deve ser maior que zero')
    .custom(value => {
      if (value !== undefined && !validateCurrency(value)) {
        throw new Error('Formato de valor inválido');
      }
      return true;
    }),
  
  body('type')
    .optional()
    .isIn(['income', 'expense'])
    .withMessage('Tipo deve ser "income" ou "expense"'),
  
  body('category')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Categoria deve ter entre 2 e 50 caracteres')
    .customSanitizer(sanitizeInput),
  
  body('clientId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID do cliente deve ser um número inteiro positivo'),
  
  body('serviceId')
