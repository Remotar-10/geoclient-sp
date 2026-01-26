# 🧪 Testes Automatizados - Sidebar Toggle

## 📝 Visão Geral

Script de testes automatizados para validar o funcionamento do **toggle da sidebar** e o **ajuste dos botões flutuantes** no GeoClient SP.

## 🚀 Como Usar

### 1️⃣ Modo Automático

Os testes executam **automaticamente** 2 segundos após o carregamento da página.

```javascript
// Aguarde 2 segundos após carregar a página
// Os testes vão rodar automaticamente no console
```

### 2️⃣ Modo Manual

Execute manualmente no **Console do DevTools**:

```javascript
// Executar todos os testes
testSidebar()

// Retorna:
// {
//   total: 10,
//   passed: 10,
//   failed: 0,
//   successRate: 100,
//   details: [...]
// }
```

## 🧪 Testes Inclusos

| # | Teste | Descrição |
|---|-------|------------|
| 1 | **Elementos DOM existem** | Verifica se sidebar, toggle button, map controls e body existem |
| 2 | **Estado inicial correto** | Confirma que sidebar começa aberta (sem classe `.collapsed`) |
| 3 | **Transições CSS configuradas** | Valida que todos os elementos têm `transition: 0.3s` |
| 4 | **Toggle colapsa sidebar** | Testa colapso da sidebar (340px → 60px) |
| 5 | **Toggle expande sidebar** | Testa expansão da sidebar (60px → 340px) |
| 6 | **Múltiplos toggles (5x)** | Valida 5 alternâncias consecutivas |
| 7 | **Posições dos botões ajustam** | Confirma que `.map-controls` e `#sidebar-toggle` movem |
| 8 | **Ícone muda corretamente** | Valida mudança do ícone (☰ ↔ ✕) |
| 9 | **Elementos escondem/mostram** | Testa visibilidade de `.sidebar-text`, `.search-box-top`, etc |
| 10 | **Larguras responsíveis corretas** | Confirma valores exatos: 340px (aberta) / 60px (fechada) |

## 📊 Saída no Console

### ✅ Exemplo de Sucesso (100%)

```
🧪 SIDEBAR TOGGLE - TESTES AUTOMATIZADOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 Elementos capturados: {
  sidebar: true,
  toggleButton: true,
  mapControls: true,
  body: true
}
✅ Elementos DOM existem - Todos os elementos encontrados
✅ Estado inicial correto - Sidebar: aberta, Body: sem classe
✅ Transições CSS configuradas - Sidebar: 0.3s ✓, Controls: 0.3s ✓, Toggle: 0.3s ✓
✅ Toggle colapsa sidebar - Width: 340px → 60px, Classes: ✓
✅ Toggle expande sidebar - Width: 60px → 340px, Classes removidas: ✓
✅ Múltiplos toggles (5x) - Todas as alternâncias funcionaram
✅ Botões ajustam posição - Controls: 20px → calc(50% - 100px), Toggle: 20px → 80px
✅ Ícone muda corretamente - Aberto: "☰", Fechado: "✕", Restaurado: "☰"
✅ Elementos escondem/mostram - Collapsed: todos escondidos, Expanded: todos visíveis
✅ Larguras responsíveis corretas - Collapsed: 60px (esperado: 60px), Expanded: 340px (esperado: 340px)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 RESUMO DOS TESTES
Total: 10 testes
✅ Passou: 10
❌ Falhou: 0
🎯 Taxa de Sucesso: 100%
✨ TODOS OS TESTES PASSARAM! Sistema 100% funcional.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### ❌ Exemplo de Falha

```
❌ Toggle colapsa sidebar - Width: 340px → 340px, Classes: ✗
⚠️ Alguns testes falharam. Verifique os detalhes acima.
```

## 🔧 Implementação Técnica

### Estrutura da Classe

```javascript
class SidebarToggleTests {
  constructor() {
    this.results = [];
    this.sidebar = null;
    this.toggleButton = null;
    this.mapControls = null;
    this.body = null;
  }

  async init() {
    await this.waitForDOM();
    this.captureElements();
    await this.runAllTests();
    this.showResults();
  }

  // Métodos de teste individuais...
}
```

### Métodos Auxiliares

| Método | Descrição |
|--------|------------|
| `waitForDOM()` | Aguarda DOM estar pronto |
| `captureElements()` | Captura referências dos elementos |
| `runAllTests()` | Executa todos os testes sequencialmente |
| `delay(ms)` | Helper para aguardar animações |
| `logResult()` | Registra resultado de cada teste |
| `getComputedValue()` | Obtém valor CSS computado |
| `parsePixels()` | Converte valor CSS para número |
| `showResults()` | Mostra resumo final |

## 📝 Detalhes dos Testes

### Teste 1: Elementos DOM Existem

```javascript
const allExist = this.sidebar && 
                 this.toggleButton && 
                 this.mapControls && 
                 this.body;
