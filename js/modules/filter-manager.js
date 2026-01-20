/**
 * 🔍 GeoClient SP - Filter Manager
 * @module filter-manager
 * @version 4.1.0
 * @description Advanced filtering system for cities and data
 */

import { getEventBus, EVENT_TYPES } from './events.js';
import { getStorageManager } from './storage-manager.js';
import { storage, text } from './utils.js';
import { COMPANIES } from './config.js';

/**
 * FilterManager class for advanced filtering
 */
export class FilterManager {
  constructor() {
    this.activeFilters = {};
    this.filterPresets = {};
    this.filterHistory = [];
    this.eventBus = getEventBus();
    this.storageManager = getStorageManager();
    
    // Load saved presets
    this.loadPresets();
    
    console.log('🔍 FilterManager initialized');
  }

  /**
   * Apply filter
   * @param {string} type - Filter type
   * @param {*} value - Filter value
   */
  applyFilter(type, value) {
    this.activeFilters[type] = value;
    
    this.filterHistory.push({
      type,
      value,
      timestamp: new Date().toISOString()
    });

    this.eventBus.emit(EVENT_TYPES.FILTER_APPLIED, { type, value });
    console.log(`🔍 Filter applied: ${type} = ${value}`);
  }

  /**
   * Remove filter
   * @param {string} type - Filter type
   */
  removeFilter(type) {
    delete this.activeFilters[type];
    this.eventBus.emit(EVENT_TYPES.FILTER_REMOVED, { type });
    console.log(`🔍 Filter removed: ${type}`);
  }

  /**
   * Clear all filters
   */
  clearAllFilters() {
    this.activeFilters = {};
    this.eventBus.emit(EVENT_TYPES.FILTERS_CLEARED);
    console.log('🔍 All filters cleared');
  }

  /**
   * Get active filters
   * @returns {Object} Active filters
   */
  getActiveFilters() {
    return { ...this.activeFilters };
  }

  /**
   * Check if any filter is active
   * @returns {boolean}
   */
  hasActiveFilters() {
    return Object.keys(this.activeFilters).length > 0;
  }

  /**
   * Filter cities by company
   * @param {string} companyName - Company name
   * @returns {Array} Filtered city names
   */
  filterByCompany(companyName) {
    const markedCities = this.storageManager.loadMarkedCities();
    
    return Object.entries(markedCities)
      .filter(([_, data]) => 
        data.companies && data.companies.includes(companyName)
      )
      .map(([cityName]) => cityName);
  }

  /**
   * Filter cities by search text
   * @param {string} searchText - Search query
   * @returns {Array} Filtered city names
   */
  filterBySearch(searchText) {
    const markedCities = this.storageManager.loadMarkedCities();
    const normalized = text.normalize(searchText);
    
    return Object.keys(markedCities).filter(cityName => 
      text.normalize(cityName).includes(normalized)
    );
  }

  /**
   * Filter cities by multiple companies (OR logic)
   * @param {Array} companies - Company names
   * @returns {Array} Filtered city names
   */
  filterByMultipleCompanies(companies) {
    const markedCities = this.storageManager.loadMarkedCities();
    
    return Object.entries(markedCities)
      .filter(([_, data]) => 
        data.companies && 
        data.companies.some(company => companies.includes(company))
      )
      .map(([cityName]) => cityName);
  }

  /**
   * Filter cities with multiple companies
   * @returns {Array} Cities with 2+ companies
   */
  filterMultipleCompanyCities() {
    const markedCities = this.storageManager.loadMarkedCities();
    
    return Object.entries(markedCities)
      .filter(([_, data]) => 
        data.companies && data.companies.length > 1
      )
      .map(([cityName]) => cityName);
  }

  /**
   * Filter available cities (no companies assigned)
   * @param {Array} allCities - All city names
   * @returns {Array} Available cities
   */
  filterAvailableCities(allCities) {
    const markedCities = this.storageManager.loadMarkedCities();
    
    return allCities.filter(cityName => 
      !markedCities[cityName] || 
      !markedCities[cityName].companies ||
      markedCities[cityName].companies.length === 0
    );
  }

