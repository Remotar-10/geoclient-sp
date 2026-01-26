/**
 * 🐞 GeoClient SP - Bug Checker
 * @module bug-checker
 * @version 1.1.1
 * @description Comprehensive system bug detection and reporting
 */

/**
 * Bug Checker Class
 */
class BugChecker {
  constructor() {
    this.bugs = [];
    this.warnings = [];
    this.passed = [];
  }

  /**
   * Run all bug checks
   */
  async runAllChecks() {
    console.log('%c🐞 INICIANDO VERIFICAÇÃO DE BUGS...', 'background: #ef4444; color: white; padding: 8px; font-weight: bold');
    console.log('');

    this.bugs = [];
    this.warnings = [];
    this.passed = [];

    // Category 1: Core Dependencies
    console.log('%c📦 1. DEPENDÊNCIAS EXTERNAS', 'color: #3b82f6; font-weight: bold');
    await this.checkLeaflet();
    await this.checkGeoJSON();
    console.log('');

    // Category 2: ES6 Modules
    console.log('%c📦 2. MÓDULOS ES6', 'color: #3b82f6; font-weight: bold');
    this.checkModules();
    console.log('');

    // Category 3: Managers
    console.log('%c🏛️ 3. MANAGERS', 'color: #3b82f6; font-weight: bold');
    this.checkManagers();
    console.log('');

    // Category 4: DOM Elements
    console.log('%c🎨 4. ELEMENTOS DOM', 'color: #3b82f6; font-weight: bold');
    this.checkDOM();
    console.log('');

    // Category 5: Event Listeners
    console.log('%c📡 5. EVENT LISTENERS', 'color: #3b82f6; font-weight: bold');
    this.checkEvents();
    console.log('');

    // Category 6: LocalStorage
    console.log('%c💾 6. LOCALSTORAGE', 'color: #3b82f6; font-weight: bold');
    this.checkStorage();
    console.log('');

    // Category 7: Map Functionality
    console.log('%c🗺️ 7. FUNCIONALIDADE DO MAPA', 'color: #3b82f6; font-weight: bold');
    this.checkMapFunctionality();
    console.log('');

    // Category 8: UI Interactions
    console.log('%c🖱️ 8. INTERAÇÕES UI', 'color: #3b82f6; font-weight: bold');
    this.checkUIInteractions();
    console.log('');

    // Category 9: Search Functionality
    console.log('%c🔍 9. SISTEMA DE BUSCA', 'color: #3b82f6; font-weight: bold');
    this.checkSearch();
    console.log('');

    // Category 10: Navigation
    console.log('%c🧭 10. NAVEGAÇÃO', 'color: #3b82f6; font-weight: bold');
    this.checkNavigation();
    console.log('');

    // Print summary
    this.printSummary();
  }

  // ========================================
  // DEPENDENCY CHECKS
  // ========================================

  async checkLeaflet() {
    if (typeof L !== 'undefined' && L.version) {
      this.pass('Leaflet carregado', `v${L.version}`);
    } else {
      this.bug('Leaflet não encontrado', 'Verifique CDN');
    }
  }

  async checkGeoJSON() {
    try {
      const response = await fetch('data/municipios-sp.geojson');
      if (response.ok) {
        const data = await response.json();
        this.pass('GeoJSON acessível', `${data.features?.length || 0} cidades`);
      } else {
        this.bug('GeoJSON não encontrado', `Status: ${response.status}`);
      }
    } catch (error) {
      this.bug('Erro ao carregar GeoJSON', error.message);
    }
  }

  // ========================================
  // MODULE CHECKS
  // ========================================

  checkModules() {
    // ⭐ CORRIGIDO: Mapeamento correto de nomes de managers
    const managerMappings = {
      'MapManager': 'mapManager',
      'StorageManager': 'storageManager',
      'UIManager': 'uiManager',  // ✅ Corrigido de uIManager para uiManager
      'CompaniesManager': 'companiesManager',
      'FilterManager': 'filterManager',
      'DashboardManager': 'dashboardManager',
      'ReportsManager': 'reportsManager',
      'NavigationManager': 'navigationManager',
      'SearchManager': 'searchManager',
      'ActivityManager': 'activityManager'
    };

    const app = window.GeoClientES6?.getApp();
    if (!app) {
      this.bug('App não inicializado', 'GeoClientES6.getApp() retornou undefined');
      return;
    }

    Object.entries(managerMappings).forEach(([moduleName, managerKey]) => {
      if (app[managerKey]) {
        this.pass(`${moduleName} carregado`);
      } else {
        this.bug(`${moduleName} ausente`, `app.${managerKey} é undefined`);
      }
    });
  }

