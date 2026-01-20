/**
 * 🔍 GeoClient SP - Search Manager Module
 * @module search-manager
 * @version 1.0.0
 * @description Handles city search functionality with autocomplete
 */

import { toast } from './toast.js';

let instance = null;

/**
 * SearchManager class
 */
export class SearchManager {
  constructor(mapManager, storageManager) {
    if (instance) return instance;
    
    this.mapManager = mapManager;
    this.storageManager = storageManager;
    this.searchInput = null;
    this.resultsContainer = null;
    this.selectedIndex = -1;
    this.currentResults = [];
    
    instance = this;
    this.init();
    
    console.log('🔍 SearchManager initialized');
  }
  
  /**
   * Initialize search
   */
  init() {
    this.searchInput = document.getElementById('city-search');
    this.resultsContainer = document.getElementById('search-results');
    
    if (!this.searchInput) {
      console.warn('⚠️ Search input not found');
      return;
    }
    
    this.setupEventListeners();
    this.injectStyles();
  }
  
  /**
   * Setup event listeners
   */
  setupEventListeners() {
    if (!this.searchInput) return;
    
    // Input event
    this.searchInput.addEventListener('input', (e) => {
      this.handleSearch(e.target.value);
    });
    
    // Keyboard navigation
    this.searchInput.addEventListener('keydown', (e) => {
      this.handleKeyboard(e);
    });
    
    // Focus/blur
    this.searchInput.addEventListener('focus', () => {
      if (this.currentResults.length > 0) {
        this.showResults();
      }
    });
    
    this.searchInput.addEventListener('blur', () => {
      setTimeout(() => this.hideResults(), 200);
    });
    
    // Click outside
    document.addEventListener('click', (e) => {
      if (!this.searchInput.contains(e.target) && 
          !this.resultsContainer?.contains(e.target)) {
        this.hideResults();
      }
    });
  }
  
  /**
   * Handle search input
   * @param {string} query
   */
  handleSearch(query) {
    const trimmed = query.trim();
    
    if (trimmed.length < 2) {
      this.hideResults();
      this.currentResults = [];
      this.selectedIndex = -1;
      return;
    }
    
    // Search cities
    this.currentResults = this.searchCities(trimmed);
    this.renderResults();
  }
  
  /**
   * Search cities
   * @param {string} query
   * @returns {Array}
   */
  searchCities(query) {
    if (!this.mapManager.cityLayers) return [];
    
    const normalizedQuery = this.normalizeString(query);
    const allCities = Object.keys(this.mapManager.cityLayers);
    
    // Search with normalized strings
    const matches = allCities
      .filter(city => {
        const normalizedCity = this.normalizeString(city);
        return normalizedCity.includes(normalizedQuery);
      })
      .sort((a, b) => {
        // Prioritize matches at start of name
        const aNorm = this.normalizeString(a);
        const bNorm = this.normalizeString(b);
        const aStarts = aNorm.startsWith(normalizedQuery);
        const bStarts = bNorm.startsWith(normalizedQuery);
        
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return a.localeCompare(b);
      })
      .slice(0, 8);
    
    return matches;
  }
  
