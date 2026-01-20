/**
 * 💾 GeoClient SP - Storage Manager
 * @module storage-manager
 * @version 4.1.0
 * @description Centralized localStorage management with auto-save and validation
 */

import { storage, dateTime, misc } from './utils.js';
import { STORAGE_KEYS, VERSION } from './config.js';
import { getEventBus, EVENT_TYPES } from './events.js';

/**
 * StorageManager class for all data persistence
 */
export class StorageManager {
  constructor(options = {}) {
    this.autoSave = options.autoSave !== false;
    this.autoSaveDelay = options.autoSaveDelay || 500;
    this.eventBus = getEventBus();
    this.pendingSave = null;
    
    console.log('💾 StorageManager initialized');
  }

  // ==================== MARKED CITIES ====================

  /**
   * Save marked cities to localStorage
   * @param {Object} cities - Cities object {cityName: {companies: [], ...}}
   * @returns {boolean} Success status
   */
  saveMarkedCities(cities) {
    try {
      const data = {
        version: VERSION.app,
        timestamp: dateTime.now(),
        cities: cities
      };
      
      const success = storage.set(STORAGE_KEYS.markedCities, data);
      
      if (success) {
        console.log(`💾 ${Object.keys(cities).length} cidades salvas`);
        this.eventBus.emit(EVENT_TYPES.DATA_SAVED, { type: 'cities', count: Object.keys(cities).length });
      }
      
      return success;
    } catch (error) {
      console.error('❌ Erro ao salvar cidades:', error);
      return false;
    }
  }

  /**
   * Load marked cities from localStorage
   * @returns {Object} Cities object or empty object
   */
  loadMarkedCities() {
    try {
      const data = storage.get(STORAGE_KEYS.markedCities);
      
      if (!data) {
        console.log('💾 Nenhuma cidade salva encontrada');
        return {};
      }

      // Handle legacy format (no version/timestamp)
      const cities = data.cities || data;
      
      console.log(`💾 ${Object.keys(cities).length} cidades restauradas`);
      this.eventBus.emit(EVENT_TYPES.DATA_LOADED, { type: 'cities', count: Object.keys(cities).length });
      
      return cities;
    } catch (error) {
      console.error('❌ Erro ao carregar cidades:', error);
      return {};
    }
  }

  // ==================== CLIENTS ====================

  /**
   * Save clients to localStorage
   * @param {Array} clients - Array of client objects
   * @returns {boolean} Success status
   */
  saveClients(clients) {
    try {
      const data = {
        version: VERSION.app,
        timestamp: dateTime.now(),
        clients: clients
      };
      
      const success = storage.set(STORAGE_KEYS.clients, data);
      
      if (success) {
        console.log(`💾 ${clients.length} clientes salvos`);
        this.eventBus.emit(EVENT_TYPES.DATA_SAVED, { type: 'clients', count: clients.length });
      }
      
      return success;
    } catch (error) {
      console.error('❌ Erro ao salvar clientes:', error);
      return false;
    }
  }

  /**
   * Load clients from localStorage
   * @returns {Array} Array of clients or empty array
   */
  loadClients() {
    try {
      const data = storage.get(STORAGE_KEYS.clients);
      
      if (!data) {
        console.log('💾 Nenhum cliente salvo encontrado');
        return [];
      }

      // Handle legacy format
      const clients = data.clients || data;
      
      console.log(`💾 ${clients.length} clientes restaurados`);
      this.eventBus.emit(EVENT_TYPES.DATA_LOADED, { type: 'clients', count: clients.length });
      
      return Array.isArray(clients) ? clients : [];
    } catch (error) {
      console.error('❌ Erro ao carregar clientes:', error);
      return [];
    }
  }

  // ==================== ACTIVITIES ====================

  /**
   * Save activities log
   * @param {Array} activities - Array of activity objects
   * @returns {boolean} Success status
   */
  saveActivities(activities) {
    try {
      const data = {
        version: VERSION.app,
        timestamp: dateTime.now(),
        activities: activities
      };
      
      return storage.set(STORAGE_KEYS.activities, data);
    } catch (error) {
      console.error('❌ Erro ao salvar atividades:', error);
      return false;
    }
  }

