/**
 * 🏬 FILTRO VISUAL POR EMPRESA - GeoClient SP v5.0
 * 
 * Permite filtrar cidades por empresa no mapa
 * - Dropdown com checkboxes de empresas
 * - Filtra visualmente o mapa (opacidade)
 * - Atualiza estatísticas dinamicamente
 * - Sincroniza com busca e sidebar
 * 
 * @author GeoClient SP Team
 * @version 5.0
 */

class CompanyFilter {
    constructor(app) {
        this.app = app;
        this.selectedCompanies = new Set(); // Empresas selecionadas para filtro
        this.isActive = false; // Se o filtro está ativo
        
        this.companies = [
            { name: 'CDO', color: '#ef4444' },
            { name: 'SUPORTE', color: '#3b82f6' },
            { name: 'WAUX', color: '#10b981' },
            { name: 'MONTEBELLO', color: '#f59e0b' },
            { name: 'HIRATA', color: '#8b5cf6' }
        ];
        
        this.init();
    }
    
    init() {
        this.setupElements();
        this.setupEventListeners();
        this.renderOptions();
        console.log('🏬 Filtro de Empresa inicializado');
    }
    
    setupElements() {
        this.filterBtn = document.getElementById('company-filter-btn');
        this.filterDropdown = document.getElementById('company-filter-dropdown');
        this.filterText = document.getElementById('company-filter-text');
        this.filterOptions = document.getElementById('company-filter-options');
    }
    
