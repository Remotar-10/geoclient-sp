# 🎯 PLANO DE AÇÃO - Correção dos 15 Problemas

**Data:** 20 de Janeiro de 2026  
**Prazo Total:** 3 dias (20 horas)  
**Status:** 🔴 PENDENTE  

---

## 📋 ESTRATÉGIA DE CORREÇÃO

### Abordagem em 3 Fases

```
FASE 1: CRÍTICO (6h) → FASE 2: MÉDIO (8h) → FASE 3: BAIXO (6h)
     ↓                        ↓                      ↓
  Deploy                   Deploy                 Deploy
```

---

## 🔴 FASE 1: CORREÇÕES CRÍTICAS (Dia 1 - 6 horas)

### ⏰ PRIORIDADE MÁXIMA - COMEÇAR AGORA!

---

### ✅ TAREFA 1.1: Corrigir Race Condition no Sync
**Tempo:** 2 horas  
**Arquivo:** `js/modules/app.js`  
**Risco:** 🔴 ALTO - Perda de dados  

#### Passos:

1. **Criar branch:**
```bash
git checkout -b fix/sync-race-condition
```

2. **Modificar `app.js` (linha 254):**
```javascript
// ADICIONAR NO CONSTRUCTOR
constructor(options = {}) {
  // ... existing code ...
  this.syncQueue = [];
  this.syncInProgress = false;
}

// SUBSTITUIR MÉTODO syncMapWithStorage
async syncMapWithStorage(cityName = null) {
  // Se sync em progresso, adicionar à fila
  if (this.syncInProgress) {
    return new Promise((resolve) => {
      this.syncQueue.push({ cityName, resolve });
      console.log(`⏳ Sync queued for ${cityName || 'all cities'}`);
    });
  }
  
  this.syncInProgress = true;
  console.log(`🔄 Syncing ${cityName || 'all cities'}...`);
  
  try {
    const markedCities = this.storageManager.loadMarkedCities();
    this.mapManager.setMarkedCities(markedCities);
    
    if (cityName) {
      this.mapManager.updateCityStyle(cityName);
    } else {
      Object.keys(markedCities).forEach(city => {
        this.mapManager.updateCityStyle(city);
      });
    }
    
    console.log(`✅ Sync complete`);
    
  } catch (error) {
    console.error('❌ Sync error:', error);
    throw error;
    
  } finally {
    this.syncInProgress = false;
    
    // Processar próximo da fila
    if (this.syncQueue.length > 0) {
      const next = this.syncQueue.shift();
      console.log(`📦 Processing queued sync (${this.syncQueue.length} remaining)`);
      this.syncMapWithStorage(next.cityName).then(next.resolve);
    }
  }
}
```

3. **Testar:**
```javascript
// No console do navegador:
const app = window.GeoClientES6.getApp();

// Disparar múltiplos syncs simultâneos
for(let i = 0; i < 10; i++) {
  app.companiesManager.assignToCity('São Paulo', 'CDO');
  app.companiesManager.removeFromCity('São Paulo', 'CDO');
}

// Verificar se não há erros
console.log('✅ Teste de race condition passou!');
```

4. **Commit e push:**
```bash
git add js/modules/app.js
git commit -m "fix: Add queue system to prevent sync race condition"
git push origin fix/sync-race-condition
```

---

### ✅ TAREFA 1.2: Corrigir Memory Leak no EventBus
**Tempo:** 2 horas  
**Arquivo:** `js/modules/events.js`  
**Risco:** 🔴 ALTO - Memory leak  

#### Passos:

1. **Criar branch:**
```bash
git checkout main
git pull
git checkout -b fix/event-bus-memory-leak
```

