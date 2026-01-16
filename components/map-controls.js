// Map Controls Component
class CustomMapControls extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        // Será inicializado quando o mapa estiver pronto
    }

    init(map) {
        this.map = map;
        this.addZoomControls();
        this.addResetViewControl();
    }

    addZoomControls() {
        const zoomControl = L.control.zoom({ position: 'topright' });
        zoomControl.addTo(this.map);
    }

    addResetViewControl() {
        const resetControl = L.Control.extend({
            options: {
                position: 'topright' // ✅ Voltou para o topo
            },

            onAdd: (map) => {
                const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
                
                container.innerHTML = `
                    <a href="#" 
                       role="button" 
                       title="Voltar para visão geral de São Paulo"
                       aria-label="Resetar zoom"
                       style="
                           display: flex;
                           align-items: center;
                           justify-content: center;
                           width: 34px;
                           height: 34px;
                           background: white;
                           border: 2px solid rgba(0,0,0,0.2);
                           border-radius: 4px;
                           cursor: pointer;
                           text-decoration: none;
                           box-shadow: 0 1px 5px rgba(0,0,0,0.4);
                           transition: all 0.2s ease;
                       "
                       onmouseover="this.style.background='#f9fafb'; this.style.transform='scale(1.05)'; this.style.boxShadow='0 2px 8px rgba(0,0,0,0.5)';"
                       onmouseout="this.style.background='white'; this.style.transform='scale(1)'; this.style.boxShadow='0 1px 5px rgba(0,0,0,0.4)';">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                            <polyline points="9 22 9 12 15 12 15 22"></polyline>
                        </svg>
                    </a>
                `;

                // Previne propagação de eventos de clique no mapa
                L.DomEvent.disableClickPropagation(container);
                L.DomEvent.disableScrollPropagation(container);

                // Handler de click
                container.querySelector('a').onclick = (e) => {
                    e.preventDefault();
                    // ✅ Reset para MESMA visão inicial do mapa: [-22.5, -49.2] zoom 7.2
                    map.setView([-22.5, -49.2], 7.2, {
                        animate: true,
                        duration: 0.5
                    });
                };

                return container;
            }
        });

        this.map.addControl(new resetControl());
    }
}

customElements.define('custom-map-controls', CustomMapControls);