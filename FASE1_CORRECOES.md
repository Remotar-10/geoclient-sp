# 🔧 FASE 1: Correções Emergenciais

## Status: EM ANDAMENTO
Data: 2026-01-26

---

## ✅ Correções Já Implementadas

### 1. Cache de Storage (COMPLETO)
**Arquivo**: `js/modules/storage-manager.js`
- ✅ Cache global implementado
- ✅ Duração de 500ms
- ✅ Invalidação automática ao salvar
- ✅ Logs otimizados para indicar cache hit

**Resultado**: Redução de 5 leituras para 1 leitura durante inicialização

### 2. Nome correto do UIManager (COMPLETO)
**Arquivo**: `js/modules/app.js` linha 32
- ✅ Usa `this.uiManager` corretamente
- ⚠️ Bug-checker precisa ser corrigido (linha 136)

---

## 🔴 Correções Pendentes (CRÍTICAS)

### 3. Adicionar IDs Faltantes no HTML
**Arquivo**: `index-es6.html`

#### A. Lista de Cidades Marcadas
```html
<!-- Adicionar dentro do accordion de Estatísticas, após o último stat-card -->
<div class="accordion-content-inner" id="content-stats">
  <!-- ... stat-cards existentes ... -->
  
  <!-- ADICIONAR AQUI -->
  <div id="marked-cities-list" class="marked-cities-container" style="margin-top: 16px;">
    <!-- Lista de cidades será renderizada aqui pelo UIManager -->
  </div>
</div>
```

#### B. Lista de Cidades Recentes
```html
<!-- Adicionar dentro do accordion de Navegação, antes das regiões -->
<div class="accordion-content-inner" id="content-navigation">
  <!-- ADICIONAR AQUI -->
  <div class="nav-card" style="margin-bottom: 16px;">
    <div class="nav-card-header">
      <span>🕐</span>
      <span>Cidades Recentes</span>
    </div>
    <div id="recent-cities-list" class="recent-cities-container">
      <!-- Lista será renderizada pelo NavigationManager -->
    </div>
  </div>
  
  <!-- Regiões existentes... -->
</div>
```

#### C. IDs nas Seções de Accordion
```html
<!-- Adicionar IDs nas divs .accordion-section -->
<div id="tab-stats" class="accordion-section">
  <!-- Conteúdo de Estatísticas -->
</div>

<div id="tab-companies" class="accordion-section">
  <!-- Conteúdo de Empresas -->
</div>

<div id="tab-actions" class="accordion-section">
  <!-- Conteúdo de Ações -->
</div>

<div id="tab-navigation" class="accordion-section">
  <!-- Conteúdo de Navegação -->
</div>

<div id="tab-data" class="accordion-section">
  <!-- Conteúdo de Dados -->
</div>
```

#### D. IDs em Grupos de Controles
```html
<!-- Dentro do accordion de Navegação -->
<div class="nav-card">
  <div class="nav-card-header">
    <span>🗺️</span>
    <span>Regiões</span>
  </div>
  <!-- ADICIONAR ID AQUI -->
  <div id="region-buttons">
    <button class="region-btn" data-region="metropolitana">
      <!-- ... -->
    </button>
    <!-- outros botões ... -->
  </div>
</div>

<!-- Camadas do Mapa -->
<div class="nav-card">
  <div class="nav-card-header">
    <span>👁️</span>
    <span>Camadas do Mapa</span>
  </div>
  <!-- ADICIONAR ID AQUI -->
  <div id="layer-toggles">
    <div class="layer-toggle active" data-layer="occupied">
      <!-- ... -->
    </div>
    <!-- outros toggles ... -->
  </div>
</div>
```

#### E. Botão Toggle Sidebar
```html
<!-- Adicionar no topo do sidebar-header -->
<div class="sidebar-header">
  <button id="sidebar-toggle" class="sidebar-toggle-btn" 
          style="position: absolute; top: 20px; right: 20px; width: 32px; height: 32px; border: none; background: rgba(255,255,255,0.2); border-radius: 8px; color: white; cursor: pointer; display: none;">
    ☰
  </button>
  
  <h1 class="sidebar-title">
    <!-- ... -->
  </h1>
</div>
```

#### F. Atalhos na Navegação
```html
<!-- Adicionar antes das Regiões -->
<div class="nav-card" style="margin-bottom: 16px;">
  <div class="nav-card-header">
    <span>⚡</span>
    <span>Atalhos</span>
  </div>
  <button id="shortcut-reset" class="shortcut-btn">
    <span>🎯</span>
    <span>Resetar Visualização</span>
  </button>
  <button id="shortcut-list" class="shortcut-btn">
    <span>📋</span>
    <span>Copiar Lista</span>
  </button>
</div>
```

---

### 4. Corrigir Bug-Checker
**Arquivo**: `js/bug-checker.js` linha 136

**Problema atual**:
```javascript
if (app[managerKey]) {
```

