/**
 * 🏢 GeoClient SP - Companies Manager
 * @module companies-manager
 * @version 4.1.0
 * @description Company management and assignments
 */

import { COMPANIES, ACTIVITY_TYPES } from './config.js';
import { getEventBus, EVENT_TYPES } from './events.js';
import { getStorageManager } from './storage-manager.js';
import { getActivityManager } from './activity-manager.js';
import { toast } from './toast.js';

/**
 * CompaniesManager class for company operations
 */
export class CompaniesManager {
  constructor() {
    this.companies = { ...COMPANIES };
    this.eventBus = getEventBus();
    this.storageManager = getStorageManager();
    this.activityManager = getActivityManager();
    
    console.log('🏢 CompaniesManager initialized with', Object.keys(this.companies).length, 'companies');
  }

  /**
   * Get all companies
   * @returns {Object} Companies object
   */
  getAllCompanies() {
    return { ...this.companies };
  }

  /**
   * Get company by key
   * @param {string} key - Company key
   * @returns {Object|null} Company object
   */
  getCompany(key) {
    return this.companies[key] || null;
  }

  /**
   * Get company by name
   * @param {string} name - Company name
   * @returns {Object|null} Company object
   */
  getCompanyByName(name) {
    return Object.values(this.companies).find(c => c.name === name) || null;
  }

  /**
   * Assign company to city
   * @param {string} cityName - City name
   * @param {string} companyName - Company name
   * @returns {boolean} Success status
   */
  assignToCity(cityName, companyName) {
    const company = this.getCompanyByName(companyName);
    if (!company) {
      toast.error(`Empresa ${companyName} não encontrada`);
      return false;
    }

    const markedCities = this.storageManager.loadMarkedCities();
    
    if (!markedCities[cityName]) {
      markedCities[cityName] = { companies: [] };
    }

    if (markedCities[cityName].companies.includes(companyName)) {
      toast.warning(`${companyName} já está em ${cityName}`);
      return false;
    }

    markedCities[cityName].companies.push(companyName);
    this.storageManager.saveMarkedCities(markedCities);

    this.activityManager.log(ACTIVITY_TYPES.COMPANY_ADDED, { city: cityName, company: companyName });
    this.eventBus.emit(EVENT_TYPES.COMPANY_ADDED, { city: cityName, company: companyName });
    
    toast.success(`${companyName} adicionada em ${cityName}`);
    return true;
  }

  /**
   * Remove company from city
   * @param {string} cityName - City name
   * @param {string} companyName - Company name
   * @returns {boolean} Success status
   */
  removeFromCity(cityName, companyName) {
    const markedCities = this.storageManager.loadMarkedCities();
    
    if (!markedCities[cityName] || !markedCities[cityName].companies) {
      toast.warning(`Cidade ${cityName} não encontrada`);
      return false;
    }

    const index = markedCities[cityName].companies.indexOf(companyName);
    if (index === -1) {
      toast.warning(`${companyName} não está em ${cityName}`);
      return false;
    }

    markedCities[cityName].companies.splice(index, 1);

    // Remove city entry if no companies left
    if (markedCities[cityName].companies.length === 0) {
      delete markedCities[cityName];
    }

    this.storageManager.saveMarkedCities(markedCities);

    this.activityManager.log(ACTIVITY_TYPES.COMPANY_REMOVED, { city: cityName, company: companyName });
    this.eventBus.emit(EVENT_TYPES.COMPANY_REMOVED, { city: cityName, company: companyName });
    
    toast.info(`${companyName} removida de ${cityName}`);
    return true;
  }

  /**
   * Get cities for company
   * @param {string} companyName - Company name
   * @returns {Array} Array of city names
   */
  getCitiesForCompany(companyName) {
    const markedCities = this.storageManager.loadMarkedCities();
    
    return Object.entries(markedCities)
      .filter(([_, data]) => data.companies && data.companies.includes(companyName))
      .map(([cityName]) => cityName);
  }

