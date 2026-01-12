// QUICKFIX: Execute este script para corrigir a busca
// Cole no console do navegador quando o site estiver aberto

(function() {
    console.log('🔧 QuickFix: Corrigindo busca...');
    
    // Remove o search box do mapa (se existir)
    const oldSearchBox = document.getElementById('city-search-box');
    if (oldSearchBox && oldSearchBox.parentElement && oldSearchBox.parentElement.id === 'map') {
        oldSearchBox.remove();
        console.log('✅ Search box removido do mapa');
    }
    
    // Verifica se navbar tem os elementos
    const navbarInput = document.querySelector('custom-navbar #city-search-input');
    const navbarClearBtn = document.querySelector('custom-navbar #search-clear-btn');
    const navbarResults = document.querySelector('custom-navbar #search-results');
    
    if (!navbarInput || !navbarClearBtn || !navbarResults) {
        console.error('❌ Elementos da navbar não encontrados!');
        console.log('Recarregue a página (Ctrl+F5) para forçar atualização dos arquivos');
        return;
    }
    
    // Conecta os listeners
    navbarInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        navbarClearBtn.style.display = query ? 'block' : 'none';
        
        if (query.length >= 2 && window.app) {
            window.app.performSearch(query, navbarResults);
        } else {
            navbarResults.style.display = 'none';
        }
    });
    
    navbarInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            navbarInput.value = '';
            navbarClearBtn.style.display = 'none';
            navbarResults.style.display = 'none';
        }
    });
    
    navbarClearBtn.addEventListener('click', () => {
        navbarInput.value = '';
        navbarClearBtn.style.display = 'none';
        navbarResults.style.display = 'none';
    });
    
    console.log('✅ QuickFix aplicado! Busca agora está na navbar.');
    console.log('💡 Para correção permanente, siga as instruções em PATCH-BUSCA-NAVBAR.md');
})();