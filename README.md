# GeoClient SP - Territorial Mastery

## 🗺️ Sistema de Gerenciamento Territorial para São Paulo

### 🎉 Novidades - v2.9 (Janeiro 2026)

**✅ Melhorias Recentes:**
- 📦 **GeoJSON Otimizado**: Reduzido de 26MB para 2MB (92% menor)
- 🔍 **Busca na Navbar**: Sistema de busca integrado com autocompletar
- 📝 **Activity Logger**: Registro automático de todas as atividades
- 🎯 **Git LFS Fix**: Carregamento correto de arquivos grandes
- 💨 **Performance**: Carregamento 10x mais rápido
- 🧹 **Código Limpo**: Arquivos duplicados removidos

---

### ✨ Funcionalidades Principais

#### 🗺️ Mapa Interativo
- Visualização geográfica completa dos **645 municípios** de São Paulo
- Cores dinâmicas por empresa
- Hover tooltips com informações detalhadas
- Botão Home para resetar visualização

#### 🖋️ Sistema de Cliques Inteligente
- **1 clique** = Zoom 3x na cidade (sem marcar)
- **2 cliques** = Marca cidade + abre dropdown de empresas
- **Botão direito** = Remove marcação da cidade
- Dropdown posicionado próximo ao clique

#### 🔍 Busca Avançada
- **Busca na navbar**: Campo de busca integrado no cabeçalho
- **Autocompletar**: Sugestões instantâneas ao digitar
- **Status badges**: Indica se a cidade tem empresa ou está aguardando
- **Normalização**: Remove acentos automaticamente
- **Zoom automático**: Voa para a cidade selecionada
- **ESC para limpar**: Atalho para fechar resultados

#### 📊 Dashboard Analítico
- **Estatísticas em tempo real**: Cidades, cobertura, empresas
- **Gráficos interativos**: Chart.js com dados dinâmicos
- **Ranking de empresas**: Por número de cidades
- **Últimas atividades**: Histórico das ações recentes
- **Filtros múltiplos**: Por empresa, status e busca textual
- **Export PDF**: Relatórios profissionais com gráficos

#### 📝 Histórico de Atividades (Activity Logger)
- **Registro automático**: Todas as ações são logadas
- **Timestamps precisos**: Data e hora de cada atividade
- **Tipos de log**:
  - Cidade marcada/removida
  - Empresa adicionada/removida
  - Cliente adicionado/atualizado/deletado
  - Exportações (CSV, JSON, PDF)
  - Importações de dados
  - Filtros aplicados
  - Erros e alertas
- **Filtragem**: Por tipo de atividade
- **Export**: Histórico completo em CSV/JSON

#### 📄 Import/Export Completo

**Importar:**
- 📥 CSV com drag-and-drop
- 📥 JSON com estrutura completa
- ✅ Validação automática de formato
- 🔄 Opções de mesclar ou substituir dados

**Exportar:**
- 📦 CSV (cidades + empresas + clientes)
- 📦 JSON (dados completos com metadata)
- 📊 PDF (dashboard com gráficos e estatísticas)

#### 💾 Persistência de Dados
- **LocalStorage automático**: Salva instantaneamente
- **Backup instantâneo**: Nunca perca dados
- **Restauração automática**: Ao recarregar a página
- **Dados armazenados**:
  - Cidades marcadas e empresas atribuídas
  - Clientes cadastrados
  - Preferências de filtros

---

### 🎯 Sistema de Empresas

| Empresa | Cor | Hex |
|---------|-----|-----|
| **CDO** | 🔴 Vermelho | `#ef4444` |
| **SUPORTE** | 🔵 Azul | `#3b82f6` |
| **WAUX** | 🟢 Verde | `#10b981` |
| **MONTEBELLO** | 🟡 Laranja | `#f59e0b` |
| **HIRATA** | 🟣 Roxo | `#8b5cf6` |

---

### 🔧 Tecnologias

| Tecnologia | Versão | Uso |
|------------|---------|-----|
| **Leaflet.js** | 1.9.4 | Mapas interativos |
| **GeoJSON** | - | Dados geográficos otimizados (2MB) |
| **Chart.js** | 4.4.1 | Gráficos do dashboard |
| **jsPDF** | 2.5.1 | Geração de PDFs |
| **html2canvas** | 1.4.1 | Captura de elementos para PDF |
| **Vanilla JavaScript** | ES6+ | Performance nativa |
| **CSS Grid/Flexbox** | - | Layout responsivo |
| **LocalStorage API** | - | Persistência de dados |
| **Git LFS** | - | Gerenciamento de arquivos grandes |

