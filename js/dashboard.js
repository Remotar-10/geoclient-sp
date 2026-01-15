// 📊 GeoClient SP - Dashboard Professional v2.1
// ✅ COMPATÍVEL COM MAIN.JS V3.0.1
// 🐛 FIX: Mostra todas as 6 empresas (incluindo LUBMULTI)

class Dashboard {
    constructor(app) {
        this.app = app;
        this.modal = null;
        this.charts = {};
        console.log('✅ Dashboard v2.1 initialized');
    }

    showDashboard() {
        if (!this.modal) {
            this.createDashboardModal();
        }
        
        this.renderDashboard();
        this.modal.style.display = 'block';
        
        setTimeout(() => {
            this.renderCharts();
        }, 100);
        
        if (window.activityLogger) {
            window.activityLogger.logDashboardOpened();
        }
    }

    hideDashboard() {
        if (this.modal) {
            this.modal.style.display = 'none';
        }
        
        Object.values(this.charts).forEach(chart => {
            if (chart) chart.destroy();
        });
        this.charts = {};
    }

    createDashboardModal() {
        const existingModal = document.getElementById('dashboard-modal-professional');
        if (existingModal) existingModal.remove();
        
        this.modal = document.createElement('div');
        this.modal.id = 'dashboard-modal-professional';
        this.modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.6);
            display: none;
            z-index: 10000;
            overflow-y: auto;
            padding: 20px;
            backdrop-filter: blur(4px);
        `;
        document.body.appendChild(this.modal);
        
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hideDashboard();
            }
        });
    }

    getStats() {
        const cities = this.app.occupiedCities || {};
        const clients = this.app.clients || [];
        
        const totalCities = Object.keys(cities).length;
        const totalClients = clients.length;
        
        // 🐛 FIX: Inicializa TODAS as 6 empresas com 0
        const allCompanies = ['CDO', 'SUPORTE', 'WAUX', 'MONTEBELLO', 'HIRATA', 'LUBMULTI'];
        const clientsByCompany = {};
        allCompanies.forEach(company => {
            clientsByCompany[company] = 0;
        });
        
        // Conta clientes por empresa
        clients.forEach(client => {
            const company = client.company || 'Sem Empresa';
            if (clientsByCompany.hasOwnProperty(company)) {
                clientsByCompany[company]++;
            } else {
                clientsByCompany[company] = 1;
            }
        });
        
        const clientsBySegment = {};
        clients.forEach(client => {
            const segment = client.segment || 'Sem Segmento';
            clientsBySegment[segment] = (clientsBySegment[segment] || 0) + 1;
        });
        
        const activeClients = clients.filter(c => c.status === 'active').length;
        const inactiveClients = clients.filter(c => c.status === 'inactive').length;
        
        // 🐛 FIX: Inicializa TODAS as 6 empresas com 0 cidades
        const citiesByCompany = {};
        allCompanies.forEach(company => {
            citiesByCompany[company] = 0;
        });
        
        // Conta cidades por empresa
        Object.entries(cities).forEach(([city, companies]) => {
            if (Array.isArray(companies)) {
                companies.forEach(company => {
                    if (citiesByCompany.hasOwnProperty(company)) {
                        citiesByCompany[company]++;
                    } else {
                        citiesByCompany[company] = 1;
                    }
                });
            }
        });
        
        return {
            totalCities,
            totalClients,
            clientsByCompany,
            clientsBySegment,
            activeClients,
            inactiveClients,
            citiesByCompany
        };
    }

    renderDashboard() {
        const stats = this.getStats();
        
        let modalContent = `
            <div style="max-width: 1400px; margin: 40px auto; background: white; border-radius: 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); overflow: hidden;">
                <!-- HEADER -->
                <div style="background: linear-gradient(135deg, #9333ea 0%, #6366f1 100%); padding: 40px; color: white; position: relative;">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div>
                            <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 12px;">
                                <div style="width: 56px; height: 56px; background: rgba(255,255,255,0.2); border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 32px;">📊</div>
                                <div>
                                    <h2 style="margin: 0; font-size: 36px; font-weight: 800;">Dashboard</h2>
                                    <p style="margin: 0; opacity: 0.9; font-size: 16px;">Análise completa de territórios e clientes</p>
                                </div>
                            </div>
                            <div style="background: rgba(255,255,255,0.15); padding: 12px 20px; border-radius: 12px; display: inline-block; margin-top: 8px;">
                                <div style="font-size: 14px; opacity: 0.9;">Última atualização</div>
                                <div style="font-size: 18px; font-weight: 700;">${new Date().toLocaleString('pt-BR')}</div>
                            </div>
                        </div>
                        <button onclick="window.dashboard.hideDashboard();" style="
                            background: rgba(255,255,255,0.2);
                            border: 2px solid rgba(255,255,255,0.4);
                            color: white;
                            width: 48px;
                            height: 48px;
                            border-radius: 12px;
                            font-size: 28px;
                            cursor: pointer;
                            transition: all 0.2s;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-weight: 300;
                        " onmouseover="this.style.background='rgba(255,255,255,0.3)';" onmouseout="this.style.background='rgba(255,255,255,0.2)';">×</button>
                    </div>
                </div>
                