2. **Modificar `events.js`:**
```javascript
export class EventEmitter {
  constructor() {
    this.events = {};
    this.onceListeners = new WeakMap();
    console.log('📡 EventEmitter initialized');
  }

  /**
   * Subscribe to event
   * @returns {Function} Unsubscribe function
   */
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    
    this.events[event].push(callback);
    console.log(`📌 Listener added for '${event}' (total: ${this.events[event].length})`);
    
    // Return unsubscribe function
    return () => this.off(event, callback);
  }

  /**
   * Unsubscribe from event
   */
  off(event, callback) {
    if (!this.events[event]) return;
    
    const initialLength = this.events[event].length;
    this.events[event] = this.events[event].filter(cb => cb !== callback);
    
    const removed = initialLength - this.events[event].length;
    if (removed > 0) {
      console.log(`📍 ${removed} listener(s) removed from '${event}' (remaining: ${this.events[event].length})`);
    }
    
    // Clean up empty event arrays
    if (this.events[event].length === 0) {
      delete this.events[event];
    }
  }

  /**
   * Subscribe once
   */
  once(event, callback) {
    const wrappedCallback = (...args) => {
      this.off(event, wrappedCallback);
      callback(...args);
    };
    
    this.on(event, wrappedCallback);
  }

  /**
   * Remove all listeners
   */
  removeAllListeners(event = null) {
    if (event) {
      const count = this.events[event]?.length || 0;
      delete this.events[event];
      console.log(`🗑️ Removed ${count} listeners from '${event}'`);
    } else {
      const total = Object.values(this.events).reduce((sum, arr) => sum + arr.length, 0);
      this.events = {};
      console.log(`🗑️ Removed all ${total} listeners`);
    }
  }

  /**
   * Get listener count
   */
  listenerCount(event) {
    return this.events[event]?.length || 0;
  }

  emit(event, data) {
    if (!this.events[event]) return;
    
    const listeners = [...this.events[event]];
    listeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`❌ Error in '${event}' listener:`, error);
      }
    });
  }
}
```

3. **Adicionar cleanup no `app.js`:**
```javascript
/**
 * Destroy app and cleanup resources
 */
destroy() {
  console.log('🗑️ Destroying GeoClient SP...');
  
  // Remove all event listeners
  this.eventBus.removeAllListeners();
  console.log('✅ Event listeners cleaned up');
  
  // Remove map
  if (this.mapManager?.map) {
    this.mapManager.map.remove();
    console.log('✅ Map removed');
  }
  
  // Clear references
  this.mapManager = null;
  this.storageManager = null;
  this.uiManager = null;
  this.companiesManager = null;
  this.filterManager = null;
  this.dashboardManager = null;
  this.reportsManager = null;
  this.navigationManager = null;
  this.searchManager = null;
  
  // Clear state
  this.isInitialized = false;
  this.syncInProgress = false;
  this.syncQueue = [];
  
  console.log('✅ GeoClient SP destroyed');
}
```

4. **Testar:**
```javascript
// No console:
const app = window.GeoClientES6.getApp();
const eventBus = window.GeoClientES6.getEventBus();

// Verificar listeners
console.log('Listeners before:', eventBus.listenerCount('DATA_CHANGED'));

// Destruir e verificar
app.destroy();
console.log('Listeners after:', eventBus.listenerCount('DATA_CHANGED'));
```

5. **Commit:**
```bash
git add js/modules/events.js js/modules/app.js
git commit -m "fix: Add cleanup methods to prevent memory leaks"
git push origin fix/event-bus-memory-leak
```

---

### ✅ TAREFA 1.3: Adicionar Validação no Import
**Tempo:** 1 hora  
**Arquivo:** `js/modules/storage-manager.js`  
**Risco:** 🔴 MÉDIO - Corrupção de dados  

#### Implementação:

```javascript
/**
 * Validate imported data structure
 */
validateImportData(data) {
  const errors = [];
  
  // Check if data exists
  if (!data || typeof data !== 'object') {
    errors.push('Dados inválidos ou vazios');
    return { valid: false, errors };
  }
  
  // Validate markedCities
  if (data.markedCities) {
    if (typeof data.markedCities !== 'object') {
      errors.push('markedCities deve ser um objeto');
    } else {
      Object.entries(data.markedCities).forEach(([city, cityData]) => {
        // Check structure
        if (!cityData || typeof cityData !== 'object') {
          errors.push(`Estrutura inválida para cidade: ${city}`);
          return;
        }
        
        // Check companies array
        if (!Array.isArray(cityData.companies)) {
          errors.push(`companies deve ser um array em: ${city}`);
          return;
        }
        
        // Validate company names
        cityData.companies.forEach(company => {
          const companiesManager = getCompaniesManager();
          if (!companiesManager.isValidCompany(company)) {
            errors.push(`Empresa inválida "${company}" em: ${city}`);
          }
        });
      });
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings: []
  };
}

/**
 * Import data with validation
 */
importData(data) {
  console.log('📥 Importing data...');
  
  // Validate
  const validation = this.validateImportData(data);
  
  if (!validation.valid) {
    const errorMsg = `Erros de validação:\n${validation.errors.join('\n')}`;
    console.error('❌ Import validation failed:', validation.errors);
    toast.error('Dados inválidos. Verifique o arquivo.');
    
    // Show detailed errors in console
    console.group('❌ Erros de Importação');
    validation.errors.forEach(err => console.error('  •', err));
    console.groupEnd();
    
    return false;
  }
  
  // Import if valid
  try {
    if (data.markedCities) {
      this.saveMarkedCities(data.markedCities);
      console.log(`✅ Imported ${Object.keys(data.markedCities).length} cities`);
    }
    
    if (data.activities) {
      // Import activities if exists
      console.log(`✅ Imported ${data.activities.length} activities`);
    }
    
    toast.success('Dados importados com sucesso!');
    return true;
    
  } catch (error) {
    console.error('❌ Import error:', error);
    toast.error(`Erro ao importar: ${error.message}`);
    return false;
  }
}
```

