// ✅ CLIENTS_DATA VAZIO - Mapa começa limpo
const CLIENTS_DATA = [];

// Funções auxiliares
function getOccupiedMunicipalities() {
    return [...new Set(CLIENTS_DATA.map(client => client.municipality))];
}

function addClient(newClient) {
    const newId = CLIENTS_DATA.length > 0 ? Math.max(...CLIENTS_DATA.map(c => c.id)) + 1 : 1;
    CLIENTS_DATA.push({ id: newId, ...newClient });
    console.log('✅ Cliente adicionado:', newClient.name);
}

function updateClient(clientId, updates) {
    const index = CLIENTS_DATA.findIndex(c => c.id === clientId);
    if (index !== -1) {
        CLIENTS_DATA[index] = { ...CLIENTS_DATA[index], ...updates };
        console.log('✅ Cliente atualizado:', CLIENTS_DATA[index].name);
    }
}

function deleteClient(clientId) {
    const index = CLIENTS_DATA.findIndex(c => c.id === clientId);
    if (index !== -1) {
        const deletedClient = CLIENTS_DATA.splice(index, 1)[0];
        console.log('🗑️ Cliente deletado:', deletedClient.name);
    }
}

function exportClientsCSV() {
    if (CLIENTS_DATA.length === 0) {
        alert('Nenhum cliente para exportar!');
        return;
    }
    
    const csv = [
        ['ID', 'Nome', 'Município', 'Empresa', 'Segmento', 'Funcionário', 'Status', 'Contato', 'Telefone'],
        ...CLIENTS_DATA.map(c => [
            c.id, c.name, c.municipality, c.company, c.segment,
            c.Funcionário, c.status, c.contact, c.phone
        ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'clientes.csv';
    a.click();
    console.log('📥 Dados exportados em CSV');
}

function exportClientsJSON() {
    if (CLIENTS_DATA.length === 0) {
        alert('Nenhum cliente para exportar!');
        return;
    }
    
    const json = JSON.stringify(CLIENTS_DATA, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'clientes.json';
    a.click();
    console.log('📥 Dados exportados em JSON');
}

// Coordenadas dos municípios de SP
const MUNICIPALITIES