  /**
   * Load activities log
   * @returns {Array} Array of activities
   */
  loadActivities() {
    try {
      const data = storage.get(STORAGE_KEYS.activities);
      if (!data) return [];
      
      const activities = data.activities || data;
      return Array.isArray(activities) ? activities : [];
    } catch (error) {
      console.error('❌ Erro ao carregar atividades:', error);
      return [];
    }
  }

  // ==================== SETTINGS ====================

  /**
   * Save user settings
   * @param {Object} settings - Settings object
   * @returns {boolean} Success status
   */
  saveSettings(settings) {
    return storage.set(STORAGE_KEYS.settings, settings);
  }

  /**
   * Load user settings
   * @param {Object} defaults - Default settings
   * @returns {Object} Settings object
   */
  loadSettings(defaults = {}) {
    return storage.get(STORAGE_KEYS.settings, defaults);
  }

  // ==================== RECENT CITIES ====================

  /**
   * Save recent cities list
   * @param {Array} cities - Array of city names
   * @returns {boolean} Success status
   */
  saveRecentCities(cities) {
    return storage.set(STORAGE_KEYS.recentCities, cities);
  }

  /**
   * Load recent cities list
   * @returns {Array} Array of city names
   */
  loadRecentCities() {
    return storage.get(STORAGE_KEYS.recentCities, []);
  }

  // ==================== LAYER SETTINGS ====================

  /**
   * Save layer visibility settings
   * @param {Object} layers - Layer settings object
   * @returns {boolean} Success status
   */
  saveLayerSettings(layers) {
    return storage.set(STORAGE_KEYS.layerSettings, layers);
  }

  /**
   * Load layer visibility settings
   * @param {Object} defaults - Default layer settings
   * @returns {Object} Layer settings
   */
  loadLayerSettings(defaults = {}) {
    return storage.get(STORAGE_KEYS.layerSettings, defaults);
  }

  // ==================== TIMESTAMPS ====================

  /**
   * Save last import timestamp
   */
  saveLastImport() {
    storage.set(STORAGE_KEYS.lastImport, dateTime.now());
  }

  /**
   * Save last export timestamp
   */
  saveLastExport() {
    storage.set(STORAGE_KEYS.lastExport, dateTime.now());
  }

  /**
   * Get last import timestamp
   * @returns {string|null} ISO timestamp or null
   */
  getLastImport() {
    return storage.get(STORAGE_KEYS.lastImport);
  }

  /**
   * Get last export timestamp
   * @returns {string|null} ISO timestamp or null
   */
  getLastExport() {
    return storage.get(STORAGE_KEYS.lastExport);
  }

  // ==================== EXPORT ====================

  /**
   * Export all data as JSON
   * @returns {Object} Complete data export
   */
  exportAllData() {
    return {
      version: VERSION.app,
      exportDate: dateTime.now(),
      markedCities: this.loadMarkedCities(),
      clients: this.loadClients(),
      activities: this.loadActivities(),
      settings: this.loadSettings(),
      recentCities: this.loadRecentCities(),
      layerSettings: this.loadLayerSettings()
    };
  }

  /**
   * Export data as JSON file
   * @returns {Blob} JSON blob for download
   */
  exportJSON() {
    const data = this.exportAllData();
    const json = JSON.stringify(data, null, 2);
    this.saveLastExport();
    
    this.eventBus.emit(EVENT_TYPES.DATA_EXPORTED, { format: 'json', size: json.length });
    
    return new Blob([json], { type: 'application/json' });
  }

