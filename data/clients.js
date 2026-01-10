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
const MUNICIPALITIES = {
    'São Paulo': { lat: -23.5505, lng: -46.6333 },
    'Guarulhos': { lat: -23.4538, lng: -46.5333 },
    'Campinas': { lat: -22.9099, lng: -47.0626 },
    'São Bernardo do Campo': { lat: -23.6914, lng: -46.5646 },
    'Santo André': { lat: -23.6636, lng: -46.5341 },
    'Osasco': { lat: -23.5329, lng: -46.7919 },
    'São José dos Campos': { lat: -23.1791, lng: -45.8872 },
    'Ribeirão Preto': { lat: -21.1704, lng: -47.8103 },
    'Sorocaba': { lat: -23.5015, lng: -47.4526 },
    'Santos': { lat: -23.9608, lng: -46.3336 },
    'São José do Rio Preto': { lat: -20.8197, lng: -49.3794 },
    'Mogi das Cruzes': { lat: -23.5229, lng: -46.1882 },
    'Diadema': { lat: -23.6858, lng: -46.6228 },
    'Piracicaba': { lat: -22.7253, lng: -47.6492 },
    'Bauru': { lat: -22.3147, lng: -49.0608 },
    'Guarujá': { lat: -23.9933, lng: -46.2564 },
    'Taubaté': { lat: -23.0265, lng: -45.5553 },
    'Jacareí': { lat: -23.3055, lng: -45.9658 },
    'Americana': { lat: -22.7394, lng: -47.3314 },
    'Guaratinguetá': { lat: -22.8164, lng: -45.1931 },
    'Caraguatatuba': { lat: -23.6202, lng: -45.4133 },
    'Ubatuba': { lat: -23.4339, lng: -45.0839 },
    'São Sebastião': { lat: -23.8000, lng: -45.4069 },
    'Ilhabela': { lat: -23.7783, lng: -45.3578 },
    'Aparecida': { lat: -22.8489, lng: -45.2311 },
    'Cruzeiro': { lat: -22.5764, lng: -44.9575 },
    'Lorena': { lat: -22.7311, lng: -45.1244 },
    'Cachoeira Paulista': { lat: -22.6661, lng: -45.0117 },
    'Campos do Jordão': { lat: -22.7394, lng: -45.5914 },
    'Tremembé': { lat: -22.9575, lng: -45.5489 },
    'Caçapava': { lat: -23.1008, lng: -45.7069 },
    'Santa Branca': { lat: -23.3969, lng: -45.8842 },
    'Piquete': { lat: -22.6144, lng: -45.1764 },
    'Lagoinha': { lat: -23.0889, lng: -45.1939 },
    'Queluz': { lat: -22.5403, lng: -44.7761 },
    'Potim': { lat: -22.8369, lng: -45.2542 },
    'Roseira': { lat: -22.8994, lng: -45.3050 },
    'Guararema': { lat: -23.4158, lng: -46.0367 },
    'Santa Isabel': { lat: -23.3186, lng: -46.2214 },
    'Pindamonhangaba': { lat: -22.9239, lng: -45.4617 }
};

console.log('✅ Arquivo clients.js carregado - MAPA LIMPO');
console.log('📊 Total de clientes:', CLIENTS_DATA.length);