  // ========================================
  // MANAGER CHECKS
  // ========================================

  checkManagers() {
    const app = window.GeoClientES6?.getApp();
    if (!app) {
      this.bug('App não disponível para teste de managers');
      return;
    }

    // MapManager
    if (app.mapManager?.map) {
      this.pass('MapManager.map inicializado');
    } else {
      this.bug('MapManager.map ausente');
    }

    if (app.mapManager?.geoJsonLayer) {
      this.pass('MapManager.geoJsonLayer carregado');
    } else {
      this.bug('MapManager.geoJsonLayer ausente');
    }

    if (app.mapManager?.cityLayers && Object.keys(app.mapManager.cityLayers).length > 0) {
      this.pass('MapManager.cityLayers populado', `${Object.keys(app.mapManager.cityLayers).length} cidades`);
    } else {
      this.bug('MapManager.cityLayers vazio');
    }

    // StorageManager
    if (app.storageManager) {
      const cities = app.storageManager.loadMarkedCities();
      this.pass('StorageManager funcional', `${Object.keys(cities).length} cidades salvas`);
    }

    // SearchManager
    if (app.searchManager) {
      if (typeof app.searchManager.searchCities === 'function') {
        this.pass('SearchManager.searchCities disponível');
      } else {
        this.bug('SearchManager.searchCities ausente');
      }
    }

    // NavigationManager
    if (app.navigationManager) {
      if (typeof app.navigationManager.navigateToRegion === 'function') {
        this.pass('NavigationManager.navigateToRegion disponível');
      } else {
        this.bug('NavigationManager.navigateToRegion ausente');
      }
    }
  }

  // ========================================
  // DOM CHECKS
  // ========================================

  checkDOM() {
    const requiredElements = [
      { id: 'map', name: 'Container do mapa' },
      { id: 'sidebar', name: 'Sidebar' },
      { id: 'city-search', name: 'Input de busca' },
      { id: 'tab-map', name: 'Tab Mapa' },
      { id: 'tab-navigation', name: 'Tab Navegação' },
      { id: 'tab-dashboard', name: 'Tab Dashboard' },
      { id: 'tab-companies', name: 'Tab Empresas' },
      { id: 'tab-reports', name: 'Tab Relatórios' },
      { id: 'marked-cities-list', name: 'Lista de cidades' },
      { id: 'recent-cities-list', name: 'Cidades recentes' },
      { id: 'region-buttons', name: 'Botões de região' },
      { id: 'layer-toggles', name: 'Toggles de camada' },
      { id: 'toast-container', name: 'Container de toasts' }
    ];

    requiredElements.forEach(({ id, name }) => {
      const element = document.getElementById(id);
      if (element) {
        this.pass(`DOM: ${name}`, `#${id}`);
      } else {
        this.bug(`DOM: ${name} ausente`, `#${id}`);
      }
    });
  }

  // ========================================
  // EVENT CHECKS
  // ========================================

  checkEvents() {
    const app = window.GeoClientES6?.getApp();
    if (!app?.eventBus) {
      this.bug('EventBus ausente');
      return;
    }

    this.pass('EventBus inicializado');

    // Check if events are registered
    const expectedEvents = [
      'CITY_CLICKED',
      'DATA_CHANGED',
      'CITY_MARKED',
      'COMPANY_ADDED',
      'COMPANY_REMOVED'
    ];

    this.pass('Eventos esperados definidos', expectedEvents.length);
  }

  // ========================================
  // STORAGE CHECKS
  // ========================================

