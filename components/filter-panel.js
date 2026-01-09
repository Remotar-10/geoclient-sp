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

    render() {
        const companies = [...new Set(CLIENTS_DATA.map(c => c.company))];
        const segments = [...new Set(CLIENTS_DATA.map(c => c.segment))];

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
                        <div class="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
                        <div>
                            <span class="font-medium text-sm">CDO</span>
                            <div class="text-xs text-gray-500">${getClientsByCompany("CDO").length} clientes</div>
                        </div>
                    </div>
                    <div class="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer" data-company="SUPPORT ABCD">
                        <div class="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                        <div>
                            <span class="font-medium text-sm">SUPPORT ABCD</span>
                            <div class="text-xs text-gray-500">${getClientsByCompany("SUPPORT ABCD").length} clientes</div>
                        </div>
                    </div>
                    <div class="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer" data-company="WAUX">
                        <div class="w-4 h-4 bg-yellow-500 rounded-full mr-3"></div>
                        <div>
                            <span class="font-medium text-sm">WAUX</span>
                            <div class="text-xs text-gray-500">${getClientsByCompany("WAUX").length} clientes</div>
                        </div>
                    </div>
                    <div class="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer" data-company="MONTEBELLO">
                        <div class="w-4 h-4 bg-purple-500 rounded-full mr-3"></div>
                        <div>
                            <span class="font-medium text-sm">MONTEBELLO</span>
                            <div class="text-xs text-gray-500">${getClientsByCompany("MONTEBELLO").length} clientes</div>
                        </div>
                    </div>
                    <div class="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer" data-company="HIRATA">
                        <div class="w-4 h-4 bg-red-500 rounded-full mr-3"></div>
                        <div>
                            <span class="font-medium text-sm">HIRATA</span>
                            <div class="text-xs text-gray-500">${getClientsByCompany("HIRATA").length} clientes</div>
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
                            <span class="text-sm font-bold text-green-600">${getActiveClients().length}</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2">
                            <div class="bg-green-600 h-2 rounded-full" style="width: ${(getActiveClients().length / CLIENTS_DATA.length * 100)}%"></div>
                        </div>
                    </div>
                    <div>
                        <div class="flex justify-between mb-1">
                            <span class="text-sm font-medium">Municípios Ocupados</span>
                            <span class="text-sm font-bold text-blue-600">${getOccupiedMunicipalities().length}</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2">
                            <div class="bg-blue-600 h-2 rounded-full" style="width: ${(getOccupiedMunicipalities().length / 20 * 100)}%"></div>
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
