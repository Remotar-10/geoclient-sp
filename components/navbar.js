// Custom Navbar Component
class CustomNavbar extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.render();
    }

    render() {
        this.innerHTML = `
            <nav class="bg-white shadow-md">
                <div class="container mx-auto px-4 py-4 flex justify-between items-center">
                    <!-- Logo -->
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                            GC
                        </div>
                        <div>
                            <h1 class="text-xl font-bold text-gray-900">GeoClient SP</h1>
                        </div>
                    </div>
                    
                    <!-- 🆕 BUSCA DE CIDADE (centro) -->
                    <div id="navbar-search-container" style="
                        flex: 1;
                        max-width: 500px;
                        margin: 0 40px;
                        position: relative;
                    ">
                        <div id="city-search-box" style="
                            background: #f9fafb;
                            border: 2px solid #e5e7eb;
                            border-radius: 8px;
                            padding: 10px 16px;
                            display: flex;
                            align-items: center;
                            gap: 12px;
                            transition: all 0.2s;
                        ">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="11" cy="11" r="8"></circle>
                                <path d="m21 21-4.35-4.35"></path>
                            </svg>
                            
                            <input 
                                type="text" 
                                id="city-search-input" 
                                placeholder="Buscar cidade..."
                                style="
                                    flex: 1;
                                    border: none;
                                    outline: none;
                                    background: transparent;
                                    font-size: 15px;
                                    color: #1f2937;
                                "
                            />
                            
                            <button id="search-clear-btn" style="
                                display: none;
                                background: #e5e7eb;
                                border: none;
                                border-radius: 4px;
                                width: 24px;
                                height: 24px;
                                cursor: pointer;
                                font-size: 18px;
                                color: #6b7280;
                                line-height: 1;
                                transition: all 0.2s;
                            ">×</button>
                        </div>
                        
                        <!-- Resultados da busca -->
                        <div id="search-results" style="
                            display: none;
                            position: absolute;
                            top: calc(100% + 8px);
                            left: 0;
                            right: 0;
                            background: white;
                            border-radius: 8px;
                            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                            max-height: 400px;
                            overflow-y: auto;
                            z-index: 1000;
                            border: 2px solid #e5e7eb;
                        "></div>
                    </div>
                    
                    <!-- Espaço direita (para balancear) -->
                    <div style="width: 140px;"></div>
                </div>
            </nav>
            
            <style>
                #city-search-box:focus-within {
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                    background: white;
                }
                
                #search-clear-btn:hover {
                    background: #d1d5db;
                }
                
                #search-results::-webkit-scrollbar {
                    width: 8px;
                }
                
                #search-results::-webkit-scrollbar-track {
                    background: #f3f4f6;
                    border-radius: 4px;
                }
                
                #search-results::-webkit-scrollbar-thumb {
                    background: #d1d5db;
                    border-radius: 4px;
                }
                
                #search-results::-webkit-scrollbar-thumb:hover {
                    background: #9ca3af;
                }
            </style>
        `;
    }
}

customElements.define('custom-navbar', CustomNavbar);