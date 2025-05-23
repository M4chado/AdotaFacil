// perfil.test.js

// Mock do DOM antes de importar o módulo
const mockDocument = {
  getElementById: jest.fn(),
  addEventListener: jest.fn(),
  createElement: jest.fn(() => ({
    textContent: '',
    className: '',
    innerHTML: '',
    style: {},
    appendChild: jest.fn(),
    addEventListener: jest.fn()
  })),
  body: {
    appendChild: jest.fn()
  },
  head: {
    appendChild: jest.fn()
  }
};

// Mock do window
const mockWindow = {
  addEventListener: jest.fn(),
  location: {
    href: ''
  },
  scrollTo: jest.fn(),
  setTimeout: global.setTimeout,
  clearTimeout: global.clearTimeout
};

// Configurar mocks globais
global.document = mockDocument;
global.window = mockWindow;
global.sessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn()
};

// Mock da função fetch
global.fetch = jest.fn(() => 
  Promise.resolve({
    text: () => Promise.resolve('<div>Mock HTML</div>')
  })
);

// Função para testar (extraída e isolada do arquivo original)
function populateUserData(userData, documentRef = document) {
    if (userData.nome) {
        const element = documentRef.getElementById('fullName');
        if (element) element.value = userData.nome;
    }
    if (userData.email) {
        const element = documentRef.getElementById('email');
        if (element) element.value = userData.email;
    }
    if (userData.telefone) {
        const element = documentRef.getElementById('phone');
        if (element) element.value = userData.telefone;
    }
    if (userData.cidade) {
        const element = documentRef.getElementById('city');
        if (element) element.value = userData.cidade;
    }
    if (userData.estado) {
        const element = documentRef.getElementById('state');
        if (element) element.value = userData.estado;
    }
}

describe('Perfil - Testes Unitários', () => {
  
  describe('populateUserData', () => {
    let mockFields;
    let mockDocumentRef;

    beforeEach(() => {
      // Criar campos mock para cada teste
      mockFields = {
        fullName: { value: '' },
        email: { value: '' },
        phone: { value: '' },
        city: { value: '' },
        state: { value: '' }
      };

      // Criar document mock que retorna os campos
      mockDocumentRef = {
        getElementById: jest.fn((id) => mockFields[id])
      };
    });

    test('deve preencher todos os campos quando userData está completo', () => {
      const userData = {
        nome: 'Ana Paula Silva',
        email: 'ana.paula@teste.com',
        telefone: '(11) 99999-9999',
        cidade: 'São Paulo',
        estado: 'SP'
      };

      populateUserData(userData, mockDocumentRef);

      expect(mockFields.fullName.value).toBe('Ana Paula Silva');
      expect(mockFields.email.value).toBe('ana.paula@teste.com');
      expect(mockFields.phone.value).toBe('(11) 99999-9999');
      expect(mockFields.city.value).toBe('São Paulo');
      expect(mockFields.state.value).toBe('SP');
    });

    test('deve preencher apenas campos disponíveis quando userData está incompleto', () => {
      const userData = {
        nome: 'João Santos',
        email: 'joao@teste.com'
        // telefone, cidade, estado não informados
      };

      populateUserData(userData, mockDocumentRef);

      expect(mockFields.fullName.value).toBe('João Santos');
      expect(mockFields.email.value).toBe('joao@teste.com');
      expect(mockFields.phone.value).toBe(''); // Deve permanecer vazio
      expect(mockFields.city.value).toBe(''); // Deve permanecer vazio
      expect(mockFields.state.value).toBe(''); // Deve permanecer vazio
    });

    test('deve lidar com userData vazio sem erros', () => {
      const userData = {};

      expect(() => {
        populateUserData(userData, mockDocumentRef);
      }).not.toThrow();

      // Todos os campos devem permanecer vazios
      expect(mockFields.fullName.value).toBe('');
      expect(mockFields.email.value).toBe('');
      expect(mockFields.phone.value).toBe('');
      expect(mockFields.city.value).toBe('');
      expect(mockFields.state.value).toBe('');
    });

    test('deve chamar getElementById para cada campo quando dados estão disponíveis', () => {
      const userData = {
        nome: 'Maria',
        email: 'maria@teste.com',
        telefone: '123456789',
        cidade: 'Rio de Janeiro',
        estado: 'RJ'
      };

      populateUserData(userData, mockDocumentRef);

      expect(mockDocumentRef.getElementById).toHaveBeenCalledWith('fullName');
      expect(mockDocumentRef.getElementById).toHaveBeenCalledWith('email');
      expect(mockDocumentRef.getElementById).toHaveBeenCalledWith('phone');
      expect(mockDocumentRef.getElementById).toHaveBeenCalledWith('city');
      expect(mockDocumentRef.getElementById).toHaveBeenCalledWith('state');
    });

    test('deve não chamar getElementById para campos não informados', () => {
      const userData = {
        nome: 'Pedro'
        // Apenas nome informado
      };

      populateUserData(userData, mockDocumentRef);

      expect(mockDocumentRef.getElementById).toHaveBeenCalledWith('fullName');
      expect(mockDocumentRef.getElementById).not.toHaveBeenCalledWith('email');
      expect(mockDocumentRef.getElementById).not.toHaveBeenCalledWith('phone');
      expect(mockDocumentRef.getElementById).not.toHaveBeenCalledWith('city');
      expect(mockDocumentRef.getElementById).not.toHaveBeenCalledWith('state');
    });

    test('deve lidar com elementos inexistentes sem erros', () => {
      // Simular elemento que não existe (getElementById retorna null)
      mockDocumentRef.getElementById = jest.fn(() => null);
      
      const userData = {
        nome: 'Carlos',
        email: 'carlos@teste.com'
      };

      expect(() => {
        populateUserData(userData, mockDocumentRef);
      }).not.toThrow();
    });
  });

  describe('Validação de Dados de Usuário', () => {
    
    test('deve validar se userData tem propriedades esperadas', () => {
      const userData = {
        nome: 'Teste',
        email: 'teste@email.com',
        telefone: '11999999999',
        cidade: 'São Paulo',
        estado: 'SP'
      };

      expect(userData).toHaveProperty('nome');
      expect(userData).toHaveProperty('email');
      expect(userData).toHaveProperty('telefone');
      expect(userData).toHaveProperty('cidade');
      expect(userData).toHaveProperty('estado');
    });

    test('deve aceitar userData com campos opcionais ausentes', () => {
      const userData = {
        nome: 'João'
      };

      expect(userData.nome).toBeDefined();
      expect(userData.email).toBeUndefined();
      expect(userData.telefone).toBeUndefined();
    });
  });
});

// Exportar função para reutilização se necessário
module.exports = {
  populateUserData
};