                <!-- CONTENT -->
                <div style="padding: 40px;">
                    <!-- CARDS DE ESTATÍSTICAS -->
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 24px; margin-bottom: 40px;">
                        <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 28px; border-radius: 16px; color: white; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);">
                            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                                <div style="font-size: 14px; font-weight: 600; opacity: 0.9; text-transform: uppercase; letter-spacing: 0.5px;">Cidades Ocupadas</div>
                                <div style="width: 40px; height: 40px; background: rgba(255,255,255,0.2); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px;">🏙️</div>
                            </div>
                            <div style="font-size: 48px; font-weight: 800; margin-bottom: 8px;">${stats.totalCities}</div>
                            <div style="font-size: 13px; opacity: 0.85;">Municípios com presença</div>
                        </div>
                        
                        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 28px; border-radius: 16px; color: white; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
                            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                                <div style="font-size: 14px; font-weight: 600; opacity: 0.9; text-transform: uppercase; letter-spacing: 0.5px;">Total de Clientes</div>
                                <div style="width: 40px; height: 40px; background: rgba(255,255,255,0.2); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px;">👥</div>
                            </div>
                            <div style="font-size: 48px; font-weight: 800; margin-bottom: 8px;">${stats.totalClients}</div>
                            <div style="font-size: 13px; opacity: 0.85;">Clientes cadastrados</div>
                        </div>
                        
                        <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 28px; border-radius: 16px; color: white; box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);">
                            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                                <div style="font-size: 14px; font-weight: 600; opacity: 0.9; text-transform: uppercase; letter-spacing: 0.5px;">Clientes Ativos</div>
                                <div style="width: 40px; height: 40px; background: rgba(255,255,255,0.2); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px;">✅</div>
                            </div>
                            <div style="font-size: 48px; font-weight: 800; margin-bottom: 8px;">${stats.activeClients}</div>
                            <div style="font-size: 13px; opacity: 0.85;">${stats.totalClients > 0 ? Math.round((stats.activeClients / stats.totalClients) * 100) : 0}% do total</div>
                        </div>
                        
                        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 28px; border-radius: 16px; color: white; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);">
                            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                                <div style="font-size: 14px; font-weight: 600; opacity: 0.9; text-transform: uppercase; letter-spacing: 0.5px;">Clientes Inativos</div>
                                <div style="width: 40px; height: 40px; background: rgba(255,255,255,0.2); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px;">⏸️</div>
                            </div>
                            <div style="font-size: 48px; font-weight: 800; margin-bottom: 8px;">${stats.inactiveClients}</div>
                            <div style="font-size: 13px; opacity: 0.85;">${stats.totalClients > 0 ? Math.round((stats.inactiveClients / stats.totalClients) * 100) : 0}% do total</div>
                        </div>
                    </div>
                    
                    <!-- GRÁFICOS -->
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(450px, 1fr)); gap: 32px; margin-bottom: 32px;">
                        <div style="background: #f9fafb; padding: 28px; border-radius: 16px; border: 2px solid #e5e7eb;">
                            <h3 style="margin: 0 0 24px 0; font-size: 18px; font-weight: 700; color: #1f2937;">📊 Clientes por Empresa</h3>
                            <div style="position: relative; height: 300px;">
                                <canvas id="chart-clients-by-company"></canvas>
                            </div>
                        </div>
                        
                        <div style="background: #f9fafb; padding: 28px; border-radius: 16px; border: 2px solid #e5e7eb;">
                            <h3 style="margin: 0 0 24px 0; font-size: 18px; font-weight: 700; color: #1f2937;">📈 Clientes por Segmento</h3>
                            <div style="position: relative; height: 300px;">
                                ${Object.keys(stats.clientsBySegment).length > 0 ? 
                                    '<canvas id="chart-clients-by-segment"></canvas>' : 
                                    '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #9ca3af;">Nenhum cliente cadastrado</div>'
                                }
                            </div>
                        </div>
                    </div>
                    
                    <!-- TABELA DE TODAS AS EMPRESAS -->
                    <div style="background: #f9fafb; padding: 28px; border-radius: 16px; border: 2px solid #e5e7eb; margin-bottom: 32px;">
                        <h3 style="margin: 0 0 24px 0; font-size: 18px; font-weight: 700; color: #1f2937;">🏬 Distribuição por Empresa (Todas as 6)</h3>
                        <div style="overflow-x: auto;">
                            <table style="width: 100%; border-collapse: separate; border-spacing: 0;">
                                <thead>
                                    <tr style="background: white;">
                                        <th style="padding: 16px; text-align: left; font-size: 13px; font-weight: 700; color: #6b7280; text-transform: uppercase; border-bottom: 2px solid #e5e7eb;">Empresa</th>
                                        <th style="padding: 16px; text-align: center; font-size: 13px; font-weight: 700; color: #6b7280; text-transform: uppercase; border-bottom: 2px solid #e5e7eb;">Cidades</th>
                                        <th style="padding: 16px; text-align: center; font-size: 13px; font-weight: 700; color: #6b7280; text-transform: uppercase; border-bottom: 2px solid #e5e7eb;">Clientes</th>
                                        <th style="padding: 16px; text-align: center; font-size: 13px; font-weight: 700; color: #6b7280; text-transform: uppercase; border-bottom: 2px solid #e5e7eb;">% Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${Object.entries(stats.clientsByCompany).sort((a, b) => b[1] - a[1]).map(([company, count], index) => {
                                        const cities = stats.citiesByCompany[company] || 0;
                                        const percentage = stats.totalClients > 0 ? Math.round((count / stats.totalClients) * 100) : 0;
                                        const bgColor = index % 2 === 0 ? 'white' : '#f9fafb';
                                        
                                        // Cores das empresas
                                        const companyColors = {
                                            'CDO': '#ef4444',
                                            'SUPORTE': '#3b82f6',
                                            'WAUX': '#10b981',
                                            'MONTEBELLO': '#f59e0b',
                                            'HIRATA': '#8b5cf6',
                                            'LUBMULTI': '#6b7280'
                                        };
                                        const companyColor = companyColors[company] || '#6b7280';
                                        
                                        return `
                                            <tr style="background: ${bgColor};">
                                                <td style="padding: 16px; font-weight: 600; color: #1f2937; border-bottom: 1px solid #f3f4f6;">
                                                    <div style="display: flex; align-items: center; gap: 12px;">
                                                        <div style="width: 32px; height: 32px; background: ${companyColor}; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 14px;">${company.substring(0, 2).toUpperCase()}</div>
                                                        ${company}
                                                    </div>
                                                </td>
                                                <td style="padding: 16px; text-align: center; font-weight: 600; color: ${cities > 0 ? '#3b82f6' : '#9ca3af'}; border-bottom: 1px solid #f3f4f6;">${cities}</td>
                                                <td style="padding: 16px; text-align: center; font-weight: 700; font-size: 18px; color: ${count > 0 ? '#10b981' : '#9ca3af'}; border-bottom: 1px solid #f3f4f6;">${count}</td>
                                                <td style="padding: 16px; text-align: center; border-bottom: 1px solid #f3f4f6;">
                                                    ${count > 0 ? `
                                                    <div style="display: inline-flex; align-items: center; gap: 8px; background: #10b98120; padding: 6px 12px; border-radius: 8px;">
                                                        <div style="font-weight: 700; color: #10b981;">${percentage}%</div>
                                                        <div style="width: 80px; height: 6px; background: #e5e7eb; border-radius: 3px; overflow: hidden;">
                                                            <div style="width: ${percentage}%; height: 100%; background: #10b981;"></div>
                                                        </div>
                                                    </div>
                                                    ` : '<span style="color: #9ca3af; font-weight: 600;">-</span>'}
                                                </td>
                                            </tr>
                                        `;
                                    }).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    <!-- BOTÕES -->
                    <div style="display: flex; gap: 16px; justify-content: center;">
                        <button onclick="window.dashboard.refreshDashboard()" style="
                            padding: 14px 28px;
                            background: linear-gradient(135deg, #3b82f6, #2563eb);
                            color: white;
                            border: none;
                            border-radius: 10px;
                            font-weight: 700;
                            font-size: 15px;
                            cursor: pointer;
                            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
                            transition: all 0.2s;
                        " onmouseover="this.style.transform='translateY(-2px)';" onmouseout="this.style.transform='translateY(0)';">
                            🔄 Atualizar
                        </button>
                        
                        <button onclick="window.dashboard.hideDashboard()" style="
                            padding: 14px 28px;
                            background: #f3f4f6;
                            color: #374151;
                            border: 2px solid #d1d5db;
                            border-radius: 10px;
                            font-weight: 700;
                            font-size: 15px;
                            cursor: pointer;
                            transition: all 0.2s;
                        " onmouseover="this.style.background='#e5e7eb';" onmouseout="this.style.background='#f3f4f6';">
                            Fechar
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        this.modal.innerHTML = modalContent;
    }

    renderCharts() {
        const stats = this.getStats();
        
        if (typeof Chart === 'undefined') {
            console.warn('⚠️ Chart.js não carregado');
            return;
        }
        
        Object.values(this.charts).forEach(chart => {
            if (chart) chart.destroy();
        });
        
        // Cores das empresas (mesmas do main.js)
        const companyColors = {
            'CDO': '#ef4444',
            'SUPORTE': '#3b82f6',
            'WAUX': '#10b981',
            'MONTEBELLO': '#f59e0b',
            'HIRATA': '#8b5cf6',
            'LUBMULTI': '#6b7280'
        };
        
        // GRÁFICO 1: Pizza - Clientes por Empresa (TODAS as 6)
        const chartClientsCompany = document.getElementById('chart-clients-by-company');
        if (chartClientsCompany) {
            const ctx1 = chartClientsCompany.getContext('2d');
            const companies = Object.keys(stats.clientsByCompany);
            const colors = companies.map(c => companyColors[c] || '#6b7280');
            
            this.charts.clientsByCompany = new Chart(ctx1, {
                type: 'doughnut',
                data: {
                    labels: companies,
                    datasets: [{
                        data: Object.values(stats.clientsByCompany),
                        backgroundColor: colors,
                        borderWidth: 3,
                        borderColor: '#ffffff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                padding: 15,
                                font: { size: 13, weight: '600' },
                                color: '#374151'
                            }
                        },
                        tooltip: {
                            backgroundColor: '#1f2937',
                            padding: 12,
                            titleFont: { size: 14, weight: '700' },
                            bodyFont: { size: 13 },
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.parsed;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                                    return `${label}: ${value} clientes ${total > 0 ? `(${percentage}%)` : ''}`;
                                }
                            }
                        }
                    }
                }
            });
        }
        
        // GRÁFICO 2: Barras - Clientes por Segmento
        const chartClientsSegment = document.getElementById('chart-clients-by-segment');
        if (chartClientsSegment && Object.keys(stats.clientsBySegment).length > 0) {
            const ctx2 = chartClientsSegment.getContext('2d');
            this.charts.clientsBySegment = new Chart(ctx2, {
                type: 'bar',
                data: {
                    labels: Object.keys(stats.clientsBySegment),
                    datasets: [{
                        label: 'Clientes',
                        data: Object.values(stats.clientsBySegment),
                        backgroundColor: '#3b82f6',
                        borderRadius: 8
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: '#1f2937',
                            padding: 12
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: { stepSize: 1, font: { size: 12, weight: '600' }, color: '#6b7280' },
                            grid: { color: '#f3f4f6', drawBorder: false }
                        },
                        x: {
                            ticks: { font: { size: 12, weight: '600' }, color: '#374151' },
                            grid: { display: false }
                        }
                    }
                }
            });
        }
    }

    refreshDashboard() {
        this.renderDashboard();
        setTimeout(() => this.renderCharts(), 100);
        
        if (this.app.showToast) {
            this.app.showToast('✅ Dashboard atualizado!', 'success');
        }
    }
}

window.Dashboard = Dashboard;
console.log('✅ Dashboard v2.1 loaded - FIX: Mostra todas as 6 empresas (incluindo LUBMULTI)');
