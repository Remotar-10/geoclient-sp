// GeoClient SP - Main Application Logic
class GeoClientApp {
    constructor() {
        this.map = null;
        this.currentFilters = {
            company: '',
            segment: '',
            status: 'todos'
        };
        this.currentClients = [...CLIENTS_DATA];
        this.selectedMunicipality = null;
        this.markers = {};
        this.geoJsonLayer = null;
    }

    init() {
        console.log('🗺️ Inicializando GeoClient SP...');
        this.initMap();
        this.setupEventListeners();
        this.renderClientTable();
        this.renderMarkers();
        console.log('✅ GeoClient SP iniciado com sucesso!');
    }

    initMap() {
        // Centro do estado de São Paulo
        const spCenter = [-23.55, -46.63];
        
        this.map = L.map('map').setView(spCenter, 8);

        // Tile layer (OpenStreetMap)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(this.map);

        // Carregar GeoJSON dos municípios
        this.loadMunicipalitiesBoundaries();

        // Inicializar controles do mapa
        const mapControls = document.querySelector('custom-map-controls');
        if (mapControls) {
            mapControls.init(this.map);
        }
    }

    loadMunicipalitiesBoundaries() {
        fetch('data/sp-municipalities.json')
            .then(response => response.json())
            .then(data => {
                const occupiedMunicipalities = getOccupiedMunicipalities();
                
                this.geoJsonLayer = L.geoJSON(data, {
                    style: (feature) => {
                        const isOccupied = occupiedMunicipalities.includes(feature.properties.name);
                        return {
                            fillColor: isOccupied ? '#10b981' : '#e5e7eb',
                            weight: 1.5,
                            opacity: 0.8,
                            color: '#9ca3af',
                            dashArray: '3',
                            fillOpacity: isOccupied ? 0.3 : 0.1
                        };
                    },
                    onEachFeature: (feature, layer) => {
                        const isOccupied = occupiedMunicipalities.includes(feature.properties.name);
                        const status = isOccupied ? '✅ Ocupado' : '⭕ Disponível';
                        
                        layer.bindPopup(`
                            <div class="p-2">
                                <h4 class="font-bold text-sm">${feature.properties.name}</h4>
                                <p class="text-xs text-gray-600">${status}</p>
                            </div>
                        `);

                        layer.on('click', () => {
                            console.log(`Clicou em: ${feature.properties.name}`);
                        });
                    }
                }).addTo(this.map);
            })
            .catch(error => console.error('Erro ao carregar GeoJSON:', error));
    }

