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
  if (remainder ===
