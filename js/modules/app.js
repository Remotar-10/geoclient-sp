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
import { getFilterManager } from './filter-manager.js';
import { getDashboardManager } from './dashboard-manager.js';
import { getReportsManager } from './reports-manager.js';
import { getCompaniesManager } from './companies-manager.js';
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
    this.filterManager = null;
    this.dashboardManager = null;
    this.reportsManager = null;
    this.companiesManager = null;
    
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
      
      // 4. Initialize Companies Manager
      this.companiesManager = getCompaniesManager();
      
      // 5. Initialize Filter Manager
      this.filterManager = getFilterManager(this.mapManager);
      
      // 6. Initialize Dashboard Manager
      this.dashboardManager = getDashboardManager(this.mapManager, this.storageManager);
      
      // 7. Initialize Reports Manager
      this.reportsManager = getReportsManager(this.mapManager, this.storageManager);
      
      // 8. Setup city click handlers
      this.setupCityHandlers();
      
      // 9. Restore saved data
      this.restoreData();
      
      // 10. Setup event listeners
      this.setupEventListeners();
      
      // 11. Render all UI components
      this.renderAllUI();
      
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
   * Render all UI components
   */
  renderAllUI() {
    console.log('🎨 Rendering UI components...');
    
    // Render filters
    if (this.filterManager) {
      this.filterManager.renderFilters();
      console.log('✅ Filters rendered');
    }
    
    // Render dashboard
    if (this.dashboardManager) {
      this.dashboardManager.renderStats();
      this.dashboardManager.renderCompanyBreakdown();
      console.log('✅ Dashboard rendered');
    }
    
    // Render reports
    if (this.reportsManager) {
      this.reportsManager.renderReports();
      console.log('✅ Reports rendered');
    }
    
    // Render companies list
    if (this.companiesManager) {
      this.renderCompaniesList();
      console.log('✅ Companies list rendered');
    }
    
    // Update cities list
    if (this.uiManager) {
      this.uiManager.updateCitiesList();
      console.log('✅ Cities list updated');
    }
  }

  /**
   * Render companies list in sidebar
   */
  renderCompaniesList() {
    const container = document.getElementById('companies-list');
    if (!container) return;

    const stats = this.companiesManager.getAllCompaniesStats();
    
    const html = `
      <div class="companies-section">
        <p style="color: #6b7280; margin-bottom: 1rem;">Estatísticas por empresa:</p>
        
        ${stats.map(company => `
          <div class="company-card" style="border-left: 4px solid ${company.color}; margin-bottom: 1rem; padding: 1rem; background: #f9fafb; border-radius: 6px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
              <strong>${company.name}</strong>
              <span style="color: #6b7280; font-size: 0.875rem;">${company.totalCities} cidades</span>
            </div>
            
            ${company.totalCities > 0 ? `
              <div style="font-size: 0.75rem; color: #9ca3af;">
                ${company.cities.slice(0, 3).join(', ')}${company.totalCities > 3 ? ` +${company.totalCities - 3} mais` : ''}
              </div>
            ` : `
              <div style="font-size: 0.75rem; color: #9ca3af;">Nenhuma cidade</div>
            `}
          </div>
        `).join('')}
      </div>
    `;
    
    container.innerHTML = html;
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

    // Data changed - auto-save and update all UI
    this.eventBus.on(EVENT_TYPES.DATA_CHANGED, () => {
      this.saveData();
      this.updateAllUI();
    });

    // City marked
    this.eventBus.on(EVENT_TYPES.CITY_MARKED, (data) => {
      this.activityManager.log('city_marked', data);
      this.saveData();
      this.updateAllUI();
    });

    // Company removed
    this.eventBus.on(EVENT_TYPES.COMPANY_REMOVED, (data) => {
      this.activityManager.log('company_removed', data);
      this.saveData();
      this.updateAllUI();
    });

    // Company added
    this.eventBus.on(EVENT_TYPES.COMPANY_ADDED, (data) => {
      this.activityManager.log('company_added', data);
      this.saveData();
      this.updateAllUI();
    });
  }

  /**
   * Update all UI components
   */
  updateAllUI() {
    if (this.uiManager) {
      this.uiManager.updateCitiesList();
    }
    if (this.dashboardManager) {
      this.dashboardManager.update();
    }
    if (this.companiesManager) {
      this.renderCompaniesList();
    }
  }

  /**
   * Handle city click event
   * @param {Object} data - Click event data
   */
  handleCityClick(data) {
    console.log('🖱️ City clicked:', data.city);
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
   * Import data from file
   */
  importData() {
    if (this.reportsManager) {
      this.reportsManager.importData();
    }
  }

  /**
   * Clear all data
   */
  clearAllData() {
    if (confirm('⚠️ Tem certeza que deseja limpar TODOS os dados?')) {
      this.storageManager.clearAllData();
      this.mapManager.setMarkedCities({});
      this.activityManager.clearActivities();
      this.updateAllUI();
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
