// GeoClient SP - VERSÃO ESTÁVEL
// Sistema de cliques: 1=zoom + dropdown | Botão direito=remover

class GeoClientApp {
    constructor() {
        this.map = null;
        this.currentFilters = { company: '', segment: '', status: 'todos' };
        this.currentClients = [];
        this.markers = {};
        this.geoJsonLayer = null;
        this.markedCities = {};
        this.cityLayers = {};
        this.contextMenu = null;
        this.tooltip = null;
        this.companyDropdown = null;
        
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
            this.createContextMenu();
            this.createTooltip();
            this.createCompanyDropdown();
            this.renderClientTable();
            this.renderMarkers();
            console.log('✅ GeoClient SP iniciado!');
            console.log('🔍 1 CLIQUE = Zoom 3x + marca cidade');
            console.log('🔍 2 CLIQUES = Mostra dropdown de empresas');
            console.log('🖱️ BOTÃO DIREITO = Remover marcação');
            console.log('👆 HOVER = Mostra empresas da cidade');
        }, 100);
    }

    createCompanyDropdown() {
        // Remove dropdown existente se houver
        const existingDropdown = document.getElementById('company-dropdown');
        if (existingDropdown) existingDropdown.remove();
        
        // Cria o dropdown
        this.companyDropdown = document.createElement('div');
        this.companyDropdown.id = 'company-dropdown';
        this.companyDropdown.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            display: none;
            background: white;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            padding: 20px;
            z-index: 10001;
            min-width: 320px;
            max-width: 400px;
        `;
        document.body.appendChild(this.companyDropdown);
        
        // Fecha dropdown ao clicar fora
        document.addEventListener('click', (e) => {
            if (!this.companyDropdown.contains(e.target) && e.target.closest('.leaflet-interactive') === null) {
                this.hideCompanyDropdown();
            }
        });
        
        console.log('✅ Dropdown de empresas criado');
    }

    showCompanyDropdown(cityName) {
        const cityData = this.markedCities[cityName];
        if (!cityData) return;
        
        const availableCompanies = this.availableCompanies.filter(c => !cityData.companies.includes(c));
        
        let dropdownContent = `
            <div style="border-bottom: 2px solid #e5e7eb; padding-bottom: 12px; margin-bottom: 16px;">
                <h3 style="margin: 0; font-size: 20px; color: #1f2937;">${cityName}</h3>
                <small style="color: #6b7280; display: block; margin-top: 4px;">Selecione a empresa</small>
            </div>
        `;
        
        if (availableCompanies.length === 0) {
            dropdownContent += `
                <div style="text-align: center; padding: 20px; color: #6b7280;">
                    ✅ Todas as empresas já foram adicionadas!
                </div>
            `;
        } else {
            dropdownContent += `<div style="display: flex; flex-direction: column; gap: 8px;">`;
            
            availableCompanies.forEach(company => {
                const color = this.getCompanyColor(company);
                dropdownContent += `
                    <button onclick="app.addCompanyToCity('${cityName}', '${company}'); app.hideCompanyDropdown();"
                            style="
                                background: white;
                                border: 2px solid ${color};
                                padding: 14px 18px;
                                border-radius: 8px;
                                cursor: pointer;
                                font-size: 16px;
                                font-weight: 600;
                                color: ${color};
                                transition: all 0.2s;
                                display: flex;
                                align-items: center;
                                gap: 10px;
                            "
                            onmouseover="this.style.background='${color}'; this.style.color='white';"
                            onmouseout="this.style.background='white'; this.style.color='${color}';">
                        <span style="display:inline-block;width:16px;height:16px;background:${color};border-radius:4px;"></span>
                        ${company}
                    </button>
                `;
            });
            
            dropdownContent += `</div>`;
        }
        
        // Botão cancelar
        dropdownContent += `
            <button onclick="app.hideCompanyDropdown();"
                    style="
                        background: #f3f4f6;
                        border: none;
                        padding: 12px;
                        border-radius: 8px;
                        cursor: pointer;
                        width: 100%;
                        margin-top: 12px;
                        font-size: 14px;
                        color: #6b7280;
                        font-weight: 600;
                    "
                    onmouseover="this.style.background='#e5e7eb';"
                    onmouseout="this.style.background='#f3f4f6';">
                Cancelar
            </button>
        `;
        
        this.companyDropdown.innerHTML = dropdownContent;
        this.companyDropdown.style.display = 'block';
        
        console.log(`📝 Dropdown mostrado: ${cityName}`);
    }

    hideCompanyDropdown() {
        this.companyDropdown.style.display = 'none';
        console.log(`❌ Dropdown fechado`);
    }

    createTooltip() {
        // Remove tooltip existente se houver
        const existingTooltip = document.getElementById('city-tooltip');
        if (existingTooltip) existingTooltip.remove();
        
        // Cria o tooltip
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
        
        console.log('✅ Tooltip criado');
    }

    showTooltip(cityName) {
        const cityData = this.markedCities[cityName];
        
        let tooltipContent = '';
        
        if (!cityData) {
            // Cidade não marcada
            tooltipContent = `
                <div style="text-align: center;">
                    <b style="font-size: 16px; color: #6b7280;">${cityName}</b><br>
                    <small style="color: #9ca3af; margin-top: 4px; display: block;">⚪ Disponível para marcação</small>
                </div>
            `;
        } else if (cityData.companies.length === 0) {
            // Cidade marcada SEM empresa
            tooltipContent = `
                <div style="border-bottom: 2px solid #9ca3af; padding-bottom: 12px; margin-bottom: 12px;">
                    <b style="font-size: 18px; color: #6b7280;">${cityName}</b><br>
                    <small style="color: #f59e0b; margin-top: 4px; display: block;">⏳ Aguardando empresa</small>
                </div>
                <div style="text-align: center; padding: 10px; background: #fef3c7; border-radius: 8px; color: #92400e; font-size: 13px;">
                    ⚠️ Nenhuma empresa atribuída
                </div>
            `;
        } else {
            // Cidade COM empresa
            const color = this.getCompanyColor(cityData.companies[0]);
            tooltipContent = `
                <div style="border-bottom: 2px solid ${color}; padding-bottom: 12px; margin-bottom: 12px;">
                    <b style="font-size: 18px; color: ${color};">${cityName}</b><br>
                    <small style="color: #6b7280; margin-top: 4px; display: block;">🎨 ${cityData.companies.length} empresa(s) atuando</small>
                </div>
            `;
            
            // Lista de Empresas
            tooltipContent += `<div style="margin-bottom: 8px;">`;
            tooltipContent += `<b style="font-size: 14px; color: #374151; display: block; margin-bottom: 8px;">📍 Empresas:</b>`;
            
            cityData.companies.forEach((company, index) => {
                const companyColor = this.getCompanyColor(company);
                tooltipContent += `
                    <div style="
                        background: ${companyColor};
                        color: white;
                        padding: 8px 12px;
                        border-radius: 8px;
                        margin: 6px 0;
                        font-size: 14px;
                        font-weight: 600;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                    ">
                        <span>${company}</span>
                        <span style="background: rgba(255,255,255,0.3); padding: 2px 8px; border-radius: 4px; font-size: 12px;">#${index + 1}</span>
                    </div>
                `;
            });
            
            tooltipContent += `</div>`;
            
            // Status adicional
            tooltipContent += `
                <div style="margin-top: 12px; padding: 8px; background: #f0fdf4; border-radius: 6px; text-align: center;">
                    <small style="color: #15803d; font-weight: 600;">✅ Cidade coberta</small>
                </div>
            `;
        }
        
        this.tooltip.innerHTML = tooltipContent;
        this.tooltip.style.display = 'block';
    }

    hideTooltip() {
        this.tooltip.style.display = 'none';
    }

    createContextMenu() {
        // Remove menu existente se houver
        const existingMenu = document.getElementById('city-context-menu');
        if (existingMenu) existingMenu.remove();
        
        // Cria o menu de contexto
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
        
        // Fecha menu ao clicar fora
        document.addEventListener('click', () => {
            this.contextMenu.style.display = 'none';
        });
        
        console.log('✅ Menu de contexto criado');
    }

    showContextMenu(event, cityName) {
        event.preventDefault();
        event.stopPropagation();
        
        const cityData = this.markedCities[cityName];
        if (!cityData) return; // Só mostra menu em cidades marcadas
        
        // Menu simplificado - apenas remover
        let menuContent = `
            <div style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-weight: 600; font-size: 13px; margin-bottom: 4px;">
                ${cityName}
            </div>
            <div onclick="if(confirm('Remover marcação de ${cityName}?')) { app.removeCity('${cityName}'); app.contextMenu.style.display='none'; }"
                 style="padding: 12px; cursor: pointer; border-radius: 6px; color: #ef4444; font-weight: 600; transition: all 0.2s; font-size: 14px;"
                 onmouseover="this.style.background='#fef2f2';"
                 onmouseout="this.style.background='transparent';">
                🗑️ Remover Marcação
            </div>
        `;
        
        this.contextMenu.innerHTML = menuContent;
        this.contextMenu.style.display = 'block';
        this.contextMenu.style.left = event.pageX + 'px';
        this.contextMenu.style.top = event.pageY + 'px';
        
        console.log(`🖱️ Menu contexto aberto: ${cityName}`);
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
                        
                        // 👆 Mouseover - Mostra tooltip
                        layer.on('mouseover', () => {
                            const cityData = this.markedCities[name];
                            if (!cityData) {
                                layer.setStyle({ weight: 3, fillOpacity: 0.3 });
                            } else {
                                layer.setStyle({ weight: 4, fillOpacity: 0.85 });
                            }
                            this.showTooltip(name);
                        });
                        
                        // 👆 Mouseout - Esconde tooltip
                        layer.on('mouseout', () => {
                            this.geoJsonLayer.resetStyle(layer);
                            this.hideTooltip();
                        });

                        layer.off('dblclick');
                        layer.on('dblclick', (e) => {
                            L.DomEvent.stop(e);
                            return false;
                        });

                        // 🖱️ Botão direito
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

    handleCityClick(name, layer, event) {
        this.clickCount++;
        
        clearTimeout(this.clickTimer);
        
        this.clickTimer = setTimeout(() => {
            const clicks = this.clickCount;
            this.clickCount = 0;
            
            if (clicks === 1) {
                // 1º CLIQUE: Zoom 3x + marca cidade
                this.zoomAndMarkCity(name, layer, event);
            } else if (clicks >= 2) {
                // 2º CLIQUE: Mostra dropdown de empresas
                this.showCompanyDropdown(name);
            }
        }, this.clickTimeout);
    }

    zoomAndMarkCity(name, layer, event) {
        // Pega as coordenadas do clique
        const latlng = event.latlng;
        
        // Zoom 3x (multiplica o zoom atual por 1.5)
        const currentZoom = this.map.getZoom();
        const newZoom = Math.min(currentZoom + 3, 12); // Máximo zoom 12
        
        // Anima zoom para a cidade
        this.map.flyTo(latlng, newZoom, {
            duration: 0.8,
            easeLinearity: 0.25
        });
        
        console.log(`🔍 Zoom 3x: ${name} (${currentZoom} → ${newZoom})`);
        
        // Marca cidade se ainda não estiver marcada
        if (!this.markedCities[name]) {
            this.markedCities[name] = { companies: [] };
            
            layer.setStyle({
                fillColor: '#9ca3af',
                weight: 2,
                opacity: 1,
                color: '#4b5563',
                fillOpacity: 0.6
            });
            
            console.log(`🟤 Marcado: ${name} (aguardando empresa)`);
            
            // Mostra dropdown após zoom
            setTimeout(() => {
                this.showCompanyDropdown(name);
            }, 900);
        }
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
            
            console.log(`🗑️ Removido: ${name}`);
            console.log(`📊 Total marcadas: ${Object.keys(this.markedCities).length}`);
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
        const color = this.getCompanyColor(company);
        console.log(`✅ ${company} adicionada em ${cityName} - Cor: ${color}`);
        
        const oldLayer = this.geoJsonLayer;
        if (oldLayer) {
            this.map.removeLayer(oldLayer);
        }
        
        this.loadMunicipalitiesBoundaries();
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