  /**
   * Get companies for city
   * @param {string} cityName - City name
   * @returns {Array} Array of company names
   */
  getCompaniesForCity(cityName) {
    const markedCities = this.storageManager.loadMarkedCities();
    const cityData = markedCities[cityName];
    
    return cityData && cityData.companies ? [...cityData.companies] : [];
  }

  /**
   * Bulk assign company to multiple cities
   * @param {Array} cityNames - Array of city names
   * @param {string} companyName - Company name
   * @returns {Object} Results object
   */
  bulkAssign(cityNames, companyName) {
    const results = {
      success: [],
      failed: [],
      skipped: []
    };

    cityNames.forEach(cityName => {
      const result = this.assignToCity(cityName, companyName);
      if (result) {
        results.success.push(cityName);
      } else {
        const existing = this.getCompaniesForCity(cityName);
        if (existing.includes(companyName)) {
          results.skipped.push(cityName);
        } else {
          results.failed.push(cityName);
        }
      }
    });

    toast.success(`${results.success.length} cidades marcadas`);
    return results;
  }

  /**
   * Bulk remove company from multiple cities
   * @param {Array} cityNames - Array of city names
   * @param {string} companyName - Company name
   * @returns {Object} Results object
   */
  bulkRemove(cityNames, companyName) {
    const results = {
      success: [],
      failed: []
    };

    cityNames.forEach(cityName => {
      const result = this.removeFromCity(cityName, companyName);
      if (result) {
        results.success.push(cityName);
      } else {
        results.failed.push(cityName);
      }
    });

    toast.success(`${results.success.length} cidades desmarcadas`);
    return results;
  }

  /**
   * Get company statistics
   * @param {string} companyName - Company name
   * @returns {Object} Statistics object
   */
  getCompanyStats(companyName) {
    const cities = this.getCitiesForCompany(companyName);
    
    return {
      name: companyName,
      totalCities: cities.length,
      cities: cities,
      color: this.getCompanyByName(companyName)?.color
    };
  }

  /**
   * Get all companies statistics
   * @returns {Array} Array of company stats
   */
  getAllCompaniesStats() {
    return Object.values(this.companies).map(company => 
      this.getCompanyStats(company.name)
    ).sort((a, b) => b.totalCities - a.totalCities);
  }

  /**
   * Validate company name
   * @param {string} name - Company name
   * @returns {boolean} Valid status
   */
  isValidCompany(name) {
    return Object.values(this.companies).some(c => c.name === name);
  }

  /**
   * Get available companies (not assigned to city)
   * @param {string} cityName - City name
   * @returns {Array} Available companies
   */
  getAvailableCompaniesForCity(cityName) {
    const assignedCompanies = this.getCompaniesForCity(cityName);
    
    return Object.values(this.companies)
      .filter(company => !assignedCompanies.includes(company.name))
      .map(company => company.name);
  }

  /**
   * Clear all assignments for company
   * @param {string} companyName - Company name
   * @returns {number} Number of cities cleared
   */
  clearCompanyAssignments(companyName) {
    const cities = this.getCitiesForCompany(companyName);
    const results = this.bulkRemove(cities, companyName);
    
    this.activityManager.log('company_cleared', { 
      company: companyName, 
      citiesCount: results.success.length 
    });
    
    return results.success.length;
  }

  /**
   * Export company assignments as CSV
   * @returns {Blob} CSV blob
   */
  exportAssignmentsCSV() {
    const rows = [['Empresa', 'Cidade', 'Cor']];
    const markedCities = this.storageManager.loadMarkedCities();

    Object.entries(markedCities).forEach(([cityName, cityData]) => {
      if (cityData.companies) {
        cityData.companies.forEach(companyName => {
          const company = this.getCompanyByName(companyName);
          rows.push([companyName, cityName, company?.color || '']);
        });
      }
    });

    const csv = rows.map(row => 
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    return new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  }
}

// Export singleton instance
let companiesManagerInstance = null;

export function getCompaniesManager() {
  if (!companiesManagerInstance) {
    companiesManagerInstance = new CompaniesManager();
  }
  return companiesManagerInstance;
}

export default {
  CompaniesManager,
  getCompaniesManager
};
