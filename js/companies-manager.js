/**
 * 🏢 COMPANIES MANAGER v1.0.0
 * 
 * Gerencia visualização premium de empresas no GeoClient SP:
 * - Resumo executivo
 * - Cards com stats detalhadas
 * - Comparativo visual
 * - Detecção de sobreposições
 * - Ações rápidas
 * 
 * @author GeoClient Team
 * @version 1.0.0
 * @date 2026-01-19
 */

class CompaniesManager {
    constructor(app) {
        if (!app) {
            console.error('❌ CompaniesManager: App não fornecido');
            return;
        }
        
        this.app = app;
        this.companies = ['CDO', 'SUPORTE', 'WAUX', 'MONTEBELLO', 'HIRATA'];
        this.colors = {
            'CDO': '#ef4444',
            'SUPORTE': '#3b82f6',
            'WAUX': '#10b981',
            'MONTEBELLO': '#f59e0b',
            'HIRATA': '#8b5cf6'
        };
        
        // Cache de dados
        this.cachedData = null;
        this.lastUpdate = 0;
        
        console.log('🏢 CompaniesManager v1.0.0 inicializado');
    }
    
    /**
     * Renderiza conteúdo premium
     */
    render() {
        const container = document.getElementById('companies-premium-content');
        if (!container) return;
        
        const data = this.getData();
        
        let html = '';
        
        // 1. Resumo Executivo
        html += this.renderSummary(data.summary);
        
        // 2. Cards de Empresas
        data.companies.forEach(company => {
            html += this.renderCompanyCard(company);
        });
        
        // 3. Comparativo
        html += this.renderComparison(data.companies);
        
        // 4. Sobreposições
        if (data.overlaps.length > 0) {
            html += this.renderOverlaps(data.overlaps);
        }
        
        container.innerHTML = html;
        
        // Event listeners
        this.attachEventListeners();
        
        // Anima barras de progresso
        setTimeout(() => this.animateProgressBars(), 100);
        
        console.log('✅ Companies premium renderizado');
    }
    
    /**
     * Obtém dados consolidados
     * @returns {Object}
     */
    getData() {
        // Cache por 1 segundo
        const now = Date.now();
        if (this.cachedData && (now - this.lastUpdate) < 1000) {
            return this.cachedData;
        }
        
        const companiesData = this.companies.map(name => {
            return {
                name,
                color: this.colors[name],
                ...this.getCompanyStats(name)
            };
        }).sort((a, b) => b.cities - a.cities);
        
        this.cachedData = {
            summary: this.calculateSummary(companiesData),
            companies: companiesData,
            overlaps: this.detectOverlaps()
        };
        
        this.lastUpdate = now;
        return this.cachedData;
    }
    
    /**
     * Calcula resumo executivo
     * @param {Array} companiesData
     * @returns {Object}
     */
    calculateSummary(companiesData) {
        const totalCities = companiesData.reduce((sum, c) => sum + c.cities, 0);
        const activeCompanies = companiesData.filter(c => c.cities > 0).length;
        const leader = companiesData[0];
        const leaderPercent = leader.cities > 0 ? Math.round((leader.cities / totalCities) * 100) : 0;
        
        return {
            activeCompanies,
            totalCities,
            leader: leader.name,
            leaderPercent,
            avgCitiesPerCompany: Math.round(totalCities / activeCompanies)
        };
    }
    
    /**
     * Obtém estatísticas de uma empresa
     * @param {string} companyName
     * @returns {Object}
     */
    getCompanyStats(companyName) {
        const cities = {};
        const clientsPerCity = {};
        
        // Percorre cidades marcadas
        Object.entries(this.app.markedCities || {}).forEach(([cityName, cityData]) => {
            if (cityData.companies && cityData.companies.includes(companyName)) {
                cities[cityName] = true;
                clientsPerCity[cityName] = 0;
            }
        });
        
        // Conta clientes por cidade
        (this.app.clients || []).forEach(client => {
            if (client.empresa === companyName && client.municipio) {
                if (clientsPerCity.hasOwnProperty(client.municipio)) {
                    clientsPerCity[client.municipio]++;
                }
            }
        });
        
        const totalCities = Object.keys(cities).length;
        const percentSP = totalCities > 0 ? Math.round((totalCities / 645) * 100) : 0;
        
        // Top 3 cidades
        const topCities = Object.entries(clientsPerCity)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([city, count]) => ({ city, count }));
        
