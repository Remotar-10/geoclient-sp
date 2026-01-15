# Checklist Pré-Commit

## 📝 Antes de Fazer Qualquer Commit

### Verificações Básicas
- [ ] Código testado localmente (abrir `index.html` no navegador)
- [ ] Console sem erros (F12 no navegador)
- [ ] Commit message descritivo e claro
- [ ] Apenas uma funcionalidade/correção por commit

---

## 🔧 Ao Modificar Workflows (`.github/workflows/*.yml`)

### Validação de YAML
- [ ] Validei sintaxe em https://www.yamllint.com/
- [ ] Indentação correta (2 espaços)
- [ ] Sem tabs (apenas espaços)

### Configurações Específicas
- [ ] **NÃO** adicionei `cache: 'npm'` ou `cache: 'yarn'`
- [ ] Paths estão corretos (ex: `data/municipios-sp.geojson`)
- [ ] Timeout adequado (300000 = 5 min é suficiente)
- [ ] `fetch-depth: 2` presente (para git diff funcionar)

### Testes
- [ ] Testei com `workflow_dispatch` (manual) primeiro
- [ ] Li documentação: `.github/WORKFLOWS.md`
- [ ] Verifiquei `.github/PROJECT-CONFIG.md`

---

## 🗺️ Ao Modificar Código JavaScript

### `js/main.js`
- [ ] Versão atualizada no cabeçalho (se necessário)
- [ ] `availableCompanies` tem 6 empresas
- [ ] `getCompanyColor()` tem cores para todas empresas
- [ ] Testei sistema de cliques (1 clique = zoom, 2 cliques = dropdown)
- [ ] LocalStorage funcionando (dados persistem após reload)

### `js/dashboard.js`
- [ ] Estatísticas calculando corretamente
- [ ] Gráficos renderizando (se aplicável)
- [ ] Filtros aplicando aos dados

### `components/*.js`
- [ ] Web Components registrados corretamente
- [ ] Event listeners não duplicando
- [ ] Sem console.log desnecessários

---

## 🎨 Ao Modificar CSS

### `css/styles.css`
- [ ] Testei em diferentes resoluções (responsive)
- [ ] Cores consistentes com o tema
- [ ] Sem !important desnecessário
- [ ] Testei dark mode (se aplicável)

---

## 🗺️ Ao Modificar GeoJSON

