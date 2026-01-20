/**
 * 🛠️ GeoClient SP - Utility Functions
 * @module utils
 * @version 4.1.0
 * @description Pure utility functions for common operations
 */

import { STORAGE_KEYS, TIMING } from './config.js';

// 💾 STORAGE UTILITIES
export const storage = {
  /**
   * Get item from localStorage with JSON parsing
   * @param {string} key - Storage key
   * @param {*} defaultValue - Default value if key doesn't exist
   * @returns {*} Parsed value or default
   */
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`❌ Error reading from localStorage (${key}):`, error);
      return defaultValue;
    }
  },

  /**
   * Set item in localStorage with JSON stringify
   * @param {string} key - Storage key
   * @param {*} value - Value to store
   * @returns {boolean} Success status
   */
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`❌ Error writing to localStorage (${key}):`, error);
      return false;
    }
  },

  /**
   * Remove item from localStorage
   * @param {string} key - Storage key
   */
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`❌ Error removing from localStorage (${key}):`, error);
    }
  },

  /**
   * Clear all app-related storage
   */
  clear() {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  },

  /**
   * Check if key exists in storage
   * @param {string} key - Storage key
   * @returns {boolean}
   */
  has(key) {
    return localStorage.getItem(key) !== null;
  }
};

// 📅 DATE & TIME UTILITIES
export const dateTime = {
  /**
   * Format date to Brazilian format
   * @param {Date|string} date - Date object or ISO string
   * @returns {string} Formatted date (DD/MM/YYYY HH:MM)
   */
  format(date) {
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  /**
   * Get relative time string ("Há 5 minutos")
   * @param {Date|string} date - Date object or ISO string
   * @returns {string} Relative time string
   */
  relative(date) {
    const d = date instanceof Date ? date : new Date(date);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `Há ${diffMins} min${diffMins > 1 ? 's' : ''}`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) {
      const remainMins = diffMins % 60;
      return `Há ${diffHours}h${remainMins > 0 ? ` ${remainMins}min` : ''}`;
    }
    
    const diffDays = Math.floor(diffHours / 24);
    return `Há ${diffDays} dia${diffDays > 1 ? 's' : ''}`;
  },

  /**
   * Get current timestamp in ISO format
   * @returns {string} ISO timestamp
   */
  now() {
    return new Date().toISOString();
  },

  /**
   * Format date for filename (YYYY-MM-DD)
   * @returns {string} Date string for filenames
   */
  filenameDate() {
    return new Date().toISOString().split('T')[0];
  }
};

// 📝 STRING UTILITIES
export const text = {
  /**
   * Normalize text (remove accents, lowercase)
   * @param {string} str - Input string
   * @returns {string} Normalized string
   */
  normalize(str) {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  },

  /**
   * Capitalize first letter
   * @param {string} str - Input string
   * @returns {string} Capitalized string
   */
  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  /**
   * Truncate string with ellipsis
   * @param {string} str - Input string
   * @param {number} maxLength - Maximum length
   * @returns {string} Truncated string
   */
  truncate(str, maxLength = 50) {
    return str.length > maxLength ? str.slice(0, maxLength) + '...' : str;
  },

  /**
   * Escape HTML special characters
   * @param {string} str - Input string
   * @returns {string} Escaped string
   */
  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  /**
   * Pluralize word based on count
   * @param {number} count - Item count
   * @param {string} singular - Singular form
   * @param {string} plural - Plural form
   * @returns {string} Pluralized string
   */
  pluralize(count, singular, plural) {
    return count === 1 ? singular : plural;
  }
};

