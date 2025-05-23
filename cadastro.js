import { validateEmail, validatePhone } from './validacoes.js';

document.addEventListener('DOMContentLoaded', function () {
    const registerForm = document.getElementById('register-form');
    const successMessage = document.getElementById('success-message');
    const redirectLoginBtn = document.getElementById('redirect-login');

    if (typeof supabase === 'undefined') {
        console.error('Supabase não está definido. Verifique se o script foi carregado corretamente.');
        if (typeof notificarErro === 'function') {
            notificarErro('Erro de Conexão', 'Não foi possível estabelecer conexão com o servidor.');
        }
        return;
    } else {
        console.log('✅ Conexão com o Supabase estabelecida com sucesso!');
    }

    if (redirectLoginBtn) {
        redirectLoginBtn.addEventListener('click', function() {
            console.log('Redirecionando para login.html');
            window.location.href = 'login.html';
        });
    }

    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        let isValid = true;

        const name = document.getElementById('register-name');
        const email = document.getElementById('register-email');
        const password = document.getElementById('register-password');
        const phone = document.getElementById('register-phone');
        const city = document.getElementById('register-city');
        const state = document.getElementById('register-state');
        
        // Validações
        if (name.value.trim() === '') {
            document.getElementById('register-name-error').style.display = 'block';
            name.style.borderColor = 'var(--error-color)';
            isValid = false;
        } else {
            document.getElementById('register-name-error').style.display = 'none';
            name.style.borderColor = '#ddd';
        }

        if (!validateEmail(email.value)) {
            document.getElementById('register-email-error').style.display = 'block';
            email.style.borderColor = 'var(--error-color)';
            isValid = false;
        } else {
            document.getElementById('register-email-error').style.display = 'none';
            email.style.borderColor = '#ddd';
        }

        if (password.value.length < 8) {
            document.getElementById('register-password-error').style.display = 'block';
            password.style.borderColor = 'var(--error-color)';
            isValid = false;
        } else {
            document.getElementById('register-password-error').style.display = 'none';
            password.style.borderColor = '#ddd';
        }

        if (!validatePhone(phone.value)) {
            document.getElementById('register-phone-error').style.display = 'block';
            phone.style.borderColor = 'var(--error-color)';
            isValid = false;
        } else {
            document.getElementById('register-phone-error').style.display = 'none';
            phone.style.borderColor = '#ddd';
        }

        if (city.value.trim() === '') {
            document.getElementById('register-city-error').style.display = 'block';
            city.style.borderColor = 'var(--error-color)';
            isValid = false;
        } else {
            document.getElementById('register-city-error').style.display = 'none';
            city.style.borderColor = '#ddd';
        }

        if (state.value === '') {
            document.getElementById('register-state-error').style.display = 'block';
            state.style.borderColor = 'var(--error-color)';
            isValid = false;
        } else {
            document.getElementById('register-state-error').style.display = 'none';
            state.style.borderColor = '#ddd';
        }

        if (isValid) {
            cadastrarUsuario(
                name.value,
                email.value,
                password.value,
                phone.value,
                city.value,
                state.value
            );
        } else {
            notificarAlerta('Atenção', 'Verifique os campos destacados e tente novamente.');
        }
    });

    const phoneInput = document.getElementById('register-phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 0) {
                value = '(' + value;
                if (value.length > 3) {
                    value = value.substring(0, 3) + ') ' + value.substring(3);
                }
                if (value.length > 10) {
                    value = value.substring(0, 10) + '-' + value.substring(10);
                }
                if (value.length > 15) {
                    value = value.substring(0, 15);
                }
            }
            e.target.value = value;
        });
    }

    function cadastrarUsuario(nome, email, senha, telefone, cidade, estado) {
        const loadingNotification = notificarInfo('Processando', 'Realizando seu cadastro...', 0);

        try {
            supabase
                .from('usuarios')
                .select('email')
                .eq('email', email)
                .then(response => {
                    const { data, error } = response;
                    
                    if (error) {
                        fecharNotificacao(loadingNotification);
                        console.error('Erro ao verificar email:', error);
                        notificarErro('Erro na Verificação', 'Não foi possível verificar se o email já está cadastrado.');
                        return;
                    }

                    if (data && data.length > 0) {
                        fecharNotificacao(loadingNotification);
                        notificarAlerta('Email em Uso', 'Este email já está cadastrado. Por favor, use outro email ou faça login.');
                        return;
                    }

                    supabase
                        .from('usuarios')
                        .insert([{
                            nome: nome,
                            email: email,
                            senha: senha,
                            telefone: telefone,
                            cidade: cidade,
                            estado: estado
                        }])
                        .then(insertResponse => {
                            fecharNotificacao(loadingNotification);

                            const { error: insertError } = insertResponse;
                            if (insertError) {
                                console.error('Erro ao cadastrar:', insertError);
                                notificarErro('Falha no Cadastro', 'Ocorreu um erro ao tentar cadastrar. Tente novamente mais tarde.');
                                return;
                            }

                            console.log('✅ Usuário cadastrado com sucesso no Supabase!');
                            notificarSucesso('Cadastro Concluído', 'Sua conta foi criada com sucesso! Redirecionando para o login...');
                            registerForm.reset();

                            setTimeout(() => {
                                window.location.href = 'login.html?registered=true';
                            }, 2000);
                        })
                        .catch(insertErr => {
                            fecharNotificacao(loadingNotification);
                            console.error('Erro na inserção:', insertErr);
                            notificarErro('Erro no Cadastro', 'Ocorreu um erro inesperado ao tentar cadastrar. Tente novamente.');
                        });
                })
                .catch(err => {
                    fecharNotificacao(loadingNotification);
                    console.error('Erro na consulta:', err);
                    notificarErro('Falha na Comunicação', 'Ocorreu um erro inesperado ao conectar com o servidor.');
                });
        } catch (err) {
            fecharNotificacao(loadingNotification);
            console.error('Erro inesperado:', err);
            notificarErro('Erro Inesperado', 'Ocorreu um problema ao processar sua solicitação.');
        }
    }
});
