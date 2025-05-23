function populateUserData(userData, documentRef = document) {
    if (userData.nome) {
        documentRef.getElementById('fullName').value = userData.nome;
    }
    if (userData.email) {
        documentRef.getElementById('email').value = userData.email;
    }
    if (userData.telefone) {
        documentRef.getElementById('phone').value = userData.telefone;
    }
    if (userData.cidade) {
        documentRef.getElementById('city').value = userData.cidade;
    }
    if (userData.estado) {
        documentRef.getElementById('state').value = userData.estado;
    }
}
document.addEventListener("DOMContentLoaded", () => {
    // Função para fazer upload de imagem para o Supabase Storage
    async function uploadProfileImage(file, userId) {
        // Gera um nome de arquivo único baseado no ID do usuário e timestamp
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}_${Date.now()}.${fileExt}`;
        const filePath = `profile_images/${fileName}`;
        
        try {
            // Upload do arquivo para o bucket "profile_images"
            const { data, error } = await supabase.storage
                .from('profile_images')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: true
                });
                
            if (error) {
                throw error;
            }
            
            // Obter a URL pública do arquivo
            const { data: urlData } = supabase.storage
                .from('profile_images')
                .getPublicUrl(filePath);
                
            // Retorna a URL pública da imagem
            return urlData.publicUrl;
        } catch (error) {
            console.error('Erro no upload da imagem:', error);
            throw error;
        }
    }

    // Verificar se o Supabase está disponível
    if (typeof supabase === 'undefined') {
        console.warn('Supabase ainda não está inicializado. Aguardando inicialização...');
        // Tentar novamente em 1 segundo
        setTimeout(() => {
            if (typeof supabase === 'undefined') {
                console.error('Erro: Supabase não foi inicializado após 1 segundo.');
            } else {
                console.log('✅ Supabase inicializado com sucesso após espera!');
            }
        }, 1000);
    } else {
        console.log('✅ Supabase já está inicializado!');
    }

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
        
    // Verificar se o usuário está logado, caso contrário redirecionar para login
    function checkLoginStatus() {
        const currentUser = sessionStorage.getItem('currentUser');
        if (!currentUser) {
            // Usuário não está logado, redirecionar para página de login
            window.location.href = 'login.html?redirect=Perfil.html';
            return;
        }
        
        // Atualizar o menu de navegação
        const navMenu = document.getElementById('nav-menu');
        if (navMenu) {
            const userData = JSON.parse(currentUser);
            navMenu.innerHTML = `
                <li><a href="index.html" class="nav-link">Início</a></li>
                <li><span class="user-greeting">Olá, ${userData.nome.split(' ')[0]}</span></li>
                <li><a href="Perfil.html" class="nav-link active">Perfil</a></li>
                <li><a href="cadastrapet.html" class="nav-link">Doe um Pet</a></li>
            `;
            
            // Preencher os campos do perfil com os dados do usuário
            populateUserData(userData);
            
            // Carregar a foto do perfil
            loadProfilePhoto(userData.id);
            
            // Carregar os pets do usuário
            loadUserPets(userData.id);
            
            // Carregar os pets favoritos do usuário
            loadFavoritePets();
        }
    }
    
    // Carregar a foto de perfil do usuário
    function loadProfilePhoto(userId) {
        const profileImage = document.getElementById('profileImage');
        if (!profileImage) return;
        
        // Verificar se o usuário tem uma foto no sessionStorage
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        if (currentUser && currentUser.foto) {
            profileImage.src = currentUser.foto;
            return;
        }
        
        // Se não tiver no sessionStorage, verificar no Supabase
        supabase
            .from('usuarios')
            .select('foto')
            .eq('id', userId)
            .single()
            .then(response => {
                const { data, error } = response;
                
                if (error) {
                    console.error('Erro ao carregar foto de perfil:', error);
                    return;
                }
                
                if (data && data.foto) {
                    profileImage.src = data.foto;
                    
                    // Atualizar o sessionStorage
                    const updatedUser = {...currentUser, foto: data.foto};
                    sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));
                }
            })
            .catch(err => {
                console.error('Erro na consulta da foto:', err);
            });
    }
    
    // Carregar os pets cadastrados pelo usuário a partir do Supabase
    function loadUserPets(userId) {
        const myPetsGrid = document.getElementById('myPetsGrid');
        const noPetsMessage = document.getElementById('noPetsMessage');
        
        if (!myPetsGrid || !noPetsMessage) return;
        
        // Verificar se o objeto supabase está disponível
        if (typeof supabase === 'undefined') {
            console.error('Erro: Supabase não está inicializado.');
            showNotification('Conectando ao banco de dados...', 'info');
            
            // Esperar 1 segundo e tentar novamente
            setTimeout(() => {
                if (typeof supabase === 'undefined') {
                    console.error('Erro: Supabase não foi inicializado após 1 segundo.');
                    showNotification('Erro de conexão com o banco de dados.', 'error');
                    noPetsMessage.style.display = 'block';
                } else {
                    console.log('Supabase inicializado após espera.');
                    continueWithLoadingPets();
                }
            }, 1000);
            return;
        }
        
        // Supabase já está disponível, proceder com o carregamento
        continueWithLoadingPets();
        
        // Função para continuar o processo de carregar os pets
        function continueWithLoadingPets() {
            // Mostrar indicador de carregamento
            myPetsGrid.innerHTML = '<div class="loading-indicator">Carregando seus pets...</div>';
            
            // Consultar a tabela 'pets' no Supabase filtrando pelo ID do usuário
            supabase
                .from('pets')
                .select('*')
                .eq('usuario_id', userId)
                .then(response => {
                    const { data, error } = response;
                    
                    // Remover indicador de carregamento
                    myPetsGrid.innerHTML = '';
                    
                    if (error) {
                        console.error('Erro ao carregar pets:', error);
                        showNotification('Erro ao carregar seus pets.', 'error');
                        noPetsMessage.style.display = 'block';
                        return;
                    }
                    
                    // Verificar se encontrou algum pet
                    if (!data || data.length === 0) {
                        console.log('Nenhum pet encontrado para este usuário.');
                        noPetsMessage.style.display = 'block';
                        return;
                    }
                    
                    // Ocultar a mensagem de "nenhum pet"
                    noPetsMessage.style.display = 'none';
                    
                    // Criar cards para cada pet encontrado
                    data.forEach(pet => {
                        createPetCard(pet, myPetsGrid);
                    });
                    
                    console.log('✅ Pets carregados com sucesso!');
                })
                .catch(err => {
                    console.error('Erro na consulta:', err);
                    myPetsGrid.innerHTML = '';
                    noPetsMessage.style.display = 'block';
                    showNotification('Falha na comunicação com o servidor.', 'error');
                });
        }
    }
    
    // Criar card para um pet
    function createPetCard(pet, container) {
        // Mapear valores para texto de exibição
        const sizeText = {
            'small': 'Porte Pequeno',
            'medium': 'Porte Médio',
            'large': 'Porte Grande'
        };
        
        const typeText = {
            'dog': 'Cachorro',
            'cat': 'Gato',
            'other': 'Outro'
        };
        
        const petCard = document.createElement('div');
        petCard.className = 'pet-card';
        petCard.innerHTML = `
            <div class="pet-image">
                <img src="${pet.foto || '/api/placeholder/300/300'}" alt="${pet.nome}">
            </div>
            <div class="pet-info">
                <h3 class="pet-name">${pet.nome}</h3>
                <p class="pet-breed">${pet.raca}</p>
                <p class="pet-age">${pet.idade} ${pet.idade === 1 ? 'ano' : 'anos'}</p>
                <span class="pet-size">${sizeText[pet.porte] || pet.porte}</span>
                <p class="pet-location">${pet.cidade}, ${pet.estado}</p>
                <div class="pet-actions">
                    <a href="#" class="pet-action-btn edit-pet" data-id="${pet.id}">Editar</a>
                    <button class="pet-action-btn delete-pet" data-id="${pet.id}">Excluir</button>
                </div>
            </div>
        `;
        
        container.appendChild(petCard);
        
        // Adicionar event listeners para os botões
        const editButton = petCard.querySelector('.edit-pet');
        if (editButton) {
            editButton.addEventListener('click', function(e) {
                e.preventDefault();
                const petId = this.getAttribute('data-id');
                // Aqui você implementaria a função para editar o pet
                showNotification(`Função para editar o pet ID: ${petId} será implementada em breve.`);
            });
        }
        
        const deleteButton = petCard.querySelector('.delete-pet');
        if (deleteButton) {
            deleteButton.addEventListener('click', function() {
                const petId = this.getAttribute('data-id');
                if (confirm('Tem certeza que deseja excluir este pet?')) {
                    deletePet(petId, petCard);
                }
            });
        }
    }
    
    // Função para excluir um pet
    function deletePet(petId, petCard) {
        // Verificar se o objeto supabase está disponível
        if (typeof supabase === 'undefined') {
            console.error('Erro: Supabase não está inicializado.');
            showNotification('Erro de conexão com o banco de dados.', 'error');
            return;
        }
        
        // Excluir o pet da tabela 'pets'
        supabase
            .from('pets')
            .delete()
            .eq('id', petId)
            .then(response => {
                const { error } = response;
                
                if (error) {
                    console.error('Erro ao excluir pet:', error);
                    showNotification('Erro ao excluir o pet.', 'error');
                    return;
                }
                
                // Remover o card do pet da página
                if (petCard && petCard.parentNode) {
                    petCard.parentNode.removeChild(petCard);
                }
                
                // Verificar se ainda existem pets
                const myPetsGrid = document.getElementById('myPetsGrid');
                const noPetsMessage = document.getElementById('noPetsMessage');
                
                if (myPetsGrid && noPetsMessage && myPetsGrid.children.length === 0) {
                    noPetsMessage.style.display = 'block';
                }
                
                console.log('✅ Pet excluído com sucesso!');
                showNotification('Pet excluído com sucesso!');
            })
            .catch(err => {
                console.error('Erro na requisição:', err);
                showNotification('Falha na comunicação com o servidor.', 'error');
            });
    }
    
    // Navigation functionality
    const navItems = document.querySelectorAll('.profile-nav-item');
    const profileSections = document.querySelectorAll('.profile-section');
    
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove active class from all items
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Hide all sections
            profileSections.forEach(section => section.classList.remove('active'));
            
            // Show the selected section
            const sectionId = this.getAttribute('data-section');
            document.getElementById(sectionId).classList.add('active');
        });
    });
    
    // Handle form submissions - Personal Info Form
    const personalInfoForm = document.getElementById('personalInfoForm');
    if (personalInfoForm) {
        personalInfoForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Obter os dados do formulário
            const fullName = document.getElementById('fullName').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const city = document.getElementById('city').value;
            const state = document.getElementById('state').value;
            
            // Obter o ID do usuário atual
            const currentUser = sessionStorage.getItem('currentUser') ? JSON.parse(sessionStorage.getItem('currentUser')) : null;
            if (!currentUser || !currentUser.id) {
                showNotification('Usuário não identificado. Faça login novamente.', 'error');
                return;
            }
            
            // Atualizar os dados no Supabase
            supabase
                .from('usuarios')
                .update({
                    nome: fullName,
                    email: email,
                    telefone: phone,
                    cidade: city,
                    estado: state
                })
                .eq('id', currentUser.id)
                .then(response => {
                    const { data, error } = response;
                    
                    if (error) {
                        console.error('Erro ao atualizar informações:', error);
                        showNotification('Erro ao salvar informações pessoais.', 'error');
                        return;
                    }
                    
                    // Atualizar o sessionStorage
                    const updatedUser = {
                        ...currentUser,
                        nome: fullName,
                        email: email,
                        telefone: phone,
                        cidade: city,
                        estado: state
                    };
                    sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));
                    
                    showNotification('Informações pessoais atualizadas com sucesso!');
                    
                    // Atualizar o nome no menu de navegação
                    const userGreeting = document.querySelector('.user-greeting');
                    if (userGreeting) {
                        userGreeting.textContent = `Olá, ${fullName.split(' ')[0]}`;
                    }
                })
                .catch(err => {
                    console.error('Erro na requisição:', err);
                    showNotification('Falha na comunicação com o servidor.', 'error');
                });
        });
    }
    
    // Handle form submissions - Settings Form (Change Password)
    const settingsForm = document.getElementById('settingsForm');
    if (settingsForm) {
        settingsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            // Validações básicas
            if (!currentPassword) {
                showNotification('A senha atual é obrigatória.', 'error');
                return;
            }
            
            if (!newPassword) {
                showNotification('A nova senha é obrigatória.', 'error');
                return;
            }
            
            if (newPassword !== confirmPassword) {
                showNotification('As senhas não coincidem!', 'error');
                return;
            }
            
            // Obter o ID do usuário atual
            const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
            if (!currentUser || !currentUser.id) {
                showNotification('Usuário não identificado. Faça login novamente.', 'error');
                return;
            }
            
            // Verificar a senha atual (simulação - em uma implementação real, você verificaria no servidor)
            // Em um sistema real, você enviaria a senha atual para verificação no backend
            // Aqui, estamos apenas simulando a mudança de senha
            
            // Atualizar a senha no Supabase
            supabase
                .from('usuarios')
                .update({
                    senha: newPassword  // Em um sistema real, você nunca armazenaria senhas em texto simples
                })
                .eq('id', currentUser.id)
                .then(response => {
                    const { error } = response;
                    
                    if (error) {
                        console.error('Erro ao atualizar senha:', error);
                        showNotification('Erro ao alterar senha.', 'error');
                        return;
                    }
                    
                    // Limpar os campos
                    document.getElementById('currentPassword').value = '';
                    document.getElementById('newPassword').value = '';
                    document.getElementById('confirmPassword').value = '';
                    
                    showNotification('Senha alterada com sucesso!');
                })
                .catch(err => {
                    console.error('Erro na requisição:', err);
                    showNotification('Falha na comunicação com o servidor.', 'error');
                });
        });
    }
    
    // Photo upload functionality
    const uploadPhotoBtn = document.getElementById('uploadPhotoBtn');
    const profileImage = document.getElementById('profileImage');
    
    if (uploadPhotoBtn && profileImage) {
        uploadPhotoBtn.addEventListener('click', function() {
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*';
            
            fileInput.addEventListener('change', async function(e) {
                if (e.target.files.length > 0) {
                    const file = e.target.files[0];
                    
                    // Verificar o tamanho do arquivo (limite de 5MB)
                    if (file.size > 5 * 1024 * 1024) {
                        showNotification('A imagem é muito grande. O tamanho máximo é de 5MB.', 'error');
                        return;
                    }
                    
                    // Mostrar indicador de carregamento
                    showNotification('Enviando imagem...', 'info');
                    
                    // Obter o ID do usuário atual
                    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
                    if (!currentUser || !currentUser.id) {
                        showNotification('Usuário não identificado. Faça login novamente.', 'error');
                        return;
                    }
                    
                    try {
                        // Fazer o upload da imagem para o Storage
                        const imageUrl = await uploadProfileImage(file, currentUser.id);
                        
                        // Mostrar a imagem no perfil
                        profileImage.src = imageUrl;
                        
                        // Atualizar a URL da foto no banco de dados
                        const { error } = await supabase
                            .from('usuarios')
                            .update({ foto: imageUrl })
                            .eq('id', currentUser.id);
                            
                        if (error) {
                            throw error;
                        }
                        
                        // Atualizar o sessionStorage
                        const updatedUser = {
                            ...currentUser,
                            foto: imageUrl
                        };
                        sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));
                        
                        showNotification('Foto de perfil atualizada com sucesso!');
                    } catch (error) {
                        console.error('Erro ao processar upload:', error);
                        showNotification('Erro ao fazer upload da imagem.', 'error');
                    }
                }
            });
            
            fileInput.click();
        });
    }
    
    // Carregar pets favoritos do usuário
    async function loadFavoritePets() {
        const favoritePetsGrid = document.getElementById('favoritePetsGrid');
        
        if (!favoritePetsGrid) return;
        
        // Obter o ID do usuário atual
        const currentUser = sessionStorage.getItem('currentUser') ? JSON.parse(sessionStorage.getItem('currentUser')) : null;
        
        if (!currentUser || !currentUser.id) {
            favoritePetsGrid.innerHTML = '<div class="error-message">Você precisa estar logado para ver seus pets favoritos.</div>';
            return;
        }
        
        // Mostrar indicador de carregamento
        favoritePetsGrid.innerHTML = '<div class="loading-indicator">Carregando seus pets favoritos...</div>';
        
        try {
            // Primeiro, buscar os IDs dos pets favoritos na tabela 'favoritos'
            const { data: favoritesData, error: favoritesError } = await supabase
                .from('favoritos')
                .select('id_pet')
                .eq('id_usu', currentUser.id);
                
            if (favoritesError) {
                throw favoritesError;
            }
            
            // Se não há pets favoritos
            if (!favoritesData || favoritesData.length === 0) {
                favoritePetsGrid.innerHTML = '<div class="no-favorites">Você ainda não adicionou nenhum pet aos favoritos.</div>';
                return;
            }
            
            // Extrair os IDs dos pets favoritos
            const favoritePetIds = favoritesData.map(favorite => favorite.id_pet);
            
            // Buscar os detalhes completos dos pets favoritos
            const { data: petsData, error: petsError } = await supabase
                .from('pets')
                .select('*')
                .in('id', favoritePetIds);
                
            if (petsError) {
                throw petsError;
            }
            
            // Limpar o grid
            favoritePetsGrid.innerHTML = '';
            
            // Criar cards para cada pet favorito
            petsData.forEach(pet => {
                createFavoritePetCard(pet, favoritePetsGrid);
            });
            
            console.log('✅ Pets favoritos carregados com sucesso!');
        } catch (error) {
            console.error('Erro ao carregar pets favoritos:', error);
            favoritePetsGrid.innerHTML = '<div class="error-message">Não foi possível carregar seus pets favoritos. Tente novamente mais tarde.</div>';
        }
    }

    // Função para criar um card de pet favorito
    function createFavoritePetCard(pet, container) {
        // Mapear valores para texto de exibição
        const sizeText = {
            'small': 'Porte Pequeno',
            'medium': 'Porte Médio',
            'large': 'Porte Grande'
        };
        
        const typeText = {
            'dog': 'Cachorro',
            'cat': 'Gato',
            'other': 'Outro'
        };
        
        // Calcular idade para exibição
        const idade = pet.idade ? `${pet.idade} ${pet.idade === 1 ? 'ano' : 'anos'}` : "Idade não informada";
        
        const petCard = document.createElement('div');
        petCard.className = 'pet-card';
        
        // Usar a URL da imagem do pet se existir, senão usar um placeholder
        const imageUrl = pet.foto || `/api/placeholder/300/300?id=${pet.id}`;
        
        petCard.innerHTML = `
            <div class="pet-image">
                <img src="${imageUrl}" alt="${pet.nome}">
            </div>
            <div class="pet-info">
                <h3 class="pet-name">${pet.nome}</h3>
                <p class="pet-breed">${pet.raca || 'Sem raça definida'} • ${idade}</p>
                <p class="pet-location">${pet.cidade || ''}, ${pet.estado || ''}</p>
                <div class="pet-actions">
                    <a href="#" class="pet-action-btn view-details" data-id="${pet.id}">Ver Detalhes</a>
                    <button class="favorite-btn active" data-id="${pet.id}">❤</button>
                </div>
            </div>
        `;
        
        container.appendChild(petCard);
        
        // Adicionar evento ao botão de ver detalhes
        const viewDetailsBtn = petCard.querySelector('.view-details');
        if (viewDetailsBtn) {
            viewDetailsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                // Usar a nova função openPetDetails
                openPetDetails(pet.id);
            });
        }
        
        // Adicionar evento ao botão de favorito
        const favoriteBtn = petCard.querySelector('.favorite-btn');
        if (favoriteBtn) {
            favoriteBtn.addEventListener('click', function() {
                const petId = this.getAttribute('data-id');
                removeFavorite(petId, petCard);
            });
        }
    }

    // Função para remover um pet dos favoritos
    async function removeFavorite(petId, petCard) {
        const currentUser = sessionStorage.getItem('currentUser') ? JSON.parse(sessionStorage.getItem('currentUser')) : null;
        
        if (!currentUser || !currentUser.id) {
            showNotification('Você precisa estar logado para gerenciar seus favoritos.', 'error');
            return;
        }
        
        try {
            // Remover o pet dos favoritos no Supabase
            const { error } = await supabase
                .from('favoritos')
                .delete()
                .eq('id_usu', currentUser.id)
                .eq('id_pet', petId);
                
            if (error) {
                throw error;
            }
            
            // Remover o card visualmente da página
            if (petCard && petCard.parentNode) {
                petCard.parentNode.removeChild(petCard);
            }
            
            // Verificar se ainda existem pets favoritos
            const favoritePetsGrid = document.getElementById('favoritePetsGrid');
            if (favoritePetsGrid && favoritePetsGrid.children.length === 0) {
                favoritePetsGrid.innerHTML = '<div class="no-favorites">Você não tem mais pets favoritos.</div>';
            }
            
            showNotification('Pet removido dos favoritos!');
        } catch (err) {
            console.error('Erro ao remover favorito:', err);
            showNotification('Erro ao remover o pet dos favoritos.', 'error');
        }
    }
    
    // Função para abrir os detalhes do pet quando o usuário clicar em "Ver Detalhes"
    async function openPetDetails(petId) {
        try {
            // Buscar os detalhes completos do pet no Supabase
            const { data: pet, error } = await supabase
                .from('pets')
                .select('*')
                .eq('id', petId)
                .single();
                
            if (error) {
                throw error;
            }
            
            if (!pet) {
                showNotification('Pet não encontrado.', 'error');
                return;
            }
            
            // Criar o modal se ele não existir
            let petModal = document.getElementById('petModal');
            if (!petModal) {
                petModal = document.createElement('div');
                petModal.id = 'petModal';
                petModal.className = 'modal';
                
                petModal.innerHTML = `
                    <div class="modal-content">
                        <span class="close-modal" id="closeModal">&times;</span>
                        <div class="pet-details" id="petDetails"></div>
                    </div>
                `;
                
                document.body.appendChild(petModal);
                
                // Adicionar evento para fechar o modal
                const closeModal = document.getElementById('closeModal');
                closeModal.addEventListener('click', () => {
                    petModal.style.display = 'none';
                    document.body.style.overflow = 'auto'; // Restaurar rolagem
                });
                
                // Fechar o modal se clicar fora do conteúdo
                window.addEventListener('click', (e) => {
                    if (e.target === petModal) {
                        petModal.style.display = 'none';
                        document.body.style.overflow = 'auto'; // Restaurar rolagem
                    }
                });
            }
            
            const petDetails = document.getElementById('petDetails');
            
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
            const idade = pet.idade ? `${pet.idade} anos` : "Idade não informada";
            
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
            
            // Mostrar o modal e impedir a rolagem do body
            petModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            
        } catch (error) {
            console.error('Erro ao buscar detalhes do pet:', error);
            showNotification('Não foi possível carregar os detalhes do pet.', 'error');
        }
    }

    // Função para lidar com o interesse em adotar
    function handleInterest(petId) {
        const currentUser = sessionStorage.getItem('currentUser') ? JSON.parse(sessionStorage.getItem('currentUser')) : null;
        
        if (!currentUser) {
            // Redirecionar para página de login se não estiver logado
            showNotification('Você precisa estar logado para demonstrar interesse.', 'error');
            return;
        }
        
        // Mostrar mensagem de interesse registrado
        showNotification('Interesse registrado! O responsável pelo pet será notificado e entrará em contato com você em breve.');
        
        // Fechar o modal
        const petModal = document.getElementById('petModal');
        if (petModal) {
            petModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }
    
    // Helper function to show notifications
    function showNotification(message, type = 'success') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Append to body
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Hide and remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
    
    // Add CSS for notifications and other styles
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 15px 20px;
            background-color: var(--primary-color);
            color: white;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow);
            transform: translateY(100px);
            opacity: 0;
            transition: all 0.3s ease;
            z-index: 1000;
        }
        
        .notification.error {
            background-color: #f44336;
        }
        
        .notification.info {
            background-color: #2196F3;
        }
        
        .notification.show {
            transform: translateY(0);
            opacity: 1;
        }
        
        .loading-indicator {
            text-align: center;
            padding: 20px;
            font-style: italic;
            color: #666;
        }
        
        .error-message, .no-favorites {
            text-align: center;
            padding: 20px;
            color: #666;
            font-style: italic;
            background-color: var(--light-bg);
            border-radius: var(--border-radius);
            margin: 20px 0;
        }
        
        .error-message {
            color: #f44336;
        }
        
        .pet-location {
            color: #666;
            font-size: 0.9em;
            margin-bottom: 10px;
        }
        
        .pet-action-btn.delete-pet {
            background-color: #ff4d4d;
            color: white;
        }
        
        .pet-action-btn.delete-pet:hover {
            background-color: #ff0000;
        }
        
        .favorite-btn {
            background: none;
            border: none;
            cursor: pointer;
            color: #ff4f4f;
            font-size: 1.5rem;
            transition: all 0.3s ease;
        }
        
        .favorite-btn:hover {
            transform: scale(1.2);
        }
    `;
    document.head.appendChild(style);
    
    // Adicione o CSS para o modal
    const modalStyle = document.createElement('style');
    modalStyle.textContent = `
        /* Estilos para o modal */
        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.7);
            z-index: 1000;
            overflow-y: auto;
        }
        
        .modal-content {
            background-color: var(--white);
            margin: 5% auto;
            padding: 1.5rem;
            width: 90%;
            max-width: 700px;
            max-height: 90vh;
            border-radius: var(--border-radius);
            position: relative;
            overflow-y: auto;
        }
        
        .close-modal {
            position: absolute;
            top: 1rem;
            right: 1rem;
            font-size: 1.5rem;
            color: #666;
            cursor: pointer;
            transition: color 0.3s;
            z-index: 10;
        }
        
        .close-modal:hover {
            color: #333;
        }
        
        /* Estilos para os detalhes do pet */
        .pet-details-compact {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
        }
        
        .pet-details-image-compact {
            width: 100%;
            height: auto;
            max-height: 500px;
            border-radius: var(--border-radius);
            overflow: hidden;
        }
        
        .pet-details-image-compact img {
            width: 100%;
            height: auto;
            object-fit: contain;
            max-height: 500px;
        }
        
        .pet-details-info-compact {
            display: flex;
            flex-direction: column;
            gap: 1.2rem;
        }
        
        .pet-details-title {
            border-bottom: 1px solid #eee;
            padding-bottom: 0.8rem;
        }
        
        .pet-details-title h2 {
            color: var(--primary-color);
            margin-bottom: 0.3rem;
            font-size: 1.8rem;
        }
        
        .pet-details-subtitle {
            color: #666;
            font-size: 1rem;
        }
        
        .pet-info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 0.8rem;
        }
        
        .pet-info-item {
            background-color: var(--light-bg);
            padding: 0.8rem;
            border-radius: 8px;
        }
        
        .info-label {
            display: block;
            font-size: 0.8rem;
            color: #666;
            margin-bottom: 0.3rem;
        }
        
        .info-value {
            font-weight: 500;
            color: var(--text-color);
        }
        
        .pet-description, .pet-info-additional, .pet-contact {
            background-color: var(--light-bg);
            padding: 1rem;
            border-radius: 8px;
        }
        
        .pet-description h3, .pet-info-additional h3, .pet-contact h3 {
            font-size: 1rem;
            margin-bottom: 0.5rem;
            color: #666;
        }
        
        .pet-description p, .pet-info-additional p, .pet-contact p {
            color: var(--text-color);
            font-size: 0.95rem;
            line-height: 1.5;
        }
        
        .modal-actions {
            display: flex;
            justify-content: center;
            margin-top: 0.5rem;
        }
        
        .modal-actions .button {
            padding: 0.8rem 2rem;
        }
        
        @media (max-width: 768px) {
            .pet-info-grid {
                grid-template-columns: 1fr 1fr;
            }
        }
        
        @media (max-width: 500px) {
            .modal-content {
                padding: 1rem;
                margin: 10% auto;
            }
        }
    `;
    document.head.appendChild(modalStyle);
    // Expor funções para testes (Jest)
});
 if (typeof module !== 'undefined' && module.exports) {
        module.exports = {
            populateUserData
        };
    }