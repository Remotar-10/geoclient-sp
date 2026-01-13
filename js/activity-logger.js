// 📝 ACTIVITY LOGGER - Sistema de Logging Automático
// Intercepta e registra todas as ações do usuário sem modificar main.js

class ActivityLogger {
    constructor() {
        this.activities = [];
        this.maxActivities = 100; // Máximo de atividades no histórico
        this.loadActivities();
        console.log('📝 ActivityLogger inicializado');
    }

    loadActivities() {
        try {
            const saved = localStorage.getItem('geoclient-activities');
            if (saved) {
                this.activities = JSON.parse(saved);
                console.log(`📝 ${this.activities.length} atividades carregadas`);
            }
        } catch (error) {
            console.error('❌ Erro ao carregar atividades:', error);
            this.activities = [];
        }
    }

    saveActivities() {
        try {
            localStorage.setItem('geoclient-activities', JSON.stringify(this.activities));
        } catch (error) {
            console.error('❌ Erro ao salvar atividades:', error);
        }
    }

    log(action, details = {}) {
        const activity = {
            id: Date.now() + Math.random(),
            timestamp: new Date().toISOString(),
            action: action,
            details: details,
            user: 'Sistema' // Pode ser expandido para multi-usuários
        };

        this.activities.unshift(activity);
        
        // Limita o histórico
        if (this.activities.length > this.maxActivities) {
            this.activities = this.activities.slice(0, this.maxActivities);
        }

        this.saveActivities();
        console.log(`📝 [${action}]`, details);
    }

    getActivities(limit = null) {
        return limit ? this.activities.slice(0, limit) : this.activities;
    }

    clearActivities() {
        this.activities = [];
        this.saveActivities();
        console.log('🗑️ Histórico de atividades limpo');
    }

    // Métodos de conveniência
    logCityMarked(cityName, companies) {
        this.log('Cidade Marcada', { city: cityName, companies: companies });
    }

    logCityUnmarked(cityName) {
        this.log('Cidade Desmarcada', { city: cityName });
    }

    logCompanyAdded(cityName, company) {
        this.log('Empresa Adicionada', { city: cityName, company: company });
    }

    logClientAdded(clientName, municipality) {
        this.log('Cliente Adicionado', { client: clientName, municipality: municipality });
    }

    logClientUpdated(clientName) {
        this.log('Cliente Atualizado', { client: clientName });
    }

    logClientDeleted(clientName) {
        this.log('Cliente Deletado', { client: clientName });
    }

    logImport(type, itemCount) {
        this.log('Importação', { type: type, itemCount: itemCount });
    }

    logExport(type, itemCount) {
        this.log('Exportação', { type: type, itemCount: itemCount });
    }

    logFilterApplied(filters) {
        this.log('Filtros Aplicados', { filters: filters });
    }

    logDashboardOpened() {
        this.log('Dashboard Aberto', {});
    }

    logDataCleared() {
        this.log('Dados Limpos', {});
    }
}

// Inicializa globalmente
window.activityLogger = new ActivityLogger();

// 🎣 HOOKS - Intercepta funções do app automaticamente
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (!window.app) {
            console.warn('⚠️ window.app não encontrado, hooks não aplicados');
            return;
        }

        const app = window.app;
        const logger = window.activityLogger;

        // Hook: Marcar cidade
        const originalMarkAndShowDropdown = app.markAndShowDropdown;
        app.markAndShowDropdown = function(name, layer) {
            logger.logCityMarked(name, []);
            return originalMarkAndShowDropdown.call(this, name, layer);
        };

        // Hook: Remover cidade
        const originalRemoveCity = app.removeCity;
        app.removeCity = function(name) {
            logger.logCityUnmarked(name);
            return originalRemoveCity.call(this, name);
        };

        // Hook: Adicionar empresa
        const originalAddCompanyToCity = app.addCompanyToCity;
        app.addCompanyToCity = function(cityName, company) {
            logger.logCompanyAdded(cityName, company);
            return originalAddCompanyToCity.call(this, cityName, company);
        };

        // Hook: Importar CSV
        const originalParseAndImportCSV = app.parseAndImportCSV;
        app.parseAndImportCSV = function(csvContent, mode) {
            const result = originalParseAndImportCSV.call(this, csvContent, mode);
            const cityCount = Object.keys(app.markedCities).length;
            logger.logImport('CSV', cityCount);
            return result;
        };

        // Hook: Exportar CSV
        const originalExportCSV = app.exportCSV;
        app.exportCSV = function(filtered = false) {
            const cityCount = Object.keys(app.markedCities).length;
            logger.logExport('CSV', cityCount);
            return originalExportCSV.call(this, filtered);
        };

        // Hook: Exportar JSON
        const originalExportJSON = app.exportJSON;
        app.exportJSON = function() {
            const cityCount = Object.keys(app.markedCities).length;
            logger.logExport('JSON', cityCount);
            return originalExportJSON.call(this);
        };

        // Hook: Limpar dados
        const originalClearAllData = app.clearAllData;
        app.clearAllData = function() {
            logger.logDataCleared();
            return originalClearAllData.call(this);
        };

        // Hook: Abrir dashboard
        const originalShowDashboard = app.showDashboard;
        app.showDashboard = function() {
            logger.logDashboardOpened();
            return originalShowDashboard.call(this);
        };

        // Hook: Aplicar filtros
        const originalApplyFiltersToMap = app.applyFiltersToMap;
        app.applyFiltersToMap = function() {
            logger.logFilterApplied(app.currentFilters);
            return originalApplyFiltersToMap.call(this);
        };

        console.log('✅ ActivityLogger hooks aplicados com sucesso!');
    }, 800);
});

console.log('📝 activity-logger.js carregado');