/**
 * 📍 NAVIGATION MANAGER v1.0.0
 * 
 * Gerencia navegação premium do GeoClient SP:
 * - Histórico de cidades recentes
 * - Atalhos rápidos
 * - Navegação por região geográfica
 * - Toggle de camadas do mapa
 * 
 * @author GeoClient Team
 * @version 1.0.0
 * @date 2026-01-19
 */

class NavigationManager {
    constructor(app) {
        if (!app) {
            console.error('❌ NavigationManager: App não fornecido');
            return;
        }
        
        this.app = app;
        this.recentCities = this.loadRecentCities();
        this.layerStates = this.loadLayerStates();
        
        console.log('📍 NavigationManager v1.0.0 inicializado');
        
        this.init();
    }
    
    /**
     * Inicializa event listeners
     */
    init() {
        this.setupShortcuts();
        this.setupRegions();
        this.setupLayers();
        this.renderRecentCities();
        this.applyLayerStates();
        
        console.log('✅ Navigation Manager pronto!');
    }
    
    // ==========================================
    // 1️⃣ HISTÓRICO DE CIDADES RECENTES
    // ==========================================
    
    /**
     * Adiciona cidade ao histórico de recentes
     * @param {string} cityName - Nome da cidade
     */
    addRecentCity(cityName) {
        if (!cityName) return;
        
        // Remove duplicatas
        this.recentCities = this.recentCities.filter(c => c.name !== cityName);
        
        // Adiciona no início
        this.recentCities.unshift({
            name: cityName,
            timestamp: Date.now(),
            companies: this.getCityCompanies(cityName)
        });
        
        // Limita a 5
        this.recentCities = this.recentCities.slice(0, 5);
        
        // Salva
        this.saveRecentCities();
        
        // Re-renderiza
        this.renderRecentCities();
        
        console.log(`🌟 Cidade adicionada às recentes: ${cityName}`);
    }
    
    /**
     * Obtém empresas de uma cidade
     * @param {string} cityName
     * @returns {Array}
     */
    getCityCompanies(cityName) {
        if (!this.app.markedCities || !this.app.markedCities[cityName]) {
            return [];
        }
        return this.app.markedCities[cityName].companies || [];
    }
    
    /**
     * Renderiza lista de cidades recentes
     */
    renderRecentCities() {
        const container = document.getElementById('recent-cities-list');
        const countBadge = document.getElementById('recent-count');
        
        if (!container) return;
        
        if (this.recentCities.length === 0) {
            container.innerHTML = '<div class="recent-empty">🔍 Nenhuma cidade visitada ainda</div>';
            if (countBadge) countBadge.textContent = '0';
            return;
        }
        
        if (countBadge) countBadge.textContent = this.recentCities.length;
        
        container.innerHTML = this.recentCities.map(city => {
            const relativeTime = this.getRelativeTime(city.timestamp);
            const companiesBadges = city.companies.map(company => {
                const color = this.app.getCompanyColor(company);
                return `<span class="recent-city-badge" style="background: ${color};">${company}</span>`;
            }).join('');
            
            return `
                <div class="recent-city-item" data-city="${city.name}">
                    <div class="recent-city-name">
                        🏙️ ${city.name}
                    </div>
                    <div class="recent-city-meta">
                        ${companiesBadges || '<span style="color: #9ca3af;">Sem empresa</span>'}
                        <span>• ${relativeTime}</span>
                    </div>
                </div>
            `;
        }).join('');
        
        // Event listeners
        container.querySelectorAll('.recent-city-item').forEach(item => {
            item.addEventListener('click', () => {
                const cityName = item.dataset.city;
                this.navigateToCity(cityName);
            });
        });
    }
    
    /**
     * Navega para uma cidade
     * @param {string} cityName
     */
    navigateToCity(cityName) {
        if (!this.app.cityLayers || !this.app.cityLayers[cityName]) {
            console.warn(`⚠️ Cidade não encontrada: ${cityName}`);
            return;
        }
        
        const layer = this.app.cityLayers[cityName];
        const bounds = layer.getBounds();
        
        this.app.map.flyToBounds(bounds, {
            padding: [50, 50],
            duration: 1
        });
        
        this.app.showToast(`🗺️ ${cityName}`, 'info');
        console.log(`📍 Navegando para: ${cityName}`);
    }
    
