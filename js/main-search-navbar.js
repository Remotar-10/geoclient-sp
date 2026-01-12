// Patch para mover busca para navbar
// Adicione este código após a função exportJSON() no main.js original

// Sobrescreve createSearchBox com setupSearchListeners
GeoClientApp.prototype.setupSearchListeners = function() {
    // Aguarda a navbar carregar
    setTimeout(() => {
        const input = document.getElementById('city-search-input');
        const clearBtn = document.getElementById('search-clear-btn');
        const results = document.getElementById('search-results');
        
        if (!input || !clearBtn || !results) {
            console.error('❌ Elementos de busca não encontrados na navbar!');
            return;
        }
        
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
        
        clearBtn.addEventListener('click', () => {
            input.value = '';
            clearBtn.style.display = 'none';
            this.hideSearchResults(results);
        });
        
        console.log('✅ Search listeners configurados (navbar)');
    }, 500); // Aguarda navbar carregar
};

// Mantém performSearch() e searchSelectCity() inalterados
// Eles já existem no main.js original e funcionam perfeitamente

console.log('✅ Patch de busca na navbar carregado!');
console.log('📝 ATENÇÃO: No método init(), troque:');
console.log('   this.createSearchBox() → this.setupSearchListeners()');