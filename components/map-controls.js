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
        this.addLegendControl();
    }

    addZoomControls() {
        const zoomControl = L.control.zoom({ position: 'topright' });
        zoomControl.addTo(this.map);
    }

    addResetViewControl() {
        const resetControl = L.Control.extend({
            options: {
                position: 'topright'
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
                    // Reset para a visão inicial de São Paulo - ZOOM AJUSTADO para 6
                    map.setView([-23.5505, -46.6333], 6, {
                        animate: true,
                        duration: 0.5
                    });
                };

                return container;
            }
        });

        this.map.addControl(new resetControl());
    }

    addLegendControl() {
        const legend = L.control({ position: 'bottomright' });

        legend.onAdd = (map) => {
            const div = L.DomUtil.create('div', 'leaflet-control leaflet-bar legend-control');
            div.innerHTML = `
                <div style="padding: 12px; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.15); border: 2px solid rgba(0,0,0,0.1);">
                    <h4 style="margin: 0 0 10px 0; font-size: 13px; font-weight: 700; color: #374151;">Legenda de Marcadores</h4>
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                        <div style="width: 16px; height: 16px; background: #10b981; border-radius: 50%; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.4);"></div>
                        <span style="font-size: 12px; color: #1f2937; font-weight: 500;">Cliente Ativo</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="width: 16px; height: 16px; background: #fbbf24; border-radius: 50%; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.4);"></div>
                        <span style="font-size: 12px; color: #1f2937; font-weight: 500;">Cliente Inativo</span>
                    </div>
                </div>
            `;
            
            // Previne propagação de eventos
            L.DomEvent.disableClickPropagation(div);
            L.DomEvent.disableScrollPropagation(div);
            
            return div;
        };

        legend.addTo(this.map);
    }
}

customElements.define('custom-map-controls', CustomMapControls);