    /**
     * Formata timestamp em tempo relativo
     * @param {number} timestamp
     * @returns {string}
     */
    getRelativeTime(timestamp) {
        const now = Date.now();
        const diffMs = now - timestamp;
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 1) return 'Agora';
        if (diffMins < 60) return `Há ${diffMins} min${diffMins > 1 ? 's' : ''}`;
        
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `Há ${diffHours}h`;
        
        const diffDays = Math.floor(diffHours / 24);
        return `Há ${diffDays} dia${diffDays > 1 ? 's' : ''}`;
    }
    
    /**
     * Salva cidades recentes no localStorage
     */
    saveRecentCities() {
        try {
            localStorage.setItem('geoclient-recent-cities', JSON.stringify(this.recentCities));
        } catch (e) {
            console.error('❌ Erro ao salvar recentes:', e);
        }
    }
    
    /**
     * Carrega cidades recentes do localStorage
     * @returns {Array}
     */
    loadRecentCities() {
        try {
            const data = localStorage.getItem('geoclient-recent-cities');
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('❌ Erro ao carregar recentes:', e);
            return [];
        }
    }
    
    // ==========================================
    // 2️⃣ ATALHOS RÁPIDOS
    // ==========================================
    
    setupShortcuts() {
        const shortcuts = {
            'shortcut-dashboard': () => this.openDashboard(),
            'shortcut-history': () => this.openHistory(),
            'shortcut-reset': () => this.resetMap(),
            'shortcut-list': () => this.copyList()
        };
        
        Object.entries(shortcuts).forEach(([id, handler]) => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', handler);
            }
        });
    }
    
    openDashboard() {
        if (window.dashboard && window.dashboard.showDashboard) {
            window.dashboard.showDashboard();
            this.app.showToast('📊 Dashboard aberto', 'info');
        } else {
            console.warn('⚠️ Dashboard não disponível');
        }
    }
    
    openHistory() {
        if (window.reportsAndHistory && window.reportsAndHistory.showActivityLog) {
            window.reportsAndHistory.showActivityLog();
            this.app.showToast('📜 Histórico aberto', 'info');
        } else {
            console.warn('⚠️ Histórico não disponível');
        }
    }
    
    resetMap() {
        if (this.app.resetMapView) {
            this.app.resetMapView();
            this.app.showToast('🗺️ Mapa resetado', 'success');
        } else {
            // Fallback
            this.app.map.setView([-23.5505, -46.6333], 7);
            this.app.showToast('🗺️ Visualização resetada', 'success');
        }
    }
    
    copyList() {
        if (this.app.copyCitiesList) {
            this.app.copyCitiesList();
        } else {
            console.warn('⚠️ Função copyCitiesList não disponível');
            this.app.showToast('⚠️ Função não disponível', 'warning');
        }
    }
    
    // ==========================================
    // 3️⃣ NAVEGAÇÃO GEOGRÁFICA
    // ==========================================
    
    setupRegions() {
        const regions = {
            'metropolitana': {
                name: 'Região Metropolitana',
                bounds: [[-24.05, -47.1], [-23.2, -45.8]]
            },
            'litoral': {
                name: 'Litoral',
                bounds: [[-25.3, -48.7], [-23.3, -44.8]]
            },
            'interior': {
                name: 'Interior',
                bounds: [[-23.8, -53.2], [-20.0, -47.0]]
            },
            'vale': {
                name: 'Vale do Paraíba',
                bounds: [[-23.6, -46.2], [-22.4, -44.5]]
            }
        };
        
        document.querySelectorAll('.region-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const regionKey = btn.dataset.region;
                const region = regions[regionKey];
                
                if (!region) return;
                
                this.app.map.flyToBounds(region.bounds, {
                    padding: [50, 50],
                    duration: 1.5
                });
                
                this.app.showToast(`🗺️ ${region.name}`, 'info');
                console.log(`📍 Navegando para: ${region.name}`);
            });
        });
    }
    
    // ==========================================
    // 4️⃣ TOGGLE DE CAMADAS
    // ==========================================
    
    setupLayers() {
        document.querySelectorAll('.layer-toggle').forEach(toggle => {
            toggle.addEventListener('click', () => {
                const layer = toggle.dataset.layer;
                const isActive = toggle.classList.contains('active');
                
                if (isActive) {
                    toggle.classList.remove('active');
                    this.layerStates[layer] = false;
                } else {
                    toggle.classList.add('active');
                    this.layerStates[layer] = true;
                }
                
                this.applyLayerStates();
                this.saveLayerStates();
                
                console.log(`👁️ Camada "${layer}": ${this.layerStates[layer] ? 'ON' : 'OFF'}`);
            });
        });
    }
    
    /**
     * Aplica estados das camadas no mapa
     */
    applyLayerStates() {
        if (!this.app.cityLayers) return;
        
        const showOccupied = this.layerStates.occupied !== false;
        const showAvailable = this.layerStates.available !== false;
        const showBadges = this.layerStates.badges !== false;
        const showLabels = this.layerStates.labels === true;
        
        Object.entries(this.app.cityLayers).forEach(([cityName, layer]) => {
            const isOccupied = this.app.markedCities[cityName] && 
                             this.app.markedCities[cityName].companies && 
                             this.app.markedCities[cityName].companies.length > 0;
            
            // Controla visibilidade de markers
            if (isOccupied) {
                if (showOccupied) {
                    layer.addTo(this.app.map);
                } else {
                    layer.remove();
                }
            } else {
                if (showAvailable) {
                    layer.addTo(this.app.map);
                } else {
                    layer.remove();
                }
            }
        });
        
        // Controla badges
        if (this.app.cityMarkers) {
            Object.values(this.app.cityMarkers).forEach(marker => {
                if (marker && marker._icon) {
                    const badgeEl = marker._icon.querySelector('.city-marker-badge');
                    if (badgeEl) {
                        badgeEl.style.display = showBadges ? 'flex' : 'none';
                    }
                }
            });
        }
        
        // Controla rótulos (labels)
        if (showLabels) {
            this.showCityLabels();
        } else {
            this.hideCityLabels();
        }
        
        console.log('✅ Camadas aplicadas:', this.layerStates);
    }
    
    /**
     * Mostra rótulos das cidades
     */
    showCityLabels() {
        if (!this.app.cityLayers) return;
        
        Object.entries(this.app.cityLayers).forEach(([cityName, layer]) => {
            if (layer._tooltip) return; // Já tem tooltip
            
            layer.bindTooltip(cityName, {
                permanent: true,
                direction: 'center',
                className: 'city-label-tooltip',
                opacity: 0.9
            });
        });
    }
    
    /**
     * Esconde rótulos das cidades
     */
    hideCityLabels() {
        if (!this.app.cityLayers) return;
        
        Object.values(this.app.cityLayers).forEach(layer => {
            if (layer._tooltip) {
                layer.unbindTooltip();
            }
        });
    }
    
    /**
     * Salva estados das camadas
     */
    saveLayerStates() {
        try {
            localStorage.setItem('geoclient-layer-states', JSON.stringify(this.layerStates));
        } catch (e) {
            console.error('❌ Erro ao salvar camadas:', e);
        }
    }
    
    /**
     * Carrega estados das camadas
     * @returns {Object}
     */
    loadLayerStates() {
        try {
            const data = localStorage.getItem('geoclient-layer-states');
            return data ? JSON.parse(data) : {
                occupied: true,
                available: true,
                badges: true,
                labels: false
            };
        } catch (e) {
            console.error('❌ Erro ao carregar camadas:', e);
            return {
                occupied: true,
                available: true,
                badges: true,
                labels: false
            };
        }
    }
}

// CSS para tooltips de rótulos
const style = document.createElement('style');
style.textContent = `
.city-label-tooltip {
    background: rgba(255, 255, 255, 0.95) !important;
    border: 1px solid #e5e7eb !important;
    border-radius: 4px !important;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15) !important;
    font-size: 11px !important;
    font-weight: 600 !important;
    color: #374151 !important;
    padding: 4px 8px !important;
    white-space: nowrap !important;
}

.city-label-tooltip::before {
    display: none !important;
}
`;
document.head.appendChild(style);

console.log('📍 navigation.js v1.0.0 carregado');
