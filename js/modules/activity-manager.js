/**
 * 📋 GeoClient SP - Activity Logger Manager
 * @module activity-manager
 * @version 4.1.0
 * @description Activity logging and history management
 */

import { dateTime } from './utils.js';
import { ACTIVITY_TYPES } from './config.js';
import { getEventBus, EVENT_TYPES } from './events.js';
import { getStorageManager } from './storage-manager.js';

/**
 * ActivityManager class for logging user actions
 */
export class ActivityManager {
  constructor() {
    this.activities = [];
    this.maxActivities = 1000; // Keep last 1000 activities
    this.storageManager = getStorageManager();
    this.eventBus = getEventBus();
    
    // Load existing activities
    this.loadActivities();
    
    console.log('📋 ActivityManager initialized with', this.activities.length, 'activities');
  }

  /**
   * Load activities from storage
   */
  loadActivities() {
    this.activities = this.storageManager.loadActivities();
  }

  /**
   * Save activities to storage
   */
  saveActivities() {
    // Keep only last maxActivities
    if (this.activities.length > this.maxActivities) {
      this.activities = this.activities.slice(-this.maxActivities);
    }
    
    this.storageManager.saveActivities(this.activities);
  }

  /**
   * Log an activity
   * @param {string} type - Activity type from ACTIVITY_TYPES
   * @param {Object} data - Activity data
   * @param {string} message - Human-readable message
   */
  log(type, data = {}, message = '') {
    const activity = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      timestamp: dateTime.now(),
      data,
      message: message || this.generateMessage(type, data)
    };

    this.activities.push(activity);
    this.saveActivities();

    // Emit event
    this.eventBus.emit('activity:logged', activity);

    if (type === ACTIVITY_TYPES.ERROR) {
      console.error('❌', activity.message, activity.data);
    } else {
      console.log('📋', activity.message);
    }
  }

  /**
   * Generate human-readable message from activity type and data
   * @param {string} type - Activity type
   * @param {Object} data - Activity data
   * @returns {string} Message
   */
  generateMessage(type, data) {
    switch (type) {
      case ACTIVITY_TYPES.CITY_MARKED:
        return `Cidade ${data.city} marcada`;
      case ACTIVITY_TYPES.CITY_REMOVED:
        return `Cidade ${data.city} desmarcada`;
      case ACTIVITY_TYPES.COMPANY_ADDED:
        return `${data.company} adicionada em ${data.city}`;
      case ACTIVITY_TYPES.COMPANY_REMOVED:
        return `${data.company} removida de ${data.city}`;
      case ACTIVITY_TYPES.CLIENT_ADDED:
        return `Cliente ${data.name} adicionado`;
      case ACTIVITY_TYPES.CLIENT_UPDATED:
        return `Cliente ${data.name} atualizado`;
      case ACTIVITY_TYPES.CLIENT_DELETED:
        return `Cliente ${data.name} deletado`;
      case ACTIVITY_TYPES.EXPORT_CSV:
        return `Exportação CSV realizada (${data.rows || 0} linhas)`;
      case ACTIVITY_TYPES.EXPORT_JSON:
        return `Exportação JSON realizada`;
      case ACTIVITY_TYPES.EXPORT_PDF:
        return `Exportação PDF realizada`;
      case ACTIVITY_TYPES.IMPORT_DATA:
        return `Importação de dados (${data.format})`;
      case ACTIVITY_TYPES.FILTER_APPLIED:
        return `Filtro aplicado: ${data.filter}`;
      default:
        return `Atividade: ${type}`;
    }
  }

  /**
   * Get all activities
   * @returns {Array} Array of activities
   */
  getActivities() {
    return [...this.activities]; // Return copy
  }

  /**
   * Get activities filtered by type
   * @param {string} type - Activity type
   * @returns {Array} Filtered activities
   */
  getActivitiesByType(type) {
    return this.activities.filter(a => a.type === type);
  }

  /**
   * Get activities within date range
   * @param {Date|string} startDate - Start date
   * @param {Date|string} endDate - End date
   * @returns {Array} Filtered activities
   */
  getActivitiesByDateRange(startDate, endDate) {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    
    return this.activities.filter(a => {
      const activityDate = new Date(a.timestamp).getTime();
      return activityDate >= start && activityDate <= end;
    });
  }

  /**
   * Get last activity
   * @returns {Object|null} Last activity or null
   */
  getLastActivity() {
    return this.activities.length > 0 ? this.activities[this.activities.length - 1] : null;
  }

  /**
   * Get last N activities
   * @param {number} count - Number of activities
   * @returns {Array} Last N activities
   */
  getLastActivities(count = 10) {
    return this.activities.slice(-count).reverse();
  }

  /**
   * Clear all activities
   */
  clearActivities() {
    this.activities = [];
    this.saveActivities();
    console.log('📋 Atividades limpas');
  }

  /**
   * Export activities as CSV
   * @returns {Blob} CSV blob
   */
  exportCSV() {
    const rows = [
      ['Data/Hora', 'Tipo', 'Mensagem', 'Detalhes']
    ];

    this.activities.forEach(activity => {
      rows.push([
        dateTime.format(activity.timestamp),
        activity.type,
        activity.message,
        JSON.stringify(activity.data)
      ]);
    });

    const csv = rows.map(row => 
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    return new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  }

  /**
   * Export activities as JSON
   * @returns {Blob} JSON blob
   */
  exportJSON() {
    const data = {
      exportDate: dateTime.now(),
      totalActivities: this.activities.length,
      activities: this.activities
    };

    const json = JSON.stringify(data, null, 2);
    return new Blob([json], { type: 'application/json' });
  }

  /**
   * Get activity statistics
   * @returns {Object} Statistics object
   */
  getStatistics() {
    const stats = {
      total: this.activities.length,
      byType: {},
      lastActivity: this.getLastActivity()
    };

    // Count by type
    this.activities.forEach(activity => {
      stats.byType[activity.type] = (stats.byType[activity.type] || 0) + 1;
    });

    return stats;
  }
}

// Export singleton instance
let activityManagerInstance = null;

export function getActivityManager() {
  if (!activityManagerInstance) {
    activityManagerInstance = new ActivityManager();
  }
  return activityManagerInstance;
}

// Shorthand log functions
export const activityLog = {
  cityMarked(city, companies) {
    getActivityManager().log(ACTIVITY_TYPES.CITY_MARKED, { city, companies });
  },
  
  cityRemoved(city) {
    getActivityManager().log(ACTIVITY_TYPES.CITY_REMOVED, { city });
  },
  
  companyAdded(city, company) {
    getActivityManager().log(ACTIVITY_TYPES.COMPANY_ADDED, { city, company });
  },
  
  companyRemoved(city, company) {
    getActivityManager().log(ACTIVITY_TYPES.COMPANY_REMOVED, { city, company });
  },
  
  error(message, error) {
    getActivityManager().log(ACTIVITY_TYPES.ERROR, { error: error.message, stack: error.stack }, message);
  }
};

export default {
  ActivityManager,
  getActivityManager,
  activityLog
};
