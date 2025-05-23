// utils.test.js
const { filterPets } = require('./utils');

describe('filterPets', () => {
    const petsMock = [
        { id: 1, nome: 'Rex', porte: 'small', tipo: 'dog' },
        { id: 2, nome: 'Miau', porte: 'large', tipo: 'cat' },
        { id: 3, nome: 'Tobby', porte: 'medium', tipo: 'dog' }
    ];

    it('retorna todos os pets se o filtro for "all"', () => {
        const result = filterPets(petsMock, { size: 'all', type: null });
        expect(result.length).toBe(3);
    });

    it('filtra por porte corretamente', () => {
        const result = filterPets(petsMock, { size: 'small', type: null });
        expect(result).toEqual([{ id: 1, nome: 'Rex', porte: 'small', tipo: 'dog' }]);
    });

    it('filtra por tipo corretamente', () => {
        const result = filterPets(petsMock, { size: 'all', type: 'cat' });
        expect(result).toEqual([{ id: 2, nome: 'Miau', porte: 'large', tipo: 'cat' }]);
    });

    it('filtra por porte e tipo ao mesmo tempo', () => {
        const result = filterPets(petsMock, { size: 'medium', type: 'dog' });
        expect(result).toEqual([{ id: 3, nome: 'Tobby', porte: 'medium', tipo: 'dog' }]);
    });

    it('retorna array vazio se nenhum pet corresponder ao filtro', () => {
        const result = filterPets(petsMock, { size: 'small', type: 'cat' });
        expect(result).toEqual([]);
    });
});