// 🎨 DOM UTILITIES
export const dom = {
  /**
   * Create element with attributes and children
   * @param {string} tag - HTML tag name
   * @param {Object} attrs - Attributes object
   * @param {Array|string} children - Child elements or text
   * @returns {HTMLElement}
   */
  create(tag, attrs = {}, children = []) {
    const element = document.createElement(tag);
    
    Object.entries(attrs).forEach(([key, value]) => {
      if (key === 'className') {
        element.className = value;
      } else if (key === 'dataset') {
        Object.entries(value).forEach(([dataKey, dataValue]) => {
          element.dataset[dataKey] = dataValue;
        });
      } else if (key.startsWith('on')) {
        const event = key.slice(2).toLowerCase();
        element.addEventListener(event, value);
      } else {
        element.setAttribute(key, value);
      }
    });

    const childArray = Array.isArray(children) ? children : [children];
    childArray.forEach(child => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else if (child instanceof HTMLElement) {
        element.appendChild(child);
      }
    });

    return element;
  },

  /**
   * Query selector wrapper
   * @param {string} selector - CSS selector
   * @param {HTMLElement} parent - Parent element (default: document)
   * @returns {HTMLElement|null}
   */
  $(selector, parent = document) {
    return parent.querySelector(selector);
  },

  /**
   * Query selector all wrapper
   * @param {string} selector - CSS selector
   * @param {HTMLElement} parent - Parent element (default: document)
   * @returns {Array<HTMLElement>}
   */
  $$(selector, parent = document) {
    return Array.from(parent.querySelectorAll(selector));
  },

  /**
   * Wait for element to exist in DOM
   * @param {string} selector - CSS selector
   * @param {number} timeout - Max wait time in ms
   * @returns {Promise<HTMLElement>}
   */
  waitFor(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const element = document.querySelector(selector);
      if (element) return resolve(element);

      const observer = new MutationObserver(() => {
        const element = document.querySelector(selector);
        if (element) {
          observer.disconnect();
          resolve(element);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      setTimeout(() => {
        observer.disconnect();
        reject(new Error(`Element ${selector} not found within ${timeout}ms`));
      }, timeout);
    });
  }
};

// ✅ VALIDATION UTILITIES
export const validate = {
  /**
   * Check if email is valid
   * @param {string} email - Email address
   * @returns {boolean}
   */
  email(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  /**
   * Check if phone is valid (Brazilian format)
   * @param {string} phone - Phone number
   * @returns {boolean}
   */
  phone(phone) {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 11;
  },

  /**
   * Check if string is not empty
   * @param {string} str - Input string
   * @returns {boolean}
   */
  notEmpty(str) {
    return typeof str === 'string' && str.trim().length > 0;
  },

  /**
   * Check if value is a valid number
   * @param {*} value - Value to check
   * @returns {boolean}
   */
  number(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
  }
};

// ⏱️ DEBOUNCE & THROTTLE
export function debounce(func, delay = TIMING.debounceDelay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

export function throttle(func, limit = TIMING.debounceDelay) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// 🎲 MISCELLANEOUS
export const misc = {
  /**
   * Generate unique ID
   * @returns {string} Unique ID
   */
  uniqueId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Deep clone object
   * @param {*} obj - Object to clone
   * @returns {*} Cloned object
   */
  deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  },

  /**
   * Sleep function
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise}
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  /**
   * Copy text to clipboard
   * @param {string} text - Text to copy
   * @returns {Promise<boolean>}
   */
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  }
};

// 📊 ARRAY UTILITIES
export const array = {
  /**
   * Group array by key
   * @param {Array} arr - Input array
   * @param {string} key - Key to group by
   * @returns {Object} Grouped object
   */
  groupBy(arr, key) {
    return arr.reduce((acc, item) => {
      const group = item[key];
      acc[group] = acc[group] || [];
      acc[group].push(item);
      return acc;
    }, {});
  },

  /**
   * Remove duplicates from array
   * @param {Array} arr - Input array
   * @returns {Array} Array without duplicates
   */
  unique(arr) {
    return [...new Set(arr)];
  },

  /**
   * Shuffle array
   * @param {Array} arr - Input array
   * @returns {Array} Shuffled array
   */
  shuffle(arr) {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
};

// 🚀 Export all utilities as default
export default {
  storage,
  dateTime,
  text,
  dom,
  validate,
  debounce,
  throttle,
  misc,
  array
};
