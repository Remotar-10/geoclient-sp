# 🧪 Tests - GeoClient SP

> **Status**: 🟡 Estrutura Criada  
> **Última Atualização**: 27 de Janeiro de 2026  

---

## 🎯 Objetivo

Este diretório contém todos os testes do GeoClient SP, organizados por tipo:

- **Unit Tests**: Testes de funções individuais e módulos isolados
- **Integration Tests**: Testes de interação entre módulos
- **E2E Tests**: Testes end-to-end do fluxo completo da aplicação

---

## 📁 Estrutura

```
tests/
├── README.md           # Este arquivo
├── unit/               # Testes unitários
│   ├── utils.test.js
│   ├── storage-manager.test.js
│   ├── companies-manager.test.js
│   └── ...
├── integration/        # Testes de integração
│   ├── map-city-interaction.test.js
│   ├── search-navigation.test.js
│   └── ...
└── e2e/                # Testes E2E
    ├── full-flow.spec.js
    ├── import-export.spec.js
    └── ...
```

---

## 🛠️ Ferramentas Recomendadas

### Unit & Integration Tests
- **Vitest**: Framework moderno para testes JavaScript/ES6
- **Jest**: Alternativa popular
- **Istanbul/c8**: Cobertura de código

### E2E Tests
- **Playwright**: Testes cross-browser modernos
- **Cypress**: Alternativa popular
- **Puppeteer**: Controle programático do Chrome

---

## 🚀 Como Executar Testes (Futuro)

```bash
# Instalar dependências
npm install

# Executar todos os testes
npm test

# Executar apenas unit tests
npm run test:unit

# Executar apenas integration tests
npm run test:integration

# Executar apenas E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

---

## 📝 Exemplo de Teste Unitário

```javascript
// tests/unit/utils.test.js
import { describe, it, expect } from 'vitest';
import utils from '../../js/modules/utils.js';

describe('Utils Module', () => {
  describe('normalizeString', () => {
    it('deve remover acentos', () => {
      expect(utils.normalizeString('São Paulo')).toBe('Sao Paulo');
    });
    
    it('deve converter para lowercase', () => {
      expect(utils.normalizeString('TESTE')).toBe('teste');
    });
  });
  
  describe('formatDate', () => {
    it('deve formatar data corretamente', () => {
      const date = new Date('2026-01-27T10:00:00');
      expect(utils.formatDate(date)).toMatch(/27\/01\/2026/);
    });
  });
});
```

---

## 📝 Exemplo de Teste de Integração

```javascript
// tests/integration/map-city-interaction.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import { MapManager } from '../../js/modules/map-manager.js';
import { StorageManager } from '../../js/modules/storage-manager.js';

describe('Map & Storage Integration', () => {
  let mapManager, storageManager;
  
  beforeEach(() => {
    mapManager = new MapManager({ mapElementId: 'test-map' });
    storageManager = new StorageManager();
  });
  
  it('deve salvar cidade marcada no storage', async () => {
    const cityName = 'São Paulo';
    const companies = ['CDO', 'SUPORTE'];
    
    await mapManager.markCity(cityName, companies);
    
    const saved = storageManager.getMarkedCities();
    expect(saved[cityName]).toBeDefined();
    expect(saved[cityName].companies).toEqual(companies);
  });
});
```

---

## 📝 Exemplo de Teste E2E

```javascript
// tests/e2e/full-flow.spec.js
import { test, expect } from '@playwright/test';

test.describe('GeoClient SP - Full Flow', () => {
  test('deve permitir marcar cidade e exportar CSV', async ({ page }) => {
    // 1. Navegar para a aplicação
    await page.goto('https://remotar-10.github.io/geoclient-sp/index-es6.html');
    
    // 2. Aguardar carregamento
    await page.waitForSelector('#map');
    
    // 3. Buscar cidade
    await page.fill('#city-search', 'São Paulo');
    await page.click('.search-result-item');
    
    // 4. Adicionar empresa
    await page.click('text=Adicionar Empresa');
    await page.click('text=CDO');
    
    // 5. Verificar cidade marcada
    const stats = await page.textContent('#stat-occupied');
    expect(stats).toBe('1');
    
    // 6. Exportar CSV
    const downloadPromise = page.waitForEvent('download');
    await page.click('#btn-export-csv');
    const download = await downloadPromise;
    
    expect(download.suggestedFilename()).toMatch(/geoclient.*\.csv/);
  });
});
```

---

## ✅ Cobertura Alvo

### Unit Tests
- [x] utils.js - 90%+
- [ ] config.js - 100%
- [ ] storage-manager.js - 85%+
- [ ] activity-manager.js - 80%+
- [ ] companies-manager.js - 85%+
- [ ] filter-manager.js - 80%+
- [ ] search-manager.js - 85%+
- [ ] dashboard-manager.js - 75%+
- [ ] reports-manager.js - 75%+
- [ ] navigation-manager.js - 70%+
- [ ] ui-manager.js - 70%+
- [ ] map-manager.js - 60%+ (complexo)

### Integration Tests
- [ ] Map + Storage - 80%+
- [ ] Search + Navigation - 80%+
- [ ] Filter + Dashboard - 75%+
- [ ] Export + Reports - 80%+

### E2E Tests
- [ ] Full user flow - Marcar cidade
- [ ] Import/Export flow
- [ ] Search + Zoom flow
- [ ] Sidebar toggle flow

**Meta Geral**: 75%+ de cobertura total

---

## 📅 Roadmap de Testes

### Sprint 1 (Fase 3)
- [ ] Setup Vitest + configuração
- [ ] Testes unitários de utils
- [ ] Testes unitários de storage
- [ ] Testes unitários de companies

### Sprint 2 (Fase 4)
- [ ] Testes de integração Map + Storage
- [ ] Testes de integração Search + Navigation
- [ ] Setup Playwright
- [ ] Primeiro teste E2E

### Sprint 3 (Pós-Fase 4)
- [ ] Cobertura completa de todos os módulos
- [ ] CI/CD com testes automáticos
- [ ] Badges de cobertura no README

---

## 📚 Recursos

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Jest Documentation](https://jestjs.io/)
- [Testing Best Practices](https://testingjavascript.com/)

---

**Status**: 🟡 Estrutura criada, aguardando implementação dos testes  
**Última Atualização**: 27 de Janeiro de 2026  
**Mantenedor**: Remotar-10  
