/**
 * 📊 GeoClient SP - Reports Manager
 * @module reports-manager
 * @version 4.1.0
 * @description Report generation and export system
 */

import { getEventBus, EVENT_TYPES } from './events.js';
import { getStorageManager } from './storage-manager.js';
import { getActivityManager } from './activity-manager.js';
import { getDashboardManager } from './dashboard-manager.js';
import { dateTime } from './utils.js';
import { VERSION } from './config.js';
import { toast } from './toast.js';

/**
 * ReportsManager class for generating reports
 */
export class ReportsManager {
  constructor() {
    this.eventBus = getEventBus();
    this.storageManager = getStorageManager();
    this.activityManager = getActivityManager();
    this.dashboardManager = getDashboardManager();
    this.reportTemplates = {};
    
    this.initializeDefaultTemplates();
    
    console.log('📊 ReportsManager initialized');
  }

  /**
   * Initialize default report templates
   */
  initializeDefaultTemplates() {
    this.reportTemplates = {
      summary: {
        name: 'Relatório Sumário',
        description: 'Visão geral de cidades e empresas',
        generator: () => this.generateSummaryReport()
      },
      detailed: {
        name: 'Relatório Detalhado',
        description: 'Informações completas por cidade',
        generator: () => this.generateDetailedReport()
      },
      companies: {
        name: 'Relatório de Empresas',
        description: 'Distribuição e cobertura por empresa',
        generator: () => this.generateCompaniesReport()
      },
      activities: {
        name: 'Log de Atividades',
        description: 'Histórico de ações realizadas',
        generator: () => this.generateActivitiesReport()
      }
    };
  }

  /**
   * Generate summary report
   * @returns {Object} Report data
   */
  generateSummaryReport() {
    const stats = this.dashboardManager.getStatistics();
    const summary = this.dashboardManager.getSummary();
    const topCities = this.dashboardManager.getTopCities(10);

    return {
      type: 'summary',
      title: 'Relatório Sumário - GeoClient SP',
      generatedAt: dateTime.now(),
      version: VERSION.app,
      summary,
      statistics: stats,
      topCities,
      coverage: this.dashboardManager.getCompanyCoverage()
    };
  }

  /**
   * Generate detailed report
   * @returns {Object} Report data
   */
  generateDetailedReport() {
    const markedCities = this.storageManager.loadMarkedCities();
    const clients = this.storageManager.loadClients();

    const cityDetails = Object.entries(markedCities).map(([cityName, cityData]) => ({
      city: cityName,
      companies: cityData.companies || [],
      companiesCount: cityData.companies ? cityData.companies.length : 0,
      clients: clients.filter(c => c.city === cityName).length
    })).sort((a, b) => a.city.localeCompare(b.city));

    return {
      type: 'detailed',
      title: 'Relatório Detalhado - GeoClient SP',
      generatedAt: dateTime.now(),
      version: VERSION.app,
      totalCities: cityDetails.length,
      cities: cityDetails
    };
  }

  /**
   * Generate companies report
   * @returns {Object} Report data
   */
  generateCompaniesReport() {
    const stats = this.dashboardManager.getStatistics();
    const coverage = this.dashboardManager.getCompanyCoverage();

    const companiesData = Object.entries(coverage).map(([_, data]) => ({
      name: data.name,
      cities: data.cities,
      percentage: data.percentage,
      color: data.color
    })).sort((a, b) => b.cities - a.cities);

    return {
      type: 'companies',
      title: 'Relatório de Empresas - GeoClient SP',
      generatedAt: dateTime.now(),
      version: VERSION.app,
      totalCompanies: stats.companies.active,
      companies: companiesData
    };
  }

  /**
   * Generate activities report
   * @param {number} days - Days to include
   * @returns {Object} Report data
   */
  generateActivitiesReport(days = 30) {
    const activities = this.activityManager.getActivities();
    const trends = this.dashboardManager.getActivityTrends(days);
    const stats = this.activityManager.getStatistics();

    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
    
    const filteredActivities = activities.filter(activity => {
      const activityDate = new Date(activity.timestamp);
      return activityDate >= startDate && activityDate <= endDate;
    });

    return {
      type: 'activities',
      title: `Log de Atividades - Últimos ${days} dias`,
      generatedAt: dateTime.now(),
      version: VERSION.app,
      period: {
        start: dateTime.format(startDate),
        end: dateTime.format(endDate),
        days
      },
      statistics: stats,
      trends,
      activities: filteredActivities
    };
  }

  /**
   * Export report as JSON
   * @param {string} reportType - Report type
   * @returns {Blob} JSON blob
   */
  exportJSON(reportType) {
    const template = this.reportTemplates[reportType];
    
    if (!template) {
      toast.error('Template de relatório não encontrado');
      return null;
    }

    const reportData = template.generator();
    const json = JSON.stringify(reportData, null, 2);
    
    this.eventBus.emit(EVENT_TYPES.REPORT_GENERATED, { type: reportType, format: 'json' });
    toast.success('Relatório JSON gerado!');
    
    return new Blob([json], { type: 'application/json' });
  }

