// perfil.test.js
const { populateUserData } = require('./perfil.js');

describe('populateUserData (arquivo original)', () => {
  let mockDocument;

  beforeEach(() => {
    const fields = {
      fullName: { value: '' },
      email: { value: '' },
      phone: { value: '' },
      city: { value: '' },
      state: { value: '' }
    };

    mockDocument = {
      getElementById: (id) => fields[id],
      fields
    };
  });

  it('deve preencher os campos do formulário com os dados do usuário', () => {
    const userData = {
      nome: 'Ana Paula',
      email: 'ana@teste.com',
      telefone: '99999-9999',
      cidade: 'Curitiba',
      estado: 'PR'
    };

    const fields = {
      fullName: { value: '' },
      email: { value: '' },
      phone: { value: '' },
      city: { value: '' },
      state: { value: '' }
    };

    const fakeDocument = {
      getElementById: (id) => fields[id]
    };

    populateUserData(userData, fakeDocument);

    expect(fields.fullName.value).toBe('Ana Paula');
    expect(fields.email.value).toBe('ana@teste.com');
    expect(fields.phone.value).toBe('99999-9999');
    expect(fields.city.value).toBe('Curitiba');
    expect(fields.state.value).toBe('PR');
  });
});
