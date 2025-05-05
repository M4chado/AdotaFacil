document.addEventListener("DOMContentLoaded", () => {
    // Carregar o cabeçalho
    fetch('header.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('header-container').innerHTML = data;
            // Após carregar o cabeçalho, verificar se o usuário está logado
            setTimeout(checkLoginStatus, 100); // Pequeno delay para garantir que o DOM foi carregado
        });

    // Carregar o rodapé
    fetch('footer.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('footer-container').innerHTML = data;
        });
});

// Função para verificar o status de login e atualizar o cabeçalho
function checkLoginStatus() {
    const navMenu = document.getElementById('nav-menu');
    if (!navMenu) return; // Se o menu não existir, sair da função
    
    // Verificar se há um usuário logado
    const currentUser = sessionStorage.getItem('currentUser') ? JSON.parse(sessionStorage.getItem('currentUser')) : null;
    
    if (currentUser) {
        // Usuário está logado - mostrar o menu completo com saudação ANTES do link Perfil
        navMenu.innerHTML = `
            <li><a href="index.html" class="nav-link">Início</a></li>
            <li><span class="user-greeting">Olá, ${currentUser.nome.split(' ')[0]}</span></li>
            <li><a href="Perfil.html" class="nav-link">Perfil</a></li>
            <li><a href="cadastrapet.html" class="nav-link">Doe um Pet</a></li>
        `;
    } else {
        // Usuário não está logado - mostrar menu simples com botão estilizado
        navMenu.innerHTML = `
            <li><a href="index.html" class="nav-link">Início</a></li>
            <li><a href="login.html" class="login-btn"><i class="login-icon"></i>Login/Cadastro</a></li>
        `;
    }
    
    // Verificar qual é a página atual e marcar o link como ativo
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');
        }
    });
}
const pets = [
    {
        id: 1,
        name: "Max",
        type: "dog",
        breed: "Labrador",
        age: "2 anos",
        size: "large",
        gender: "Macho",
        description: "Max é um labrador muito carinhoso e brincalhão. Ele adora correr e brincar no parque. É um cão muito inteligente e já sabe alguns comandos básicos.",
        location: "São Paulo, SP",
        vaccinated: true,
        neutered: true,
        image: "/api/placeholder/300/300"
    },
    {
        id: 2,
        name: "Luna",
        type: "cat",
        breed: "Siamês",
        age: "1 ano",
        size: "small",
        gender: "Fêmea",
        description: "Luna é uma gatinha siamesa muito dócil e carinhosa. Ela adora ficar no colo e ronronar. É muito limpa e já está treinada para usar a caixa de areia.",
        location: "Rio de Janeiro, RJ",
        vaccinated: true,
        neutered: true,
        image: "/api/placeholder/301/300"
    },
    {
        id: 3,
        name: "Thor",
        type: "dog",
        breed: "Rottweiler",
        age: "3 anos",
        size: "large",
        gender: "Macho",
        description: "Thor é um rottweiler muito dócil e protetor. Ele é ótimo com crianças e muito fiel aos seus donos. Precisa de espaço para se exercitar.",
        location: "Belo Horizonte, MG",
        vaccinated: true,
        neutered: false,
        image: "/api/placeholder/302/300"
    },
    {
        id: 4,
        name: "Nina",
        type: "cat",
        breed: "Persa",
        age: "4 anos",
        size: "small",
        gender: "Fêmea",
        description: "Nina é uma gata persa muito calma e independente. Ela gosta de ter seu próprio espaço mas também aprecia carinho. Tem pelagem longa que precisa de escovação regular.",
        location: "Curitiba, PR",
        vaccinated: true,
        neutered: true,
        image: "/api/placeholder/303/300"
    },
    {
        id: 5,
        name: "Rex",
        type: "dog",
        breed: "Beagle",
        age: "1 ano",
        size: "medium",
        gender: "Macho",
        description: "Rex é um beagle muito energético e brincalhão. Ele adora farejar e explorar novos ambientes. Precisa de bastante atividade física.",
        location: "Salvador, BA",
        vaccinated: true,
        neutered: false,
        image: "imagens/teste.png"
    },
    {
        id: 6,
        name: "Mel",
        type: "dog",
        breed: "Poodle",
        age: "5 anos",
        size: "small",
        gender: "Fêmea",
        description: "Mel é uma poodle muito inteligente e afetuosa. Ela já está treinada e adora aprender novos truques. É ótima companhia para qualquer família.",
        location: "Brasília, DF",
        vaccinated: true,
        neutered: true,
        image: "/api/placeholder/305/300"
    },
    {
        id: 7,
        name: "Simba",
        type: "cat",
        breed: "Maine Coon",
        age: "2 anos",
        size: "medium",
        gender: "Macho",
        description: "Simba é um maine coon muito sociável e brincalhão. Ele se dá bem com outros animais e adora brincar com bolinhas. É um gato grande e majestoso.",
        location: "Porto Alegre, RS",
        vaccinated: true,
        neutered: true,
        image: "/api/placeholder/306/300"
    },
    {
        id: 8,
        name: "Lola",
        type: "other",
        breed: "Coelho",
        age: "1 ano",
        size: "small",
        gender: "Fêmea",
        description: "Lola é uma coelha muito dócil e curiosa. Ela gosta de ser acariciada e explorar seu ambiente. Precisa de espaço para se exercitar.",
        location: "Fortaleza, CE",
        vaccinated: true,
        neutered: false,
        image: "/api/placeholder/307/300"
    },
    {
        id: 9,
        name: "Bob",
        type: "dog",
        breed: "Bulldog Francês",
        age: "3 anos",
        size: "medium",
        gender: "Macho",
        description: "Bob é um bulldog francês muito carinhoso e tranquilo. Ele adora dormir e receber carinho. É ótimo para quem procura um cão menos agitado.",
        location: "Recife, PE",
        vaccinated: true,
        neutered: true,
        image: "/api/placeholder/308/300"
    },
    {
        id: 10,
        name: "Mia",
        type: "cat",
        breed: "Ragdoll",
        age: "2 anos",
        size: "medium",
        gender: "Fêmea",
        description: "Mia é uma ragdoll muito dócil e carinhosa. Ela adora ficar no colo e ser acariciada. É uma gata muito tranquila e afetuosa.",
        location: "Belém, PA",
        vaccinated: true,
        neutered: true,
        image: "/api/placeholder/309/300"
    },
    {
        id: 11,
        name: "Zeus",
        type: "dog",
        breed: "Pastor Alemão",
        age: "4 anos",
        size: "large",
        gender: "Macho",
        description: "Zeus é um pastor alemão muito inteligente e leal. Ele é ótimo cão de guarda e muito protetor com sua família. Precisa de exercícios regulares.",
        location: "Goiânia, GO",
        vaccinated: true,
        neutered: false,
        image: "/api/placeholder/310/300"
    },
    {
        id: 12,
        name: "Pipoca",
        type: "other",
        breed: "Hamster",
        age: "6 meses",
        size: "small",
        gender: "Fêmea",
        description: "Pipoca é uma hamster muito ativa e curiosa. Ela adora correr em sua rodinha e explorar tubos. É perfeita para quem quer um pet pequeno.",
        location: "Manaus, AM",
        vaccinated: false,
        neutered: false,
        image: "/api/placeholder/311/300"
    }
];

