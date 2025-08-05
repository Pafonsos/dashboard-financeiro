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

const validateTransactionId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID da transação deve ser um número inteiro positivo'),
  
  handleValidationErrors
];

// Validações para clientes
const validateCreateClient = [
  body('name')
    .notEmpty()
    .withMessage('Nome é obrigatório')
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres')
    .customSanitizer(sanitizeInput),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  
  body('phone')
    .optional()
    .isMobilePhone('pt-BR')
    .withMessage('Telefone inválido'),
  
  body('company')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Nome da empresa deve ter no máximo 100 caracteres')
    .customSanitizer(sanitizeInput),
  
  body('address')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Endereço deve ter no máximo 255 caracteres')
    .customSanitizer(sanitizeInput),
  
  body('taxId')
    .optional()
    .isLength({ min: 11, max: 18 })
    .withMessage('CPF/CNPJ deve ter entre 11 e 18 caracteres'),
  
  handleValidationErrors
];

const validateUpdateClient = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID do cliente deve ser um número inteiro positivo'),
  
  body('name')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres')
    .customSanitizer(sanitizeInput),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  
  body('phone')
    .optional()
    .isMobilePhone('pt-BR')
    .withMessage('Telefone inválido'),
  
  body('company')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Nome da empresa deve ter no máximo 100 caracteres')
    .customSanitizer(sanitizeInput),
  
  body('address')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Endereço deve ter no máximo 255 caracteres')
    .customSanitizer(sanitizeInput),
  
  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Status deve ser "active" ou "inactive"'),
  
  handleValidationErrors
];

// Validações para serviços
const validateCreateService = [
  body('name')
    .notEmpty()
    .withMessage('Nome do serviço é obrigatório')
    .isLength({ min: 3, max: 100 })
    .withMessage('Nome deve ter entre 3 e 100 caracteres')
    .customSanitizer(sanitizeInput),
  
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Descrição deve ter no máximo 500 caracteres')
    .customSanitizer(sanitizeInput),
  
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Preço deve ser maior ou igual a zero')
    .custom(value => {
      if (!validateCurrency(value)) {
        throw new Error('Formato de preço inválido');
      }
      return true;
    }),
  
  body('clientId')
    .isInt({ min: 1 })
    .withMessage('ID do cliente é obrigatório e deve ser um número inteiro positivo'),
  
  body('estimatedHours')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Horas estimadas devem ser maior ou igual a zero'),
  
  body('status')
    .optional()
    .isIn(['pending', 'active', 'completed', 'cancelled'])
    .withMessage('Status deve ser: pending, active, completed ou cancelled'),
  
  handleValidationErrors
];

// Validações para relatórios
const validateDateRange = [
  query('startDate')
    .optional()
    .custom(value => {
      if (value && !validateDate(value)) {
        throw new Error('Data inicial inválida');
      }
      return true;
    }),
  
  query('endDate')
    .optional()
    .custom(value => {
      if (value && !validateDate(value)) {
        throw new Error('Data final inválida');
      }
      return true;
    }),
  
  query('startDate')
    .custom((value, { req }) => {
      if (value && req.query.endDate) {
        const startDate = new Date(value);
        const endDate = new Date(req.query.endDate);
        if (startDate > endDate) {
          throw new Error('Data inicial deve ser anterior à data final');
        }
      }
      return true;
    }),
  
  handleValidationErrors
];

const validatePeriod = [
  query('period')
    .optional()
    .isIn(['week', 'month', 'quarter', 'year'])
    .withMessage('Período deve ser: week, month, quarter ou year'),
  
  handleValidationErrors
];

const validatePagination = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit deve ser um número entre 1 e 100'),
  
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset deve ser um número maior ou igual a zero'),
  
  handleValidationErrors
];

// Validação para upload de arquivos
const validateFileUpload = (req, res, next) => {
  if (!req.file && !req.files) {
    return res.status(400).json({
      success: false,
      message: 'Nenhum arquivo foi enviado'
    });
  }
  
  const file = req.file || req.files[0];
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  if (!allowedTypes.includes(file.mimetype)) {
    return res.status(400).json({
      success: false,
      message: 'Tipo de arquivo não permitido. Permitidos: JPG, PNG, PDF, CSV, XLSX'
    });
  }
  
  if (file.size > maxSize) {
    return res.status(400).json({
      success: false,
      message: 'Arquivo muito grande. Tamanho máximo: 5MB'
    });
  }
  
  next();
};

// Validação para filtros
const validateFilters = [
  query('type')
    .optional()
    .isIn(['income', 'expense', 'all'])
    .withMessage('Tipo deve ser: income, expense ou all'),
  
  query('status')
    .optional()
    .isIn(['pending', 'paid', 'overdue', 'cancelled', 'all'])
    .withMessage('Status deve ser: pending, paid, overdue, cancelled ou all'),
  
  query('category')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Categoria deve ter entre 1 e 50 caracteres'),
  
  query('clientId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID do cliente deve ser um número inteiro positivo'),
  
  query('serviceId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID do serviço deve ser um número inteiro positivo'),
  
  handleValidationErrors
];

// Validação customizada para CPF/CNPJ
const validateTaxId = (value) => {
  if (!value) return true; // Campo opcional
  
  // Remove caracteres especiais
  const cleanValue = value.replace(/[^\d]/g, '');
  
  // Verifica CPF (11 dígitos) ou CNPJ (14 dígitos)
  if (cleanValue.length === 11) {
    return validateCPF(cleanValue);
  } else if (cleanValue.length === 14) {
    return validateCNPJ(cleanValue);
  }
  
  return false;
};

const validateCPF = (cpf) => {
  // Algoritmo de validação do CPF
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let remainder = 11 - (sum % 11);
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  remainder = 11 - (sum % 11);
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.charAt(10))) return false;
  
  return true;
};

const validateCNPJ = (cnpj) => {
  // Algoritmo de validação do CNPJ
  if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;
  
  let length = cnpj.length - 2;
  let numbers = cnpj.substring(0, length);
  let digits = cnpj.substring(length);
  let sum = 0;
  let pos = length - 7;
  
  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  let result = sum % 11 < 2 ? 0 : 11 - sum % 11;
  if (result !== parseInt(digits.charAt(0))) return false;
  
  length = length + 1;
  numbers = cnpj.substring(0, length);
  sum = 0;
  pos = length - 7;
  
  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  result = sum % 11 < 2 ? 0 : 11 - sum % 11;
  if (result !== parseInt(digits.charAt(1))) return false;
  
  return true;
};

// Middleware para sanitizar todos os campos de texto do body
const sanitizeBody = (req, res, next) => {
  const sanitizeObject = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = sanitizeInput(obj[key]);
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    }
  };
  
  if (req.body && typeof req.body === 'object') {
    sanitizeObject(req.body);
  }
  
  next();
};

module.exports = {
  handleValidationErrors,
  validateRegister,
  validateLogin,
  validateRefreshToken,
  validateForgotPassword,
  validateResetPassword,
  validateCreateTransaction,
  validateUpdateTransaction,
  validateTransactionId,
  validateCreateClient,
  validateUpdateClient,
  validateCreateService,
  validateDateRange,
  validatePeriod,
  validatePagination,
  validateFileUpload,
  validateFilters,
  validateTaxId,
  sanitizeBody
};
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
