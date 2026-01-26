/**
 * GeoClient SP - Sidebar Toggle Automated Tests
 * Testes automatizados para verificar funcionalidade do toggle da sidebar
 * e ajuste dos botões flutuantes
 * 
 * ATUALIZADO: Reflete novo comportamento
 * - Sidebar colapsa para 0px (antes era 60px)
 * - Botões flutuantes ficam fixos no canto direito
 */

class SidebarToggleTests {
    constructor() {
        this.results = [];
        this.sidebar = null;
        this.toggleButton = null;
        this.mapControls = null;
        this.body = null;
    }

    /**
     * Inicializa os testes
     */
    async init() {
        console.log('%c🧪 SIDEBAR TOGGLE - TESTES AUTOMATIZADOS', 'color: #8b5cf6; font-size: 16px; font-weight: bold');
        console.log('%c━'.repeat(60), 'color: #8b5cf6');
        
        // Aguardar DOM carregar
        await this.waitForDOM();
        
        // Capturar elementos
        this.captureElements();
        
        // Executar testes
        await this.runAllTests();
        
        // Mostrar resultados
        this.showResults();
    }

    /**
     * Aguarda o DOM estar pronto
     */
    waitForDOM() {
        return new Promise((resolve) => {
            if (document.readyState === 'complete') {
                resolve();
            } else {
                window.addEventListener('load', resolve);
            }
        });
    }

    /**
     * Captura referências dos elementos
     */
    captureElements() {
        this.sidebar = document.getElementById('sidebar');
        this.toggleButton = document.getElementById('sidebar-toggle');
        this.mapControls = document.querySelector('.map-controls');
        this.body = document.body;

        console.log('🎯 Elementos capturados:', {
            sidebar: !!this.sidebar,
            toggleButton: !!this.toggleButton,
            mapControls: !!this.mapControls,
            body: !!this.body
        });
    }

    /**
     * Executa todos os testes
     */
    async runAllTests() {
        const tests = [
            this.testElementsExist,
            this.testInitialState,
            this.testCSSTransitions,
            this.testToggleCollapse,
            this.testToggleExpand,
            this.testMultipleToggles,
            this.testButtonPositionsStayFixed,
            this.testIconChange,
            this.testHiddenElements,
            this.testResponsiveValues
        ];

        for (const test of tests) {
            await this.delay(200); // Delay entre testes
            await test.call(this);
        }
    }

    /**
     * Delay helper
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Registra resultado do teste
     */
    logResult(testName, passed, message = '') {
        this.results.push({ testName, passed, message });
        const icon = passed ? '✅' : '❌';
        const color = passed ? '#10b981' : '#ef4444';
        console.log(`%c${icon} ${testName}`, `color: ${color}; font-weight: 600`, message);
    }

    /**
     * Obtém valor CSS computado
     */
    getComputedValue(element, property) {
        return window.getComputedStyle(element).getPropertyValue(property);
    }

    /**
     * Converte valor CSS para número
     */
    parsePixels(value) {
        return parseFloat(value.replace('px', ''));
    }

    // ========================================
    // TESTES INDIVIDUAIS
    // ========================================

    /**
     * Teste 1: Verifica se elementos existem
     */
    async testElementsExist() {
        const allExist = this.sidebar && this.toggleButton && this.mapControls && this.body;
        this.logResult(
            'Elementos DOM existem',
            allExist,
            allExist ? 'Todos os elementos encontrados' : 'Elementos faltando'
        );
    }

    /**
     * Teste 2: Verifica estado inicial
     */
    async testInitialState() {
        const sidebarNotCollapsed = !this.sidebar.classList.contains('collapsed');
        const bodyNotCollapsed = !this.body.classList.contains('sidebar-collapsed');
        const passed = sidebarNotCollapsed && bodyNotCollapsed;
        
        this.logResult(
            'Estado inicial correto',
            passed,
            `Sidebar: ${sidebarNotCollapsed ? 'aberta' : 'fechada'}, Body: ${bodyNotCollapsed ? 'sem classe' : 'com classe'}`
        );
    }

    /**
     * Teste 3: Verifica transições CSS
     * ATUALIZADO: Botões não precisam mais de transição (ficam fixos)
     */
    async testCSSTransitions() {
        const sidebarTransition = this.getComputedValue(this.sidebar, 'transition');
        const toggleTransition = this.getComputedValue(this.toggleButton, 'transition');
        
        const hasTransitions = 
            sidebarTransition.includes('0.3s') &&
            toggleTransition.includes('0.3s');
        
        this.logResult(
            'Transições CSS configuradas',
            hasTransitions,
            `Sidebar: ${sidebarTransition.includes('0.3s') ? '0.3s ✓' : '✗'}, Toggle: ${toggleTransition.includes('0.3s') ? '0.3s ✓' : '✗'}`
        );
    }

