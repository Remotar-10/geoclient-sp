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

        // Carregar municípios
        this.loadMunicipalitiesBoundaries();

        // Inicializar controles do mapa
        const mapControls = document.querySelector('custom-map-controls');
        if (mapControls) {
            mapControls.init(this.map);
        }
    }

    loadMunicipalitiesBoundaries() {
        // Usar dados locais GARANTIDOS
        const municipalitiesData = this.getMunicipalitiesData();
        
        try {
            const occupiedMunicipalities = getOccupiedMunicipalities();
            
            this.geoJsonLayer = L.geoJSON(municipalitiesData, {
                style: (feature) => {
                    const municipalityName = feature.properties?.name || '';
                    const isOccupied = occupiedMunicipalities.includes(municipalityName);
                    
                    return {
                        fillColor: isOccupied ? '#10b981' : '#e5e7eb',
                        weight: 1,
                        opacity: 0.7,
                        color: '#9ca3af',
                        fillOpacity: isOccupied ? 0.4 : 0.08
                    };
                },
                onEachFeature: (feature, layer) => {
                    const municipalityName = feature.properties?.name || 'Município';
                    const occupiedMunicipalities = getOccupiedMunicipalities();
                    const isOccupied = occupiedMunicipalities.includes(municipalityName);
                    const status = isOccupied ? '✅ Ocupado' : '⭕ Disponível';
                    
                    layer.bindPopup(`
                        <div class="p-2">
                            <h4 class="font-bold text-sm">${municipalityName}</h4>
                            <p class="text-xs text-gray-600">${status}</p>
                        </div>
                    `);

                    layer.on('mouseover', () => {
                        layer.setStyle({
                            weight: 2,
                            opacity: 1
                        });
                    });

                    layer.on('mouseout', () => {
                        layer.setStyle({
                            weight: 1,
                            opacity: 0.7
                        });
                    });
                }
            }).addTo(this.map);
            
            console.log('✅ Municípios carregados com sucesso!');
        } catch (error) {
            console.error('Erro ao carregar municípios:', error);
        }
    }

    getMunicipalitiesData() {
        // GeoJSON com os municípios principais de São Paulo
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
                {"type":"Feature","properties":{"name":"Mauá"},"geometry":{"type":"Polygon","coordinates":[[[-46.46,-23.66],[-46.44,-23.66],[-46.44,-23.64],[-46.46,-23.64],[-46.46,-23.66]]]}},
                {"type":"Feature","properties":{"name":"Ribeirão Pires"},"geometry":{"type":"Polygon","coordinates":[[[-46.42,-23.71],[-46.40,-23.71],[-46.40,-23.69],[-46.42,-23.69],[-46.42,-23.71]]]}},
                {"type":"Feature","properties":{"name":"Rio Grande da Serra"},"geometry":{"type":"Polygon","coordinates":[[[-46.34,-23.74],[-46.32,-23.74],[-46.32,-23.72],[-46.34,-23.72],[-46.34,-23.74]]]}},
                {"type":"Feature","properties":{"name":"Osasco"},"geometry":{"type":"Polygon","coordinates":[[[-46.78,-23.53],[-46.76,-23.53],[-46.76,-23.51],[-46.78,-23.51],[-46.78,-23.53]]]}},
                {"type":"Feature","properties":{"name":"Barueri"},"geometry":{"type":"Polygon","coordinates":[[[-46.88,-23.51],[-46.86,-23.51],[-46.86,-23.49],[-46.88,-23.49],[-46.88,-23.51]]]}},
                {"type":"Feature","properties":{"name":"Carapicuíba"},"geometry":{"type":"Polygon","coordinates":[[[-46.85,-23.56],[-46.83,-23.56],[-46.83,-23.54],[-46.85,-23.54],[-46.85,-23.56]]]}},
                {"type":"Feature","properties":{"name":"Cotia"},"geometry":{"type":"Polygon","coordinates":[[[-46.92,-23.61],[-46.90,-23.61],[-46.90,-23.59],[-46.92,-23.59],[-46.92,-23.61]]]}},
                {"type":"Feature","properties":{"name":"Embu"},"geometry":{"type":"Polygon","coordinates":[[[-46.87,-23.64],[-46.85,-23.64],[-46.85,-23.62],[-46.87,-23.62],[-46.87,-23.64]]]}},
                {"type":"Feature","properties":{"name":"Embu-Guaçu"},"geometry":{"type":"Polygon","coordinates":[[[-46.92,-23.79],[-46.90,-23.79],[-46.90,-23.77],[-46.92,-23.77],[-46.92,-23.79]]]}},
                {"type":"Feature","properties":{"name":"Itapecerica da Serra"},"geometry":{"type":"Polygon","coordinates":[[[-46.95,-23.73],[-46.93,-23.73],[-46.93,-23.71],[-46.95,-23.71],[-46.95,-23.73]]]}},
                {"type":"Feature","properties":{"name":"Juquitiba"},"geometry":{"type":"Polygon","coordinates":[[[-47.23,-23.98],[-47.21,-23.98],[-47.21,-23.96],[-47.23,-23.96],[-47.23,-23.98]]]}},
                {"type":"Feature","properties":{"name":"Piedade"},"geometry":{"type":"Polygon","coordinates":[[[-47.73,-23.81],[-47.71,-23.81],[-47.71,-23.79],[-47.73,-23.79],[-47.73,-23.81]]]}},
                {"type":"Feature","properties":{"name":"São Lourenço da Serra"},"geometry":{"type":"Polygon","coordinates":[[[-47.02,-23.81],[-47.00,-23.81],[-47.00,-23.79],[-47.02,-23.79],[-47.02,-23.81]]]}},
                {"type":"Feature","properties":{"name":"Taboão da Serra"},"geometry":{"type":"Polygon","coordinates":[[[-46.78,-23.61],[-46.76,-23.61],[-46.76,-23.59],[-46.78,-23.59],[-46.78,-23.61]]]}},
                {"type":"Feature","properties":{"name":"Vargem Grande Paulista"},"geometry":{"type":"Polygon","coordinates":[[[-46.98,-23.72],[-46.96,-23.72],[-46.96,-23.70],[-46.98,-23.70],[-46.98,-23.72]]]}},
                {"type":"Feature","properties":{"name":"Atibaia"},"geometry":{"type":"Polygon","coordinates":[[[-46.55,-23.11],[-46.53,-23.11],[-46.53,-23.09],[-46.55,-23.09],[-46.55,-23.11]]]}},
                {"type":"Feature","properties":{"name":"Bom Jesus dos Perdões"},"geometry":{"type":"Polygon","coordinates":[[[-46.48,-23.23],[-46.46,-23.23],[-46.46,-23.21],[-46.48,-23.21],[-46.48,-23.23]]]}},
                {"type":"Feature","properties":{"name":"Bragança Paulista"},"geometry":{"type":"Polygon","coordinates":[[[-46.53,-22.96],[-46.51,-22.96],[-46.51,-22.94],[-46.53,-22.94],[-46.53,-22.96]]]}},
                {"type":"Feature","properties":{"name":"Jarinu"},"geometry":{"type":"Polygon","coordinates":[[[-46.70,-23.17],[-46.68,-23.17],[-46.68,-23.15],[-46.70,-23.15],[-46.70,-23.17]]]}},
                {"type":"Feature","properties":{"name":"Joanópolis"},"geometry":{"type":"Polygon","coordinates":[[[-46.51,-22.92],[-46.49,-22.92],[-46.49,-22.90],[-46.51,-22.90],[-46.51,-22.92]]]}},
                {"type":"Feature","properties":{"name":"Louveira"},"geometry":{"type":"Polygon","coordinates":[[[-47.05,-23.06],[-47.03,-23.06],[-47.03,-23.04],[-47.05,-23.04],[-47.05,-23.06]]]}},
                {"type":"Feature","properties":{"name":"Nazaré Paulista"},"geometry":{"type":"Polygon","coordinates":[[[-46.39,-23.17],[-46.37,-23.17],[-46.37,-23.15],[-46.39,-23.15],[-46.39,-23.17]]]}},
                {"type":"Feature","properties":{"name":"Pedra Bela"},"geometry":{"type":"Polygon","coordinates":[[[-46.35,-22.88],[-46.33,-22.88],[-46.33,-22.86],[-46.35,-22.86],[-46.35,-22.88]]]}},
                {"type":"Feature","properties":{"name":"Peruíbe"},"geometry":{"type":"Polygon","coordinates":[[[-47.03,-24.30],[-47.01,-24.30],[-47.01,-24.28],[-47.03,-24.28],[-47.03,-24.30]]]}},
                {"type":"Feature","properties":{"name":"Piracaia"},"geometry":{"type":"Polygon","coordinates":[[[-46.32,-23.01],[-46.30,-23.01],[-46.30,-22.99],[-46.32,-22.99],[-46.32,-23.01]]]}},
                {"type":"Feature","properties":{"name":"Pinhalzinho"},"geometry":{"type":"Polygon","coordinates":[[[-47.18,-23.22],[-47.16,-23.22],[-47.16,-23.20],[-47.18,-23.20],[-47.18,-23.22]]]}},
                {"type":"Feature","properties":{"name":"Pirassununga"},"geometry":{"type":"Polygon","coordinates":[[[-47.43,-21.99],[-47.41,-21.99],[-47.41,-21.97],[-47.43,-21.97],[-47.43,-21.99]]]}},
                {"type":"Feature","properties":{"name":"Poá"},"geometry":{"type":"Polygon","coordinates":[[[-46.30,-23.57],[-46.28,-23.57],[-46.28,-23.55],[-46.30,-23.55],[-46.30,-23.57]]]}},
                {"type":"Feature","properties":{"name":"Americana"},"geometry":{"type":"Polygon","coordinates":[[[-47.34,-22.73],[-47.32,-22.73],[-47.32,-22.71],[-47.34,-22.71],[-47.34,-22.73]]]}},
                {"type":"Feature","properties":{"name":"Araras"},"geometry":{"type":"Polygon","coordinates":[[[-47.73,-22.36],[-47.71,-22.36],[-47.71,-22.34],[-47.73,-22.34],[-47.73,-22.36]]]}},
                {"type":"Feature","properties":{"name":"Avaré"},"geometry":{"type":"Polygon","coordinates":[[[-49.67,-22.83],[-49.65,-22.83],[-49.65,-22.81],[-49.67,-22.81],[-49.67,-22.83]]]}},
                {"type":"Feature","properties":{"name":"Botucatu"},"geometry":{"type":"Polygon","coordinates":[[[-48.44,-22.88],[-48.42,-22.88],[-48.42,-22.86],[-48.44,-22.86],[-48.44,-22.88]]]}},
                {"type":"Feature","properties":{"name":"Brotas"},"geometry":{"type":"Polygon","coordinates":[[[-48.19,-22.23],[-48.17,-22.23],[-48.17,-22.21],[-48.19,-22.21],[-48.19,-22.23]]]}},
                {"type":"Feature","properties":{"name":"Conchas"},"geometry":{"type":"Polygon","coordinates":[[[-48.97,-22.80],[-48.95,-22.80],[-48.95,-22.78],[-48.97,-22.78],[-48.97,-22.80]]]}},
                {"type":"Feature","properties":{"name":"Corumbataí"},"geometry":{"type":"Polygon","coordinates":[[[-47.68,-22.20],[-47.66,-22.20],[-47.66,-22.18],[-47.68,-22.18],[-47.68,-22.20]]]}},
                {"type":"Feature","properties":{"name":"Itapetininga"},"geometry":{"type":"Polygon","coordinates":[[[-48.03,-23.57],[-48.01,-23.57],[-48.01,-23.55],[-48.03,-23.55],[-48.03,-23.57]]]}},
                {"type":"Feature","properties":{"name":"Itararé"},"geometry":{"type":"Polygon","coordinates":[[[-49.27,-24.18],[-49.25,-24.18],[-49.25,-24.16],[-49.27,-24.16],[-49.27,-24.18]]]}},
                {"type":"Feature","properties":{"name":"Ituverava"},"geometry":{"type":"Polygon","coordinates":[[[-47.79,-20.33],[-47.77,-20.33],[-47.77,-20.31],[-47.79,-20.31],[-47.79,-20.33]]]}},
                {"type":"Feature","properties":{"name":"Jacareí"},"geometry":{"type":"Polygon","coordinates":[[[-45.97,-23.30],[-45.95,-23.30],[-45.95,-23.28],[-45.97,-23.28],[-45.97,-23.30]]]}},
                {"type":"Feature","properties":{"name":"Jales"},"geometry":{"type":"Polygon","coordinates":[[[-50.76,-20.27],[-50.74,-20.27],[-50.74,-20.25],[-50.76,-20.25],[-50.76,-20.27]]]}},
                {"type":"Feature","properties":{"name":"Jaú"},"geometry":{"type":"Polygon","coordinates":[[[-48.57,-22.30],[-48.55,-22.30],[-48.55,-22.28],[-48.57,-22.28],[-48.57,-22.30]]]}},
                {"type":"Feature","properties":{"name":"Joni"},"geometry":{"type":"Polygon","coordinates":[[[-47.42,-22.85],[-47.40,-22.85],[-47.40,-22.83],[-47.42,-22.83],[-47.42,-22.85]]]}},
                {"type":"Feature","properties":{"name":"Jundiaí"},"geometry":{"type":"Polygon","coordinates":[[[-46.88,-23.18],[-46.86,-23.18],[-46.86,-23.16],[-46.88,-23.16],[-46.88,-23.18]]]}},
                {"type":"Feature","properties":{"name":"Lençóis Paulista"},"geometry":{"type":"Polygon","coordinates":[[[-48.80,-22.55],[-48.78,-22.55],[-48.78,-22.53],[-48.80,-22.53],[-48.80,-22.55]]]}},
                {"type":"Feature","properties":{"name":"Limeira"},"geometry":{"type":"Polygon","coordinates":[[[-47.42,-22.56],[-47.40,-22.56],[-47.40,-22.54],[-47.42,-22.54],[-47.42,-22.56]]]}},
                {"type":"Feature","properties":{"name":"Marília"},"geometry":{"type":"Polygon","coordinates":[[[-49.95,-22.21],[-49.93,-22.21],[-49.93,-22.19],[-49.95,-22.19],[-49.95,-22.21]]]}},
                {"type":"Feature","properties":{"name":"Ourinhos"},"geometry":{"type":"Polygon","coordinates":[[[-49.87,-22.97],[-49.85,-22.97],[-49.85,-22.95],[-49.87,-22.95],[-49.87,-22.97]]]}},
                {"type":"Feature","properties":{"name":"Piracicaba"},"geometry":{"type":"Polygon","coordinates":[[[-47.65,-22.72],[-47.63,-22.72],[-47.63,-22.70],[-47.65,-22.70],[-47.65,-22.72]]]}},
                {"type":"Feature","properties":{"name":"Pindamonhangaba"},"geometry":{"type":"Polygon","coordinates":[[[-45.46,-22.31],[-45.44,-22.31],[-45.44,-22.29],[-45.46,-22.29],[-45.46,-22.31]]]}},
                {"type":"Feature","properties":{"name":"Presidente Prudente"},"geometry":{"type":"Polygon","coordinates":[[[-51.38,-22.07],[-51.36,-22.07],[-51.36,-22.05],[-51.38,-22.05],[-51.38,-22.07]]]}},
                {"type":"Feature","properties":{"name":"Ribeirão Prêto"},"geometry":{"type":"Polygon","coordinates":[[[-48.17,-21.18],[-48.15,-21.18],[-48.15,-21.16],[-48.17,-21.16],[-48.17,-21.18]]]}},
                {"type":"Feature","properties":{"name":"Rio Claro"},"geometry":{"type":"Polygon","coordinates":[[[-47.57,-22.40],[-47.55,-22.40],[-47.55,-22.38],[-47.57,-22.38],[-47.57,-22.40]]]}},
                {"type":"Feature","properties":{"name":"Santana de Parnaíba"},"geometry":{"type":"Polygon","coordinates":[[[-46.98,-23.46],[-46.96,-23.46],[-46.96,-23.44],[-46.98,-23.44],[-46.98,-23.46]]]}},
                {"type":"Feature","properties":{"name":"Santa Bárbara d'Oeste"},"geometry":{"type":"Polygon","coordinates":[[[-47.41,-22.75],[-47.39,-22.75],[-47.39,-22.73],[-47.41,-22.73],[-47.41,-22.75]]]}},
                {"type":"Feature","properties":{"name":"Santos"},"geometry":{"type":"Polygon","coordinates":[[[-46.33,-23.96],[-46.31,-23.96],[-46.31,-23.94],[-46.33,-23.94],[-46.33,-23.96]]]}},
                {"type":"Feature","properties":{"name":"São João da Boa Vista"},"geometry":{"type":"Polygon","coordinates":[[[-46.81,-21.96],[-46.79,-21.96],[-46.79,-21.94],[-46.81,-21.94],[-46.81,-21.96]]]}},
                {"type":"Feature","properties":{"name":"São José dos Campos"},"geometry":{"type":"Polygon","coordinates":[[[-45.89,-23.18],[-45.87,-23.18],[-45.87,-23.16],[-45.89,-23.16],[-45.89,-23.18]]]}},
                {"type":"Feature","properties":{"name":"São Vicente"},"geometry":{"type":"Polygon","coordinates":[[[-46.41,-23.96],[-46.39,-23.96],[-46.39,-23.94],[-46.41,-23.94],[-46.41,-23.96]]]}},
                {"type":"Feature","properties":{"name":"Sorocaba"},"geometry":{"type":"Polygon","coordinates":[[[-47.50,-23.50],[-47.48,-23.50],[-47.48,-23.48],[-47.50,-23.48],[-47.50,-23.50]]]}},
                {"type":"Feature","properties":{"name":"Taiuva"},"geometry":{"type":"Polygon","coordinates":[[[-48.46,-21.04],[-48.44,-21.04],[-48.44,-21.02],[-48.46,-21.02],[-48.46,-21.04]]]}},
                {"type":"Feature","properties":{"name":"Tatuí"},"geometry":{"type":"Polygon","coordinates":[[[-48.07,-23.26],[-48.05,-23.26],[-48.05,-23.24],[-48.07,-23.24],[-48.07,-23.26]]]}},
                {"type":"Feature","properties":{"name":"Taubaté"},"geometry":{"type":"Polygon","coordinates":[[[-45.55,-23.03],[-45.53,-23.03],[-45.53,-23.01],[-45.55,-23.01],[-45.55,-23.03]]]}},
                {"type":"Feature","properties":{"name":"Valinhos"},"geometry":{"type":"Polygon","coordinates":[[[-47.12,-23.00],[-47.10,-23.00],[-47.10,-22.98],[-47.12,-22.98],[-47.12,-23.00]]]}},
                {"type":"Feature","properties":{"name":"Vinhedo"},"geometry":{"type":"Polygon","coordinates":[[[-47.08,-23.02],[-47.06,-23.02],[-47.06,-23.00],[-47.08,-23.00],[-47.08,-23.02]]]}},
                {"type":"Feature","properties":{"name":"Votuporanga"},"geometry":{"type":"Polygon","coordinates":[[[-49.98,-20.43],[-49.96,-20.43],[-49.96,-20.41],[-49.98,-20.41],[-49.98,-20.43]]]}},
                {"type":"Feature","properties":{"name":"Aparecida"},"geometry":{"type":"Polygon","coordinates":[[[-45.24,-22.86],[-45.22,-22.86],[-45.22,-22.84],[-45.24,-22.84],[-45.24,-22.86]]]}},
                {"type":"Feature","properties":{"name":"Arujá"},"geometry":{"type":"Polygon","coordinates":[[[-46.32,-23.33],[-46.30,-23.33],[-46.30,-23.31],[-46.32,-23.31],[-46.32,-23.33]]]}},
                {"type":"Feature","properties":{"name":"Caçapava"},"geometry":{"type":"Polygon","coordinates":[[[-45.71,-23.09],[-45.69,-23.09],[-45.69,-23.07],[-45.71,-23.07],[-45.71,-23.09]]]}},
                {"type":"Feature","properties":{"name":"Cruzeiro"},"geometry":{"type":"Polygon","coordinates":[[[-44.99,-22.57],[-44.97,-22.57],[-44.97,-22.55],[-44.99,-22.55],[-44.99,-22.57]]]}},
                {"type":"Feature","properties":{"name":"Guaratinguetá"},"geometry":{"type":"Polygon","coordinates":[[[-45.19,-22.80],[-45.17,-22.80],[-45.17,-22.78],[-45.19,-22.78],[-45.19,-22.80]]]}},
                {"type":"Feature","properties":{"name":"Itatiaia"},"geometry":{"type":"Polygon","coordinates":[[[-44.56,-22.49],[-44.54,-22.49],[-44.54,-22.47],[-44.56,-22.47],[-44.56,-22.49]]]}},
                {"type":"Feature","properties":{"name":"Potim"},"geometry":{"type":"Polygon","coordinates":[[[-45.33,-23.09],[-45.31,-23.09],[-45.31,-23.07],[-45.33,-23.07],[-45.33,-23.09]]]}},
                {"type":"Feature","properties":{"name":"Volta Redonda"},"geometry":{"type":"Polygon","coordinates":[[[-44.09,-22.51],[-44.07,-22.51],[-44.07,-22.49],[-44.09,-22.49],[-44.09,-22.51]]]}},
                {"type":"Feature","properties":{"name":"Paraibuna"},"geometry":{"type":"Polygon","coordinates":[[[-45.76,-23.53],[-45.74,-23.53],[-45.74,-23.51],[-45.76,-23.51],[-45.76,-23.53]]]}},
                {"type":"Feature","properties":{"name":"Caraguatatuba"},"geometry":{"type":"Polygon","coordinates":[[[-45.41,-23.62],[-45.39,-23.62],[-45.39,-23.60],[-45.41,-23.60],[-45.41,-23.62]]]}},
                {"type":"Feature","properties":{"name":"Rio das Pedras"},"geometry":{"type":"Polygon","coordinates":[[[-47.82,-22.75],[-47.80,-22.75],[-47.80,-22.73],[-47.82,-22.73],[-47.82,-22.75]]]}},
                {"type":"Feature","properties":{"name":"Capivari"},"geometry":{"type":"Polygon","coordinates":[[[-47.55,-23.07],[-47.53,-23.07],[-47.53,-23.05],[-47.55,-23.05],[-47.55,-23.07]]]}},
                {"type":"Feature","properties":{"name":"São Jose do Rio Preto"},"geometry":{"type":"Polygon","coordinates":[[[-49.38,-20.81],[-49.36,-20.81],[-49.36,-20.79],[-49.38,-20.79],[-49.38,-20.81]]]}},
                {"type":"Feature","properties":{"name":"Mirassol"},"geometry":{"type":"Polygon","coordinates":[[[-49.05,-20.81],[-49.03,-20.81],[-49.03,-20.79],[-49.05,-20.79],[-49.05,-20.81]]]}},
                {"type":"Feature","properties":{"name":"Catanduva"},"geometry":{"type":"Polygon","coordinates":[[[-48.98,-21.13],[-48.96,-21.13],[-48.96,-21.11],[-48.98,-21.11],[-48.98,-21.13]]]}},
                {"type":"Feature","properties":{"name":"Campos do Jordão"},"geometry":{"type":"Polygon","coordinates":[[[-45.59,-22.74],[-45.57,-22.74],[-45.57,-22.72],[-45.59,-22.72],[-45.59,-22.74]]]}},
                {"type":"Feature","properties":{"name":"Queluz"},"geometry":{"type":"Polygon","coordinates":[[[-44.69,-22.46],[-44.67,-22.46],[-44.67,-22.44],[-44.69,-22.44],[-44.69,-22.46]]]}},
                {"type":"Feature","properties":{"name":"São Bento do Sapucaí"},"geometry":{"type":"Polygon","coordinates":[[[-45.71,-22.64],[-45.69,-22.64],[-45.69,-22.62],[-45.71,-22.62],[-45.71,-22.64]]]}},
                {"type":"Feature","properties":{"name":"Gonçalves"},"geometry":{"type":"Polygon","coordinates":[[[-44.85,-22.32],[-44.83,-22.32],[-44.83,-22.30],[-44.85,-22.30],[-44.85,-22.32]]]}},
                {"type":"Feature","properties":{"name":"Silveiras"},"geometry":{"type":"Polygon","coordinates":[[[-45.02,-22.54],[-45.00,-22.54],[-45.00,-22.52],[-45.02,-22.52],[-45.02,-22.54]]]}},
                {"type":"Feature","properties":{"name":"Lavrinhas"},"geometry":{"type":"Polygon","coordinates":[[[-44.78,-22.52],[-44.76,-22.52],[-44.76,-22.50],[-44.78,-22.50],[-44.78,-22.52]]]}},
                {"type":"Feature","properties":{"name":"Natividade da Serra"},"geometry":{"type":"Polygon","coordinates":[[[-45.30,-22.39],[-45.28,-22.39],[-45.28,-22.37],[-45.30,-22.37],[-45.30,-22.39]]]}},
                {"type":"Feature","properties":{"name":"Cunha"},"geometry":{"type":"Polygon","coordinates":[[[-44.98,-23.06],[-44.96,-23.06],[-44.96,-23.04],[-44.98,-23.04],[-44.98,-23.06]]]}},
                {"type":"Feature","properties":{"name":"Lagoinha"},"geometry":{"type":"Polygon","coordinates":[[[-45.13,-22.46],[-45.11,-22.46],[-45.11,-22.44],[-45.13,-22.44],[-45.13,-22.46]]]}},
                {"type":"Feature","properties":{"name":"Ubatuba"},"geometry":{"type":"Polygon","coordinates":[[[-45.07,-23.44],[-45.05,-23.44],[-45.05,-23.42],[-45.07,-23.42],[-45.07,-23.44]]]}},
                {"type":"Feature","properties":{"name":"Ilhabela"},"geometry":{"type":"Polygon","coordinates":[[[-45.36,-23.77],[-45.34,-23.77],[-45.34,-23.75],[-45.36,-23.75],[-45.36,-23.77]]]}},
                {"type":"Feature","properties":{"name":"Bertioga"},"geometry":{"type":"Polygon","coordinates":[[[-46.18,-23.87],[-46.16,-23.87],[-46.16,-23.85],[-46.18,-23.85],[-46.18,-23.87]]]}},
                {"type":"Feature","properties":{"name":"Guarujá"},"geometry":{"type":"Polygon","coordinates":[[[-46.26,-23.99],[-46.24,-23.99],[-46.24,-23.97],[-46.26,-23.97],[-46.26,-23.99]]]}},
                {"type":"Feature","properties":{"name":"Praia Grande"},"geometry":{"type":"Polygon","coordinates":[[[-46.40,-24.00],[-46.38,-24.00],[-46.38,-23.98],[-46.40,-23.98],[-46.40,-24.00]]]}},
                {"type":"Feature","properties":{"name":"Mongaguá"},"geometry":{"type":"Polygon","coordinates":[[[-46.77,-24.06],[-46.75,-24.06],[-46.75,-24.04],[-46.77,-24.04],[-46.77,-24.06]]]}},
                {"type":"Feature","properties":{"name":"Itanhaém"},"geometry":{"type":"Polygon","coordinates":[[[-46.80,-24.19],[-46.78,-24.19],[-46.78,-24.17],[-46.80,-24.17],[-46.80,-24.19]]]}},
                {"type":"Feature","properties":{"name":"Peruíbe"},"geometry":{"type":"Polygon","coordinates":[[[-47.03,-24.30],[-47.01,-24.30],[-47.01,-24.28],[-47.03,-24.28],[-47.03,-24.30]]]}},
                {"type":"Feature","properties":{"name":"Ibiúna"},"geometry":{"type":"Polygon","coordinates":[[[-47.22,-23.65],[-47.20,-23.65],[-47.20,-23.63],[-47.22,-23.63],[-47.22,-23.65]]]}},
                {"type":"Feature","properties":{"name":"Miracatu"},"geometry":{"type":"Polygon","coordinates":[[[-47.35,-24.15],[-47.33,-24.15],[-47.33,-24.13],[-47.35,-24.13],[-47.35,-24.15]]]}},
                {"type":"Feature","properties":{"name":"Pedro de Toledo"},"geometry":{"type":"Polygon","coordinates":[[[-47.25,-24.27],[-47.23,-24.27],[-47.23,-24.25],[-47.25,-24.25],[-47.25,-24.27]]]}},
                {"type":"Feature","properties":{"name":"Registro"},"geometry":{"type":"Polygon","coordinates":[[[-48.30,-24.48],[-48.28,-24.48],[-48.28,-24.46],[-48.30,-24.46],[-48.30,-24.48]]]}},
                {"type":"Feature","properties":{"name":"Eldorado"},"geometry":{"type":"Polygon","coordinates":[[[-48.67,-24.52],[-48.65,-24.52],[-48.65,-24.50],[-48.67,-24.50],[-48.67,-24.52]]]}},
                {"type":"Feature","properties":{"name":"Apiaí"},"geometry":{"type":"Polygon","coordinates":[[[-48.87,-24.37],[-48.85,-24.37],[-48.85,-24.35],[-48.87,-24.35],[-48.87,-24.37]]]}},
                {"type":"Feature","properties":{"name":"Ribeira"},"geometry":{"type":"Polygon","coordinates":[[[-48.91,-24.49],[-48.89,-24.49],[-48.89,-24.47],[-48.91,-24.47],[-48.91,-24.49]]]}}
            ]
        };
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
                className: 'company-marker',
                zIndex: 1000
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
