/**
 * 🚀 GeoClient SP - Main ES6 Entry Point
 * @version 4.1.0
 * @description Master orchestrator for all ES6 modules
 */

// ==================== IMPORTS ====================

// Foundation
import config from './modules/config.js';
import utils from './modules/utils.js';
import { toast } from './modules/toast.js';

// Core
import { EventEmitter, getEventBus, EVENT_TYPES } from './modules/events.js';
import { StorageManager, getStorageManager } from './modules/storage-manager.js';
import { ActivityManager, getActivityManager, activityLog } from './modules/activity-manager.js';
import { MapManager } from './modules/map-manager.js';
import GeoClientApp from './modules/app.js';

// Auxiliaries
import { DashboardManager, getDashboardManager } from './modules/dashboard-manager.js';
import { CompaniesManager, getCompaniesManager } from './modules/companies-manager.js';
import { FilterManager, getFilterManager } from './modules/filter-manager.js';
import { ReportsManager, getReportsManager } from './modules/reports-manager.js';

// ==================== GLOBAL APP INSTANCE ====================

let appInstance = null;

/**
 * Initialize the complete application
 * @param {Object} options - Configuration options
 * @returns {Promise<GeoClientApp>} App instance
 */
export async function initializeApp(options = {}) {
  try {
    console.log('%c🚀 GeoClient SP v4.1.0 - ES6 Modules', 'color: #3b82f6; font-size: 16px; font-weight: bold');
    console.log('%cInitializing...', 'color: #6b7280');

    // Create app instance
    appInstance = new GeoClientApp({
      mapElementId: options.mapElementId || 'map',
      autoSave: options.autoSave !== false,
      ...options
    });

    // Initialize app
    await appInstance.init();

    // Setup global event listeners
    setupGlobalEventListeners();

    console.log('%c✅ GeoClient SP initialized successfully!', 'color: #10b981; font-weight: bold');
    
    return appInstance;

  } catch (error) {
    console.error('%c❌ Failed to initialize GeoClient SP:', 'color: #ef4444; font-weight: bold', error);
    toast.error('Erro ao inicializar aplicação');
    throw error;
  }
}

/**
 * Setup global event listeners for cross-module communication
 */
function setupGlobalEventListeners() {
  const eventBus = getEventBus();

  // Log all important events
  eventBus.on(EVENT_TYPES.APP_ERROR, (data) => {
    console.error('App Error:', data);
    toast.error(data.error?.message || 'Erro na aplicação');
  });

  eventBus.on(EVENT_TYPES.DATA_SAVED, (data) => {
    console.log('✅ Data saved:', data);
  });

  eventBus.on(EVENT_TYPES.CITY_MARKED, (data) => {
    console.log('🏛️ City marked:', data);
  });

  eventBus.on(EVENT_TYPES.REPORT_GENERATED, (data) => {
    console.log('📊 Report generated:', data);
  });
}

/**
 * Get app instance
 * @returns {GeoClientApp|null}
 */
export function getApp() {
  return appInstance;
}

/**
 * Get all managers (for advanced usage)
 * @returns {Object} All manager instances
 */
export function getManagers() {
  return {
    storage: getStorageManager(),
    activity: getActivityManager(),
    dashboard: getDashboardManager(),
    companies: getCompaniesManager(),
    filter: getFilterManager(),
    reports: getReportsManager()
  };
}

// ==================== BACKWARD COMPATIBILITY ====================

/**
 * Expose API globally for legacy code compatibility
 * Use window.GeoClientES6 to access from non-module scripts
 */
if (typeof window !== 'undefined') {
  window.GeoClientES6 = {
    // Main
    initializeApp,
    getApp,
    getManagers,

    // Config
    config,
    VERSION: config.VERSION,
    COMPANIES: config.COMPANIES,

    // Utils
    utils,
    toast,

    // Events
    EventEmitter,
    getEventBus,
    EVENT_TYPES,

    // Classes (for advanced usage)
    classes: {
      GeoClientApp,
      StorageManager,
      ActivityManager,
      MapManager,
      DashboardManager,
      CompaniesManager,
      FilterManager,
      ReportsManager
    },

    // Singletons
    singletons: {
      getStorageManager,
      getActivityManager,
      getDashboardManager,
      getCompaniesManager,
      getFilterManager,
      getReportsManager
    },

    // Activity logging helpers
    activityLog
  };

  console.log('%c📦 GeoClientES6 API exposed globally', 'color: #8b5cf6');
  console.log('Access via window.GeoClientES6');
}

// ==================== AUTO-INITIALIZATION ====================

/**
 * Auto-initialize if DOM is ready and #map element exists
 */
if (typeof document !== 'undefined') {
  const autoInit = () => {
    const mapElement = document.getElementById('map');
    
    if (mapElement) {
      console.log('🔄 Auto-initializing GeoClient SP...');
      
      initializeApp()
        .then(app => {
          console.log('✅ Auto-initialization complete');
          
          // Emit custom event for other scripts
          window.dispatchEvent(new CustomEvent('geoclient:ready', { 
            detail: { app } 
          }));
        })
        .catch(error => {
          console.error('❌ Auto-initialization failed:', error);
        });
    } else {
      console.log('ℹ️ Map element not found, skipping auto-init');
      console.log('Call initializeApp() manually when ready');
    }
  };

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit);
  } else {
    autoInit();
  }
}

// ==================== EXPORTS ====================

export default {
  initializeApp,
  getApp,
  getManagers,
  
  // Re-export everything for convenience
  config,
  utils,
  toast,
  EventEmitter,
  getEventBus,
  EVENT_TYPES,
  
  // Classes
  GeoClientApp,
  StorageManager,
  ActivityManager,
  MapManager,
  DashboardManager,
  CompaniesManager,
  FilterManager,
  ReportsManager,
  
  // Singletons
  getStorageManager,
  getActivityManager,
  getDashboardManager,
  getCompaniesManager,
  getFilterManager,
  getReportsManager,
  
  // Helpers
  activityLog
};
