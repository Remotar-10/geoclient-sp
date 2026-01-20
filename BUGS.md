# 🐞 GeoClient SP - Bug Tracking

**Última Atualização:** 2026-01-20  
**Versão:** v4.2.0 ES6

---

## 🚨 PRIORIDADE CRÍTICA (P0)

### ❌ Nenhum bug crítico identificado

✅ **Sistema estável para produção**

---

## 🔴 PRIORIDADE ALTA (P1)

Bugs que afetam funcionalidades principais mas têm workarounds.

### 1. Export PDF Não Implementado
- **Status:** 🟡 Pendente
- **Módulo:** ReportsManager
- **Descrição:** Botão "Exportar PDF" existe mas não funciona
- **Impacto:** Usuários não podem gerar relatórios em PDF
- **Workaround:** Usar Export CSV ou JSON
- **Solução:** Implementar biblioteca jsPDF ou similar
- **Arquivos afetados:**
  - `js/modules/reports-manager.js`
  - `index.html` (linha ~450)
  - `index-es6.html` (tab reports)

**Código atual:**
```javascript
// reports-manager.js linha ~120
exportPDF() {
  console.warn('PDF export not implemented yet');
  // TODO: Implementar com jsPDF
}
```

**Fix sugerido:**
```javascript
import jsPDF from 'jspdf';
import 'jspdf-autotable';

exportPDF() {
  const doc = new jsPDF();
  const markedCities = this.storageManager.loadMarkedCities();
  
  // Add title
  doc.setFontSize(18);
  doc.text('GeoClient SP - Relatório', 14, 20);
  
  // Add table
  const tableData = Object.entries(markedCities).map(([city, data]) => [
    city,
    data.companies?.join(', ') || 'Nenhuma'
  ]);
  
  doc.autoTable({
    startY: 30,
    head: [['Cidade', 'Empresas']],
    body: tableData
  });
  
  doc.save(`geoclient-${new Date().toISOString().split('T')[0]}.pdf`);
}
```

---

### 2. Histórico de Atividades Incompleto
- **Status:** 🟡 Pendente
- **Módulo:** ActivityManager
- **Descrição:** Histórico não é exibido na UI do ES6
- **Impacto:** Usuários não podem ver histórico de ações
- **Workaround:** Verificar no Console com `app.activityManager.getActivities()`
- **Solução:** Criar tab ou modal de histórico
- **Arquivos afetados:**
  - `index-es6.html` (falta section de histórico)
  - `js/modules/activity-manager.js` (render method ausente)

**Fix sugerido:**
```html
<!-- Adicionar em index-es6.html -->
<div id="tab-history" class="tab-panel">
  <h2>📋 Histórico</h2>
  <div id="activity-list"></div>
</div>
```

```javascript
// activity-manager.js
renderActivities() {
  const container = document.getElementById('activity-list');
  if (!container) return;
  
  const activities = this.getRecentActivities(20);
  
  const html = activities.map(activity => `
    <div class="activity-item">
      <span class="activity-icon">${this.getActivityIcon(activity.type)}</span>
      <div class="activity-details">
        <div class="activity-title">${activity.description}</div>
        <div class="activity-time">${this.formatTime(activity.timestamp)}</div>
      </div>
    </div>
  `).join('');
  
  container.innerHTML = html;
}
```

---

## 🟡 PRIORIDADE MÉDIA (P2)

Bugs que afetam experiência do usuário mas não impedem uso.

### 3. Versão Desatualizada no Config
- **Status:** ⚠️ Menor
- **Módulo:** config.js
- **Descrição:** `VERSION.app` mostra '4.1.0' mas HTML mostra '4.2.0'
- **Impacto:** Inconsistência visual na versão
- **Workaround:** Confiar na versão do HTML
- **Solução:** Atualizar config.js
- **Arquivos afetados:**
  - `js/modules/config.js` (linha 12)

**Fix:**
```javascript
export const VERSION = {
  app: '4.2.0',  // Era 4.1.0
  css: '4.0.0',
  modules: '1.0.0',
  core: '3.4.0',
  buildDate: '2026-01-20'
};
```

---

### 4. Filtros Rápidos Vazio na Inicialização
- **Status:** ⚠️ Menor
- **Módulo:** FilterManager
- **Descrição:** Seção "Filtros Rápidos" aparece vazia até usuário marcar cidade
- **Impacto:** UI parece incompleta
- **Workaround:** Marcar primeira cidade
- **Solução:** Mostrar filtros padrão mesmo sem cidades
- **Arquivos afetados:**
  - `js/modules/filter-manager.js`

