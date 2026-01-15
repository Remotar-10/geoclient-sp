// Custom Filter Panel Component - v2.9.26 (Bug fix - LUBMULTI removida)
class CustomFilterPanel extends HTMLElement {
    constructor() {
        super();
        // ✅ Define todas as empresas que devem aparecer (5 empresas)
        this.allCompanies = ['CDO', 'SUPORTE', 'WAUX', 'MONTEBELLO', 'HIRATA'];
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
    }

    // ✅ Função auxiliar para contar clientes por empresa
    getClientsByCompany(company) {
        if (!window.CLIENTS_DATA || !Array.isArray(window.CLIENTS_DATA)) {
            return [];
        }
        return window.CLIENTS_DATA.filter(c => c.company === company);
    }

    // ✅ Função auxiliar para clientes ativos
    getActiveClients() {
        if (!window.CLIENTS_DATA || !Array.isArray(window.CLIENTS_DATA)) {
            return [];
        }
        return window.CLIENTS_DATA.filter(c => c.status === 'ativo');
    }

    // ✅ Função auxiliar para municípios ocupados
    getOccupiedMunicipalities() {
        if (!window.CLIENTS_DATA || !Array.isArray(window.CLIENTS_DATA)) {
            return [];
        }
        return [...new Set(window.CLIENTS_DATA.map(c => c.municipality))];
    }

    // ✅ Retorna cor da empresa
    getCompanyColor(company) {
        const colors = {
            'CDO': '#ef4444',
            'SUPORTE': '#3b82f6',
            'WAUX': '#10b981',
            'MONTEBELLO': '#f59e0b',
            'HIRATA': '#8b5cf6'
        };
        return colors[company] || '#6b7280';
    }

    render() {
        // ✅ Contadores por empresa (5 empresas)
        const companyCounts = {};
        this.allCompanies.forEach(company => {
            companyCounts[company] = this.getClientsByCompany(company).length;
        });

        const activeCount = this.getActiveClients().length;
        const occupiedCount = this.getOccupiedMunicipalities().length;
        const totalMunicipalities = 645; // Total de municípios de SP
        const totalClients = window.CLIENTS_DATA ? window.CLIENTS_DATA.length : 0;

        this.innerHTML = `
            <!-- ✅ SEÇÃO: EMPRESAS (Estatísticas) -->
            <div class="bg-white rounded-lg shadow p-6">
                <h2 class="text-xl font-bold mb-4">Empresas</h2>
                <div class="space-y-3">
                    ${this.allCompanies.map(company => `
                        <div class="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer" data-company="${company}">
                            <div class="w-4 h-4 rounded-full mr-3" style="background: ${this.getCompanyColor(company)};"></div>
                            <div>
                                <span class="font-medium text-sm">${company}</span>
                                <div class="text-xs text-gray-500">${companyCounts[company]} clientes</div>
                            </div>
                        </div>
                    `).join('')}
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
                            <div class="bg-green-600 h-2 rounded-full" style="width: ${totalClients > 0 ? (activeCount / totalClients * 100) : 0}%"></div>
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