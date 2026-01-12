// GeoClient SP - VERSÃO PREMIUM v2.0
// Sistema de cliques: 1=zoom (sem marcar) | 2=marca + dropdown | Botão direito=remover
// ✨ NOVO: LocalStorage + CSV + Busca

class GeoClientApp {
    constructor() {
        this.map = null;
        this.currentFilters = { company: '', segment: '', status: 'todos' };
        this.currentClients = [];
        this.markers = {};
        this.geoJsonLayer = null;
        this.markedCities = {};
        this.cityLayers = {};
        this.contextMenu = null;
        this.tooltip = null;
        this.companyDropdown = null;
        this.dashboardModal = null;
        this.isDropdownOpen = false;
        this.currentCityName = null;
        this.homeButton = null;
        this.searchBox = null; // ✨ NOVO
        
        this.availableCompanies = ['CDO', 'SUPORTE', 'WAUX', 'MONTEBELLO', 'HIRATA'];
        this.totalMunicipalitiesSP = 645;
        
        this.clickCount = 0;
        this.clickTimer = null;
        this.clickTimeout = 400;
        
        this.initialView = {
            center: [-22.5, -49.2],
            zoom: 7.2
        };
        
        // 💾 NOVO: Carrega dados do localStorage
        this.loadFromLocalStorage();
    }

    // 💾 ==================== LOCALSTORAGE ====================
    
    loadFromLocalStorage() {
        try {
            const saved = localStorage.getItem('geoclient-marked-cities');
            if (saved) {
                this.markedCities = JSON.parse(saved);
                console.log(`💾 ${Object.keys(this.markedCities).length} cidades restauradas do localStorage`);
            }
        } catch (error) {
            console.error('❌ Erro ao carregar localStorage:', error);
        }
    }
    
    saveToLocalStorage() {
        try {
            localStorage.setItem('geoclient-marked-cities', JSON.stringify(this.markedCities));
            console.log('💾 Dados salvos no localStorage');
            this.showToast('💾 Dados salvos automaticamente!', 'success');
        } catch (error) {
            console.error('❌ Erro ao salvar localStorage:', error);
            this.showToast('❌ Erro ao salvar dados', 'error');
        }
    }
    
    clearAllData() {
        if (!confirm('⚠️ Tem certeza que deseja limpar TODOS os dados?\n\nIsso vai remover todas as cidades marcadas e não pode ser desfeito!')) {
            return;
        }
        
        // Limpa tudo
        this.markedCities = {};
        localStorage.removeItem('geoclient-marked-cities');
        
        // Recarrega mapa
        this.loadMunicipalitiesBoundaries();
        
        console.log('🗑️ Todos os dados foram limpos');
        this.showToast('🗑️ Todos os dados foram limpos!', 'info');
    }
    