```

### Teste 3: Transições CSS

```javascript
const sidebarTransition = this.getComputedValue(this.sidebar, 'transition');
const hasTransitions = sidebarTransition.includes('0.3s');
```

### Teste 4: Toggle Colapsa

```javascript
const initialWidth = this.parsePixels(this.getComputedValue(this.sidebar, 'width'));
this.toggleButton.click();
await this.delay(400); // Aguardar animação
const finalWidth = this.parsePixels(this.getComputedValue(this.sidebar, 'width'));
const passed = finalWidth < initialWidth;
```

### Teste 7: Posições dos Botões

```javascript
// Estado expandido
const expandedRight = this.getComputedValue(this.mapControls, 'right');

// Colapsar
this.toggleButton.click();
await this.delay(400);

// Estado colapsado
const collapsedRight = this.getComputedValue(this.mapControls, 'right');
const controlsMoved = collapsedRight !== expandedRight;
```

## ⏱️ Timings

| Ação | Tempo |
|------|-------|
| Auto-execução após carregamento | 2000ms |
| Aguardar animações | 400ms |
| Delay entre testes | 200ms |
| Transição CSS (sidebar, controls, toggle) | 300ms |

## 🔍 Depuração

### Verificar Elementos

```javascript
const tester = new SidebarToggleTests();
await tester.waitForDOM();
tester.captureElements();

console.log({
  sidebar: tester.sidebar,
  toggleButton: tester.toggleButton,
  mapControls: tester.mapControls
});
```

### Executar Teste Individual

```javascript
const tester = new SidebarToggleTests();
await tester.waitForDOM();
tester.captureElements();
await tester.testToggleCollapse();
```

### Verificar Valores CSS

```javascript
const sidebar = document.getElementById('sidebar');
const width = window.getComputedStyle(sidebar).width;
const transition = window.getComputedStyle(sidebar).transition;

console.log({ width, transition });
```

## ⚡ Otimizações

1. **Delay Adequado**: Aguarda 400ms para animações de 300ms
2. **Restauração de Estado**: Sempre retorna sidebar ao estado expandido após testes
3. **Testes Sequenciais**: Executa um teste por vez para evitar conflitos
4. **Logs Coloridos**: Usa `console.log` com estilos para melhor visualização

## 📚 Referências

- **Arquivo Principal**: `js/test-sidebar-toggle.js`
- **CSS Relacionado**: `index-es6.html` (linhas 65-162)
- **JavaScript Relacionado**: `index-es6.html` (linhas 1077-1092)
- **Commit de Implementação**: [cec4f54](https://github.com/Remotar-10/geoclient-sp/commit/cec4f5416e224c1baa2203157bbb155039168ea3)

## 🐛 Resolução de Problemas

### Teste Falha: "Elementos DOM não existem"

**Causa**: Elementos não encontrados no DOM

**Solução**:
```javascript
// Verificar IDs no HTML
document.getElementById('sidebar')           // ✓
document.getElementById('sidebar-toggle')    // ✓
document.querySelector('.map-controls')      // ✓
```

### Teste Falha: "Transições não configuradas"

**Causa**: CSS transition faltando

**Solução**:
```css
.sidebar { transition: all 0.3s ease; }
.map-controls { transition: right 0.3s ease; }
#sidebar-toggle { transition: left 0.3s ease; }
```

### Teste Falha: "Larguras incorretas"

**Causa**: Valores CSS diferentes dos esperados

**Solução**:
```css
.sidebar { width: 340px; }
.sidebar.collapsed { width: 60px; }
```

## ✅ Checklist de Validação

Antes de fazer deploy:

- [ ] Todos os 10 testes passando (100%)
- [ ] Console sem erros JavaScript
- [ ] Sidebar colapsa/expande suavemente
- [ ] Botões ajustam posição
- [ ] Ícone muda corretamente
- [ ] Elementos escondem quando colapsado
- [ ] Larguras exatas (340px / 60px)

## 🚀 Próximos Passos

- [ ] Adicionar testes de responsividade mobile
- [ ] Testar em diferentes navegadores
- [ ] Adicionar testes de performance (FPS)
- [ ] Integrar com CI/CD
- [ ] Criar testes E2E com Playwright

---

**📌 Nota**: Este script é executado automaticamente. Para desabilitar, remova a linha do `index-es6.html`:

```html
<script type="module" src="js/test-sidebar-toggle.js"></script>
```