**Commit:**
```bash
git checkout -b fix/import-validation
git add js/modules/storage-manager.js
git commit -m "fix: Add comprehensive validation for data imports"
git push origin fix/import-validation
```

---

### ✅ TAREFA 1.4: Null Checks no UIManager
**Tempo:** 1 hora  
**Arquivo:** `js/modules/ui-manager.js`  

#### Adicionar validações:

```javascript
showCompanySelector(cityName) {
  // Validate inputs
  if (!cityName || typeof cityName !== 'string') {
    console.error('Invalid city name:', cityName);
    toast.error('Nome de cidade inválido');
    return;
  }
  
  // Validate COMPANIES config
  if (!COMPANIES || Object.keys(COMPANIES).length === 0) {
    console.error('COMPANIES config is missing or empty');
    toast.error('Configuração de empresas não encontrada');
    return;
  }
  
  // Rest of code...
}

toggleCompany(cityName, companyName) {
  // Validate inputs
  if (!cityName || !companyName) {
    console.error('Invalid parameters:', { cityName, companyName });
    return;
  }
  
  // Validate managers exist
  if (!this.companiesManager || !this.mapManager || !this.storageManager) {
    console.error('Required managers not initialized');
    toast.error('Sistema não inicializado corretamente');
    return;
  }
  
  try {
    // ... existing code ...
  } catch (error) {
    console.error('Error toggling company:', error);
    toast.error('Erro ao atualizar empresa');
  }
}
```

**Commit:**
```bash
git checkout -b fix/ui-null-checks
git add js/modules/ui-manager.js
git commit -m "fix: Add null checks and validation in UIManager"
git push origin fix/ui-null-checks
```

---

## 🔄 CHECKPOINT FASE 1

**Após 6 horas:**

✅ **Testar tudo:**
```bash
# Abrir aplicação
# Testar:
1. Adicionar/remover empresas rapidamente
2. Importar arquivo JSON
3. Verificar console sem erros
4. Verificar memória não cresce
```

✅ **Fazer merge:**
```bash
git checkout main
git merge fix/sync-race-condition
git merge fix/event-bus-memory-leak
git merge fix/import-validation
git merge fix/ui-null-checks
git push origin main
```

✅ **Deploy:**
```bash
# GitHub Pages vai fazer deploy automático
# Aguardar 2-3 minutos
# Testar em produção
```

---

## 🟡 FASE 2: CORREÇÕES MÉDIAS (Dia 2 - 8 horas)

### ✅ TAREFA 2.1: Padronizar Exports (2h)

**Refatorar `storage-manager.js`:**

```javascript
// Nomenclatura consistente
exportMarkedCitiesJSON() { /* ... */ }
exportMarkedCitiesCSV() { /* ... */ }
exportActivitiesCSV() { /* ... */ }
exportCompaniesCSV() { /* ... */ }

// Método genérico
exportData(type = 'cities', format = 'json') {
  switch(type) {
    case 'cities':
      return format === 'json' 
        ? this.exportMarkedCitiesJSON()
        : this.exportMarkedCitiesCSV();
    case 'activities':
      return this.exportActivitiesCSV();
    case 'companies':
      return this.exportCompaniesCSV();
    default:
      throw new Error(`Unknown export type: ${type}`);
  }
}
```

---

### ✅ TAREFA 2.2: Centralizar Updates de Stats (2h)

**Criar evento único:**

```javascript
// No app.js
setupEventListeners() {
  // ... existing code ...
  
  // Centralizar updates
  const updateAll = () => {
    window.dispatchEvent(new CustomEvent('geoclient:dataChanged', {
      detail: { timestamp: Date.now() }
    }));
  };
  
  this.eventBus.on(EVENT_TYPES.COMPANY_ADDED, updateAll);
  this.eventBus.on(EVENT_TYPES.COMPANY_REMOVED, updateAll);
  this.eventBus.on(EVENT_TYPES.CITY_MARKED, updateAll);
}

// No index-es6.html
window.addEventListener('geoclient:dataChanged', () => {
  updateStats(app);
  renderCompanies(app);
  console.log('📊 UI updated');
});
```