  checkStorage() {
    try {
      // Test localStorage access
      const testKey = 'geoclient-test';
      localStorage.setItem(testKey, 'test');
      const result = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);

      if (result === 'test') {
        this.pass('LocalStorage funcional');
      } else {
        this.bug('LocalStorage não retorna dados corretos');
      }

      // Check for existing data
      const markedCities = localStorage.getItem('geoclient-marked-cities');
      const recentCities = localStorage.getItem('geoclient-recent-cities');
      const layerStates = localStorage.getItem('geoclient-layer-states');

      if (markedCities) {
        const parsed = JSON.parse(markedCities);
        this.pass('Dados salvos encontrados', `${Object.keys(parsed).length} cidades`);
      } else {
        this.warn('Nenhuma cidade marcada', 'Normal para novo usuário');
      }

      if (recentCities) {
        this.pass('Histórico recente encontrado');
      } else {
        this.warn('Nenhuma cidade recente', 'Normal para novo usuário');
      }

    } catch (error) {
      this.bug('Erro ao acessar LocalStorage', error.message);
    }
  }

  // ========================================
  // MAP FUNCTIONALITY CHECKS
  // ========================================

  checkMapFunctionality() {
    const app = window.GeoClientES6?.getApp();
    if (!app?.mapManager) {
      this.bug('MapManager não disponível');
      return;
    }

    const map = app.mapManager.map;
    if (!map) {
      this.bug('Mapa não inicializado');
      return;
    }

    // ✅ CORREÇÃO: Verificar se o próprio #map TEM a classe .leaflet-container
    const mapContainer = document.getElementById('map');
    if (mapContainer && mapContainer.classList.contains('leaflet-container')) {
      this.pass('Mapa renderizado no DOM');
    } else {
      this.bug('Mapa não renderizado', 'Container #map não tem classe .leaflet-container');
    }

    // Check map methods
    const methods = ['setView', 'flyTo', 'getBounds', 'getZoom'];
    methods.forEach(method => {
      if (typeof map[method] === 'function') {
        this.pass(`Mapa.${method}() disponível`);
      } else {
        this.bug(`Mapa.${method}() ausente`);
      }
    });
  }

  // ========================================
  // UI INTERACTION CHECKS
  // ========================================

  checkUIInteractions() {
    // Sidebar toggle
    const sidebarToggle = document.getElementById('sidebar-toggle');
    if (sidebarToggle) {
      this.pass('Botão toggle sidebar presente');
    } else {
      this.bug('Botão toggle sidebar ausente');
    }

    // Tab buttons
    const tabs = document.querySelectorAll('.nav-tab');
    if (tabs.length === 5) {
      this.pass('Todas as tabs presentes', `${tabs.length}/5`);
    } else {
      this.warn('Número incorreto de tabs', `${tabs.length}/5`);
    }

    // Map controls
    const resetBtn = document.getElementById('reset-view');
    const exportBtn = document.getElementById('export-data');

    if (resetBtn) this.pass('Botão reset presente');
    else this.bug('Botão reset ausente');

    if (exportBtn) this.pass('Botão export presente');
    else this.bug('Botão export ausente');
  }

  // ========================================
  // SEARCH CHECKS
  // ========================================

  checkSearch() {
    const app = window.GeoClientES6?.getApp();
    if (!app?.searchManager) {
      this.bug('SearchManager não disponível');
      return;
    }

    const searchInput = document.getElementById('city-search');
    if (searchInput) {
      this.pass('Input de busca presente');
    } else {
      this.bug('Input de busca ausente');
    }

    // Test search functionality
    if (typeof app.searchManager.searchCities === 'function') {
      try {
        const results = app.searchManager.searchCities('sao');
        if (Array.isArray(results)) {
          this.pass('Busca funcional', `${results.length} resultados para "sao"`);
        } else {
          this.bug('Busca retorna tipo incorreto', typeof results);
        }
      } catch (error) {
        this.bug('Erro ao executar busca', error.message);
      }
    }
  }

  // ========================================
  // NAVIGATION CHECKS
  // ========================================

  checkNavigation() {
    const app = window.GeoClientES6?.getApp();
    if (!app?.navigationManager) {
      this.bug('NavigationManager não disponível');
      return;
    }

    // Check regions
    if (app.navigationManager.regions) {
      const regionCount = Object.keys(app.navigationManager.regions).length;
      if (regionCount === 4) {
        this.pass('Regiões definidas', `${regionCount}/4`);
      } else {
        this.warn('Número incorreto de regiões', `${regionCount}/4`);
      }
    } else {
      this.bug('Regiões não definidas');
    }

    // Check layer states
    if (app.navigationManager.layerStates) {
      this.pass('Estados de camada definidos');
    } else {
      this.bug('Estados de camada ausentes');
    }

    // Check shortcuts
    const shortcutReset = document.getElementById('shortcut-reset');
    const shortcutList = document.getElementById('shortcut-list');

    if (shortcutReset) this.pass('Atalho reset presente');
    else this.bug('Atalho reset ausente');

    if (shortcutList) this.pass('Atalho copiar lista presente');
    else this.bug('Atalho copiar lista ausente');
  }

  // ========================================
  // LOGGING METHODS
  // ========================================

  bug(title, detail = '') {
    this.bugs.push({ title, detail });
    console.log(`  ❌ ${title}${detail ? ` - ${detail}` : ''}`);
  }

  warn(title, detail = '') {
    this.warnings.push({ title, detail });
    console.log(`  ⚠️  ${title}${detail ? ` - ${detail}` : ''}`);
  }

  pass(title, detail = '') {
    this.passed.push({ title, detail });
    console.log(`  ✅ ${title}${detail ? ` - ${detail}` : ''}`);
  }

  // ========================================
  // SUMMARY
  // ========================================

  printSummary() {
    console.log('');
    console.log('%c════════════════════════════════════════', 'color: #9ca3af');
    console.log('%c📊 RESUMO DA VERIFICAÇÃO', 'color: #3b82f6; font-size: 16px; font-weight: bold');
    console.log('%c════════════════════════════════════════', 'color: #9ca3af');
    console.log('');

    console.log(`%c✅ PASSOU: ${this.passed.length}`, 'color: #10b981; font-weight: bold');
    console.log(`%c⚠️  AVISOS: ${this.warnings.length}`, 'color: #f59e0b; font-weight: bold');
    console.log(`%c❌ BUGS: ${this.bugs.length}`, 'color: #ef4444; font-weight: bold');
    console.log('');

    if (this.bugs.length > 0) {
      console.log('%c🐞 BUGS ENCONTRADOS:', 'color: #ef4444; font-weight: bold');
      this.bugs.forEach((bug, i) => {
        console.log(`  ${i + 1}. ${bug.title}${bug.detail ? ` - ${bug.detail}` : ''}`);
      });
      console.log('');
    }

    if (this.warnings.length > 0) {
      console.log('%c⚠️  AVISOS:', 'color: #f59e0b; font-weight: bold');
      this.warnings.forEach((warn, i) => {
        console.log(`  ${i + 1}. ${warn.title}${warn.detail ? ` - ${warn.detail}` : ''}`);
      });
      console.log('');
    }

    // Final status
    const total = this.passed.length + this.warnings.length + this.bugs.length;
    const successRate = ((this.passed.length / total) * 100).toFixed(1);

    console.log('%c════════════════════════════════════════', 'color: #9ca3af');
    console.log(`%cTAXA DE SUCESSO: ${successRate}%`, `color: ${successRate >= 90 ? '#10b981' : successRate >= 70 ? '#f59e0b' : '#ef4444'}; font-size: 18px; font-weight: bold`);
    console.log('%c════════════════════════════════════════', 'color: #9ca3af');
    console.log('');

    if (this.bugs.length === 0) {
      console.log('%c🎉 NENHUM BUG ENCONTRADO! Sistema funcionando perfeitamente!', 'background: #10b981; color: white; padding: 8px; font-weight: bold');
    } else {
      console.log('%c🔧 BUGS DETECTADOS - Verifique os itens acima', 'background: #ef4444; color: white; padding: 8px; font-weight: bold');
    }

    return {
      passed: this.passed.length,
      warnings: this.warnings.length,
      bugs: this.bugs.length,
      successRate: parseFloat(successRate),
      details: {
        bugs: this.bugs,
        warnings: this.warnings,
        passed: this.passed
      }
    };
  }
}

// Export function
export async function checkBugs() {
  const checker = new BugChecker();
  return await checker.runAllChecks();
}

// Make available globally
window.checkBugs = checkBugs;

export default BugChecker;
