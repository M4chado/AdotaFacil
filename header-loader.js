document.addEventListener("DOMContentLoaded", () => {
    // Carregar o cabeçalho
    fetch('header.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('header-container').innerHTML = data;
            // Após carregar o cabeçalho, verificar se o usuário está logado
            setTimeout(checkLoginStatus, 100);
        });

    // Verificar status de login e atualizar menu
    function checkLoginStatus() {
        const navMenu = document.getElementById('nav-menu');
        if (!navMenu) return;
        
        // Verificar se há um usuário logado
        const currentUser = sessionStorage.getItem('currentUser') ? JSON.parse(sessionStorage.getItem('currentUser')) : null;
        
        if (currentUser) {
            // Usuário está logado - estrutura com espaçamento consistente
            navMenu.innerHTML = `
                <li><a href="index.html" class="nav-link">Início</a></li>
                <li><span class="user-greeting">Olá, ${currentUser.nome.split(' ')[0]}</span></li>
                <li><a href="Perfil.html" class="nav-link">Perfil</a></li>
                <li><a href="cadastrapet.html" class="nav-link">Doe um Pet</a></li>
            `;
        } else {
            // Usuário não está logado
            navMenu.innerHTML = `
                <li><a href="index.html" class="nav-link">Início</a></li>
                <li><a href="login.html" class="login-btn">Login/Cadastro</a></li>
            `;
        }
        
        // Marcar a página atual como ativa
        const currentPage = window.location.pathname.split('/').pop();
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPage) {
                link.classList.add('active');
            }
        });
    }
}); 