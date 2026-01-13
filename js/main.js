// GeoClient SP - VERSÃO PREMIUM v2.3
// Sistema de cliques: 1=zoom (sem marcar) | 2=marca + dropdown | Botão direito=remover
// ✨ NOVO: LocalStorage Clientes + Gráficos + Busca na Tabela + Export/Import Completo

class GeoClientApp {
    constructor() {
        this.map = null;
        this.currentFilters = { 
            companies: [],
            status: 'todos',
            searchQuery: '',
            clientSearch: '' // NOVO: busca de clientes
        };
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
        this.searchBox = null;
        this.filtersAppliedToMap = false;
        this.charts = {}; // NOVO: armazena instâncias de gráficos
        
        this.availableCompanies = ['CDO', 'SUPORTE', 'WAUX', 'MONTEBELLO', 'HIRATA'];
        this.totalMunicipalitiesSP = 645;
        
        this.clickCount = 0;
        this.clickTimer = null;
        this.clickTimeout = 400;
        
        this.initialView = {
            center: [-22.5, -49.2],
            zoom: 7.2
        };
        
        this.loadFromLocalStorage();
    }

    // 💾 ==================== LOCALSTORAGE COMPLETO ====================
    
    loadFromLocalStorage() {
        try {
            // Carrega cidades marcadas
            const savedCities = localStorage.getItem('geoclient-marked-cities');
            if (savedCities) {
                this.markedCities = JSON.parse(savedCities);
                console.log(`💾 ${Object.keys(this.markedCities).length} cidades restauradas`);
            }
            
            // NOVO: Carrega clientes
            const savedClients = localStorage.getItem('geoclient-clients');
            if (savedClients) {
                this.currentClients = JSON.parse(savedClients);
                console.log(`💾 ${this.currentClients.length} clientes restaurados`);
            }
        } catch (error) {
            console.error('❌ Erro ao carregar localStorage:', error);
        }
    }
    
    saveToLocalStorage() {
        try {
            // Salva cidades
            localStorage.setItem('geoclient-marked-cities', JSON.stringify(this.markedCities));
            // NOVO: Salva clientes
            localStorage.setItem('geoclient-clients', JSON.stringify(this.currentClients));
            console.log('💾 Dados salvos (cidades + clientes)');
            this.showToast('💾 Dados salvos automaticamente!', 'success');
        } catch (error) {
            console.error('❌ Erro ao salvar localStorage:', error);
            this.showToast('❌ Erro ao salvar dados', 'error');
        }
    }
    
    clearAllData() {
        if (!confirm('⚠️ Tem certeza que deseja limpar TODOS os dados?\n\nIsso vai remover:\n- Todas as cidades marcadas\n- Todos os clientes cadastrados\n\nEsta ação não pode ser desfeita!')) {
            return;
        }
        
        this.markedCities = {};
        this.currentClients = [];
        localStorage.removeItem('geoclient-marked-cities');
        localStorage.removeItem('geoclient-clients');
        this.loadMunicipalitiesBoundaries();
        this.renderClientTable();
        this.renderMarkers();
        
        console.log('🗑️ Todos os dados foram limpos');
        this.showToast('🗑️ Todos os dados foram limpos!', 'info');
    }
    
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
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    
    // 📥 ==================== IMPORT/EXPORT COMPLETO ====================
    
