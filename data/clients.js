// Base de dados de clientes - GeoClient SP (Lubrificantes)
// GT-OIL possui uma das linhas de lubrificantes e graxas mais completas do mercado
// Revendedores como CDO (Vale do Paraíba) compram da GT-OIL
// Os funcionários vão atrás de mais clientes para expandir a carteira

const CLIENTS_DATA = [
    // CDO - Vale do Paraíba (Jacareí até divisa do estado Rio de Janeiro)
    // Revendedor de GT-OIL com 5 funcionários que prospectam novos clientes
    {
        id: 1,
        name: "CDOLubrificantes",
        segment: "Lubrificantes",
        company: "CDO",
        Funcionário: "Edward Silva",
        status: "ativo",
        municipality: "Jacareí",
        lat: -23.2964,
        lng: -45.9665,
        contact: "contato@lubjacerei.com",
        phone: "(12) 3000-0001"
    },
    {
        id: 2,
        name: "CDOLubrificantes",
        segment: "Lubrificantes",
        company: "CDO",
        Funcionário: "Marcus Oliveira",
        status: "ativo",
        municipality: "São José dos Campos",
        lat: -23.1815,
        lng: -45.8866,
        contact: "contato@lubsjc.com",
        phone: "(12) 3000-0002"
    },
    {
        id: 3,
        name: "CDOLubrificantes",
        segment: "Lubrificantes",
        company: "CDO",
        Funcionário: "Ricardo Ferreira",
        status: "ativo",
        municipality: "Caçapava",
        lat: -23.0861,
        lng: -45.7084,
        contact: "contato@lubcacapava.com",
        phone: "(12) 3000-0003"
    },
    {
        id: 4,
        name: "CDOLubrificantes",
        segment: "Lubrificantes",
        company: "CDO",
        Funcionário: "Felipe Santos",
        status: "ativo",
        municipality: "Taubaté",
        lat: -23.0259,
        lng: -45.5549,
        contact: "contato@lubtaubate.com",
        phone: "(12) 3000-0004"
    },
    {
        id: 5,
        name: "CDOLubrificantes",
        segment: "Lubrificantes",
        company: "CDO",
        Funcionário: "Anderson Costa",
        status: "ativo",
        municipality: "Pindamonhangaba",
        lat: -22.3132,
        lng: -45.4634,
        contact: "contato@lubpinda.com",
        phone: "(12) 3000-0005"
    },
    {
        id: 6,
        name: "CDOLubrificantes",
        segment: "Lubrificantes",
        company: "CDO",
        Funcionário: "Edward Silva",
        status: "ativo",
        municipality: "Guaratinguetá",
        lat: -22.8028,
        lng: -45.1931,
        contact: "contato@lubguaratinguesta.com",
        phone: "(12) 3000-0006"
    },
    {
        id: 7,
        name: "CDOLubrificantes",
        segment: "Lubrificantes",
        company: "CDO",
        Funcionário: "Marcus Oliveira",
        status: "ativo",
        municipality: "Cruzeiro",
        lat: -22.5741,
        lng: -44.9889,
        contact: "contato@lubcruzeiro.com",
        phone: "(12) 3000-0007"
    },
    {
        id: 8,
        name: "CDOLubrificantes",
        segment: "Lubrificantes",
        company: "CDO",
        Funcionário: "Ricardo Ferreira",
        status: "ativo",
        municipality: "Aparecida",
        lat: -22.8553,
        lng: -45.2387,
        contact: "contato@lubaparecida.com",
        phone: "(12) 3000-0008"
    },
    {
        id: 9,
        name: "CDOLubrificantes",
        segment: "Lubrificantes",
        company: "CDO",
        Funcionário: "Felipe Santos",
        status: "ativo",
        municipality: "Itatiaia",
        lat: -22.4875,
        lng: -44.5644,
        contact: "contato@lubitatiaia.com",
        phone: "(24) 3000-0001"
    },
    {
        id: 10,
        name: "CDOLubrificantes",
        segment: "Lubrificantes",
        company: "CDO",
        Funcionário: "Anderson Costa",
        status: "ativo",
        municipality: "Volta Redonda",
        lat: -22.5054,
        lng: -44.0866,
        contact: "contato@lubvoltaredonda.com",
        phone: "(24) 3000-0002"
    },

    // SUPPORT ABCD - ABC Paulista (Santo André, São Bernardo, São Caetano, Diadema)
    // Revendedor de GT-OIL no ABC Paulista com 2 funcionários
    {
        id: 11,
        name: "SUPPORTLubrificantes",
        segment: "Lubrificantes",
        company: "SUPPORT ABCD",
        Funcionário: "Carlos Mendes",
        status: "ativo",
        municipality: "Santo André",
        lat: -23.6628,
        lng: -46.5332,
        contact: "contato@lubsandreandre.com",
        phone: "(11) 4000-0001"
    },
    {
        id: 12,
        name: "SUPPORTLubrificantes",
        segment: "Lubrificantes",
        company: "SUPPORT ABCD",
        Funcionário: "Fernanda Rocha",
        status: "ativo",
        municipality: "São Bernardo do Campo",
        lat: -23.6957,
        lng: -46.5633,
        contact: "contato@lubsbc.com",
        phone: "(11) 4000-0002"
    },
    {
        id: 13,
        name: "SUPPORTLubrificantes",
        segment: "Lubrificantes",
        company: "SUPPORT ABCD",
        Funcionário: "Carlos Mendes",
        status: "ativo",
        municipality: "São Caetano do Sul",
        lat: -23.6145,
        lng: -46.5497,
        contact: "contato@lubsaocaetano.com",
        phone: "(11) 4000-0003"
    },
    {
        id: 14,
        name: "SUPPORTLubrificantes",
        segment: "Lubrificantes",
        company: "SUPPORT ABCD",
        Funcionário: "Fernanda Rocha",
        status: "ativo",
        municipality: "Diadema",
        lat: -23.7038,
        lng: -46.6149,
        contact: "contato@lubdiadema.com",
        phone: "(11) 4000-0004"
    },

    // WAUX - Região de Guarulhos
    // Revendedor de GT-OIL em Guarulhos e região com 2 funcionários
    {
        id: 15,
        name: "WAUXLubrificantes",
        segment: "Lubrificantes",
        company: "WAUX",
        Funcionário: "Marina Souza",
        status: "ativo",
        municipality: "Guarulhos",
        lat: -23.4569,
        lng: -46.4837,
        contact: "contato@lubguarulhos.com",
        phone: "(11) 2000-0001"
    },
    {
        id: 16,
        name: "WAUXLubrificantes",
        segment: "Lubrificantes",
        company: "WAUX",
        Funcionário: "Thiago Alves",
        status: "ativo",
        municipality: "Guarulhos",
        lat: -23.3869,
        lng: -46.4937,
        contact: "contato@lubguarulhos2.com",
        phone: "(11) 2000-0002"
    },
    {
        id: 17,
        name: "WAUXLubrificantes",
        segment: "Lubrificantes",
        company: "WAUX",
        Funcionário: "Marina Souza",
        status: "ativo",
        municipality: "Arujá",
        lat: -23.3274,
        lng: -46.3187,
        contact: "contato@lubaruja.com",
        phone: "(11) 4600-0001"
    },

    // MONTEBELLO - Região de Piracicaba
    // Revendedor de GT-OIL em Piracicaba e região com 2 funcionários
    {
        id: 18,
        name: "MONTEBELLOLubrificantes",
        segment: "Lubrificantes",
        company: "MONTEBELLO",
        Funcionário: "Rafael Gomes",
        status: "ativo",
        municipality: "Piracicaba",
        lat: -22.7239,
        lng: -47.6492,
        contact: "contato@lubpiracicaba.com",
        phone: "(19) 3000-0001"
    },
    {
        id: 19,
        name: "MONTEBELLOLubrificantes",
        segment: "Lubrificantes",
        company: "MONTEBELLO",
        Funcionário: "Juliana Martins",
        status: "ativo",
        municipality: "Rio das Pedras",
        lat: -22.7450,
        lng: -47.8228,
        contact: "contato@lubriodaspe.com",
        phone: "(19) 3000-0002"
    },
    {
        id: 20,
        name: "MONTEBELLOLubrificantes",
        segment: "Lubrificantes",
        company: "MONTEBELLO",
        Funcionário: "Rafael Gomes",
        status: "ativo",
        municipality: "Capivari",
        lat: -23.0704,
        lng: -47.5487,
        contact: "contato@lubcapivari.com",
        phone: "(19) 3000-0003"
    },

    // HIRATA - Região de São Jose do Rio Preto
    // Revendedor de GT-OIL em São José do Rio Preto e região com 2 funcionários
    {
        id: 21,
        name: "HIRATALubrificantes",
        segment: "Lubrificantes",
        company: "HIRATA",
        Funcionário: "João Vicente",
        status: "ativo",
        municipality: "São Jose do Rio Preto",
        lat: -20.8137,
        lng: -49.3780,
        contact: "contato@lubsjrp.com",
        phone: "(17) 3000-0001"
    },
    {
        id: 22,
        name: "HIRATALubrificantes",
        segment: "Lubrificantes",
        company: "HIRATA",
        Funcionário: "Beatriz Pinto",
        status: "ativo",
        municipality: "Mirassol",
        lat: -20.8086,
        lng: -49.0544,
        contact: "contato@lubmirassol.com",
        phone: "(17) 3000-0002"
    },
    {
        id: 23,
        name: "HIRATALubrificantes",
        segment: "Lubrificantes",
        company: "HIRATA",
        Funcionário: "João Vicente",
        status: "ativo",
        municipality: "Catanduva",
        lat: -21.1279,
        lng: -48.9826,
        contact: "contato@lubcatanduva.com",
        phone: "(17) 3000-0003"
    },
    {
        id: 24,
        name: "HIRATALubrificantes",
        segment: "Lubrificantes",
        company: "HIRATA",
        Funcionário: "Beatriz Pinto",
        status: "ativo",
        municipality: "Votuporanga",
        lat: -20.4256,
        lng: -49.9769,
        contact: "contato@lubvotuporanga.com",
        phone: "(17) 3000-0004"
    }
];

