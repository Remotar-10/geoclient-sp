/**
 * 🔍 GeoClient SP - Filter Manager
 * @module filter-manager
 * @version 1.1.0
 * @description Manages city and company filtering
 */

import { COMPANIES } from './config.js';
import { getEventBus, EVENT_TYPES } from './events.js';

/**
 * FilterManager Class
 */
export class FilterManager {
  constructor(mapManager) {
    this.mapManager = mapManager;
    this.eventBus = getEventBus();
    this.activeFilters = {
      companies: [],
      hasCompanies: false,
      noCompanies: false
    };
    
    console.log('🔍 FilterManager initialized');
  }

  /**
   * Render filters (public method)
   * 🚧 NOTA: UI de filtros não está implementada na versão ES6/accordion
   * Funcionalidade de filtragem via API ainda disponível
   */
  renderFilters() {
    // ✅ Silenciosamente não renderizar UI (accordion não tem container #quick-filters)
    // A funcionalidade de filtragem programatica ainda funciona via applyFilters()
    console.log('✅ Filters ready (API mode - no UI)');
  }

  /**
   * Initialize filter UI
   * 🚧 Desabilitado - accordion não usa esta UI
   */
  initUI() {
    // ❌ Comentado - não há #quick-filters no accordion
    // const container = document.getElementById('quick-filters');
    // if (!container) {
    //   console.warn('⚠️ Filter container not found');
    //   return;
    // }
    
    // ✅ Funcionalidade mantida, mas UI não renderizada
    console.log('✅ Filter API ready (UI disabled for accordion mode)');
  }

  /**
   * Setup filter event listeners
   */
  setupFilterListeners() {
    const checkboxes = document.querySelectorAll('#quick-filters input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => this.applyFilters());
    });
  }

  /**
   * Apply active filters (API method - pode ser chamado programaticamente)
   */
  applyFilters() {
    const companyCheckboxes = document.querySelectorAll('#quick-filters input[data-filter-type="company"]:checked');
    const statusCheckboxes = document.querySelectorAll('#quick-filters input[data-filter-type="status"]:checked');

    // Update active filters
    this.activeFilters.companies = Array.from(companyCheckboxes).map(cb => cb.value);
    this.activeFilters.hasCompanies = Array.from(statusCheckboxes).some(cb => cb.value === 'has-companies');
    this.activeFilters.noCompanies = Array.from(statusCheckboxes).some(cb => cb.value === 'no-companies');

    // Apply to map
    this.filterMap();

    // Emit event
    this.eventBus.emit(EVENT_TYPES.FILTER_APPLIED, this.activeFilters);
  }

  /**
   * Filter map layers programmatically
   * @param {Object} filters - { companies: [], hasCompanies: bool, noCompanies: bool }
   */
  applyCustomFilters(filters) {
    this.activeFilters = { ...this.activeFilters, ...filters };
    this.filterMap();
    this.eventBus.emit(EVENT_TYPES.FILTER_APPLIED, this.activeFilters);
  }

  /**
   * Filter map layers
   */
  filterMap() {
    if (!this.mapManager.geoJsonLayer) return;

    const markedCities = this.mapManager.getMarkedCities();

    this.mapManager.geoJsonLayer.eachLayer((layer) => {
      const cityName = layer.feature.properties.name;
      const cityData = markedCities[cityName] || { companies: [] };
      const cityCompanies = cityData.companies || [];
      let show = true;

      // Filter by company
      if (this.activeFilters.companies.length > 0) {
        const hasAnySelectedCompany = this.activeFilters.companies.some(comp => 
          cityCompanies.includes(comp)
        );
        if (!hasAnySelectedCompany) {
          show = false;
        }
      }

      // Filter by status
      if (this.activeFilters.hasCompanies && cityCompanies.length === 0) {
        show = false;
      }
      if (this.activeFilters.noCompanies && cityCompanies.length > 0) {
        show = false;
      }

      // Apply visibility
      if (show) {
        layer.setStyle({ opacity: 1, fillOpacity: 0.5 });
      } else {
        layer.setStyle({ opacity: 0.2, fillOpacity: 0.1 });
      }
    });
  }

  /**
   * Clear all filters
   */
  clearFilters() {
    // Uncheck all (if UI exists)
    const checkboxes = document.querySelectorAll('#quick-filters input[type="checkbox"]');
    checkboxes.forEach(cb => cb.checked = false);

    // Reset active filters
    this.activeFilters = {
      companies: [],
      hasCompanies: false,
      noCompanies: false
    };

    // Reset map
    this.filterMap();

    this.eventBus.emit(EVENT_TYPES.FILTER_CLEARED);
  }

  /**
   * Get active filters
   * @returns {Object}
   */
  getActiveFilters() {
    return { ...this.activeFilters };
  }
}

let instance = null;

export function getFilterManager(mapManager) {
  if (!instance && mapManager) {
    instance = new FilterManager(mapManager);
  }
  return instance;
}

export default FilterManager;
