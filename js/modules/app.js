/**
 * 🚀 GeoClient SP - Main Application
 * @module app
 * @version 4.1.0
 * @description Main application class orchestrating all modules
 */

import { VERSION, PATHS } from './config.js';
import { MapManager } from './map-manager.js';
import { StorageManager } from './storage-manager.js';
import { ActivityManager } from './activity-manager.js';
import { getUIManager } from './ui-manager.js';
import { getEventBus, EVENT_TYPES } from './events.js';
import { toast } from './toast.js';

/**
 * Main GeoClient Application Class
 */
export class GeoClientApp {
  constructor(options = {}) {
    this.options = options;
    this.eventBus = getEventBus();
    
    // Initialize managers
    this.mapManager = new MapManager(options.mapElementId || 'map');
    this.storageManager = new StorageManager();
    this.activityManager = new ActivityManager();
    this.uiManager = null; // Will be initialized after map loads
    
    // State
    this.isInitialized = false;
    
    console.log(`🚀 GeoClient SP v${VERSION.app} - ES6 Modules initialized`);
  }

  /**
   * Initialize application
   * @returns {Promise}
   */
  async init() {
    if (this.isInitialized) {
      console.warn('⚠️ App already initialized');
      return;
    }

    try {
      console.log('⏳ Initializing GeoClient SP...');
      
      // 1. Initialize map
      this.mapManager.initMap();
      
      // 2. Load GeoJSON
      await this.mapManager.loadGeoJSON(PATHS.geoJson);
      
      // 3. Initialize UI Manager (after map is ready)
      this.uiManager = getUIManager(this.mapManager);
      
      // 4. Setup city click handlers
      this.setupCityHandlers();
      
      // 5. Restore saved data
      this.restoreData();
      
      // 6. Setup event listeners
      this.setupEventListeners();
      
      // 7. Update UI
      this.uiManager.updateCitiesList();
      
      this.isInitialized = true;
      
      this.eventBus.emit(EVENT_TYPES.APP_READY);
      console.log('✅ GeoClient SP initialized successfully!');
      
      toast.success('GeoClient SP pronto!');
      
    } catch (error) {
      console.error('❌ Failed to initialize app:', error);
      this.eventBus.emit(EVENT_TYPES.APP_ERROR, { error, context: 'init' });
      toast.error('Erro ao inicializar aplicação');
      throw error;
    }
  }

  /**
   * Setup city click handlers with UIManager
   */
  setupCityHandlers() {
    // Iterate through all city layers and setup handlers
    this.mapManager.geoJsonLayer.eachLayer((layer) => {
      const feature = layer.feature;
      if (feature && feature.properties && feature.properties.name) {
        this.uiManager.setupCityClickHandler(layer, feature);
      }
    });
    
    console.log('🎯 City click handlers setup complete');
  }

  /**
   * Restore data from localStorage
   */
  restoreData() {
    // Restore marked cities
    const markedCities = this.storageManager.loadMarkedCities();
    this.mapManager.setMarkedCities(markedCities);
    
    console.log(`💾 ${Object.keys(markedCities).length} cidades restauradas`);
  }

  /**
   * Setup event listeners for cross-module communication
   */
  setupEventListeners() {
    // City clicked
    this.eventBus.on(EVENT_TYPES.CITY_CLICKED, (data) => {
      this.handleCityClick(data);
    });

    // Data changed - auto-save
    this.eventBus.on(EVENT_TYPES.DATA_CHANGED, () => {
      this.saveData();
      if (this.uiManager) {
        this.uiManager.updateCitiesList();
      }
    });

    // City marked
    this.eventBus.on(EVENT_TYPES.CITY_MARKED, (data) => {
      this.activityManager.log('city_marked', data);
      this.saveData();
      if (this.uiManager) {
        this.uiManager.updateCitiesList();
      }
    });

    // Company removed
    this.eventBus.on(EVENT_TYPES.COMPANY_REMOVED, (data) => {
      this.activityManager.log('company_removed', data);
      this.saveData();
      if (this.uiManager) {
        this.uiManager.updateCitiesList();
      }
    });
  }

  /**
   * Handle city click event
   * @param {Object} data - Click event data
   */
  handleCityClick(data) {
    console.log('🖱️ City clicked:', data.cityName);
    // UIManager handles the actual popup display
  }

  /**
   * Save all data to localStorage
   */
  saveData() {
    const markedCities = this.mapManager.getMarkedCities();
    this.storageManager.saveMarkedCities(markedCities);
  }

  /**
   * Mark city with company
   * @param {string} cityName - City name
   * @param {string} company - Company name
   */
  markCity(cityName, company) {
    this.mapManager.markCity(cityName, company);
    this.saveData();
    toast.success(`${company} adicionada em ${cityName}`);
  }

  /**
   * Remove company from city
   * @param {string} cityName - City name
   * @param {string} company - Company name
   */
  removeCompany(cityName, company) {
    this.mapManager.removeCompanyFromCity(cityName, company);
    this.saveData();
    toast.info(`${company} removida de ${cityName}`);
  }

  /**
   * Search cities
   * @param {string} query - Search query
   * @returns {Array} Matching cities
   */
  searchCities(query) {
    return this.mapManager.searchCities(query);
  }

  /**
   * Zoom to city
   * @param {string} cityName - City name
   */
  zoomToCity(cityName) {
    this.mapManager.zoomToCity(cityName);
  }

  /**
   * Reset map view
   */
  resetMapView() {
    this.mapManager.resetView();
    toast.info('Mapa resetado');
  }

  /**
   * Get application statistics
   * @returns {Object} Statistics
   */
  getStatistics() {
    return {
      ...this.mapManager.getStatistics(),
      activities: this.activityManager.getActivities().length,
      lastActivity: this.activityManager.getLastActivity()
    };
  }

  /**
   * Export data as JSON
   */
  exportJSON() {
    const blob = this.storageManager.exportJSON();
    this.downloadBlob(blob, `geoclient-sp-${new Date().toISOString().split('T')[0]}.json`);
    toast.success('JSON exportado!');
  }

  /**
   * Export cities as CSV
   */
  exportCitiesCSV() {
    const blob = this.storageManager.exportCitiesCSV();
    this.downloadBlob(blob, `geoclient-cities-${new Date().toISOString().split('T')[0]}.csv`);
    toast.success('CSV de cidades exportado!');
  }

  /**
   * Helper to download blob
   * @param {Blob} blob - Blob to download
   * @param {string} filename - Filename
   */
  downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Clear all data
   */
  clearAllData() {
    if (confirm('⚠️ Tem certeza que deseja limpar TODOS os dados?')) {
      this.storageManager.clearAllData();
      this.mapManager.setMarkedCities({});
      this.activityManager.clearActivities();
      if (this.uiManager) {
        this.uiManager.updateCitiesList();
      }
      toast.warning('Dados limpos!');
    }
  }

  /**
   * Get version info
   * @returns {Object} Version information
   */
  getVersion() {
    return {
      app: VERSION.app,
      css: VERSION.css,
      modules: VERSION.modules,
      buildDate: VERSION.buildDate
    };
  }
}

export default GeoClientApp;
