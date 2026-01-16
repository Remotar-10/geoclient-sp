// GeoClient SP - Sistema de Gestão Territorial v3.1 FINAL
// Sistema de cliques: 1 clique = Zoom 1x + Dropdown | Seleciona empresa = Marca cidade
// ✅ Activity Logger integrado
// ✅ 5 empresas: CDO, SUPORTE, WAUX, MONTEBELLO, HIRATA
// 🐛 ALL BUG FIXES: #8, #9, #10, #11, #12, #13, #14, #15, #16, #17

class GeoClientApp {
    constructor() {
        this.map = null;
        
        // ✅ Propriedades compatíveis com dashboard.js
        this.clients = [];
        this.occupiedCities = {};
        this.markedCities = {};
        
        this.geoJsonLayer = null;
        this.cityLayers = {};
        this.contextMenu = null;
        this.tooltip = null;
        this.companyDropdown = null;
        this.currentCityName = null;
        this.lastClickPosition = { x: 0, y: 0 };
        
        this.availableCompanies = ['CDO', 'SUPORTE', 'WAUX', 'MONTEBELLO', 'HIRATA'];
        
        this.initialView = {
            center: [-22.5, -49.2],
            zoom: 7.2
        };
        
        // ✅ FIX BUG #10: Flag para prevenir race condition
        this.isLoadingGeoJson = false;
        
        // ✅ FIX BUG #12: Referência para event listener do dropdown
        this.dropdownClickHandler = null;
        
        this.loadFromLocalStorage();
    }

    // 📝 ==================== ACTIVITY LOGGER HELPER ====================
    
    logActivity(method, ...args) {
        if (window.activityLogger && typeof window.activityLogger[method] === 'function') {
            window.activityLogger[method](...args);
        }
    }

    // 💾 ==================== LOCALSTORAGE ====================
    
    loadFromLocalStorage() {
        try {
            const savedCities = localStorage.getItem('geoclient-marked-cities');
            if (savedCities) {
                try {
                    // ✅ FIX BUG #17: Validação antes de usar JSON.parse
                    this.markedCities = JSON.parse(savedCities);
                    
                    // ✅ Valida estrutura
                    if (typeof this.markedCities !== 'object' || Array.isArray(this.markedCities)) {
                        throw new Error('markedCities deve ser um objeto');
                    }
                    
                    this.syncOccupiedCities();
                    console.log(`💾 ${Object.keys(this.markedCities).length} cidades restauradas`);
                } catch (parseError) {
                    console.error('❌ Dados de cidades corrompidos, limpando localStorage');
                    localStorage.removeItem('geoclient-marked-cities');
                    this.markedCities = {};
                    this.showToast('⚠️ Dados de cidades corrompidos foram resetados', 'warning');
                }
            }
            
            const savedClients = localStorage.getItem('geoclient-clients');
            if (savedClients) {
                try {
                    // ✅ FIX BUG #17: Validação antes de usar JSON.parse
                    this.clients = JSON.parse(savedClients);
                    
                    // ✅ Valida estrutura
                    if (!Array.isArray(this.clients)) {
                        throw new Error('clients deve ser um array');
                    }
                    
                    console.log(`💾 ${this.clients.length} clientes restaurados`);
                } catch (parseError) {
                    console.error('❌ Dados de clientes corrompidos, limpando');
                    localStorage.removeItem('geoclient-clients');
                    this.clients = [];
                    this.showToast('⚠️ Dados de clientes corrompidos foram resetados', 'warning');
                }
            }
        } catch (error) {
            console.error('❌ Erro ao carregar localStorage:', error);
            this.logActivity('logError', 'Erro ao carregar localStorage', { error: error.message });
        }
    }
    
