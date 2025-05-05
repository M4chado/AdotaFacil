/**
 * Sistema de notificações para o AdotaFácil
 * Permite exibir notificações de sucesso, erro, alerta e informação
 */

// Função para criar e exibir notificações
function mostrarNotificacao(titulo, mensagem, tipo = 'info', duracao = 4000) {
    // Remover notificações anteriores, se necessário
    const notificacoesAnteriores = document.querySelectorAll('.notificacao');
    if (notificacoesAnteriores.length > 0) {
        notificacoesAnteriores.forEach(notif => {
            notif.classList.add('fadeOut');
            setTimeout(() => {
                if (notif && notif.parentNode) {
                    notif.parentNode.removeChild(notif);
                }
            }, 500);
        });
    }
    
    // Criar container para notificação se não existir
    let notificacoesContainer = document.getElementById('notificacoes-container');
    if (!notificacoesContainer) {
        notificacoesContainer = document.createElement('div');
        notificacoesContainer.id = 'notificacoes-container';
        document.body.appendChild(notificacoesContainer);
    }
    
    // Criar elemento de notificação
    const notificacao = document.createElement('div');
    notificacao.className = `notificacao notificacao-${tipo}`;
    
    // Definir ícone com base no tipo
    let icone = '';
    switch(tipo) {
        case 'sucesso':
            icone = '✓';
            break;
        case 'erro':
            icone = '✕';
            break;
        case 'alerta':
            icone = '⚠';
            break;
        case 'info':
        default:
            icone = 'ⓘ';
            break;
    }
    
    // Estrutura da notificação
    notificacao.innerHTML = `
        <div class="notificacao-icone">${icone}</div>
        <div class="notificacao-conteudo">
            <div class="notificacao-titulo">${titulo}</div>
            <div class="notificacao-mensagem">${mensagem}</div>
        </div>
        <button class="notificacao-fechar">×</button>
    `;
    
    // Adicionar ao container
    notificacoesContainer.appendChild(notificacao);
    
    // Animar entrada
    setTimeout(() => {
        notificacao.classList.add('mostrar');
    }, 10);
    
    // Configurar botão de fechar
    const btnFechar = notificacao.querySelector('.notificacao-fechar');
    btnFechar.addEventListener('click', () => {
        fecharNotificacao(notificacao);
    });
    
    // Auto-fechar após a duração definida
    if (duracao > 0) {
        setTimeout(() => {
            fecharNotificacao(notificacao);
        }, duracao);
    }
    
    // Retornar a notificação para possível manipulação adicional
    return notificacao;
}

// Função para fechar notificação com animação
function fecharNotificacao(notificacao) {
    notificacao.classList.remove('mostrar');
    notificacao.classList.add('fadeOut');
    
    setTimeout(() => {
        if (notificacao && notificacao.parentNode) {
            notificacao.parentNode.removeChild(notificacao);
        }
    }, 500);
}

// Funções de atalho para diferentes tipos de notificação
function notificarSucesso(titulo, mensagem, duracao = 4000) {
    return mostrarNotificacao(titulo, mensagem, 'sucesso', duracao);
}

function notificarErro(titulo, mensagem, duracao = 4000) {
    return mostrarNotificacao(titulo, mensagem, 'erro', duracao);
}

function notificarAlerta(titulo, mensagem, duracao = 4000) {
    return mostrarNotificacao(titulo, mensagem, 'alerta', duracao);
}

function notificarInfo(titulo, mensagem, duracao = 4000) {
    return mostrarNotificacao(titulo, mensagem, 'info', duracao);
}