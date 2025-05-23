// perfilUtils.test.js
const { populateUserData } = require('./perfilUtils');

describe('populateUserData', () => {
    let mockDocument;

    beforeEach(() => {
        mockDocument = {
            getElementById: jest.fn((id) => {
                return { value: '' };
            })
        };

        mockDocument.getElementById.mockImplementation((id) => {
            const fields = {
                fullName: { value: '' },
                email: { value: '' },
                phone: { value: '' },
                city: { value: '' },
                state: { value: '' }
            };
            return fields[id];
        });
    });

    it('deve preencher os campos corretamente com os dados do usuário', () => {
        const userData = {
            nome: 'João Silva',
            email: 'joao@email.com',
            telefone: '123456789',
            cidade: 'São Paulo',
            estado: 'SP'
        };

        const fields = {
            fullName: { value: '' },
            email: { value: '' },
            phone: { value: '' },
            city: { value: '' },
            state: { value: '' }
        };

        mockDocument.getElementById = (id) => fields[id];

        populateUserData(userData, mockDocument);

        expect(fields.fullName.value).toBe('João Silva');
        expect(fields.email.value).toBe('joao@email.com');
        expect(fields.phone.value).toBe('123456789');
        expect(fields.city.value).toBe('São Paulo');
        expect(fields.state.value).toBe('SP');
    });
});
