// 📋 Activity Log Integration
// Integra o sistema de log com todas as ações do GeoClientApp
// Sem modificar o código original

(function() {
    console.log('📋 Activity Log Integration loading...');
    
    // Aguarda o app ser inicializado
    const checkInterval = setInterval(() => {
        if (window.app && window.reportsAndHistory) {
            clearInterval(checkInterval);
            initializeLogIntegration();
        }
    }, 100);
    
    function initializeLogIntegration() {
        const app = window.app;
        const log = window.reportsAndHistory;
        
        // 🎯 Intercepta saveToLocalStorage para logar autosaves
        const originalSave = app.saveToLocalStorage.bind(app);
        app.saveToLocalStorage = function() {
            originalSave();
            // Não loga todo save (muito verbose)
        };
        
        // 🎯 Intercepta addCompanyToCity
        const originalAddCompany = app.addCompanyToCity.bind(app);
        app.addCompanyToCity = function(cityName, company) {
            originalAddCompany(cityName, company);
            log.addActivity(
                'company_added',
                `Empresa ${company} adicionada em ${cityName}`,
                { cidade: cityName, empresa: company }
            );
        };
        
        // 🎯 Intercepta removeCity
        const originalRemoveCity = app.removeCity.bind(app);
        app.removeCity = function(name) {
            const cityData = app.markedCities[name];
            const companies = cityData ? cityData.companies.join(', ') : 'nenhuma';
            originalRemoveCity(name);
            log.addActivity(
                'company_removed',
                `Marcação removida de ${name}`,
                { cidade: name, empresas: companies }
            );
        };
        
        // 🎯 Intercepta markAndShowDropdown (marca cidade)
        const originalMark = app.markAndShowDropdown.bind(app);
        app.markAndShowDropdown = function(name, layer) {
            const isNew = !app.markedCities[name];
            originalMark(name, layer);
            if (isNew) {
                log.addActivity(
                    'city_marked',
                    `Cidade ${name} marcada`,
                    { cidade: name }
                );
            }
        };
        
        // 🎯 Intercepta exportCSV
        const originalExportCSV = app.exportCSV.bind(app);
        app.exportCSV = function(filtered = false) {
            originalExportCSV(filtered);
            const cityCount = Object.keys(app.markedCities).length;
            const clientCount = app.currentClients.length;
            log.addActivity(
                'export',
                `Dados exportados para CSV ${filtered ? '(filtrados)' : '(completos)'}`,
                { 
                    cidades: cityCount, 
                    clientes: clientCount,
                    filtrado: filtered 
                }
            );
        };
        
        // 🎯 Intercepta exportJSON
        const originalExportJSON = app.exportJSON.bind(app);
        app.exportJSON = function() {
            originalExportJSON();
            const cityCount = Object.keys(app.markedCities).length;
            const clientCount = app.currentClients.length;
            log.addActivity(
                'export',
                'Dados exportados para JSON',
                { 
                    cidades: cityCount, 
                    clientes: clientCount,
                    formato: 'JSON'
                }
            );
        };
        
        // 🎯 Intercepta handleFileImport (import)
        const originalHandleFile = app.handleFileImport.bind(app);
        app.handleFileImport = function(file, modal) {
            const ext = file.name.split('.').pop().toUpperCase();
            const fileName = file.name;
            originalHandleFile(file, modal);
            
            // Log será adicionado após o processamento
            setTimeout(() => {
                log.addActivity(
                    'import',
                    `Dados importados de ${fileName}`,
                    { 
                        arquivo: fileName,
                        formato: ext
                    }
                );
            }, 500);
        };
        
        // 🎯 Intercepta clearAllData
        const originalClearAll = app.clearAllData.bind(app);
        app.clearAllData = function() {
            const cityCount = Object.keys(app.markedCities).length;
            const clientCount = app.currentClients.length;
            originalClearAll();
            log.addActivity(
                'data_cleared',
                'Todos os dados foram limpos',
                { 
                    cidades_removidas: cityCount,
                    clientes_removidos: clientCount
                }
            );
        };
        
        // 🎯 Intercepta showDashboard
        const originalShowDashboard = app.showDashboard.bind(app);
        app.showDashboard = function() {
            originalShowDashboard();
            log.addActivity(
                'dashboard_opened',
                'Dashboard aberto',
                { timestamp: new Date().toISOString() }
            );
        };
        
        // 🎯 Intercepta applyFiltersToMap
        const originalApplyFilters = app.applyFiltersToMap.bind(app);
        app.applyFiltersToMap = function() {
            originalApplyFilters();
            log.addActivity(
                'filter_applied',
                'Filtros aplicados no mapa',
                { 
                    empresas: app.currentFilters.companies.join(', ') || 'todas',
                    status: app.currentFilters.status,
                    busca: app.currentFilters.searchQuery || 'nenhuma'
                }
            );
        };
        
        console.log('✅ Activity Log Integration ATIVADA!');
        console.log('✅ Todas as ações serão automaticamente registradas');
    }
})();