**Correção necessária**:
```javascript
// Mapeamento especial de nomes
const managerMappings = {
  'UIManager': 'uiManager',      // Correto
  'MapManager': 'mapManager',
  'StorageManager': 'storageManager',
  'CompaniesManager': 'companiesManager',
  'FilterManager': 'filterManager',
  'DashboardManager': 'dashboardManager',
  'ReportsManager': 'reportsManager',
  'NavigationManager': 'navigationManager',
  'SearchManager': 'searchManager',
  'ActivityManager': 'activityManager'
};

requiredModules.forEach(moduleName => {
  const managerKey = managerMappings[moduleName];
  if (app[managerKey]) {
    this.pass(`${moduleName} carregado`);
  } else {
    this.bug(`${moduleName} ausente`, `app.${managerKey} é undefined`);
  }
});
```

---

### 5. Remover Event Listeners Duplicados
**Arquivo**: `js/modules/app.js` método `setupEventListeners()`

**Adicionar no início do método**:
```javascript
setupEventListeners() {
  console.log('📡 Setting up event listeners...');
  
  // ⭐ REMOVER LISTENERS ANTERIORES PARA EVITAR DUPLICAÇÃO
  this.eventBus.removeAllListeners(EVENT_TYPES.CITY_CLICKED);
  this.eventBus.removeAllListeners(EVENT_TYPES.DATA_CHANGED);
  this.eventBus.removeAllListeners(EVENT_TYPES.CITY_MARKED);
  this.eventBus.removeAllListeners(EVENT_TYPES.COMPANY_ADDED);
  this.eventBus.removeAllListeners(EVENT_TYPES.COMPANY_REMOVED);
  
  // Agora adicionar novos listeners...
  this.eventBus.on(EVENT_TYPES.CITY_CLICKED, (data) => {
    // ...
  });
  // etc...
}
```

---

### 6. Verificar Inicialização do Mapa
**Arquivo**: `js/modules/map-manager.js`

**Verificar se o método `initMap()` está correto**:
```javascript
initMap() {
  // Verificar se container existe
  const container = document.getElementById(this.mapElementId);
  if (!container) {
    console.error(`❌ Container #${this.mapElementId} não encontrado!`);
    return;
  }
  
  // Verificar se já tem mapa
  if (this.map) {
    console.warn('⚠️ Mapa já inicializado');
    return;
  }
  
  try {
    this.map = L.map(this.mapElementId, {
      center: this.defaultCenter,
      zoom: this.defaultZoom,
      zoomControl: true,
      attributionControl: true
    });
    
    // Adicionar tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(this.map);
    
    console.log('🗺️ Map initialized');
  } catch (error) {
    console.error('❌ Erro ao inicializar mapa:', error);
  }
}
```

---

## 📋 Checklist de Implementação

### Prioridade CRÍTICA (fazer agora)
- [ ] 3A. Adicionar `#marked-cities-list`
- [ ] 3B. Adicionar `#recent-cities-list`
- [ ] 3D. Adicionar `#region-buttons` e `#layer-toggles`
- [ ] 6. Verificar inicialização do mapa

### Prioridade ALTA (hoje)
- [ ] 3C. Adicionar IDs nas tabs
- [ ] 3E. Adicionar botão toggle sidebar
- [ ] 3F. Adicionar atalhos
- [ ] 5. Remover listeners duplicados

### Prioridade MÉDIA (esta semana)
- [ ] 4. Corrigir bug-checker
- [ ] Adicionar testes para verificar elementos DOM
- [ ] Documentar mudanças no README

---

## 🧪 Como Testar

### Após implementar as correções:

1. **Abrir o console** e executar:
```javascript
checkBugs()
```

2. **Verificar resultados esperados**:
- ✅ PASSOU: deve aumentar para ~45+ (de 35)
- ❌ BUGS: deve diminuir para ~5 (de 14)
- Taxa de sucesso: deve chegar a ~90%

3. **Verificar logs**:
- "💾 cidades restauradas" deve aparecer apenas 1-2x (não 5x)
- Não deve haver eventos duplicados
- Mapa deve renderizar `.leaflet-container`

4. **Teste funcional**:
- [ ] Clicar em uma cidade e adicionar empresa
- [ ] Verificar se lista de cidades aparece
- [ ] Verificar se estatísticas atualizam
- [ ] Verificar se não há ações duplicadas

---

## 📊 Métricas de Sucesso

| Métrica | Antes | Meta | Status |
|---------|-------|------|--------|
| Taxa de sucesso | 70.0% | 90%+ | 🔴 |
| Bugs críticos | 14 | ≤5 | 🔴 |
| Leituras storage/init | 5 | 1-2 | ✅ |
| Eventos duplicados | Sim | Não | 🔴 |
| Mapa renderizado | Não | Sim | 🔴 |

---

## 🚀 Próximos Passos (Fase 2)

Após completar Fase 1:
1. Mover código legado para pasta `legacy/`
2. Remover arquivos órfãos
3. Otimizar renderização
4. Adicionar testes automatizados

---

**Última atualização**: 2026-01-26 10:59 AM
**Responsável**: Equipe GeoClient SP
