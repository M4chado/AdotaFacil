// login.common.js
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Mock da função verificarCredenciais para testes
function verificarCredenciais(email, senha, supabase) {
    // Validar email e senha básicos
    if (!validateEmail(email)) {
        return { success: false, message: 'Email inválido' };
    }
    
    if (senha.trim() === '') {
        return { success: false, message: 'Senha é obrigatória' };
    }
    
    // Simular chamada ao Supabase
    // Em um teste real, você substituiria isto com mocks
    if (email === 'teste@email.com' && senha === 'senha123') {
        return { 
            success: true, 
            data: { 
                id: 1, 
                nome: 'Usuário Teste', 
                email: 'teste@email.com' 
            } 
        };
    } else {
        return { success: false, message: 'Credenciais inválidas' };
    }
}

// Função para verificar se já existe uma sessão ativa
function checkSession(currentUser, redirectPage) {
    if (currentUser) {
        if (redirectPage) {
            return redirectPage;
        } else {
            return 'index.html';
        }
    }
    return null;
}

module.exports = {
    validateEmail,
    verificarCredenciais,
    checkSession
};