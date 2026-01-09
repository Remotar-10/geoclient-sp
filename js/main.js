// GeoClient SP - Main Application Logic CORRIGIDO
class GeoClientApp {
    constructor() {
        this.map = null;
        this.currentFilters = { company: '', segment: '', status: 'todos' };
        this.currentClients = [...CLIENTS_DATA];
        this.markers = {};
        this.geoJsonLayer = null;
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
        const spCenter = [-23.55, -46.63];
        this.map = L.map('map').setView(spCenter, 8);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap',
            maxZoom: 19
        }).addTo(this.map);

        this.loadMunicipalitiesBoundaries();

        const mapControls = document.querySelector('custom-map-controls');
        if (mapControls) mapControls.init(this.map);
    }

    loadMunicipalitiesBoundaries() {
        const municipalitiesData = this.getMunicipalitiesData();
        const occupiedMunicipalities = getOccupiedMunicipalities();

        this.geoJsonLayer = L.geoJSON(municipalitiesData, {
            style: (feature) => {
                const name = feature.properties?.name || '';
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
                const name = feature.properties?.name || 'Município';
                const isOccupied = occupiedMunicipalities.includes(name);
                const status = isOccupied ? '✅ OCUPADO' : '⭕ DISPONÍVEL';
                
                layer.bindPopup(`<div style="padding:8px"><b>${name}</b><br><small>${status}</small></div>`);
                
                layer.on('mouseover', () => {
                    layer.setStyle({ weight: 3, opacity: 1 });
                });
                layer.on('mouseout', () => {
                    layer.setStyle({ weight: 1.5, opacity: 0.8 });
                });
            }
        }).addTo(this.map);

        console.log('✅ ' + municipalitiesData.features.length + ' municípios carregados');
    }

    getMunicipalitiesData() {
        return {
            "type": "FeatureCollection",
            "features": [
                {"type":"Feature","properties":{"name":"São Paulo"},"geometry":{"type":"Polygon","coordinates":[[[-46.73,-23.55],[-46.71,-23.55],[-46.71,-23.53],[-46.73,-23.53],[-46.73,-23.55]]]}},
                {"type":"Feature","properties":{"name":"Guarulhos"},"geometry":{"type":"Polygon","coordinates":[[[-46.48,-23.46],[-46.46,-23.46],[-46.46,-23.44],[-46.48,-23.44],[-46.48,-23.46]]]}},
                {"type":"Feature","properties":{"name":"Campinas"},"geometry":{"type":"Polygon","coordinates":[[[-47.06,-22.89],[-47.04,-22.89],[-47.04,-22.87],[-47.06,-22.87],[-47.06,-22.89]]]}},
                {"type":"Feature","properties":{"name":"Santo André"},"geometry":{"type":"Polygon","coordinates":[[[-46.53,-23.66],[-46.51,-23.66],[-46.51,-23.64],[-46.53,-23.64],[-46.53,-23.66]]]}},
                {"type":"Feature","properties":{"name":"São Bernardo do Campo"},"geometry":{"type":"Polygon","coordinates":[[[-46.56,-23.70],[-46.54,-23.70],[-46.54,-23.68],[-46.56,-23.68],[-46.56,-23.70]]]}},
                {"type":"Feature","properties":{"name":"São Caetano do Sul"},"geometry":{"type":"Polygon","coordinates":[[[-46.55,-23.61],[-46.53,-23.61],[-46.53,-23.59],[-46.55,-23.59],[-46.55,-23.61]]]}},
                {"type":"Feature","properties":{"name":"Diadema"},"geometry":{"type":"Polygon","coordinates":[[[-46.61,-23.70],[-46.59,-23.70],[-46.59,-23.68],[-46.61,-23.68],[-46.61,-23.70]]]}},
                {"type":"Feature","properties":{"name":"Osasco"},"geometry":{"type":"Polygon","coordinates":[[[-46.78,-23.53],[-46.76,-23.53],[-46.76,-23.51],[-46.78,-23.51],[-46.78,-23.53]]]}},
                {"type":"Feature","properties":{"name":"Jundiaí"},"geometry":{"type":"Polygon","coordinates":[[[-46.88,-23.18],[-46.86,-23.18],[-46.86,-23.16],[-46.88,-23.16],[-46.88,-23.18]]]}},
                {"type":"Feature","properties":{"name":"Sorocaba"},"geometry":{"type":"Polygon","coordinates":[[[-47.50,-23.50],[-47.48,-23.50],[-47.48,-23.48],[-47.50,-23.48],[-47.50,-23.50]]]}},
                {"type":"Feature","properties":{"name":"Piracicaba"},"geometry":{"type":"Polygon","coordinates":[[[-47.65,-22.72],[-47.63,-22.72],[-47.63,-22.70],[-47.65,-22.70],[-47.65,-22.72]]]}},
                {"type":"Feature","properties":{"name":"Limeira"},"geometry":{"type":"Polygon","coordinates":[[[-47.42,-22.56],[-47.40,-22.56],[-47.40,-22.54],[-47.42,-22.54],[-47.42,-22.56]]]}},
                {"type":"Feature","properties":{"name":"Ribeirão Prêto"},"geometry":{"type":"Polygon","coordinates":[[[-48.17,-21.18],[-48.15,-21.18],[-48.15,-21.16],[-48.17,-21.16],[-48.17,-21.18]]]}},
                {"type":"Feature","properties":{"name":"Araçatuba"},"geometry":{"type":"Polygon","coordinates":[[[-50.43,-21.20],[-50.38,-21.20],[-50.38,-21.15],[-50.43,-21.15],[-50.43,-21.20]]]}},
                {"type":"Feature","properties":{"name":"Presidente Prudente"},"geometry":{"type":"Polygon","coordinates":[[[-51.38,-22.07],[-51.36,-22.07],[-51.36,-22.05],[-51.38,-22.05],[-51.38,-22.07]]]}},
                {"type":"Feature","properties":{"name":"Jacareí"},"geometry":{"type":"Polygon","coordinates":[[[-45.97,-23.30],[-45.95,-23.30],[-45.95,-23.28],[-45.97,-23.28],[-45.97,-23.30]]]}},
                {"type":"Feature","properties":{"name":"São José dos Campos"},"geometry":{"type":"Polygon","coordinates":[[[-45.89,-23.18],[-45.87,-23.18],[-45.87,-23.16],[-45.89,-23.16],[-45.89,-23.18]]]}},
                {"type":"Feature","properties":{"name":"Taubaté"},"geometry":{"type":"Polygon","coordinates":[[[-45.55,-23.03],[-45.53,-23.03],[-45.53,-23.01],[-45.55,-23.01],[-45.55,-23.03]]]}},
                {"type":"Feature","properties":{"name":"Pindamonhangaba"},"geometry":{"type":"Polygon","coordinates":[[[-45.46,-22.31],[-45.44,-22.31],[-45.44,-22.29],[-45.46,-22.29],[-45.46,-22.31]]]}},
                {"type":"Feature","properties":{"name":"Guaratinguetá"},"geometry":{"type":"Polygon","coordinates":[[[-45.19,-22.80],[-45.17,-22.80],[-45.17,-22.78],[-45.19,-22.78],[-45.19,-22.80]]]}},
                {"type":"Feature","properties":{"name":"Aparecida"},"geometry":{"type":"Polygon","coordinates":[[[-45.24,-22.86],[-45.22,-22.86],[-45.22,-22.84],[-45.24,-22.84],[-45.24,-22.86]]]}},
                {"type":"Feature","properties":{"name":"Cruzeiro"},"geometry":{"type":"Polygon","coordinates":[[[-44.99,-22.57],[-44.97,-22.57],[-44.97,-22.55],[-44.99,-22.55],[-44.99,-22.57]]]}},
                {"type":"Feature","properties":{"name":"Santos"},"geometry":{"type":"Polygon","coordinates":[[[-46.33,-23.96],[-46.31,-23.96],[-46.31,-23.94],[-46.33,-23.94],[-46.33,-23.96]]]}},
                {"type":"Feature","properties":{"name":"São Vicente"},"geometry":{"type":"Polygon","coordinates":[[[-46.41,-23.96],[-46.39,-23.96],[-46.39,-23.94],[-46.41,-23.94],[-46.41,-23.96]]]}},
                {"type":"Feature","properties":{"name":"Itanhaém"},"geometry":{"type":"Polygon","coordinates":[[[-46.80,-24.19],[-46.78,-24.19],[-46.78,-24.17],[-46.80,-24.17],[-46.80,-24.19]]]}},
                {"type":"Feature","properties":{"name":"Peruíbe"},"geometry":{"type":"Polygon","coordinates":[[[-47.03,-24.30],[-47.01,-24.30],[-47.01,-24.28],[-47.03,-24.28],[-47.03,-24.30]]]}},
                {"type":"Feature","properties":{"name":"Bertioga"},"geometry":{"type":"Polygon","coordinates":[[[-46.18,-23.87],[-46.16,-23.87],[-46.16,-23.85],[-46.18,-23.85],[-46.18,-23.87]]]}},
                {"type":"Feature","properties":{"name":"Guarujá"},"geometry":{"type":"Polygon","coordinates":[[[-46.26,-23.99],[-46.24,-23.99],[-46.24,-23.97],[-46.26,-23.97],[-46.26,-23.99]]]}},
                {"type":"Feature","properties":{"name":"Atibaia"},"geometry":{"type":"Polygon","coordinates":[[[-46.55,-23.11],[-46.53,-23.11],[-46.53,-23.09],[-46.55,-23.09],[-46.55,-23.11]]]}},
                {"type":"Feature","properties":{"name":"Americana"},"geometry":{"type":"Polygon","coordinates":[[[-47.34,-22.73],[-47.32,-22.73],[-47.32,-22.71],[-47.34,-22.71],[-47.34,-22.73]]]}},
                {"type":"Feature","properties":{"name":"Arujá"},"geometry":{"type":"Polygon","coordinates":[[[-46.32,-23.33],[-46.30,-23.33],[-46.30,-23.31],[-46.32,-23.31],[-46.32,-23.33]]]}},
                {"type":"Feature","properties":{"name":"Caçapava"},"geometry":{"type":"Polygon","coordinates":[[[-45.71,-23.09],[-45.69,-23.09],[-45.69,-23.07],[-45.71,-23.07],[-45.71,-23.09]]]}},
                {"type":"Feature","properties":{"name":"Barueri"},"geometry":{"type":"Polygon","coordinates":[[[-46.88,-23.51],[-46.86,-23.51],[-46.86,-23.49],[-46.88,-23.49],[-46.88,-23.51]]]}},
                {"type":"Feature","properties":{"name":"Cotia"},"geometry":{"type":"Polygon","coordinates":[[[-46.92,-23.61],[-46.90,-23.61],[-46.90,-23.59],[-46.92,-23.59],[-46.92,-23.61]]]}},
                {"type":"Feature","properties":{"name":"Carapicuíba"},"geometry":{"type":"Polygon","coordinates":[[[-46.85,-23.56],[-46.83,-23.56],[-46.83,-23.54],[-46.85,-23.54],[-46.85,-23.56]]]}},
                {"type":"Feature","properties":{"name":"Taboão da Serra"},"geometry":{"type":"Polygon","coordinates":[[[-46.78,-23.61],[-46.76,-23.61],[-46.76,-23.59],[-46.78,-23.59],[-46.78,-23.61]]]}},
                {"type":"Feature","properties":{"name":"Embu"},"geometry":{"type":"Polygon","coordinates":[[[-46.87,-23.64],[-46.85,-23.64],[-46.85,-23.62],[-46.87,-23.62],[-46.87,-23.64]]]}},
                {"type":"Feature","properties":{"name":"Itapecerica da Serra"},"geometry":{"type":"Polygon","coordinates":[[[-46.95,-23.73],[-46.93,-23.73],[-46.93,-23.71],[-46.95,-23.71],[-46.95,-23.73]]]}},
                {"type":"Feature","properties":{"name":"Ibiúna"},"geometry":{"type":"Polygon","coordinates":[[[-47.22,-23.65],[-47.20,-23.65],[-47.20,-23.63],[-47.22,-23.63],[-47.22,-23.65]]]}},
                {"type":"Feature","properties":{"name":"Araras"},"geometry":{"type":"Polygon","coordinates":[[[-47.73,-22.36],[-47.71,-22.36],[-47.71,-22.34],[-47.73,-22.34],[-47.73,-22.36]]]}},
                {"type":"Feature","properties":{"name":"Rio Claro"},"geometry":{"type":"Polygon","coordinates":[[[-47.57,-22.40],[-47.55,-22.40],[-47.55,-22.38],[-47.57,-22.38],[-47.57,-22.40]]]}},
                {"type":"Feature","properties":{"name":"Valinhos"},"geometry":{"type":"Polygon","coordinates":[[[-47.12,-23.00],[-47.10,-23.00],[-47.10,-22.98],[-47.12,-22.98],[-47.12,-23.00]]]}},
                {"type":"Feature","properties":{"name":"Louveira"},"geometry":{"type":"Polygon","coordinates":[[[-47.05,-23.06],[-47.03,-23.06],[-47.03,-23.04],[-47.05,-23.04],[-47.05,-23.06]]]}},
                {"type":"Feature","properties":{"name":"Santana de Parnaíba"},"geometry":{"type":"Polygon","coordinates":[[[-46.98,-23.46],[-46.96,-23.46],[-46.96,-23.44],[-46.98,-23.44],[-46.98,-23.46]]]}},
                {"type":"Feature","properties":{"name":"Bragança Paulista"},"geometry":{"type":"Polygon","coordinates":[[[-46.53,-22.96],[-46.51,-22.96],[-46.51,-22.94],[-46.53,-22.94],[-46.53,-22.96]]]}},
                {"type":"Feature","properties":{"name":"Jarinu"},"geometry":{"type":"Polygon","coordinates":[[[-46.70,-23.17],[-46.68,-23.17],[-46.68,-23.15],[-46.70,-23.15],[-46.70,-23.17]]]}},
                {"type":"Feature","properties":{"name":"Vinhedo"},"geometry":{"type":"Polygon","coordinates":[[[-47.08,-23.02],[-47.06,-23.02],[-47.06,-23.00],[-47.08,-23.00],[-47.08,-23.02]]]}},
                {"type":"Feature","properties":{"name":"Votuporanga"},"geometry":{"type":"Polygon","coordinates":[[[-49.98,-20.43],[-49.96,-20.43],[-49.96,-20.41],[-49.98,-20.41],[-49.98,-20.43]]]}},
                {"type":"Feature","properties":{"name":"São Jose do Rio Preto"},"geometry":{"type":"Polygon","coordinates":[[[-49.38,-20.81],[-49.36,-20.81],[-49.36,-20.79],[-49.38,-20.79],[-49.38,-20.81]]]}},
                {"type":"Feature","properties":{"name":"Mirassol"},"geometry":{"type":"Polygon","coordinates":[[[-49.05,-20.81],[-49.03,-20.81],[-49.03,-20.79],[-49.05,-20.79],[-49.05,-20.81]]]}},
                {"type":"Feature","properties":{"name":"Catanduva"},"geometry":{"type":"Polygon","coordinates":[[[-48.98,-21.13],[-48.96,-21.13],[-48.96,-21.11],[-48.98,-21.11],[-48.98,-21.13]]]}},
                {"type":"Feature","properties":{"name":"Avaré"},"geometry":{"type":"Polygon","coordinates":[[[-49.67,-22.83],[-49.65,-22.83],[-49.65,-22.81],[-49.67,-22.81],[-49.67,-22.83]]]}},
                {"type":"Feature","properties":{"name":"Botucatu"},"geometry":{"type":"Polygon","coordinates":[[[-48.44,-22.88],[-48.42,-22.88],[-48.42,-22.86],[-48.44,-22.86],[-48.44,-22.88]]]}},
                {"type":"Feature","properties":{"name":"Ourinhos"},"geometry":{"type":"Polygon","coordinates":[[[-49.87,-22.97],[-49.85,-22.97],[-49.85,-22.95],[-49.87,-22.95],[-49.87,-22.97]]]}},
                {"type":"Feature","properties":{"name":"Marília"},"geometry":{"type":"Polygon","coordinates":[[[-49.95,-22.21],[-49.93,-22.21],[-49.93,-22.19],[-49.95,-22.19],[-49.95,-22.21]]]}},
                {"type":"Feature","properties":{"name":"Campos do Jordão"},"geometry":{"type":"Polygon","coordinates":[[[-45.59,-22.74],[-45.57,-22.74],[-45.57,-22.72],[-45.59,-22.72],[-45.59,-22.74]]]}},
                {"type":"Feature","properties":{"name":"Ubatuba"},"geometry":{"type":"Polygon","coordinates":[[[-45.07,-23.44],[-45.05,-23.44],[-45.05,-23.42],[-45.07,-23.42],[-45.07,-23.44]]]}},
                {"type":"Feature","properties":{"name":"Caraguatatuba"},"geometry":{"type":"Polygon","coordinates":[[[-45.41,-23.62],[-45.39,-23.62],[-45.39,-23.60],[-45.41,-23.60],[-45.41,-23.62]]]}},
                {"type":"Feature","properties":{"name":"São Bento do Sapucaí"},"geometry":{"type":"Polygon","coordinates":[[[-45.71,-22.64],[-45.69,-22.64],[-45.69,-22.62],[-45.71,-22.62],[-45.71,-22.64]]]}},
                {"type":"Feature","properties":{"name":"Praia Grande"},"geometry":{"type":"Polygon","coordinates":[[[-46.40,-24.00],[-46.38,-24.00],[-46.38,-23.98],[-46.40,-23.98],[-46.40,-24.00]]]}},
                {"type":"Feature","properties":{"name":"Mongaguá"},"geometry":{"type":"Polygon","coordinates":[[[-46.77,-24.06],[-46.75,-24.06],[-46.75,-24.04],[-46.77,-24.04],[-46.77,-24.06]]]}},
                {"type":"Feature","properties":{"name":"Rio das Pedras"},"geometry":{"type":"Polygon","coordinates":[[[-47.82,-22.75],[-47.80,-22.75],[-47.80,-22.73],[-47.82,-22.73],[-47.82,-22.75]]]}},
                {"type":"Feature","properties":{"name":"Santa Bárbara d'Oeste"},"geometry":{"type":"Polygon","coordinates":[[[-47.41,-22.75],[-47.39,-22.75],[-47.39,-22.73],[-47.41,-22.73],[-47.41,-22.75]]]}},
                {"type":"Feature","properties":{"name":"Capivari"},"geometry":{"type":"Polygon","coordinates":[[[-47.55,-23.07],[-47.53,-23.07],[-47.53,-23.05],[-47.55,-23.05],[-47.55,-23.07]]]}},
                {"type":"Feature","properties":{"name":"Apiaí"},"geometry":{"type":"Polygon","coordinates":[[[-48.87,-24.37],[-48.85,-24.37],[-48.85,-24.35],[-48.87,-24.35],[-48.87,-24.37]]]}},
                {"type":"Feature","properties":{"name":"Registro"},"geometry":{"type":"Polygon","coordinates":[[[-48.30,-24.48],[-48.28,-24.48],[-48.28,-24.46],[-48.30,-24.46],[-48.30,-24.48]]]}}
            ]
        };
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
        this.map.setView([-23.55, -46.63], 8);
        this.currentFilters = { company: '', segment: '', status: 'todos' };
        this.currentClients = [...CLIENTS_DATA];
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
}

let app;
document.addEventListener('DOMContentLoaded', () => {
    feather.replace();
    app = new GeoClientApp();
    app.init();
});
