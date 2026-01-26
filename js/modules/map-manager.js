/**
 * 🗺️ GeoClient SP - Map Manager
 * @module map-manager
 * @version 4.1.1
 * @description Leaflet map management and GeoJSON handling
 */

import { MAP_CONFIG, COLORS, COMPANIES } from './config.js';
import { getEventBus, EVENT_TYPES } from './events.js';
import { text } from './utils.js';

/**
 * MapManager class for Leaflet map control
 */
export class MapManager {
  constructor(elementId = 'map') {
    this.elementId = elementId;
    this.map = null;
    this.cityLayers = {};
    this.markedCities = {};
    this.geoJsonLayer = null;
    this.eventBus = getEventBus();
    
    console.log('🗺️ MapManager initialized');
  }

  /**
   * Initialize Leaflet map
   */
  initMap() {
    if (this.map) {
      console.warn('⚠️ Map already initialized');
      return;
    }

    // ✅ Verificar se container existe
    const container = document.getElementById(this.elementId);
    if (!container) {
      console.error(`❌ Container #${this.elementId} não encontrado!`);
      return;
    }

    // Create map
    this.map = L.map(this.elementId, {
      center: MAP_CONFIG.center,
      zoom: MAP_CONFIG.zoom,
      minZoom: MAP_CONFIG.minZoom,
      maxZoom: MAP_CONFIG.maxZoom,
      maxBounds: MAP_CONFIG.maxBounds,
      zoomControl: false
    });

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(this.map);

    // Add zoom control to bottom right
    L.control.zoom({
      position: 'bottomright'
    }).addTo(this.map);

    console.log('🗺️ Map initialized');
    
    // ⭐ VERIFICAR SE LEAFLET RENDERIZOU (importante para bug-checker)
    setTimeout(() => {
      const leafletContainer = container.querySelector('.leaflet-container');
      if (!leafletContainer) {
        console.error('❌ ERRO: .leaflet-container não foi criado pelo Leaflet!');
        console.error('   Verifique se Leaflet.js foi carregado corretamente');
      } else {
        console.log('✅ Leaflet container renderizado');
      }
    }, 100);
    
    this.eventBus.emit(EVENT_TYPES.MAP_READY);
  }

  /**
   * Load GeoJSON data
   * @param {string} url - GeoJSON file URL
   * @returns {Promise}
   */
  async loadGeoJSON(url) {
    try {
      console.log('📥 Loading GeoJSON from', url);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const geoData = await response.json();
      
      // Create GeoJSON layer
      this.geoJsonLayer = L.geoJSON(geoData, {
        style: (feature) => this.getCityStyle(feature),
        onEachFeature: (feature, layer) => this.setupCityFeature(feature, layer)
      }).addTo(this.map);

      console.log('✅ GeoJSON loaded:', geoData.features.length, 'features');
      
      return geoData;
    } catch (error) {
      console.error('❌ Error loading GeoJSON:', error);
      this.eventBus.emit(EVENT_TYPES.APP_ERROR, { error, context: 'loadGeoJSON' });
      throw error;
    }
  }

  /**
   * Get style for city polygon
   * @param {Object} feature - GeoJSON feature
   * @returns {Object} Leaflet style object
   */
  getCityStyle(feature) {
    const cityName = feature.properties.name;
    const cityData = this.markedCities[cityName];
    
    let fillColor = COLORS.defaultCity;
    let fillOpacity = 0.4;
    
    if (cityData && cityData.companies && cityData.companies.length > 0) {
      // Use first company color
      const company = cityData.companies[0];
      fillColor = COMPANIES[company]?.color || COLORS.gray;
      fillOpacity = 0.7;
    }

    return {
      fillColor,
      weight: 1,
      opacity: 0.6,
      color: '#475569',
      fillOpacity
    };
  }

  /**
   * Setup feature interactions (click, hover, etc)
   * @param {Object} feature - GeoJSON feature
   * @param {Object} layer - Leaflet layer
   */
  setupCityFeature(feature, layer) {
    const cityName = feature.properties.name;
    
    // Store layer reference
    this.cityLayers[cityName] = layer;

    // Hover effect
    layer.on('mouseover', () => {
      layer.setStyle({
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
      });
      
      this.eventBus.emit(EVENT_TYPES.CITY_HOVERED, { city: cityName });
    });

    layer.on('mouseout', () => {
      this.geoJsonLayer.resetStyle(layer);
    });

    // Click handler
    layer.on('click', (e) => {
      L.DomEvent.stopPropagation(e);
      this.eventBus.emit(EVENT_TYPES.CITY_CLICKED, { 
        city: cityName, 
        latlng: e.latlng,
        layer 
      });
    });

    // Bind tooltip
    this.updateCityTooltip(cityName, layer);
  }

