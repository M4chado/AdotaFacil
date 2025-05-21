// validacoes.test.js
const { validateEmail, validatePhone } = require('./validacoes');

describe('Função validateEmail', () => {
    test('Deve retornar true para email válido', () => {
        expect(validateEmail('teste@email.com')).toBe(true);
    });

    test('Deve retornar false para email inválido', () => {
        expect(validateEmail('email-invalido')).toBe(false);
    });
});

describe('Função validatePhone', () => {
    test('Deve retornar true para número válido com 11 dígitos', () => {
        expect(validatePhone('(11) 91234-5678')).toBe(true);
    });

    test('Deve retornar true para número válido com 10 dígitos', () => {
        expect(validatePhone('(11) 1234-5678')).toBe(true);
    });

    test('Deve retornar false para número inválido', () => {
        expect(validatePhone('123')).toBe(false);
    });
});
