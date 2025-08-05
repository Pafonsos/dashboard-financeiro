const validator = require('validator');
const xss = require('xss');

// Validar email
const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  return validator.isEmail(email) && email.length <= 255;
};

// Validar senha forte
const validatePassword = (password) => {
  if (!password || typeof password !== 'string') return false;
  
  // Pelo menos 8 caracteres, 1 maiúscula, 1 minúscula, 1 número, 1 especial
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return strongPasswordRegex.test(password);
};

// Validar telefone brasileiro
const validatePhone = (phone) => {
  if (!phone || typeof phone !== 'string') return false;
  
  // Remove caracteres especiais
  const cleanPhone = phone.replace(/[^\d]/g, '');
  
  // Verifica se tem 10 ou 11 dígitos (com DDD)
  return /^[1-9]{2}[0-9]{8,9}$/.test(cleanPhone);
};

// Validar CPF
const validateCPF = (cpf) => {
  if (!cpf || typeof cpf !== 'string') return false;
  
  // Remove caracteres especiais
  const cleanCPF = cpf.replace(/[^\d]/g, '');
  
  // Verifica se tem 11 dígitos
  if (cleanCPF.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  
  // Validação do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let remainder = 11 - (sum % 11);
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(9))) return false;
  
  // Validação do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  remainder = 11 - (sum % 11);
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(10))) return false;
  
  return true;
};

// Validar CNPJ
const validateCNPJ = (cnpj) => {
  if (!cnpj || typeof cnpj !== 'string') return false;
  
  // Remove caracteres especiais
  const cleanCNPJ = cnpj.replace(/[^\d]/g, '');
  
  // Verifica se tem 14 dígitos
  if (cleanCNPJ.length !== 14) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{13}$/.test(cleanCNPJ)) return false;
  
  // Validação dos dígitos verificadores
  let length = cleanCNPJ.length - 2;
  let numbers = cleanCNPJ.substring(0, length);
  let digits = cleanCNPJ.substring(length);
  let sum = 0;
  let pos = length - 7;
  
  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  let result = sum % 11 < 2 ? 0 : 11 - sum % 11;
  if (result !== parseInt(digits.charAt(0))) return false;
  
  length = length + 1;
  numbers = cleanCNPJ.substring(0, length);
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

// Validar valor monetário
const validateCurrency = (value) => {
  if (value === null || value === undefined) return false;
  
  const numValue = parseFloat(value);
  return !isNaN(numValue) && isFinite(numValue) && numValue >= 0;
};

// Validar data
const validateDate = (date) => {
  if (!date) return false;
  
  // Se é string, tenta converter
  if (typeof date === 'string') {
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime());
  }
  
  // Se é objeto Date
  if (date instanceof Date) {
    return !isNaN(date.getTime());
  }
  
  return false;
};

// Validar período de datas
const validateDateRange = (startDate, endDate) => {
  if (!validateDate(startDate) || !validateDate(endDate)) return false;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return start <= end;
};

// Validar URL
const validateURL = (url) => {
  if (!url || typeof url !== 'string') return false;
  return validator.isURL(url, {
    protocols: ['http', 'https'],
    require_protocol: true
  });
};

// Validar CEP brasileiro
const validateCEP = (cep) => {
  if (!cep || typeof cep !== 'string') return false;
  
  const cleanCEP = cep.replace(/[^\d]/g, '');
  return /^[0-9]{8}$/.test(cleanCEP);
};