  /**
   * Apply complex filter
   * @param {Object} filterConfig - Filter configuration
   * @returns {Array} Filtered results
   */
  applyComplexFilter(filterConfig) {
    let results = null;

    // Company filter
    if (filterConfig.company) {
      results = this.filterByCompany(filterConfig.company);
    }

    // Multiple companies filter
    if (filterConfig.companies) {
      const companyResults = this.filterByMultipleCompanies(filterConfig.companies);
      results = results ? 
        results.filter(city => companyResults.includes(city)) : 
        companyResults;
    }

    // Search text filter
    if (filterConfig.search) {
      const searchResults = this.filterBySearch(filterConfig.search);
      results = results ? 
        results.filter(city => searchResults.includes(city)) : 
        searchResults;
    }

    // Multiple companies only
    if (filterConfig.multipleCompaniesOnly) {
      const multiResults = this.filterMultipleCompanyCities();
      results = results ? 
        results.filter(city => multiResults.includes(city)) : 
        multiResults;
    }

    return results || [];
  }

  /**
   * Save filter preset
   * @param {string} name - Preset name
   * @param {Object} filters - Filter configuration
   */
  savePreset(name, filters) {
    this.filterPresets[name] = {
      name,
      filters,
      createdAt: new Date().toISOString()
    };

    this.savePresets();
    console.log(`🔍 Preset saved: ${name}`);
  }

  /**
   * Load filter preset
   * @param {string} name - Preset name
   * @returns {Object|null} Preset filters
   */
  loadPreset(name) {
    const preset = this.filterPresets[name];
    
    if (preset) {
      this.activeFilters = { ...preset.filters };
      this.eventBus.emit(EVENT_TYPES.FILTER_PRESET_LOADED, { name });
      console.log(`🔍 Preset loaded: ${name}`);
      return preset.filters;
    }

    return null;
  }

  /**
   * Delete filter preset
   * @param {string} name - Preset name
   */
  deletePreset(name) {
    delete this.filterPresets[name];
    this.savePresets();
    console.log(`🔍 Preset deleted: ${name}`);
  }

  /**
   * Get all presets
   * @returns {Object} Presets object
   */
  getPresets() {
    return { ...this.filterPresets };
  }

  /**
   * Save presets to storage
   */
  savePresets() {
    storage.set('filter-presets', this.filterPresets);
  }

  /**
   * Load presets from storage
   */
  loadPresets() {
    this.filterPresets = storage.get('filter-presets', {});
  }

  /**
   * Get filter history
   * @param {number} limit - Number of items
   * @returns {Array} Filter history
   */
  getFilterHistory(limit = 10) {
    return this.filterHistory.slice(-limit).reverse();
  }

  /**
   * Clear filter history
   */
  clearHistory() {
    this.filterHistory = [];
    console.log('🔍 Filter history cleared');
  }

  /**
   * Get quick filters
   * @returns {Array} Quick filter configs
   */
  getQuickFilters() {
    return [
      {
        id: 'all',
        label: 'Todas',
        icon: '🌎',
        filter: {}
      },
      {
        id: 'available',
        label: 'Disponíveis',
        icon: '✅',
        filter: { available: true }
      },
      {
        id: 'multiple',
        label: 'Múltiplas Empresas',
        icon: '🏢',
        filter: { multipleCompaniesOnly: true }
      },
      ...Object.values(COMPANIES).map(company => ({
        id: company.name.toLowerCase(),
        label: company.name,
        icon: '🏭',
        color: company.color,
        filter: { company: company.name }
      }))
    ];
  }
}

// Export singleton instance
let filterManagerInstance = null;

export function getFilterManager() {
  if (!filterManagerInstance) {
    filterManagerInstance = new FilterManager();
  }
  return filterManagerInstance;
}

export default {
  FilterManager,
  getFilterManager
};