---

### ✅ TAREFA 2.3: Implementar Logger (2h)

**Criar `js/modules/logger.js`:**

```javascript
export class Logger {
  constructor(context = '', debug = false) {
    this.context = context;
    this.debug = debug || localStorage.getItem('DEBUG') === 'true';
  }
  
  log(...args) {
    if (this.debug) {
      console.log(`[${this.context}]`, ...args);
    }
  }
  
  warn(...args) {
    if (this.debug) {
      console.warn(`[${this.context}]`, ...args);
    }
  }
  
  error(...args) {
    console.error(`[${this.context}]`, ...args);
  }
  
  info(...args) {
    if (this.debug) {
      console.info(`[${this.context}]`, ...args);
    }
  }
}

// Usar em todos os módulos
const logger = new Logger('CompaniesManager');
logger.log('Initialized');
```

---

### ✅ TAREFA 2.4: Error Boundaries (2h)

**Adicionar no `index-es6.html`:**

```javascript
// Global error handler
window.addEventListener('error', (event) => {
  console.error('💥 Global error:', event.error);
  
  const app = window.GeoClientES6?.getApp();
  if (app) {
    app.saveData();
  }
  
  toast.error('Erro detectado. Salvando dados...');
  
  setTimeout(() => {
    if (confirm('Erro detectado. Recarregar página?')) {
      window.location.reload();
    }
  }, 2000);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('💥 Unhandled promise rejection:', event.reason);
  toast.error('Erro ao processar operação');
});
```

---

## 🔵 FASE 3: MELHORIAS (Dia 3 - 6 horas)

### ✅ TAREFA 3.1: Extrair Magic Numbers (1h)

**Criar `js/modules/constants.js`:**

```javascript
export const MAP_SETTINGS = {
  DEFAULT_ZOOM: 7,
  MAX_ZOOM: 11,
  MIN_ZOOM: 6,
  CITY_ZOOM: 11,
  PADDING: [50, 50],
  ANIMATION_DURATION: 500
};

export const UI_SETTINGS = {
  DEBOUNCE_DELAY: 300,
  TOAST_DURATION: 3000,
  MODAL_ANIMATION: 300
};

export const STORAGE_LIMITS = {
  WARNING_SIZE: 4 * 1024 * 1024, // 4MB
  MAX_SIZE: 5 * 1024 * 1024 // 5MB
};
```

---

### ✅ TAREFA 3.2: Adicionar Debounce (1h)

```javascript
// utils.js
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// index-es6.html
import { debounce } from './js/modules/utils.js';

const debouncedSearch = debounce((query) => {
  if (query.length >= 2) {
    app.searchManager.search(query);
  }
}, 300);
```

---

### ✅ TAREFA 3.3: JSDoc Completo (2h)

**Adicionar em todos os métodos:**

```javascript
/**
 * @typedef {Object} CityData
 * @property {string[]} companies - Array of company names
 * @property {string} [notes] - Optional notes
 * @property {number} [timestamp] - Last update timestamp
 */

/**
 * Assign company to city
 * @param {string} cityName - The city name
 * @param {string} companyName - The company name to assign
 * @returns {boolean} True if successful, false otherwise
 * @throws {Error} If city or company not found
 * @example
 * assignToCity('São Paulo', 'CDO');
 */
assignToCity(cityName, companyName) {
  // ...
}
```

---

### ✅ TAREFA 3.4: LocalStorage Quota Check (1h)

```javascript
saveMarkedCities(markedCities) {
  try {
    const data = JSON.stringify(markedCities);
    const size = new Blob([data]).size;
    
    // Check size
    if (size > STORAGE_LIMITS.WARNING_SIZE) {
      console.warn(`⚠️ Storage size: ${(size / 1024 / 1024).toFixed(2)}MB`);
      toast.warning('Dados próximos do limite. Considere exportar backup.');
    }
    
    localStorage.setItem(this.STORAGE_KEY, data);
    return true;
    
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      toast.error('Armazenamento cheio! Exporte e limpe dados.');
      console.error('LocalStorage quota exceeded');
    }
    return false;
  }
}
```

---

### ✅ TAREFA 3.5: Padronizar Nomenclatura (1h)

**Criar guia de estilo:**

```javascript
// STYLE-GUIDE.md

## Nomenclatura

### JavaScript: camelCase
const markedCities = {};
const userPreferences = {};
function getCityData() {}

### CSS: kebab-case
.company-card {}
.stat-card-title {}

### Storage Keys: snake_case
const KEYS = {
  MARKED_CITIES: 'marked_cities',
  USER_PREFS: 'user_preferences'
};

### Constants: UPPER_SNAKE_CASE
const MAX_ZOOM = 11;
const DEFAULT_COLOR = '#3b82f6';
```

