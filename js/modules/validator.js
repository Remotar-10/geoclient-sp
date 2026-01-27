/**
 * 🔒 Validator Module
 * @version 1.0.0
 * @description Input validation and sanitization utilities
 * 
 * ⚠️ STATUS: MÓDULO CRIADO MAS NÃO INTEGRADO
 * Este módulo está disponível para uso futuro (Fase 3).
 * Não está sendo importado em nenhum lugar ainda.
 */

// ==================== SANITIZATION ====================

/**
 * Remove caracteres perigosos de uma string
 * @param {string} input - String para sanitizar
 * @returns {string} String sanitizada
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()                           // Remove espaços
    .replace(/[<>"'&]/g, '')          // Remove caracteres perigosos
    .replace(/\s+/g, ' ')             // Normaliza espaços múltiplos
    .substring(0, 100);               // Limita tamanho
}

/**
 * Sanitiza nome de cidade (permite acentos e hífens)
 * @param {string} cityName - Nome da cidade
 * @returns {string} Nome sanitizado
 */
export function sanitizeCityName(cityName) {
  if (typeof cityName !== 'string') return '';
  
  return cityName
    .trim()
    .replace(/[<>"'&]/g, '')          // Remove caracteres perigosos
    .replace(/\s+/g, ' ')             // Normaliza espaços
    .substring(0, 100);               // Limita tamanho
}

/**
 * Sanitiza nome de empresa (apenas caracteres alfanuméricos e espaços)
 * @param {string} companyName - Nome da empresa
 * @returns {string} Nome sanitizado
 */
export function sanitizeCompanyName(companyName) {
  if (typeof companyName !== 'string') return '';
  
  return companyName
    .trim()
    .replace(/[^a-zA-Z0-9\s]/g, '')   // Apenas alfanuméricos e espaços
    .replace(/\s+/g, ' ')             // Normaliza espaços
    .toUpperCase()                     // Sempre maiúsculas
    .substring(0, 50);                // Limita tamanho
}

/**
 * Sanitiza email
 * @param {string} email - Email para sanitizar
 * @returns {string} Email sanitizado
 */
export function sanitizeEmail(email) {
  if (typeof email !== 'string') return '';
  
  return email
    .trim()
    .toLowerCase()
    .replace(/[<>"'&]/g, '')
    .substring(0, 100);
}

// ==================== VALIDATION ====================

/**
 * Valida nome de cidade
 * @param {string} cityName - Nome da cidade
 * @returns {boolean} True se válido
 */
export function validateCityName(cityName) {
  if (typeof cityName !== 'string') return false;
  
  // Permite letras (incluindo acentuadas), espaços, apóstrofos e hífens
  const regex = /^[a-zA-Z\u00C0-\u00FF\s'-]{2,100}$/;
  return regex.test(cityName.trim());
}

/**
 * Valida nome de empresa contra lista de empresas conhecidas
 * @param {string} companyName - Nome da empresa
 * @returns {boolean} True se válido
 */
export function validateCompanyName(companyName) {
  const validCompanies = ['CDO', 'SUPORTE', 'WAUX', 'MONTEBELLO', 'HIRATA'];
  return validCompanies.includes(companyName?.toUpperCase?.());
}

/**
 * Valida email básico
 * @param {string} email - Email para validar
 * @returns {boolean} True se válido
 */
export function validateEmail(email) {
  if (typeof email !== 'string') return false;
  
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email.trim());
}

/**
 * Valida número de telefone brasileiro
 * @param {string} phone - Telefone para validar
 * @returns {boolean} True se válido
 */
export function validatePhone(phone) {
  if (typeof phone !== 'string') return false;
  
  // Remove caracteres não numéricos
  const cleaned = phone.replace(/\D/g, '');
  
  // Valida: 10 dígitos (fixo) ou 11 dígitos (celular)
  return cleaned.length === 10 || cleaned.length === 11;
}

/**
 * Valida CNPJ (formato simples)
 * @param {string} cnpj - CNPJ para validar
 * @returns {boolean} True se válido
 */
export function validateCNPJ(cnpj) {
  if (typeof cnpj !== 'string') return false;
  
  // Remove caracteres não numéricos
  const cleaned = cnpj.replace(/\D/g, '');
  
  // Valida: 14 dígitos
  return cleaned.length === 14;
}

/**
 * Valida array de empresas
 * @param {Array} companies - Array de nomes de empresas
 * @returns {boolean} True se todas forem válidas
 */
export function validateCompaniesArray(companies) {
  if (!Array.isArray(companies)) return false;
  if (companies.length === 0) return false;
  
  return companies.every(company => validateCompanyName(company));
}

// ==================== COMBINED VALIDATION ====================

/**
 * Valida e sanitiza dados de cidade completa
 * @param {Object} cityData - Dados da cidade
 * @returns {Object} { valid: boolean, sanitized: Object, errors: Array }
 */
export function validateCityData(cityData) {
  const errors = [];
  const sanitized = {};
  
  // Valida nome
  if (!cityData.name || !validateCityName(cityData.name)) {
    errors.push('Nome de cidade inválido');
  } else {
    sanitized.name = sanitizeCityName(cityData.name);
  }
  
  // Valida empresas
  if (cityData.companies) {
    if (!Array.isArray(cityData.companies)) {
      errors.push('Empresas deve ser um array');
    } else if (!validateCompaniesArray(cityData.companies)) {
      errors.push('Uma ou mais empresas são inválidas');
    } else {
      sanitized.companies = cityData.companies.map(c => sanitizeCompanyName(c));
    }
  }
  
  // Valida timestamp
  if (cityData.timestamp) {
    const ts = new Date(cityData.timestamp);
    if (isNaN(ts.getTime())) {
      errors.push('Timestamp inválido');
    } else {
      sanitized.timestamp = ts.toISOString();
    }
  }
  
  return {
    valid: errors.length === 0,
    sanitized,
    errors
  };
}

/**
 * Valida objeto de cidades marcadas
 * @param {Object} markedCities - Objeto com cidades marcadas
 * @returns {Object} { valid: boolean, validCount: number, errors: Array }
 */
export function validateMarkedCities(markedCities) {
  if (typeof markedCities !== 'object' || markedCities === null) {
    return {
      valid: false,
      validCount: 0,
      errors: ['markedCities deve ser um objeto']
    };
  }
  
  const errors = [];
  let validCount = 0;
  
  Object.entries(markedCities).forEach(([cityName, cityData]) => {
    const validation = validateCityData({ name: cityName, ...cityData });
    
    if (validation.valid) {
      validCount++;
    } else {
      errors.push(`${cityName}: ${validation.errors.join(', ')}`);
    }
  });
  
  return {
    valid: errors.length === 0,
    validCount,
    errors
  };
}

// ==================== XSS PROTECTION ====================

/**
 * Escapa HTML para prevenir XSS
 * @param {string} text - Texto para escapar
 * @returns {string} Texto escapado
 */
export function escapeHTML(text) {
  if (typeof text !== 'string') return '';
  
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };
  
  return text.replace(/[&<>"'\/]/g, char => map[char]);
}

/**
 * Remove tags HTML de uma string
 * @param {string} text - Texto com HTML
 * @returns {string} Texto sem HTML
 */
export function stripHTML(text) {
  if (typeof text !== 'string') return '';
  
  return text.replace(/<[^>]*>/g, '');
}

// ==================== DEFAULT EXPORT ====================

export default {
  // Sanitization
  sanitizeInput,
  sanitizeCityName,
  sanitizeCompanyName,
  sanitizeEmail,
  
  // Validation
  validateCityName,
  validateCompanyName,
  validateEmail,
  validatePhone,
  validateCNPJ,
  validateCompaniesArray,
  
  // Combined
  validateCityData,
  validateMarkedCities,
  
  // XSS Protection
  escapeHTML,
  stripHTML
};