  /**
   * Normalize string for search
   * @param {string} str
   * @returns {string}
   */
  normalizeString(str) {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, '');
  }
  
  /**
   * Render search results
   */
  renderResults() {
    if (!this.resultsContainer) {
      // Create results container if it doesn't exist
      this.resultsContainer = document.createElement('div');
      this.resultsContainer.id = 'search-results';
      this.resultsContainer.className = 'search-results';
      this.searchInput.parentNode.appendChild(this.resultsContainer);
    }
    
    if (this.currentResults.length === 0) {
      this.resultsContainer.innerHTML = `
        <div class="search-no-results">
          🔍 Nenhuma cidade encontrada
        </div>
      `;
      this.showResults();
      return;
    }
    
    const markedCities = this.storageManager.loadMarkedCities();
    
    const html = this.currentResults.map((cityName, index) => {
      const cityData = markedCities[cityName];
      const companies = cityData?.companies || [];
      
      const companiesBadges = companies.map(company => {
        const color = this.mapManager.getCompanyColor(company);
        return `<span class="search-company-badge" style="background: ${color};">${company}</span>`;
      }).join('');
      
      return `
        <div class="search-result-item ${index === this.selectedIndex ? 'selected' : ''}" 
             data-city="${cityName}"
             data-index="${index}">
          <div class="search-result-name">🏛️ ${cityName}</div>
          ${companies.length > 0 ? `
            <div class="search-result-companies">
              ${companiesBadges}
            </div>
          ` : ''}
        </div>
      `;
    }).join('');
    
    this.resultsContainer.innerHTML = html;
    
    // Add click listeners
    this.resultsContainer.querySelectorAll('.search-result-item').forEach(item => {
      item.addEventListener('click', () => {
        const cityName = item.dataset.city;
        this.selectCity(cityName);
      });
    });
    
    this.showResults();
  }
  
  /**
   * Handle keyboard navigation
   * @param {KeyboardEvent} e
   */
  handleKeyboard(e) {
    if (this.currentResults.length === 0) return;
    
    switch(e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this.selectedIndex = Math.min(
          this.selectedIndex + 1,
          this.currentResults.length - 1
        );
        this.updateSelectedResult();
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        this.selectedIndex = Math.max(this.selectedIndex - 1, -1);
        this.updateSelectedResult();
        break;
        
      case 'Enter':
        e.preventDefault();
        if (this.selectedIndex >= 0 && this.currentResults[this.selectedIndex]) {
          this.selectCity(this.currentResults[this.selectedIndex]);
        }
        break;
        
      case 'Escape':
        e.preventDefault();
        this.clear();
        break;
    }
  }
  
  /**
   * Update selected result visually
   */
  updateSelectedResult() {
    if (!this.resultsContainer) return;
    
    const items = this.resultsContainer.querySelectorAll('.search-result-item');
    items.forEach((item, index) => {
      if (index === this.selectedIndex) {
        item.classList.add('selected');
        item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      } else {
        item.classList.remove('selected');
      }
    });
  }
  
  /**
   * Select city from search
   * @param {string} cityName
   */
  selectCity(cityName) {
    const layer = this.mapManager.cityLayers[cityName];
    if (!layer) {
      console.warn(`City not found: ${cityName}`);
      return;
    }
    
    // Zoom to city
    const bounds = layer.getBounds();
    this.mapManager.map.flyToBounds(bounds, {
      padding: [50, 50],
      duration: 1
    });
    
    // Open popup
    setTimeout(() => {
      layer.fire('click');
    }, 500);
    
    // Clear search
    this.clear();
    
    toast.info(`🗺️ ${cityName}`);
    console.log(`🔍 Search selected: ${cityName}`);
  }
  
  /**
   * Show results container
   */
  showResults() {
    if (this.resultsContainer) {
      this.resultsContainer.style.display = 'block';
    }
  }
  
  /**
   * Hide results container
   */
  hideResults() {
    if (this.resultsContainer) {
      this.resultsContainer.style.display = 'none';
    }
  }
  
  /**
   * Clear search
   */
  clear() {
    if (this.searchInput) {
      this.searchInput.value = '';
    }
    this.currentResults = [];
    this.selectedIndex = -1;
    this.hideResults();
  }
  
  /**
   * Inject CSS styles
   */
  injectStyles() {
    if (document.getElementById('search-manager-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'search-manager-styles';
    style.textContent = `
      .search-box {
        position: relative;
        margin-bottom: 1.5rem;
      }
      
      .search-input {
        width: 100%;
        padding: 12px 16px;
        border: 2px solid #e5e7eb;
        border-radius: 8px;
        font-size: 14px;
        transition: all 0.2s;
      }
      
      .search-input:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }
      
      .search-results {
        position: absolute;
        top: calc(100% + 8px);
        left: 0;
        right: 0;
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        max-height: 300px;
        overflow-y: auto;
        z-index: 1000;
        display: none;
      }
      
      .search-result-item {
        padding: 12px 16px;
        cursor: pointer;
        transition: all 0.2s;
        border-bottom: 1px solid #f3f4f6;
      }
      
      .search-result-item:last-child {
        border-bottom: none;
      }
      
      .search-result-item:hover,
      .search-result-item.selected {
        background: #f9fafb;
      }
      
      .search-result-name {
        font-weight: 600;
        color: #111827;
        margin-bottom: 4px;
      }
      
      .search-result-companies {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
      }
      
      .search-company-badge {
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 0.7rem;
        font-weight: 600;
        color: white;
      }
      
      .search-no-results {
        padding: 20px;
        text-align: center;
        color: #9ca3af;
        font-size: 14px;
      }
      
      /* Scrollbar styling */
      .search-results::-webkit-scrollbar {
        width: 6px;
      }
      
      .search-results::-webkit-scrollbar-track {
        background: #f3f4f6;
      }
      
      .search-results::-webkit-scrollbar-thumb {
        background: #d1d5db;
        border-radius: 3px;
      }
      
      .search-results::-webkit-scrollbar-thumb:hover {
        background: #9ca3af;
      }
    `;
    
    document.head.appendChild(style);
  }
}

/**
 * Get singleton instance
 * @param {MapManager} mapManager
 * @param {StorageManager} storageManager
 * @returns {SearchManager}
 */
export function getSearchManager(mapManager, storageManager) {
  if (!instance && mapManager && storageManager) {
    instance = new SearchManager(mapManager, storageManager);
  }
  return instance;
}

export default SearchManager;
