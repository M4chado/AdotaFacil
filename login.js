document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('login-form');
    const successMessage = document.getElementById('success-message');
    const redirectRegisterBtn = document.getElementById('redirect-register');

    // Verificar se há uma mensagem de sucesso na URL (redirecionado do cadastro)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('registered') === 'true') {
        // Usar a notificação estilizada ao invés do alerta padrão
        notificarSucesso('Conta Criada', 'Cadastro realizado com sucesso! Agora você pode fazer login.');
    }

    // Obter a página de redirecionamento se existir
    const redirectPage = urlParams.get('redirect');

    // Verificar se já existe uma sessão ativa
    checkSession();

    // Redirecionar para a página de cadastro
    redirectRegisterBtn.addEventListener('click', () => {
        // Manter o parâmetro de redirecionamento se existir
        if (redirectPage) {
            window.location.href = `cadastro.html?redirect=${redirectPage}`;
        } else {
            window.location.href = 'cadastro.html';
        }
    });

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        let isValid = true;

        const email = document.getElementById('login-email');
        const password = document.getElementById('login-password');
        const emailError = document.getElementById('login-email-error');
        const passwordError = document.getElementById('login-password-error');

        // Validação de formulário
        if (!validateEmail(email.value)) {
            emailError.style.display = 'block';
            email.style.borderColor = 'var(--error-color)';
            isValid = false;
        } else {
            emailError.style.display = 'none';
            email.style.borderColor = '#ddd';
        }

        if (password.value.trim() === '') {
            passwordError.style.display = 'block';
            password.style.borderColor = 'var(--error-color)';
            isValid = false;
        } else {
            passwordError.style.display = 'none';
            password.style.borderColor = '#ddd';
        }

        if (isValid) {
            // Consultar diretamente a tabela usuarios para o login
            verificarCredenciais(email.value, password.value);
        }
    });

    // Função para verificar se já existe uma sessão ativa
    function checkSession() {
        const currentUser = sessionStorage.getItem('currentUser');
        if (currentUser) {
            // Se houver uma página para redirecionar, vá para ela
            if (redirectPage) {
                window.location.href = redirectPage;
            } else {
                // Senão, vá para a página inicial
                window.location.href = 'index.html';
            }
        }
    }
    
    // Função para verificar as credenciais no Supabase
    function verificarCredenciais(email, senha) {
        try {
            // Verificar se o objeto supabase está disponível
            if (typeof supabase === 'undefined') {
                console.error('Erro: Supabase não está inicializado.');
                notificarErro('Erro de Conexão', 'Não foi possível conectar ao servidor. Tente novamente mais tarde.');
                return;
            }

            // Mostrar notificação de carregamento
            const loadingNotification = notificarInfo('Verificando', 'Validando suas credenciais...', 0);

            // Consultar a tabela 'usuarios' no Supabase
            supabase
                .from('usuarios')
                .select('*')
                .eq('email', email)
                .eq('senha', senha)
                .then(response => {
                    const { data, error } = response;
                    
                    // Fechar notificação de carregamento
                    fecharNotificacao(loadingNotification);
                    
                    // Exibir mensagem de sucesso na conexão com o Supabase
                    console.log('✅ Consulta ao Supabase realizada com sucesso!');

                    if (error) {
                        console.error('Erro ao fazer login:', error);
                        notificarErro('Erro no Login', 'Houve um problema ao verificar suas credenciais. Tente novamente.');
                        return;
                    }
                    
                    // Verificar se encontrou algum usuário
                    if (!data || data.length === 0) {
                        notificarErro('Credenciais Inválidas', 'Email ou senha incorretos. Verifique e tente novamente.');
                        return;
                    }

                    // Login bem-sucedido
                    console.log('✅ Login realizado com sucesso!');
                    
                    // Guardar info do usuário na sessão
                    sessionStorage.setItem('currentUser', JSON.stringify(data[0]));

                    // Mostrar notificação de sucesso
                    notificarSucesso('Login Bem-sucedido', `Olá, ${data[0].nome.split(' ')[0]}! Bem-vindo(a) de volta.`);
                    
                    // Redirecionar para a página apropriada após um curto delay
                    setTimeout(() => {
                        if (redirectPage) {
                            window.location.href = redirectPage;
                        } else {
                            window.location.href = 'index.html';
                        }
                    }, 1500);
                })
                .catch(err => {
                    // Fechar notificação de carregamento
                    fecharNotificacao(loadingNotification);
                    
                    console.error('Erro na consulta:', err);
                    notificarErro('Falha na Comunicação', 'Ocorreu um erro inesperado. Tente novamente mais tarde.');
                });
        } catch (err) {
            console.error('Erro inesperado:', err);
            notificarErro('Erro Inesperado', 'Ocorreu um problema ao processar sua solicitação.');
        }
    }
});

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}