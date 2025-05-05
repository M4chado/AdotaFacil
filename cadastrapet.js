document.addEventListener("DOMContentLoaded", () => {
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
            window.location.href = 'login.html?redirect=cadastrapet.html';
            return;
        }
        
        // Atualizar o menu de navegação
        const navMenu = document.getElementById('nav-menu');
        if (navMenu && currentUser) {
            const userData = JSON.parse(currentUser);
            navMenu.innerHTML = `
                <li><a href="index.html" class="nav-link">Início</a></li>
                <li><span class="user-greeting">Olá, ${userData.nome.split(' ')[0]}</span></li>
                <li><a href="Perfil.html" class="nav-link">Perfil</a></li>
                <li><a href="cadastrapet.html" class="nav-link active">Doe um Pet</a></li>
            `;
        }
    }
});

document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const petForm = document.getElementById('petForm');
    const resetFormBtn = document.getElementById('resetForm');
    const submitFormBtn = document.getElementById('submitForm');
    const successMessage = document.getElementById('successMessage');
    const fileInput = document.getElementById('petPhoto');
    const previewImage = document.getElementById('previewImage');
    const dropArea = document.getElementById('dropArea');
    
    // Error elements
    const errorElements = {
        petName: document.getElementById('petNameError'),
        petAge: document.getElementById('petAgeError'),
        petType: document.getElementById('petTypeError'),
        petBreed: document.getElementById('petBreedError'),
        petSize: document.getElementById('petSizeError'),
        petGender: document.getElementById('petGenderError'),
        petCity: document.getElementById('petCityError'),
        petState: document.getElementById('petStateError'),
        petPhoto: document.getElementById('petPhotoError'),
        petDescription: document.getElementById('petDescriptionError'),
        ownerContact: document.getElementById('ownerContactError')
    };
    
    // Variável para armazenar a imagem codificada em base64
    let petPhotoBase64 = '';
    
    // Handle file selection
    fileInput.addEventListener('change', function() {
        handleFileSelect(this.files[0]);
    });
    
    // Drag and drop functionality
    dropArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.style.borderColor = 'var(--primary-color)';
        this.style.backgroundColor = '#f0f9f0';
    });
    
    dropArea.addEventListener('dragleave', function() {
        this.style.borderColor = '#ddd';
        this.style.backgroundColor = 'transparent';
    });
    
    dropArea.addEventListener('drop', function(e) {
        e.preventDefault();
        this.style.borderColor = '#ddd';
        this.style.backgroundColor = 'transparent';
        
        if (e.dataTransfer.files.length) {
            handleFileSelect(e.dataTransfer.files[0]);
            fileInput.files = e.dataTransfer.files;
        }
    });
    
    // Function to handle file preview and convert to base64
    function handleFileSelect(file) {
        if (!file) return;
        
        // Check file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!validTypes.includes(file.type)) {
            showError(errorElements.petPhoto, 'Por favor, selecione uma imagem nos formatos JPG ou PNG.');
            return;
        }
        
        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showError(errorElements.petPhoto, 'A imagem deve ter no máximo 5MB.');
            return;
        }
        
        // Create preview and convert to base64
        const reader = new FileReader();
        reader.onload = function(e) {
            previewImage.src = e.target.result;
            previewImage.style.display = 'block';
            petPhotoBase64 = e.target.result; // Armazenar a imagem em base64
            hideError(errorElements.petPhoto);
        };
        reader.readAsDataURL(file);
    }
    
    // Form submission
    petForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateForm()) {
            // Mostrar indicador de carregamento
            submitFormBtn.disabled = true;
            submitFormBtn.textContent = 'Cadastrando...';
            
            // Salvar no banco de dados
            savePetToDatabase();
        }
    });
    
    // Função para salvar o pet no banco de dados
    function savePetToDatabase() {
        try {
            // Verificar se o objeto supabase está disponível ou esperar que esteja disponível
            if (typeof supabase === 'undefined') {
                // Mostrar notificação de aguarde
                showNotification('Conectando ao banco de dados...', 'info');
                
                // Esperar 1 segundo e tentar novamente
                setTimeout(() => {
                    if (typeof supabase === 'undefined') {
                        console.error('Erro: Supabase não está inicializado após tentativa de espera.');
                        showNotification('Erro de conexão. Tente novamente mais tarde.', 'error');
                        submitFormBtn.disabled = false;
                        submitFormBtn.textContent = 'Cadastrar Pet';
                    } else {
                        // Agora o Supabase está disponível
                        console.log('Supabase inicializado após espera.');
                        continueWithSavingPet();
                    }
                }, 1000);
                return;
            }
            
            // Supabase já está disponível, proceder com o cadastro
            continueWithSavingPet();
        } catch (err) {
            console.error('Erro inesperado:', err);
            showNotification('Ocorreu um erro inesperado.', 'error');
            submitFormBtn.disabled = false;
            submitFormBtn.textContent = 'Cadastrar Pet';
        }
        
        // Função para continuar o processo de salvar o pet
        function continueWithSavingPet() {
            // Obter dados do usuário logado
            const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
            if (!currentUser || !currentUser.id) {
                console.error('Erro: Usuário não está logado ou ID não disponível.');
                showNotification('Sessão expirada. Faça login novamente.', 'error');
                submitFormBtn.disabled = false;
                submitFormBtn.textContent = 'Cadastrar Pet';
                return;
            }
            
            // Coletar dados do formulário
            const petData = {
                nome: document.getElementById('petName').value.trim(),
                idade: parseInt(document.getElementById('petAge').value.trim()) || 0,
                tipo: document.getElementById('petType').value,
                raca: document.getElementById('petBreed').value.trim(),
                porte: document.getElementById('petSize').value,
                sexo: document.getElementById('petGender').value,
                cidade: document.getElementById('petCity').value.trim(),
                estado: document.getElementById('petState').value,
                foto: petPhotoBase64, // URL ou base64 da foto
                descricao: document.getElementById('petDescription').value.trim(),
                informacao: document.getElementById('additionalInfo').value.trim() || null,
                contato: document.getElementById('ownerContact').value.trim(),
                usuario_id: currentUser.id
            };
            
            // Enviar para o Supabase
            supabase
                .from('pets')
                .insert(petData)
                .then(response => {
                    const { data, error } = response;
                    
                    if (error) {
                        console.error('Erro ao cadastrar pet:', error);
                        showNotification('Erro ao cadastrar pet. Tente novamente.', 'error');
                        submitFormBtn.disabled = false;
                        submitFormBtn.textContent = 'Cadastrar Pet';
                        return;
                    }
                    
                    // Cadastro bem-sucedido
                    console.log('✅ Pet cadastrado com sucesso!', data);
                    
                    // Mostrar mensagem de sucesso
                    successMessage.style.display = 'block';
                    
                    // Resetar o botão
                    submitFormBtn.disabled = false;
                    submitFormBtn.textContent = 'Cadastrar Pet';
                    
                    // Rolar para o topo para ver a mensagem
                    window.scrollTo({
                        top: successMessage.offsetTop - 100,
                        behavior: 'smooth'
                    });
                    
                    // Limpar formulário após 2 segundos
                    setTimeout(function() {
                        resetForm();
                    }, 2000);
                })
                .catch(err => {
                    console.error('Erro na requisição:', err);
                    showNotification('Falha na comunicação com o servidor.', 'error');
                    submitFormBtn.disabled = false;
                    submitFormBtn.textContent = 'Cadastrar Pet';
                });
        }
    }
    
    // Função para mostrar notificação
    function showNotification(message, type = 'success') {
        // Criar elemento de notificação
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Adicionar ao corpo do documento
        document.body.appendChild(notification);
        
        // Mostrar notificação
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Esconder e remover após 3 segundos
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
    
    // Adicionar estilos para notificações
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
    `;
    document.head.appendChild(style);
    
    // Reset form button
    resetFormBtn.addEventListener('click', function() {
        resetForm();
    });
    
    // Form validation
    function validateForm() {
        let isValid = true;
        
        // Required fields validation
        const requiredFields = [
            { id: 'petName', errorElement: errorElements.petName, message: 'Por favor, informe o nome do pet.' },
            { id: 'petAge', errorElement: errorElements.petAge, message: 'Por favor, informe a idade do pet.' },
            { id: 'petType', errorElement: errorElements.petType, message: 'Por favor, selecione o tipo do pet.' },
            { id: 'petBreed', errorElement: errorElements.petBreed, message: 'Por favor, informe a raça do pet.' },
            { id: 'petSize', errorElement: errorElements.petSize, message: 'Por favor, selecione o porte do pet.' },
            { id: 'petGender', errorElement: errorElements.petGender, message: 'Por favor, selecione o sexo do pet.' },
            { id: 'petCity', errorElement: errorElements.petCity, message: 'Por favor, informe a cidade do pet.' },
            { id: 'petState', errorElement: errorElements.petState, message: 'Por favor, selecione o estado do pet.' },
            { id: 'petDescription', errorElement: errorElements.petDescription, message: 'Por favor, informe uma descrição para o pet.' },
            { id: 'ownerContact', errorElement: errorElements.ownerContact, message: 'Por favor, informe um contato válido.' }
        ];
        
        requiredFields.forEach(field => {
            const element = document.getElementById(field.id);
            if (!element.value.trim()) {
                showError(field.errorElement, field.message);
                isValid = false;
            } else {
                hideError(field.errorElement);
            }
        });
        
        // Photo validation
        if (!petPhotoBase64) {
            showError(errorElements.petPhoto, 'Por favor, selecione uma foto do pet.');
            isValid = false;
        }
        
        return isValid;
    }
    
    // Helper function to show error
    function showError(element, message) {
        element.textContent = message;
        element.style.display = 'block';
    }
    
    // Helper function to hide error
    function hideError(element) {
        element.style.display = 'none';
    }
    
    // Reset form function
    function resetForm() {
        petForm.reset();
        previewImage.style.display = 'none';
        previewImage.src = '';
        petPhotoBase64 = ''; // Limpar a imagem base64
        successMessage.style.display = 'none';
        
        // Hide all error messages
        Object.values(errorElements).forEach(element => {
            element.style.display = 'none';
        });
    }
});