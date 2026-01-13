// GeoClient SP - VERSÃO PREMIUM v2.3
// Sistema de cliques: 1=zoom (sem marcar) | 2=marca + dropdown | Botão direito=remover
// ✨ NOVO: LocalStorage Clientes + Gráficos + Busca na Tabela + Export/Import Completo

class GeoClientApp {
    constructor() {
        this.map = null;
        this.currentFilters = { 
            companies: [],
            status: 'todos',
            searchQuery: '',
            clientSearch: '' // NOVO: busca de clientes
        };
        this.currentClients = [];
        this.markers = {};
        this.geoJsonLayer = null;
        this.markedCities = {};
        this.cityLayers = {};
        this.contextMenu = null;
        this.tooltip = null;
        this.companyDropdown = null;
        this.dashboardModal = null;
        this.isDropdownOpen = false;
        this.currentCityName = null;
        this.homeButton = null;
        this.searchBox = null;
        this.filtersAppliedToMap = false;
        this.charts = {}; // NOVO: armazena instâncias de gráficos
        
        this.availableCompanies = ['CDO', 'SUPORTE', 'WAUX', 'MONTEBELLO', 'HIRATA'];
        this.totalMunicipalitiesSP = 645;
        
        this.clickCount = 0;
        this.clickTimer = null;
        this.clickTimeout = 400;
        
        this.initialView = {
            center: [-22.5, -49.2],
            zoom: 7.2
        };
        
        this.loadFromLocalStorage();
    }

    // 💾 ==================== LOCALSTORAGE COMPLETO ====================
    
    loadFromLocalStorage() {
        try {
            // Carrega cidades marcadas
            const savedCities = localStorage.getItem('geoclient-marked-cities');
            if (savedCities) {
                this.markedCities = JSON.parse(savedCities);
                console.log(`💾 ${Object.keys(this.markedCities).length} cidades restauradas`);
            }
            
            // NOVO: Carrega clientes
            const savedClients = localStorage.getItem('geoclient-clients');
            if (savedClients) {
                this.currentClients = JSON.parse(savedClients);
                console.log(`💾 ${this.currentClients.length} clientes restaurados`);
            }
        } catch (error) {
            console.error('❌ Erro ao carregar localStorage:', error);
        }
    }
    
    saveToLocalStorage() {
        try {
            // Salva cidades
            localStorage.setItem('geoclient-marked-cities', JSON.stringify(this.markedCities));
            // NOVO: Salva clientes
            localStorage.setItem('geoclient-clients', JSON.stringify(this.currentClients));
            console.log('💾 Dados salvos (cidades + clientes)');
            this.showToast('💾 Dados salvos automaticamente!', 'success');
        } catch (error) {
            console.error('❌ Erro ao salvar localStorage:', error);
            this.showToast('❌ Erro ao salvar dados', 'error');
        }
    }
    
    clearAllData() {
        if (!confirm('⚠️ Tem certeza que deseja limpar TODOS os dados?\n\nIsso vai remover:\n- Todas as cidades marcadas\n- Todos os clientes cadastrados\n\nEsta ação não pode ser desfeita!')) {
            return;
        }
        
        this.markedCities = {};
        this.currentClients = [];
        localStorage.removeItem('geoclient-marked-cities');
        localStorage.removeItem('geoclient-clients');
        this.loadMunicipalitiesBoundaries();
        this.renderClientTable();
        this.renderMarkers();
        
        console.log('🗑️ Todos os dados foram limpos');
        this.showToast('🗑️ Todos os dados foram limpos!', 'info');
    }
    
