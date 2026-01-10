// GeoClient SP - Main Application Logic CORRIGIDO - VERSÃO FINAL
class GeoClientApp {
    constructor() {
        this.map = null;
        this.currentFilters = { company: '', segment: '', status: 'todos' };
        this.currentClients = [...CLIENTS_DATA];
        this.markers = {};
        this.geoJsonLayer = null;
        this.selectedMunicipality = null;  // ✅ NOVO: Armazenar município selecionado
        this.selectedLayer = null;         // ✅ NOVO: Armazenar layer selecionado
    }



    init() {
        console.log('🗺️ Inicializando GeoClient SP...');
        this.initMap();
        this.setupEventListeners();
        this.renderClientTable();
        this.renderMarkers();
        console.log('✅ GeoClient SP iniciado!');
    }



    initMap() {
        // ✅ CORRIGIDO: Centro e zoom ajustados para mostrar TODO o estado de SP
        const spCenter = [-23.2, -48.5];  // Centro do estado
        this.map = L.map('map').setView(spCenter, 7);  // Zoom 7 para ver o estado completo



        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap',
            maxZoom: 19
        }).addTo(this.map);



        this.loadMunicipalitiesBoundaries();



        const mapControls = document.querySelector('custom-map-controls');
        if (mapControls) mapControls.init(this.map);
    }



    loadMunicipalitiesBoundaries() {
        const occupiedMunicipalities = getOccupiedMunicipalities();


        // ✅ NOVO: Carregar do arquivo GeoJSON real (645 municípios do IBGE)
        fetch('data/municipios-sp.geojson')
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                return response.json();
            })
            .then(municipalitiesData => {
                this.geoJsonLayer = L.geoJSON(municipalitiesData, {
                    style: (feature) => {
                        // ✅ CORRIGIDO: Usar a mesma função para detectar nome em ambos os lugares
                        const name = this.getMunicipalityName(feature);
                        const isOccupied = occupiedMunicipalities.includes(name);
                        
                        return {
                            fillColor: isOccupied ? '#22c55e' : '#d1d5db',
                            weight: 1.5,
                            opacity: 0.8,
                            color: '#6b7280',
                            fillOpacity: isOccupied ? 0.5 : 0.15
                        };
                    },
                    onEachFeature: (feature, layer) => {
                        // ✅ CORRIGIDO: Usar a mesma função de nome em ambos os lugares
                        const name = this.getMunicipalityName(feature);
                        
                        const isOccupied = occupiedMunicipalities.includes(name);
                        const status = isOccupied ? '✅ OCUPADO' : '⭕ DISPONÍVEL';
                        
                        if (name && name !== 'Município Desconhecido') {
                            layer.bindPopup(`<div style="padding:12px"><b>${name}</b><br><small style="font-weight:normal;color:#666">${status}</small></div>`);
                        } else {
                            layer.bindPopup(`<div style="padding:12px"><b>⭕ DISPONÍVEL</b><br><small style="font-weight:normal;color:#999">Município não identificado</small></div>`);
                        }
                        
                        layer.on('mouseover', () => {
                            // Não muda hover se estiver selecionado
                            if (this.selectedMunicipality !== name) {
                                layer.setStyle({ weight: 3, opacity: 1 });
                            }
                        });
                        layer.on('mouseout', () => {
                            // Volta ao estilo normal se não estiver selecionado
                            if (this.selectedMunicipality !== name) {
                                layer.setStyle({ weight: 1.5, opacity: 0.8 });
                            }
                        });

                        // ✅ NOVO: Clique para selecionar/desselecionar município
                        layer.on('click', (e) => {
                            L.DomEvent.stopPropagation(e);
                            this.selectMunicipality(name, layer, feature, occupiedMunicipalities);
                        });
                    }
                }).addTo(this.map);


                console.log('✅ ' + municipalitiesData.features.length + ' municípios carregados com sucesso!');
            })
            .catch(error => {
                console.error('❌ Erro ao carregar municípios:', error);
                console.warn('⚠️ Arquivo municipios-sp.geojson não encontrado em data/');
            });
    }

    // ✅ NOVO: Função para selecionar/desselecionar município
    selectMunicipality(name, layer, feature, occupiedMunicipalities) {
        if (this.selectedMunicipality === name) {
            // Se já está selecionado, desseleciona
            console.log(`🔓 Município deselecionado: ${name}`);
            this.selectedMunicipality = null;
            this.selectedLayer = null;
            
            // Volta ao estilo normal
            const isOccupied = occupiedMunicipalities.includes(name);
            layer.setStyle({
                fillColor: isOccupied ? '#22c55e' : '#d1d5db',
                weight: 1.5,
                opacity: 0.8,
                color: '#6b7280',
                fillOpacity: isOccupied ? 0.5 : 0.15
            });
        } else {
            // Desseleciona o anterior se houver
            if (this.selectedLayer && this.selectedMunicipality) {
                const wasOccupied = occupiedMunicipalities.includes(this.selectedMunicipality);
                this.selectedLayer.setStyle({
                    fillColor: wasOccupied ? '#22c55e' : '#d1d5db',
                    weight: 1.5,
                    opacity: 0.8,
                    color: '#6b7280',
                    fillOpacity: wasOccupied ? 0.5 : 0.15
                });
                console.log(`🔄 Alternando de: ${this.selectedMunicipality} para: ${name}`);
            } else {
                console.log(`🔵 Município selecionado: ${name}`);
            }
            
            // Atualiza seleção
            this.selectedMunicipality = name;
            this.selectedLayer = layer;
            
            // Destaca com cor azul
            layer.setStyle({
                fillColor: '#3b82f6',  // Azul vibrante
                weight: 4,              // Borda mais grossa
                opacity: 1,
                color: '#1e40af',       // Azul escuro na borda
                fillOpacity: 0.7
            });
            
            // Loga no console para confirmar
            console.log(`✅ Selecionado: ${name}`);
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
        let filtered = [...CLIENTS_DATA];
        if (this.currentFilters.company) filtered = filtered.filter(c => c.company === this.currentFilters.company);
        if (this.currentFilters.segment) filtered = filtered.filter(c => c.segment === this.currentFilters.segment);
        if (this.currentFilters.status !== 'todos') filtered = filtered.filter(c => c.status === this.currentFilters.status);



        this.currentClients = filtered;
        this.renderClientTable();
        this.renderMarkers();
    }



    resetMap() {
        // ✅ CORRIGIDO: Centro e zoom ajustados para mostrar TODO o estado de SP
        this.map.setView([-23.2, -48.5], 7);
        this.currentFilters = { company: '', segment: '', status: 'todos' };
        this.currentClients = [...CLIENTS_DATA];
        this.selectedMunicipality = null;  // ✅ NOVO: Reseta seleção também
        this.selectedLayer = null;
        this.renderClientTable();
        this.renderMarkers();
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
        this.map.setView([coords.lat, coords.lng], 12);
    }



    editClient(clientId) { this.openModal(clientId); }



    deleteClient(clientId) {
        if (confirm('Deletar este cliente?')) {
            deleteClient(clientId);
            this.currentClients = this.currentClients.filter(c => c.id !== clientId);
            this.renderClientTable();
            this.renderMarkers();
        }
    }



    exportData() {
        const format = prompt('1 = CSV\n2 = JSON', '1');
        if (format === '1') exportClientsCSV();
        else if (format === '2') exportClientsJSON();
    }

    // ✅ NOVO: Função para detectar corretamente o nome do município
    getMunicipalityName(feature) {
        const properties = feature.properties || {};
        
        // Tentar as chaves mais comuns em ordem de probabilidade
        const name = properties.name 
            || properties.NAME 
            || properties.NOME 
            || properties.NM_MUNI 
            || properties.NM_MUNICIPIO
            || properties.nm_municipio
            || properties.NM_MUN
            || 'Município Desconhecido';
        
        // Log para debug (remover depois de confirmar)
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
