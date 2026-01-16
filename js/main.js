// GeoClient SP - VERSÃO PREMIUM v3.2.0 - Sistema de 1 CLIQUE COM ZOOM 1x
// Sistema de cliques: 1=zoom 1x + dropdown (NÃO marca) | Seleciona empresa=marca com cor
// ✅ ACTIVITY LOGGER TOTALMENTE INTEGRADO
// ✅ Botão Home agora é gerenciado por map-controls.js
// ✅ Botões +/- de zoom REMOVIDOS (zoomControl: false)
// ✅ 5 empresas: CDO, SUPORTE, WAUX, MONTEBELLO, HIRATA
// ✅ Código de busca obsoleto removido (navbar.js deletado)
// ✅ Código limpo e otimizado

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
        this.totalMunicipalitiesSP = 645;
        
        this.initialView = {
            center: [-22.5, -49.2],
            zoom: 7.2
        };
        
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
                this.markedCities = JSON.parse(savedCities);
                this.syncOccupiedCities();
                console.log(`💾 ${Object.keys(this.markedCities).length} cidades restauradas`);
            }
            
            const savedClients = localStorage.getItem('geoclient-clients');
            if (savedClients) {
                this.clients = JSON.parse(savedClients);
                console.log(`💾 ${this.clients.length} clientes restaurados`);
            }
        } catch (error) {
            console.error('❌ Erro ao carregar localStorage:', error);
            this.logActivity('logError', 'Erro ao carregar localStorage', { error: error.message });
        }
    }
    
    saveToLocalStorage() {
        try {
            localStorage.setItem('geoclient-marked-cities', JSON.stringify(this.markedCities));
            localStorage.setItem('geoclient-clients', JSON.stringify(this.clients));
            this.syncOccupiedCities();
            console.log('💾 Dados salvos');
        } catch (error) {
            console.error('❌ Erro ao salvar:', error);
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
        console.log('🗺️ Inicializando GeoClient SP Premium v3.2.0...');
        
        const mapElement = document.getElementById('map');
        if (!mapElement) {
            console.error('❌ Elemento #map não encontrado!');
            return;
        }
        
        setTimeout(() => {
            this.initMap();
            this.setupEventListeners();
            this.createContextMenu();
            this.createTooltip();
            this.createCompanyDropdown();
            this.initMapControls();
            console.log('✅ GeoClient SP v3.2.0 iniciado!');
            console.log('🖋️ 1 CLIQUE = Zoom 1x + Dropdown | Seleciona empresa = Marca cidade');
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
            console.log('✅ Map controls inicializados via componente');
        } else {
            console.warn('⚠️ Componente custom-map-controls não encontrado');
        }
    }

    loadMunicipalitiesBoundaries() {
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
                        
                        // ✅ 1 CLIQUE = Zoom 1x + Dropdown
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
            });
    }

    getMunicipalityName(feature) {
        const properties = feature.properties || {};
        return properties.name || properties.NAME || properties.NOME || 
               properties.NM_MUNI || properties.NM_MUNICIPIO || 
               properties.nm_municipio || properties.NM_MUN || 'Município Desconhecido';
    }

    // ✅ Sistema balanceado - 1 CLIQUE = Zoom 1x + Dropdown
    handleCityClick(name, layer, event) {
        this.lastClickPosition = {
            x: event.originalEvent.clientX,
            y: event.originalEvent.clientY
        };
        
        this.currentCityName = name;
        
        // Zoom suave de 1x (não agressivo)
        const latlng = event.latlng;
        const currentZoom = this.map.getZoom();
        const newZoom = Math.min(currentZoom + 1, 12); // +1 zoom level
        this.map.flyTo(latlng, newZoom, { duration: 0.6, easeLinearity: 0.25 });
        
        console.log(`🔍 Zoom 1x em ${name}`);
        
        // Aguarda animação do zoom e abre dropdown
        setTimeout(() => {
            this.showCompanyDropdown(name);
            console.log(`📋 Dropdown aberto para ${name} (cidade NÃO marcada ainda)`);
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
        console.log(`✅ Cidade ${cityName} marcada com ${company}`);
        this.logActivity('logCompanyAdded', cityName, company);
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
        
        this.contextMenu.innerHTML = `
            <div onclick="if(confirm('Remover ${cityName}?')) { window.app.removeCity('${cityName}'); window.app.contextMenu.style.display='none'; }"
                 style="padding: 12px; cursor: pointer; border-radius: 6px; color: #ef4444; font-weight: 600;">
                🗑️ Remover Marcação
            </div>
        `;
        
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
        
        document.addEventListener('click', (e) => {
            if (this.companyDropdown.style.display === 'block' && 
                !this.companyDropdown.contains(e.target)) {
                this.hideCompanyDropdown();
            }
        });
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
        
        const dropdownWidth = 280;
        const dropdownHeight = 250;
        
        let left = this.lastClickPosition.x - (dropdownWidth / 2);
        let top = this.lastClickPosition.y + 20;
        
        if (left < 10) left = 10;
        if (left + dropdownWidth > window.innerWidth - 10) {
            left = window.innerWidth - dropdownWidth - 10;
        }
        if (top + dropdownHeight > window.innerHeight - 10) {
            top = this.lastClickPosition.y - dropdownHeight - 20;
        }
        
        this.companyDropdown.style.left = left + 'px';
        this.companyDropdown.style.top = top + 'px';
        this.companyDropdown.style.display = 'block';
    }

    handleCompanySelect(company) {
        if (!company || !this.currentCityName) return;
        this.addCompanyToCity(this.currentCityName, company);
        this.hideCompanyDropdown();
    }

    cancelDropdown() {
        console.log(`❌ Cancelado: ${this.currentCityName} não foi marcada`);
        this.hideCompanyDropdown();
    }

    hideCompanyDropdown() {
        this.companyDropdown.style.display = 'none';
        this.currentCityName = null;
    }

    setupEventListeners() {
        console.log('✅ Event listeners configurados');
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
        
        const csv = [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
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
                    const lines = content.split('\n');
                    const headers = lines[0].split(',');
                    this.clients = lines.slice(1).filter(line => line.trim()).map((line, index) => {
                        const values = line.split(',').map(v => v.replace(/"/g, '').trim());
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
            } catch (error) {
                console.error('Erro ao importar:', error);
                this.showToast('❌ Erro ao importar arquivo', 'error');
                this.logActivity('logError', 'Erro ao importar arquivo', { error: error.message });
            }
        };
        
        reader.readAsText(file);
    }
}

let app;
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM Carregado!');
    app = new GeoClientApp();
    window.app = app;
    app.init();
    console.log('✨ GeoClient SP v3.2.0 - Código limpo! ✅');
});