    setupEventListeners() {
        // Toggle dropdown
        this.filterBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleDropdown();
        });
        
        // Fecha dropdown ao clicar fora
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.company-filter-container')) {
                this.closeDropdown();
            }
        });
        
        // Escuta eventos de mudança de dados
        window.addEventListener('cityDataChanged', () => {
            this.updateCounts();
            if (this.isActive) {
                this.applyFilter();
            }
        });
    }
    
    renderOptions() {
        const counts = this.getCompanyCounts();
        
        const allOption = `
            <div class="company-filter-option" data-company="all">
                <div class="company-filter-checkbox">
                    <span class="company-filter-checkmark">✓</span>
                </div>
                <span class="company-filter-label">Todas</span>
                <span class="company-filter-count">${Object.values(counts).reduce((a, b) => a + b, 0)}</span>
            </div>
        `;
        
        const companyOptions = this.companies.map(company => {
            const count = counts[company.name] || 0;
            return `
                <div class="company-filter-option" data-company="${company.name}">
                    <div class="company-filter-checkbox">
                        <span class="company-filter-checkmark">✓</span>
                    </div>
                    <div class="company-filter-color" style="background: ${company.color}"></div>
                    <span class="company-filter-label">${company.name}</span>
                    <span class="company-filter-count">${count}</span>
                </div>
            `;
        }).join('');
        
        this.filterOptions.innerHTML = allOption + companyOptions;
        
        // Adiciona event listeners
        this.filterOptions.querySelectorAll('.company-filter-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const company = option.dataset.company;
                this.toggleCompany(company);
            });
        });
    }
    
    toggleCompany(company) {
        if (company === 'all') {
            this.clearFilter();
            return;
        }
        
        if (this.selectedCompanies.has(company)) {
            this.selectedCompanies.delete(company);
        } else {
            this.selectedCompanies.add(company);
        }
        
        this.updateUI();
        this.applyFilter();
        
        // Log de atividade
        if (this.app.activityLogger) {
            const action = this.selectedCompanies.has(company) ? 'filtrado' : 'desfiltrado';
            this.app.activityLogger.log(`🏬 Empresa ${company} ${action}`);
        }
    }
    
    clearFilter() {
        this.selectedCompanies.clear();
        this.isActive = false;
        this.updateUI();
        this.removeFilter();
        
        if (this.app.activityLogger) {
            this.app.activityLogger.log('🏬 Filtro limpo - todas as empresas visíveis');
        }
    }
    
    updateUI() {
        // Atualiza opções visuais
        const options = this.filterOptions.querySelectorAll('.company-filter-option');
        options.forEach(option => {
            const company = option.dataset.company;
            
            if (company === 'all') {
                if (this.selectedCompanies.size === 0) {
                    option.classList.add('selected');
                } else {
                    option.classList.remove('selected');
                }
            } else {
                if (this.selectedCompanies.has(company)) {
                    option.classList.add('selected');
                } else {
                    option.classList.remove('selected');
                }
            }
        });
        
        // Atualiza botão
        if (this.selectedCompanies.size > 0) {
            this.filterBtn.classList.add('active');
            this.isActive = true;
            
            if (this.selectedCompanies.size === 1) {
                const company = Array.from(this.selectedCompanies)[0];
                this.filterText.textContent = company;
            } else {
                this.filterText.textContent = `${this.selectedCompanies.size} empresas`;
            }
        } else {
            this.filterBtn.classList.remove('active');
            this.isActive = false;
            this.filterText.textContent = 'Filtrar';
        }
    }
    
    applyFilter() {
        if (!this.app || !this.app.cityLayers) return;
        
        const allCities = Object.keys(this.app.cityLayers);
        
        allCities.forEach(cityName => {
            const layer = this.app.cityLayers[cityName];
            const cityData = this.app.markedCities[cityName];
            
            let shouldShow = false;
            
            if (this.selectedCompanies.size === 0) {
                // Nenhum filtro ativo - mostra todas
                shouldShow = true;
            } else if (cityData && cityData.companies) {
                // Verifica se a cidade tem alguma das empresas selecionadas
                shouldShow = cityData.companies.some(company => 
                    this.selectedCompanies.has(company)
                );
            } else {
                // Cidade sem empresa - esconde se há filtro ativo
                shouldShow = false;
            }
            
            // Aplica estilo visual
            if (layer) {
                if (shouldShow) {
                    layer.setStyle({
                        fillOpacity: 0.4,
                        opacity: 1,
                        weight: 2
                    });
                } else {
                    layer.setStyle({
                        fillOpacity: 0.05,
                        opacity: 0.3,
                        weight: 1
                    });
                }
            }
        });
        
        // Atualiza estatísticas
        this.updateFilteredStats();
        
        // Toast de feedback
        if (this.selectedCompanies.size > 0) {
            const companiesList = Array.from(this.selectedCompanies).join(', ');
            this.app.showToast(`🏬 Filtrando: ${companiesList}`, 'info');
        }
        
        console.log(`🏬 Filtro aplicado: ${this.selectedCompanies.size} empresa(s)`);
    }
    
    removeFilter() {
        if (!this.app || !this.app.cityLayers) return;
        
        const allCities = Object.keys(this.app.cityLayers);
        
        allCities.forEach(cityName => {
            const layer = this.app.cityLayers[cityName];
            const cityData = this.app.markedCities[cityName];
            
            if (layer) {
                if (cityData && cityData.companies && cityData.companies.length > 0) {
                    // Cidade com empresa - volta ao normal
                    layer.setStyle({
                        fillOpacity: 0.4,
                        opacity: 1,
                        weight: 2
                    });
                } else {
                    // Cidade sem empresa - estilo padrão
                    layer.setStyle({
                        fillOpacity: 0,
                        opacity: 0.5,
                        weight: 1
                    });
                }
            }
        });
        
        // Restaura estatísticas
        this.updateFilteredStats();
        
        this.app.showToast('🏬 Filtro removido', 'info');
        console.log('🏬 Filtro removido - todas as cidades visíveis');
    }
    
    updateFilteredStats() {
        if (!this.app) return;
        
        let visibleCities = 0;
        
        if (this.selectedCompanies.size === 0) {
            // Sem filtro - conta todas as cidades marcadas
            visibleCities = Object.keys(this.app.markedCities || {}).length;
        } else {
            // Com filtro - conta apenas cidades das empresas selecionadas
            Object.values(this.app.markedCities || {}).forEach(cityData => {
                if (cityData.companies) {
                    const hasSelectedCompany = cityData.companies.some(company => 
                        this.selectedCompanies.has(company)
                    );
                    if (hasSelectedCompany) {
                        visibleCities++;
                    }
                }
            });
        }
        
        const availableCities = 645 - visibleCities;
        
        // Atualiza sidebar stats
        const statWithCompany = document.getElementById('stat-with-company');
        const statAvailable = document.getElementById('stat-available');
        
        if (statWithCompany) {
            statWithCompany.textContent = visibleCities;
        }
        
        if (statAvailable) {
            statAvailable.textContent = availableCities;
        }
    }
    
    getCompanyCounts() {
        const counts = {};
        this.companies.forEach(company => counts[company.name] = 0);
        
        if (this.app && this.app.markedCities) {
            Object.values(this.app.markedCities).forEach(cityData => {
                if (cityData.companies && cityData.companies.length > 0) {
                    cityData.companies.forEach(company => {
                        if (counts.hasOwnProperty(company)) {
                            counts[company]++;
                        }
                    });
                }
            });
        }
        
        return counts;
    }
    
    updateCounts() {
        const counts = this.getCompanyCounts();
        
        this.filterOptions.querySelectorAll('.company-filter-option').forEach(option => {
            const company = option.dataset.company;
            const countSpan = option.querySelector('.company-filter-count');
            
            if (company === 'all') {
                const total = Object.values(counts).reduce((a, b) => a + b, 0);
                countSpan.textContent = total;
            } else if (countSpan) {
                countSpan.textContent = counts[company] || 0;
            }
        });
    }
    
    toggleDropdown() {
        this.filterDropdown.classList.toggle('active');
    }
    
    closeDropdown() {
        this.filterDropdown.classList.remove('active');
    }
    
    // Métodos públicos para integração
    
    /**
     * Define filtro por empresa programaticamente
     * @param {string} company - Nome da empresa
     */
    setFilter(company) {
        this.selectedCompanies.clear();
        this.selectedCompanies.add(company);
        this.updateUI();
        this.applyFilter();
    }
    
    /**
     * Adiciona empresa ao filtro
     * @param {string} company - Nome da empresa
     */
    addFilter(company) {
        this.selectedCompanies.add(company);
        this.updateUI();
        this.applyFilter();
    }
    
    /**
     * Remove empresa do filtro
     * @param {string} company - Nome da empresa
     */
    removeFilterCompany(company) {
        this.selectedCompanies.delete(company);
        this.updateUI();
        
        if (this.selectedCompanies.size === 0) {
            this.removeFilter();
        } else {
            this.applyFilter();
        }
    }
    
    /**
     * Retorna empresas atualmente filtradas
     * @returns {Array<string>}
     */
    getActiveFilters() {
        return Array.from(this.selectedCompanies);
    }
    
    /**
     * Verifica se filtro está ativo
     * @returns {boolean}
     */
    isFilterActive() {
        return this.isActive;
    }
}

// Exporta para uso global
window.CompanyFilter = CompanyFilter;