    saveToLocalStorage() {
        try {
            const citiesData = JSON.stringify(this.markedCities);
            const clientsData = JSON.stringify(this.clients);
            
            // ✅ FIX BUG #9: Verifica tamanho antes de salvar
            const totalSize = (citiesData.length + clientsData.length) / 1024 / 1024; // MB
            
            if (totalSize > 4.5) { // 4.5MB = margem de segurança
                this.showToast('⚠️ Dados muito grandes! Exporte para não perder.', 'warning');
                console.warn(`⚠️ Dados: ${totalSize.toFixed(2)}MB (próximo do limite)`);
            }
            
            localStorage.setItem('geoclient-marked-cities', citiesData);
            localStorage.setItem('geoclient-clients', clientsData);
            this.syncOccupiedCities();
            console.log('💾 Dados salvos');
        } catch (error) {
            // ✅ FIX BUG #9: Detecta QuotaExceededError
            if (error.name === 'QuotaExceededError') {
                this.showToast('❌ Espaço insuficiente! Exporte seus dados.', 'error');
                console.error('❌ QuotaExceededError - localStorage cheio');
            } else {
                console.error('❌ Erro ao salvar:', error);
            }
            this.logActivity('logError', 'Erro ao salvar no localStorage', { error: error.message });
        }
    }
    
    syncOccupiedCities() {
        this.occupiedCities = {};
        Object.entries(this.markedCities).forEach(([city, data]) => {
            if (data.companies && data.companies.length > 0) {
                this.occupiedCities[city] = data.companies;
            }
        });
    }
    
    clearAllData() {
        if (!confirm('⚠️ Limpar TODOS os dados?\n\n- Cidades marcadas\n- Clientes cadastrados\n\nNão pode ser desfeito!')) {
            return;
        }
        
        this.markedCities = {};
        this.occupiedCities = {};
        this.clients = [];
        localStorage.removeItem('geoclient-marked-cities');
        localStorage.removeItem('geoclient-clients');
        this.loadMunicipalitiesBoundaries();
        this.showToast('🗑️ Dados limpos!', 'success');
        this.logActivity('logDataCleared');
        window.dispatchEvent(new Event('cityDataChanged'));
    }
    
    showToast(message, type = 'success') {
        // ✅ FIX BUG #8: Limita número de toasts simultâneos
        const existingToasts = document.querySelectorAll('.app-toast');
        if (existingToasts.length >= 3) {
            existingToasts[0].remove(); // Remove o mais antigo
        }
        
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            info: '#3b82f6',
            warning: '#f59e0b'
        };
        
        const toast = document.createElement('div');
        toast.className = 'app-toast'; // ✅ Classe para identificar e limitar
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
        
        if (!document.getElementById('toast-animations')) {
            const style = document.createElement('style');
            style.id = 'toast-animations';
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
        }
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    init() {
        console.log('🚀 Inicializando GeoClient SP v3.1 FINAL...');
        
        const mapElement = document.getElementById('map');
        if (!mapElement) {
            console.error('❌ Elemento #map não encontrado!');
            return;
        }
        
        setTimeout(() => {
            this.initMap();
            this.createContextMenu();
            this.createTooltip();
            this.createCompanyDropdown();
            this.initMapControls();
            console.log('✅ GeoClient SP v3.1 FINAL iniciado com sucesso!');
        }, 100);
    }

    initMap() {
        try {
            this.map = L.map('map', {
                center: this.initialView.center,
                zoom: this.initialView.zoom,
                zoomControl: false,
                attributionControl: true,
                minZoom: 6,
                maxZoom: 12,
                doubleClickZoom: false,
                tap: false
            });
            
            this.map.off('dblclick');
            this.map.on('dblclick', (e) => {
                L.DomEvent.stopPropagation(e);
                L.DomEvent.preventDefault(e);
                return false;
            });
            
            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                attribution: '© OpenStreetMap © CARTO',
                subdomains: 'abcd',
                maxZoom: 20,
                minZoom: 6
            }).addTo(this.map);
            