### `data/municipios-sp.geojson`
- [ ] Arquivo válido (testar em https://geojson.io/)
- [ ] Tamanho <5 MB (ideal)
- [ ] 645 features (municípios de SP)
- [ ] Propriedade `name` presente em todas features
- [ ] **Commit SEPARADO** (não misturar com código)

### Observações
- ⚠️ Deploy demorará ~2-3 min (otimização automática)
- ✅ Workflow detecta automaticamente e otimiza se >5 MB

---

## 📄 Ao Modificar HTML

### `index.html`
- [ ] Links CDN funcionando (Leaflet, Bootstrap)
- [ ] Todos scripts carregando na ordem correta
- [ ] Meta tags presentes (viewport, charset)
- [ ] Sem erros no console do navegador

---

## 📚 Ao Modificar Documentação

### `README.md`
- [ ] Versão atualizada (se mudou funcionalidade)
- [ ] Screenshots atualizados (se necessário)
- [ ] Instruções claras e testadas
- [ ] Links funcionando

### `.github/*.md`
- [ ] Informações precisas e atualizadas
- [ ] Exemplos de código corretos
- [ ] Referências válidas

---

## ➕ Ao Adicionar Nova Empresa

### Passos Necessários

#### 1. Atualizar `js/main.js`
```javascript
// Adicionar em availableCompanies (linha ~49)
this.availableCompanies = ['CDO', 'SUPORTE', 'WAUX', 'MONTEBELLO', 'HIRATA', 'LUBMULTI', 'NOVA_EMPRESA'];

// Adicionar cor em getCompanyColor() (linha ~241)
getCompanyColor(company) {
    const colors = {
        'CDO': '#ef4444',
        'SUPORTE': '#3b82f6',
        'WAUX': '#10b981',
        'MONTEBELLO': '#f59e0b',
        'HIRATA': '#8b5cf6',
        'LUBMULTI': '#6b7280',
        'NOVA_EMPRESA': '#ec4899'  // <- Adicionar aqui
    };
    return colors[company] || '#6b7280';
}
```

#### 2. Checklist
- [ ] Nome em maiúsculas (padrão)
- [ ] Cor única (não repetir cores existentes)
- [ ] Testei marcação no mapa
- [ ] Testei filtro por empresa
- [ ] Testei export/import CSV

#### 3. Commit
```bash
git add js/main.js
git commit -m "✨ Adiciona empresa NOVA_EMPRESA ao sistema"
git push
```

---

## 🐛 Ao Corrigir Bugs

### Checklist Específica
- [ ] Identifiquei a causa raiz
- [ ] Corrigi o problema (não apenas o sintoma)
- [ ] Testei o cenário que causava o bug
- [ ] Testei cenários relacionados
- [ ] Commit message explica o bug e a solução

### Formato de Commit
```bash
git commit -m "🐛 Fix: Dropdown não abrindo após 2 cliques

Problema: clickTimer não resetando corretamente
Solução: Clearar timer antes de iniciar novo"
```

---

## 🚀 Antes do Push Final

### Revisão Final
- [ ] Revisei todos os arquivos modificados
- [ ] Removi console.log desnecessários
- [ ] Removi comentários TODO/FIXME resolvidos
- [ ] Código comentado (quando necessário)
- [ ] Commit message segue padrão:
  - ✨ feat: nova funcionalidade
  - 🐛 fix: correção de bug
  - 📝 docs: documentação
  - 🎨 style: formatação/CSS
  - ♻️ refactor: refatoração
  - ⚡ perf: melhoria de performance
  - ✅ test: testes

### Verificação Pós-Push
- [ ] Acessar: https://github.com/Remotar-10/geoclient-sp/actions
- [ ] Aguardar deploy finalizar (~60-90s)
- [ ] Verificar se workflow passou (checkmark verde)
- [ ] Acessar site: https://remotar-10.github.io/geoclient-sp/
- [ ] Testar funcionalidade modificada

---

## ⚠️ Em Caso de Erro no Deploy

### Não Entrar em Pânico!

1. **Verificar erro no Actions**
   - GitHub → Actions → Workflow falhado → Ver logs

2. **Problemas Comuns**
   - Erro de sintaxe YAML → Validar em yamllint.com
   - Erro "lock file not found" → Remover `cache: 'npm'`
   - Erro de path → Verificar se arquivo existe

3. **Solução Rápida**
   ```bash
   # Reverter último commit
   git revert HEAD --no-edit
   git push
   
   # Ou corrigir e commitar fix
   # (editar arquivo)
   git add .
   git commit -m "🔧 Fix: corrige erro no workflow"
   git push
   ```

4. **Consultar documentação**
   - `.github/WORKFLOWS.md` → Troubleshooting completo
   - `.github/PROJECT-CONFIG.md` → Regras do projeto

---

## 📊 Performance Esperada

### Deploy Normal (90% dos commits)
- ⏱️ **Tempo**: 60-90 segundos
- 📦 **Artifact**: ~5-8 MB
- ✅ **Status**: Checkmark verde

### Se Demorar Mais
- 🔍 Verificar se GeoJSON foi modificado (normal demorar 2-3 min)
- 🔍 Verificar se há fila de workflows
- 🔍 Consultar: https://www.githubstatus.com/

---

## 📖 Referências Rápidas

- **Workflows**: `.github/WORKFLOWS.md`
- **Config do Projeto**: `.github/PROJECT-CONFIG.md`
- **README Principal**: `README.md`
- **Actions do Repo**: https://github.com/Remotar-10/geoclient-sp/actions
- **Site Live**: https://remotar-10.github.io/geoclient-sp/

---

**🎯 Lembre-se**: Commits pequenos e frequentes são melhores que commits grandes e raros!

**Última atualização**: 15/01/2026