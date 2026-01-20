/**
 * 📊 GeoClient SP - Dashboard Manager
 * @module dashboard-manager
 * @version 4.1.0
 * @description Statistics and metrics dashboard
 */

import { getEventBus, EVENT_TYPES } from './events.js';
import { getStorageManager } from './storage-manager.js';
import { getActivityManager } from './activity-manager.js';
import { COMPANIES } from './config.js';
import { misc } from './utils.js';

/**
 * DashboardManager class for statistics and metrics
 */
export class DashboardManager {
  constructor(options = {}) {
    this.containerEl = options.containerEl || null;
    this.eventBus = getEventBus();
    this.storageManager = getStorageManager();
    this.activityManager = getActivityManager();
    this.autoRefresh = options.autoRefresh !== false;
    this.refreshInterval = options.refreshInterval || 5000;
    this.refreshTimer = null;
    
    console.log('📊 DashboardManager initialized');
    
    if (this.autoRefresh) {
      this.startAutoRefresh();
    }
  }

  /**
   * Get general statistics
   * @returns {Object} Statistics object
   */
  getStatistics() {
    const markedCities = this.storageManager.loadMarkedCities();
    const clients = this.storageManager.loadClients();
    const activities = this.activityManager.getActivities();

    const stats = {
      cities: {
        total: Object.keys(markedCities).length,
        byCompany: {},
        withMultipleCompanies: 0
      },
      companies: {
        active: new Set(),
        distribution: {}
      },
      clients: {
        total: clients.length,
        byCity: {}
      },
      activities: {
        total: activities.length,
        today: 0,
        thisWeek: 0,
        thisMonth: 0
      }
    };

    // Process cities
    Object.entries(markedCities).forEach(([cityName, cityData]) => {
      if (cityData.companies && cityData.companies.length > 0) {
        // Count cities with multiple companies
        if (cityData.companies.length > 1) {
          stats.cities.withMultipleCompanies++;
        }

        // Count by company
        cityData.companies.forEach(company => {
          stats.cities.byCompany[company] = (stats.cities.byCompany[company] || 0) + 1;
          stats.companies.active.add(company);
          stats.companies.distribution[company] = (stats.companies.distribution[company] || 0) + 1;
        });
      }
    });

    // Process clients
    clients.forEach(client => {
      if (client.city) {
        stats.clients.byCity[client.city] = (stats.clients.byCity[client.city] || 0) + 1;
      }
    });

    // Process activities (time ranges)
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    activities.forEach(activity => {
      const activityDate = new Date(activity.timestamp);
      
      if (activityDate >= today) {
        stats.activities.today++;
      }
      if (activityDate >= weekAgo) {
        stats.activities.thisWeek++;
      }
      if (activityDate >= monthAgo) {
        stats.activities.thisMonth++;
      }
    });

    stats.companies.active = stats.companies.active.size;

    return stats;
  }

  /**
   * Get top cities by number of companies
   * @param {number} limit - Number of results
   * @returns {Array} Top cities
   */
  getTopCities(limit = 10) {
    const markedCities = this.storageManager.loadMarkedCities();
    
    return Object.entries(markedCities)
      .filter(([_, data]) => data.companies && data.companies.length > 0)
      .map(([city, data]) => ({
        city,
        companiesCount: data.companies.length,
        companies: data.companies
      }))
      .sort((a, b) => b.companiesCount - a.companiesCount)
      .slice(0, limit);
  }

  /**
   * Get company coverage statistics
   * @returns {Object} Coverage stats
   */
  getCompanyCoverage() {
    const stats = this.getStatistics();
    const coverage = {};

    Object.keys(COMPANIES).forEach(companyKey => {
      const company = COMPANIES[companyKey];
      coverage[company.name] = {
        name: company.name,
        color: company.color,
        cities: stats.cities.byCompany[company.name] || 0,
        percentage: stats.cities.total > 0 
          ? ((stats.cities.byCompany[company.name] || 0) / stats.cities.total * 100).toFixed(1)
          : 0
      };
    });

    return coverage;
  }

  /**
   * Get recent activities for dashboard
   * @param {number} limit - Number of activities
   * @returns {Array} Recent activities
   */
  getRecentActivities(limit = 10) {
    return this.activityManager.getLastActivities(limit);
  }

  /**
   * Get activity trends (by day)
   * @param {number} days - Number of days
   * @returns {Array} Daily activity counts
   */
  getActivityTrends(days = 7) {
    const activities = this.activityManager.getActivities();
    const trends = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);
      
      const count = activities.filter(activity => {
        const activityDate = new Date(activity.timestamp);
        return activityDate >= date && activityDate < nextDate;
      }).length;

      trends.push({
        date: date.toISOString().split('T')[0],
        count
      });
    }

    return trends;
  }

  /**
   * Get dashboard summary
   * @returns {Object} Summary for dashboard cards
   */
  getSummary() {
    const stats = this.getStatistics();
    
    return {
      markedCities: {
        value: stats.cities.total,
        label: 'Cidades Marcadas',
        icon: '🏙️',
        color: '#3b82f6'
      },
      activeCompanies: {
        value: stats.companies.active,
        label: 'Empresas Ativas',
        icon: '🏢',
        color: '#10b981'
      },
      totalClients: {
        value: stats.clients.total,
        label: 'Clientes Cadastrados',
        icon: '👥',
        color: '#f59e0b'
      },
      activitiesToday: {
        value: stats.activities.today,
        label: 'Atividades Hoje',
        icon: '📊',
        color: '#8b5cf6'
      }
    };
  }

  /**
   * Export dashboard data as JSON
   * @returns {Object} Complete dashboard data
   */
  exportDashboardData() {
    return {
      timestamp: new Date().toISOString(),
      statistics: this.getStatistics(),
      topCities: this.getTopCities(),
      coverage: this.getCompanyCoverage(),
      recentActivities: this.getRecentActivities(20),
      trends: this.getActivityTrends(30)
    };
  }

  /**
   * Start auto-refresh for dashboard
   */
  startAutoRefresh() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }

    this.refreshTimer = setInterval(() => {
      this.eventBus.emit(EVENT_TYPES.DASHBOARD_UPDATE);
    }, this.refreshInterval);

    console.log('📊 Dashboard auto-refresh started');
  }

  /**
   * Stop auto-refresh
   */
  stopAutoRefresh() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
      console.log('📊 Dashboard auto-refresh stopped');
    }
  }

  /**
   * Destroy dashboard manager
   */
  destroy() {
    this.stopAutoRefresh();
  }
}

// Export singleton instance
let dashboardManagerInstance = null;

export function getDashboardManager() {
  if (!dashboardManagerInstance) {
    dashboardManagerInstance = new DashboardManager();
  }
  return dashboardManagerInstance;
}

export default {
  DashboardManager,
  getDashboardManager
};
