/**
 * 📊 GeoClient SP - Dashboard Manager
 * @module dashboard-manager
 * @version 1.0.0
 * @description Manages dashboard statistics and visualizations
 */

import { COMPANIES, STATS } from './config.js';
import { getEventBus, EVENT_TYPES } from './events.js';

/**
 * DashboardManager Class
 */
export class DashboardManager {
  constructor(mapManager, storageManager) {
    this.mapManager = mapManager;
    this.storageManager = storageManager;
    this.eventBus = getEventBus();
    
    this.setupEventListeners();
    console.log('📊 DashboardManager initialized');
  }

  /**
   * Render stats (public method)
   */
  renderStats() {
    this.initUI();
  }

  /**
   * Render company breakdown (public method)
   */
  renderCompanyBreakdown() {
    // Called by renderStats/initUI, nothing extra needed
    console.log('✅ Company breakdown rendered');
  }

  /**
   * Initialize dashboard UI
   */
  initUI() {
    const container = document.getElementById('dashboard-stats');
    if (!container) {
      console.warn('⚠️ Dashboard container not found');
      return;
    }

    container.innerHTML = this.renderDashboard();
    console.log('✅ Dashboard rendered');
  }

  /**
   * Render dashboard HTML
   * @returns {string} HTML
   */
  renderDashboard() {
    const stats = this.getStatistics();

    return `
      <div class="dashboard-grid">
        <!-- Total Cities -->
        <div class="stat-card">
          <div class="stat-icon">🏛️</div>
          <div class="stat-content">
            <div class="stat-label">Total de Cidades</div>
            <div class="stat-value">${STATS.totalCities}</div>
          </div>
        </div>

        <!-- Marked Cities -->
        <div class="stat-card stat-primary">
          <div class="stat-icon">📍</div>
          <div class="stat-content">
            <div class="stat-label">Cidades Marcadas</div>
            <div class="stat-value">${stats.markedCities}</div>
            <div class="stat-percentage">${stats.markedPercentage}%</div>
          </div>
        </div>

        <!-- Available Cities -->
        <div class="stat-card stat-success">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <div class="stat-label">Cidades Disponíveis</div>
            <div class="stat-value">${stats.availableCities}</div>
            <div class="stat-percentage">${stats.availablePercentage}%</div>
          </div>
        </div>

        <!-- Total Companies -->
        <div class="stat-card stat-info">
          <div class="stat-icon">🏭</div>
          <div class="stat-content">
            <div class="stat-label">Empresas Ativas</div>
            <div class="stat-value">${Object.keys(COMPANIES).length}</div>
          </div>
        </div>
      </div>

      <!-- Company Breakdown -->
      <div class="company-stats">
        <h3>🏢 Distribuição por Empresa</h3>
        <div class="company-breakdown">
          ${this.renderCompanyBreakdownHTML(stats.companyCounts)}
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="recent-activity">
        <h3>📅 Atividade Recente</h3>
        <div class="activity-list">
          ${this.renderRecentActivity()}
        </div>
      </div>
    `;
  }

  /**
   * Render company breakdown HTML
   * @param {Object} companyCounts - Company counts
   * @returns {string} HTML
   */
  renderCompanyBreakdownHTML(companyCounts) {
    return Object.entries(COMPANIES).map(([key, company]) => {
      const count = companyCounts[key] || 0;
      const percentage = count > 0 ? ((count / STATS.totalCities) * 100).toFixed(1) : 0;
      
      return `
        <div class="company-stat-item">
          <div class="company-stat-header">
            <span class="company-name" style="color: ${company.color}">
              <span class="company-dot" style="background: ${company.color}"></span>
              ${company.displayName}
            </span>
            <span class="company-count">${count} cidades</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${percentage}%; background: ${company.color}"></div>
          </div>
          <div class="company-percentage">${percentage}%</div>
        </div>
      `;
    }).join('');
  }

  /**
   * Render recent activity
   * @returns {string} HTML
   */
  renderRecentActivity() {
    // Get last 5 activities from ActivityManager
    // For now, return placeholder
    return `
      <div class="activity-placeholder">
        <p>📄 Nenhuma atividade recente</p>
      </div>
    `;
  }

  /**
   * Get dashboard statistics
   * @returns {Object} Statistics
   */
  getStatistics() {
    const markedCities = this.mapManager.getMarkedCities();
    const markedCount = Object.keys(markedCities).length;
    const availableCount = STATS.totalCities - markedCount;
    
    // Count cities per company
    const companyCounts = {};
    Object.keys(COMPANIES).forEach(key => {
      companyCounts[key] = 0;
    });

    Object.entries(markedCities).forEach(([cityName, cityData]) => {
      const companies = cityData.companies || [];
      companies.forEach(company => {
        if (companyCounts[company] !== undefined) {
          companyCounts[company]++;
        }
      });
    });

    return {
      totalCities: STATS.totalCities,
      markedCities: markedCount,
      availableCities: availableCount,
      markedPercentage: ((markedCount / STATS.totalCities) * 100).toFixed(1),
      availablePercentage: ((availableCount / STATS.totalCities) * 100).toFixed(1),
      companyCounts
    };
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Update dashboard when data changes
    this.eventBus.on(EVENT_TYPES.DATA_CHANGED, () => {
      this.update();
    });

    this.eventBus.on(EVENT_TYPES.CITY_MARKED, () => {
      this.update();
    });

    this.eventBus.on(EVENT_TYPES.COMPANY_REMOVED, () => {
      this.update();
    });
  }

  /**
   * Update dashboard
   */
  update() {
    this.initUI();
  }
}

let instance = null;

export function getDashboardManager(mapManager, storageManager) {
  if (!instance && mapManager && storageManager) {
    instance = new DashboardManager(mapManager, storageManager);
  }
  return instance;
}

export default DashboardManager;