  /**
   * Export report as CSV
   * @param {string} reportType - Report type
   * @returns {Blob} CSV blob
   */
  exportCSV(reportType) {
    const template = this.reportTemplates[reportType];
    
    if (!template) {
      toast.error('Template de relatório não encontrado');
      return null;
    }

    const reportData = template.generator();
    let csv = '';

    // Generate CSV based on report type
    switch (reportType) {
      case 'summary':
        csv = this.generateSummaryCSV(reportData);
        break;
      case 'detailed':
        csv = this.generateDetailedCSV(reportData);
        break;
      case 'companies':
        csv = this.generateCompaniesCSV(reportData);
        break;
      case 'activities':
        csv = this.generateActivitiesCSV(reportData);
        break;
      default:
        csv = JSON.stringify(reportData);
    }

    this.eventBus.emit(EVENT_TYPES.REPORT_GENERATED, { type: reportType, format: 'csv' });
    toast.success('Relatório CSV gerado!');
    
    return new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  }

  /**
   * Generate summary CSV
   * @param {Object} data - Report data
   * @returns {string} CSV string
   */
  generateSummaryCSV(data) {
    const rows = [
      ['GeoClient SP - Relatório Sumário'],
      ['Gerado em', data.generatedAt],
      [''],
      ['Métrica', 'Valor'],
      ['Cidades Marcadas', data.statistics.cities.total],
      ['Empresas Ativas', data.statistics.companies.active],
      ['Clientes Cadastrados', data.statistics.clients.total],
      ['Atividades Hoje', data.statistics.activities.today],
      [''],
      ['Top 10 Cidades'],
      ['Cidade', 'Empresas', 'Total']
    ];

    data.topCities.forEach(city => {
      rows.push([city.city, city.companies.join(', '), city.companiesCount]);
    });

    return rows.map(row => 
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n');
  }

  /**
   * Generate detailed CSV
   * @param {Object} data - Report data
   * @returns {string} CSV string
   */
  generateDetailedCSV(data) {
    const rows = [
      ['Cidade', 'Empresas', 'Total Empresas', 'Clientes']
    ];

    data.cities.forEach(city => {
      rows.push([
        city.city,
        city.companies.join(', '),
        city.companiesCount,
        city.clients
      ]);
    });

    return rows.map(row => 
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n');
  }

  /**
   * Generate companies CSV
   * @param {Object} data - Report data
   * @returns {string} CSV string
   */
  generateCompaniesCSV(data) {
    const rows = [
      ['Empresa', 'Cidades', 'Cobertura (%)', 'Cor']
    ];

    data.companies.forEach(company => {
      rows.push([
        company.name,
        company.cities,
        company.percentage,
        company.color
      ]);
    });

    return rows.map(row => 
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n');
  }

  /**
   * Generate activities CSV
   * @param {Object} data - Report data
   * @returns {string} CSV string
   */
  generateActivitiesCSV(data) {
    const rows = [
      ['Data/Hora', 'Tipo', 'Mensagem']
    ];

    data.activities.forEach(activity => {
      rows.push([
        dateTime.format(activity.timestamp),
        activity.type,
        activity.message
      ]);
    });

    return rows.map(row => 
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n');
  }

  /**
   * Download blob as file
   * @param {Blob} blob - Blob to download
   * @param {string} filename - Filename
   */
  downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Generate and download report
   * @param {string} reportType - Report type
   * @param {string} format - Export format (json, csv)
   */
  generateAndDownload(reportType, format = 'json') {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `geoclient-${reportType}-${timestamp}.${format}`;

    let blob;
    if (format === 'json') {
      blob = this.exportJSON(reportType);
    } else if (format === 'csv') {
      blob = this.exportCSV(reportType);
    }

    if (blob) {
      this.downloadBlob(blob, filename);
      console.log(`📊 Report downloaded: ${filename}`);
    }
  }

  /**
   * Get available report templates
   * @returns {Array} Array of templates
   */
  getTemplates() {
    return Object.entries(this.reportTemplates).map(([id, template]) => ({
      id,
      name: template.name,
      description: template.description
    }));
  }

  /**
   * Schedule report (placeholder for future implementation)
   * @param {string} reportType - Report type
   * @param {string} schedule - Cron expression or interval
   */
  scheduleReport(reportType, schedule) {
    console.log(`📊 Report scheduled: ${reportType} at ${schedule}`);
    toast.info('Agendamento de relatórios em desenvolvimento');
    // TODO: Implement scheduling logic
  }
}

// Export singleton instance
let reportsManagerInstance = null;

export function getReportsManager() {
  if (!reportsManagerInstance) {
    reportsManagerInstance = new ReportsManager();
  }
  return reportsManagerInstance;
}

export default {
  ReportsManager,
  getReportsManager
};