    /**
     * Teste 4: Toggle para colapsar
     */
    async testToggleCollapse() {
        const initialWidth = this.parsePixels(this.getComputedValue(this.sidebar, 'width'));
        
        // Clicar para colapsar
        this.toggleButton.click();
        await this.delay(400); // Aguardar animação
        
        const finalWidth = this.parsePixels(this.getComputedValue(this.sidebar, 'width'));
        const hasCollapsedClass = this.sidebar.classList.contains('collapsed');
        const bodyHasClass = this.body.classList.contains('sidebar-collapsed');
        
        const passed = finalWidth < initialWidth && hasCollapsedClass && bodyHasClass;
        
        this.logResult(
            'Toggle colapsa sidebar',
            passed,
            `Width: ${initialWidth}px → ${finalWidth}px, Classes: ${hasCollapsedClass && bodyHasClass ? '✓' : '✗'}`
        );
    }

    /**
     * Teste 5: Toggle para expandir
     */
    async testToggleExpand() {
        const initialWidth = this.parsePixels(this.getComputedValue(this.sidebar, 'width'));
        
        // Clicar para expandir
        this.toggleButton.click();
        await this.delay(400);
        
        const finalWidth = this.parsePixels(this.getComputedValue(this.sidebar, 'width'));
        const hasNoClass = !this.sidebar.classList.contains('collapsed');
        const bodyHasNoClass = !this.body.classList.contains('sidebar-collapsed');
        
        const passed = finalWidth > initialWidth && hasNoClass && bodyHasNoClass;
        
        this.logResult(
            'Toggle expande sidebar',
            passed,
            `Width: ${initialWidth}px → ${finalWidth}px, Classes removidas: ${hasNoClass && bodyHasNoClass ? '✓' : '✗'}`
        );
    }

    /**
     * Teste 6: Múltiplos toggles
     */
    async testMultipleToggles() {
        const toggles = 5;
        let success = true;
        
        for (let i = 0; i < toggles; i++) {
            this.toggleButton.click();
            await this.delay(350);
            
            const expectedState = i % 2 === 0; // Par = colapsado, ímpar = expandido
            const actualState = this.sidebar.classList.contains('collapsed');
            
            if (expectedState !== actualState) {
                success = false;
                break;
            }
        }
        
        this.logResult(
            `Múltiplos toggles (${toggles}x)`,
            success,
            success ? 'Todas as alternâncias funcionaram' : 'Falha em alguma alternância'
        );
    }

    /**
     * Teste 7: Botões ficam fixos
     * ATUALIZADO: Agora valida que botões NÃO se movem
     */
    async testButtonPositionsStayFixed() {
        // Estado expandido
        if (this.sidebar.classList.contains('collapsed')) {
            this.toggleButton.click();
            await this.delay(400);
        }
        
        const expandedRight = this.parsePixels(this.getComputedValue(this.mapControls, 'right'));
        const expandedToggleLeft = this.parsePixels(this.getComputedValue(this.toggleButton, 'left'));
        
        // Colapsar
        this.toggleButton.click();
        await this.delay(400);
        
        const collapsedRight = this.parsePixels(this.getComputedValue(this.mapControls, 'right'));
        const collapsedToggleLeft = this.parsePixels(this.getComputedValue(this.toggleButton, 'left'));
        
        // Botões devem PERMANECER NO MESMO LUGAR
        const controlsStayFixed = collapsedRight === expandedRight;
        const toggleStaysFixed = collapsedToggleLeft === expandedToggleLeft;
        
        const passed = controlsStayFixed && toggleStaysFixed;
        
        this.logResult(
            'Botões ficam fixos (não se movem)',
            passed,
            `Controls: ${expandedRight}px = ${collapsedRight}px ${controlsStayFixed ? '✓' : '✗'}, Toggle: ${expandedToggleLeft}px = ${collapsedToggleLeft}px ${toggleStaysFixed ? '✓' : '✗'}`
        );
        
        // Restaurar estado expandido
        this.toggleButton.click();
        await this.delay(400);
    }

    /**
     * Teste 8: Mudança do ícone
     */
    async testIconChange() {
        const iconElement = this.toggleButton.querySelector('span');
        
        // Estado expandido
        if (this.sidebar.classList.contains('collapsed')) {
            this.toggleButton.click();
            await this.delay(400);
        }
        
        const expandedIcon = iconElement.textContent;
        
        // Colapsar
        this.toggleButton.click();
        await this.delay(400);
        
        const collapsedIcon = iconElement.textContent;
        
        // Expandir novamente
        this.toggleButton.click();
        await this.delay(400);
        
        const backToExpandedIcon = iconElement.textContent;
        
        const passed = expandedIcon !== collapsedIcon && expandedIcon === backToExpandedIcon;
        
        this.logResult(
            'Ícone muda corretamente',
            passed,
            `Aberto: "${expandedIcon}", Fechado: "${collapsedIcon}", Restaurado: "${backToExpandedIcon}"`
        );
    }

