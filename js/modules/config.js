/**
 * 🎯 GeoClient SP - Centralized Configuration
 * @module config
 * @version 4.1.0
 * @description Central configuration file for ES6 modules migration
 */

// 📌 VERSION CONTROL
export const VERSION = {
  app: '4.1.0',
  css: '4.0.0',
  modules: '1.0.0',
  core: '3.4.0',
  buildDate: '2026-01-20'
};

// 🏢 COMPANIES CONFIGURATION
export const COMPANIES = {
  CDO: {
    name: 'CDO',
    color: '#ef4444',
    displayName: 'CDO',
    priority: 1
  },
  SUPORTE: {
    name: 'SUPORTE',
    color: '#3b82f6',
    displayName: 'Suporte',
    priority: 2
  },
  WAUX: {
    name: 'WAUX',
    color: '#10b981',
    displayName: 'Waux',
    priority: 3
  },
  MONTEBELLO: {
    name: 'MONTEBELLO',
    color: '#f59e0b',
    displayName: 'Montebello',
    priority: 4
  },
  HIRATA: {
    name: 'HIRATA',
    color: '#8b5cf6',
    displayName: 'Hirata',
    priority: 5
  }
};

// 🎨 THEME COLORS
export const COLORS = {
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#8b5cf6',
  gray: '#6b7280',
  available: '#94a3b8',
  defaultCity: '#cbd5e1'
};

// 🗺️ MAP CONFIGURATION
export const MAP_CONFIG = {
  center: [-23.5505, -46.6333], // São Paulo city
  zoom: 7,
  minZoom: 6,
  maxZoom: 12,
  maxBounds: [
    [-25.5, -54], // Southwest
    [-19.5, -44]  // Northeast
  ]
};

// 📊 STATISTICS
export const STATS = {
  totalCities: 645,
  stateCode: 'SP',
  stateName: 'São Paulo'
};

// 💾 STORAGE KEYS
export const STORAGE_KEYS = {
  markedCities: 'geoclient-marked-cities',
  clients: 'geoclient-clients',
  activities: 'geoclient-activities',
  settings: 'geoclient-settings',
  lastImport: 'geoclient-last-import',
  lastExport: 'geoclient-last-export',
  recentCities: 'geoclient-recent-cities',
  layerSettings: 'geoclient-layer-settings'
};

// 🎯 DEFAULT SETTINGS
export const DEFAULT_SETTINGS = {
  layers: {
    occupied: true,
    available: true,
    badges: true,
    labels: false
  },
  theme: 'light',
  autoSave: true,
  showToasts: true,
  animationSpeed: 'normal'
};

// 📋 ACTIVITY TYPES
export const ACTIVITY_TYPES = {
  CITY_MARKED: 'city_marked',
  CITY_REMOVED: 'city_removed',
  COMPANY_ADDED: 'company_added',
  COMPANY_REMOVED: 'company_removed',
  CLIENT_ADDED: 'client_added',
  CLIENT_UPDATED: 'client_updated',
  CLIENT_DELETED: 'client_deleted',
  EXPORT_CSV: 'export_csv',
  EXPORT_JSON: 'export_json',
  EXPORT_PDF: 'export_pdf',
  IMPORT_DATA: 'import_data',
  FILTER_APPLIED: 'filter_applied',
  ERROR: 'error',
  WARNING: 'warning'
};

// 🎨 TOAST TYPES
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// ⏱️ TIMING CONSTANTS
export const TIMING = {
  toastDuration: 3000,
  animationDuration: 250,
  debounceDelay: 300,
  autoSaveDelay: 500
};

// 📁 FILE PATHS
export const PATHS = {
  // ✅ NOW WORKS! municipios-sp.geojson removed from Git LFS
  geoJson: 'data/municipios-sp.geojson',
  clients: 'data/clients.js',
  cssBase: 'css/base.css',
  modules: 'js/modules/'
};

// 🔧 UTILITY FUNCTIONS
export function getCompanyColor(companyName) {
  return COMPANIES[companyName]?.color || COLORS.gray;
}

export function getCompanyDisplayName(companyName) {
  return COMPANIES[companyName]?.displayName || companyName;
}

export function getAllCompanyNames() {
  return Object.keys(COMPANIES);
}

export function isValidCompany(companyName) {
  return COMPANIES.hasOwnProperty(companyName);
}

// 📊 Get version info
export function getVersionInfo() {
  return {
    fullVersion: `v${VERSION.app}`,
    cssVersion: `v${VERSION.css}`,
    modulesVersion: `v${VERSION.modules}`,
    buildDate: VERSION.buildDate,
    displayName: `GeoClient SP v${VERSION.app}`
  };
}

// 🎯 Get all companies sorted by priority
export function getCompaniesSorted() {
  return Object.values(COMPANIES).sort((a, b) => a.priority - b.priority);
}

// 💾 Storage helpers
export function getStorageKey(key) {
  return STORAGE_KEYS[key] || key;
}

// 🌐 Environment detection
export const ENV = {
  isDev: location.hostname === 'localhost' || location.hostname === '127.0.0.1',
  isProd: location.hostname.includes('github.io'),
  isLocal: location.protocol === 'file:'
};

// 📏 Feature flags (for gradual rollout)
export const FEATURES = {
  ES6_MODULES: true,
  DARK_MODE: false, // v4.2.0
  OFFLINE_MODE: false, // v4.3.0
  COLLABORATIVE: false, // v5.0.0
  ANALYTICS: false // v4.4.0
};

// 🚀 Export default config object
export default {
  VERSION,
  COMPANIES,
  COLORS,
  MAP_CONFIG,
  STATS,
  STORAGE_KEYS,
  DEFAULT_SETTINGS,
  ACTIVITY_TYPES,
  TOAST_TYPES,
  TIMING,
  PATHS,
  ENV,
  FEATURES,
  
  // Utility functions
  getCompanyColor,
  getCompanyDisplayName,
  getAllCompanyNames,
  isValidCompany,
  getVersionInfo,
  getCompaniesSorted,
  getStorageKey
};
