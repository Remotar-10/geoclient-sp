// Custom Filter Panel Component
class CustomFilterPanel extends HTMLElement {
    constructor() {
        super();
        this.state = {
            selectedCompany: '',
            selectedSegment: '',
            selectedStatus: 'todos'
        };
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
    }

    // ✅ NOVO: Função auxiliar para contar clientes por empresa
    getClientsByCompany(company) {
        return CLIENTS_DATA.filter(c => c.company === company);
    }

    // ✅ NOVO: Função auxiliar para clientes ativos
    getActiveClients() {
        return CLIENTS_DATA.filter(c => c.status === 'ativo');
    }

    // ✅ NOVO: Função auxiliar para municípios ocupados
    getOccupiedMunicipalities() {
        return [...new Set(CLIENTS_DATA.map(c => c.municipality))];
    }

    render() {
        const companies = [...new Set(CLIENTS_DATA.map(c => c.company))];
        const segments = [...new Set(CLIENTS_DATA.map(c => c.segment))];

        // ✅ CORRIGIDO: Usa this.getClientsByCompany()
        const cdoCount = this.getClientsByCompany("CDO").length;
        const suporteCount = this.getClientsByCompany("SUPORTE").length;
        const wauxCount = this.getClientsByCompany("WAUX").length;
        const montebelloCount = this.getClientsByCompany("MONTEBELLO").length;
        const hirataCount = this.getClientsByCompany("HIRATA").length;

        const activeCount = this.getActiveClients().length;
        const occupiedCount = this.getOccupiedMunicipalities().length;
        const totalMunicipalities = 645; // Total de municípios de SP

        this.innerHTML = `
            <div class="bg-white rounded-lg shadow p-6">
                <h2 class="text-xl font-bold mb-4">Filtros</h2>
                
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Empresa</label>
                        <select id="filter-company" class="w-full border border-gray-300 rounded-md p-2 text-sm">
                            <option value="">Todas as empresas</option>
                            ${companies.map(c => `<option value="${c}">${c}</option>`).join('')}
                        </select>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Segmento</label>
                        <select id="filter-segment" class="w-full border border-gray-300 rounded-md p-2 text-sm">
                            <option value="">Todos os segmentos</option>
                            ${segments.map(s => `<option value="${s}">${s}</option>`).join('')}
                        </select>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <select id="filter-status" class="w-full border border-gray-300 rounded-md p-2 text-sm">
                            <option value="todos">Todos</option>
                            <option value="ativo">Ativos</option>
                            <option value="inativo">Inativos</option>
                        </select>
                    </div>

                    <button id="filter-reset" class="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition text-sm font-medium">
                        Limpar Filtros
                    </button>
                </div>
            </div>

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
                </div>
            </div>

            <div class="bg-white rounded-lg shadow p-6">
                <h2 class="text-xl font-bold mb-4">Quick Stats</h2>
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
                            <span class="text-sm font-bold text-blue-600">${occupiedCount}</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2">
                            <div class="bg-blue-600 h-2 rounded-full" style="width: ${(occupiedCount / totalMunicipalities * 100).toFixed(1)}%"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        const companyFilter = this.querySelector('#filter-company');
        const segmentFilter = this.querySelector('#filter-segment');
        const statusFilter = this.querySelector('#filter-status');
        const resetBtn = this.querySelector('#filter-reset');
        const companyCards = this.querySelectorAll('[data-company]');

        const applyFilters = () => {
            window.dispatchEvent(new CustomEvent('filtersChanged', {
                detail: {
                    company: companyFilter.value,
                    segment: segmentFilter.value,
                    status: statusFilter.value
                }
            }));
        };

        companyFilter.addEventListener('change', applyFilters);
        segmentFilter.addEventListener('change', applyFilters);
        statusFilter.addEventListener('change', applyFilters);

        resetBtn.addEventListener('click', () => {
            companyFilter.value = '';
            segmentFilter.value = '';
            statusFilter.value = 'todos';
            applyFilters();
        });

        companyCards.forEach(card => {
            card.addEventListener('click', () => {
                companyFilter.value = card.dataset.company;
                applyFilters();
            });
        });
    }
}

customElements.define('custom-filter-panel', CustomFilterPanel);