        return {
            cities: totalCities,
            percentSP,
            topCities,
            allCities: Object.keys(cities).sort()
        };
    }
    
    /**
     * Detecta cidades com múltiplas empresas
     * @returns {Array}
     */
    detectOverlaps() {
        const overlaps = {};
        
        Object.entries(this.app.markedCities || {}).forEach(([cityName, cityData]) => {
            if (cityData.companies && cityData.companies.length > 1) {
                overlaps[cityName] = cityData.companies.length;
            }
        });
        
        return Object.entries(overlaps)
            .sort((a, b) => b[1] - a[1])
            .map(([city, count]) => ({ city, count }));
    }
    
    /**
     * Renderiza resumo executivo
     * @param {Object} summary
     * @returns {string}
     */
    renderSummary(summary) {
        return `
            <div class="company-summary-card">
                <div class="company-summary-title">💼 Resumo Geral</div>
                <div class="company-summary-stats">
                    <div class="company-summary-stat">
                        <div class="company-summary-stat-value">${summary.activeCompanies}</div>
                        <div class="company-summary-stat-label">Empresas Ativas</div>
                    </div>
                    <div class="company-summary-stat">
                        <div class="company-summary-stat-value">${summary.totalCities}</div>
                        <div class="company-summary-stat-label">Cidades Cobertas</div>
                    </div>
                    <div class="company-summary-stat" style="grid-column: 1 / -1;">
                        <div class="company-summary-stat-value" style="font-size: 18px;">
                            🏆 ${summary.leader} (${summary.leaderPercent}%)
                        </div>
                        <div class="company-summary-stat-label">Empresa Líder</div>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Renderiza card de empresa
     * @param {Object} company
     * @returns {string}
     */
    renderCompanyCard(company) {
        const topCitiesHtml = company.topCities.length > 0 ? `
            <div class="company-top-cities">
                <div class="company-top-cities-title">📍 Top Cidades</div>
                ${company.topCities.map(item => `
                    <div class="company-top-city-item">
                        <span class="company-top-city-name">${item.city}</span>
                        <span class="company-top-city-count">${item.count} cliente${item.count > 1 ? 's' : ''}</span>
                    </div>
                `).join('')}
            </div>
        ` : '';
        
        return `
            <div class="company-card-premium" data-company="${company.name}">
                <div class="company-card-header-premium">
                    <div class="company-badge-large" style="background: ${company.color};">
                        ${this.getCompanyEmoji(company.name)}
                    </div>
                    <div class="company-info-premium">
                        <div class="company-name-premium">${company.name}</div>
                        <div class="company-stats-premium">
                            ${company.cities} cidades • ${company.percentSP}% de SP
                        </div>
                    </div>
                </div>
                
                <div class="company-progress-container">
                    <div class="company-progress-bar">
                        <div class="company-progress-fill" 
                             data-width="${company.percentSP}" 
                             style="background: ${company.color}; width: 0%;"></div>
                    </div>
                    <div class="company-progress-label">${company.percentSP}% de ocupação</div>
                </div>
                
                ${topCitiesHtml}
                
                <div class="company-actions">
                    <button class="company-action-btn" data-action="list" data-company="${company.name}">
                        📋 Ver Todas
                    </button>
                    <button class="company-action-btn" data-action="filter" data-company="${company.name}">
                        🗺️ Filtrar Mapa
                    </button>
                </div>
            </div>
        `;
    }
    
    /**
     * Renderiza comparativo
     * @param {Array} companies
     * @returns {string}
     */
    renderComparison(companies) {
        const maxCities = companies[0].cities;
        
        return `
            <div class="company-comparison-card">
                <div class="company-comparison-title">
                    📊 Comparativo
                </div>
                ${companies.map((company, index) => {
                    const rank = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}️⃣`;
                    const barWidth = maxCities > 0 ? Math.round((company.cities / maxCities) * 100) : 0;
                    
                    return `
                        <div class="company-comparison-item">
                            <span class="company-comparison-rank">${rank}</span>
                            <span class="company-comparison-name">${company.name}</span>
                            <span class="company-comparison-count">${company.cities}</span>
                            <div class="company-comparison-bar">
                                <div class="company-comparison-bar-fill" 
                                     data-width="${barWidth}"
                                     style="background: ${company.color}; width: 0%;"></div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }
    
    /**
     * Renderiza sobreposições
     * @param {Array} overlaps
     * @returns {string}
     */
    renderOverlaps(overlaps) {
        const top3 = overlaps.slice(0, 3);
        
        return `
            <div class="company-overlaps-card">
                <div class="company-overlaps-title">
                    🔄 Sobreposições
                </div>
                <div class="company-overlaps-summary">
                    ${overlaps.length} cidade${overlaps.length > 1 ? 's' : ''} com múltiplas empresas
                </div>
                ${top3.map(item => `
                    <div class="company-overlap-item">
                        <span class="company-overlap-city">• ${item.city}</span>
                        <span class="company-overlap-count">${item.count} empresas</span>
                    </div>
                `).join('')}
                ${overlaps.length > 3 ? `
                    <button class="company-overlap-link" id="show-all-overlaps">
                        Ver todas as ${overlaps.length} sobreposições
                    </button>
                ` : ''}
            </div>
        `;
    }
    
    /**
     * Obtém emoji da empresa
     * @param {string} companyName
     * @returns {string}
     */
    getCompanyEmoji(companyName) {
        const emojis = {
            'CDO': '🔴',
            'SUPORTE': '🔵',
            'WAUX': '🟢',
            'MONTEBELLO': '🟡',
            'HIRATA': '🟣'
        };
        return emojis[companyName] || '🏢';
    }
    
    /**
     * Anima barras de progresso
     */
    animateProgressBars() {
        document.querySelectorAll('.company-progress-fill, .company-comparison-bar-fill').forEach(bar => {
            const width = bar.dataset.width;
            if (width) {
                setTimeout(() => {
                    bar.style.width = `${width}%`;
                }, 50);
            }
        });
    }
    
    /**
     * Anexa event listeners
     */
    attachEventListeners() {
        // Botões de ação
        document.querySelectorAll('.company-action-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                const company = btn.dataset.company;
                
                if (action === 'list') {
                    this.showAllCities(company);
                } else if (action === 'filter') {
                    this.filterByCompany(company);
                }
            });
        });
        
        // Ver todas sobreposições
        const showOverlapsBtn = document.getElementById('show-all-overlaps');
        if (showOverlapsBtn) {
            showOverlapsBtn.addEventListener('click', () => {
                this.showAllOverlaps();
            });
        }
    }
    
    /**
     * Mostra todas as cidades de uma empresa
     * @param {string} companyName
     */
    showAllCities(companyName) {
        const data = this.getData();
        const company = data.companies.find(c => c.name === companyName);
        
        if (!company || company.allCities.length === 0) {
            this.app.showToast('⚠️ Nenhuma cidade encontrada', 'warning');
            return;
        }
        
        const citiesList = company.allCities.map(city => `• ${city}`).join('\n');
        
        this.app.showModal({
            title: `📋 ${companyName} - ${company.cities} Cidades`,
            content: `
                <div style="max-height: 400px; overflow-y: auto; white-space: pre-line; font-size: 14px; line-height: 1.6;">
                    ${citiesList}
                </div>
            `,
            buttons: [
                {
                    text: '📋 Copiar Lista',
                    style: 'primary',
                    onClick: () => {
                        navigator.clipboard.writeText(company.allCities.join('\n'));
                        this.app.showToast('📋 Lista copiada!', 'success');
                    }
                },
                {
                    text: 'Fechar',
                    style: 'secondary'
                }
            ]
        });
        
        console.log(`📋 Lista de ${companyName}:`, company.allCities);
    }
    
    /**
     * Filtra mapa por empresa
     * @param {string} companyName
     */
    filterByCompany(companyName) {
        if (window.companyFilter) {
            window.companyFilter.toggleCompany(companyName);
            this.app.showToast(`🗺️ Filtrado por ${companyName}`, 'info');
        } else {
            // Fallback: dispara evento
            window.dispatchEvent(new CustomEvent('companyFilterChanged', {
                detail: { company: companyName }
            }));
        }
        
        console.log(`🗺️ Filtro aplicado: ${companyName}`);
    }
    
    /**
     * Mostra todas as sobreposições
     */
    showAllOverlaps() {
        const data = this.getData();
        const overlaps = data.overlaps;
        
        if (overlaps.length === 0) {
            this.app.showToast('✅ Nenhuma sobreposição encontrada', 'info');
            return;
        }
        
        const overlapsList = overlaps.map(item => 
            `• ${item.city} (${item.count} empresas)`
        ).join('\n');
        
        this.app.showModal({
            title: `🔄 Sobreposições - ${overlaps.length} Cidades`,
            content: `
                <div style="max-height: 400px; overflow-y: auto; white-space: pre-line; font-size: 14px; line-height: 1.6;">
                    ${overlapsList}
                </div>
            `,
            buttons: [
                {
                    text: 'Fechar',
                    style: 'secondary'
                }
            ]
        });
        
        console.log('🔄 Sobreposições:', overlaps);
    }
    
    /**
     * Atualiza dados (limpa cache)
     */
    updateData() {
        this.cachedData = null;
        this.lastUpdate = 0;
        console.log('🔄 Companies data atualizado');
    }
}

console.log('🏢 companies-manager.js v1.0.0 carregado');
