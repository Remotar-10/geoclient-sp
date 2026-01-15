# Workflows do Projeto

## 📊 Visão Geral

O projeto possui workflows automatizados para deploy no GitHub Pages. Todos os workflows são **gratuitos** (repositório público = minutos ilimitados).

---

## 🚀 deploy.yml

### Descrição
Workflow principal de deploy automático para GitHub Pages.

### Trigger
- **Push** no branch `main`
- **Manual** via `workflow_dispatch`

### Etapas

#### 1. Checkout
```yaml
- uses: actions/checkout@v4
  with:
    fetch-depth: 2  # Permite comparação git diff
```
**Tempo**: ~3-5 segundos

#### 2. Setup Node.js
```yaml
- uses: actions/setup-node@v4
  with:
    node-version: '20'
```
**Tempo**: ~15-20 segundos  
**Nota**: SEM cache (projeto não tem package.json)

#### 3. Verificação de Mudanças no GeoJSON
```yaml
- name: Check if GeoJSON changed
  id: geojson-check
  run: |
    if git diff --name-only HEAD~1 HEAD | grep -q "municipios-sp.geojson"; then
      echo "changed=true" >> $GITHUB_OUTPUT
    else
      echo "changed=false" >> $GITHUB_OUTPUT
    fi
```
**Tempo**: ~2-3 segundos  
**Saída**: `changed=true` ou `changed=false`

#### 4. Otimização do GeoJSON (Condicional)
```yaml
- name: Smart GeoJSON Optimization
  if: steps.geojson-check.outputs.changed == 'true'
```
**Tempo**: 
- Se **não mudou**: 0s (pulado ✅)
- Se **mudou**: ~2-3 minutos
- Se **>5 MB**: ~4-5 minutos

**Ferramentas**:
- `jq` - Manipulação de JSON
- `mapshaper` - Simplificação de geometrias

#### 5. Build do Artifact
```yaml
- name: Build optimized artifact
  run: |
    mkdir -p _site
    cp index.html _site/
    cp -r js css components data _site/
    # Exclui HISTORICO-*.md, .github/
```
**Tempo**: ~10-15 segundos  
**Tamanho**: ~5-8 MB (otimizado)

#### 6. Upload & Deploy
```yaml
- uses: actions/upload-pages-artifact@v3
- uses: actions/deploy-pages@v4
  with:
    timeout: 300000  # 5 minutos
```
**Tempo**: ~20-30 segundos

### Tempo Total por Cenário

| Cenário | GeoJSON Mudou? | Tempo Total |
|----------|----------------|-------------|
| **Alteração JS/CSS** | ❌ Não | **~60-90s** ⭐ |
| **Alteração GeoJSON** | ✅ Sim (<5MB) | **~2-3 min** |
| **Otimização Completa** | ✅ Sim (>5MB) | **~4-5 min** |

### Requisitos
- ❌ **NÃO** requer `package.json`
- ❌ **NÃO** requer `node_modules`
- ✅ Node.js apenas para mapshaper (quando necessário)

### Configurações
```yaml
permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true  # Cancela deploys duplicados
```

---

## 🔧 Troubleshooting

### Erro: "Dependencies lock file is not found"

**Mensagem completa**:
```
Dependencies lock file is not found in /home/runner/work/geoclient-sp/geoclient-sp. 
Supported file patterns: package-lock.json,npm-shrinkwrap.json,yarn.lock
```

**Causa**:  
Adicionou `cache: 'npm'` no `setup-node`, mas o projeto não tem `package.json`.

**Solução**:
```yaml
# ❌ ERRADO
- uses: actions/setup-node@v4
  with:
    node-version: '20'
    cache: 'npm'  # <- REMOVER ESTA LINHA

# ✅ CORRETO
- uses: actions/setup-node@v4
  with:
    node-version: '20'
```

**Status**: ✅ Já corrigido no workflow atual

---

