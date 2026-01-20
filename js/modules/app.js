/**
 * 🚀 GeoClient SP - Main Application
 * @module app
 * @version 4.2.0
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
import { getNavigationManager } from './navigation-manager.js';
import { getEventBus, EVENT_TYPES } from './events.js';
import { toast } from './toast.js';

/**
 * Main GeoClient Application Class
 */
export class GeoClientApp {
  constructor(options = {}) {
    this.options = options;
    this.eventBus = getEventBus();
    this.debug = options.debug || false;
    
    // Initialize managers
    this.mapManager = new MapManager(options.mapElementId || 'map');
    this.storageManager = new StorageManager();
    this.activityManager = new ActivityManager();
    this.uiManager = null;
    this.filterManager = null;
    this.dashboardManager = null;
    this.reportsManager = null;
    this.companiesManager = null;
    this.navigationManager = null; // ⭐ NEW
    
    // State
    this.isInitialized = false;
    this.syncInProgress = false;
    
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
      
      // 3. Initialize UI Manager
      this.uiManager = getUIManager(this.mapManager);
      
      // 4. Initialize Companies Manager
      this.companiesManager = getCompaniesManager();
      
      // 5. Initialize Filter Manager
      this.filterManager = getFilterManager(this.mapManager);
      
      // 6. Initialize Dashboard Manager
      this.dashboardManager = getDashboardManager(this.mapManager, this.storageManager);
      
      // 7. Initialize Reports Manager
      this.reportsManager = getReportsManager(this.mapManager, this.storageManager);
      
      // 8. ⭐ Initialize Navigation Manager (NEW)
      this.navigationManager = getNavigationManager(this.mapManager, this.storageManager);
      
      // 9. Setup event listeners FIRST
      this.setupEventListeners();
      
      // 10. Setup city click handlers
      this.setupCityHandlers();
      
      // 11. Restore saved data
      this.restoreData();
      
      // 12. Render all UI components
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
    
    // ⭐ Render navigation components (NEW)
    if (this.navigationManager) {
      this.navigationManager.renderRecentCities();
      this.navigationManager.renderRegionButtons();
      this.navigationManager.renderLayerToggles();
      this.navigationManager.setupShortcuts();
      console.log('✅ Navigation rendered');
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
   * Setup city click handlers
   */
  setupCityHandlers() {
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
    const markedCities = this.storageManager.loadMarkedCities();
    this.mapManager.setMarkedCities(markedCities);
    console.log(`💾 ${Object.keys(markedCities).length} cidades restauradas`);
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    console.log('📡 Setting up event listeners...');
    
    this.eventBus.on(EVENT_TYPES.CITY_CLICKED, (data) => {
      this.handleCityClick(data);
    });

    this.eventBus.on(EVENT_TYPES.DATA_CHANGED, () => {
      if (this.debug) console.log('🔄 DATA_CHANGED event received');
      this.saveData();
      this.updateAllUI();
    });

    this.eventBus.on(EVENT_TYPES.CITY_MARKED, (data) => {
      if (this.debug) console.log('🏛️ CITY_MARKED event received:', data);
      this.activityManager.log('city_marked', data);
      this.saveData();
      this.updateAllUI();
    });

    this.eventBus.on(EVENT_TYPES.COMPANY_ADDED, (data) => {
      console.log('✅ COMPANY_ADDED event received:', data);
      this.syncMapWithStorage(data.city);
      this.activityManager.log('company_added', data);
      this.updateAllUI();
    });

    this.eventBus.on(EVENT_TYPES.COMPANY_REMOVED, (data) => {
      console.log('✅ COMPANY_REMOVED event received:', data);
      this.syncMapWithStorage(data.city);
      this.activityManager.log('company_removed', data);
      this.updateAllUI();
    });
    
    console.log('✅ Event listeners configured');
  }

  /**
   * Sync MapManager with Storage
   * @param {string} cityName
   */
  syncMapWithStorage(cityName = null) {
    if (this.syncInProgress) {
      console.warn('⚠️ Sync already in progress');
      return;
    }
    
    this.syncInProgress = true;
    
    try {
      const markedCities = this.storageManager.loadMarkedCities();
      
      if (this.debug) {
        console.log('🔄 Syncing map with storage:', markedCities);
      }
      
      this.mapManager.setMarkedCities(markedCities);
      
      if (cityName) {
        this.mapManager.updateCityStyle(cityName);
        console.log(`🎨 City style updated: ${cityName}`);
      } else {
        Object.keys(markedCities).forEach(city => {
          this.mapManager.updateCityStyle(city);
        });
        console.log('🎨 All city styles updated');
      }
      
    } catch (error) {
      console.error('❌ Sync error:', error);
    } finally {
      this.syncInProgress = false;
    }
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
    if (this.navigationManager) {
      this.navigationManager.applyLayerStates();
    }
  }

  handleCityClick(data) {
    if (this.debug) {
      console.log('🖱️ City clicked:', data.city);
    }
  }

  saveData() {
    const markedCities = this.mapManager.getMarkedCities();
    this.storageManager.saveMarkedCities(markedCities);
  }

  markCity(cityName, company) {
    this.mapManager.markCity(cityName, company);
    this.saveData();
    toast.success(`${company} adicionada em ${cityName}`);
  }

  removeCompany(cityName, company) {
    this.mapManager.removeCompanyFromCity(cityName, company);
    this.saveData();
    toast.info(`${company} removida de ${cityName}`);
  }

  searchCities(query) {
    return this.mapManager.searchCities(query);
  }

  zoomToCity(cityName) {
    this.mapManager.zoomToCity(cityName);
  }

  resetMapView() {
    this.mapManager.resetView();
    toast.info('Mapa resetado');
  }

  getStatistics() {
    return {
      ...this.mapManager.getStatistics(),
      activities: this.activityManager.getActivities().length,
      lastActivity: this.activityManager.getLastActivity()
    };
  }

  exportJSON() {
    const blob = this.storageManager.exportJSON();
    this.downloadBlob(blob, `geoclient-sp-${new Date().toISOString().split('T')[0]}.json`);
    toast.success('JSON exportado!');
  }

  exportCitiesCSV() {
    const blob = this.storageManager.exportCitiesCSV();
    this.downloadBlob(blob, `geoclient-cities-${new Date().toISOString().split('T')[0]}.csv`);
    toast.success('CSV de cidades exportado!');
  }

  downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  importData() {
    if (this.reportsManager) {
      this.reportsManager.importData();
    }
  }

  clearAllData() {
    if (confirm('⚠️ Tem certeza que deseja limpar TODOS os dados?')) {
      this.storageManager.clearAllData();
      this.mapManager.setMarkedCities({});
      this.activityManager.clearActivities();
      if (this.navigationManager) {
        this.navigationManager.clearRecentCities();
      }
      this.updateAllUI();
      toast.warning('Dados limpos!');
    }
  }

  enableDebug() {
    this.debug = true;
    console.log('🐞 Debug mode enabled');
  }

  disableDebug() {
    this.debug = false;
    console.log('✅ Debug mode disabled');
  }

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
