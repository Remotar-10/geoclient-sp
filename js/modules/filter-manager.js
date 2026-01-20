/**
 * 🔍 GeoClient SP - Filter Manager
 * @module filter-manager
 * @version 1.0.0
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
    
    this.initUI();
    console.log('🔍 FilterManager initialized');
  }

  /**
   * Initialize filter UI
   */
  initUI() {
    const container = document.getElementById('quick-filters');
    if (!container) return;

    // Clear existing
    container.innerHTML = '';

    // Add company filters
    const companiesDiv = document.createElement('div');
    companiesDiv.className = 'filter-group';
    companiesDiv.innerHTML = '<h4>Empresas</h4>';

    Object.values(COMPANIES).forEach(company => {
      const label = document.createElement('label');
      label.className = 'filter-checkbox';
      label.innerHTML = `
        <input type="checkbox" value="${company.name}" data-filter-type="company">
        <span class="filter-label" style="color: ${company.color}">
          <span class="filter-dot" style="background: ${company.color}"></span>
          ${company.displayName}
        </span>
      `;
      companiesDiv.appendChild(label);
    });

    container.appendChild(companiesDiv);

    // Add status filters
    const statusDiv = document.createElement('div');
    statusDiv.className = 'filter-group';
    statusDiv.innerHTML = `
      <h4>Status</h4>
      <label class="filter-checkbox">
        <input type="checkbox" value="has-companies" data-filter-type="status">
        <span class="filter-label">✅ Com empresas</span>
      </label>
      <label class="filter-checkbox">
        <input type="checkbox" value="no-companies" data-filter-type="status">
        <span class="filter-label">❌ Sem empresas</span>
      </label>
    `;

    container.appendChild(statusDiv);

    // Add clear button
    const clearBtn = document.createElement('button');
    clearBtn.className = 'btn btn-secondary btn-sm';
    clearBtn.textContent = '🗑️ Limpar filtros';
    clearBtn.style.marginTop = '10px';
    clearBtn.onclick = () => this.clearFilters();
    container.appendChild(clearBtn);

    // Setup event listeners
    this.setupFilterListeners();
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
   * Apply active filters
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
   * Filter map layers
   */
  filterMap() {
    if (!this.mapManager.geoJsonLayer) return;

    const markedCities = this.mapManager.getMarkedCities();

    this.mapManager.geoJsonLayer.eachLayer((layer) => {
      const cityName = layer.feature.properties.name;
      const cityCompanies = markedCities[cityName] || [];
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
    // Uncheck all
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