            setTimeout(() => this.map.invalidateSize(), 250);
            this.loadMunicipalitiesBoundaries();
            
        } catch (error) {
            console.error('❌ Erro ao criar mapa:', error);
            this.logActivity('logError', 'Erro ao criar mapa', { error: error.message });
        }
    }

    initMapControls() {
        const mapControls = document.querySelector('custom-map-controls');
        if (mapControls && typeof mapControls.init === 'function') {
            mapControls.init(this.map);
        }
    }

    loadMunicipalitiesBoundaries() {
        // ✅ FIX BUG #10: Previne múltiplas chamadas simultâneas
        if (this.isLoadingGeoJson) {
            console.warn('⚠️ GeoJSON já está carregando...');
            return;
        }
        
        this.isLoadingGeoJson = true;
        const geojsonUrl = 'https://media.githubusercontent.com/media/Remotar-10/geoclient-sp/main/data/municipios-sp.geojson';
        
        fetch(geojsonUrl)
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                return response.json();
            })
            .then(municipalitiesData => {
                if (this.geoJsonLayer) {
                    this.map.removeLayer(this.geoJsonLayer);
                }
                
                this.geoJsonLayer = L.geoJSON(municipalitiesData, {
                    style: (feature) => {
                        const name = this.getMunicipalityName(feature);
                        const cityData = this.markedCities[name];
                        
                        if (cityData && cityData.companies && cityData.companies.length > 0) {
                            return {
                                fillColor: this.getCompanyColor(cityData.companies[0]),
                                weight: 2,
                                opacity: 1,
                                color: '#374151',
                                fillOpacity: 0.7
                            };
                        } else {
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
                            layer.setStyle({ weight: cityData ? 4 : 3, fillOpacity: cityData ? 0.85 : 0.3 });
                            this.showTooltip(name);
                        });
                        
                        layer.on('mouseout', () => {
                            this.geoJsonLayer.resetStyle(layer);
                            this.hideTooltip();
                        });

                        layer.off('dblclick');
                        layer.on('dblclick', (e) => L.DomEvent.stop(e));
                        
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

                console.log(`✅ ${municipalitiesData.features.length} municípios carregados`);
            })
            .catch(error => {
                console.error('❌ Erro ao carregar municípios:', error);
                this.showToast('❌ Erro ao carregar mapa', 'error');
                this.logActivity('logError', 'Erro ao carregar municípios', { error: error.message });
            })
            .finally(() => {
                // ✅ FIX BUG #10: Libera flag sempre (sucesso ou erro)
                this.isLoadingGeoJson = false;
            });
    }

    getMunicipalityName(feature) {
        const properties = feature.properties || {};
        return properties.name || properties.NAME || properties.NOME || 
               properties.NM_MUNI || properties.NM_MUNICIPIO || 
               properties.nm_municipio || properties.NM_MUN || 'Município Desconhecido';
    }

    handleCityClick(name, layer, event) {
        this.lastClickPosition = {
            x: event.originalEvent.clientX,
            y: event.originalEvent.clientY
        };
        
        this.currentCityName = name;
        
        const latlng = event.latlng;
        const currentZoom = this.map.getZoom();
        const newZoom = Math.min(currentZoom + 1, 12);
        this.map.flyTo(latlng, newZoom, { duration: 0.6, easeLinearity: 0.25 });
        
        setTimeout(() => {
            this.showCompanyDropdown(name);
        }, 600);
    }

    removeCity(name) {
        const layer = this.cityLayers[name];
        if (!layer || !this.markedCities[name]) return;
        
        delete this.markedCities[name];
        layer.setStyle({
            fillColor: '#d1d5db',
            weight: 1.5,
            opacity: 1,
            color: '#6b7280',
            fillOpacity: 0.2
        });
        this.saveToLocalStorage();
        this.showToast(`🗑️ ${name} removido`, 'info');
        this.logActivity('logCityRemoved', name);
        window.dispatchEvent(new Event('cityDataChanged'));
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
        if (!this.markedCities[cityName]) {
            this.markedCities[cityName] = { companies: [] };
        }
        
        const city = this.markedCities[cityName];
        city.companies.push(company);
        
        const layer = this.cityLayers[cityName];
        if (layer) {
            layer.setStyle({
                fillColor: this.getCompanyColor(company),
                weight: 2,
                opacity: 1,
                color: '#374151',
                fillOpacity: 0.7
            });
        }
        
        this.saveToLocalStorage();
        this.showToast(`✅ ${company} adicionado a ${cityName}`, 'success');
        this.logActivity('logCompanyAdded', cityName, company);
        window.dispatchEvent(new Event('cityDataChanged'));
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
        
        if (!this.markedCities[cityName]) return;
        
        // ✅ FIX BUG #11: Cria elemento via DOM (não innerHTML) para prevenir XSS
        this.contextMenu.innerHTML = '';
        
        const button = document.createElement('div');
        button.style.cssText = 'padding: 12px; cursor: pointer; border-radius: 6px; color: #ef4444; font-weight: 600;';
        button.textContent = '🗑️ Remover Marcação';
        
        button.addEventListener('click', () => {
            if (confirm(`Remover ${cityName}?`)) {
                this.removeCity(cityName);
                this.contextMenu.style.display = 'none';
            }
        });
        
        this.contextMenu.appendChild(button);
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
            bottom: 80px;
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
        
        if (!cityData || !cityData.companies || cityData.companies.length === 0) {
            content = `<div><b>${cityName}</b><br><small style="color: #9ca3af;">⚪ Disponível</small></div>`;
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
        
        // ✅ FIX BUG #13: Ajusta posição dinamicamente se sair da tela
        setTimeout(() => {
            const rect = this.tooltip.getBoundingClientRect();
            
            // Ajusta horizontal se necessário
            if (rect.right > window.innerWidth - 10) {
                this.tooltip.style.right = '10px';
            }
            
            // Ajusta vertical se necessário
            if (rect.bottom > window.innerHeight - 10) {
                this.tooltip.style.bottom = '10px';
            }
        }, 0);
    }

    hideTooltip() {
        this.tooltip.style.display = 'none';
        // ✅ Reseta posição para padrão
        this.tooltip.style.right = '20px';
        this.tooltip.style.bottom = '80px';
    }

    createCompanyDropdown() {
        const existingDropdown = document.getElementById('company-dropdown');
        if (existingDropdown) existingDropdown.remove();
        
        // ✅ FIX BUG #12: Remove listener anterior se existir
        if (this.dropdownClickHandler) {
            document.removeEventListener('click', this.dropdownClickHandler);
        }
        
        this.companyDropdown = document.createElement('div');
        this.companyDropdown.id = 'company-dropdown';
        this.companyDropdown.style.cssText = `
            position: fixed;
            display: none;
            background: white;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.2);
            padding: 20px;
            z-index: 10001;
            min-width: 280px;
            max-width: 320px;
        `;
        document.body.appendChild(this.companyDropdown);
        
        // ✅ FIX BUG #12: Armazena referência do listener para poder remover depois
        this.dropdownClickHandler = (e) => {
            if (this.companyDropdown.style.display === 'block' && 
                !this.companyDropdown.contains(e.target)) {
                this.hideCompanyDropdown();
            }
        };
        
        document.addEventListener('click', this.dropdownClickHandler);
    }

    showCompanyDropdown(cityName) {
        const cityData = this.markedCities[cityName] || { companies: [] };
        
        this.currentCityName = cityName;
        const availableCompanies = this.availableCompanies.filter(c => 
            !cityData.companies.includes(c)
        );
        
        let content = `
            <div style="margin-bottom: 16px; padding-bottom: 12px; border-bottom: 2px solid #e5e7eb;">
                <h3 style="margin: 0; font-size: 18px; font-weight: 700; color: #1f2937;">${cityName}</h3>
                <p style="margin: 4px 0 0 0; font-size: 13px; color: #6b7280;">Selecione uma empresa</p>
            </div>
        `;
        
        if (availableCompanies.length === 0) {
            content += `<p style="text-align: center; color: #9ca3af; padding: 12px;">Todas as empresas já foram adicionadas</p>`;
        } else {
            content += `
                <select id="company-select" 
                        style="
                            width: 100%;
                            padding: 12px 16px;
                            font-size: 15px;
                            font-weight: 600;
                            border: 2px solid #d1d5db;
                            border-radius: 8px;
                            background: white;
                            color: #374151;
                            cursor: pointer;
                            outline: none;
                            transition: all 0.2s;
                        "
                        onchange="window.app.handleCompanySelect(this.value);">
                    <option value="" disabled selected>- Selecione -</option>
            `;
            
            availableCompanies.forEach(company => {
                content += `<option value="${company}">${company}</option>`;
            });
            
            content += `</select>`;
        }
        
        content += `
            <button onclick="window.app.cancelDropdown();" 
                    style="
                        margin-top: 12px;
                        padding: 12px;
                        width: 100%;
                        background: #f3f4f6;
                        border: none;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 600;
                        color: #374151;
                        font-size: 14px;
                    "
                    onmouseover="this.style.background='#e5e7eb';"
                    onmouseout="this.style.background='#f3f4f6';">
                Cancelar
            </button>
        `;
        
        this.companyDropdown.innerHTML = content;
        
        // ✅ FIX BUG #16: Calcula altura REAL após renderizar
        this.companyDropdown.style.display = 'block';
        this.companyDropdown.style.visibility = 'hidden'; // Invisível temporariamente
        
        // Aguarda renderização
        setTimeout(() => {
            const rect = this.companyDropdown.getBoundingClientRect();
            const dropdownWidth = rect.width;
            const dropdownHeight = rect.height;
            
            let left = this.lastClickPosition.x - (dropdownWidth / 2);
            let top = this.lastClickPosition.y + 20;
            
            // Ajustes de posição
            if (left < 10) left = 10;
            if (left + dropdownWidth > window.innerWidth - 10) {
                left = window.innerWidth - dropdownWidth - 10;
            }
            if (top + dropdownHeight > window.innerHeight - 10) {
                top = Math.max(10, this.lastClickPosition.y - dropdownHeight - 20);
            }
            
            this.companyDropdown.style.left = left + 'px';
            this.companyDropdown.style.top = top + 'px';
            this.companyDropdown.style.visibility = 'visible'; // Torna visível
        }, 0);
    }

    handleCompanySelect(company) {
        if (!company || !this.currentCityName) return;
        this.addCompanyToCity(this.currentCityName, company);
        this.hideCompanyDropdown();
    }

    cancelDropdown() {
        this.hideCompanyDropdown();
    }

    hideCompanyDropdown() {
        this.companyDropdown.style.display = 'none';
        this.currentCityName = null;
    }

    exportCSV() {
        if (this.clients.length === 0) {
            this.showToast('❌ Nenhum cliente para exportar', 'warning');
            return;
        }
        
        const headers = ['ID', 'Nome', 'Município', 'Empresa', 'Segmento', 'Status'];
        const rows = this.clients.map(c => [
            c.id, c.name, c.municipality || '', c.company || '', c.segment || '', c.status
        ]);
        
        // ✅ FIX BUG #14: Escapa caracteres especiais corretamente
        const escapeCsvCell = (cell) => {
            const str = String(cell);
            // Se contém aspas, vírgulas ou quebras de linha, envolve em aspas e duplica aspas internas
            if (str.includes('"') || str.includes(',') || str.includes('\n')) {
                return `"${str.replace(/"/g, '""')}`;
            }
            return `"${str}"`;
        };
        
        const csv = [headers, ...rows]
            .map(row => row.map(escapeCsvCell).join(','))
            .join('\n');
        
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `geoclient-clientes-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        
        this.showToast('📥 CSV exportado!', 'success');
        this.logActivity('logExport', 'csv', this.clients.length);
    }

    exportJSON() {
        const data = {
            exportDate: new Date().toISOString(),
            clients: this.clients,
            markedCities: this.markedCities,
            occupiedCities: this.occupiedCities
        };
        
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `geoclient-dados-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        this.showToast('📥 JSON exportado!', 'success');
        this.logActivity('logExport', 'json', this.clients.length);
    }

    showImportModal() {
        const modal = document.createElement('div');
        modal.id = 'import-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10005;
        `;
        
        modal.innerHTML = `
            <div style="background: white; border-radius: 16px; padding: 32px; max-width: 500px; width: 90%;">
                <h2 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 700;">📥 Importar Dados</h2>
                <p style="color: #6b7280; margin-bottom: 20px;">Selecione um arquivo CSV ou JSON para importar</p>
                <input type="file" id="import-file-input" accept=".csv,.json" style="width: 100%; padding: 12px; border: 2px dashed #d1d5db; border-radius: 8px; margin-bottom: 20px;">
                <div style="display: flex; gap: 12px; justify-content: flex-end;">
                    <button onclick="document.getElementById('import-modal').remove();" style="padding: 10px 20px; background: #f3f4f6; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">Cancelar</button>
                    <button onclick="window.app.processImportFile();" style="padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">Importar</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    processImportFile() {
        const input = document.getElementById('import-file-input');
        if (!input || !input.files || input.files.length === 0) {
            this.showToast('❌ Selecione um arquivo', 'error');
            return;
        }
        
        const file = input.files[0];
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const content = e.target.result;
                let importedCount = 0;
                
                if (file.name.endsWith('.json')) {
                    const data = JSON.parse(content);
                    if (data.clients) {
                        this.clients = data.clients;
                        importedCount = data.clients.length;
                    }
                    if (data.markedCities) {
                        this.markedCities = data.markedCities;
                    }
                } else if (file.name.endsWith('.csv')) {
                    // ✅ FIX BUG #15: Parser CSV correto que respeita RFC 4180
                    const lines = content.split('\n');
                    
                    const parseCsvLine = (line) => {
                        const result = [];
                        let current = '';
                        let inQuotes = false;
                        
                        for (let i = 0; i < line.length; i++) {
                            const char = line[i];
                            
                            if (char === '"') {
                                if (inQuotes && line[i + 1] === '"') {
                                    // Aspas duplas dentro de campo = aspas literal
                                    current += '"';
                                    i++;
                                } else {
                                    // Alterna estado de estar dentro/fora de aspas
                                    inQuotes = !inQuotes;
                                }
                            } else if (char === ',' && !inQuotes) {
                                // Vírgula fora de aspas = separador de campo
                                result.push(current.trim());
                                current = '';
                            } else {
                                current += char;
                            }
                        }
                        result.push(current.trim());
                        return result;
                    };
                    
                    this.clients = lines.slice(1).filter(line => line.trim()).map((line, index) => {
                        const values = parseCsvLine(line);
                        return {
                            id: parseInt(values[0]) || index + 1,
                            name: values[1] || '',
                            municipality: values[2] || '',
                            company: values[3] || '',
                            segment: values[4] || '',
                            status: values[5] || 'active'
                        };
                    });
                    importedCount = this.clients.length;
                }
                
                this.saveToLocalStorage();
                this.loadMunicipalitiesBoundaries();
                
                document.getElementById('import-modal').remove();
                this.showToast('✅ Dados importados!', 'success');
                
                const format = file.name.endsWith('.json') ? 'json' : 'csv';
                this.logActivity('logImport', format, importedCount);
                window.dispatchEvent(new Event('cityDataChanged'));
            } catch (error) {
                console.error('Erro ao importar:', error);
                this.showToast('❌ Erro ao importar arquivo', 'error');
                this.logActivity('logError', 'Erro ao importar arquivo', { error: error.message });
            }
        };
        
        reader.readAsText(file);
    }
}

