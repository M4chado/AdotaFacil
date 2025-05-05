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
        }
}
    
    // Preencher os campos do perfil com os dados do usuário
    function populateUserData(userData) {
        if (userData.nome) {
            document.getElementById('fullName').value = userData.nome;
        }
        if (userData.email) {
            document.getElementById('email').value = userData.email;
        }
        // Adicionar outros campos conforme disponibilidade dos dados
    }
});

document.addEventListener('DOMContentLoaded', function() {
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
    
    // Handle form submissions
    const personalInfoForm = document.getElementById('personalInfoForm');
    if (personalInfoForm) {
        personalInfoForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // Here you would normally send data to a server
            showNotification('Informações pessoais atualizadas com sucesso!');
        });
    }
    
    const settingsForm = document.getElementById('settingsForm');
    if (settingsForm) {
        settingsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (newPassword && newPassword !== confirmPassword) {
                showNotification('As senhas não coincidem!', 'error');
                return;
            }
            
            // Here you would normally send data to a server
            showNotification('Configurações atualizadas com sucesso!');
        });
    }
    
    // Photo upload functionality
    const uploadPhotoBtn = document.getElementById('uploadPhotoBtn');
    const profileImage = document.getElementById('profileImage');
    
    if (uploadPhotoBtn) {
        uploadPhotoBtn.addEventListener('click', function() {
            // Simulating a file input click
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*';
            
            fileInput.addEventListener('change', function(e) {
                if (e.target.files.length > 0) {
                    const file = e.target.files[0];
                    
                    // Create a FileReader to read the image
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        profileImage.src = event.target.result;
                        showNotification('Foto de perfil atualizada com sucesso!');
                    };
                    
                    reader.readAsDataURL(file);
                }
            });
            
            fileInput.click();
        });
    }
    
    // Load sample pets data
    loadMyPets();
    loadFavoritePets();
    loadAdoptionHistory();
    
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
    
    // Sample data loading functions
    function loadMyPets() {
        const myPetsGrid = document.getElementById('myPetsGrid');
        const noPetsMessage = document.getElementById('noPetsMessage');
        
        if (!myPetsGrid) return;
        
        // Sample pets data
        const myPets = [
            {
                id: 1,
                name: 'Max',
                image: 'dog1.jpg',
                breed: 'Labrador',
                age: '3 anos',
                size: 'Porte Médio',
                status: 'Disponível para adoção'
            },
            {
                id: 2,
                name: 'Luna',
                image: 'cat1.jpg',
                breed: 'Siamês',
                age: '1 ano',
                size: 'Porte Pequeno',
                status: 'Disponível para adoção'
            }
        ];
        
        // If there are pets, hide the "no pets" message
        if (myPets.length > 0 && noPetsMessage) {
            noPetsMessage.style.display = 'none';
        }
        
        // Create pet cards
        myPets.forEach(pet => {
            const petCard = document.createElement('div');
            petCard.className = 'pet-card';
            petCard.innerHTML = `
                <div class="pet-image">
                    <img src="${pet.image}" alt="${pet.name}">
                </div>
                <div class="pet-info">
                    <h3 class="pet-name">${pet.name}</h3>
                    <p class="pet-breed">${pet.breed}</p>
                    <p class="pet-age">${pet.age}</p>
                    <span class="pet-size">${pet.size}</span>
                    <p class="pet-status">${pet.status}</p>
                    <div class="pet-actions">
                        <a href="#" class="pet-action-btn edit-pet" data-id="${pet.id}">Editar</a>
                        <button class="favorite-btn" data-id="${pet.id}">❤</button>
                    </div>
                </div>
            `;
            
            myPetsGrid.appendChild(petCard);
        });
        
        // Add event listeners for edit buttons
        const editButtons = document.querySelectorAll('.edit-pet');
        editButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const petId = this.getAttribute('data-id');
                showNotification(`Editando pet ID: ${petId}`);
                // Here you would normally open an edit form or modal
            });
        });
    }
    
    function loadFavoritePets() {
        const favoritePetsGrid = document.getElementById('favoritePetsGrid');
        
        if (!favoritePetsGrid) return;
        
        // Sample favorite pets data
        const favoritePets = [
            {
                id: 3,
                name: 'Thor',
                image: 'dog2.jpg',
                breed: 'Golden Retriever',
                age: '2 anos',
                size: 'Porte Grande'
            },
            {
                id: 4,
                name: 'Nina',
                image: 'cat2.jpg',
                breed: 'Persa',
                age: '4 anos',
                size: 'Porte Pequeno'
            },
            {
                id: 5,
                name: 'Rex',
                image: 'dog3.jpg',
                breed: 'Pastor Alemão',
                age: '1 ano',
                size: 'Porte Grande'
            }
        ];
        
        // Create pet cards
        favoritePets.forEach(pet => {
            const petCard = document.createElement('div');
            petCard.className = 'pet-card';
            petCard.innerHTML = `
                <div class="pet-image">
                    <img src="${pet.image}" alt="${pet.name}">
                </div>
                <div class="pet-info">
                    <h3 class="pet-name">${pet.name}</h3>
                    <p class="pet-breed">${pet.breed}</p>
                    <p class="pet-age">${pet.age}</p>
                    <span class="pet-size">${pet.size}</span>
                    <div class="pet-actions">
                        <a href="#" class="pet-action-btn">Ver Detalhes</a>
                        <button class="favorite-btn active" data-id="${pet.id}">❤</button>
                    </div>
                </div>
            `;
            
            favoritePetsGrid.appendChild(petCard);
        });
        
        // Add event listeners for favorite buttons
        const favoriteButtons = favoritePetsGrid.querySelectorAll('.favorite-btn');
        favoriteButtons.forEach(button => {
            button.addEventListener('click', function() {
                const petId = this.getAttribute('data-id');
                this.classList.toggle('active');
                
                if (!this.classList.contains('active')) {
                    // Remove the pet card from favorites
                    this.closest('.pet-card').remove();
                    showNotification(`Pet removido dos favoritos.`);
                }
            });
        });
    }
    
    function loadAdoptionHistory() {
        const adoptionTimeline = document.getElementById('adoptionTimeline');
        
        if (!adoptionTimeline) return;
        
        // Sample adoption history data
        const adoptionHistory = [
            {
                date: '15/02/2025',
                petName: 'Bella',
                petType: 'Cachorro',
                petImage: 'dog4.jpg',
                status: 'Adoção Finalizada',
                details: 'Adotou um lindo filhote de Beagle.'
            },
            {
                date: '10/01/2025',
                petName: 'Oliver',
                petType: 'Gato',
                petImage: 'cat3.jpg',
                status: 'Adoção Finalizada',
                details: 'Adotou um gatinho resgatado de 6 meses de idade.'
            }
        ];
        
        // Create timeline items
        adoptionHistory.forEach(item => {
            const timelineItem = document.createElement('div');
            timelineItem.className = 'timeline-item';
            timelineItem.innerHTML = `
                <div class="timeline-date">${item.date}</div>
                <div class="timeline-content">
                    <h3>${item.petName} - ${item.petType}</h3>
                    <p>${item.status}</p>
                    <p>${item.details}</p>
                </div>
            `;
            
            adoptionTimeline.appendChild(timelineItem);
        });
    }
    
    // Add CSS for notifications
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
        
        .notification.show {
            transform: translateY(0);
            opacity: 1;
        }
    `;
    document.head.appendChild(style);
});