// Sanitizar entrada de texto
const sanitizeInput = (input) => {
  if (!input || typeof input !== 'string') return input;
  
  // Remove XSS
  let sanitized = xss(input, {
    whiteList: {}, // Remove todas as tags HTML
    stripIgnoreTag: true,
    stripIgnoreTagBody: ['script']
  });
  
  // Remove caracteres especiais perigosos
  sanitized = sanitized.replace(/[<>'"&]/g, '');
  
  // Trim espaços
  sanitized = sanitized.trim();
  
  return sanitized;
};

// Validar nome (apenas letras, espaços e alguns caracteres especiais)
const validateName = (name) => {
  if (!name || typeof name !== 'string') return false;
  
  // Permite letras, espaços, hífen, apóstrofe e acentos
  const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/;
  return nameRegex.test(name) && name.length >= 2 && name.length <= 100;
};

// Validar número inteiro positivo
const validatePositiveInteger = (value) => {
  const num = parseInt(value);
  return !isNaN(num) && num > 0 && Number.isInteger(num);
};

// Validar número decimal positivo
const validatePositiveNumber = (value) => {
  const num = parseFloat(value);
  return !isNaN(num) && num >= 0 && isFinite(num);
};

// Validar string não vazia
const validateNonEmptyString = (value, minLength = 1, maxLength = 255) => {
  if (!value || typeof value !== 'string') return false;
  const trimmed = value.trim();
  return trimmed.length >= minLength && trimmed.length <= maxLength;
};

// Validar array não vazio
const validateNonEmptyArray = (value) => {
  return Array.isArray(value) && value.length > 0;
};

// Validar formato de imagem
const validateImageFormat = (filename) => {
  if (!filename || typeof filename !== 'string') return false;
  
  const allowedFormats = /\.(jpg|jpeg|png|gif|webp)$/i;
  return allowedFormats.test(filename);
};

// Validar tamanho de arquivo (em bytes)
const validateFileSize = (size, maxSize = 5 * 1024 * 1024) => { // 5MB padrão
  const fileSize = parseInt(size);
  return !isNaN(fileSize) && fileSize > 0 && fileSize <= maxSize;
};

// Validar código de status
const validateStatus = (status, allowedStatuses = ['active', 'inactive']) => {
  return allowedStatuses.includes(status);
};

// Validar role de usuário
const validateUserRole = (role) => {
  const allowedRoles = ['user', 'manager', 'admin'];
  return allowedRoles.includes(role);
};

// Validar tipo de transação
const validateTransactionType = (type) => {
  const allowedTypes = ['income', 'expense'];
  return allowedTypes.includes(type);
};

// Validar período para relatórios
const validateReportPeriod = (period) => {
  const allowedPeriods = ['week', 'month', 'quarter', 'year'];
  return allowedPeriods.includes(period);
};

// Função para validar objeto com esquema
const validateSchema = (data, schema) => {
  const errors = [];
  
  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];
    
    // Verificar se campo é obrigatório
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push(`${field} é obrigatório`);
      continue;
    }
    
    // Se valor está vazio e não é obrigatório, pular validações
    if (!value && !rules.required) continue;
    
    // Aplicar validações específicas
    if (rules.type === 'email' && !validateEmail(value)) {
      errors.push(`${field} deve ser um email válido`);
    }
    
    if (rules.type === 'password' && !validatePassword(value)) {
      errors.push(`${field} deve ter pelo menos 8 caracteres, incluindo maiúscula, minúscula, número e caractere especial`);
    }
    
    if (rules.type === 'phone' && !validatePhone(value)) {
      errors.push(`${field} deve ser um telefone válido`);
    }
    
    if (rules.type === 'cpf' && !validateCPF(value)) {
      errors.push(`${field} deve ser um CPF válido`);
    }
    
    if (rules.type === 'cnpj' && !validateCNPJ(value)) {
      errors.push(`${field} deve ser um CNPJ válido`);
    }
    
    if (rules.type === 'currency' && !validateCurrency(value)) {
      errors.push(`${field} deve ser um valor monetário válido`);
    }
    
    if (rules.type === 'date' && !validateDate(value)) {
      errors.push(`${field} deve ser uma data válida`);
    }
    
    if (rules.type === 'url' && !validateURL(value)) {
      errors.push(`${field} deve ser uma URL válida`);
    }
    
    if (rules.minLength && value.length < rules.minLength) {
      errors.push(`${field} deve ter pelo menos ${rules.minLength} caracteres`);
    }
    
    if (rules.maxLength && value.length > rules.maxLength) {
      errors.push(`${field} deve ter no máximo ${rules.maxLength} caracteres`);
    }
    
    if (rules.min && parseFloat(value) < rules.min) {
      errors.push(`${field} deve ser maior ou igual a ${rules.min}`);
    }
    
    if (rules.max && parseFloat(value) > rules.max) {
      errors.push(`${field} deve ser menor ou igual a ${rules.max}`);
    }
    
    if (rules.enum && !rules.enum.includes(value)) {
      errors.push(`${field} deve ser um dos valores: ${rules.enum.join(', ')}`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Função para limpar e validar dados de entrada
const cleanAndValidate = (data, schema) => {
  const cleaned = {};
  
  for (const [field, rules] of Object.entries(schema)) {
    let value = data[field];
    
    // Sanitizar strings
    if (typeof value === 'string' && rules.sanitize !== false) {
      value = sanitizeInput(value);
    }
    
    // Converter tipos
    if (rules.type === 'integer' && value) {
      value = parseInt(value);
    } else if (rules.type === 'float' && value) {
      value = parseFloat(value);
    } else if (rules.type === 'boolean' && value !== undefined) {
      value = Boolean(value);
    }
    
    cleaned[field] = value;
  }
  
  const validation = validateSchema(cleaned, schema);
  
  return {
    data: cleaned,
    ...validation
  };
};

module.exports = {
  validateEmail,
  validatePassword,
  validatePhone,
  validateCPF,
  validateCNPJ,
  validateCurrency,
  validateDate,
  validateDateRange,
  validateURL,
  validateCEP,
  validateName,
  validatePositiveInteger,
  validatePositiveNumber,
  validateNonEmptyString,
  validateNonEmptyArray,
  validateImageFormat,
  validateFileSize,
  validateStatus,
  validateUserRole,
  validateTransactionType,
  validateReportPeriod,
  validateSchema,
  sanitizeInput,
  cleanAndValidate
};