### Erro: "GeoJSON file not found"

**Mensagem completa**:
```
❌ GeoJSON file not found!
```

**Causa**:  
Path incorreto no script de otimização.

**Solução**:  
Verificar que o path é `data/municipios-sp.geojson`

```bash
# Verificar localmente
ls -lh data/municipios-sp.geojson
```

---

### Deploy Muito Lento (>5 minutos)

**Causa 1**: Otimização de GeoJSON rodando sempre

**Solução**:  
Já implementado! Workflow verifica se GeoJSON mudou antes de otimizar.

**Causa 2**: Artifact muito grande (>10 MB)

**Solução**:  
Excluir arquivos pesados:
```yaml
cp -r js css components data _site/
# NÃO copiar HISTORICO-*.md
```

**Causa 3**: Workflow em fila

**Solução**:  
Aguardar. Apenas 1 deploy roda por vez devido a:
```yaml
concurrency:
  group: "pages"
  cancel-in-progress: true
```

---

### Deploy Falhou mas Código Está Correto

**Causa**: GitHub Actions instabilidade momentânea

**Solução**:  
1. Re-executar workflow manualmente:
   - GitHub → Actions → Workflow falhado → "Re-run failed jobs"

2. Ou fazer commit vazio para trigger:
   ```bash
   git commit --allow-empty -m "🔄 Re-trigger deploy"
   git push
   ```

---

### Verificar Status do GitHub Actions

**Se múltiplos workflows falharem**:

1. Verificar status do GitHub: https://www.githubstatus.com/
2. Verificar Actions do projeto: https://github.com/Remotar-10/geoclient-sp/actions

---

## 📊 Monitoramento

### Verificar Tempo de Deploy

1. Acesse: https://github.com/Remotar-10/geoclient-sp/actions
2. Clique no workflow
3. Tempo aparece no topo (ex: "59s")

### Métricas Esperadas

| Métrica | Valor Normal | Alerta Se |
|---------|--------------|----------|
| **Tempo total** | 60-90s | >3 minutos |
| **Checkout** | 3-5s | >10s |
| **Setup Node** | 15-20s | >40s |
| **Build artifact** | 10-15s | >30s |
| **Upload** | 10-20s | >60s |
| **Deploy** | 10-20s | >60s |

---

## ✅ Checklist de Manutenção

### Antes de Modificar Workflows

- [ ] Validar YAML: https://www.yamllint.com/
- [ ] Verificar se não adiciona `cache: 'npm'`
- [ ] Confirmar paths existem no projeto
- [ ] Testar com `workflow_dispatch` antes de `push`
- [ ] Commit pequeno (uma mudança por vez)
- [ ] Aguardar resultado antes do próximo commit

### Após Deploy

- [ ] Verificar tempo (<2 minutos?)
- [ ] Acessar site: https://remotar-10.github.io/geoclient-sp/
- [ ] Testar funcionalidades principais
- [ ] Verificar console do navegador (sem erros?)

---

## 📖 Referências

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [GitHub Pages Docs](https://docs.github.com/en/pages)
- [Mapshaper](https://github.com/mbloch/mapshaper)
- [jq Manual](https://stedolan.github.io/jq/manual/)
- [Leaflet.js](https://leafletjs.com/)

---

## 📝 Histórico de Otimizações

### v1.0 (Original)
- Tempo: ~5-8 minutos
- Otimiza GeoJSON sempre
- Artifact: ~15 MB

### v2.0 (15/01/2026)
- Tempo: **~60-90s** ⭐
- Otimiza GeoJSON apenas se alterado
- Artifact: ~5-8 MB
- Removido cache npm (causava erro)
- Exclui documentação do deploy

### Redução Total
**85% mais rápido!** (de 5-8 min para ~60-90s)

---

**Última atualização**: 15/01/2026  
**Workflow Ativo**: `.github/workflows/deploy.yml`  
**Status**: ✅ Operacional e otimizado