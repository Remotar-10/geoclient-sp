/**
 * 📄 GeoClient SP - Reports Manager
 * @module reports-manager
 * @version 1.0.0
 * @description Manages report generation and exports
 */

import { COMPANIES, STATS } from './config.js';
import { toast } from './toast.js';

/**
 * ReportsManager Class
 */
export class ReportsManager {
  constructor(mapManager, storageManager) {
    this.mapManager = mapManager;
    this.storageManager = storageManager;
    
    this.initUI();
    console.log('📄 ReportsManager initialized');
  }

  /**
   * Initialize reports UI
   */
  initUI() {
    const container = document.getElementById('reports-templates');
    if (!container) return;

    container.innerHTML = this.renderReports();
    this.setupEventListeners();
  }

  /**
   * Render reports HTML
   * @returns {string} HTML
   */
  renderReports() {
    return `
      <div class="reports-container">
        <div class="report-section">
          <h3>📊 Relatórios Disponíveis</h3>
          
          <div class="report-card">
            <div class="report-header">
              <span class="report-icon">🏛️</span>
              <h4>Relatório de Cidades</h4>
            </div>
            <p>Lista completa de cidades marcadas com empresas</p>
            <button class="btn btn-primary" data-report="cities-csv">
              💾 Exportar CSV
            </button>
            <button class="btn btn-secondary" data-report="cities-json">
              💾 Exportar JSON
            </button>
          </div>

          <div class="report-card">
            <div class="report-header">
              <span class="report-icon">🏭</span>
              <h4>Relatório por Empresa</h4>
            </div>
            <p>Cidades agrupadas por empresa</p>
            <button class="btn btn-primary" data-report="companies-csv">
              💾 Exportar CSV
            </button>
          </div>

          <div class="report-card">
            <div class="report-header">
              <span class="report-icon">📈</span>
              <h4>Relatório Estatístico</h4>
            </div>
            <p>Estatísticas gerais e gráficos</p>
            <button class="btn btn-primary" data-report="statistics-pdf">
              📝 Gerar PDF
            </button>
          </div>

          <div class="report-card">
            <div class="report-header">
              <span class="report-icon">✅</span>
              <h4>Cidades Disponíveis</h4>
            </div>
            <p>Lista de cidades sem empresas marcadas</p>
            <button class="btn btn-success" data-report="available-csv">
              💾 Exportar CSV
            </button>
          </div>
        </div>

        <div class="report-section">
          <h3>🕰️ Exportações Rápidas</h3>
          
          <div class="quick-export-buttons">
            <button class="btn btn-outline" data-quick="backup">
              💾 Backup Completo (JSON)
            </button>
            <button class="btn btn-outline" data-quick="import">
              📂 Importar Dados
            </button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Report buttons
    document.querySelectorAll('[data-report]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const reportType = e.target.dataset.report;
        this.generateReport(reportType);
      });
    });

    // Quick export buttons
    document.querySelectorAll('[data-quick]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.target.dataset.quick;
        if (action === 'backup') {
          this.exportBackup();
        } else if (action === 'import') {
          this.importData();
        }
      });
    });
  }

  /**
   * Generate report
   * @param {string} reportType - Report type
   */
  generateReport(reportType) {
    switch (reportType) {
      case 'cities-csv':
        this.exportCitiesCSV();
        break;
      case 'cities-json':
        this.exportCitiesJSON();
        break;
      case 'companies-csv':
        this.exportCompaniesByCompany();
        break;
      case 'statistics-pdf':
        this.exportStatisticsPDF();
        break;
      case 'available-csv':
        this.exportAvailableCities();
        break;
      default:
        toast.warning('Relatório não implementado');
    }
  }

  /**
   * Export cities as CSV
   */
  exportCitiesCSV() {
    const markedCities = this.mapManager.getMarkedCities();
    let csv = 'Cidade,Empresas,Quantidade\n';

    Object.entries(markedCities).forEach(([city, companies]) => {
      csv += `"${city}","${companies.join(', ')}",${companies.length}\n`;
    });

    this.downloadFile(csv, 'cidades-marcadas.csv', 'text/csv');
    toast.success('CSV de cidades exportado!');
  }

  /**
   * Export cities as JSON
   */
  exportCitiesJSON() {
    const markedCities = this.mapManager.getMarkedCities();
    const data = {
      exportDate: new Date().toISOString(),
      totalCities: Object.keys(markedCities).length,
      cities: markedCities
    };

    this.downloadFile(
      JSON.stringify(data, null, 2),
      'cidades-marcadas.json',
      'application/json'
    );
    toast.success('JSON de cidades exportado!');
  }

  /**
   * Export companies grouped by company
   */
  exportCompaniesByCompany() {
    const markedCities = this.mapManager.getMarkedCities();
    const byCompany = {};

    // Group by company
    Object.entries(markedCities).forEach(([city, companies]) => {
      companies.forEach(company => {
        if (!byCompany[company]) {
          byCompany[company] = [];
        }
        byCompany[company].push(city);
      });
    });

    // Generate CSV
    let csv = 'Empresa,Cidade\n';
    Object.entries(byCompany).forEach(([company, cities]) => {
      cities.forEach(city => {
        csv += `"${company}","${city}"\n`;
      });
    });

    this.downloadFile(csv, 'relatorio-por-empresa.csv', 'text/csv');
    toast.success('Relatório por empresa exportado!');
  }

  /**
   * Export statistics as PDF (placeholder)
   */
  exportStatisticsPDF() {
    toast.warning('Exportação PDF em desenvolvimento');
    // TODO: Implement PDF generation
  }

  /**
   * Export available cities
   */
  exportAvailableCities() {
    const markedCities = this.mapManager.getMarkedCities();
    const allCities = this.mapManager.getAllCities();
    
    const available = allCities.filter(city => !markedCities[city]);

    let csv = 'Cidade\n';
    available.forEach(city => {
      csv += `"${city}"\n`;
    });

    this.downloadFile(csv, 'cidades-disponiveis.csv', 'text/csv');
    toast.success(`${available.length} cidades disponíveis exportadas!`);
  }

  /**
   * Export full backup
   */
  exportBackup() {
    const data = this.storageManager.exportAllData();
    this.downloadFile(
      JSON.stringify(data, null, 2),
      `geoclient-backup-${new Date().toISOString().split('T')[0]}.json`,
      'application/json'
    );
    toast.success('Backup completo exportado!');
  }

  /**
   * Import data from file
   */
  importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          this.storageManager.importData(data);
          toast.success('Dados importados com sucesso!');
          window.location.reload();
        } catch (error) {
          console.error('Import error:', error);
          toast.error('Erro ao importar dados');
        }
      };
      reader.readAsText(file);
    };

    input.click();
  }

  /**
   * Download file helper
   * @param {string} content - File content
   * @param {string} filename - Filename
   * @param {string} mimeType - MIME type
   */
  downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }
}

let instance = null;

export function getReportsManager(mapManager, storageManager) {
  if (!instance && mapManager && storageManager) {
    instance = new ReportsManager(mapManager, storageManager);
  }
  return instance;
}

export default ReportsManager;