// DOM elements
let petsGrid;
let filterTabs;
let petModal;
let closeModal;
let petDetails;

// Current filter state
let currentFilter = {
    size: 'all',
    type: null
};

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements after page is loaded
    petsGrid = document.getElementById('petsGrid');
    filterTabs = document.querySelectorAll('.filter-tab');
    petModal = document.getElementById('petModal');
    closeModal = document.getElementById('closeModal');
    petDetails = document.getElementById('petDetails');
    
    renderPets(pets);
    initFilterTabs();
    
    // Close modal event
    closeModal.addEventListener('click', () => {
        petModal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Restore scrolling
    });

    // Close modal if clicked outside content
    window.addEventListener('click', (e) => {
        if (e.target === petModal) {
            petModal.style.display = 'none';
            document.body.style.overflow = 'auto'; // Restore scrolling
        }
    });
});

// Render pets based on filters
function renderPets(petsArray) {
    petsGrid.innerHTML = '';
    
    const filteredPets = petsArray.filter(pet => {
        if (currentFilter.size !== 'all' && pet.size !== currentFilter.size) {
            return false;
        }
        if (currentFilter.type && pet.type !== currentFilter.type) {
            return false;
        }
        return true;
    });
    
    if (filteredPets.length === 0) {
        petsGrid.innerHTML = '<div class="no-results">Nenhum pet encontrado com os filtros selecionados.</div>';
        return;
    }
    
    filteredPets.forEach(pet => {
        const petCard = createPetCard(pet);
        petsGrid.appendChild(petCard);
    });
}