    /**
     * Teste 9: Elementos escondidos
     */
    async testHiddenElements() {
        // Colapsar
        if (!this.sidebar.classList.contains('collapsed')) {
            this.toggleButton.click();
            await this.delay(400);
        }
        
        const sidebarHeader = this.sidebar.querySelector('.sidebar-header');
        const sidebarText = this.sidebar.querySelector('.sidebar-text');
        const searchBox = this.sidebar.querySelector('.search-box-top');
        const sidebarContent = this.sidebar.querySelector('.sidebar-content');
        const sidebarFooter = this.sidebar.querySelector('.sidebar-footer');
        
        // ATUALIZADO: Agora header e footer também devem estar escondidos
        const allHidden = 
            this.getComputedValue(sidebarHeader, 'display') === 'none' &&
            this.getComputedValue(sidebarText, 'display') === 'none' &&
            this.getComputedValue(searchBox, 'display') === 'none' &&
            this.getComputedValue(sidebarContent, 'display') === 'none' &&
            this.getComputedValue(sidebarFooter, 'display') === 'none';
        
        // Expandir
        this.toggleButton.click();
        await this.delay(400);
        
        const allVisible = 
            this.getComputedValue(sidebarHeader, 'display') !== 'none' &&
            this.getComputedValue(sidebarText, 'display') !== 'none' &&
            this.getComputedValue(searchBox, 'display') !== 'none' &&
            this.getComputedValue(sidebarContent, 'display') !== 'none' &&
            this.getComputedValue(sidebarFooter, 'display') !== 'none';
        
        const passed = allHidden && allVisible;
        
        this.logResult(
            'Elementos escondem/mostram',
            passed,
            `Collapsed: ${allHidden ? 'todos escondidos' : 'alguns visíveis'}, Expanded: ${allVisible ? 'todos visíveis' : 'alguns escondidos'}`
        );
    }

    /**
     * Teste 10: Valores responsíveis
     * ATUALIZADO: Sidebar colapsa para 0px (era 60px)
     */
    async testResponsiveValues() {
        // Colapsar
        if (!this.sidebar.classList.contains('collapsed')) {
            this.toggleButton.click();
            await this.delay(400);
        }
        
        const collapsedWidth = this.parsePixels(this.getComputedValue(this.sidebar, 'width'));
        
        // Expandir
        this.toggleButton.click();
        await this.delay(400);
        
        const expandedWidth = this.parsePixels(this.getComputedValue(this.sidebar, 'width'));
        
        // ATUALIZADO: Collapsed agora é 0px (antes era 60px)
        const widthsCorrect = collapsedWidth === 0 && expandedWidth === 340;
        
        this.logResult(
            'Larguras responsíveis corretas',
            widthsCorrect,
            `Collapsed: ${collapsedWidth}px (esperado: 0px), Expanded: ${expandedWidth}px (esperado: 340px)`
        );
    }

    /**
     * Mostra resumo dos resultados
     */
    showResults() {
        console.log('%c━'.repeat(60), 'color: #8b5cf6');
        
        const totalTests = this.results.length;
        const passedTests = this.results.filter(r => r.passed).length;
        const failedTests = totalTests - passedTests;
        const successRate = Math.round((passedTests / totalTests) * 100);
        
        console.log('%c📊 RESUMO DOS TESTES', 'color: #8b5cf6; font-size: 14px; font-weight: bold');
        console.log(`%cTotal: ${totalTests} testes`, 'color: #6b7280');
        console.log(`%c✅ Passou: ${passedTests}`, 'color: #10b981; font-weight: 600');
        console.log(`%c❌ Falhou: ${failedTests}`, 'color: #ef4444; font-weight: 600');
        console.log(`%c🎯 Taxa de Sucesso: ${successRate}%`, `color: ${successRate === 100 ? '#10b981' : '#f59e0b'}; font-weight: bold; font-size: 14px`);
        
        if (successRate === 100) {
            console.log('%c✨ TODOS OS TESTES PASSARAM! Sistema 100% funcional.', 'color: #10b981; font-weight: bold; font-size: 14px');
        } else {
            console.log('%c⚠️ Alguns testes falharam. Verifique os detalhes acima.', 'color: #f59e0b; font-weight: bold');
        }
        
        console.log('%c━'.repeat(60), 'color: #8b5cf6');
        
        // Retornar resultados para uso externo
        return {
            total: totalTests,
            passed: passedTests,
            failed: failedTests,
            successRate,
            details: this.results
        };
    }
}

// ========================================
// AUTO-EXECUTAR TESTES
// ========================================

/**
 * Executa testes automaticamente após carregamento
 */
async function runSidebarTests() {
    const tester = new SidebarToggleTests();
    return await tester.init();
}

/**
 * Expor globalmente para uso manual
 */
window.testSidebar = runSidebarTests;

// Auto-executar se página já carregou
if (document.readyState === 'complete') {
    console.log('🚀 Executando testes automaticamente...');
    setTimeout(runSidebarTests, 2000); // Aguardar app carregar
} else {
    window.addEventListener('load', () => {
        console.log('🚀 Executando testes automaticamente...');
        setTimeout(runSidebarTests, 2000);
    });
}

// Exportar para uso em módulos
export { SidebarToggleTests, runSidebarTests };
export default runSidebarTests;