**Fix sugerido:**
```javascript
renderFilters() {
  const container = document.getElementById('quick-filters');
  if (!container) return;
  
  // Se vazio, mostrar filtros padrão
  const markedCities = this.storageManager.loadMarkedCities();
  if (Object.keys(markedCities).length === 0) {
    container.innerHTML = `
      <div class="filter-empty">
        🔍 Marque cidades para ver filtros
      </div>
    `;
    return;
  }
  
  // ... resto do código
}
```

---

### 5. Toast Duplicado em Operações Simultâneas
- **Status:** ⚠️ Menor
- **Módulo:** Toast
- **Descrião:** Duas ações rápidas podem gerar 2 toasts iguais
- **Impacto:** Poluí interface
- **Workaround:** Esperar toast sumir
- **Solução:** Implementar debounce ou deduplication
- **Arquivos afetados:**
  - `js/modules/toast.js`

**Fix sugerido:**
```javascript
class Toast {
  constructor() {
    this.queue = [];
    this.recentMessages = new Set();
  }
  
  show(message, type) {
    // Prevent duplicates within 1 second
    const key = `${type}:${message}`;
    if (this.recentMessages.has(key)) return;
    
    this.recentMessages.add(key);
    setTimeout(() => this.recentMessages.delete(key), 1000);
    
    // ... rest of code
  }
}
```

---

## 🟢 PRIORIDADE BAIXA (P3)

Melhorias de qualidade de vida.

### 6. Sidebar Não Persiste Estado Collapsed
- **Status:** 🟢 Enhancement
- **Módulo:** UI
- **Descrição:** Ao recarregar página, sidebar volta sempre aberta
- **Impacto:** Mínimo - apenas preferência visual
- **Workaround:** Clicar toggle novamente
- **Solução:** Salvar estado no localStorage
- **Arquivos afetados:**
  - `index-es6.html` (setupUIListeners)

**Fix sugerido:**
```javascript
function setupUIListeners(app) {
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const sidebar = document.getElementById('sidebar');
  
  // Restore saved state
  const isCollapsed = localStorage.getItem('sidebar-collapsed') === 'true';
  if (isCollapsed) {
    sidebar.classList.add('collapsed');
  }
  
  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
      // Save state
      localStorage.setItem(
        'sidebar-collapsed',
        sidebar.classList.contains('collapsed')
      );
    });
  }
}
```

---

### 7. Zoom Lento em Disposição Móvel
- **Status:** 🟢 Enhancement
- **Módulo:** MapManager
- **Descrição:** Animação de zoom pode ser lenta em mobile
- **Impacto:** Experiência em dispositivos móveis
- **Workaround:** Aguardar animação
- **Solução:** Detectar mobile e usar zoom instantâneo
- **Arquivos afetados:**
  - `js/modules/map-manager.js`

**Fix sugerido:**
```javascript
zoomToCity(cityName) {
  const layer = this.cityLayers[cityName];
  if (!layer) return;
  
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);
  
  if (isMobile) {
    // Instant zoom on mobile
    this.map.fitBounds(layer.getBounds(), {
      padding: [50, 50],
      animate: false
    });
  } else {
    // Smooth animation on desktop
    this.map.flyToBounds(layer.getBounds(), {
      padding: [50, 50],
      duration: 1
    });
  }
}
```

---

