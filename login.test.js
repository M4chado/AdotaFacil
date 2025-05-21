// login.test.js
const { validateEmail, verificarCredenciais, checkSession } = require('./login.common');

// Mock global do sessionStorage para os testes
const mockSessionStorage = (() => {
    let store = {};
    return {
        getItem: jest.fn(key => store[key] || null),
        setItem: jest.fn((key, value) => {
            store[key] = value.toString();
        }),
        clear: jest.fn(() => {
            store = {};
        }),
        removeItem: jest.fn(key => {
            delete store[key];
        })
    };
})();

// Mock para o objeto supabase
const mockSupabase = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    then: jest.fn()
};

// Mock para o objeto window
global.window = {
    location: {
        href: '',
        search: ''
    },
    sessionStorage: mockSessionStorage
};

describe('Função validateEmail', () => {
    test('Deve retornar true para email válido', () => {
        expect(validateEmail('teste@email.com')).toBe(true);
    });

    test('Deve retornar false para email inválido', () => {
        expect(validateEmail('email-invalido')).toBe(false);
    });
});

describe('Função verificarCredenciais', () => {
    test('Deve retornar sucesso para credenciais válidas', () => {
        const resultado = verificarCredenciais('teste@email.com', 'senha123', mockSupabase);
        expect(resultado.success).toBe(true);
        expect(resultado.data).toBeDefined();
    });

    test('Deve retornar falha para email inválido', () => {
        const resultado = verificarCredenciais('email-invalido', 'senha123', mockSupabase);
        expect(resultado.success).toBe(false);
        expect(resultado.message).toBe('Email inválido');
    });

    test('Deve retornar falha para senha vazia', () => {
        const resultado = verificarCredenciais('teste@email.com', '', mockSupabase);
        expect(resultado.success).toBe(false);
        expect(resultado.message).toBe('Senha é obrigatória');
    });

    test('Deve retornar falha para credenciais inválidas', () => {
        const resultado = verificarCredenciais('teste@email.com', 'senhaerrada', mockSupabase);
        expect(resultado.success).toBe(false);
        expect(resultado.message).toBe('Credenciais inválidas');
    });
});

describe('Função checkSession', () => {
    test('Deve retornar para index.html quando tem sessão ativa sem redirect', () => {
        const currentUser = JSON.stringify({ id: 1, nome: 'Teste' });
        const resultado = checkSession(currentUser, null);
        expect(resultado).toBe('index.html');
    });

    test('Deve retornar para página específica quando tem sessão e redirect', () => {
        const currentUser = JSON.stringify({ id: 1, nome: 'Teste' });
        const resultado = checkSession(currentUser, 'meus-pets.html');
        expect(resultado).toBe('meus-pets.html');
    });

    test('Deve retornar null quando não tem sessão ativa', () => {
        const resultado = checkSession(null, null);
        expect(resultado).toBeNull();
    });
});