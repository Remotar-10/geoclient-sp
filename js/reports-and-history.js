// 📄🔍 GeoClient SP - PDF Reports & Activity Log
// v1.0 - Sistema de Relatórios PDF + Histórico de Atividades

class ReportsAndHistory {
    constructor(app) {
        this.app = app;
        this.activityLog = [];
        this.logModal = null;
        this.loadActivityLog();
        console.log('✅ ReportsAndHistory initialized');
    }

    // 📋 ==================== ACTIVITY LOG ====================
    
    loadActivityLog() {
        try {
            const saved = localStorage.getItem('geoclient-activity-log');
            if (saved) {
                this.activityLog = JSON.parse(saved);
                console.log(`📋 ${this.activityLog.length} atividades carregadas`);
            }
        } catch (error) {
            console.error('❌ Erro ao carregar log:', error);
        }
    }
    
    saveActivityLog() {
        try {
            localStorage.setItem('geoclient-activity-log', JSON.stringify(this.activityLog));
        } catch (error) {
            console.error('❌ Erro ao salvar log:', error);
        }
    }
    
    addActivity(type, description, details = {}) {
        const activity = {
            id: Date.now(),
            type, // 'city_marked', 'company_added', 'export', 'import', 'delete', etc
            description,
            details,
            timestamp: new Date().toISOString(),
            user: 'Usuário' // TODO: quando tiver autenticação
        };
        
        this.activityLog.unshift(activity); // Adiciona no início
        
        // Limita a 500 atividades
        if (this.activityLog.length > 500) {
            this.activityLog = this.activityLog.slice(0, 500);
        }
        
        this.saveActivityLog();
        console.log(`📝 Atividade registrada: ${type}`);
    }
    
    showActivityLog() {
        if (!this.logModal) {
            this.createLogModal();
        }
        
        this.renderActivityLog();
        this.logModal.style.display = 'block';
    }
    
    hideActivityLog() {
        if (this.logModal) {
            this.logModal.style.display = 'none';
        }
    }
    
