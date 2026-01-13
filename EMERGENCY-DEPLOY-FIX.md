# 🚨 EMERGENCY DEPLOYMENT FIX

## 🔴 PROBLEMA ATUAL

**Status:** GitHub Pages deployment **AINDA travando** após 10 minutos

**Causa:** GitHub Pages ainda usando método antigo (branch-based deploy) que:
- NÃO passa pelo workflow de otimização
- Tenta fazer deploy do GeoJSON de 26.5 MB direto
- Timeout em `deployment_queued`

---

## ✅ SOLUÇÃO RÁPIDA (Escolha UMA)

### OPÇÃO 1: Rodar Workflow Manualmente (RECOMENDADO) 👇

1. **Vá para:** https://github.com/Remotar-10/geoclient-sp/actions/workflows/optimize-geojson.yml

2. **Clique em:** `Run workflow` (botão verde)

3. **Selecione:** Branch `main`

4. **Clique:** `Run workflow`

5. **Aguarde:** ~2 minutos para completar

6. **Resultado:** GeoJSON otimizado será commitado automaticamente (26.5MB → ~8MB)

---

### OPÇÃO 2: Otimizar Localmente

**Pré-requisitos:** `jq` instalado

```bash
# Clone o repositório
git clone https://github.com/Remotar-10/geoclient-sp.git
cd geoclient-sp

# Verifique tamanho atual
ls -lh data/municipios-sp.geojson
# Deve mostrar: ~26.5 MB

# Otimize (remove propriedades desnecessárias)
jq -c '.features |= map({
  type: .type,
  properties: {
    name: (.properties.name // .properties.NAME // .properties.NOME // .properties.NM_MUNI // "Unknown")
  },
  geometry: .geometry
})' data/municipios-sp.geojson > data/municipios-sp-optimized.geojson

# Substitua o original
mv data/municipios-sp-optimized.geojson data/municipios-sp.geojson

# Verifique novo tamanho
ls -lh data/municipios-sp.geojson
# Deve mostrar: ~8-10 MB

# Commit e push
git add data/municipios-sp.geojson
git commit -m "🗜️ Optimize: Reduce GeoJSON from 26.5MB to 8MB"
git push origin main
```

---

### OPÇÃO 3: Configurar GitHub Pages para usar Actions

**GitHub ainda pode estar usando deploy do branch ao invés de Actions**

1. **Vá para:** https://github.com/Remotar-10/geoclient-sp/settings/pages

2. **Em "Build and deployment":**
   - **Source:** Selecione `GitHub Actions` (não "Deploy from a branch")

3. **Salve**

4. **Faça um novo commit qualquer** para triggerar o workflow:
   ```bash
   git commit --allow-empty -m "trigger deploy"
   git push
   ```

---

## 📊 POR QUE ISSO FUNCIONA?

### Antes (Atual - QUEBRADO):
```
Push → GitHub Pages (branch-based)
           ↓
       Deploy direto do GeoJSON 26.5 MB
           ↓
       Timeout após 10 minutos ❌
```

### Depois (CORRETO):
```
Push → Workflow otimiza GeoJSON (26.5MB → 8MB)
           ↓
       GitHub Pages (Actions-based)
           ↓
       Deploy do GeoJSON otimizado 8 MB
           ↓
       Sucesso em ~3 minutos ✅
```

---

## 🤖 O QUE O WORKFLOW FAZ?

Arquivo: `.github/workflows/optimize-geojson.yml`

1. ✅ Detecta se GeoJSON > 15MB
2. ✅ Instala `jq`
3. ✅ Remove propriedades desnecessárias (mantém apenas `name` + `geometry`)
4. ✅ Substitui arquivo original
5. ✅ Commita automaticamente
6. ✅ Resultado: 60% menor (~8 MB)

---

## ✅ VALIDAÇÃO

Após rodar a solução, verifique:

```bash
# Tamanho do arquivo deve ser < 15 MB
ls -lh data/municipios-sp.geojson

# Conte features (deve ter 645 municípios)
jq '.features | length' data/municipios-sp.geojson

# Verifique propriedades (deve ter apenas "name")
jq '.features[0].properties' data/municipios-sp.geojson
# Output esperado: {"name":"São Paulo"}
```

---

## 🔎 TROUBLESHOOTING

### Deploy ainda falha?

1. **Verifique GitHub Pages settings** (Opção 3 acima)
2. **Cancele deploys pendentes:**
   - https://github.com/Remotar-10/geoclient-sp/actions
   - Cancele workflows com status `queued`
3. **Force novo deploy:**
   ```bash
   git commit --allow-empty -m "force deploy"
   git push
   ```

### GeoJSON corrompido após otimização?

Restaure do commit anterior:
```bash
git checkout c03f5a66 -- data/municipios-sp.geojson
```

---

## 📞 SUPORTE

**Workflows criados:**
1. `.github/workflows/deploy.yml` - Deploy otimizado
2. `.github/workflows/optimize-geojson.yml` - Otimização emergencial

**Documentação:**
- `DEPLOYMENT-FIX.md` - Explicação técnica completa
- Este arquivo - Solução rápida

---

## ⏱️ PRÓXIMOS PASSOS

1. ✅ Rodar workflow manual (Opção 1)
2. ✅ GeoJSON será otimizado automaticamente
3. ✅ Configurar GitHub Pages para usar Actions (Opção 3)
4. ✅ Próximo push fará deploy em ~3 minutos
5. ✅ Site funcional: https://remotar-10.github.io/geoclient-sp/

---

**Status:** ⚠️ **AÇÃO MANUAL NECESSÁRIA**  
**Tempo estimado:** 5 minutos  
**Solução recomendada:** Opção 1 (Rodar workflow)