    // 🔔 Toast de notificação
    showToast(message, type = 'success') {
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            info: '#3b82f6',
            warning: '#f59e0b'
        };
        
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: ${colors[type]};
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10003;
            font-size: 14px;
            font-weight: 600;
            animation: slideIn 0.3s ease;
        `;
        toast.textContent = message;
        
        // Adiciona animação
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(400px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(400px); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(toast);
        
        // Remove após 3s
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    
    // 📤 ==================== EXPORTAR CSV REAL ====================
    
    exportCSV() {
        if (Object.keys(this.markedCities).length === 0) {
            alert('⚠️ Nenhuma cidade marcada para exportar!\n\n🔍 Clique 2x em uma cidade para marcá-la.');
            return;
        }
        
        // Cabeçalho CSV
        let csv = 'Cidade,Empresas,Total de Empresas,Cores\n';
        
        // Dados
        Object.entries(this.markedCities).forEach(([city, info]) => {
            const empresas = info.companies.join(' | ');
            const total = info.companies.length;
            const cores = info.companies.map(c => this.getCompanyColor(c)).join(' | ');
            
            csv += `"${city}","${empresas}",${total},"${cores}"\n`;
        });
        
        // Cria blob com BOM para UTF-8 (Excel compatibility)
        const BOM = '\uFEFF';
        const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        // Download
        const a = document.createElement('a');
        a.href = url;
        a.download = `geoclient_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        
        console.log('📥 CSV exportado');
        this.showToast('📥 CSV exportado com sucesso!', 'success');
    }
    
    exportJSON() {
        if (Object.keys(this.markedCities).length === 0) {
            alert('⚠️ Nenhuma cidade marcada para exportar!\n\n🔍 Clique 2x em uma cidade para marcá-la.');
            return;
        }
        
        const data = Object.entries(this.markedCities).map(([city, info]) => ({
            cidade: city,
            empresas: info.companies.join(', '),
            total_empresas: info.companies.length,
            cores: info.companies.map(c => this.getCompanyColor(c))
        }));
        
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `geoclient_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        console.log('📥 JSON exportado');
        this.showToast('📥 JSON exportado com sucesso!', 'success');
    }
    
    // 🔍 ==================== BUSCA DE CIDADE ====================
    
    createSearchBox() {
        // Remove search box existente
        const existingSearch = document.getElementById('city-search-box');
        if (existingSearch) existingSearch.remove();
        
        // Cria container de busca
        this.searchBox = document.createElement('div');
        this.searchBox.id = 'city-search-box';
        this.searchBox.style.cssText = `
            position: absolute;
            top: 10px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 1000;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            padding: 8px;
            display: flex;
            align-items: center;
            gap: 8px;
            min-width: 350px;
        `;
        
        // Input de busca
        const input = document.createElement('input');
        input.id = 'city-search-input';
        input.type = 'text';
        input.placeholder = '🔍 Buscar cidade...';
        input.style.cssText = `
            flex: 1;
            border: none;
            outline: none;
            font-size: 15px;
            padding: 8px;
        `;
        
        // Botão limpar
        const clearBtn = document.createElement('button');
        clearBtn.innerHTML = '×';
        clearBtn.style.cssText = `
            background: #f3f4f6;
            border: none;
            border-radius: 4px;
            width: 28px;
            height: 28px;
            cursor: pointer;
            font-size: 20px;
            color: #6b7280;
            display: none;
        `;
        
        clearBtn.addEventListener('click', () => {
            input.value = '';
            clearBtn.style.display = 'none';
            this.hideSearchResults();
        });
        
        // Lista de resultados
        const results = document.createElement('div');
        results.id = 'search-results';
        results.style.cssText = `
            position: absolute;
            top: calc(100% + 4px);
            left: 0;
            right: 0;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            max-height: 300px;
            overflow-y: auto;
            display: none;
        `;
        
        // Event listeners
        input.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            clearBtn.style.display = query ? 'block' : 'none';
            
            if (query.length >= 2) {
                this.performSearch(query, results);
            } else {
                this.hideSearchResults(results);
            }
        });
        
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                input.value = '';
                clearBtn.style.display = 'none';
                this.hideSearchResults(results);
            }
        });
        
        this.searchBox.appendChild(input);
        this.searchBox.appendChild(clearBtn);
        this.searchBox.appendChild(results);
        
        const mapElement = document.getElementById('map');
        if (mapElement) {
            mapElement.appendChild(this.searchBox);
            console.log('✅ Search box criado');
        }
    }
    
    performSearch(query, resultsContainer) {
        // Normaliza query (remove acentos, lowercase)
        const normalize = (str) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        const normalizedQuery = normalize(query);
        
        // Busca em todas as cidades
        const allCities = Object.keys(this.cityLayers);
        const matches = allCities
            .filter(city => normalize(city).includes(normalizedQuery))
            .slice(0, 10); // Limita a 10 resultados
        
        if (matches.length === 0) {
            resultsContainer.innerHTML = `
                <div style="padding: 20px; text-align: center; color: #9ca3af;">
                    🔍 Nenhuma cidade encontrada para "${query}"
                </div>
            `;
            resultsContainer.style.display = 'block';
            return;
        }
        
        // Renderiza resultados
        resultsContainer.innerHTML = matches.map(city => {
            const cityData = this.markedCities[city];
            const hasCompany = cityData && cityData.companies.length > 0;
            const color = hasCompany ? this.getCompanyColor(cityData.companies[0]) : '#9ca3af';
            const status = hasCompany ? cityData.companies[0] : 'Disponível';
            
            return `
                <div onclick="window.app.searchSelectCity('${city}');"
                     style="
                        padding: 12px 16px;
                        cursor: pointer;
                        border-bottom: 1px solid #f3f4f6;
                        transition: background 0.15s;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                     "
                     onmouseover="this.style.background='#f9fafb';"
                     onmouseout="this.style.background='white';">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <span style="
                            display: inline-block;
                            width: 10px;
                            height: 10px;
                            background: ${color};
                            border-radius: 50%;
                        "></span>
                        <span style="font-weight: 600; color: #1f2937;">${city}</span>
                    </div>
                    <span style="font-size: 12px; color: #6b7280;">${status}</span>
                </div>
            `;
        }).join('');
        
        resultsContainer.style.display = 'block';
    }
    
    searchSelectCity(cityName) {
        const layer = this.cityLayers[cityName];
        if (!layer) return;
        
        // Zoom na cidade
        const bounds = layer.getBounds();
        this.map.flyToBounds(bounds, {
            padding: [50, 50],
            duration: 1
        });
        
        // Destaca temporariamente
        const originalStyle = {
            weight: layer.options.weight,
            color: layer.options.color,
            fillOpacity: layer.options.fillOpacity
        };
        
        layer.setStyle({
            weight: 4,
            color: '#3b82f6',
            fillOpacity: 0.8
        });
        
        setTimeout(() => {
            this.geoJsonLayer.resetStyle(layer);
        }, 2000);
        
        // Limpa busca
        const input = document.getElementById('city-search-input');
        if (input) input.value = '';
        this.hideSearchResults();
        
        console.log(`🔍 Busca: Zoom em ${cityName}`);
    }
    
    hideSearchResults(resultsContainer) {
        const results = resultsContainer || document.getElementById('search-results');
        if (results) results.style.display = 'none';
    }

    // ==================== INIT ====================

    init() {
        console.log('🗺️ Inicializando GeoClient SP Premium...');
        
        const mapElement = document.getElementById('map');
        if (!mapElement) {
            console.error('❌ Elemento #map não encontrado!');
            return;
        }
        
        console.log('✅ Elemento #map encontrado');
        
        setTimeout(() => {
            this.initMap();
            this.setupEventListeners();
            this.createContextMenu();
            this.createTooltip();
            this.createCompanyDropdown();
            this.createDashboardModal();
            this.createHomeButton();
            this.createSearchBox(); // ✨ NOVO
            this.renderClientTable();
            this.renderMarkers();
            console.log('✅ GeoClient SP iniciado!');
            console.log('🔍 1 CLIQUE = Zoom 3x (SEM marcar)');
            console.log('🔍 2 CLIQUES = Marca cidade + dropdown');
            console.log('🖱️ BOTÃO DIREITO = Remover marcação');
            console.log('👆 HOVER = Mostra empresas da cidade');
            console.log('🏠 BOTÃO HOME = Volta à visualização inicial');
            console.log('📊 DASHBOARD = Estatísticas em tempo real');
            console.log('💾 LOCALSTORAGE = Salva automaticamente');
            console.log('📤 CSV/JSON = Exportação de dados');
            console.log('🔍 BUSCA = Campo de busca no mapa');
        }, 100);
    }

    createDashboardModal() {
        const existingModal = document.getElementById('dashboard-modal');
        if (existingModal) existingModal.remove();
        
        this.dashboardModal = document.createElement('div');
        this.dashboardModal.id = 'dashboard-modal';
        this.dashboardModal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: none;
            z-index: 10002;
            overflow-y: auto;
            padding: 20px;
        `;
        document.body.appendChild(this.dashboardModal);
        
        this.dashboardModal.addEventListener('click', (e) => {
            if (e.target === this.dashboardModal) {
                this.hideDashboard();
            }
        });
        
        console.log('✅ Dashboard modal criado');
    }

    showDashboard() {
        const totalMarked = Object.keys(this.markedCities).length;
        const citiesWithCompanies = Object.values(this.markedCities).filter(c => c.companies.length > 0).length;
        const citiesWaiting = totalMarked - citiesWithCompanies;
        const coveragePercent = ((totalMarked / this.totalMunicipalitiesSP) * 100).toFixed(1);
        
        const companyCounts = {};
        this.availableCompanies.forEach(c => companyCounts[c] = 0);
        
        Object.values(this.markedCities).forEach(city => {
            city.companies.forEach(company => {
                companyCounts[company]++;
            });
        });
        
        const ranking = Object.entries(companyCounts)
            .sort((a, b) => b[1] - a[1])
            .filter(([_, count]) => count > 0);
        
        const recentCities = Object.entries(this.markedCities)
            .filter(([_, data]) => data.companies.length > 0)
            .slice(-5)
            .reverse();
        
        let dashboardContent = `
            <div style="
                max-width: 1200px;
                margin: 40px auto;
                background: white;
                border-radius: 16px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                overflow: hidden;
            ">
                <div style="
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    padding: 32px;
                    color: white;
                ">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h2 style="margin: 0 0 8px 0; font-size: 32px; font-weight: 700;">📊 Dashboard</h2>
                            <p style="margin: 0; opacity: 0.9; font-size: 16px;">Estatísticas em Tempo Real - GeoClient SP</p>
                        </div>
                        <button onclick="window.app.hideDashboard();"
                                style="
                                    background: rgba(255,255,255,0.2);
                                    border: 2px solid rgba(255,255,255,0.5);
                                    color: white;
                                    width: 40px;
                                    height: 40px;
                                    border-radius: 50%;
                                    font-size: 24px;
                                    cursor: pointer;
                                    transition: all 0.2s;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                "
                                onmouseover="this.style.background='rgba(255,255,255,0.3)';"
                                onmouseout="this.style.background='rgba(255,255,255,0.2)';">
                            ×
                        </button>
                    </div>
                </div>
                
                <div style="padding: 32px;">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 32px;">
                        
                        <div style="
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            padding: 24px;
                            border-radius: 12px;
                            color: white;
                            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
                        ">
                            <div style="font-size: 14px; opacity: 0.9; margin-bottom: 8px;">🎯 Total de Cidades</div>
                            <div style="font-size: 42px; font-weight: 700; margin-bottom: 4px;">${totalMarked}</div>
                            <div style="font-size: 12px; opacity: 0.8;">marcadas no mapa</div>
                        </div>
                        
                        <div style="
                            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                            padding: 24px;
                            border-radius: 12px;
                            color: white;
                            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
                        ">
                            <div style="font-size: 14px; opacity: 0.9; margin-bottom: 8px;">✅ Com Empresa</div>
                            <div style="font-size: 42px; font-weight: 700; margin-bottom: 4px;">${citiesWithCompanies}</div>
                            <div style="font-size: 12px; opacity: 0.8;">cidades cobertas</div>
                        </div>
                        
                        <div style="
                            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                            padding: 24px;
                            border-radius: 12px;
                            color: white;
                            box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
                        ">
                            <div style="font-size: 14px; opacity: 0.9; margin-bottom: 8px;">⏳ Aguardando</div>
                            <div style="font-size: 42px; font-weight: 700; margin-bottom: 4px;">${citiesWaiting}</div>
                            <div style="font-size: 12px; opacity: 0.8;">sem empresa</div>
                        </div>
                        
                        <div style="
                            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                            padding: 24px;
                            border-radius: 12px;
                            color: white;
                            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
                        ">
                            <div style="font-size: 14px; opacity: 0.9; margin-bottom: 8px;">📈 Cobertura SP</div>
                            <div style="font-size: 42px; font-weight: 700; margin-bottom: 4px;">${coveragePercent}%</div>
                            <div style="font-size: 12px; opacity: 0.8;">de ${this.totalMunicipalitiesSP} cidades</div>
                        </div>
                        
                    </div>
                    
                    <div style="
                        background: #f9fafb;
                        border-radius: 12px;
                        padding: 24px;
                        margin-bottom: 24px;
                    ">
                        <h3 style="margin: 0 0 20px 0; font-size: 20px; font-weight: 700; color: #1f2937;">🎨 Cidades por Empresa</h3>
                        
                        <div style="display: grid; gap: 12px;">
        `;
        
        this.availableCompanies.forEach(company => {
            const count = companyCounts[company];
            const color = this.getCompanyColor(company);
            const percent = totalMarked > 0 ? ((count / totalMarked) * 100).toFixed(1) : 0;
            
            dashboardContent += `
                <div style="display: flex; align-items: center; gap: 16px;">
                    <div style="min-width: 120px; font-weight: 600; color: #374151; font-size: 14px;">
                        <span style="
                            display: inline-block;
                            width: 12px;
                            height: 12px;
                            background: ${color};
                            border-radius: 3px;
                            margin-right: 8px;
                        "></span>
                        ${company}
                    </div>
                    <div style="flex: 1; background: #e5e7eb; height: 32px; border-radius: 8px; overflow: hidden; position: relative;">
                        <div style="
                            width: ${percent}%;
                            height: 100%;
                            background: ${color};
                            transition: width 0.5s ease;
                            display: flex;
                            align-items: center;
                            justify-content: flex-end;
                            padding-right: 12px;
                        ">
                            ${count > 0 ? `<span style="color: white; font-weight: 600; font-size: 13px;">${count}</span>` : ''}
                        </div>
                    </div>
                    <div style="min-width: 60px; text-align: right; font-weight: 700; color: ${color}; font-size: 14px;">
                        ${percent}%
                    </div>
                </div>
            `;
        });
        
        dashboardContent += `
                        </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
                        
                        <div style="
                            background: white;
                            border: 2px solid #e5e7eb;
                            border-radius: 12px;
                            padding: 24px;
                        ">
                            <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 700; color: #1f2937;">🏆 Ranking de Empresas</h3>
        `;
        
        if (ranking.length === 0) {
            dashboardContent += `
                <div style="text-align: center; padding: 40px; color: #9ca3af;">
                    <div style="font-size: 48px; margin-bottom: 12px;">📄</div>
                    <div style="font-size: 14px;">Nenhuma empresa atribuída ainda</div>
                </div>
            `;
        } else {
            ranking.forEach(([company, count], index) => {
                const color = this.getCompanyColor(company);
                const medals = ['🥇', '🥈', '🥉'];
                const medal = medals[index] || '🎯';
                
                dashboardContent += `
                    <div style="
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        padding: 12px;
                        border-radius: 8px;
                        background: ${index === 0 ? '#fef3c7' : '#f9fafb'};
                        margin-bottom: 8px;
                        border: 2px solid ${index === 0 ? '#fbbf24' : '#e5e7eb'};
                    ">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <span style="font-size: 24px;">${medal}</span>
                            <div>
                                <div style="font-weight: 700; color: ${color}; font-size: 15px;">${company}</div>
                                <div style="font-size: 12px; color: #6b7280;">${count} cidade${count > 1 ? 's' : ''}</div>
                            </div>
                        </div>
                        <div style="
                            background: ${color};
                            color: white;
                            padding: 6px 14px;
                            border-radius: 20px;
                            font-weight: 700;
                            font-size: 16px;
                        ">
                            ${count}
                        </div>
                    </div>
                `;
            });
        }
        
        dashboardContent += `
                        </div>
                        
                        <div style="
                            background: white;
                            border: 2px solid #e5e7eb;
                            border-radius: 12px;
                            padding: 24px;
                        ">
                            <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 700; color: #1f2937;">🕒 Últimas Cidades</h3>
        `;
        
        if (recentCities.length === 0) {
            dashboardContent += `
                <div style="text-align: center; padding: 40px; color: #9ca3af;">
                    <div style="font-size: 48px; margin-bottom: 12px;">📍</div>
                    <div style="font-size: 14px;">Nenhuma cidade com empresa ainda</div>
                </div>
            `;
        } else {
            recentCities.forEach(([cityName, cityData]) => {
                const company = cityData.companies[0];
                const color = this.getCompanyColor(company);
                
                dashboardContent += `
                    <div style="
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        padding: 12px;
                        border-radius: 8px;
                        background: #f9fafb;
                        margin-bottom: 8px;
                        border-left: 4px solid ${color};
                    ">
                        <div style="
                            width: 40px;
                            height: 40px;
                            background: ${color};
                            border-radius: 8px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            color: white;
                            font-weight: 700;
                            font-size: 18px;
                            flex-shrink: 0;
                        ">
                            🎯
                        </div>
                        <div style="flex: 1;">
                            <div style="font-weight: 700; color: #1f2937; font-size: 14px;">${cityName}</div>
                            <div style="font-size: 12px; color: #6b7280;">${company}</div>
                        </div>
                    </div>
                `;
            });
        }
        
        dashboardContent += `
                        </div>
                    </div>
                    
                </div>
            </div>
        `;
        
        this.dashboardModal.innerHTML = dashboardContent;
        this.dashboardModal.style.display = 'block';
        
        console.log('📊 Dashboard aberto');
    }

    hideDashboard() {
        this.dashboardModal.style.display = 'none';
        console.log('❌ Dashboard fechado');
    }

    createHomeButton() {
        const existingButton = document.getElementById('home-button');
        if (existingButton) existingButton.remove();
        
        this.homeButton = document.createElement('button');
        this.homeButton.id = 'home-button';
        this.homeButton.innerHTML = '🏠';
        this.homeButton.title = 'Voltar à visualização inicial';
        this.homeButton.style.cssText = `
            position: absolute;
            bottom: 30px;
            right: 10px;
            z-index: 1000;
            background: white;
            border: 2px solid rgba(0,0,0,0.2);
            border-radius: 4px;
            width: 34px;
            height: 34px;
            font-size: 18px;
            cursor: pointer;
            box-shadow: 0 1px 5px rgba(0,0,0,0.3);
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0;
            line-height: 1;
        `;
        
        this.homeButton.addEventListener('mouseover', () => {
            this.homeButton.style.background = '#f4f4f4';
            this.homeButton.style.transform = 'scale(1.1)';
        });
        
        this.homeButton.addEventListener('mouseout', () => {
            this.homeButton.style.background = 'white';
            this.homeButton.style.transform = 'scale(1)';
        });
        
        this.homeButton.addEventListener('click', () => {
            this.resetMapView();
        });
        
        const mapElement = document.getElementById('map');
        if (mapElement) {
            mapElement.appendChild(this.homeButton);
            console.log('✅ Botão Home flutuante criado');
        }
    }

    resetMapView() {
        this.map.flyTo(this.initialView.center, this.initialView.zoom, {
            duration: 1,
            easeLinearity: 0.25
        });
        
        console.log('🏠 Mapa voltou à visualização inicial');
    }

    createCompanyDropdown() {
        const existingDropdown = document.getElementById('company-dropdown');
        if (existingDropdown) existingDropdown.remove();
        
        this.companyDropdown = document.createElement('div');
        this.companyDropdown.id = 'company-dropdown';
        this.companyDropdown.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            display: none;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 24px rgba(0,0,0,0.15);
            padding: 24px;
            z-index: 10001;
            min-width: 380px;
            max-width: 450px;
        `;
        document.body.appendChild(this.companyDropdown);
        
        document.addEventListener('click', (e) => {
            const clickedInside = this.companyDropdown.contains(e.target);
            const clickedOnMap = e.target.closest('.leaflet-interactive');
            const clickedOnSelectBox = e.target.closest('#company-select-box');
            
            if (!clickedInside && !clickedOnMap && !clickedOnSelectBox) {
                this.hideCompanyDropdown();
            }
        });
        
        console.log('✅ Dropdown de empresas criado');
    }

    showCompanyDropdown(cityName) {
        const cityData = this.markedCities[cityName];
        if (!cityData) return;
        
        this.currentCityName = cityName;
        const availableCompanies = this.availableCompanies.filter(c => !cityData.companies.includes(c));
        
        this.isDropdownOpen = false;
        
        let dropdownContent = `
            <div style="margin-bottom: 20px;">
                <h3 style="margin: 0 0 8px 0; font-size: 22px; color: #1f2937; font-weight: 700;">${cityName}</h3>
                <p style="margin: 0; color: #6b7280; font-size: 14px;">Selecione a empresa para atuar nesta cidade</p>
            </div>
        `;
        
        if (availableCompanies.length === 0) {
            dropdownContent += `
                <div style="
                    text-align: center;
                    padding: 40px 20px;
                    background: #f0fdf4;
                    border-radius: 8px;
                    color: #15803d;
                    font-size: 15px;
                ">
                    ✅ <b>Todas as empresas já foram adicionadas!</b>
                </div>
            `;
        } else {
            dropdownContent += `
                <div style="position: relative; margin-bottom: 16px;">
                    <div id="company-select-box" 
                         onclick="window.app.toggleDropdownList()"
                         style="
                            width: 100%;
                            background: white;
                            border: 2px solid #d1d5db;
                            padding: 14px 16px;
                            border-radius: 4px;
                            cursor: pointer;
                            font-size: 15px;
                            color: #6b7280;
                            display: flex;
                            align-items: center;
                            justify-content: space-between;
                            transition: all 0.2s;
                            user-select: none;
                         "
                         onmouseover="this.style.borderColor='#9ca3af';"
                         onmouseout="this.style.borderColor='#d1d5db';">
                        <span id="select-placeholder" style="color: #6b7280;">Selecione a empresa...</span>
                        <span id="dropdown-arrow" style="
                            font-size: 11px;
                            color: #6b7280;
                            transition: transform 0.2s;
                            margin-left: 10px;
                        ">▼</span>
                    </div>
                    
                    <div id="dropdown-list" style="
                        display: none;
                        position: absolute;
                        top: calc(100% + 4px);
                        left: 0;
                        right: 0;
                        max-height: 260px;
                        overflow-y: auto;
                        background: white;
                        border: 2px solid #d1d5db;
                        border-radius: 4px;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                        z-index: 10;
                    ">
            `;
            
            availableCompanies.forEach((company, index) => {
                const color = this.getCompanyColor(company);
                const isLast = index === availableCompanies.length - 1;
                
                dropdownContent += `
                    <div onclick="window.app.selectCompany('${company}'); event.stopPropagation();"
                         style="
                            width: 100%;
                            background: white;
                            padding: 13px 16px;
                            cursor: pointer;
                            font-size: 15px;
                            color: #374151;
                            transition: background 0.15s;
                            display: flex;
                            align-items: center;
                            gap: 12px;
                            border-bottom: ${isLast ? 'none' : '1px solid #f3f4f6'};
                         "
                         onmouseover="this.style.background='#f9fafb';"
                         onmouseout="this.style.background='white';">
                        <span style="
                            display: inline-block;
                            width: 14px;
                            height: 14px;
                            background: ${color};
                            border-radius: 3px;
                            flex-shrink: 0;
                        "></span>
                        <span style="font-weight: 500;">${company}</span>
                    </div>
                `;
            });
            
            dropdownContent += `
                    </div>
                </div>
            `;
        }
        
        dropdownContent += `
            <button onclick="window.app.hideCompanyDropdown();"
                    style="
                        background: #f3f4f6;
                        border: 1px solid #e5e7eb;
                        padding: 11px 16px;
                        border-radius: 6px;
                        cursor: pointer;
                        width: 100%;
                        font-size: 14px;
                        color: #6b7280;
                        font-weight: 600;
                        transition: all 0.2s;
                    "
                    onmouseover="this.style.background='#e5e7eb';"
                    onmouseout="this.style.background='#f3f4f6';">
                Cancelar
            </button>
        `;
        
        this.companyDropdown.innerHTML = dropdownContent;
        this.companyDropdown.style.display = 'block';
        
        console.log(`📝 Dropdown mostrado: ${cityName} (select fechado)`);
    }

    toggleDropdownList() {
        this.isDropdownOpen = !this.isDropdownOpen;
        const list = document.getElementById('dropdown-list');
        const arrow = document.getElementById('dropdown-arrow');
        const selectBox = document.getElementById('company-select-box');
        
        if (this.isDropdownOpen) {
            list.style.display = 'block';
            arrow.style.transform = 'rotate(180deg)';
            selectBox.style.borderColor = '#3b82f6';
            selectBox.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
            console.log('📖 Dropdown expandido');
        } else {
            list.style.display = 'none';
            arrow.style.transform = 'rotate(0deg)';
            selectBox.style.borderColor = '#d1d5db';
            selectBox.style.boxShadow = 'none';
            console.log('📕 Dropdown fechado');
        }
    }

    selectCompany(company) {
        if (!this.currentCityName) return;
        
        this.addCompanyToCity(this.currentCityName, company);
        this.hideCompanyDropdown();
        
        console.log(`✅ Empresa ${company} selecionada para ${this.currentCityName}`);
    }

    hideCompanyDropdown() {
        this.companyDropdown.style.display = 'none';
        this.isDropdownOpen = false;
        this.currentCityName = null;
        console.log(`❌ Dropdown fechado`);
    }

    createTooltip() {
        const existingTooltip = document.getElementById('city-tooltip');
        if (existingTooltip) existingTooltip.remove();
        
        this.tooltip = document.createElement('div');
        this.tooltip.id = 'city-tooltip';
        this.tooltip.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            display: none;
            background: white;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.25);
            padding: 16px;
            z-index: 9999;
            min-width: 280px;
            max-width: 350px;
            border: 2px solid #e5e7eb;
        `;
        document.body.appendChild(this.tooltip);
        
        console.log('✅ Tooltip criado');
    }

    showTooltip(cityName) {
        const cityData = this.markedCities[cityName];
        
        let tooltipContent = '';
        
        if (!cityData) {
            tooltipContent = `
                <div style="text-align: center;">
                    <b style="font-size: 16px; color: #6b7280;">${cityName}</b><br>
                    <small style="color: #9ca3af; margin-top: 4px; display: block;">⚪ Disponível para marcação</small>
                </div>
            `;
        } else if (cityData.companies.length === 0) {
            tooltipContent = `
                <div style="border-bottom: 2px solid #9ca3af; padding-bottom: 12px; margin-bottom: 12px;">
                    <b style="font-size: 18px; color: #6b7280;">${cityName}</b><br>
                    <small style="color: #f59e0b; margin-top: 4px; display: block;">⏳ Aguardando empresa</small>
                </div>
                <div style="text-align: center; padding: 10px; background: #fef3c7; border-radius: 8px; color: #92400e; font-size: 13px;">
                    ⚠️ Nenhuma empresa atribuída
                </div>
            `;
        } else {
            const color = this.getCompanyColor(cityData.companies[0]);
            tooltipContent = `
                <div style="border-bottom: 2px solid ${color}; padding-bottom: 12px; margin-bottom: 12px;">
                    <b style="font-size: 18px; color: ${color};">${cityName}</b><br>
                    <small style="color: #6b7280; margin-top: 4px; display: block;">🎨 ${cityData.companies.length} empresa(s) atuando</small>
                </div>
            `;
            
            tooltipContent += `<div style="margin-bottom: 8px;">`;
            tooltipContent += `<b style="font-size: 14px; color: #374151; display: block; margin-bottom: 8px;">📍 Empresas:</b>`;
            
            cityData.companies.forEach((company, index) => {
                const companyColor = this.getCompanyColor(company);
                tooltipContent += `
                    <div style="
                        background: ${companyColor};
                        color: white;
                        padding: 8px 12px;
                        border-radius: 8px;
                        margin: 6px 0;
                        font-size: 14px;
                        font-weight: 600;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                    ">
                        <span>${company}</span>
                        <span style="background: rgba(255,255,255,0.3); padding: 2px 8px; border-radius: 4px; font-size: 12px;">#${index + 1}</span>
                    </div>
                `;
            });
            
            tooltipContent += `</div>`;
            
            tooltipContent += `
                <div style="margin-top: 12px; padding: 8px; background: #f0fdf4; border-radius: 6px; text-align: center;">
                    <small style="color: #15803d; font-weight: 600;">✅ Cidade coberta</small>
                </div>
            `;
        }
        
        this.tooltip.innerHTML = tooltipContent;
        this.tooltip.style.display = 'block';
    }

    hideTooltip() {
        this.tooltip.style.display = 'none';
    }

    createContextMenu() {
        const existingMenu = document.getElementById('city-context-menu');
        if (existingMenu) existingMenu.remove();
        
        this.contextMenu = document.createElement('div');
        this.contextMenu.id = 'city-context-menu';
        this.contextMenu.style.cssText = `
            position: fixed;
            display: none;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.2);
            padding: 8px;
            z-index: 10000;
            min-width: 200px;
        `;
        document.body.appendChild(this.contextMenu);
        
        document.addEventListener('click', () => {
            this.contextMenu.style.display = 'none';
        });
        
        console.log('✅ Menu de contexto criado');
    }

    showContextMenu(event, cityName) {
        event.preventDefault();
        event.stopPropagation();
        
        const cityData = this.markedCities[cityName];
        if (!cityData) return;
        
        let menuContent = `
            <div style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-weight: 600; font-size: 13px; margin-bottom: 4px;">
                ${cityName}
            </div>
            <div onclick="if(confirm('Remover marcação de ${cityName}?')) { window.app.removeCity('${cityName}'); window.app.contextMenu.style.display='none'; }"
                 style="padding: 12px; cursor: pointer; border-radius: 6px; color: #ef4444; font-weight: 600; transition: all 0.2s; font-size: 14px;"
                 onmouseover="this.style.background='#fef2f2';"
                 onmouseout="this.style.background='transparent';">
                🗑️ Remover Marcação
            </div>
        `;
        
        this.contextMenu.innerHTML = menuContent;
        this.contextMenu.style.display = 'block';
        this.contextMenu.style.left = event.pageX + 'px';
        this.contextMenu.style.top = event.pageY + 'px';
        
        console.log(`🖱️ Menu contexto aberto: ${cityName}`);
    }

    initMap() {
        console.log('🗺️ Criando mapa Leaflet...');
        
        try {
            this.map = L.map('map', {
                center: this.initialView.center,
                zoom: this.initialView.zoom,
                zoomControl: true,
                attributionControl: true,
                minZoom: 6,
                maxZoom: 12,
                doubleClickZoom: false,
                tap: false
            });
            
            console.log('✅ Mapa criado');
            
            this.map.off('dblclick');
            this.map.on('dblclick', (e) => {
                L.DomEvent.stopPropagation(e);
                L.DomEvent.preventDefault(e);
                return false;
            });
            
            const tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
                subdomains: 'abcd',
                maxZoom: 20,
                minZoom: 6
            });
            
            tileLayer.addTo(this.map);
            console.log('✅ Tiles CartoDB adicionados');
            
            tileLayer.on('tileerror', () => {
                console.log('🔄 Tentando fallback...');
                this.map.removeLayer(tileLayer);
                const fallback = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap contributors',
                    maxZoom: 19
                });
                fallback.addTo(this.map);
            });
            
            setTimeout(() => {
                this.map.invalidateSize();
            }, 250);
            
            this.loadMunicipalitiesBoundaries();
            
            const mapControls = document.querySelector('custom-map-controls');
            if (mapControls) {
                mapControls.init(this.map);
            }
            
        } catch (error) {
            console.error('❌ Erro ao criar mapa:', error);
        }
    }

    loadMunicipalitiesBoundaries() {
        console.log('📍 Carregando municípios...');
        
        fetch('data/municipios-sp.geojson')
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                return response.json();
            })
            .then(municipalitiesData => {
                console.log(`✅ GeoJSON carregado: ${municipalitiesData.features.length} municípios`);
                
                this.geoJsonLayer = L.geoJSON(municipalitiesData, {
                    style: (feature) => {
                        const name = this.getMunicipalityName(feature);
                        const cityData = this.markedCities[name];
                        
                        if (cityData && cityData.companies.length > 0) {
                            const color = this.getCompanyColor(cityData.companies[0]);
                            return {
                                fillColor: color,
                                weight: 2,
                                opacity: 1,
                                color: '#374151',
                                fillOpacity: 0.7
                            };
                        } 
                        else if (cityData) {
                            return {
                                fillColor: '#9ca3af',
                                weight: 2,
                                opacity: 1,
                                color: '#4b5563',
                                fillOpacity: 0.6
                            };
                        } 
                        else {
                            return {
                                fillColor: '#d1d5db',
                                weight: 1.5,
                                opacity: 1,
                                color: '#6b7280',
                                fillOpacity: 0.2
                            };
                        }
                    },
                    onEachFeature: (feature, layer) => {
                        const name = this.getMunicipalityName(feature);
                        this.cityLayers[name] = layer;
                        
                        layer.on('mouseover', () => {
                            const cityData = this.markedCities[name];
                            if (!cityData) {
                                layer.setStyle({ weight: 3, fillOpacity: 0.3 });
                            } else {
                                layer.setStyle({ weight: 4, fillOpacity: 0.85 });
                            }
                            this.showTooltip(name);
                        });
                        
                        layer.on('mouseout', () => {
                            this.geoJsonLayer.resetStyle(layer);
                            this.hideTooltip();
                        });

                        layer.off('dblclick');
                        layer.on('dblclick', (e) => {
                            L.DomEvent.stop(e);
                            return false;
                        });

                        layer.on('contextmenu', (e) => {
                            L.DomEvent.stop(e);
                            this.showContextMenu(e.originalEvent, name);
                        });

                        layer.on('click', (e) => {
                            L.DomEvent.stop(e);
                            this.handleCityClick(name, layer, e);
                        });
                    }
                }).addTo(this.map);

                console.log(`✅ ${municipalitiesData.features.length} municípios carregados!`);
            })
            .catch(error => {
                console.error('❌ Erro ao carregar municípios:', error);
            });
    }

    handleCityClick(name, layer, event) {
        this.clickCount++;
        
        clearTimeout(this.clickTimer);
        
        this.clickTimer = setTimeout(() => {
            const clicks = this.clickCount;
            this.clickCount = 0;
            
            if (clicks === 1) {
                this.zoomToCity(name, event);
            } else if (clicks >= 2) {
                this.markAndShowDropdown(name, layer);
            }
        }, this.clickTimeout);
    }

    zoomToCity(name, event) {
        const latlng = event.latlng;
        const currentZoom = this.map.getZoom();
        const newZoom = Math.min(currentZoom + 3, 12);
        
        this.map.flyTo(latlng, newZoom, {
            duration: 0.8,
            easeLinearity: 0.25
        });
        
        console.log(`🔍 1º CLIQUE: Zoom 3x em ${name} (${currentZoom} → ${newZoom}) - SEM marcar`);
    }

    markAndShowDropdown(name, layer) {
        if (!this.markedCities[name]) {
            this.markedCities[name] = { companies: [] };
            
            layer.setStyle({
                fillColor: '#9ca3af',
                weight: 2,
                opacity: 1,
                color: '#4b5563',
                fillOpacity: 0.6
            });
            
            this.saveToLocalStorage(); // 💾 SALVA
            console.log(`🟤 2º CLIQUE: ${name} marcado (aguardando empresa)`);
        } else {
            console.log(`🔄 2º CLIQUE: ${name} já estava marcado`);
        }
        
        this.showCompanyDropdown(name);
    }

    removeCity(name) {
        const layer = this.cityLayers[name];
        if (!layer) return;
        
        if (this.markedCities[name]) {
            delete this.markedCities[name];
            
            layer.setStyle({
                fillColor: '#d1d5db',
                weight: 1.5,
                opacity: 1,
                color: '#6b7280',
                fillOpacity: 0.2
            });
            
            this.saveToLocalStorage(); // 💾 SALVA
            console.log(`🗑️ Removido: ${name}`);
            console.log(`📊 Total marcadas: ${Object.keys(this.markedCities).length}`);
        }
    }

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

    addCompanyToCity(cityName, company) {
        const city = this.markedCities[cityName];
        if (!city) return;
        
        city.companies.push(company);
        const color = this.getCompanyColor(company);
        console.log(`✅ ${company} adicionada em ${cityName} - Cor: ${color}`);
        
        this.saveToLocalStorage(); // 💾 SALVA
        
        const oldLayer = this.geoJsonLayer;
        if (oldLayer) {
            this.map.removeLayer(oldLayer);
        }
        
        this.loadMunicipalitiesBoundaries();
    }

    setupEventListeners() {
        window.addEventListener('filtersChanged', (e) => {
            this.currentFilters = e.detail;
            this.applyFilters();
        });

        const resetBtn = document.getElementById('reset-map');
        if (resetBtn) resetBtn.addEventListener('click', () => this.resetMap());

        const exportBtn = document.getElementById('export-map');
        if (exportBtn) exportBtn.addEventListener('click', () => this.exportJSON());
        
        const dashboardBtn = document.getElementById('open-dashboard');
        if (dashboardBtn) dashboardBtn.addEventListener('click', () => this.showDashboard());

        const addClientBtn = document.getElementById('add-client');
        if (addClientBtn) addClientBtn.addEventListener('click', () => this.openModal());

        const closeModalBtn = document.getElementById('close-modal');
        if (closeModalBtn) closeModalBtn.addEventListener('click', () => this.closeModal());

        const clientForm = document.getElementById('client-form');
        if (clientForm) clientForm.addEventListener('submit', (e) => this.handleFormSubmit(e));

        const modal = document.getElementById('client-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.closeModal();
            });
        }
    }

    renderMarkers() {
        Object.values(this.markers).forEach(marker => this.map.removeLayer(marker));
        this.markers = {};

        this.currentClients.forEach(client => {
            const color = client.status === 'ativo' ? '#22c55e' : '#eab308';
            
            const marker = L.circleMarker([client.lat, client.lng], {
                radius: 8,
                fillColor: color,
                color: 'white',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.8,
                zIndex: 1000
            }).addTo(this.map);

            marker.bindPopup(`
                <div style="padding:8px">
                    <b>${client.name}</b><br>
                    <small>${client.segment} | ${client.company}<br>${client.municipality}</small>
                </div>
            `);

            marker.on('click', () => this.map.setView([client.lat, client.lng], 12));
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
                    <button onclick="window.app.editClient(${client.id})" class="text-blue-600">✏️</button>
                    <button onclick="window.app.deleteClient(${client.id})" class="text-red-600">🗑️</button>
                </td>
            </tr>
        `).join('');
    }

    applyFilters() {
        let filtered = [];
        if (this.currentFilters.company) filtered = filtered.filter(c => c.company === this.currentFilters.company);
        if (this.currentFilters.segment) filtered = filtered.filter(c => c.segment === this.currentFilters.segment);
        if (this.currentFilters.status !== 'todos') filtered = filtered.filter(c => c.status === this.currentFilters.status);

        this.currentClients = filtered;
        this.renderClientTable();
        this.renderMarkers();
    }

    resetMap() {
        this.map.setView(this.initialView.center, this.initialView.zoom);
        this.currentFilters = { company: '', segment: '', status: 'todos' };
        this.currentClients = [];
        this.loadMunicipalitiesBoundaries();
        this.renderClientTable();
        this.renderMarkers();
        console.log('♻️ Mapa resetado (via botão Reset Map)');
    }

    openModal(clientId = null) {
        const modal = document.getElementById('client-modal');
        const form = document.getElementById('client-form');
        if (!modal || !form) return;

        if (clientId) {
            const client = CLIENTS_DATA.find(c => c.id === clientId);
            if (client) {
                document.getElementById('modal-title').textContent = 'Editar Cliente';
                document.getElementById('client-name').value = client.name;
                document.getElementById('client-municipality').value = client.municipality;
                document.getElementById('client-id').value = clientId;
            }
        } else {
            document.getElementById('modal-title').textContent = 'Novo Cliente';
            form.reset();
            document.getElementById('client-id').value = '';
        }
        modal.style.display = 'flex';
    }

    closeModal() {
        const modal = document.getElementById('client-modal');
        if (modal) modal.style.display = 'none';
    }

    handleFormSubmit(e) {
        e.preventDefault();
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

        const clientId = document.getElementById('client-id').value;
        if (clientId) {
            updateClient(parseInt(clientId), { name, municipality, lat: coords.lat, lng: coords.lng });
        } else {
            addClient({
                name, municipality, segment: 'Lubrificantes', company: 'CDO',
                Funcionário: 'Novo', status: 'ativo',
                lat: coords.lat, lng: coords.lng,
                contact: 'contato@newclient.com', phone: '(XX) 0000-0000'
            });
        }

        this.closeModal();
        this.applyFilters();
        this.loadMunicipalitiesBoundaries();
        this.map.setView([coords.lat, coords.lng], 12);
    }

    editClient(clientId) { this.openModal(clientId); }

    deleteClient(clientId) {
        if (confirm('Deletar este cliente?')) {
            deleteClient(clientId);
            this.currentClients = this.currentClients.filter(c => c.id !== clientId);
            this.renderClientTable();
            this.renderMarkers();
            this.loadMunicipalitiesBoundaries();
        }
    }

    // EXPORTAÇÃO LEGADA (mantém compatibilidade)
    exportData() {
        this.exportJSON();
    }

    getMunicipalityName(feature) {
        const properties = feature.properties || {};
        return properties.name 
            || properties.NAME 
            || properties.NOME 
            || properties.NM_MUNI 
            || properties.NM_MUNICIPIO
            || properties.nm_municipio
            || properties.NM_MUN
            || 'Município Desconhecido';
    }
}

// ✅ EXPÕE APP GLOBALMENTE
let app;
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM Carregado!');
    feather.replace();
    app = new GeoClientApp();
    window.app = app;
    app.init();
    console.log('✅ window.app disponível globalmente');
    console.log('✨ GeoClient SP Premium v2.0 - TOP 3 MELHORIAS ATIVADAS');
});