  /**
   * Export cities as CSV
   * @returns {Blob} CSV blob for download
   */
  exportCitiesCSV() {
    const cities = this.loadMarkedCities();
    const rows = [];
    
    // Header
    rows.push(['Cidade', 'Empresas', 'Total Empresas']);
    
    // Data
    Object.entries(cities)
      .filter(([_, data]) => data.companies && data.companies.length > 0)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .forEach(([city, data]) => {
        rows.push([
          city,
          data.companies.join(', '),
          data.companies.length
        ]);
      });
    
    const csv = rows.map(row => 
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n');
    
    this.saveLastExport();
    this.eventBus.emit(EVENT_TYPES.DATA_EXPORTED, { format: 'csv-cities', rows: rows.length - 1 });
    
    return new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  }

  /**
   * Export clients as CSV
   * @returns {Blob} CSV blob for download
   */
  exportClientsCSV() {
    const clients = this.loadClients();
    const rows = [];
    
    // Header
    rows.push(['Nome', 'Empresa', 'Cidade', 'Email', 'Telefone']);
    
    // Data
    clients.forEach(client => {
      rows.push([
        client.name || '',
        client.company || '',
        client.city || '',
        client.email || '',
        client.phone || ''
      ]);
    });
    
    const csv = rows.map(row => 
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n');
    
    this.saveLastExport();
    this.eventBus.emit(EVENT_TYPES.DATA_EXPORTED, { format: 'csv-clients', rows: clients.length });
    
    return new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  }

  // ==================== IMPORT ====================

  /**
   * Import data from JSON
   * @param {Object} data - Imported data object
   * @param {boolean} merge - Merge with existing data or replace
   * @returns {boolean} Success status
   */
  importJSON(data, merge = false) {
    try {
      if (merge) {
        // Merge with existing data
        const existingCities = this.loadMarkedCities();
        const existingClients = this.loadClients();
        
        const mergedCities = { ...existingCities, ...(data.markedCities || {}) };
        const mergedClients = [...existingClients, ...(data.clients || [])];
        
        this.saveMarkedCities(mergedCities);
        this.saveClients(mergedClients);
      } else {
        // Replace all data
        if (data.markedCities) this.saveMarkedCities(data.markedCities);
        if (data.clients) this.saveClients(data.clients);
        if (data.settings) this.saveSettings(data.settings);
        if (data.recentCities) this.saveRecentCities(data.recentCities);
        if (data.layerSettings) this.saveLayerSettings(data.layerSettings);
      }
      
      this.saveLastImport();
      this.eventBus.emit(EVENT_TYPES.DATA_IMPORTED, { format: 'json', merge });
      
      return true;
    } catch (error) {
      console.error('❌ Erro ao importar JSON:', error);
      return false;
    }
  }

  // ==================== BACKUP & RESTORE ====================

  /**
   * Create backup of all data
   * @returns {Object} Backup data
   */
  createBackup() {
    const backup = this.exportAllData();
    backup.backupDate = dateTime.now();
    
    console.log('💾 Backup criado');
    return backup;
  }

  /**
   * Restore from backup
   * @param {Object} backup - Backup data
   * @returns {boolean} Success status
   */
  restoreBackup(backup) {
    return this.importJSON(backup, false);
  }

  // ==================== CLEAR ====================

  /**
   * Clear all app data
   */
  clearAllData() {
    Object.values(STORAGE_KEYS).forEach(key => {
      storage.remove(key);
    });
    
    console.log('💾 Todos os dados limpos');
    this.eventBus.emit(EVENT_TYPES.DATA_CHANGED, { action: 'clear' });
  }

  /**
   * Clear specific data type
   * @param {string} type - Data type (cities, clients, activities, etc)
   */
  clearData(type) {
    const key = STORAGE_KEYS[type];
    if (key) {
      storage.remove(key);
      console.log(`💾 ${type} limpo`);
      this.eventBus.emit(EVENT_TYPES.DATA_CHANGED, { action: 'clear', type });
    }
  }

  // ==================== UTILITIES ====================

  /**
   * Get storage usage info
   * @returns {Object} Storage info
   */
  getStorageInfo() {
    const info = {};
    
    Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
      const data = localStorage.getItem(key);
      info[name] = {
        exists: !!data,
        size: data ? data.length : 0,
        sizeKB: data ? (data.length / 1024).toFixed(2) : 0
      };
    });
    
    return info;
  }

  /**
   * Check if storage is available
   * @returns {boolean}
   */
  isStorageAvailable() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }
}

// Export singleton instance
let storageManagerInstance = null;

export function getStorageManager() {
  if (!storageManagerInstance) {
    storageManagerInstance = new StorageManager();
  }
  return storageManagerInstance;
}

export default {
  StorageManager,
  getStorageManager
};