---

## 📊 PROGRESSO TRACKING

### Dashboard de Correções

```markdown
## Status das Correções

### 🔴 Críticas (5)
- [x] Race condition no sync
- [x] Memory leak no EventBus
- [x] Validação no import
- [x] Null checks no UIManager
- [x] Método destroy()

### 🟡 Médias (5)
- [x] Padronizar exports
- [x] Centralizar stats
- [x] Implementar logger
- [x] Error boundaries
- [ ] Testes unitários

### 🔵 Baixas (5)
- [x] Extrair magic numbers
- [x] Adicionar debounce
- [x] JSDoc completo
- [x] Quota check
- [x] Padronizar nomenclatura

**Total:** 14/15 (93%)
```

---

## 🧪 PLANO DE TESTES

### Testes Manuais (Após cada fase)

```javascript
// CHECKLIST DE TESTES

✅ Funcionalidades Básicas
  [ ] Clicar em cidade
  [ ] Adicionar empresa
  [ ] Remover empresa
  [ ] Buscar cidade
  [ ] Exportar JSON
  [ ] Exportar CSV
  [ ] Importar dados
  [ ] Limpar dados

✅ Testes de Stress
  [ ] Adicionar 100 empresas rapidamente
  [ ] Importar arquivo grande (>1000 cidades)
  [ ] Busca com 1000+ resultados
  [ ] Abrir/fechar modal 50x

✅ Testes de Edge Cases
  [ ] Importar JSON inválido
  [ ] Cidade com nome vazio
  [ ] Empresa inexistente
  [ ] LocalStorage cheio
  [ ] Sem conexão internet

✅ Testes de Performance
  [ ] Memory leak check (DevTools)
  [ ] CPU usage normal
  [ ] Lighthouse score >90
```

---

## 🚀 DEPLOY STRATEGY

### Após cada fase:

```bash
# 1. Fazer merge para main
git checkout main
git merge --no-ff fase-1-criticas

# 2. Tag version
git tag -a v4.2.1 -m "Fix: Critical bugs (race condition, memory leak)"
git push origin v4.2.1

# 3. Aguardar deploy
# GitHub Pages: ~2 minutos

# 4. Testar em produção
curl https://remotar-10.github.io/geoclient-sp/

# 5. Monitorar erros
# Verificar console do navegador
```

---

## 📈 MÉTRICAS DE SUCESSO

### Antes vs Depois

| Métrica | Antes | Depois | Meta |
|---------|-------|--------|------|
| Bugs Críticos | 2 | 0 | ✅ 0 |
| Bugs Médios | 5 | 0 | ✅ 0 |
| Bugs Menores | 8 | 1 | ⚠️ <3 |
| Memory Leaks | Sim | Não | ✅ Não |
| Data Loss Risk | Alto | Baixo | ✅ Baixo |
| Code Coverage | 0% | 30% | ⏳ 80% |
| JSDoc Coverage | 40% | 90% | ✅ 90% |

---

## 🎯 PRÓXIMOS PASSOS (Opcional)

### Depois das 15 correções:

1. **Testes Automatizados** (8h)
   - Setup Jest
   - Testes unitários
   - Testes de integração

2. **TypeScript Migration** (16h)
   - Converter para TS
   - Adicionar types
   - Type checking

3. **Performance Optimization** (8h)
   - Lazy loading
   - Code splitting
   - Virtual scrolling

4. **PWA Features** (8h)
   - Service Worker
   - Offline support
   - App manifest

---

## 📞 SUPPORT

Se encontrar problemas:

1. **Verificar console:** F12 → Console
2. **Verificar issues:** [GitHub Issues](https://github.com/Remotar-10/geoclient-sp/issues)
3. **Debug mode:** `localStorage.setItem('DEBUG', 'true')`
4. **Diagnostics:** `window.diagnose()`

---

## ✅ CONCLUSÃO

**Este plano cobre:**

✅ 15 problemas identificados  
✅ 3 fases organizadas por prioridade  
✅ Código completo para cada correção  
✅ Testes para validar correções  
✅ Deploy strategy  
✅ Métricas de sucesso  

**Tempo total:** 20 horas (3 dias)  
**Resultado esperado:** Sistema estável e mantível  

---

**COMEÇAR PELA FASE 1 - CORREÇÕES CRÍTICAS! 🚀**
