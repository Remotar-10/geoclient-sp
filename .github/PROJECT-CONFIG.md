# Configuração do Projeto - GeoClient SP

## 📋 Características Técnicas

### Tipo de Projeto
- **Stack**: Frontend estático (HTML/CSS/JS puro)
- **Framework**: Vanilla JavaScript (sem frameworks)
- **Mapa**: Leaflet.js (CDN)
- **Hospedagem**: GitHub Pages
- **Deploy**: Automático via GitHub Actions

### Dependencies e Build
- ❌ **Não usa npm/yarn** - Sem package.json
- ❌ **Não precisa build** - Código já em produção
- ✅ **CDN apenas** - Leaflet, Bootstrap via CDN
- ✅ **Node.js** - Usado apenas para mapshaper (otimização GeoJSON)

### Estrutura de Arquivos
```
geoclient-sp/
├── index.html              # Página principal
├── css/
│   └── styles.css         # Estilos customizados
├── js/
│   ├── main.js            # Core da aplicação
│   ├── dashboard.js       # Dashboard e estatísticas
│   └── activity-logger.js # Sistema de logs
├── components/
│   ├── navbar.js          # Componente de navegação
│   ├── modal.js           # Modais do sistema
│   ├── filters.js         # Sistema de filtros
│   └── map-controls.js    # Controles do mapa
├── data/
│   └── municipios-sp.geojson  # GeoJSON dos municípios (~4-5 MB)
└── .github/
    └── workflows/
        └── deploy.yml     # Workflow de deploy
```

---

## ⚙️ Regras para GitHub Actions Workflows

### ❌ O Que NUNCA Fazer

1. **Nunca adicionar cache npm/yarn**
   ```yaml
   # ❌ ERRADO - Projeto não tem package.json
   - uses: actions/setup-node@v4
     with:
       cache: 'npm'
   ```
   
   ```yaml
   # ✅ CORRETO
   - uses: actions/setup-node@v4
     with:
       node-version: '20'
   ```

2. **Nunca otimizar GeoJSON sem verificar mudanças**
   ```yaml
   # ❌ ERRADO - Roda sempre (lento)
   - name: Optimize GeoJSON
     run: mapshaper ...
   ```
   
   ```yaml
   # ✅ CORRETO - Verifica antes
   - name: Check if GeoJSON changed
     id: check
     run: |
       if git diff --name-only HEAD~1 HEAD | grep -q "municipios-sp.geojson"; then
         echo "changed=true" >> $GITHUB_OUTPUT
       fi
   
   - name: Optimize GeoJSON
     if: steps.check.outputs.changed == 'true'
     run: mapshaper ...
   ```

3. **Nunca incluir documentação pesada no deploy**
   ```yaml
   # ❌ ERRADO - Copia tudo (lento)
   cp -r * _site/
   ```
   
   ```yaml
   # ✅ CORRETO - Apenas essenciais
   cp index.html _site/
   cp -r js css components data _site/
   # Exclui HISTORICO-*.md, .github, etc
   ```

### ✅ Boas Práticas

1. **Usar fetch-depth: 2 para comparações**
   ```yaml
   - uses: actions/checkout@v4
     with:
       fetch-depth: 2  # Permite git diff HEAD~1
   ```

2. **Timeout adequado**
   ```yaml
   timeout: 300000  # 5 minutos (suficiente)
   ```

3. **Concurrency para evitar deploys duplicados**
   ```yaml
   concurrency:
     group: "pages"
     cancel-in-progress: true
   ```

---

## 🚀 Tempos de Deploy Esperados

### Cenário 1: Alteração em JS/CSS (90% dos casos)
```
✅ GeoJSON unchanged - skipping optimization
📦 Building optimized artifact...
⏱️ Tempo total: ~60-90 segundos
```

### Cenário 2: Alteração no GeoJSON (raro)
```
⚠️ GeoJSON was modified - optimization will run
🔧 Installing optimization tools...
⏱️ Tempo total: ~2-3 minutos
```

### Cenário 3: Primeiro deploy ou GeoJSON >5MB
```
⚠️ GeoJSON needs optimization (>5 MB)
🗜️ Simplifying geometries...
⏱️ Tempo total: ~4-5 minutos
```

---

## 📊 Limites e Quotas

### GitHub Actions (Repositório Público)
- **Minutos/mês**: ♾️ ILIMITADO
- **Storage**: 500 MB (artifacts temporários)
- **Concurrent jobs**: 20 simultâneos
- **Custo**: R$ 0,00 (GRATUITO)

### GitHub Pages
- **Bandwidth**: 100 GB/mês
- **Storage**: 1 GB
- **Builds**: 10 por hora
- **Custo**: R$ 0,00 (GRATUITO)

---

## 🔧 Troubleshooting

### Erro: "Dependencies lock file is not found"
**Causa**: Adicionou `cache: 'npm'` no workflow  
**Solução**: Remover linha `cache: 'npm'`

### Erro: "GeoJSON file not found"
**Causa**: Path incorreto no workflow  
**Solução**: Usar `data/municipios-sp.geojson`

### Deploy muito lento (>5 minutos)
**Causa**: Otimização de GeoJSON rodando sempre  
**Solução**: Adicionar verificação condicional (já implementado)

### Artifact muito grande (>10 MB)
**Causa**: Incluindo HISTORICO-*.md no deploy  
**Solução**: Copiar apenas js/, css/, components/, data/

---

## 📝 Checklist de Manutenção

### Antes de Modificar Workflows
- [ ] Validar YAML com [yamllint](https://www.yamllint.com/)
- [ ] Verificar se não adiciona cache npm/yarn
- [ ] Confirmar paths existem no projeto
- [ ] Testar com `workflow_dispatch` antes de `push`
- [ ] Documentar mudanças neste arquivo

### Ao Adicionar Nova Empresa
- [ ] Atualizar array `availableCompanies` em `main.js`
- [ ] Adicionar cor em `getCompanyColor()` em `main.js`
- [ ] Testar marcação no mapa
- [ ] Commit e aguardar deploy (~60s)

### Ao Atualizar GeoJSON
- [ ] Verificar tamanho do arquivo (<5 MB ideal)
- [ ] Commit separado (não misturar com código)
- [ ] Deploy automático otimizará (~2-3 min)
- [ ] Verificar no mapa se carregou corretamente

---

## 🎯 Versão Atual

**GeoClient SP v3.0.1**
- 6 empresas: CDO, SUPORTE, WAUX, MONTEBELLO, HIRATA, LUBMULTI
- 645 municípios de São Paulo
- Activity Logger integrado
- Filtros por empresa, segmento e status
- Sistema de busca de cidades
- Dashboard com estatísticas
- Deploy otimizado (~60s)

---

**Última atualização**: 15/01/2026  
**Mantido por**: Remotar-10  
**Documentação completa**: [README.md](../README.md)