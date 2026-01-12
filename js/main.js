// GeoClient SP - VERSÃO ESTÁVEL
// Sistema de cliques: 1=marca | 2=abre popup | Botão=remove

class GeoClientApp {
    constructor() {
        this.map = null;
        this.currentFilters = { company: '', segment: '', status: 'todos' };
        this.currentClients = [];
        this.markers = {};
        this.geoJsonLayer = null;
        this.markedCities = {};
        this.cityLayers = {};
        
        this.availableCompanies = ['CDO', 'SUPORTE', 'WAUX', 'MONTEBELLO', 'HIRATA'];
        
        this.clickCount = 0;
        this.clickTimer = null;
        this.clickTimeout = 400;
        
        this.initialView = {
            center: [-22.5, -49.2],
            zoom: 7.2
        };
    }

    init() {
        console.log('🗺️ Inicializando GeoClient SP...');
        
        const mapElement = document.getElementById('map');
        if (!mapElement) {
            console.error('❌ Elemento #map não encontrado!');
            return;
        }
        
        console.log('✅ Elemento #map encontrado');
        
        setTimeout(() => {
            this.initMap();
            this.setupEventListeners();
            this.renderClientTable();
            this.renderMarkers();
            console.log('✅ GeoClient SP iniciado!');
            console.log('🟤 1 CLIQUE = Marca cidade (aguardando empresa)');
            console.log('🎨 2 CLIQUES = Abre popup com lista de empresas');
            console.log('❌ BOTÃO = Remove marcação');
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
            
            tileLayer.on('tileerror', () => {
                console.log('🔄 Tentando fallback...');
                this.map.removeLayer(tileLayer);
                const fallback = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap contributors',
                    maxZoom: 19
                });
                fallback.addTo(this.map);
            });
            
            setTimeout(() => {
                this.map.invalidateSize();
            }, 250);
            
            this.loadMunicipalitiesBoundaries();
            
            const mapControls = document.querySelector('custom-map-controls');
            if (mapControls) {
                mapControls.init(this.map);
            }
            
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
                        
                        // Cidade COM empresa - USA COR DA EMPRESA
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
                        // Cidade marcada SEM empresa - CINZA ESCURO (aguardando)
                        else if (cityData) {
                            return {
                                fillColor: '#9ca3af',
                                weight: 2,
                                opacity: 1,
                                color: '#4b5563',
                                fillOpacity: 0.6
                            };
                        } 
                        // Cidade disponível - CINZA CLARO
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
                        this.updatePopup(layer, name);
                        
                        layer.on('mouseover', () => {
                            const cityData = this.markedCities[name];
                            if (!cityData) {
                                layer.setStyle({ weight: 3, fillOpacity: 0.3 });
                            } else {
                                layer.setStyle({ weight: 4, fillOpacity: 0.85 });
                            }
                        });
                        
                        layer.on('mouseout', () => {
                            this.geoJsonLayer.resetStyle(layer);
                        });

                        layer.off('dblclick');
                        layer.on('dblclick', (e) => {
                            L.DomEvent.stop(e);
                            return false;
                        });

                        layer.on('click', (e) => {
                            L.DomEvent.stop(e);
                            this.handleCityClick(name, layer);
                        });
                    }
                }).addTo(this.map);

                console.log(`✅ ${municipalitiesData.features.length} municípios carregados!`);
            })
            .catch(error => {
                console.error('❌ Erro ao carregar municípios:', error);
            });
    }

    handleCityClick(name, layer) {
        this.clickCount++;
        
        clearTimeout(this.clickTimer);
        
        this.clickTimer = setTimeout(() => {
            const clicks = this.clickCount;
            this.clickCount = 0;
            
            if (clicks === 1) {
                this.markCity(name, layer);
            } else if (clicks >= 2) {
                this.openCompanySelection(name, layer);
            }
        }, this.clickTimeout);
    }

    markCity(name, layer) {
        if (!this.markedCities[name]) {
            // Marca cidade SEM empresa (cinza escuro - aguardando)
            this.markedCities[name] = { companies: [] };
            
            layer.setStyle({
                fillColor: '#9ca3af',
                weight: 2,
                opacity: 1,
                color: '#4b5563',
                fillOpacity: 0.6
            });
            
            this.updatePopup(layer, name);
            console.log(`🟤 Marcado: ${name} (aguardando empresa)`);
            
            // NÃO abre popup ao marcar
        } else {
            // Já está marcada, apenas abre popup para ver detalhes
            layer.openPopup();
        }
    }

    openCompanySelection(name, layer) {
        const cityData = this.markedCities[name];
        
        if (!cityData) {
            // Se não está marcada, marca primeiro
            this.markCity(name, layer);
            return;
        }
        
        // Abre popup para seleção de empresa
        console.log(`🎨 Abrindo seleção de empresa: ${name}`);
        layer.openPopup();
        
        // ✅ Expande automaticamente a lista de empresas
        setTimeout(() => {
            const dropdown = document.getElementById(`company-list-${name.replace(/\s+/g, '-')}`);
            if (dropdown) {
                dropdown.style.display = 'block';
                console.log(`✅ Lista de empresas expandida: ${name}`);
            }
        }, 100);
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
            
            this.updatePopup(layer, name);
            console.log(`🗑️ Removido: ${name}`);
            console.log(`📊 Total marcadas: ${Object.keys(this.markedCities).length}`);
            
            layer.closePopup();
        }
    }

    updatePopup(layer, name) {
        const isMarked = this.markedCities[name];
        const safeId = name.replace(/\s+/g, '-');
        let popupContent = `<div style="padding:12px; min-width:250px">`;
        
        if (isMarked) {
            // Cidade marcada
            if (isMarked.companies.length > 0) {
                // COM empresa
                const color = this.getCompanyColor(isMarked.companies[0]);
                popupContent += `<b style="color:${color}; font-size:16px">${name}</b><br>`;
                popupContent += `<small style="color:#666">🎨 COM EMPRESA</small><br><br>`;
            } else {
                // SEM empresa (aguardando)
                popupContent += `<b style="color:#6b7280; font-size:16px">${name}</b><br>`;
                popupContent += `<small style="color:#f59e0b">⏳ AGUARDANDO EMPRESA</small><br><br>`;
            }
            
            if (isMarked.companies.length > 0) {
                popupContent += `<div style="margin-bottom:12px">`;
                popupContent += `<b style="font-size:13px">Empresas (${isMarked.companies.length}):</b><br>`;
                isMarked.companies.forEach(company => {
                    const color = this.getCompanyColor(company);
                    popupContent += `<span style="background:${color};color:white;padding:4px 10px;border-radius:6px;display:inline-block;margin:3px;font-size:12px;font-weight:600">${company}</span>`;
                });
                popupContent += `</div>`;
            }
            
            const availableCompanies = this.availableCompanies.filter(c => !isMarked.companies.includes(c));
            
            if (availableCompanies.length > 0) {
                popupContent += `
                    <div style="margin-bottom:10px">
                        <button class="add-company-btn" type="button" 
                                style="background:#3b82f6;border:none;padding:10px 16px;border-radius:8px;cursor:pointer;width:100%;font-size:14px;font-weight:600;color:white"
                                onclick="event.stopPropagation(); var el = document.getElementById('company-list-${safeId}'); el.style.display = el.style.display === 'none' ? 'block' : 'none';">
                            ➕ Adicionar Empresa
                        </button>
                        <div id="company-list-${safeId}" style="width:100%;box-shadow:0 4px 12px rgba(0,0,0,0.15);border-radius:8px;padding:8px;display:none;margin-top:8px;background:white">
                `;
                
                availableCompanies.forEach(company => {
                    const color = this.getCompanyColor(company);
                    popupContent += `
                        <button type="button" 
                                onclick="app.addCompanyToCity('${name}', '${company}')"
                                style="padding:10px 14px;border-radius:6px;cursor:pointer;border:none;background:white;width:100%;text-align:left;margin:2px 0;transition:all 0.2s"
                                onmouseover="this.style.background='${color}';this.style.color='white'"
                                onmouseout="this.style.background='white';this.style.color='#333'">
                            <span style="display:inline-block;width:14px;height:14px;background:${color};border-radius:3px;margin-right:8px"></span>
                            <strong>${company}</strong>
                        </button>
                    `;
                });
                
                popupContent += `
                        </div>
                    </div>
                `;
            } else {
                popupContent += `<div style="padding:10px;background:#f3f4f6;border-radius:8px;text-align:center;color:#666;font-size:13px">✅ Todas as empresas adicionadas!</div>`;
            }
            
            // ❌ BOTÃO REMOVER
            popupContent += `
                <button type="button" 
                        onclick="if(confirm('Remover marcação de ${name}?')) app.removeCity('${name}')"
                        style="background:#ef4444;border:none;padding:10px 16px;border-radius:8px;cursor:pointer;width:100%;font-size:14px;font-weight:600;color:white;margin-top:8px;transition:all 0.2s"
                        onmouseover="this.style.background='#dc2626'"
                        onmouseout="this.style.background='#ef4444'">
                    🗑️ Remover Marcação
                </button>
            `;
        } else {
            // Cidade disponível
            popupContent += `<b style="font-size:16px">${name}</b><br>`;
            popupContent += `<small style="color:#666">⚪ DISPONÍVEL</small><br><br>`;
            popupContent += `<small style="color:#0066cc;font-weight:600">1 clique para marcar<br>2 cliques para adicionar empresa</small>`;
        }
        
        popupContent += `</div>`;
        layer.bindPopup(popupContent, { maxWidth: 280 });
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
        const color = this.getCompanyColor(company);
        console.log(`✅ ${company} adicionada em ${cityName} - Cor: ${color}`);
        
        const oldLayer = this.geoJsonLayer;
        if (oldLayer) {
            this.map.removeLayer(oldLayer);
        }
        
        this.loadMunicipalitiesBoundaries();
        
        // ✅ Fecha popup automaticamente após adicionar
        setTimeout(() => {
            const layer = this.cityLayers[cityName];
            if (layer) {
                this.updatePopup(layer, cityName);
                
                setTimeout(() => {
                    layer.closePopup();
                    console.log(`✅ Popup fechado após adicionar: ${cityName}`);
                }, 2000);
            }
        }, 300);
    }

    setupEventListeners() {
        window.addEventListener('filtersChanged', (e) => {
            this.currentFilters = e.detail;
            this.applyFilters();
        });

        const resetBtn = document.getElementById('reset-map');
        if (resetBtn) resetBtn.addEventListener('click', () => this.resetMap());

        const exportBtn = document.getElementById('export-map');
        if (exportBtn) exportBtn.addEventListener('click', () => this.exportData());

        const addClientBtn = document.getElementById('add-client');
        if (addClientBtn) addClientBtn.addEventListener('click', () => this.openModal());

        const closeModalBtn = document.getElementById('close-modal');
        if (closeModalBtn) closeModalBtn.addEventListener('click', () => this.closeModal());

        const clientForm = document.getElementById('client-form');
        if (clientForm) clientForm.addEventListener('submit', (e) => this.handleFormSubmit(e));

        const modal = document.getElementById('client-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.closeModal();
            });
        }
    }

    renderMarkers() {
        Object.values(this.markers).forEach(marker => this.map.removeLayer(marker));
        this.markers = {};

        this.currentClients.forEach(client => {
            const color = client.status === 'ativo' ? '#22c55e' : '#eab308';
            
            const marker = L.circleMarker([client.lat, client.lng], {
                radius: 8,
                fillColor: color,
                color: 'white',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.8,
                zIndex: 1000
            }).addTo(this.map);

            marker.bindPopup(`
                <div style="padding:8px">
                    <b>${client.name}</b><br>
                    <small>${client.segment} | ${client.company}<br>${client.municipality}</small>
                </div>
            `);

            marker.on('click', () => this.map.setView([client.lat, client.lng], 12));
            this.markers[client.id] = marker;
        });
    }

    renderClientTable() {
        const tbody = document.getElementById('clients-table');
        if (!tbody) return;

        tbody.innerHTML = this.currentClients.map(client => `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">${client.name}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">${client.segment}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">${client.company}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">${client.Funcionário}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                    <span class="badge ${client.status === 'ativo' ? 'badge-success' : 'badge-warning'}">${client.status}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">${client.municipality}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <button onclick="app.editClient(${client.id})" class="text-blue-600">✏️</button>
                    <button onclick="app.deleteClient(${client.id})" class="text-red-600">🗑️</button>
                </td>
            </tr>
        `).join('');
    }

    applyFilters() {
        let filtered = [];
        if (this.currentFilters.company) filtered = filtered.filter(c => c.company === this.currentFilters.company);
        if (this.currentFilters.segment) filtered = filtered.filter(c => c.segment === this.currentFilters.segment);
        if (this.currentFilters.status !== 'todos') filtered = filtered.filter(c => c.status === this.currentFilters.status);

        this.currentClients = filtered;
        this.renderClientTable();
        this.renderMarkers();
    }

    resetMap() {
        this.map.setView(this.initialView.center, this.initialView.zoom);
        this.currentFilters = { company: '', segment: '', status: 'todos' };
        this.currentClients = [];
        this.loadMunicipalitiesBoundaries();
        this.renderClientTable();
        this.renderMarkers();
        console.log('♻️ Mapa resetado');
    }

    openModal(clientId = null) {
        const modal = document.getElementById('client-modal');
        const form = document.getElementById('client-form');
        if (!modal || !form) return;

        if (clientId) {
            const client = CLIENTS_DATA.find(c => c.id === clientId);
            if (client) {
                document.getElementById('modal-title').textContent = 'Editar Cliente';
                document.getElementById('client-name').value = client.name;
                document.getElementById('client-municipality').value = client.municipality;
                document.getElementById('client-id').value = clientId;
            }
        } else {
            document.getElementById('modal-title').textContent = 'Novo Cliente';
            form.reset();
            document.getElementById('client-id').value = '';
        }
        modal.style.display = 'flex';
    }

    closeModal() {
        const modal = document.getElementById('client-modal');
        if (modal) modal.style.display = 'none';
    }

    handleFormSubmit(e) {
        e.preventDefault();
        const name = document.getElementById('client-name').value;
        const municipality = document.getElementById('client-municipality').value;

        if (!name || !municipality) {
            alert('Preencha todos os campos!');
            return;
        }

        const coords = MUNICIPALITIES[municipality];
        if (!coords) {
            alert('Município não encontrado!');
            return;
        }

        const clientId = document.getElementById('client-id').value;
        if (clientId) {
            updateClient(parseInt(clientId), { name, municipality, lat: coords.lat, lng: coords.lng });
        } else {
            addClient({
                name, municipality, segment: 'Lubrificantes', company: 'CDO',
                Funcionário: 'Novo', status: 'ativo',
                lat: coords.lat, lng: coords.lng,
                contact: 'contato@newclient.com', phone: '(XX) 0000-0000'
            });
        }

        this.closeModal();
        this.applyFilters();
        this.loadMunicipalitiesBoundaries();
        this.map.setView([coords.lat, coords.lng], 12);
    }

    editClient(clientId) { this.openModal(clientId); }

    deleteClient(clientId) {
        if (confirm('Deletar este cliente?')) {
            deleteClient(clientId);
            this.currentClients = this.currentClients.filter(c => c.id !== clientId);
            this.renderClientTable();
            this.renderMarkers();
            this.loadMunicipalitiesBoundaries();
        }
    }

    exportData() {
        if (Object.keys(this.markedCities).length === 0) {
            alert('Nenhuma cidade marcada para exportar!');
            return;
        }
        
        const data = Object.entries(this.markedCities).map(([city, info]) => ({
            cidade: city,
            empresas: info.companies.join(', '),
            total_empresas: info.companies.length,
            cores: info.companies.map(c => this.getCompanyColor(c))
        }));
        
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'cidades_marcadas.json';
        a.click();
        console.log('📥 Dados exportados');
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
}

let app;
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM Carregado!');
    feather.replace();
    app = new GeoClientApp();
    app.init();
});