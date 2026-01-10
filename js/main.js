// GeoClient SP - Main Application Logic - VERSÃO FINAL COM MARCAÇÃO MANUAL
class GeoClientApp {
    constructor() {
        this.map = null;
        this.currentFilters = { company: '', segment: '', status: 'todos' };
        this.currentClients = [];
        this.markers = {};
        this.geoJsonLayer = null;
        this.selectedMunicipality = null;
        this.selectedLayer = null;
        this.markedCities = {}; // ✅ Armazena cidades marcadas e suas empresas
        
        // ✅ EMPRESAS CORRETAS
        this.availableCompanies = ['CDO', 'SUPORTE', 'WAUX', 'MONTEBELLO', 'HIRATA'];
        
        // Contador de cliques para detectar duplo clique
        this.clickCount = 0;
        this.clickTimer = null;
    }

    init() {
        console.log('🗺️ Inicializando GeoClient SP...');
        this.initMap();
        this.setupEventListeners();
        this.renderClientTable();
        this.renderMarkers();
        console.log('✅ GeoClient SP iniciado!');
        console.log('🔵 1 CLIQUE = Marca cidade AZUL');
        console.log('🔵 2 CLIQUES = Desmarca cidade');
        console.log('🏢 Empresas: CDO, SUPORTE, WAUX, MONTEBELLO, HIRATA');
    }