// ✅ Error boundary para capturar erros fatais na inicialização
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.app = new GeoClientApp();
        window.app.init();
    } catch (error) {
        console.error('❌ Erro fatal ao inicializar app:', error);
        
        // Mostra mensagem amigável ao usuário
        document.body.innerHTML = `
            <div style="
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100vh;
                font-family: sans-serif;
                background: #f9fafb;
                color: #374151;
            ">
                <div style="text-align: center; max-width: 500px; padding: 32px;">
                    <div style="font-size: 64px; margin-bottom: 20px;">❌</div>
                    <h1 style="margin: 0 0 16px 0; font-size: 24px;">Erro ao carregar aplicação</h1>
                    <p style="color: #6b7280; margin-bottom: 24px;">
                        Ocorreu um erro inesperado. Por favor, recarregue a página.
                    </p>
                    <button onclick="location.reload()" style="
                        padding: 12px 24px;
                        background: #3b82f6;
                        color: white;
                        border: none;
                        border-radius: 8px;
                        font-size: 16px;
                        font-weight: 600;
                        cursor: pointer;
                    ">
                        Recarregar Página
                    </button>
                    <details style="margin-top: 24px; text-align: left;">
                        <summary style="cursor: pointer; color: #6b7280;">Detalhes técnicos</summary>
                        <pre style="
                            margin-top: 12px;
                            padding: 12px;
                            background: white;
                            border-radius: 6px;
                            overflow: auto;
                            font-size: 12px;
                            color: #ef4444;
                        ">${error.stack || error.message}</pre>
                    </details>
                </div>
            </div>
        `;
    }
});