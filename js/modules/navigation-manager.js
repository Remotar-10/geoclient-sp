/**
 * 🧭 GeoClient SP - Navigation Manager Module
 * @module navigation-manager
 * @version 1.0.0
 * @description Manages navigation, recent cities, regions, and map layers
 */

import { getEventBus, EVENT_TYPES } from './events.js';
import { toast } from './toast.js';

let instance = null;

/**
 * NavigationManager class
 */
export class NavigationManager {
  constructor(mapManager, storageManager) {
    if (instance) return instance;
    
    this.mapManager = mapManager;
    this.storageManager = storageManager;
    this.eventBus = getEventBus();
    
    // State
    this.recentCities = [];
    this.layerStates = {
      occupied: true,
      available: true,
      badges: true,
      labels: false
    };
    
    // Regions
    this.regions = {
      metropolitana: {
        name: 'Região Metropolitana',
        bounds: [[-24.05, -47.1], [-23.2, -45.8]],
        icon: '📍'
      },
      litoral: {
        name: 'Litoral',
        bounds: [[-25.3, -48.7], [-23.3, -44.8]],
        icon: '🏖️'
      },
      interior: {
        name: 'Interior',
        bounds: [[-23.8, -53.2], [-20.0, -47.0]],
        icon: '🌳'
      },
      vale: {
        name: 'Vale do Paraíba',
        bounds: [[-23.6, -46.2], [-22.4, -44.5]],
        icon: '🏔️'
      }
    };
    
    instance = this;
    this.init();
    
    console.log('🧭 NavigationManager initialized');
  }
  