    initMap() {
        const spCenter = [-23.2, -48.5];
        this.map = L.map('map').setView(spCenter, 7);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap',
            maxZoom: 19
        }).addTo(this.map);

        this.loadMunicipalitiesBoundaries();

        const mapControls = document.querySelector('custom-map-controls');
        if (mapControls) mapControls.init(this.map);
    }

    loadMunicipalitiesBoundaries() {
        fetch('data/municipios-sp.geojson')
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                return response.json();
            })
            .then(municipalitiesData => {
                this.geoJsonLayer = L.geoJSON(municipalitiesData, {
                    style: (feature) => {
                        const name = this.getMunicipalityName(feature);
                        const isMarked = this.markedCities[name];
                        
                        if (isMarked) {
                            // 🔵 MARCADO - AZUL VIBRANTE
                            return {
                                fillColor: '#3b82f6',
                                weight: 3,
                                opacity: 1,
                                color: '#1e40af',
                                fillOpacity: 0.7
                            };
                        } else {
                            // ⚪ DISPONÍVEL - Cinza
                            return {
                                fillColor: '#d1d5db',
                                weight: 1.5,
                                opacity: 0.8,
                                color: '#6b7280',
                                fillOpacity: 0.15
                            };
                        }
                    },
                    onEachFeature: (feature, layer) => {
                        const name = this.getMunicipalityName(feature);
                        
                        this.updatePopup(layer, name);
                        
                        // Hover
                        layer.on('mouseover', () => {
                            if (!this.markedCities[name]) {
                                layer.setStyle({ weight: 3, opacity: 1 });
                            }
                        });
                        layer.on('mouseout', () => {
                            if (!this.markedCities[name]) {
                                this.geoJsonLayer.resetStyle(layer);
                            }
                        });

                        // Sistema de detecção de clique duplo
                        layer.on('click', (e) => {
                            L.DomEvent.stopPropagation(e);
                            this.handleCityClick(name, layer);
                        });
                    }
                }).addTo(this.map);

                console.log(`✅ ${municipalitiesData.features.length} municípios carregados!`);
                console.log(`🔵 ${Object.keys(this.markedCities).length} cidades marcadas`);
            })
            .catch(error => {
                console.error('❌ Erro ao carregar municípios:', error);
                console.warn('⚠️ Arquivo municipios-sp.geojson não encontrado em data/');
            });
    }

    handleCityClick(name, layer) {
        this.clickCount++;
        
        if (this.clickCount === 1) {
            // Primeiro clique - aguarda segundo clique
            this.clickTimer = setTimeout(() => {
                // Apenas 1 clique - MARCAR cidade
                this.markCity(name, layer);
                this.clickCount = 0;
            }, 300); // 300ms para detectar duplo clique
        } else if (this.clickCount === 2) {
            // Segundo clique - DESMARCAR cidade
            clearTimeout(this.clickTimer);
            this.unmarkCity(name, layer);
            this.clickCount = 0;
        }
    }

    markCity(name, layer) {
        if (!this.markedCities[name]) {
            this.markedCities[name] = { companies: [] };
            
            layer.setStyle({
                fillColor: '#3b82f6',
                weight: 3,
                opacity: 1,
                color: '#1e40af',
                fillOpacity: 0.7
            });
            
            this.updatePopup(layer, name);
            console.log(`🔵 Marcado: ${name}`);
            console.log(`📊 Total marcadas: ${Object.keys(this.markedCities).length}`);
            
            // Abre popup automaticamente
            layer.openPopup();
        }
    }

    unmarkCity(name, layer) {
        if (this.markedCities[name]) {
            delete this.markedCities[name];
            
            layer.setStyle({
                fillColor: '#d1d5db',
                weight: 1.5,
                opacity: 0.8,
                color: '#6b7280',
                fillOpacity: 0.15
            });
            
            this.updatePopup(layer, name);
            console.log(`🔓 Desmarcado: ${name}`);
            console.log(`📊 Total marcadas: ${Object.keys(this.markedCities).length}`);
        }
    }

    updatePopup(layer, name) {
        const isMarked = this.markedCities[name];
        let popupContent = `<div style="padding:12px; min-width:200px">`;
        
        if (isMarked) {
            popupContent += `<b style="color:#3b82f6">${name}</b><br>`;
            popupContent += `<small style="color:#666">🔵 MARCADO</small><br><br>`;
            
            // Mostra empresas adicionadas
            if (isMarked.companies.length > 0) {
                popupContent += `<b>Empresas:</b><br>`;
                isMarked.companies.forEach(company => {
                    popupContent += `<span style="background:#22c55e;color:white;padding:2px 8px;border-radius:4px;display:inline-block;margin:2px">${company}</span><br>`;
                });
                popupContent += `<br>`;
            }
            
            // Botão para adicionar empresa
            popupContent += `<button onclick="app.openCompanyModal('${name}')" style="background:#3b82f6;color:white;border:none;padding:8px 12px;border-radius:6px;cursor:pointer;width:100%">
                ➕ Adicionar Empresa
            </button><br><br>`;
            
            popupContent += `<small style="color:#999">2 cliques para desmarcar</small>`;
        } else {
            popupContent += `<b>${name}</b><br>`;
            popupContent += `<small style="color:#666">⭕ DISPONÍVEL</small><br><br>`;
            popupContent += `<small style="color:#0066cc">1 clique para marcar</small>`;
        }
        
        popupContent += `</div>`;
        layer.bindPopup(popupContent);
    }

    openCompanyModal(cityName) {
        const city = this.markedCities[cityName];
        if (!city) return;
        
        let companies = this.availableCompanies
            .filter(c => !city.companies.includes(c))
            .map((c, i) => `${i + 1}. ${c}`)
            .join('\n');
        
        if (companies === '') {
            alert('Todas as empresas já foram adicionadas a esta cidade!');
            return;
        }
        
        const choice = prompt(
            `Adicionar empresa em ${cityName}:\n\n${companies}\n\nDigite o número:`,
            '1'
        );
        
        if (choice && !isNaN(choice)) {
            const index = parseInt(choice) - 1;
            const availableList = this.availableCompanies.filter(c => !city.companies.includes(c));
            
            if (index >= 0 && index < availableList.length) {
                const selectedCompany = availableList[index];
                city.companies.push(selectedCompany);
                console.log(`✅ Empresa ${selectedCompany} adicionada em ${cityName}`);
                
                // Atualiza o popup
                this.geoJsonLayer.eachLayer(layer => {
                    const name = this.getMunicipalityName(layer.feature);
                    if (name === cityName) {
                        this.updatePopup(layer, name);
                        layer.openPopup();
                    }
                });
            }
        }
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
        this.map.setView([-23.2, -48.5], 7);
        this.currentFilters = { company: '', segment: '', status: 'todos' };
        this.currentClients = [];
        this.selectedMunicipality = null;
        this.selectedLayer = null;
        this.loadMunicipalitiesBoundaries();
        this.renderClientTable();
        this.renderMarkers();
        console.log('♻️ Mapa resetado - marcações mantidas!');
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
            empresas: info.companies.join(', ')
        }));
        
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'cidades_marcadas.json';
        a.click();
        console.log('📥 Dados exportados!');
    }

    getMunicipalityName(feature) {
        const properties = feature.properties || {};
        const name = properties.name 
            || properties.NAME 
            || properties.NOME 
            || properties.NM_MUNI 
            || properties.NM_MUNICIPIO
            || properties.nm_municipio
            || properties.NM_MUN
            || 'Município Desconhecido';
        
        if (name === 'Município Desconhecido') {
            console.log('❌ Nome não encontrado. Propriedades disponíveis:', Object.keys(properties));
        }
        
        return name;
    }
}

let app;
document.addEventListener('DOMContentLoaded', () => {
    feather.replace();
    app = new GeoClientApp();
    app.init();
});
