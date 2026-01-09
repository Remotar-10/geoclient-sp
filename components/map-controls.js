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
        this.addLegendControl();
    }

    addZoomControls() {
        const zoomControl = L.control.zoom({ position: 'topright' });
        zoomControl.addTo(this.map);
    }

    addLegendControl() {
        const legend = L.control({ position: 'bottomright' });

        legend.onAdd = (map) => {
            const div = L.DomUtil.create('div', 'leaflet-control leaflet-bar legend-control');
            div.innerHTML = `
                <div style="padding: 10px; background: white; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    <h4 style="margin: 0 0 10px 0; font-size: 12px; font-weight: bold;">Legenda</h4>
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                        <div style="width: 16px; height: 16px; background: #10b981; border-radius: 50%; border: 2px solid white; box-shadow: 0 1px 2px rgba(0,0,0,0.3);"></div>
                        <span style="font-size: 12px;">Ativo</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="width: 16px; height: 16px; background: #fbbf24; border-radius: 50%; border: 2px solid white; box-shadow: 0 1px 2px rgba(0,0,0,0.3);"></div>
                        <span style="font-size: 12px;">Inativo</span>
                    </div>
                </div>
            `;
            return div;
        };

        legend.addTo(this.map);
    }
}

customElements.define('custom-map-controls', CustomMapControls);