  /**
   * Update city tooltip with current data
   * @param {string} cityName - City name
   * @param {Object} layer - Leaflet layer
   */
  updateCityTooltip(cityName, layer = null) {
    if (!layer) {
      layer = this.cityLayers[cityName];
    }
    if (!layer) return;

    const cityData = this.markedCities[cityName];
    let tooltipContent = `<strong>${cityName}</strong>`;

    if (cityData && cityData.companies && cityData.companies.length > 0) {
      tooltipContent += `<br>${cityData.companies.join(', ')}`;
    } else {
      tooltipContent += `<br><em>Disponível</em>`;
    }

    layer.bindTooltip(tooltipContent, {
      sticky: true,
      opacity: 0.9
    });
  }

  /**
   * Update city appearance after marking/unmarking
   * @param {string} cityName - City name
   */
  updateCityStyle(cityName) {
    const layer = this.cityLayers[cityName];
    if (!layer) return;

    const style = this.getCityStyle({ properties: { name: cityName } });
    layer.setStyle(style);
    this.updateCityTooltip(cityName, layer);
  }

  /**
   * Reset layer style to default (used by UIManager)
   * @param {Object} layer - Leaflet layer
   */
  resetLayerStyle(layer) {
    if (this.geoJsonLayer) {
      this.geoJsonLayer.resetStyle(layer);
    }
  }

  /**
   * Update city display (style + tooltip)
   * @param {string} cityName - City name
   */
  updateCityDisplay(cityName) {
    this.updateCityStyle(cityName);
    this.eventBus.emit(EVENT_TYPES.DATA_CHANGED);
  }

  /**
   * Open popup for city (used by UIManager)
   * @param {string} cityName - City name
   * @param {Object} latlng - Leaflet latlng object
   */
  openCityPopup(cityName, latlng) {
    // This is handled by UIManager's popup system
    // Just emit event for coordination
    this.eventBus.emit(EVENT_TYPES.CITY_CLICKED, { 
      city: cityName, 
      latlng,
      layer: this.cityLayers[cityName]
    });
  }

  /**
   * Mark city with company
   * @param {string} cityName - City name
   * @param {string} company - Company name
   */
  markCity(cityName, company) {
    if (!this.markedCities[cityName]) {
      this.markedCities[cityName] = { companies: [] };
    }

    if (!this.markedCities[cityName].companies.includes(company)) {
      this.markedCities[cityName].companies.push(company);
    }

    this.updateCityStyle(cityName);
    this.eventBus.emit(EVENT_TYPES.CITY_MARKED, { city: cityName, company });
  }

  /**
   * Remove company from city
   * @param {string} cityName - City name
   * @param {string} company - Company name
   */
  removeCompanyFromCity(cityName, company) {
    if (!this.markedCities[cityName]) return;

    const companies = this.markedCities[cityName].companies;
    const index = companies.indexOf(company);
    
    if (index !== -1) {
      companies.splice(index, 1);
    }

    // Remove city data if no companies left
    if (companies.length === 0) {
      delete this.markedCities[cityName];
    }

    this.updateCityStyle(cityName);
    this.eventBus.emit(EVENT_TYPES.COMPANY_REMOVED, { city: cityName, company });
  }

  /**
   * Zoom to city
   * @param {string} cityName - City name
   */
  zoomToCity(cityName) {
    const layer = this.cityLayers[cityName];
    if (!layer) {
      console.warn('⚠️ City not found:', cityName);
      return;
    }

    const bounds = layer.getBounds();
    this.map.flyToBounds(bounds, { 
      padding: [50, 50], 
      duration: 1 
    });

    this.eventBus.emit(EVENT_TYPES.MAP_ZOOMED, { city: cityName });
  }

  /**
   * Reset map view to initial state
   */
  resetView() {
    this.map.flyTo(MAP_CONFIG.center, MAP_CONFIG.zoom, {
      duration: 1
    });

    this.eventBus.emit(EVENT_TYPES.MAP_RESET);
  }

  /**
   * Search cities by name
   * @param {string} query - Search query
   * @returns {Array} Matching city names
   */
  searchCities(query) {
    const normalized = text.normalize(query);
    return Object.keys(this.cityLayers).filter(city => 
      text.normalize(city).includes(normalized)
    );
  }

  /**
   * Get all city names
   * @returns {Array} Array of city names
   */
  getAllCityNames() {
    return Object.keys(this.cityLayers);
  }

  /**
   * Get all cities (alias for getAllCityNames for compatibility)
   * @returns {Array} Array of city names
   */
  getAllCities() {
    return this.getAllCityNames();
  }

  /**
   * Get marked cities
   * @returns {Object} Marked cities object
   */
  getMarkedCities() {
    return { ...this.markedCities };
  }

  /**
   * Set marked cities (for restoring from storage)
   * @param {Object} cities - Cities object
   */
  setMarkedCities(cities) {
    this.markedCities = cities;
    
    // Update all city styles
    Object.keys(cities).forEach(cityName => {
      this.updateCityStyle(cityName);
    });

    console.log('🗺️ Marked cities restored:', Object.keys(cities).length);
  }

  /**
   * Get statistics
   * @returns {Object} Map statistics
   */
  getStatistics() {
    return {
      totalCities: Object.keys(this.cityLayers).length,
      markedCities: Object.keys(this.markedCities).length,
      availableCities: Object.keys(this.cityLayers).length - Object.keys(this.markedCities).length
    };
  }
}

export default MapManager;
