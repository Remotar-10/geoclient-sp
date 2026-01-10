// GeoClient SP - Main Application Logic CORRIGIDO - VERSÃO FINAL
// ✅ NOVO: MAPA LIMPO SEM CLIENTES INICIAIS
class GeoClientApp {
    constructor() {
        this.map = null;
        this.currentFilters = { company: '', segment: '', status: 'todos' };
        this.currentClients = []; // ✅ COMEÇA VAZIO
        this.markers = {};
        this.geoJsonLayer = null;
        this.selectedMunicipality = null;
        this.selectedLayer = null;
        this.manualCDOVale = []; // ✅ NOVO: Armazena marcações CDO manuais
        // ✅ NOVO: Lista de cidades do Vale do Paraíba para CDO
        this.valedoParaibaCities = [
            'São José dos Campos', 'Jacareí', 'Guaratinguetá', 'Caçapava', 'Tremembé',
            'Santa Branca', 'Caraguatatuba', 'Ilhabela', 'São Sebastião', 'Ubatuba',
            'Aparecida', 'Cachoeira Paulista', 'Piquete', 'Lagoinha', 'Cruzeiro',
            'Queluz', 'Lorena', 'Potim', 'Roseira', 'Guararema', 'Santa Isabel',
            'Taubaté', 'Pindamonhangaba', 'Campos do Jordão'
        ];
    }

    init() {
        console.log('🗺️ Inicializando GeoClient SP...');
        this.initMap();
        this.setupEventListeners();
        this.renderClientTable();
        this.renderMarkers();
        console.log('✅ GeoClient SP iniciado com mapa LIMPO!');
        console.log('🔵 Clique DUPLO em cidades do Vale para marcar CDO AZUL');
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
        const occupiedMunicipalities = []; // ✅ VAZIO - nenhum cliente
        const cdoValeCities = this.manualCDOVale; // ✅ APENAS marcações manuais

        fetch('data/municipios-sp.geojson')
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                return response.json();
            })
            .then(municipalitiesData => {
                this.geoJsonLayer = L.geoJSON(municipalitiesData, {
                    style: (feature) => {
                        const name = this.getMunicipalityName(feature);
                        const isOccupied = occupiedMunicipalities.includes(name);
                        const isCDOVale = cdoValeCities.includes(name); // ✅ Verifica marcação manual
                        
                        if (isCDOVale) {
                            // 🔵 CDO VALE DO PARAÍBA - AZUL VIBRANTE (MARCAÇÃO MANUAL)
                            return {
                                fillColor: '#3b82f6',
                                weight: 3, // Borda mais grossa
                                opacity: 1,
                                color: '#1e40af',
                                fillOpacity: 0.7
                            };
                        } else if (isOccupied) {
                            // 🟢 OCUPADO - Verde normal
                            return {
                                fillColor: '#22c55e',
                                weight: 1.5,
                                opacity: 0.8,
                                color: '#6b7280',
                                fillOpacity: 0.5
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
                        const isOccupied = occupiedMunicipalities.includes(name);
                        const isCDOVale = cdoValeCities.includes(name);
                        
                        let status = '';
                        if (isCDOVale) {
                            status = '🔵 CDO VALE DO PARAÍBA (Marcado)';
                        } else if (isOccupied) {
                            status = '✅ OCUPADO';
                        } else {
                            status = '⭕ DISPONÍVEL';
                        }
                        
                        if (name && name !== 'Município Desconhecido') {
                            layer.bindPopup(`
                                <div style="padding:12px">
                                    <b>${name}</b><br>
                                    <small style="font-weight:normal;color:#666">${status}</small><br>
                                    <small style="font-weight:bold;color:#0066cc">Clique DUPLO para marcar CDO</small>
                                </div>
                            `);
                        } else {
                            layer.bindPopup(`
                                <div style="padding:12px">
                                    <b>⭕ DISPONÍVEL</b><br>
                                    <small style="font-weight:normal;color:#999">Município não identificado</small>
                                </div>
                            `);
                        }
                        
                        // Hover inteligente
                        layer.on('mouseover', () => {
                            if (!isCDOVale && this.selectedMunicipality !== name) {
                                layer.setStyle({ weight: 3, opacity: 1 });
                            }
                        });
                        layer.on('mouseout', () => {
                            if (!isCDOVale && this.selectedMunicipality !== name) {
                                this.geoJsonLayer.resetStyle(layer);
                            }
                        });

                        // Clique SIMPLES para seleção manual
                        layer.on('click', (e) => {
                            L.DomEvent.stopPropagation(e);
                            if (this.valedoParaibaCities.includes(name)) {
                                this.selectMunicipality(name, layer, feature, occupiedMunicipalities);
                            }
                        });

                        // Clique DUPLO para marcar CDO
                        layer.on('dblclick', (e) => {
                            L.DomEvent.stopPropagation(e);
                            if (this.valedoParaibaCities.includes(name)) {
                                this.toggleCDOValeMark(name, layer);
                            }
                        });
                    }
                }).addTo(this.map);

                console.log(`✅ ${municipalitiesData.features.length} municípios carregados!`);
                console.log(`🔵 ${this.manualCDOVale.length} cidades CDO Vale do Paraíba marcadas manualmente`);
            })
            .catch(error => {
                console.error('❌ Erro ao carregar municípios:', error);
                console.warn('⚠️ Arquivo municipios-sp.geojson não encontrado em data/');
            });
    }

    // ✅ NOVO: Toggle de marcação manual CDO
    toggleCDOValeMark(name, layer) {
        if (this.manualCDOVale.includes(name)) {
            // Remove marcação
            this.manualCDOVale = this.manualCDOVale.filter(city => city !== name);
            console.log(`🔓 Removido CDO: ${name}`);
            layer.setStyle({
                fillColor: '#d1d5db',
                fillOpacity: 0.15
            });
        } else {
            // Adiciona marcação
            this.manualCDOVale.push(name);
            console.log(`🔵 Marcado CDO: ${name}`);
            layer.setStyle({
                fillColor: '#3b82f6',
                fillOpacity: 0.7
            });
        }
        console.log(`📊 Total CDO marcadas: ${this.manualCDOVale.length}/24`);
    }

    selectMunicipality(name, layer, feature, occupiedMunicipalities) {
        if (this.selectedMunicipality === name) {
            console.log(`🔓 Município deselecionado: ${name}`);
            this.selectedMunicipality = null;
            this.selectedLayer = null;
            this.geoJsonLayer.resetStyle(layer);
        } else {
            if (this.selectedLayer && this.selectedMunicipality) {
                this.geoJsonLayer.resetStyle(this.selectedLayer);
            }
            
            this.selectedMunicipality = name;
            this.selectedLayer = layer;
            
            layer.setStyle({
                fillColor: '#ef4444',  // Vermelho para seleção manual
                weight: 5,
                opacity: 1,
                color: '#dc2626',
                fillOpacity: 0.8
            });
            
            console.log(`🔴 Seleção manual: ${name}`);
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

        // ✅ MAPA COMEÇA VAZIO - sem marcadores
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

        // ✅ Tabela vazia inicialmente
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
        // ✅ COMEÇA VAZIO
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
        this.currentClients = []; // ✅ Volta vazio
        this.selectedMunicipality = null;
        this.selectedLayer = null;
        this.loadMunicipalitiesBoundaries();
        this.renderClientTable();
        this.renderMarkers();
        console.log('♻️ Mapa resetado - todas as marcações CDO mantidas!');
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
        const format = prompt('1 = CSV\n2 = JSON', '1');
        if (format === '1') exportClientsCSV();
        else if (format === '2') exportClientsJSON();
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
