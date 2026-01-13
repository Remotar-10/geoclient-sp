// 📝 GeoClient SP - Activity Logger
// v1.0 - Sistema de logging automático de atividades

class ActivityLogger {
    constructor() {
        this.enabled = true;
        this.debugMode = false;
        console.log('✅ ActivityLogger initialized');
    }

    // Habilita/desabilita logging
    setEnabled(enabled) {
        this.enabled = enabled;
        console.log(`📝 ActivityLogger ${enabled ? 'habilitado' : 'desabilitado'}`);
    }

    // Modo debug (logs mais verbosos)
    setDebugMode(debug) {
        this.debugMode = debug;
        console.log(`🐛 Debug mode ${debug ? 'ON' : 'OFF'}`);
    }

    // Log genérico
    log(type, message, details = {}) {
        if (!this.enabled) return;

        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            type,
            message,
            details
        };

        // Console
        if (this.debugMode) {
            console.log(`[${timestamp}] ${type.toUpperCase()}: ${message}`, details);
        }

        // Envia para ReportsAndHistory se disponível
        if (window.reportsAndHistory && typeof window.reportsAndHistory.addActivity === 'function') {
            window.reportsAndHistory.addActivity(type, message, details);
        }

        return logEntry;
    }

    // Logs específicos por tipo de atividade
    logCityMarked(cityName) {
        return this.log('city_marked', `Cidade ${cityName} marcada`, { city: cityName });
    }

    logCompanyAdded(cityName, company) {
        return this.log('company_added', `Empresa ${company} adicionada em ${cityName}`, { city: cityName, company });
    }

    logCompanyRemoved(cityName, company) {
        return this.log('company_removed', `Empresa ${company} removida de ${cityName}`, { city: cityName, company });
    }

    logCityRemoved(cityName) {
        return this.log('delete', `Cidade ${cityName} desmarcada`, { city: cityName });
    }

    logClientAdded(clientName, municipality) {
        return this.log('client_added', `Cliente ${clientName} adicionado em ${municipality}`, { client: clientName, municipality });
    }

    logClientUpdated(clientName) {
        return this.log('client_updated', `Cliente ${clientName} atualizado`, { client: clientName });
    }

    logClientDeleted(clientName) {
        return this.log('delete', `Cliente ${clientName} deletado`, { client: clientName });
    }

    logExport(format, itemCount) {
        return this.log('export', `Dados exportados em ${format.toUpperCase()}`, { format, count: itemCount });
    }

    logImport(format, itemCount) {
        return this.log('import', `Dados importados de ${format.toUpperCase()}`, { format, count: itemCount });
    }

    logFilterApplied(filterType, filterValue) {
        return this.log('filter_applied', `Filtro aplicado: ${filterType} = ${filterValue}`, { filterType, filterValue });
    }

    logDashboardOpened() {
        return this.log('dashboard_opened', 'Dashboard aberto');
    }

    logDataCleared() {
        return this.log('data_cleared', 'Todos os dados foram limpos');
    }

    logError(errorMessage, errorDetails = {}) {
        return this.log('error', `Erro: ${errorMessage}`, errorDetails);
    }

    // Utilitário: Formatação de tempo
    formatDuration(startTime, endTime = Date.now()) {
        const duration = endTime - startTime;
        if (duration < 1000) return `${duration}ms`;
        if (duration < 60000) return `${(duration / 1000).toFixed(1)}s`;
        return `${(duration / 60000).toFixed(1)}min`;
    }

    // Utilitário: Performance tracking
    startTimer(label) {
        const timer = {
            label,
            startTime: Date.now(),
            end: function() {
                const duration = Date.now() - this.startTime;
                if (window.activityLogger && window.activityLogger.debugMode) {
                    console.log(`⏱️ [${label}] ${window.activityLogger.formatDuration(this.startTime)}`);
                }
                return duration;
            }
        };
        return timer;
    }
}

// ✅ Cria instância global
window.activityLogger = new ActivityLogger();

// ✅ Auto-integra com app quando disponível
if (typeof window !== 'undefined') {
    const checkAppInterval = setInterval(() => {
        if (window.app && window.reportsAndHistory) {
            console.log('✅ ActivityLogger integrado com app e ReportsAndHistory');
            clearInterval(checkAppInterval);
        }
    }, 100);
    
    // Para de tentar após 5 segundos
    setTimeout(() => clearInterval(checkAppInterval), 5000);
}

console.log('✅ ActivityLogger loaded and ready');

// ✅ EXPÕE GLOBALMENTE
window.ActivityLogger = ActivityLogger;