    showImportModal() {
        const modal = document.createElement('div');
        modal.id = 'import-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10004;
        `;
        
        modal.innerHTML = `
            <div style="
                background: white;
                border-radius: 16px;
                padding: 32px;
                max-width: 700px;
                width: 90%;
                box-shadow: 0 10px 40px rgba(0,0,0,0.3);
                max-height: 90vh;
                overflow-y: auto;
            ">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                    <h2 style="margin: 0; font-size: 24px; font-weight: 700; color: #1f2937;">📥 Importar Dados Completos</h2>
                    <button onclick="this.closest('#import-modal').remove();" style="
                        background: none;
                        border: none;
                        font-size: 28px;
                        color: #9ca3af;
                        cursor: pointer;
                        line-height: 1;
                    ">×</button>
                </div>
                
                <div id="drop-zone" style="
                    border: 3px dashed #d1d5db;
                    border-radius: 12px;
                    padding: 48px 24px;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.2s;
                    background: #f9fafb;
                    margin-bottom: 24px;
                "
                onmouseover="this.style.borderColor='#3b82f6'; this.style.background='#eff6ff';"
                onmouseout="this.style.borderColor='#d1d5db'; this.style.background='#f9fafb';">
                    <div style="font-size: 48px; margin-bottom: 12px;">📂</div>
                    <div style="font-size: 16px; font-weight: 600; color: #1f2937; margin-bottom: 8px;">Arraste o arquivo aqui</div>
                    <div style="font-size: 14px; color: #6b7280; margin-bottom: 16px;">Suporta: CSV ou JSON</div>
                    <input type="file" id="csv-file-input" accept=".csv,.json" style="display: none;">
                    <button onclick="document.getElementById('csv-file-input').click();" style="
                        background: #3b82f6;
                        color: white;
                        border: none;
                        padding: 10px 24px;
                        border-radius: 8px;
                        font-weight: 600;
                        cursor: pointer;
                        font-size: 14px;
                    ">Selecionar Arquivo</button>
                </div>
                
                <div style="background: #f0fdf4; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
                    <div style="font-weight: 600; color: #15803d; margin-bottom: 8px;">📋 Formato CSV esperado:</div>
                    <code style="display: block; background: white; padding: 12px; border-radius: 6px; font-size: 12px; color: #374151; border: 1px solid #d1f4dd; overflow-x: auto;">
Tipo,Nome,Cidade,Empresas,Status,Segmento,Contato,Telefone<br>
cidade,"São Paulo","São Paulo","CDO | WAUX","com_empresa","","",""<br>
cliente,"Empresa ABC","Campinas","CDO","ativo","Lubrificantes","contato@abc.com","(19) 99999-9999"
                    </code>
                    <div style="margin-top: 12px; font-size: 13px; color: #15803d;">
                        ✅ <b>Tipos aceitos:</b> "cidade" ou "cliente"<br>
                        ✅ <b>JSON:</b> Formato exportado automaticamente
                    </div>
                </div>
                
                <div style="margin-bottom: 24px;">
                    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                        <input type="radio" name="import-mode" value="merge" checked>
                        <span style="font-weight: 600; color: #374151;">🔄 Mesclar com dados existentes</span>
                    </label>
                    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; margin-top: 8px;">
                        <input type="radio" name="import-mode" value="replace">
                        <span style="font-weight: 600; color: #374151;">♻️ Substituir todos os dados</span>
                    </label>
                </div>
                
                <div style="display: flex; gap: 12px;">
                    <button onclick="this.closest('#import-modal').remove();" style="
                        flex: 1;
                        background: #f3f4f6;
                        border: 1px solid #e5e7eb;
                        padding: 12px;
                        border-radius: 8px;
                        font-weight: 600;
                        cursor: pointer;
                        color: #6b7280;
                    ">Cancelar</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const dropZone = modal.querySelector('#drop-zone');
        const fileInput = modal.querySelector('#csv-file-input');
        
        dropZone.addEventListener('click', () => fileInput.click());
        
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.style.borderColor = '#3b82f6';
            dropZone.style.background = '#eff6ff';
        });
        
        dropZone.addEventListener('dragleave', () => {
            dropZone.style.borderColor = '#d1d5db';
            dropZone.style.background = '#f9fafb';
        });
        
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.style.borderColor = '#d1d5db';
            dropZone.style.background = '#f9fafb';
            
            const file = e.dataTransfer.files[0];
            if (file) this.handleFileImport(file, modal);
        });
        
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) this.handleFileImport(file, modal);
        });
    }
    
    handleFileImport(file, modal) {
        const ext = file.name.split('.').pop().toLowerCase();
        
        if (!['csv', 'json'].includes(ext)) {
            this.showToast('❌ Apenas arquivos CSV ou JSON são aceitos!', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target.result;
                const importMode = modal.querySelector('input[name="import-mode"]:checked').value;
                
                if (ext === 'json') {
                    this.parseAndImportJSON(content, importMode);
                } else {
                    this.parseAndImportCSV(content, importMode);
                }
                
                modal.remove();
            } catch (error) {
                console.error('❌ Erro ao importar:', error);
                this.showToast('❌ Erro ao processar arquivo', 'error');
            }
        };
        reader.readAsText(file, 'UTF-8');
    }
    
    parseAndImportJSON(jsonContent, mode) {
        try {
            const data = JSON.parse(jsonContent);
            
            if (!data.cities && !data.clients) {
                this.showToast('❌ Formato JSON inválido', 'error');
                return;
            }
            
            if (mode === 'replace') {
                this.markedCities = data.cities || {};
                this.currentClients = data.clients || [];
            } else {
                // Merge
                if (data.cities) {
                    Object.entries(data.cities).forEach(([city, info]) => {
                        if (this.markedCities[city]) {
                            const existingCompanies = this.markedCities[city].companies || [];
                            const allCompanies = [...new Set([...existingCompanies, ...(info.companies || [])])];
                            this.markedCities[city].companies = allCompanies;
                        } else {
                            this.markedCities[city] = info;
                        }
                    });
                }
                
                if (data.clients) {
                    const maxId = this.currentClients.length > 0 
                        ? Math.max(...this.currentClients.map(c => c.id)) 
                        : 0;
                    
                    data.clients.forEach((client, index) => {
                        client.id = maxId + index + 1;
                        this.currentClients.push(client);
                    });
                }
            }
            
            this.saveToLocalStorage();
            this.loadMunicipalitiesBoundaries();
            this.renderClientTable();
            this.renderMarkers();
            
            const cityCount = Object.keys(data.cities || {}).length;
            const clientCount = (data.clients || []).length;
            this.showToast(`✅ Importado: ${cityCount} cidades, ${clientCount} clientes`, 'success');
            
        } catch (error) {
            console.error('❌ Erro ao importar JSON:', error);
            this.showToast('❌ Erro ao processar JSON', 'error');
        }
    }
    
    parseAndImportCSV(csvContent, mode) {
        const lines = csvContent.trim().split('\n');
        if (lines.length < 2) {
            this.showToast('❌ Arquivo CSV vazio ou inválido', 'error');
            return;
        }
        
        const header = lines[0].replace(/^\uFEFF/, '');
        const newCities = {};
        const newClients = [];
        let imported = 0;
        let errors = 0;
        
        for (let i = 1; i < lines.length; i++) {
            try {
                const line = lines[i].trim();
                if (!line) continue;
                
                const matches = line.match(/"([^"]*)"|([^,]+)/g);
                if (!matches || matches.length < 3) continue;
                
                const tipo = matches[0].replace(/"/g, '').trim().toLowerCase();
                const nome = matches[1].replace(/"/g, '').trim();
                const cidade = matches[2].replace(/"/g, '').trim();
                
                if (tipo === 'cidade') {
                    const empresasStr = matches[3] ? matches[3].replace(/"/g, '').trim() : '';
                    const empresas = empresasStr 
                        ? empresasStr.split('|').map(e => e.trim()).filter(e => e)
                        : [];
                    
                    newCities[cidade] = {
                        companies: empresas,
                        importedAt: new Date().toISOString()
                    };
                    imported++;
                } else if (tipo === 'cliente') {
                    const empresa = matches[3] ? matches[3].replace(/"/g, '').trim() : '';
                    const status = matches[4] ? matches[4].replace(/"/g, '').trim() : 'ativo';
                    const segmento = matches[5] ? matches[5].replace(/"/g, '').trim() : 'Geral';
                    const contato = matches[6] ? matches[6].replace(/"/g, '').trim() : '';
                    const telefone = matches[7] ? matches[7].replace(/"/g, '').trim() : '';
                    
                    const coords = this.getCityCoordinates(cidade);
                    
                    newClients.push({
                        name: nome,
                        municipality: cidade,
                        company: empresa,
                        status: status,
                        segment: segmento,
                        contact: contato,
                        phone: telefone,
                        lat: coords.lat,
                        lng: coords.lng,
                        Funcionário: 'N/A'
                    });
                    imported++;
                }
            } catch (error) {
                console.error(`❌ Erro na linha ${i}:`, error);
                errors++;
            }
        }
        
        if (imported === 0) {
            this.showToast('❌ Nenhum dado válido encontrado no CSV', 'error');
            return;
        }
        
        if (mode === 'replace') {
            this.markedCities = newCities;
            this.currentClients = newClients.map((c, i) => ({ id: i + 1, ...c }));
        } else {
            // Merge cidades
            Object.entries(newCities).forEach(([cidade, data]) => {
                if (this.markedCities[cidade]) {
                    const existingCompanies = this.markedCities[cidade].companies || [];
                    const allCompanies = [...new Set([...existingCompanies, ...data.companies])];
                    this.markedCities[cidade].companies = allCompanies;
                } else {
                    this.markedCities[cidade] = data;
                }
            });
            
            // Merge clientes
            const maxId = this.currentClients.length > 0 
                ? Math.max(...this.currentClients.map(c => c.id)) 
                : 0;
            
            newClients.forEach((client, index) => {
                client.id = maxId + index + 1;
                this.currentClients.push(client);
            });
        }
        
        this.saveToLocalStorage();
        this.loadMunicipalitiesBoundaries();
        this.renderClientTable();
        this.renderMarkers();
        
        const msg = mode === 'replace' 
            ? `✅ ${imported} itens importados (substituindo dados anteriores)`
            : `✅ ${imported} itens mesclados aos dados existentes`;
        
        this.showToast(msg, 'success');
        
        if (errors > 0) {
            this.showToast(`⚠️ ${errors} linha(s) com erro foram ignoradas`, 'warning');
        }
    }
    
    // 📤 ==================== EXPORTAR COMPLETO ====================
    
    exportCSV(filtered = false) {
        let citiesToExport = this.markedCities;
        let clientsToExport = this.currentClients;
        
        if (filtered && this.filtersAppliedToMap) {
            citiesToExport = this.getFilteredCities();
        }
        
        if (Object.keys(citiesToExport).length === 0 && clientsToExport.length === 0) {
            alert('⚠️ Nenhum dado para exportar!');
            return;
        }
        
        let csv = 'Tipo,Nome,Cidade,Empresas,Status,Segmento,Contato,Telefone\n';
        
        // Exporta cidades
        Object.entries(citiesToExport).forEach(([city, info]) => {
            const empresas = info.companies.join(' | ');
            const status = info.companies.length > 0 ? 'com_empresa' : 'aguardando';
            csv += `"cidade","","${city}","${empresas}","${status}","","",""\n`;
        });
        
        // Exporta clientes
        clientsToExport.forEach(client => {
            csv += `"cliente","${client.name}","${client.municipality}","${client.company}","${client.status}","${client.segment}","${client.contact}","${client.phone}"\n`;
        });
        
        const BOM = '\uFEFF';
        const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const suffix = filtered ? '_filtered' : '';
        a.download = `geoclient_completo${suffix}_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        
        console.log('📥 CSV completo exportado');
        this.showToast('📥 CSV completo exportado com sucesso!', 'success');
    }
    
    exportJSON() {
        if (Object.keys(this.markedCities).length === 0 && this.currentClients.length === 0) {
            alert('⚠️ Nenhum dado para exportar!');
            return;
        }
        
        const data = {
            cities: this.markedCities,
            clients: this.currentClients,
            exportedAt: new Date().toISOString(),
            version: '2.3'
        };
        
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `geoclient_completo_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        console.log('📥 JSON completo exportado');
        this.showToast('📥 JSON completo exportado com sucesso!', 'success');
    }
    
    getCityCoordinates(cityName) {
        const MUNICIPALITIES = {
            'São Paulo': { lat: -23.5505, lng: -46.6333 },
            'Guarulhos': { lat: -23.4538, lng: -46.5333 },
            'Campinas': { lat: -22.9099, lng: -47.0626 },
            'São Bernardo do Campo': { lat: -23.6914, lng: -46.5646 },
            'Santo André': { lat: -23.6636, lng: -46.5341 },
            'Osasco': { lat: -23.5329, lng: -46.7919 }
        };
        return MUNICIPALITIES[cityName] || { lat: -23.5, lng: -46.6 };
    }
    
    // 🔍 ==================== BUSCA DE CLIENTES NA TABELA ====================
    
    setupClientSearch() {
        const searchInput = document.createElement('div');
        searchInput.innerHTML = `
            <div style="margin-bottom: 16px;">
                <input 
                    type="text" 
                    id="client-table-search" 
                    placeholder="🔍 Buscar cliente, cidade, empresa..."
                    style="
                        width: 100%;
                        padding: 12px 16px;
                        border: 2px solid #e5e7eb;
                        border-radius: 8px;
                        font-size: 14px;
                        transition: all 0.2s;
                    "
                />
            </div>
        `;
        
        const tableContainer = document.querySelector('.bg-white.rounded-lg.shadow.p-6');
        if (tableContainer) {
            const title = tableContainer.querySelector('h2');
            if (title) {
                title.parentNode.insertBefore(searchInput, title.nextSibling);
            }
        }
        
        const input = document.getElementById('client-table-search');
        if (input) {
            input.addEventListener('input', (e) => {
                this.currentFilters.clientSearch = e.target.value;
                this.renderClientTable();
            });
            
            input.addEventListener('focus', () => {
                input.style.borderColor = '#3b82f6';
                input.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
            });
            
            input.addEventListener('blur', () => {
                input.style.borderColor = '#e5e7eb';
                input.style.boxShadow = 'none';
            });
        }
    }
    
    filterClients() {
        const search = this.currentFilters.clientSearch.toLowerCase().trim();
        if (!search) return this.currentClients;
        
        return this.currentClients.filter(client => {
            return (
                client.name.toLowerCase().includes(search) ||
                client.municipality.toLowerCase().includes(search) ||
                client.company.toLowerCase().includes(search) ||
                client.segment.toLowerCase().includes(search) ||
                client.status.toLowerCase().includes(search)
            );
        });
    }
    
    // 📊 ==================== DASHBOARD COM GRÁFICOS ====================
    
    destroyCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        this.charts = {};
    }
    
    createCompanyChart(canvasId, data) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;
        
        return new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.labels,
                datasets: [{
                    data: data.values,
                    backgroundColor: data.colors,
                    borderWidth: 2,
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
                            font: { size: 12, weight: 'bold' }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percent = ((value / total) * 100).toFixed(1);
                                return `${label}: ${value} (${percent}%)`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    // ==================== RESTO DO CÓDIGO (continua igual) ====================
    
    // ... (todas as outras funções permanecem idênticas)
};

// ✅ Expor globalmente
let app;
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM Carregado!');
    
    // Carrega Chart.js dinamicamente
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
    script.onload = () => {
        console.log('✅ Chart.js carregado');
        app = new GeoClientApp();
        window.app = app;
        app.init();
        console.log('✨ GeoClient SP Premium v2.3 ATIVADO!');
    };
    document.head.appendChild(script);
});