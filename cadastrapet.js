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
        petStatus: document.getElementById('petStatusError'),
        petPhoto: document.getElementById('petPhotoError'),
        petDescription: document.getElementById('petDescriptionError'),
        ownerContact: document.getElementById('ownerContactError')
    };
    
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
    
    // Function to handle file preview
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
        
        // Create preview
        const reader = new FileReader();
        reader.onload = function(e) {
            previewImage.src = e.target.result;
            previewImage.style.display = 'block';
            hideError(errorElements.petPhoto);
        };
        reader.readAsDataURL(file);
    }
    
    // Form submission
    petForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateForm()) {
            // In a real application, here you would send data to the server
            // For this example, we'll just show a success message
            
            // Show success message
            successMessage.style.display = 'block';
            
            // Scroll to top to see the message
            window.scrollTo({
                top: successMessage.offsetTop - 100,
                behavior: 'smooth'
            });
            
            // Clear form after 2 seconds
            setTimeout(function() {
                resetForm();
            }, 2000);
        }
    });
    
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
            { id: 'petStatus', errorElement: errorElements.petStatus, message: 'Por favor, selecione o status do pet.' },
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
        if (!fileInput.files.length) {
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
        successMessage.style.display = 'none';
        
        // Hide all error messages
        Object.values(errorElements).forEach(element => {
            element.style.display = 'none';
        });
    }
});