function createPetCard(pet) {
    const card = document.createElement('div');
    card.className = 'pet-card';
    
    // Map size to display text
    const sizeText = {
        'small': 'Pequeno',
        'medium': 'Médio',
        'large': 'Grande'
    };
    
    card.innerHTML = `
        <div class="pet-image">
            <img src="${pet.image}" alt="${pet.name}">
        </div>
        <div class="pet-info">
            <h3 class="pet-name">${pet.name}</h3>
            <p class="pet-breed">${pet.breed} • ${pet.age} • Porte ${sizeText[pet.size]}</p>
            <div class="pet-actions">
                <a href="#" class="pet-action-btn view-details" data-id="${pet.id}">Ver Detalhes</a>
                <button class="favorite-btn" data-id="${pet.id}">♡</button>
            </div>
        </div>
    `;
    
    // Add event listener to view details button
    card.querySelector('.view-details').addEventListener('click', (e) => {
        e.preventDefault();
        openPetDetails(pet.id);
    });
    
    // Add event listener to favorite button
    card.querySelector('.favorite-btn').addEventListener('click', function() {
        this.classList.toggle('active');
        this.textContent = this.classList.contains('active') ? '♥' : '♡';
    });
    
    return card;
}

// Initialize filter tabs
function initFilterTabs() {
    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            filterTabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            tab.classList.add('active');
            
            // Update filter state
            if (tab.dataset.size) {
                currentFilter.size = tab.dataset.size;
                // If we're clicking a size filter, keep the type filter if any
            }
            
            if (tab.dataset.type) {
                currentFilter.type = tab.dataset.type;
                // If we're clicking a type filter, reset size filter to all
                currentFilter.size = 'all';
            }
            
            // Re-render pets with new filter
            renderPets(pets);
        });
    });
}

// Função openPetDetails atualizada para incluir porte na linha de subtítulo
function openPetDetails(petId) {
    const pet = pets.find(p => p.id === petId);
    if (!pet) return;
    
    // Map size to display text
    const sizeText = {
        'small': 'Pequeno',
        'medium': 'Médio',
        'large': 'Grande'
    };
    
    // Map type to display text
    const typeText = {
        'dog': 'Cachorro',
        'cat': 'Gato',
        'other': 'Outro'
    };
    
    petDetails.innerHTML = `
        <div class="pet-details-compact">
            <div class="pet-details-image-compact">
                <img src="${pet.image}" alt="${pet.name}">
            </div>
            
            <div class="pet-details-info-compact">
                <div class="pet-details-title">
                    <h2>${pet.name}</h2>
                    <p class="pet-details-subtitle">${typeText[pet.type]} • ${pet.breed} • ${pet.age} • Porte ${sizeText[pet.size]}</p>
                </div>
                
                <div class="pet-info-grid">
                    <div class="pet-info-item">
                        <span class="info-label">Sexo</span>
                        <span class="info-value">${pet.gender}</span>
                    </div>
                    <div class="pet-info-item">
                        <span class="info-label">Localização</span>
                        <span class="info-value">${pet.location}</span>
                    </div>
                    <div class="pet-info-item">
                        <span class="info-label">Vacinado</span>
                        <span class="info-value">${pet.vaccinated ? 'Sim' : 'Não'}</span>
                    </div>
                    <div class="pet-info-item">
                        <span class="info-label">Castrado</span>
                        <span class="info-value">${pet.neutered ? 'Sim' : 'Não'}</span>
                    </div>
                </div>
                
                <div class="pet-description">
                    <h3>Sobre</h3>
                    <p>${pet.description}</p>
                </div>
                
                <div class="modal-actions">
                    <a href="#" class="button">Tenho Interesse</a>
                </div>
            </div>
        </div>
    `;
    
    petModal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
}