// Municípios (principais coordenadas)
const MUNICIPALITIES = {
    // CDO - Vale do Paraíba
    "Jacareí": { lat: -23.2964, lng: -45.9665 },
    "São José dos Campos": { lat: -23.1815, lng: -45.8866 },
    "Caçapava": { lat: -23.0861, lng: -45.7084 },
    "Taubaté": { lat: -23.0259, lng: -45.5549 },
    "Pindamonhangaba": { lat: -22.3132, lng: -45.4634 },
    "Guaratinguetá": { lat: -22.8028, lng: -45.1931 },
    "Cruzeiro": { lat: -22.5741, lng: -44.9889 },
    "Aparecida": { lat: -22.8553, lng: -45.2387 },
    "Itatiaia": { lat: -22.4875, lng: -44.5644 },
    "Volta Redonda": { lat: -22.5054, lng: -44.0866 },

    // SUPPORT ABCD
    "Santo André": { lat: -23.6628, lng: -46.5332 },
    "São Bernardo do Campo": { lat: -23.6957, lng: -46.5633 },
    "São Caetano do Sul": { lat: -23.6145, lng: -46.5497 },
    "Diadema": { lat: -23.7038, lng: -46.6149 },

    // WAUX
    "Guarulhos": { lat: -23.4569, lng: -46.4837 },
    "Arujá": { lat: -23.3274, lng: -46.3187 },

    // MONTEBELLO
    "Piracicaba": { lat: -22.7239, lng: -47.6492 },
    "Rio das Pedras": { lat: -22.7450, lng: -47.8228 },
    "Capivari": { lat: -23.0704, lng: -47.5487 },

    // HIRATA
    "São Jose do Rio Preto": { lat: -20.8137, lng: -49.3780 },
    "Mirassol": { lat: -20.8086, lng: -49.0544 },
    "Catanduva": { lat: -21.1279, lng: -48.9826 },
    "Votuporanga": { lat: -20.4256, lng: -49.9769 }
};

