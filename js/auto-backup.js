// 💾 AUTO-BACKUP SYSTEM - GeoClient SP v2.9.5
// Sistema de backup automático com versionamento
// Última atualização: 14/01/2026

class AutoBackupSystem {
    constructor() {
        this.BACKUP_INTERVAL_DAYS = 7; // Backup a cada 7 dias
        this.BACKUP_KEY = 'geoclient-last-backup';
        this.BACKUP_ENABLED_KEY = 'geoclient-backup-enabled';
        this.backupTimer = null;
        
        console.log('💾 Sistema de Backup Automático inicializado');
    }

    init() {
        // Verifica se backup automático está habilitado
        const isEnabled = this.isBackupEnabled();
        
        if (isEnabled) {
            this.checkAndBackup();
            this.startAutoBackup();
        }
        
        // Adiciona listener para visibilitychange (quando usuário volta à aba)
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && isEnabled) {
                this.checkAndBackup();
            }
        });
        
        console.log(`💾 Backup automático: ${isEnabled ? 'ATIVADO' : 'DESATIVADO'}`);
    }

    isBackupEnabled() {
        const enabled = localStorage.getItem(this.BACKUP_ENABLED_KEY);
        return enabled === null ? true : enabled === 'true'; // Habilitado por padrão
    }

    setBackupEnabled(enabled) {
        localStorage.setItem(this.BACKUP_ENABLED_KEY, enabled.toString());
        
        if (enabled) {
            this.startAutoBackup();
            this.showNotification('✅ Backup automático ativado', 'success');
        } else {
            this.stopAutoBackup();
            this.showNotification('⏸️ Backup automático desativado', 'info');
        }
    }

    startAutoBackup() {
        // Verifica a cada 1 hora se precisa fazer backup
        this.backupTimer = setInterval(() => {
            this.checkAndBackup();
        }, 60 * 60 * 1000); // 1 hora
        
        console.log('⏰ Timer de backup automático iniciado');
    }

    stopAutoBackup() {
        if (this.backupTimer) {
            clearInterval(this.backupTimer);
            this.backupTimer = null;
            console.log('⏹️ Timer de backup automático parado');
        }
    }

    checkAndBackup() {
        const lastBackup = localStorage.getItem(this.BACKUP_KEY);
        const now = Date.now();
        
        if (!lastBackup) {
            // Primeiro backup
            console.log('💾 Primeiro backup - executando agora');
            this.performBackup(true);
            return;
        }
        
        const lastBackupTime = parseInt(lastBackup);
        const daysSinceBackup = (now - lastBackupTime) / (1000 * 60 * 60 * 24);
        
        if (daysSinceBackup >= this.BACKUP_INTERVAL_DAYS) {
            console.log(`💾 ${Math.floor(daysSinceBackup)} dias desde último backup - executando agora`);
            this.performBackup(true);
        } else {
            const daysRemaining = Math.ceil(this.BACKUP_INTERVAL_DAYS - daysSinceBackup);
            console.log(`💾 Próximo backup em ${daysRemaining} dias`);
        }
    }

    performBackup(autoBackup = false) {
        try {
            // Coleta todos os dados
            const backupData = this.collectBackupData();
            
            if (!backupData.markedCities || Object.keys(backupData.markedCities).length === 0) {
                console.log('⚠️ Sem dados para backup');
                if (!autoBackup) {
                    this.showNotification('⚠️ Nenhum dado para fazer backup', 'warning');
                }
                return false;
            }
            
            // Gera arquivo JSON
            const json = JSON.stringify(backupData, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            
            // Cria nome do arquivo com timestamp
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
            const filename = `geoclient-backup-${timestamp}.json`;
            
            // Download automático
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            link.click();
            
            // Atualiza timestamp do último backup
            localStorage.setItem(this.BACKUP_KEY, Date.now().toString());
            
            // Log de sucesso
            const citiesCount = Object.keys(backupData.markedCities).length;
            const clientsCount = backupData.clients.length;
            
            console.log(`✅ Backup realizado: ${citiesCount} cidades, ${clientsCount} clientes`);
            
            if (autoBackup) {
                this.showNotification(`💾 Backup automático: ${citiesCount} cidades salvas`, 'success');
            } else {
                this.showNotification(`✅ Backup manual: ${filename}`, 'success');
            }
            
            // Log atividade
            if (window.app && window.app.logActivity) {
                window.app.logActivity('logExport', 'backup-json', citiesCount);
            }
            
            return true;
            
        } catch (error) {
            console.error('❌ Erro ao fazer backup:', error);
            this.showNotification('❌ Erro ao criar backup', 'error');
            
            if (window.app && window.app.logActivity) {
                window.app.logActivity('logError', 'Erro no backup automático', { error: error.message });
            }
            
            return false;
        }
    }

    collectBackupData() {
        // Coleta dados do localStorage
        const markedCities = JSON.parse(localStorage.getItem('geoclient-marked-cities') || '{}');
        const clients = JSON.parse(localStorage.getItem('geoclient-clients') || '[]');
        const activityLog = JSON.parse(localStorage.getItem('geoclient-activity-log') || '[]');
        
        // Monta objeto de backup completo
        return {
            version: '2.9.5',
            backupDate: new Date().toISOString(),
            backupType: 'automatic',
            system: {
                userAgent: navigator.userAgent,
                language: navigator.language,
                platform: navigator.platform
            },
            data: {
                markedCities: markedCities,
                clients: clients,
                activityLog: activityLog.slice(-100) // Últimas 100 atividades
            },
            statistics: {
                totalCities: Object.keys(markedCities).length,
                totalClients: clients.length,
                totalActivities: activityLog.length,
                companies: this.getCompaniesStats(markedCities)
            },
            // Mantém compatibilidade com formato antigo
            markedCities: markedCities,
            clients: clients
        };
    }

    getCompaniesStats(markedCities) {
        const stats = {};
        Object.values(markedCities).forEach(cityData => {
            if (cityData.companies) {
                cityData.companies.forEach(company => {
                    stats[company] = (stats[company] || 0) + 1;
                });
            }
        });
        return stats;
    }

    restoreBackup(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const backupData = JSON.parse(e.target.result);
                    
                    // Valida estrutura do backup
                    if (!backupData.markedCities && !backupData.data) {
                        throw new Error('Formato de backup inválido');
                    }
                    
                    // Suporta formato novo e antigo
                    const markedCities = backupData.data?.markedCities || backupData.markedCities || {};
                    const clients = backupData.data?.clients || backupData.clients || [];
                    
                    // Confirma restauração
                    const citiesCount = Object.keys(markedCities).length;
                    const clientsCount = clients.length;
                    
                    if (!confirm(`Restaurar backup?\n\n${citiesCount} cidades\n${clientsCount} clientes\n\nIsso substituirá os dados atuais!`)) {
                        reject(new Error('Restauração cancelada pelo usuário'));
                        return;
                    }
                    
                    // Restaura dados
                    localStorage.setItem('geoclient-marked-cities', JSON.stringify(markedCities));
                    localStorage.setItem('geoclient-clients', JSON.stringify(clients));
                    
                    // Recarrega página
                    this.showNotification('✅ Backup restaurado! Recarregando...', 'success');
                    
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                    
                    resolve({ citiesCount, clientsCount });
                    
                } catch (error) {
                    console.error('❌ Erro ao restaurar backup:', error);
                    reject(error);
                }
            };
            
            reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
            reader.readAsText(file);
        });
    }

    showNotification(message, type = 'info') {
        // Usa sistema de toast do app se disponível
        if (window.app && typeof window.app.showToast === 'function') {
            window.app.showToast(message, type);
            return;
        }
        
        // Fallback: notificação simples
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            info: '#3b82f6',
            warning: '#f59e0b'
        };
        
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: ${colors[type] || colors.info};
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10004;
            font-size: 14px;
            font-weight: 600;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }

    getBackupStatus() {
        const lastBackup = localStorage.getItem(this.BACKUP_KEY);
        const isEnabled = this.isBackupEnabled();
        
        if (!lastBackup) {
            return {
                enabled: isEnabled,
                lastBackup: null,
                daysSinceBackup: null,
                nextBackup: 'Nunca (primeiro backup pendente)',
                status: 'pending'
            };
        }
        
        const lastBackupTime = parseInt(lastBackup);
        const now = Date.now();
        const daysSinceBackup = (now - lastBackupTime) / (1000 * 60 * 60 * 24);
        const daysUntilNext = Math.max(0, this.BACKUP_INTERVAL_DAYS - daysSinceBackup);
        
        return {
            enabled: isEnabled,
            lastBackup: new Date(lastBackupTime).toLocaleString('pt-BR'),
            daysSinceBackup: Math.floor(daysSinceBackup),
            daysUntilNext: Math.ceil(daysUntilNext),
            nextBackup: daysUntilNext === 0 ? 'Agora' : `${Math.ceil(daysUntilNext)} dias`,
            status: daysUntilNext === 0 ? 'ready' : 'scheduled'
        };
    }

    showBackupSettings() {
        const status = this.getBackupStatus();
        
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10006;
        `;
        
        modal.innerHTML = `
            <div style="background: white; border-radius: 16px; padding: 32px; max-width: 500px; width: 90%;">
                <h2 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 700;">💾 Backup Automático</h2>
                
                <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <div style="margin-bottom: 12px;">
                        <strong>Status:</strong> 
                        <span style="color: ${status.enabled ? '#10b981' : '#ef4444'}; font-weight: 600;">
                            ${status.enabled ? '✅ Ativo' : '⏸️ Desativado'}
                        </span>
                    </div>
                    ${status.lastBackup ? `
                        <div style="margin-bottom: 12px;">
                            <strong>Último backup:</strong> ${status.lastBackup}
                        </div>
                        <div style="margin-bottom: 12px;">
                            <strong>Próximo backup:</strong> ${status.nextBackup}
                        </div>
                    ` : `
                        <div style="color: #f59e0b; margin-bottom: 12px;">
                            ⚠️ Nenhum backup realizado ainda
                        </div>
                    `}
                    <div>
                        <strong>Frequência:</strong> A cada ${this.BACKUP_INTERVAL_DAYS} dias
                    </div>
                </div>
                
                <div style="display: flex; gap: 12px; margin-bottom: 20px;">
                    <button onclick="window.autoBackup.setBackupEnabled(!${status.enabled}); this.closest('div').parentElement.parentElement.remove();" 
                            style="flex: 1; padding: 12px; background: ${status.enabled ? '#ef4444' : '#10b981'}; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                        ${status.enabled ? '⏸️ Desativar' : '▶️ Ativar'}
                    </button>
                    <button onclick="window.autoBackup.performBackup(false);" 
                            style="flex: 1; padding: 12px; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                        💾 Backup Agora
                    </button>
                </div>
                
                <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 20px;">
                    <label style="display: block; margin-bottom: 12px; font-weight: 600; color: #374151;">
                        📥 Restaurar Backup
                    </label>
                    <input type="file" id="restore-backup-input" accept=".json" 
                           style="width: 100%; padding: 12px; border: 2px dashed #d1d5db; border-radius: 8px; margin-bottom: 12px;">
                    <button onclick="
                        const file = document.getElementById('restore-backup-input').files[0];
                        if (file) {
                            window.autoBackup.restoreBackup(file)
                                .catch(err => window.autoBackup.showNotification('❌ ' + err.message, 'error'));
                        } else {
                            window.autoBackup.showNotification('⚠️ Selecione um arquivo', 'warning');
                        }
                    " style="width: 100%; padding: 12px; background: #10b981; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                        Restaurar
                    </button>
                </div>
                
                <button onclick="this.closest('div').parentElement.remove();" 
                        style="margin-top: 20px; width: 100%; padding: 12px; background: #f3f4f6; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; color: #374151;">
                    Fechar
                </button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }
}

// Inicialização automática
let autoBackup;
document.addEventListener('DOMContentLoaded', () => {
    autoBackup = new AutoBackupSystem();
    window.autoBackup = autoBackup;
    autoBackup.init();
    console.log('✅ Sistema de Backup Automático pronto!');
});