  /**
   * Initialize
   */
  init() {
    this.loadState();
    this.setupEventListeners();
    this.injectStyles();
  }
  
  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Listen to city clicks to add to recent
    this.eventBus.on(EVENT_TYPES.CITY_CLICKED, (data) => {
      if (data.city) {
        this.addRecentCity(data.city);
      }
    });
  }
  
  /**
   * Load state from storage
   */
  loadState() {
    try {
      const recentData = localStorage.getItem('geoclient-recent-cities');
      this.recentCities = recentData ? JSON.parse(recentData) : [];
      
      const layerData = localStorage.getItem('geoclient-layer-states');
      this.layerStates = layerData ? JSON.parse(layerData) : this.layerStates;
    } catch (error) {
      console.error('Error loading navigation state:', error);
    }
  }
  
  /**
   * Save state to storage
   */
  saveState() {
    try {
      localStorage.setItem('geoclient-recent-cities', JSON.stringify(this.recentCities));
      localStorage.setItem('geoclient-layer-states', JSON.stringify(this.layerStates));
    } catch (error) {
      console.error('Error saving navigation state:', error);
    }
  }
  
  // ========================================
  // Recent Cities
  // ========================================
  
  /**
   * Add city to recent history
   * @param {string} cityName
   */
  addRecentCity(cityName) {
    if (!cityName) return;
    
    // Remove duplicates
    this.recentCities = this.recentCities.filter(c => c.name !== cityName);
    
    // Add to beginning
    this.recentCities.unshift({
      name: cityName,
      timestamp: Date.now(),
      companies: this.getCityCompanies(cityName)
    });
    
    // Limit to 5
    this.recentCities = this.recentCities.slice(0, 5);
    
    this.saveState();
    this.renderRecentCities();
    
    console.log(`🌟 Recent city added: ${cityName}`);
  }
  
  /**
   * Get companies for a city
   * @param {string} cityName
   * @returns {Array}
   */
  getCityCompanies(cityName) {
    const markedCities = this.mapManager.getMarkedCities();
    if (!markedCities || !markedCities[cityName]) return [];
    return markedCities[cityName].companies || [];
  }
  
  /**
   * Render recent cities list
   */
  renderRecentCities() {
    const container = document.getElementById('recent-cities-list');
    const countBadge = document.getElementById('recent-count');
    
    if (!container) return;
    
    if (this.recentCities.length === 0) {
      container.innerHTML = '<div class="recent-empty">🔍 Nenhuma cidade visitada ainda</div>';
      if (countBadge) countBadge.textContent = '0';
      return;
    }
    
    if (countBadge) countBadge.textContent = this.recentCities.length;
    
    const html = this.recentCities.map(city => {
      const relativeTime = this.getRelativeTime(city.timestamp);
      const companiesBadges = city.companies.map(company => {
        const color = this.mapManager.getCompanyColor(company);
        return `<span class="recent-city-badge" style="background: ${color};">${company}</span>`;
      }).join('');
      
      return `
        <div class="recent-city-item" data-city="${city.name}">
          <div class="recent-city-name">
            🏛️ ${city.name}
          </div>
          <div class="recent-city-meta">
            ${companiesBadges || '<span style="color: #9ca3af;">Sem empresa</span>'}
            <span>• ${relativeTime}</span>
          </div>
        </div>
      `;
    }).join('');
    
    container.innerHTML = html;
    
    // Add click listeners
    container.querySelectorAll('.recent-city-item').forEach(item => {
      item.addEventListener('click', () => {
        const cityName = item.dataset.city;
        this.navigateToCity(cityName);
      });
    });
  }
  
  /**
   * Navigate to city
   * @param {string} cityName
   */
  navigateToCity(cityName) {
    const layer = this.mapManager.cityLayers[cityName];
    if (!layer) {
      console.warn(`City not found: ${cityName}`);
      return;
    }
    
    const bounds = layer.getBounds();
    this.mapManager.map.flyToBounds(bounds, {
      padding: [50, 50],
      duration: 1
    });
    
    toast.info(`🗺️ ${cityName}`);
  }
  
  /**
   * Get relative time string
   * @param {number} timestamp
   * @returns {string}
   */
  getRelativeTime(timestamp) {
    const now = Date.now();
    const diffMs = now - timestamp;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `Há ${diffMins} min${diffMins > 1 ? 's' : ''}`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Há ${diffHours}h`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `Há ${diffDays} dia${diffDays > 1 ? 's' : ''}`;
  }
  
  // ========================================
  // Regions Navigation
  // ========================================
  
  /**
   * Render region buttons
   */
  renderRegionButtons() {
    const container = document.getElementById('region-buttons');
    if (!container) return;
    
    const html = Object.entries(this.regions).map(([key, region]) => `
      <button class="region-btn" data-region="${key}">
        <span class="region-icon">${region.icon}</span>
        <span class="region-label">${region.name}</span>
      </button>
    `).join('');
    
    container.innerHTML = html;
    
    // Add listeners
    container.querySelectorAll('.region-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const regionKey = btn.dataset.region;
        this.navigateToRegion(regionKey);
      });
    });
  }
  
  /**
   * Navigate to region
   * @param {string} regionKey
   */
  navigateToRegion(regionKey) {
    const region = this.regions[regionKey];
    if (!region) return;
    
    this.mapManager.map.flyToBounds(region.bounds, {
      padding: [50, 50],
      duration: 1.5
    });
    
    toast.info(`🗺️ ${region.name}`);
    console.log(`Navigating to region: ${region.name}`);
  }
  
  // ========================================
  // Layer Toggles
  // ========================================
  
  /**
   * Render layer toggles
   */
  renderLayerToggles() {
    const container = document.getElementById('layer-toggles');
    if (!container) return;
    
    const layers = [
      { key: 'occupied', label: 'Cidades Ocupadas' },
      { key: 'available', label: 'Cidades Disponíveis' },
      { key: 'badges', label: 'Badges Contador' },
      { key: 'labels', label: 'Rótulos das Cidades' }
    ];
    
    const html = layers.map(layer => `
      <div class="layer-toggle ${this.layerStates[layer.key] ? 'active' : ''}" data-layer="${layer.key}">
        <div class="layer-checkbox">
          <span class="layer-checkmark">✓</span>
        </div>
        <span class="layer-label">${layer.label}</span>
      </div>
    `).join('');
    
    container.innerHTML = html;
    
    // Add listeners
    container.querySelectorAll('.layer-toggle').forEach(toggle => {
      toggle.addEventListener('click', () => {
        const layer = toggle.dataset.layer;
        this.toggleLayer(layer);
      });
    });
  }
  
  /**
   * Toggle layer visibility
   * @param {string} layer
   */
  toggleLayer(layer) {
    this.layerStates[layer] = !this.layerStates[layer];
    this.saveState();
    this.applyLayerStates();
    this.renderLayerToggles();
    
    console.log(`Layer "${layer}": ${this.layerStates[layer] ? 'ON' : 'OFF'}`);
  }
  
  /**
   * Apply layer states to map
   */
  applyLayerStates() {
    const markedCities = this.mapManager.getMarkedCities();
    
    Object.entries(this.mapManager.cityLayers).forEach(([cityName, layer]) => {
      const isOccupied = markedCities[cityName] && 
                        markedCities[cityName].companies && 
                        markedCities[cityName].companies.length > 0;
      
      // Control visibility
      if (isOccupied) {
        if (this.layerStates.occupied) {
          layer.addTo(this.mapManager.map);
        } else {
          layer.remove();
        }
      } else {
        if (this.layerStates.available) {
          layer.addTo(this.mapManager.map);
        } else {
          layer.remove();
        }
      }
    });
    
    // Control labels
    if (this.layerStates.labels) {
      this.showCityLabels();
    } else {
      this.hideCityLabels();
    }
  }
  
  /**
   * Show city labels
   */
  showCityLabels() {
    Object.entries(this.mapManager.cityLayers).forEach(([cityName, layer]) => {
      if (!layer._tooltip) {
        layer.bindTooltip(cityName, {
          permanent: true,
          direction: 'center',
          className: 'city-label-tooltip',
          opacity: 0.9
        });
      }
    });
  }
  
  /**
   * Hide city labels
   */
  hideCityLabels() {
    Object.values(this.mapManager.cityLayers).forEach(layer => {
      if (layer._tooltip) {
        layer.unbindTooltip();
      }
    });
  }
  
  // ========================================
  // Shortcuts
  // ========================================
  
  /**
   * Setup shortcut buttons
   */
  setupShortcuts() {
    const shortcuts = {
      'shortcut-reset': () => this.mapManager.resetView(),
      'shortcut-list': () => this.copyMarkedCitiesList()
    };
    
    Object.entries(shortcuts).forEach(([id, handler]) => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener('click', handler);
      }
    });
  }
  
  /**
   * Copy marked cities list to clipboard
   */
  copyMarkedCitiesList() {
    const markedCities = this.mapManager.getMarkedCities();
    const list = Object.keys(markedCities)
      .sort()
      .map(city => `• ${city}`)
      .join('\n');
    
    if (!list) {
      toast.warning('Nenhuma cidade marcada');
      return;
    }
    
    navigator.clipboard.writeText(list)
      .then(() => toast.success('Lista copiada!'))
      .catch(() => toast.error('Erro ao copiar'));
  }
  
  /**
   * Clear recent cities
   */
  clearRecentCities() {
    this.recentCities = [];
    this.saveState();
    this.renderRecentCities();
    toast.info('Histórico limpo');
  }
  
  // ========================================
  // Styles
  // ========================================
  
  /**
   * Inject CSS styles
   */
  injectStyles() {
    if (document.getElementById('navigation-manager-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'navigation-manager-styles';
    style.textContent = `
      .recent-city-item {
        padding: 12px;
        border-radius: 8px;
        background: #f9fafb;
        cursor: pointer;
        transition: all 0.2s;
        margin-bottom: 8px;
      }
      
      .recent-city-item:hover {
        background: #f3f4f6;
        transform: translateX(4px);
      }
      
      .recent-city-name {
        font-weight: 600;
        color: #111827;
        margin-bottom: 4px;
      }
      
      .recent-city-meta {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.75rem;
        color: #6b7280;
      }
      
      .recent-city-badge {
        padding: 2px 6px;
        border-radius: 4px;
        color: white;
        font-size: 0.7rem;
        font-weight: 600;
      }
      
      .recent-empty {
        text-align: center;
        padding: 20px;
        color: #9ca3af;
      }
      
      .region-btn {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        border: none;
        background: #f9fafb;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
        margin-bottom: 8px;
      }
      
      .region-btn:hover {
        background: #f3f4f6;
        transform: translateX(4px);
      }
      
      .region-icon {
        font-size: 1.5rem;
      }
      
      .region-label {
        font-weight: 500;
        color: #374151;
      }
      
      .layer-toggle {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        cursor: pointer;
        border-radius: 8px;
        transition: all 0.2s;
        margin-bottom: 8px;
      }
      
      .layer-toggle:hover {
        background: #f9fafb;
      }
      
      .layer-checkbox {
        width: 20px;
        height: 20px;
        border: 2px solid #d1d5db;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
      }
      
      .layer-toggle.active .layer-checkbox {
        background: #3b82f6;
        border-color: #3b82f6;
      }
      
      .layer-checkmark {
        color: white;
        font-weight: bold;
        display: none;
      }
      
      .layer-toggle.active .layer-checkmark {
        display: block;
      }
      
      .layer-label {
        color: #374151;
        font-size: 0.875rem;
      }
      
      .city-label-tooltip {
        background: rgba(255, 255, 255, 0.95) !important;
        border: 1px solid #e5e7eb !important;
        border-radius: 4px !important;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15) !important;
        font-size: 11px !important;
        font-weight: 600 !important;
        color: #374151 !important;
        padding: 4px 8px !important;
        white-space: nowrap !important;
      }
      
      .city-label-tooltip::before {
        display: none !important;
      }
    `;
    
    document.head.appendChild(style);
  }
}

/**
 * Get singleton instance
 * @param {MapManager} mapManager
 * @param {StorageManager} storageManager
 * @returns {NavigationManager}
 */
export function getNavigationManager(mapManager, storageManager) {
  if (!instance && mapManager && storageManager) {
    instance = new NavigationManager(mapManager, storageManager);
  }
  return instance;
}

export default NavigationManager;