    setupEventListeners() {
        // Filtros
        window.addEventListener('filtersChanged', (e) => {
            this.currentFilters = e.detail;
            this.applyFilters();
        });

        // Botão Reset Map
        const resetBtn = document.getElementById('reset-map');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetMap());
        }

        // Botão Export
        const exportBtn = document.getElementById('export-map');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportData());
        }

        // Modal
        const addClientBtn = document.getElementById('add-client');
        const closeModalBtn = document.getElementById('close-modal');
        const clientForm = document.getElementById('client-form');
        const modal = document.getElementById('client-modal');

        if (addClientBtn) {
            addClientBtn.addEventListener('click', () => this.openModal());
        }

        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => this.closeModal());
        }

        if (clientForm) {
            clientForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }

        // Fechar modal ao clicar fora
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        }
    }

    renderMarkers() {
        // Limpar marcadores anteriores
        Object.values(this.markers).forEach(marker => {
            this.map.removeLayer(marker);
        });
        this.markers = {};

        this.currentClients.forEach(client => {
            const color = client.status === 'ativo' ? '#10b981' : '#fbbf24';
            
            const marker = L.circleMarker([client.lat, client.lng], {
                radius: 8,
                fillColor: color,
                color: 'white',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.8,
                className: 'company-marker'
            }).addTo(this.map);

            // Popup ao clicar no marcador
            marker.bindPopup(`
                <div class="p-3">
                    <h4 class="font-bold text-sm mb-2">${client.name}</h4>
                    <div class="text-xs space-y-1">
                        <p><strong>Segmento:</strong> ${client.segment}</p>
                        <p><strong>Empresa:</strong> ${client.company}</p>
                        <p><strong>Funcionário:</strong> ${client.Funcionário}</p>
                        <p><strong>Município:</strong> ${client.municipality}</p>
                        <p><strong>Status:</strong> <span class="badge ${client.status === 'ativo' ? 'badge-success' : 'badge-warning'}">${client.status}</span></p>
                        <p><strong>Contato:</strong> ${client.contact}</p>
                        <p><strong>Telefone:</strong> ${client.phone}</p>
                    </div>
                    <button onclick="app.editClient(${client.id})" class="mt-2 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 w-full">
                        Editar
                    </button>
                </div>
            `);

            marker.on('click', () => {
                this.map.setView([client.lat, client.lng], 10);
            });

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
                    <button onclick="app.editClient(${client.id})" class="text-blue-600 hover:text-blue-800">✏️</button>
                    <button onclick="app.deleteClient(${client.id})" class="text-red-600 hover:text-red-800">🗑️</button>
                </td>
            </tr>
        `).join('');
    }

    applyFilters() {
        let filtered = [...CLIENTS_DATA];

        if (this.currentFilters.company) {
            filtered = filtered.filter(c => c.company === this.currentFilters.company);
        }

        if (this.currentFilters.segment) {
            filtered = filtered.filter(c => c.segment === this.currentFilters.segment);
        }

        if (this.currentFilters.status !== 'todos') {
            filtered = filtered.filter(c => c.status === this.currentFilters.status);
        }

        this.currentClients = filtered;
        this.renderClientTable();
        this.renderMarkers();

        console.log(`📊 Filtros aplicados: ${this.currentClients.length} clientes encontrados`);
    }

    resetMap() {
        const spCenter = [-23.55, -46.63];
        this.map.setView(spCenter, 8);
        this.currentFilters = { company: '', segment: '', status: 'todos' };
        this.currentClients = [...CLIENTS_DATA];
        this.renderClientTable();
        this.renderMarkers();
        console.log('🔄 Mapa resetado');
    }

    openModal(clientId = null) {
        const modal = document.getElementById('client-modal');
        const form = document.getElementById('client-form');
        const title = document.getElementById('modal-title');
        const clientIdInput = document.getElementById('client-id');

        if (!modal || !form) return;

        if (clientId) {
            const client = CLIENTS_DATA.find(c => c.id === clientId);
            if (client) {
                title.textContent = 'Editar Cliente';
                document.getElementById('client-name').value = client.name;
                document.getElementById('client-municipality').value = client.municipality;
                clientIdInput.value = clientId;
            }
        } else {
            title.textContent = 'Novo Cliente';
            form.reset();
            clientIdInput.value = '';
        }

        modal.classList.add('show');
        modal.style.display = 'flex';
    }

    closeModal() {
        const modal = document.getElementById('client-modal');
        if (modal) {
            modal.classList.remove('show');
            modal.style.display = 'none';
        }
    }

    handleFormSubmit(e) {
        e.preventDefault();

        const clientId = document.getElementById('client-id').value;
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

        if (clientId) {
            // Editar cliente
            updateClient(parseInt(clientId), {
                name,
                municipality,
                lat: coords.lat,
                lng: coords.lng
            });
            console.log('✏️ Cliente atualizado');
        } else {
            // Novo cliente
            addClient({
                name,
                municipality,
                segment: 'Lubrificantes',
                company: 'CDO',
                Funcionário: 'Novo',
                status: 'ativo',
                lat: coords.lat,
                lng: coords.lng,
                contact: 'contato@newclient.com',
                phone: '(XX) 0000-0000'
            });
            console.log('➕ Novo cliente adicionado');
        }

        this.closeModal();
        this.applyFilters();
        this.map.setView([coords.lat, coords.lng], 12);
    }

    editClient(clientId) {
        this.openModal(clientId);
    }

    deleteClient(clientId) {
        if (confirm('Tem certeza que deseja deletar este cliente?')) {
            deleteClient(clientId);
            this.currentClients = this.currentClients.filter(c => c.id !== clientId);
            this.renderClientTable();
            this.renderMarkers();
            console.log('🗑️ Cliente deletado');
        }
    }

    exportData() {
        const format = prompt('Escolha o formato:\n1 = CSV\n2 = JSON', '1');

        if (format === '1') {
            exportClientsCSV();
        } else if (format === '2') {
            exportClientsJSON();
        }
    }
}

// Instanciar app global
let app;

document.addEventListener('DOMContentLoaded', () => {
    feather.replace();
    app = new GeoClientApp();
    app.init();
});
