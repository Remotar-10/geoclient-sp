// 📊 GeoClient SP - Dynamic Sidebar Stats
// v1.0 - Atualiza estatísticas da sidebar em tempo real

class SidebarStats {
    constructor(app) {
        this.app = app;
        this.updateInterval = null;
        console.log('✅ SidebarStats initialized');
    }

    init() {
        this.updateStats();
        // Atualiza a cada 5 segundos
        this.updateInterval = setInterval(() => {
            this.updateStats();
        }, 5000);
    }

    updateStats() {
        this.updateInitialCompanies();
        this.updateQuickStats();
    }

    updateInitialCompanies() {
        const container = document.querySelector('.space-y-3');
        if (!container) return;

        const companies = ['CDO', 'SUPORTE', 'WAUX', 'MONTEBELLO', 'HIRATA'];
        const companyColors = {
            'CDO': '#ef4444',
            'SUPORTE': '#3b82f6',
            'WAUX': '#10b981',
            'MONTEBELLO': '#f59e0b',
            'HIRATA': '#8b5cf6'
        };

        const companyStats = {};
        companies.forEach(company => {
            companyStats[company] = {
                clients: 0,
                cities: 0
            };
        });

        // Conta clientes por empresa
        if (this.app.clients) {
            this.app.clients.forEach(client => {
                if (client.company && companyStats[client.company]) {
                    companyStats[client.company].clients++;
                }
            });
        }

        // Conta cidades por empresa
        if (this.app.occupiedCities) {
            Object.entries(this.app.occupiedCities).forEach(([city, companiesList]) => {
                if (Array.isArray(companiesList)) {
                    companiesList.forEach(company => {
                        if (companyStats[company]) {
                            companyStats[company].cities++;
                        }
                    });
                }
            });
        }

        // Atualiza HTML - mostra apenas empresas com dados
        let html = '';
        Object.entries(companyStats).forEach(([company, stats]) => {
            if (stats.clients > 0 || stats.cities > 0) {
                const color = companyColors[company] || '#6b7280';
                html += `
                    <div class="flex items-center p-2 hover:bg-gray-50 rounded" style="transition: all 0.2s;">
                        <div class="w-4 h-4 rounded-full mr-3" style="background: ${color};"></div>
                        <div style="flex: 1;">
                            <span class="font-medium" style="font-size: 14px;">${company}</span>
                            <div class="text-sm text-gray-500">
                                ${stats.clients} cliente${stats.clients !== 1 ? 's' : ''} • ${stats.cities} cidade${stats.cities !== 1 ? 's' : ''}
                            </div>
                        </div>
                    </div>
                `;
            }
        });

        // Se não houver dados, mostra mensagem
        if (html === '') {
            html = `
                <div class="text-center py-4 text-gray-400" style="font-size: 13px;">
                    <div style="font-size: 32px; margin-bottom: 8px;">🏢</div>
                    <div>Nenhuma empresa cadastrada ainda</div>
                </div>
            `;
        }

        container.innerHTML = html;
    }

    updateQuickStats() {
        // Total de clientes ativos
        const activeClients = this.app.clients ? 
            this.app.clients.filter(c => c.status === 'active').length : 0;
        const totalClients = this.app.clients ? this.app.clients.length : 0;
        const activePercentage = totalClients > 0 ? Math.round((activeClients / totalClients) * 100) : 0;

        const activeClientElement = document.querySelector('.space-y-4 > div:first-child');
        if (activeClientElement) {
            activeClientElement.innerHTML = `
                <div class="flex justify-between mb-1">
                    <span class="text-sm font-medium">Active Clients</span>
                    <span class="text-sm font-bold text-green-600">${activeClients}</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="bg-green-600 h-2 rounded-full" style="width: ${activePercentage}%; transition: width 0.5s;"></div>
                </div>
            `;
        }

        // Total de municípios ocupados
        const occupiedMunicipalities = this.app.occupiedCities ? 
            Object.keys(this.app.occupiedCities).length : 0;
        const totalMunicipalities = 645; // Total de municípios SP
        const occupiedPercentage = Math.round((occupiedMunicipalities / totalMunicipalities) * 100);

        const municipalitiesElement = document.querySelector('.space-y-4 > div:last-child');
        if (municipalitiesElement) {
            municipalitiesElement.innerHTML = `
                <div class="flex justify-between mb-1">
                    <span class="text-sm font-medium">Occupied Municipalities</span>
                    <span class="text-sm font-bold text-blue-600">${occupiedMunicipalities}</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="bg-blue-600 h-2 rounded-full" style="width: ${occupiedPercentage}%; transition: width 0.5s;"></div>
                </div>
            `;
        }
    }

    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }
}

// ✅ EXPÕE GLOBALMENTE
window.SidebarStats = SidebarStats;
console.log('✅ SidebarStats class loaded');