// Custom Filter Panel Component - v2.9.21 (Filtros removidos, estatísticas mantidas)
class CustomFilterPanel extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
    }

    // ✅ Função auxiliar para contar clientes por empresa
    getClientsByCompany(company) {
        return CLIENTS_DATA.filter(c => c.company === company);
    }

    // ✅ Função auxiliar para clientes ativos
    getActiveClients() {
        return CLIENTS_DATA.filter(c => c.status === 'ativo');
    }

    // ✅ Função auxiliar para municípios ocupados
    getOccupiedMunicipalities() {
        return [...new Set(CLIENTS_DATA.map(c => c.municipality))];
    }

    render() {
        // ✅ Contadores por empresa
        const cdoCount = this.getClientsByCompany("CDO").length;
        const suporteCount = this.getClientsByCompany("SUPORTE").length;
        const wauxCount = this.getClientsByCompany("WAUX").length;
        const montebelloCount = this.getClientsByCompany("MONTEBELLO").length;
        const hirataCount = this.getClientsByCompany("HIRATA").length;
        const lubmultiCount = this.getClientsByCompany("LUBMULTI").length;

        const activeCount = this.getActiveClients().length;
        const occupiedCount = this.getOccupiedMunicipalities().length;
        const totalMunicipalities = 645; // Total de municípios de SP

        this.innerHTML = `
            <!-- ✅ SEÇÃO: EMPRESAS (Estatísticas) -->
            <div class="bg-white rounded-lg shadow p-6">
                <h2 class="text-xl font-bold mb-4">Empresas</h2>
                <div class="space-y-3">
                    <div class="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer" data-company="CDO">
                        <div class="w-4 h-4 rounded-full mr-3" style="background: #ef4444;"></div>
                        <div>
                            <span class="font-medium text-sm">CDO</span>
                            <div class="text-xs text-gray-500">${cdoCount} clientes</div>
                        </div>
                    </div>
                    <div class="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer" data-company="SUPORTE">
                        <div class="w-4 h-4 rounded-full mr-3" style="background: #3b82f6;"></div>
                        <div>
                            <span class="font-medium text-sm">SUPORTE</span>
                            <div class="text-xs text-gray-500">${suporteCount} clientes</div>
                        </div>
                    </div>
                    <div class="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer" data-company="WAUX">
                        <div class="w-4 h-4 rounded-full mr-3" style="background: #10b981;"></div>
                        <div>
                            <span class="font-medium text-sm">WAUX</span>
                            <div class="text-xs text-gray-500">${wauxCount} clientes</div>
                        </div>
                    </div>
                    <div class="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer" data-company="MONTEBELLO">
                        <div class="w-4 h-4 rounded-full mr-3" style="background: #f59e0b;"></div>
                        <div>
                            <span class="font-medium text-sm">MONTEBELLO</span>
                            <div class="text-xs text-gray-500">${montebelloCount} clientes</div>
                        </div>
                    </div>
                    <div class="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer" data-company="HIRATA">
                        <div class="w-4 h-4 rounded-full mr-3" style="background: #8b5cf6;"></div>
                        <div>
                            <span class="font-medium text-sm">HIRATA</span>
                            <div class="text-xs text-gray-500">${hirataCount} clientes</div>
                        </div>
                    </div>
                    <div class="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer" data-company="LUBMULTI">
                        <div class="w-4 h-4 rounded-full mr-3" style="background: #6b7280;"></div>
                        <div>
                            <span class="font-medium text-sm">LUBMULTI</span>
                            <div class="text-xs text-gray-500">${lubmultiCount} clientes</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ✅ SEÇÃO: RESUMO (Estatísticas gerais) -->
            <div class="bg-white rounded-lg shadow p-6">
                <h2 class="text-xl font-bold mb-4">Resumo</h2>
                <div class="space-y-4">
                    <div>
                        <div class="flex justify-between mb-1">
                            <span class="text-sm font-medium">Clientes Ativos</span>
                            <span class="text-sm font-bold text-green-600">${activeCount}</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2">
                            <div class="bg-green-600 h-2 rounded-full" style="width: ${CLIENTS_DATA.length > 0 ? (activeCount / CLIENTS_DATA.length * 100) : 0}%"></div>
                        </div>
                    </div>
                    <div>
                        <div class="flex justify-between mb-1">
                            <span class="text-sm font-medium">Municípios Ocupados</span>
                            <span class="text-sm font-bold text-blue-600">${occupiedCount} / ${totalMunicipalities}</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2">
                            <div class="bg-blue-600 h-2 rounded-full" style="width: ${(occupiedCount / totalMunicipalities * 100).toFixed(1)}%"></div>
                        </div>
                        <div class="text-xs text-gray-500 mt-1">${((occupiedCount / totalMunicipalities) * 100).toFixed(1)}% do estado</div>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        const companyCards = this.querySelectorAll('[data-company]');

        // ✅ Clique nas empresas aplica filtro (funcionalidade mantida)
        companyCards.forEach(card => {
            card.addEventListener('click', () => {
                const company = card.dataset.company;
                console.log(`📋 Filtrando por: ${company}`);
                
                // Dispara evento customizado para outros componentes
                window.dispatchEvent(new CustomEvent('companyFilterChanged', {
                    detail: { company }
                }));
            });
        });
    }
}

customElements.define('custom-filter-panel', CustomFilterPanel);