    showToast(message, type = 'success') {
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            info: '#3b82f6',
            warning: '#f59e0b'
        };
        
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: ${colors[type]};
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10003;
            font-size: 14px;
            font-weight: 600;
            animation: slideIn 0.3s ease;
        `;
        toast.textContent = message;
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(400px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(400px); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    
    getCityCoordinates(cityName) {
        const MUNICIPALITIES = {
            'São Paulo': { lat: -23.5505, lng: -46.6333 },
            'Guarulhos': { lat: -23.4538, lng: -46.5333 },
            'Campinas': { lat: -22.9099, lng: -47.0626 },
            'São Bernardo do Campo': { lat: -23.6914, lng: -46.5646 },
            'Santo André': { lat: -23.6636, lng: -46.5341 },
            'Osasco': { lat: -23.5329, lng: -46.7919 }
        };
        return MUNICIPALITIES[cityName] || { lat: -23.5, lng: -46.6 };
    }

    // ==================== INIT ====================

    init() {
        console.log('🗺️ Inicializando GeoClient SP Premium v2.3...');
        
        const mapElement = document.getElementById('map');
        if (!mapElement) {
            console.error('❌ Elemento #map não encontrado!');
            return;
        }
        
        console.log('✅ Elemento #map encontrado');
        
        setTimeout(() => {
            this.initMap();
            this.setupEventListeners();
            this.createContextMenu();
            this.createTooltip();
            this.createCompanyDropdown();
            this.createDashboardModal();
            this.createHomeButton();
            this.setupClientSearch();
            this.renderClientTable();
            this.renderMarkers();
            console.log('✅ GeoClient SP iniciado!');
            console.log('🔍 1 CLIQUE = Zoom 3x (SEM marcar)');
            console.log('🔍 2 CLIQUES = Marca cidade + dropdown');
            console.log('🖱️ BOTÃO DIREITO = Remover marcação');
            console.log('💾 LOCALSTORAGE = Salva automaticamente');
        }, 100);
    }

    initMap() {
        console.log('🗺️ Criando mapa Leaflet...');
        
        try {
            this.map = L.map('map', {
                center: this.initialView.center,
                zoom: this.initialView.zoom,
                zoomControl: true,
                attributionControl: true,
                minZoom: 6,
                maxZoom: 12,
                doubleClickZoom: false,
                tap: false
            });
            
            console.log('✅ Mapa criado');
            
            this.map.off('dblclick');
            this.map.on('dblclick', (e) => {
                L.DomEvent.stopPropagation(e);
                L.DomEvent.preventDefault(e);
                return false;
            });
            
            const tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
                subdomains: 'abcd',
                maxZoom: 20,
                minZoom: 6
            });
            
            tileLayer.addTo(this.map);
            console.log('✅ Tiles CartoDB adicionados');
            
            setTimeout(() => {
                this.map.invalidateSize();
            }, 250);
            
            this.loadMunicipalitiesBoundaries();
            
        } catch (error) {
            console.error('❌ Erro ao criar mapa:', error);
        }
    }

    loadMunicipalitiesBoundaries() {
        console.log('📍 Carregando municípios...');
        
        fetch('data/municipios-sp.geojson')
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                return response.json();
            })
            .then(municipalitiesData => {
                console.log(`✅ GeoJSON carregado: ${municipalitiesData.features.length} municípios`);
                
                this.geoJsonLayer = L.geoJSON(municipalitiesData, {
                    style: (feature) => {
                        const name = this.getMunicipalityName(feature);
                        const cityData = this.markedCities[name];
                        
                        if (cityData && cityData.companies.length > 0) {
                            const color = this.getCompanyColor(cityData.companies[0]);
                            return {
                                fillColor: color,
                                weight: 2,
                                opacity: 1,
                                color: '#374151',
                                fillOpacity: 0.7
                            };
                        } 
                        else if (cityData) {
                            return {
                                fillColor: '#9ca3af',
                                weight: 2,
                                opacity: 1,
                                color: '#4b5563',
                                fillOpacity: 0.6
                            };
                        } 
                        else {
                            return {
                                fillColor: '#d1d5db',
                                weight: 1.5,
                                opacity: 1,
                                color: '#6b7280',
                                fillOpacity: 0.2
                            };
                        }
                    },
                    onEachFeature: (feature, layer) => {
                        const name = this.getMunicipalityName(feature);
                        this.cityLayers[name] = layer;
                        
                        layer.on('mouseover', () => {
                            const cityData = this.markedCities[name];
                            if (!cityData) {
                                layer.setStyle({ weight: 3, fillOpacity: 0.3 });
                            } else {
                                layer.setStyle({ weight: 4, fillOpacity: 0.85 });
                            }
                            this.showTooltip(name);
                        });
                        
                        layer.on('mouseout', () => {
                            this.geoJsonLayer.resetStyle(layer);
                            this.hideTooltip();
                        });

                        layer.off('dblclick');
                        layer.on('dblclick', (e) => {
                            L.DomEvent.stop(e);
                            return false;
                        });

                        layer.on('contextmenu', (e) => {
                            L.DomEvent.stop(e);
                            this.showContextMenu(e.originalEvent, name);
                        });

                        layer.on('click', (e) => {
                            L.DomEvent.stop(e);
                            this.handleCityClick(name, layer, e);
                        });
                    }
                }).addTo(this.map);

                console.log(`✅ ${municipalitiesData.features.length} municípios carregados!`);
            })
            .catch(error => {
                console.error('❌ Erro ao carregar municípios:', error);
            });
    }

    getMunicipalityName(feature) {
        const properties = feature.properties || {};
        return properties.name 
            || properties.NAME 
            || properties.NOME 
            || properties.NM_MUNI 
            || properties.NM_MUNICIPIO
            || properties.nm_municipio
            || properties.NM_MUN
            || 'Município Desconhecido';
    }

    handleCityClick(name, layer, event) {
        this.clickCount++;
        clearTimeout(this.clickTimer);
        
        this.clickTimer = setTimeout(() => {
            const clicks = this.clickCount;
            this.clickCount = 0;
            
            if (clicks === 1) {
                this.zoomToCity(name, event);
            } else if (clicks >= 2) {
                this.markAndShowDropdown(name, layer);
            }
        }, this.clickTimeout);
    }

    zoomToCity(name, event) {
        const latlng = event.latlng;
        const currentZoom = this.map.getZoom();
        const newZoom = Math.min(currentZoom + 3, 12);
        
        this.map.flyTo(latlng, newZoom, {
            duration: 0.8,
            easeLinearity: 0.25
        });
        
        console.log(`🔍 1º CLIQUE: Zoom 3x em ${name}`);
    }

    markAndShowDropdown(name, layer) {
        if (!this.markedCities[name]) {
            this.markedCities[name] = { companies: [] };
            
            layer.setStyle({
                fillColor: '#9ca3af',
                weight: 2,
                opacity: 1,
                color: '#4b5563',
                fillOpacity: 0.6
            });
            
            this.saveToLocalStorage();
            console.log(`🟤 2º CLIQUE: ${name} marcado`);
        }
        
        this.showCompanyDropdown(name);
    }

    removeCity(name) {
        const layer = this.cityLayers[name];
        if (!layer) return;
        
        if (this.markedCities[name]) {
            delete this.markedCities[name];
            
            layer.setStyle({
                fillColor: '#d1d5db',
                weight: 1.5,
                opacity: 1,
                color: '#6b7280',
                fillOpacity: 0.2
            });
            
            this.saveToLocalStorage();
            console.log(`🗑️ Removido: ${name}`);
        }
    }

    getCompanyColor(company) {
        const colors = {
            'CDO': '#ef4444',
            'SUPORTE': '#3b82f6',
            'WAUX': '#10b981',
            'MONTEBELLO': '#f59e0b',
            'HIRATA': '#8b5cf6'
        };
        return colors[company] || '#6b7280';
    }

    addCompanyToCity(cityName, company) {
        const city = this.markedCities[cityName];
        if (!city) return;
        
        city.companies.push(company);
        this.saveToLocalStorage();
        
        const oldLayer = this.geoJsonLayer;
        if (oldLayer) {
            this.map.removeLayer(oldLayer);
        }
        
        this.loadMunicipalitiesBoundaries();
    }

    createContextMenu() {
        const existingMenu = document.getElementById('city-context-menu');
        if (existingMenu) existingMenu.remove();
        
        this.contextMenu = document.createElement('div');
        this.contextMenu.id = 'city-context-menu';
        this.contextMenu.style.cssText = `
            position: fixed;
            display: none;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.2);
            padding: 8px;
            z-index: 10000;
            min-width: 200px;
        `;
        document.body.appendChild(this.contextMenu);
        
        document.addEventListener('click', () => {
            this.contextMenu.style.display = 'none';
        });
    }

    showContextMenu(event, cityName) {
        event.preventDefault();
        event.stopPropagation();
        
        const cityData = this.markedCities[cityName];
        if (!cityData) return;
        
        let menuContent = `
            <div onclick="if(confirm('Remover marcação de ${cityName}?')) { window.app.removeCity('${cityName}'); window.app.contextMenu.style.display='none'; }"
                 style="padding: 12px; cursor: pointer; border-radius: 6px; color: #ef4444; font-weight: 600;">
                🗑️ Remover Marcação
            </div>
        `;
        
        this.contextMenu.innerHTML = menuContent;
        this.contextMenu.style.display = 'block';
        this.contextMenu.style.left = event.pageX + 'px';
        this.contextMenu.style.top = event.pageY + 'px';
    }

    createTooltip() {
        const existingTooltip = document.getElementById('city-tooltip');
        if (existingTooltip) existingTooltip.remove();
        
        this.tooltip = document.createElement('div');
        this.tooltip.id = 'city-tooltip';
        this.tooltip.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            display: none;
            background: white;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.25);
            padding: 16px;
            z-index: 9999;
            min-width: 280px;
            max-width: 350px;
            border: 2px solid #e5e7eb;
        `;
        document.body.appendChild(this.tooltip);
    }

    showTooltip(cityName) {
        const cityData = this.markedCities[cityName];
        let content = '';
        
        if (!cityData) {
            content = `<div><b>${cityName}</b><br><small style="color: #9ca3af;">⚪ Disponível</small></div>`;
        } else if (cityData.companies.length === 0) {
            content = `<div><b>${cityName}</b><br><small style="color: #f59e0b;">⏳ Aguardando empresa</small></div>`;
        } else {
            const color = this.getCompanyColor(cityData.companies[0]);
            content = `<div style="border-bottom: 2px solid ${color}; padding-bottom: 8px; margin-bottom: 8px;"><b style="color: ${color};">${cityName}</b></div>`;
            cityData.companies.forEach(company => {
                const companyColor = this.getCompanyColor(company);
                content += `<div style="background: ${companyColor}; color: white; padding: 6px 10px; margin: 4px 0; border-radius: 6px; font-weight: 600;">${company}</div>`;
            });
        }
        
        this.tooltip.innerHTML = content;
        this.tooltip.style.display = 'block';
    }

    hideTooltip() {
        this.tooltip.style.display = 'none';
    }

    createCompanyDropdown() {
        const existingDropdown = document.getElementById('company-dropdown');
        if (existingDropdown) existingDropdown.remove();
        
        this.companyDropdown = document.createElement('div');
        this.companyDropdown.id = 'company-dropdown';
        this.companyDropdown.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            display: none;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 24px rgba(0,0,0,0.15);
            padding: 24px;
            z-index: 10001;
            min-width: 380px;
        `;
        document.body.appendChild(this.companyDropdown);
    }

    showCompanyDropdown(cityName) {
        const cityData = this.markedCities[cityName];
        if (!cityData) return;
        
        this.currentCityName = cityName;
        const availableCompanies = this.availableCompanies.filter(c => !cityData.companies.includes(c));
        
        let content = `<h3 style="margin: 0 0 16px 0;">${cityName}</h3>`;
        
        availableCompanies.forEach(company => {
            const color = this.getCompanyColor(company);
            content += `
                <div onclick="window.app.selectCompany('${company}');"
                     style="background: ${color}; color: white; padding: 12px; margin: 8px 0; cursor: pointer; border-radius: 6px; font-weight: 600;">
                    ${company}
                </div>
            `;
        });
        
        content += `<button onclick="window.app.hideCompanyDropdown();" style="margin-top: 12px; padding: 10px; width: 100%;">Cancelar</button>`;
        
        this.companyDropdown.innerHTML = content;
        this.companyDropdown.style.display = 'block';
    }

    selectCompany(company) {
        if (!this.currentCityName) return;
        
        this.addCompanyToCity(this.currentCityName, company);
        this.hideCompanyDropdown();
    }

    hideCompanyDropdown() {
        this.companyDropdown.style.display = 'none';
        this.currentCityName = null;
    }

    createDashboardModal() {
        const existingModal = document.getElementById('dashboard-modal');
        if (existingModal) existingModal.remove();
        
        this.dashboardModal = document.createElement('div');
        this.dashboardModal.id = 'dashboard-modal';
        this.dashboardModal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: none;
            z-index: 10002;
            overflow-y: auto;
            padding: 20px;
        `;
        document.body.appendChild(this.dashboardModal);
        
        this.dashboardModal.addEventListener('click', (e) => {
            if (e.target === this.dashboardModal) {
                this.hideDashboard();
            }
        });
    }

    showDashboard() {
        const totalMarked = Object.keys(this.markedCities).length;
        const content = `
            <div style="max-width: 1200px; margin: 40px auto; background: white; border-radius: 16px; padding: 32px;">
                <h2>📊 Dashboard</h2>
                <p>Total de cidades: ${totalMarked}</p>
                <button onclick="window.app.hideDashboard();">Fechar</button>
            </div>
        `;
        
        this.dashboardModal.innerHTML = content;
        this.dashboardModal.style.display = 'block';
    }

    hideDashboard() {
        this.dashboardModal.style.display = 'none';
    }

    createHomeButton() {
        const existingButton = document.getElementById('home-button');
        if (existingButton) existingButton.remove();
        
        this.homeButton = document.createElement('button');
        this.homeButton.innerHTML = '🏠';
        this.homeButton.title = 'Voltar à visualização inicial';
        this.homeButton.style.cssText = `
            position: absolute;
            bottom: 30px;
            right: 10px;
            z-index: 1000;
            background: white;
            border: 2px solid rgba(0,0,0,0.2);
            border-radius: 4px;
            width: 34px;
            height: 34px;
            font-size: 18px;
            cursor: pointer;
        `;
        
        this.homeButton.addEventListener('click', () => {
            this.map.flyTo(this.initialView.center, this.initialView.zoom, { duration: 1 });
        });
        
        const mapElement = document.getElementById('map');
        if (mapElement) {
            mapElement.appendChild(this.homeButton);
        }
    }

    setupClientSearch() {
        console.log('🔍 Cliente search setup (stub)');
    }

    renderClientTable() {
        console.log('📋 Renderizando tabela de clientes...');
    }

    renderMarkers() {
        console.log('📍 Renderizando marcadores...');
    }

    setupEventListeners() {
        const dashboardBtn = document.getElementById('open-dashboard');
        if (dashboardBtn) {
            dashboardBtn.addEventListener('click', () => this.showDashboard());
        }
    }

    exportCSV() {
        console.log('📤 Exportando CSV...');
        this.showToast('Funcionalidade em desenvolvimento', 'info');
    }

    exportJSON() {
        console.log('📤 Exportando JSON...');
        this.showToast('Funcionalidade em desenvolvimento', 'info');
    }

    parseAndImportCSV(content, mode) {
        console.log('📥 Importando CSV...');
        this.showToast('Funcionalidade em desenvolvimento', 'info');
    }

    showImportModal() {
        console.log('📂 Mostrando modal de importação...');
        this.showToast('Funcionalidade em desenvolvimento', 'info');
    }
}

// ✅ Expor globalmente
let app;
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM Carregado!');
    
    // Carrega Chart.js dinamicamente
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
    script.onload = () => {
        console.log('✅ Chart.js carregado');
        app = new GeoClientApp();
        window.app = app;
        app.init();
        console.log('✨ GeoClient SP Premium v2.3 ATIVADO!');
    };
    document.head.appendChild(script);
});