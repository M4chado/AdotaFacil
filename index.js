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
        
    // Inicializar a página e carregar os pets do Supabase
    initPage();
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

// Array para armazenar os pets buscados do Supabase
let petsData = [];

// Inicializar página
async function initPage() {
    // Get DOM elements
    petsGrid = document.getElementById('petsGrid');
    filterTabs = document.querySelectorAll('.filter-tab');
    petModal = document.getElementById('petModal');
    closeModal = document.getElementById('closeModal');
    petDetails = document.getElementById('petDetails');
    
    // Adicionar loading state
    petsGrid.innerHTML = '<div class="loading">Carregando pets disponíveis...</div>';
    
    // Buscar pets do Supabase
    await fetchPetsFromSupabase();
    
    // Inicializar filtros
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
}

// Buscar pets do Supabase - Adaptado para seus campos específicos
async function fetchPetsFromSupabase() {
    try {
        // Mostrar estado de carregamento
        petsGrid.innerHTML = '<div class="loading">Carregando pets disponíveis...</div>';
        
        // Fazer a consulta ao Supabase na tabela de pets
        const { data, error } = await supabase
            .from('pets')
            .select('*')
            .order('id', { ascending: true });
        
        if (error) {
            console.error('Erro ao buscar pets:', error);
            petsGrid.innerHTML = '<div class="error">Não foi possível carregar os pets. Tente novamente mais tarde.</div>';
            return;
        }
        
        // Armazenar os dados dos pets
        petsData = data;
        
        // Renderizar os pets
        renderPets(petsData);
    } catch (err) {
        console.error('Erro ao conectar com Supabase:', err);
        petsGrid.innerHTML = '<div class="error">Erro de conexão. Verifique sua internet e tente novamente.</div>';
    }
}

