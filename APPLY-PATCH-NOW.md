# ✅ APLIQUE ESTE PATCH AGORA

## 🎯 OBJETIVO
Mover o campo de busca da **área do mapa** para a **NAVBAR** (barra preta no topo)

---

## 📍 ARQUIVO: `js/main.js`

### PASSO 1: Encontre estas linhas (~linha 195):

```javascript
    // 🔍 ==================== BUSCA DE CIDADE ====================
    
    createSearchBox() {
```

### PASSO 2: DELETE TUDO desde `createSearchBox() {` até o final dessa função (inclui ~88 linhas até o `}`)

Você vai deletar desde:
```javascript
    createSearchBox() {
```

Até (procure pelo último `}` da função):
```javascript
            console.log('✅ Search box criado');
        }
    }
```

---

### PASSO 3: NO MESMO LUGAR, cole este código:

```javascript
    // 🔍 ==================== BUSCA DE CIDADE (USA NAVBAR) ====================
    
    setupSearchListeners() {
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
        }, 500);
    }
```

---

### PASSO 4: Encontre o método `init()` (~linha 420)

Procure por esta linha:
```javascript
            this.createSearchBox(); // ✨ NOVO
```

### PASSO 5: SUBSTITUA por:
```javascript
            this.setupSearchListeners(); // ✨ Conecta com navbar
```

---

## ✅ PRONTO!

### Salve o arquivo e teste:

1. **Salve** `js/main.js`
2. **Limpe o cache** do navegador (Ctrl+Shift+Del)
3. **Recarregue** a página (Ctrl+F5)
4. O campo de busca deve aparecer na **NAVBAR** agora!

---

## 🧪 TESTE

✅ Campo de busca está na barra preta no topo?  
✅ NÃO está mais no mapa?  
✅ Ao digitar, aparecem resultados?  
✅ Ao clicar em resultado, dá zoom na cidade?  

**SE SIM → PATCH APLICADO COM SUCESSO! 🎉**

---

## ❌ SE NÃO FUNCIONAR

1. Verifique se salvou o arquivo
2. Limpe cache do navegador
3. Abra Console (F12) e veja se há erros
4. Certifique-se que não deletou as funções `performSearch()`, `searchSelectCity()` ou `hideSearchResults()`

---

## 📞 RESUMO RÁPIDO

| O que fazer | Onde |
|-------------|------|
| **DELETE** `createSearchBox()` | Linha ~195 |
| **COLE** `setupSearchListeners()` | No lugar |
| **TROQUE** `this.createSearchBox()` | Linha ~420 no `init()` |
| **POR** `this.setupSearchListeners()` | Mesma linha |