    createLogModal() {
        const existingModal = document.getElementById('activity-log-modal');
        if (existingModal) existingModal.remove();
        
        this.logModal = document.createElement('div');
        this.logModal.id = 'activity-log-modal';
        this.logModal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: none;
            z-index: 10005;
            overflow-y: auto;
            padding: 20px;
        `;
        document.body.appendChild(this.logModal);
        
        this.logModal.addEventListener('click', (e) => {
            if (e.target === this.logModal) {
                this.hideActivityLog();
            }
        });
    }
    
    renderActivityLog(filter = 'all') {
        let filtered = this.activityLog;
        
        if (filter !== 'all') {
            filtered = this.activityLog.filter(a => a.type === filter);
        }
        
        const typeIcons = {
            'city_marked': '📍',
            'company_added': '🏢',
            'company_removed': '🗑️',
            'export': '📥',
            'import': '📤',
            'delete': '❌',
            'filter_applied': '🔍',
            'dashboard_opened': '📊',
            'data_cleared': '🧹'
        };
        
        const typeColors = {
            'city_marked': '#3b82f6',
            'company_added': '#10b981',
            'company_removed': '#ef4444',
            'export': '#f59e0b',
            'import': '#8b5cf6',
            'delete': '#dc2626',
            'filter_applied': '#6366f1',
            'dashboard_opened': '#ec4899',
            'data_cleared': '#6b7280'
        };
        
        let modalContent = `
            <div style="max-width: 1000px; margin: 40px auto; background: white; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); overflow: hidden;">
                <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 32px; color: white;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h2 style="margin: 0 0 8px 0; font-size: 32px; font-weight: 700;">📋 Histórico de Atividades</h2>
                            <p style="margin: 0; opacity: 0.9; font-size: 16px;">${this.activityLog.length} atividades registradas</p>
                        </div>
                        <button onclick="window.reportsAndHistory.hideActivityLog();" style="
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
                        " onmouseover="this.style.background='rgba(255,255,255,0.3)';" onmouseout="this.style.background='rgba(255,255,255,0.2)';">×</button>
                    </div>
                </div>
                
                <div style="padding: 32px;">
                    <!-- FILTROS -->
                    <div style="display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap;">
                        <button onclick="window.reportsAndHistory.renderActivityLog('all')" style="
                            padding: 8px 16px;
                            background: ${filter === 'all' ? '#6366f1' : '#f3f4f6'};
                            color: ${filter === 'all' ? 'white' : '#374151'};
                            border: none;
                            border-radius: 8px;
                            font-weight: 600;
                            cursor: pointer;
                            font-size: 13px;
                        ">Todas (${this.activityLog.length})</button>
                        
                        ${['city_marked', 'company_added', 'export', 'import', 'delete'].map(type => {
                            const count = this.activityLog.filter(a => a.type === type).length;
                            if (count === 0) return '';
                            return `
                                <button onclick="window.reportsAndHistory.renderActivityLog('${type}')" style="
                                    padding: 8px 16px;
                                    background: ${filter === type ? typeColors[type] : '#f3f4f6'};
                                    color: ${filter === type ? 'white' : '#374151'};
                                    border: none;
                                    border-radius: 8px;
                                    font-weight: 600;
                                    cursor: pointer;
                                    font-size: 13px;
                                ">${typeIcons[type]} ${type.replace(/_/g, ' ')} (${count})</button>
                            `;
                        }).join('')}
                        
                        <button onclick="window.reportsAndHistory.exportLogToCSV()" style="
                            padding: 8px 16px;
                            background: #10b981;
                            color: white;
                            border: none;
                            border-radius: 8px;
                            font-weight: 600;
                            cursor: pointer;
                            font-size: 13px;
                            margin-left: auto;
                        ">📥 Exportar Log CSV</button>
                        
                        <button onclick="if(confirm('Limpar TODO o histórico?')) window.reportsAndHistory.clearLog()" style="
                            padding: 8px 16px;
                            background: #ef4444;
                            color: white;
                            border: none;
                            border-radius: 8px;
                            font-weight: 600;
                            cursor: pointer;
                            font-size: 13px;
                        ">🗑️ Limpar</button>
                    </div>
                    
                    <!-- TIMELINE -->
                    <div style="max-height: 500px; overflow-y: auto;">
        `;
        
        if (filtered.length === 0) {
            modalContent += `
                <div style="text-align: center; padding: 60px 20px; color: #9ca3af;">
                    <div style="font-size: 64px; margin-bottom: 16px;">📋</div>
                    <div style="font-size: 18px; font-weight: 600;">Nenhuma atividade encontrada</div>
                    <div style="font-size: 14px; margin-top: 8px;">As ações realizadas aparecerão aqui</div>
                </div>
            `;
        } else {
            filtered.forEach((activity, index) => {
                const date = new Date(activity.timestamp);
                const timeAgo = this.getTimeAgo(date);
                const icon = typeIcons[activity.type] || '📝';
                const color = typeColors[activity.type] || '#6b7280';
                
                modalContent += `
                    <div style="
                        display: flex;
                        gap: 16px;
                        padding: 16px;
                        background: #f9fafb;
                        border-radius: 12px;
                        margin-bottom: 12px;
                        border-left: 4px solid ${color};
                        transition: all 0.2s;
                    " onmouseover="this.style.background='#f3f4f6';" onmouseout="this.style.background='#f9fafb';">
                        <div style="
                            width: 48px;
                            height: 48px;
                            background: ${color};
                            border-radius: 12px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 24px;
                            flex-shrink: 0;
                        ">${icon}</div>
                        
                        <div style="flex: 1;">
                            <div style="font-weight: 700; color: #1f2937; font-size: 15px; margin-bottom: 4px;">${activity.description}</div>
                            <div style="font-size: 13px; color: #6b7280; margin-bottom: 8px;">${timeAgo} • ${date.toLocaleString('pt-BR')}</div>
                            ${Object.keys(activity.details).length > 0 ? `
                                <div style="font-size: 12px; color: #9ca3af; background: white; padding: 8px; border-radius: 6px; margin-top: 8px;">
                                    ${Object.entries(activity.details).map(([key, value]) => `
                                        <span style="margin-right: 12px;"><strong>${key}:</strong> ${value}</span>
                                    `).join('')}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `;
            });
        }
        
        modalContent += `
                    </div>
                </div>
            </div>
        `;
        
        this.logModal.innerHTML = modalContent;
    }
    
    getTimeAgo(date) {
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (minutes < 1) return 'Agora mesmo';
        if (minutes < 60) return `${minutes} min atrás`;
        if (hours < 24) return `${hours}h atrás`;
        if (days < 30) return `${days}d atrás`;
        return date.toLocaleDateString('pt-BR');
    }
    
    exportLogToCSV() {
        if (this.activityLog.length === 0) {
            alert('⚠️ Nenhuma atividade para exportar!');
            return;
        }
        
        let csv = 'Data/Hora,Tipo,Descrição,Usuário,Detalhes\n';
        
        this.activityLog.forEach(activity => {
            const date = new Date(activity.timestamp).toLocaleString('pt-BR');
            const details = JSON.stringify(activity.details).replace(/"/g, "'");
            csv += `"${date}","${activity.type}","${activity.description}","${activity.user}","${details}"\n`;
        });
        
        const BOM = '\uFEFF';
        const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `activity_log_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        
        this.addActivity('export', 'Log de atividades exportado para CSV', { entries: this.activityLog.length });
        console.log('📥 Log exportado para CSV');
    }
    
    clearLog() {
        this.activityLog = [];
        this.saveActivityLog();
        this.renderActivityLog();
        console.log('🗑️ Log de atividades limpo');
    }

    // 📄 ==================== PDF EXPORT ====================
    
    async exportDashboardToPDF() {
        // Verifica se as bibliotecas estão carregadas
        if (typeof jspdf === 'undefined' || typeof html2canvas === 'undefined') {
            alert('❌ Erro: Bibliotecas PDF não carregadas. Recarregue a página.');
            return;
        }
        
        try {
            const { jsPDF } = jspdf;
            
            // Mostra loading
            const loadingToast = this.showLoadingToast('📄 Gerando PDF...');
            
            // Captura o dashboard
            const dashboardElement = document.getElementById('dashboard-modal');
            if (!dashboardElement || dashboardElement.style.display === 'none') {
                alert('⚠️ Abra o dashboard primeiro para exportar!');
                loadingToast.remove();
                return;
            }
            
            // Captura apenas o conteúdo interno (sem fundo escuro)
            const dashboardContent = dashboardElement.querySelector('div > div');
            if (!dashboardContent) {
                alert('❌ Erro ao capturar dashboard');
                loadingToast.remove();
                return;
            }
            
            // Renderiza como imagem
            const canvas = await html2canvas(dashboardContent, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });
            
            const imgData = canvas.toDataURL('image/png');
            
            // Cria PDF
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });
            
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = pageWidth - 20; // 10mm margem de cada lado
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            let heightLeft = imgHeight;
            let position = 10;
            
            // Adiciona a imagem (com paginação se necessário)
            pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
            
            while (heightLeft > 0) {
                position = heightLeft - imgHeight + 10;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }
            
            // Adiciona rodapé
            const totalPages = pdf.internal.pages.length - 1;
            for (let i = 1; i <= totalPages; i++) {
                pdf.setPage(i);
                pdf.setFontSize(9);
                pdf.setTextColor(150);
                pdf.text(
                    `GeoClient SP - ${new Date().toLocaleDateString('pt-BR')} - Página ${i} de ${totalPages}`,
                    pageWidth / 2,
                    pageHeight - 10,
                    { align: 'center' }
                );
            }
            
            // Salva o PDF
            const filename = `dashboard_geoclient_${new Date().toISOString().split('T')[0]}.pdf`;
            pdf.save(filename);
            
            loadingToast.remove();
            this.app.showToast('✅ PDF gerado com sucesso!', 'success');
            
            this.addActivity('export', 'Dashboard exportado para PDF', { filename });
            console.log('📄 PDF exportado:', filename);
            
        } catch (error) {
            console.error('❌ Erro ao gerar PDF:', error);
            alert('❌ Erro ao gerar PDF: ' + error.message);
        }
    }
    
    showLoadingToast(message) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: #3b82f6;
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10010;
            font-size: 14px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 12px;
        `;
        
        toast.innerHTML = `
            <div style="width: 20px; height: 20px; border: 3px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 1s linear infinite;"></div>
            <span>${message}</span>
        `;
        
        const style = document.createElement('style');
        style.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
        document.head.appendChild(style);
        
        document.body.appendChild(toast);
        return toast;
    }
}

// ✅ EXPÕE GLOBALMENTE
window.ReportsAndHistory = ReportsAndHistory;
console.log('✅ ReportsAndHistory class loaded');