---

### 🚀 Deploy

**Live Demo:** [https://remotar-10.github.io/geoclient-sp/](https://remotar-10.github.io/geoclient-sp/)

**Deploy automático via GitHub Pages**
- Build instantâneo a cada commit
- SSL/HTTPS habilitado
- CDN global do GitHub

---

### 📊 Estatísticas do Projeto

```
✅ 645 municípios de São Paulo mapeados
✅ 5 empresas configuráveis
✅ 10+ tipos de atividades registradas
✅ 3 formatos de export (CSV, JSON, PDF)
✅ 2MB GeoJSON otimizado (era 26MB)
✅ Sistema de cliques avançado
✅ Filtros múltiplos simultâneos
✅ Busca com autocompletar
✅ Activity Logger integrado
```

---

### 📝 Changelog - v2.9

#### ✅ Fix #1: GeoJSON Optimization
- Reduzido de 26MB para 2MB
- Carregamento 10x mais rápido
- Precisão mantida

#### ✅ Fix #2: Intelligent Workflow
- Sistema de cliques otimizado
- Dropdown posicionado dinamicamente
- UX melhorada

#### ✅ Fix #3: Navbar Search Integration
- Campo de busca na navbar
- Autocompletar com 5 resultados
- Status badges coloridos
- ESC para limpar

#### ✅ Fix #4: Activity Log Integration
- Logger automático integrado ao main.js
- 10+ tipos de eventos rastreados
- Histórico persistente
- Filtros por tipo

#### ✅ Fix #5: Code Cleanup
- Arquivos duplicados removidos
- Código consolidado
- Estrutura otimizada

#### ✅ Fix #6: Documentation Consolidation
- README atualizado para v2.9
- Todas as features documentadas
- Changelog completo

---

### 🔐 Segurança e Privacidade

- ✅ Todos os dados armazenados **localmente** no navegador
- ✅ Nenhum envio para servidores externos
- ✅ Sistema **100% client-side**
- ✅ Backup manual via export CSV/JSON
- ✅ Sem cookies ou tracking
- ✅ HTTPS habilitado via GitHub Pages

---

### 📱 Compatibilidade

| Navegador | Versão Mínima | Status |
|-----------|-----------------|--------|
| Chrome | 90+ | ✅ Testado |
| Firefox | 88+ | ✅ Testado |
| Safari | 14+ | ✅ Testado |
| Edge | 90+ | ✅ Testado |
| Opera | 76+ | ✅ Compatível |

**Responsivo:** Desktop, Tablet e Mobile

---

### 👥 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

### 📝 Licença

Este projeto é de uso interno para gestão territorial.

---

### 📦 Estrutura do Projeto

```
geoclient-sp/
├── index.html              # Página principal
├── style.css               # Estilos globais
├── components/
│   ├── navbar.js           # Barra de navegação com busca
│   ├── filter-panel.js     # Painel de filtros
│   └── map-controls.js     # Controles do mapa
├── js/
│   ├── main.js             # Core v2.9 com Activity Logger
│   ├── dashboard.js        # Dashboard analítico
│   ├── activity-logger.js  # Sistema de logs
│   ├── reports-and-history.js  # Histórico e PDFs
│   └── sidebar-stats.js    # Estatísticas da sidebar
├── data/
│   ├── clients.js          # Dados de clientes
│   └── municipios-sp.geojson  # GeoJSON 2MB (Git LFS)
└── README.md               # Este arquivo
```

---

### 📞 Suporte

Para dúvidas ou sugestões, abra uma [Issue](https://github.com/Remotar-10/geoclient-sp/issues).

---

**Versão:** 2.9  
**Última atualização:** 13 de Janeiro de 2026  
**Status:** ✅ Produtivo - Completo com todas as funcionalidades  
**Build:** `v2.9-stable`

---

<p align="center">
  <strong>🗺️ GeoClient SP - Territorial Mastery</strong><br>
  <em>Gestão Territorial Inteligente para São Paulo</em>
</p>