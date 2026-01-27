/**
 * 🎨 GeoClient SP - UI Manager
 * @module ui-manager
 * @version 4.2.0
 * @description User interface interactions and city popups
 */

import { getEventBus, EVENT_TYPES } from './events.js';
import { getStorageManager } from './storage-manager.js';
import { getCompaniesManager } from './companies-manager.js';
import { toast } from './toast.js';
import { COMPANIES } from './config.js';

/**
 * UIManager class for user interactions
 */
export class UIManager {
  constructor(mapManager) {
    this.mapManager = mapManager;
    this.eventBus = getEventBus();
    this.storageManager = getStorageManager();
    this.companiesManager = getCompaniesManager();
    
    console.log('🎨 UIManager initialized');
  }

  /**
   * Setup city click handler
   * @param {L.Layer} layer - Leaflet layer
   * @param {Object} feature - GeoJSON feature
   */
  setupCityClickHandler(layer, feature) {
    const cityName = feature.properties.name;

    layer.on('click', (e) => {
      this.handleCityClick(cityName, layer, e);
    });

    // Hover effect
    layer.on('mouseover', () => {
      layer.setStyle({
        weight: 3,
        color: '#3b82f6',
        fillOpacity: 0.5
      });
    });

    layer.on('mouseout', () => {
      this.mapManager.resetLayerStyle(layer);
    });
  }

  /**
   * Handle city click
   * @param {string} cityName - City name
   * @param {L.Layer} layer - Layer object
   * @param {Event} e - Click event
   */
  handleCityClick(cityName, layer, e) {
    const markedCities = this.storageManager.loadMarkedCities();
    const cityData = markedCities[cityName] || {};
    const companies = cityData.companies || [];

    // Create popup content
    const popupContent = this.createCityPopup(cityName, companies);
    
    // Show popup
    layer.bindPopup(popupContent, {
      maxWidth: 300,
      className: 'city-popup'
    }).openPopup();

    // Zoom to city
    this.mapManager.map.fitBounds(layer.getBounds(), {
      padding: [50, 50],
      maxZoom: 11
    });

    // Emit event
    this.eventBus.emit(EVENT_TYPES.CITY_CLICKED, { city: cityName, companies });
    
    console.log(`🏛️ City clicked: ${cityName}`, companies);
  }

  /**
   * Create city popup HTML
   * @param {string} cityName - City name
   * @param {Array} companies - Assigned companies
   * @returns {string} HTML content
   */
  createCityPopup(cityName, companies) {
    const hasCompanies = companies.length > 0;
    
    let html = `
      <div class="popup-content">
        <h3 class="popup-title">📍 ${cityName}</h3>
        
        ${hasCompanies ? `
          <div class="popup-companies">
            <strong>Empresas:</strong>
            <div class="company-tags">
              ${companies.map(comp => {
                const companyData = COMPANIES[comp];
                return `
                  <span class="company-tag" style="background-color: ${companyData?.color || '#3b82f6'}">
                    ${comp}
                  </span>
                `;
              }).join('')}
            </div>
          </div>
        ` : `
          <p class="popup-empty">Nenhuma empresa marcada</p>
        `}
        
        <div class="popup-actions">
          <button onclick="window.GeoClientES6.getApp().uiManager.showCompanySelector('${cityName}')" 
                  class="popup-btn popup-btn-primary">
            ➕ Adicionar Empresa
          </button>
          
          ${hasCompanies ? `
            <button onclick="window.GeoClientES6.getApp().uiManager.removeAllCompanies('${cityName}')" 
                    class="popup-btn popup-btn-danger">
              ❌ Remover Todas
            </button>
          ` : ''}
        </div>
      </div>
    `;
    
    return html;
  }

