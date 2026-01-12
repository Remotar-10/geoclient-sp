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
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                            GC
                        </div>
                        <div>
                            <h1 class="text-xl font-bold text-gray-900">GeoClient SP</h1>
                            <p class="text-xs text-gray-500">Territorial Mastery</p>
                        </div>
                    </div>
                    
                    <div class="flex items-center gap-4">
                        <!-- Avatar do usuário -->
                        <div class="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-700 font-bold cursor-pointer hover:bg-gray-400 transition" title="Perfil">
                            U
                        </div>
                    </div>
                </div>
            </nav>
        `;
    }
}

customElements.define('custom-navbar', CustomNavbar);