// Funções utilitárias
function getClientsByCompany(company) {
    return CLIENTS_DATA.filter(c => c.company === company);
}

function getClientsByMunicipality(municipality) {
    return CLIENTS_DATA.filter(c => c.municipality === municipality);
}

function getOccupiedMunicipalities() {
    return [...new Set(CLIENTS_DATA.map(c => c.municipality))];
}

function getActiveClients() {
    return CLIENTS_DATA.filter(c => c.status === "ativo");
}

function addClient(clientData) {
    const newId = Math.max(...CLIENTS_DATA.map(c => c.id), 0) + 1;
    const newClient = { id: newId, ...clientData };
    CLIENTS_DATA.push(newClient);
    return newClient;
}

function updateClient(id, updates) {
    const index = CLIENTS_DATA.findIndex(c => c.id === id);
    if (index !== -1) {
        CLIENTS_DATA[index] = { ...CLIENTS_DATA[index], ...updates };
        return CLIENTS_DATA[index];
    }
    return null;
}

function deleteClient(id) {
    const index = CLIENTS_DATA.findIndex(c => c.id === id);
    if (index !== -1) {
        const deleted = CLIENTS_DATA.splice(index, 1);
        return deleted[0];
    }
    return null;
}

// Exportar para CSV
function exportClientsCSV() {
    let csv = "ID,Nome,Segmento,Empresa,Funcionário,Status,Município,Contato,Telefone\n";
    CLIENTS_DATA.forEach(client => {
        csv += `${client.id},"${client.name}","${client.segment}","${client.company}","${client.Funcionário}","${client.status}","${client.municipality}","${client.contact}","${client.phone}"\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `geoclient-sp-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
}

// Exportar para JSON
function exportClientsJSON() {
    const json = JSON.stringify(CLIENTS_DATA, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `geoclient-sp-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
}