// Render pets based on filters - Adaptado para seus campos específicos
function renderPets(petsArray) {
    petsGrid.innerHTML = '';
    
    const filteredPets = petsArray.filter(pet => {
        if (currentFilter.size !== 'all' && pet.porte !== currentFilter.size) {
            return false;
        }
        if (currentFilter.type && pet.tipo !== currentFilter.type) {
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

// Adaptado para usar seus campos específicos
function createPetCard(pet) {
    const card = document.createElement('div');
    card.className = 'pet-card';
    
    // Map size to display text
    const sizeText = {
        'small': 'Pequeno',
        'medium': 'Médio',
        'large': 'Grande'
    };
    
    // Usar a URL da imagem do pet se existir, senão usar um placeholder
    const imageUrl = pet.foto || `/api/placeholder/300/300?id=${pet.id}`;
    
    // Calcular idade para exibição
    const idade = pet.idade ? `${pet.idade} anos` : "Idade não informada";
    
    card.innerHTML = `
        <div class="pet-image">
            <img src="${imageUrl}" alt="${pet.nome}">
        </div>
        <div class="pet-info">
            <h3 class="pet-name">${pet.nome}</h3>
            <p class="pet-breed">${pet.raca || 'Sem raça definida'} • ${idade} • Porte ${sizeText[pet.porte] || pet.porte}</p>
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
        
        // Aqui você pode implementar a lógica para salvar os pets favoritos
        // no localStorage ou no Supabase se o usuário estiver logado
        toggleFavorite(pet.id);
    });
    
    return card;
}

// Função para alternar favorito
async function toggleFavorite(petId) {
    const currentUser = sessionStorage.getItem('currentUser') ? JSON.parse(sessionStorage.getItem('currentUser')) : null;
    
    if (!currentUser) {
        // Se não estiver logado, redirecionar para login
        alert('Você precisa estar logado para adicionar um pet aos favoritos.');
        return;
    }
    
    try {
        // Verificar se o pet já está nos favoritos
        const { data, error } = await supabase
            .from('favoritos')
            .select('*')
            .eq('id_usu', currentUser.id)
            .eq('id_pet', petId);
            
        if (error) {
            console.error('Erro ao verificar favoritos:', error);
            return;
        }
        
        if (data && data.length > 0) {
            // Se já está nos favoritos, remover
            const { error: deleteError } = await supabase
                .from('favoritos')
                .delete()
                .eq('id_usu', currentUser.id)
                .eq('id_pet', petId);
                
            if (deleteError) {
                console.error('Erro ao remover favorito:', deleteError);
            }
        } else {
            // Se não está nos favoritos, adicionar
            const { error: insertError } = await supabase
                .from('favoritos')
                .insert([
                    { 
                        id_usu: currentUser.id, 
                        id_pet: petId 
                    }
                ]);
                
            if (insertError) {
                console.error('Erro ao adicionar favorito:', insertError);
            }
        }
    } catch (err) {
        console.error('Erro ao processar favorito:', err);
    }
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
            renderPets(petsData);
        });
    });
}

// Função openPetDetails - Adaptada para seus campos específicos
function openPetDetails(petId) {
    const pet = petsData.find(p => p.id === petId);
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
    
    // Usar a URL da imagem do pet se existir, senão usar um placeholder
    const imageUrl = pet.foto || `/api/placeholder/300/300?id=${pet.id}`;
    
    // Calcular idade para exibição
     const idade = pet.idade ? `${pet.idade} anos` : "Idade não informada";;
    
    petDetails.innerHTML = `
        <div class="pet-details-compact">
            <div class="pet-details-image-compact" style="height: auto; max-height: 500px;">
                <img src="${imageUrl}" alt="${pet.nome}" style="height: auto; object-fit: contain; max-height: 500px;">
            </div>
            
            <div class="pet-details-info-compact">
                <div class="pet-details-title">
                    <h2>${pet.nome}</h2>
                    <p class="pet-details-subtitle">${typeText[pet.tipo] || pet.tipo || 'Pet'} • ${pet.raca || 'Sem raça definida'} • ${idade} • Porte ${sizeText[pet.porte] || pet.porte}</p>
                </div>
                
                <div class="pet-info-grid">
                    <div class="pet-info-item">
                        <span class="info-label">Sexo</span>
                        <span class="info-value">${pet.sexo || 'Não informado'}</span>
                    </div>
                    <div class="pet-info-item">
                        <span class="info-label">Localização</span>
                        <span class="info-value">${pet.cidade || 'Não informada'}, ${pet.estado || ''}</span>
                    </div>
                </div>
                
                <div class="pet-description">
                    <h3>Sobre</h3>
                    <p>${pet.descricao || 'Sem descrição disponível.'}</p>
                </div>
                
                <div class="pet-info-additional">
                    <h3>Informações Adicionais</h3>
                    <p>${pet.informacao || 'Sem informações adicionais.'}</p>
                </div>
                
                <div class="pet-contact">
                    <h3>Contato</h3>
                    <p>${pet.contato || 'Entre em contato para mais informações.'}</p>
                </div>
                
                <div class="modal-actions">
                    <a href="#" class="button interest-btn" data-id="${pet.id}">Tenho Interesse</a>
                </div>
            </div>
        </div>
    `;
    
    // Adicionar evento ao botão de interesse
    const interestBtn = petDetails.querySelector('.interest-btn');
    interestBtn.addEventListener('click', (e) => {
        e.preventDefault();
        handleInterest(pet.id);
    });
    
    petModal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
}

// Função para lidar com o interesse em adotar
function handleInterest(petId) {
    const currentUser = sessionStorage.getItem('currentUser') ? JSON.parse(sessionStorage.getItem('currentUser')) : null;
    
    if (!currentUser) {
        // Redirecionar para página de login se não estiver logado
        alert('Você precisa estar logado para demonstrar interesse. Redirecionando para o login...');
        window.location.href = 'login.html?redirect=index.html&action=interest&petId=' + petId;
        return;
    }
    
    // Se estiver logado, entrar em contato com o dono do pet
    // Esta parte pode ser adaptada para enviar mensagem, email ou outra forma de contato
    alert('Interesse registrado! O responsável pelo pet será notificado e entrará em contato com você em breve.');
    petModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}