### 8. Console Logs em Produção
- **Status:** 🟢 Enhancement
- **Módulo:** Global
- **Descrição:** Muitos console.log() em produção
- **Impacto:** Performance mínima, debug info visível
- **Workaround:** Ignorar console
- **Solução:** Implementar logger com níveis
- **Arquivos afetados:**
  - Todos os modules/*.js

**Fix sugerido:**
```javascript
// logger.js
export class Logger {
  constructor(module) {
    this.module = module;
    this.isDev = ENV.isDev;
  }
  
  log(...args) {
    if (this.isDev) console.log(`[${this.module}]`, ...args);
  }
  
  warn(...args) {
    if (this.isDev) console.warn(`[${this.module}]`, ...args);
  }
  
  error(...args) {
    console.error(`[${this.module}]`, ...args);
  }
}

// Usage
import { Logger } from './logger.js';
const logger = new Logger('MapManager');
logger.log('Map initialized'); // Only in dev
```

---

## ✅ BUGS CORRIGIDOS

Bugs que foram identificados e resolvidos.

### ✅ 9. getCompanyColor is not a function
- **Status:** ✅ **CORRIGIDO**
- **Data:** 2026-01-20 17:42
- **Commit:** [a7125f0](https://github.com/Remotar-10/geoclient-sp/commit/a7125f0a3671b1eb96c49160ed68edfdd90a4b39)
- **Módulo:** NavigationManager, SearchManager
- **Descrição:** Managers tentavam chamar método inexistente no MapManager
- **Solução:** Implementar método local usando COMPANIES config

---

### ✅ 10. Busca Não Funcionando
- **Status:** ✅ **CORRIGIDO**
- **Data:** 2026-01-20 17:38
- **Commit:** [ed503c4](https://github.com/Remotar-10/geoclient-sp/commit/ed503c468e93a743121d66ee1c365001afe8d217)
- **Módulo:** SearchManager
- **Descrição:** Sistema de busca não estava integrado
- **Solução:** Criar SearchManager e integrar no App

---

### ✅ 11. Empresas Com Cores Erradas
- **Status:** ✅ **CORRIGIDO**
- **Data:** 2026-01-20 16:45
- **Commit:** [7e4a193](https://github.com/Remotar-10/geoclient-sp/commit/7e4a193)
- **Módulo:** MapManager
- **Descrição:** Cidades mostravam cores incorretas no mapa
- **Solução:** Corrigir lógica de getCityColor()

---

## 📄 RESUMO POR PRIORIDADE

| Prioridade | Total | Críticos | Pendentes | Corrigidos |
|------------|-------|----------|-----------|------------|
| P0 - CRÍTICA | 0 | 0 | 0 | 0 |
| P1 - ALTA | 2 | 0 | 2 | 0 |
| P2 - MÉDIA | 3 | 0 | 3 | 0 |
| P3 - BAIXA | 3 | 0 | 3 | 0 |
| **CORRIGIDOS** | **3** | - | - | **3** |
| **TOTAL** | **11** | **0** | **8** | **3** |

---

## 📈 MÉTRICAS DE QUALIDADE

### Taxa de Correção
- **Bugs identificados:** 11
- **Bugs corrigidos:** 3
- **Taxa de correção:** 27.3%

### Distribuição por Módulo
- ReportsManager: 1 bug
- ActivityManager: 1 bug
- Config: 1 bug
- FilterManager: 1 bug
- Toast: 1 bug
- UI: 1 bug
- MapManager: 1 bug
- Global: 1 bug
- NavigationManager: 1 bug (corrigido)
- SearchManager: 2 bugs (2 corrigidos)

### Estabilidade Geral
- ✅ **0 bugs críticos**
- ✅ **0 bugs bloqueadores**
- 🟡 **2 bugs P1** (com workarounds)
- 🟢 **6 bugs P2/P3** (melhorias)

**Status:** 🟢 **SISTEMA ESTÁVEL PARA PRODUÇÃO**

---

## 🔧 COMO REPORTAR BUGS

1. **Verificar se é bug conhecido:** Consultar esta lista primeiro
2. **Executar diagnóstico:**
   ```javascript
   await checkBugs()
   ```
3. **Coletar informações:**
   - Navegador e versão
   - Sistema operacional
   - Passos para reproduzir
   - Screenshots se possível
   - Mensagens de erro do console
4. **Criar issue no GitHub** com template:

```markdown
### 🐞 Bug Report

**Módulo:** [nome do módulo]
**Prioridade:** [P0/P1/P2/P3]

**Descrição:**
[descrição clara do problema]

**Passos para reproduzir:**
1. ...
2. ...
3. ...

**Comportamento esperado:**
[o que deveria acontecer]

**Comportamento atual:**
[o que acontece]

**Ambiente:**
- Navegador: Chrome 120
- OS: Windows 11
- Versão GeoClient: 4.2.0

**Screenshots:**
[se aplicável]

**Console errors:**
```
[copiar erros]
```
```

---

## 🚀 ROADMAP DE CORREÇÕES

### Sprint 1 (Próxima semana)
- ✅ Corrigir getCompanyColor (FEITO)
- ✅ Corrigir busca (FEITO)
- 🟡 Implementar Export PDF
- 🟡 Adicionar tab Histórico

### Sprint 2 (2 semanas)
- Atualizar versão no config
- Melhorar filtros vazios
- Implementar toast deduplication

### Sprint 3 (3 semanas)
- Persistir estado sidebar
- Otimizar zoom mobile
- Implementar logger system

---

**Última revisão:** 2026-01-20 17:53  
**Próxima revisão:** 2026-01-27
