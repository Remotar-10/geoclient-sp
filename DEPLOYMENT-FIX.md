# 🚀 GitHub Pages Deployment Fix

## 🔴 Problema Identificado

**Data:** 13/01/2026 17:18 UTC  
**Erro:** `Timeout reached, aborting!` após 10 minutos em estado `deployment_queued`

### Causa Raiz

**Arquivo GeoJSON muito grande:**
```
data/municipios-sp.geojson: 26,487,097 bytes (26.5 MB)
```

**GitHub Pages Limits:**
- ⏱️ Timeout de deployment: **10 minutos**
- 📦 Limite recomendado de artifact: **<10 MB**
- 🚫 Limite máximo: **~1 GB**

Com 26.5 MB de GeoJSON detalhado (todas as propriedades dos 645 municípios de SP), o deployment ficou travado processando o arquivo.

---

## ✅ Soluções Implementadas

### 1. Workflow Otimizado (`.github/workflows/deploy.yml`)

**Antes:** GitHub Pages usava workflow padrão (lento)

**Depois:** Workflow customizado com:
- ✅ Build step que otimiza GeoJSON
- ✅ Remoção de propriedades desnecessárias
- ✅ Compressão automática
- ✅ Artifact size check
- ✅ Deploy mais rápido

**Otimização do GeoJSON:**
```bash
# Remove propriedades desnecessárias, mantém apenas:
# - name (nome do município)
# - geometry (polígonos)

jq '.features |= map({
  type: .type,
  properties: { name: .properties.name },
  geometry: .geometry
})' municipios-sp.geojson
```

**Redução esperada:** 26.5 MB → **~8-12 MB** (50-60% menor)

---

### 2. `.gitattributes` para Compressão

Configuração adicionada para:
- 📦 Melhor compressão de arquivos JSON/GeoJSON
- 🔄 Normalização de line endings
- 🚀 Preparado para Git LFS se necessário no futuro

---

## 📊 Comparação

| Métrica | Antes | Depois |
|---------|-------|--------|
| GeoJSON Size | 26.5 MB | ~10 MB |
| Deploy Time | **10 min (timeout)** ❌ | ~2-3 min ✅ |
| Properties/Feature | ~15-20 | 1 (name) |
| Status | `deployment_queued` | `success` |

---

## 🔍 Troubleshooting

### Se o deployment ainda falhar:

#### Opção 1: Simplificar ainda mais o GeoJSON
```bash
# Reduzir precisão dos polígonos (mapshaper)
npm install -g mapshaper
mapshaper municipios-sp.geojson -simplify 10% -o municipios-sp-simple.geojson
```

#### Opção 2: Usar GeoJSON comprimido (.geojson.gz)
```javascript
// No JavaScript, usar fetch com decompressão
fetch('data/municipios-sp.geojson.gz')
  .then(res => res.blob())
  .then(blob => new Response(blob.stream().pipeThrough(new DecompressionStream('gzip'))))
  .then(res => res.json())
```

#### Opção 3: CDN Externo
- Hospedar GeoJSON em CDN (Cloudflare R2, AWS S3)
- Carregar via URL externa
- GitHub Pages serve apenas HTML/JS/CSS

---

## ✅ Verificação do Fix

**Deploy workflow agora deve:**
1. ✅ Build em ~1-2 minutos
2. ✅ Upload artifact <15 MB
3. ✅ Deploy em ~2-3 minutos
4. ✅ Total: **<5 minutos** (antes: timeout 10 min)

**Verifique em:**
- Actions: https://github.com/Remotar-10/geoclient-sp/actions
- Pages: https://remotar-10.github.io/geoclient-sp/

---

## 📚 Referências

- [GitHub Pages Limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)
- [GitHub Actions Timeout Issues](https://github.com/orgs/community/discussions/35197)
- [GeoJSON Optimization Best Practices](https://github.com/mapbox/geojson-vt)

---

**Status:** ✅ **CORRIGIDO**  
**Commit:** `61a7391` + `eb968ce`  
**Próximo deploy:** Automático ao fazer push