  /**
   * Show company selector modal
   * @param {string} cityName - City name
   */
  showCompanySelector(cityName) {
    const markedCities = this.storageManager.loadMarkedCities();
    const cityData = markedCities[cityName] || {};
    const assignedCompanies = cityData.companies || [];

    // Create modal HTML
    const modalHTML = `
      <div class="modal-overlay active" id="company-selector-modal">
        <div class="modal">
          <div class="modal-header">
            <h3 class="modal-title">Selecionar Empresas - ${cityName}</h3>
            <button class="modal-close" onclick="document.getElementById('company-selector-modal').remove()">✕</button>
          </div>
          
          <div class="modal-body">
            <p style="margin-bottom: 16px; color: #6b7280;">
              Selecione as empresas para adicionar em <strong>${cityName}</strong>:
            </p>
            
            <div class="companies-grid">
              ${Object.entries(COMPANIES).map(([key, company]) => {
                const isAssigned = assignedCompanies.includes(company.name);
                return `
                  <button 
                    class="company-card ${isAssigned ? 'disabled' : ''}"
                    style="border-left-color: ${company.color}"
                    onclick="window.GeoClientES6.getApp().uiManager.toggleCompany('${cityName}', '${company.name}')"
                    ${isAssigned ? 'disabled' : ''}>
                    <div class="company-name">${company.name}</div>
                    ${isAssigned ? '<div class="company-status">✓ Já marcada</div>' : ''}
                  </button>
                `;
              }).join('')}
            </div>
          </div>
          
          <div class="modal-footer">
            <button class="btn btn-secondary" 
                    onclick="document.getElementById('company-selector-modal').remove()">
              Fechar
            </button>
          </div>
        </div>
      </div>
    `;

    // Remove existing modal if any
    const existingModal = document.getElementById('company-selector-modal');
    if (existingModal) {
      existingModal.remove();
    }

    // Add to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }

  /**
   * Toggle company assignment
   * @param {string} cityName - City name
   * @param {string} companyName - Company name
   */
  toggleCompany(cityName, companyName) {
    try {
      const markedCities = this.storageManager.loadMarkedCities();
      const cityData = markedCities[cityName] || {};
      const companies = cityData.companies || [];

      if (companies.includes(companyName)) {
        // Remove company
        this.companiesManager.removeFromCity(cityName, companyName);
        toast.warning(`${companyName} removida de ${cityName}`);
      } else {
        // Add company
        this.companiesManager.assignToCity(cityName, companyName);
        toast.success(`✅ ${companyName} adicionada em ${cityName}!`);
      }

      // ⭐ SOLÇÃO: Fechar popup IMEDIATAMENTE
      this.mapManager.map.closePopup();

      // Update map
      this.mapManager.updateCityDisplay(cityName);
      
      // ✨ DESTAQUE VISUAL: Piscar cidade no mapa
      this.highlightCityOnMap(cityName);

      // Close modal
      const modal = document.getElementById('company-selector-modal');
      if (modal) {
        modal.remove();
      }

      // 🚫 NÃO REABRIR POPUP - deixar mapa limpo!
      // this.mapManager.openCityPopup(cityName); // REMOVIDO

    } catch (error) {
      toast.error('Erro ao atualizar empresa');
      console.error('Error toggling company:', error);
    }
  }

  /**
   * Highlight city on map with animation
   * @param {string} cityName - City name
   */
  highlightCityOnMap(cityName) {
    const layer = this.mapManager.cityLayers[cityName];
    if (!layer) return;

    // 🌟 Animação de destaque (piscar 2x)
    const originalStyle = {
      weight: 1,
      opacity: 0.6,
      fillOpacity: 0.7
    };

    const highlightStyle = {
      weight: 4,
      opacity: 1,
      color: '#22c55e', // Verde sucesso
      fillOpacity: 0.9
    };

    // Piscar 1
    layer.setStyle(highlightStyle);
    
    setTimeout(() => {
      layer.setStyle(originalStyle);
      
      // Piscar 2
      setTimeout(() => {
        layer.setStyle(highlightStyle);
        
        // Voltar ao normal
        setTimeout(() => {
          this.mapManager.updateCityStyle(cityName);
        }, 300);
      }, 300);
    }, 300);

    console.log(`✨ Cidade ${cityName} destacada no mapa`);
  }

  /**
   * Remove all companies from city
   * @param {string} cityName - City name
   */
  removeAllCompanies(cityName) {
    if (confirm(`Remover todas as empresas de ${cityName}?`)) {
      try {
        const markedCities = this.storageManager.loadMarkedCities();
        const cityData = markedCities[cityName];
        
        if (cityData && cityData.companies) {
          cityData.companies.forEach(company => {
            this.companiesManager.removeFromCity(cityName, company);
          });
        }

        toast.success(`Empresas removidas de ${cityName}`);
        this.mapManager.updateCityDisplay(cityName);

        // Close popup
        this.mapManager.map.closePopup();

      } catch (error) {
        toast.error('Erro ao remover empresas');
        console.error('Error removing companies:', error);
      }
    }
  }

  /**
   * Update city list in sidebar
   */
  updateCitiesList() {
    const listContainer = document.getElementById('marked-cities-list');
    if (!listContainer) return;

    const markedCities = this.storageManager.loadMarkedCities();
    const cities = Object.keys(markedCities).sort();

    if (cities.length === 0) {
      listContainer.innerHTML = '<p style="color: #9ca3af; font-size: 14px;">Nenhuma cidade marcada</p>';
      return;
    }

    listContainer.innerHTML = cities.map(cityName => {
      const cityData = markedCities[cityName];
      const companies = cityData.companies || [];
      
      return `
        <div class="city-item" onclick="window.GeoClientES6.getApp().mapManager.zoomToCity('${cityName}')">
          <div style="font-weight: 600; margin-bottom: 4px;">${cityName}</div>
          <div style="font-size: 12px; color: #6b7280;">
            ${companies.length} empresa${companies.length !== 1 ? 's' : ''}
            ${companies.length > 0 ? ': ' + companies.join(', ') : ''}
          </div>
        </div>
      `;
    }).join('');
  }
}

// Export singleton getter
let uiManagerInstance = null;

export function getUIManager(mapManager) {
  if (!uiManagerInstance && mapManager) {
    uiManagerInstance = new UIManager(mapManager);
  }
  return uiManagerInstance;
}

export default {
  UIManager,
  getUIManager
};
