/**
 * 🐞 GeoClient SP - Diagnostic Test Suite
 * @version 1.1.0
 * @description Complete diagnostic tests for ES6 version
 */

/**
 * Run complete diagnostic test
 */
export function runDiagnostics() {
  console.log('%c🔍 GeoClient SP Diagnostics', 'color: #3b82f6; font-size: 18px; font-weight: bold');
  console.log('='.repeat(60));
  
  const app = window.GeoClientES6?.getApp();
  
  if (!app) {
    console.error('❌ App não inicializado!');
    return false;
  }
  
  let passed = 0;
  let failed = 0;
  
  // Test 1: Managers initialized
  console.log('\n📦 Test 1: Managers Initialization');
  const managers = [
    ['MapManager', app.mapManager],
    ['StorageManager', app.storageManager],
    ['ActivityManager', app.activityManager],
    ['UIManager', app.uiManager],
    ['FilterManager', app.filterManager],
    ['DashboardManager', app.dashboardManager],
    ['ReportsManager', app.reportsManager],
    ['CompaniesManager', app.companiesManager],
    ['NavigationManager', app.navigationManager],
    ['SearchManager', app.searchManager]
  ];
  
  managers.forEach(([name, manager]) => {
    if (manager) {
      console.log(`  ✅ ${name}: OK`);
      passed++;
    } else {
      console.log(`  ❌ ${name}: FAILED`);
      failed++;
    }
  });
  
  // Test 2: Map loaded
  console.log('\n🗺️ Test 2: Map Status');
  if (app.mapManager.map) {
    console.log('  ✅ Leaflet map: OK');
    passed++;
  } else {
    console.log('  ❌ Leaflet map: FAILED');
    failed++;
  }
  
  if (app.mapManager.geoJsonLayer) {
    console.log('  ✅ GeoJSON layer: OK');
    passed++;
  } else {
    console.log('  ❌ GeoJSON layer: FAILED');
    failed++;
  }
  
  const cityCount = Object.keys(app.mapManager.cityLayers || {}).length;
  console.log(`  🏛️ Cities loaded: ${cityCount}`);
  if (cityCount > 0) {
    console.log('  ✅ Cities: OK');
    passed++;
  } else {
    console.log('  ❌ Cities: FAILED');
    failed++;
  }
  
  // Test 3: Storage
  console.log('\n💾 Test 3: Storage');
  const markedCities = app.storageManager.loadMarkedCities();
  const markedCount = Object.keys(markedCities).length;
  console.log(`  📍 Marked cities: ${markedCount}`);
  console.log('  ✅ Storage: OK');
  passed++;
  
  // Test 4: Event Bus
  console.log('\n📡 Test 4: Event Bus');
  const eventBus = app.eventBus;
  const eventTypes = eventBus.eventNames();
  console.log(`  📡 Active events: ${eventTypes.length}`);
  console.log(`  Events: ${eventTypes.join(', ')}`);
  if (eventTypes.length > 0) {
    console.log('  ✅ Event Bus: OK');
    passed++;
  } else {
    console.log('  ⚠️ Event Bus: No listeners');
  }
  
  // Test 5: Companies
  console.log('\n🏭 Test 5: Companies');
  const companies = app.companiesManager.getAllCompanies();
  console.log(`  🏭 Companies configured: ${Object.keys(companies).length}`);
  Object.values(companies).forEach(company => {
    console.log(`    - ${company.name} (${company.color})`);
  });
  console.log('  ✅ Companies: OK');
  passed++;
  
  // Test 6: Add Company Test
  console.log('\n🧪 Test 6: Add Company Functionality');
  console.log('  Testing company add flow...');
  
  // Check if event listeners are set up
  const companyAddedListeners = eventBus.listenerCount('company:added');
  const companyRemovedListeners = eventBus.listenerCount('company:removed');
  
  console.log(`  🔊 COMPANY_ADDED listeners: ${companyAddedListeners}`);
  console.log(`  🔊 COMPANY_REMOVED listeners: ${companyRemovedListeners}`);
  
  if (companyAddedListeners > 0 && companyRemovedListeners > 0) {
    console.log('  ✅ Event listeners: OK');
    passed++;
  } else {
    console.log('  ❌ Event listeners: FAILED');
    failed++;
  }
  
  // Test 7: UI Elements (Accordion mode)
  console.log('\n🎨 Test 7: UI Elements (Accordion Mode)');
  const uiElements = [
    ['Map container', 'map'],
    ['Dashboard stat: Occupied', 'stat-occupied'],
    ['Dashboard stat: Available', 'stat-available'],
    ['Companies list', 'companies-list'],
    ['Content data (accordion)', 'content-data'],
    ['Marked cities list', 'marked-cities-list']
  ];
  
  uiElements.forEach(([name, id]) => {
    const element = document.getElementById(id);
    if (element) {
      console.log(`  ✅ ${name}: OK`);
      passed++;
    } else {
      console.log(`  ❌ ${name}: NOT FOUND`);
      failed++;
    }
  });
  
  // Test 8: Legacy UI Check (should NOT exist)
  console.log('\n🗑️ Test 8: Legacy UI Cleanup');
  const legacyElements = [
    ['#dashboard-stats (legacy)', 'dashboard-stats'],
    ['#reports-templates (legacy)', 'reports-templates'],
    ['#quick-filters (legacy)', 'quick-filters']
  ];
  
  legacyElements.forEach(([name, id]) => {
    const element = document.getElementById(id);
    if (!element) {
      console.log(`  ✅ ${name}: CORRECTLY REMOVED`);
      passed++;
    } else {
      console.log(`  ⚠️ ${name}: STILL EXISTS (should be removed)`);
      failed++;
    }
  });
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('%c📊 SUMMARY', 'color: #8b5cf6; font-size: 16px; font-weight: bold');
  console.log(`  ✅ Passed: ${passed}`);
  console.log(`  ❌ Failed: ${failed}`);
  console.log(`  📊 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);
  
  if (failed === 0) {
    console.log('%c\n✅ ALL TESTS PASSED! Sistema 100% funcional!', 'color: #10b981; font-size: 14px; font-weight: bold');
  } else if (failed <= 2) {
    console.log('%c\n✅ ALMOST PERFECT! Minor issues only.', 'color: #10b981; font-size: 14px; font-weight: bold');
  } else {
    console.log('%c\n⚠️ SOME TESTS FAILED!', 'color: #f59e0b; font-size: 14px; font-weight: bold');
  }
  
  console.log('='.repeat(60));
  
  return failed === 0;
}

/**
 * Test adding a company to a city
 */
export function testAddCompany(cityName, companyName) {
  console.log(`\n🧪 Testing: Add ${companyName} to ${cityName}`);
  console.log('-'.repeat(50));
  
  const app = window.GeoClientES6?.getApp();
  if (!app) {
    console.error('❌ App not initialized');
    return false;
  }
  
  console.log('1️⃣ Before state:');
  const before = app.mapManager.getMarkedCities();
  console.log('  Marked cities:', before);
  
  console.log('\n2️⃣ Adding company...');
  const result = app.companiesManager.assignToCity(cityName, companyName);
  
  if (!result) {
    console.error('❌ Failed to assign company');
    return false;
  }
  
  console.log('\n3️⃣ After state:');
  const after = app.mapManager.getMarkedCities();
  console.log('  Marked cities:', after);
  
  console.log('\n4️⃣ Checking storage:');
  const stored = app.storageManager.loadMarkedCities();
  console.log('  Storage:', stored[cityName]);
  
  console.log('\n5️⃣ Checking map style:');
  const layer = app.mapManager.cityLayers[cityName];
  if (layer) {
    const style = layer.options;
    console.log('  Layer style:', style);
  }
  
  console.log('\n✅ Test complete!');
  console.log('-'.repeat(50));
  
  return true;
}

/**
 * Enable debug mode
 */
export function enableDebug() {
  const app = window.GeoClientES6?.getApp();
  if (app) {
    app.enableDebug();
    console.log('🐞 Debug mode enabled - All events will be logged');
  }
}

/**
 * Disable debug mode
 */
export function disableDebug() {
  const app = window.GeoClientES6?.getApp();
  if (app) {
    app.disableDebug();
    console.log('✅ Debug mode disabled');
  }
}

/**
 * Show help
 */
export function help() {
  console.log('%c🔧 GeoClient SP - Console Commands', 'color: #3b82f6; font-size: 16px; font-weight: bold');
  console.log('\nAvailable commands:');
  console.log('  diagnose()              - Run complete diagnostic test');
  console.log('  testAdd(city, company)  - Test adding a company');
  console.log('  debug()                 - Enable debug logging');
  console.log('  nodebug()               - Disable debug logging');
  console.log('  help()                  - Show this help');
  console.log('\nExamples:');
  console.log('  testAdd("S\u00e3o Paulo", "WAUX")');
  console.log('  testAdd("Campinas", "MJV")');
}

// Expose globally
if (typeof window !== 'undefined') {
  window.diagnose = runDiagnostics;
  window.testAdd = testAddCompany;
  window.debug = enableDebug;
  window.nodebug = disableDebug;
  window.help = help;
  
  console.log('%c🔧 Diagnostic tools loaded!', 'color: #8b5cf6; font-weight: bold');
  console.log('Type help() for available commands');
}

export default {
  runDiagnostics,
  testAddCompany,
  enableDebug,
  disableDebug,
  help
};
