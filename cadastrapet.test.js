// cadastrapet.test.js

// Mock simples do DOM para testes
const mockDOM = {
  getElementById: jest.fn(),
  querySelectorAll: jest.fn()
};

// Mock global do document
global.document = mockDOM;

// Função para validar campos obrigatórios (simplificada para testes)
function validateRequiredFields(formData) {
    const requiredFields = ['petName', 'petAge', 'petType', 'petBreed', 'petSize', 'petGender', 'petCity', 'petState', 'petDescription', 'ownerContact'];
    
    let isValid = true;
    const errors = {};
    
    requiredFields.forEach(field => {
        if (!formData[field] || !formData[field].toString().trim()) {
            isValid = false;
            errors[field] = `Por favor, informe o ${field}.`;
        }
    });
    
    return { isValid, errors };
}

// Função para validar tipo de arquivo
function validateFileType(file) {
    if (!file) {
        return { isValid: false, error: 'Nenhum arquivo selecionado.' };
    }
    
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
        return { isValid: false, error: 'Por favor, selecione uma imagem nos formatos JPG ou PNG.' };
    }
    
    // Verificar tamanho do arquivo (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        return { isValid: false, error: 'A imagem deve ter no máximo 5MB.' };
    }
    
    return { isValid: true, error: null };
}

// Função para criar dados de pet (extraída da lógica do código original)
function createPetData(formInputs, userId, photoBase64) {
    return {
        nome: formInputs.petName?.trim() || '',
        idade: parseInt(formInputs.petAge?.trim()) || 0,
        tipo: formInputs.petType || '',
        raca: formInputs.petBreed?.trim() || '',
        porte: formInputs.petSize || '',
        sexo: formInputs.petGender || '',
        cidade: formInputs.petCity?.trim() || '',
        estado: formInputs.petState || '',
        foto: photoBase64 || '',
        descricao: formInputs.petDescription?.trim() || '',
        informacao: formInputs.additionalInfo?.trim() || null,
        contato: formInputs.ownerContact?.trim() || '',
        usuario_id: userId
    };
}

// Testes
describe('Cadastro de Pet - Testes Unitários', () => {
    
    describe('Validação de Campos Obrigatórios', () => {
        
        test('deve retornar false quando todos os campos estão vazios', () => {
            const formData = {};
            const result = validateRequiredFields(formData);
            
            expect(result.isValid).toBe(false);
            expect(Object.keys(result.errors).length).toBeGreaterThan(0);
        });
        
        test('deve retornar false quando apenas alguns campos estão preenchidos', () => {
            const formData = {
                petName: 'Rex',
                petAge: '3'
                // Outros campos vazios
            };
            
            const result = validateRequiredFields(formData);
            expect(result.isValid).toBe(false);
        });
        
        test('deve retornar true quando todos os campos obrigatórios estão preenchidos', () => {
            const formData = {
                petName: 'Rex',
                petAge: '3',
                petType: 'cachorro',
                petBreed: 'Labrador',
                petSize: 'grande',
                petGender: 'macho',
                petCity: 'São Paulo',
                petState: 'SP',
                petDescription: 'Cachorro dócil e brincalhão',
                ownerContact: '(11) 99999-9999'
            };
            
            const result = validateRequiredFields(formData);
            expect(result.isValid).toBe(true);
            expect(Object.keys(result.errors).length).toBe(0);
        });
        
        test('deve retornar erro específico para campo nome vazio', () => {
            const formData = { petName: '' };
            const result = validateRequiredFields(formData);
            
            expect(result.isValid).toBe(false);
            expect(result.errors.petName).toBeDefined();
        });
        
        test('deve aceitar campos com espaços que contêm texto', () => {
            const formData = {
                petName: '  Rex  ',
                petAge: '3',
                petType: 'cachorro',
                petBreed: 'Labrador',
                petSize: 'grande',
                petGender: 'macho',
                petCity: 'São Paulo',
                petState: 'SP',
                petDescription: 'Cachorro dócil',
                ownerContact: '(11) 99999-9999'
            };
            
            const result = validateRequiredFields(formData);
            expect(result.isValid).toBe(true);
        });
    });

    describe('Validação de Arquivo de Imagem', () => {
        
        test('deve retornar false para arquivo nulo', () => {
            const result = validateFileType(null);
            expect(result.isValid).toBe(false);
            expect(result.error).toBe('Nenhum arquivo selecionado.');
        });
        
        test('deve retornar false para tipo de arquivo inválido', () => {
            const mockFile = {
                type: 'application/pdf',
                size: 1024 // 1KB
            };
            
            const result = validateFileType(mockFile);
            expect(result.isValid).toBe(false);
            expect(result.error).toBe('Por favor, selecione uma imagem nos formatos JPG ou PNG.');
        });
        
        test('deve retornar false para arquivo muito grande', () => {
            const mockFile = {
                type: 'image/jpeg',
                size: 10 * 1024 * 1024 // 10MB
            };
            
            const result = validateFileType(mockFile);
            expect(result.isValid).toBe(false);
            expect(result.error).toBe('A imagem deve ter no máximo 5MB.');
        });
        
        test('deve retornar true para arquivo JPEG válido', () => {
            const mockFile = {
                type: 'image/jpeg',
                size: 2 * 1024 * 1024 // 2MB
            };
            
            const result = validateFileType(mockFile);
            expect(result.isValid).toBe(true);
            expect(result.error).toBe(null);
        });
        
        test('deve retornar true para arquivo PNG válido', () => {
            const mockFile = {
                type: 'image/png',
                size: 1 * 1024 * 1024 // 1MB
            };
            
            const result = validateFileType(mockFile);
            expect(result.isValid).toBe(true);
            expect(result.error).toBe(null);
        });
        
        test('deve aceitar formato JPG (não apenas JPEG)', () => {
            const mockFile = {
                type: 'image/jpg',
                size: 1 * 1024 * 1024 // 1MB
            };
            
            const result = validateFileType(mockFile);
            expect(result.isValid).toBe(true);
            expect(result.error).toBe(null);
        });
    });

    describe('Criação de Dados do Pet', () => {
        
        test('deve criar objeto de dados do pet corretamente', () => {
            const formInputs = {
                petName: 'Rex',
                petAge: '3',
                petType: 'cachorro',
                petBreed: 'Labrador',
                petSize: 'grande',
                petGender: 'macho',
                petCity: 'São Paulo',
                petState: 'SP',
                petDescription: 'Cachorro dócil',
                ownerContact: '(11) 99999-9999',
                additionalInfo: 'Vacinado'
            };
            
            const userId = 123;
            const photoBase64 = 'data:image/jpeg;base64,/9j/4AAQ...';
            
            const result = createPetData(formInputs, userId, photoBase64);
            
            expect(result.nome).toBe('Rex');
            expect(result.idade).toBe(3);
            expect(result.tipo).toBe('cachorro');
            expect(result.usuario_id).toBe(123);
            expect(result.foto).toBe(photoBase64);
        });
        
        test('deve tratar campos vazios corretamente', () => {
            const formInputs = {
                petName: '',
                petAge: '',
                additionalInfo: ''
            };
            
            const result = createPetData(formInputs, 123, '');
            
            expect(result.nome).toBe('');
            expect(result.idade).toBe(0);
            expect(result.informacao).toBe(null);
        });
        
        test('deve remover espaços em branco dos campos de texto', () => {
            const formInputs = {
                petName: '  Rex  ',
                petBreed: '  Labrador  ',
                petCity: '  São Paulo  '
            };
            
            const result = createPetData(formInputs, 123, '');
            
            expect(result.nome).toBe('Rex');
            expect(result.raca).toBe('Labrador');
            expect(result.cidade).toBe('São Paulo');
        });
    });
});

// Exportar funções para uso nos testes
module.exports = {
    validateRequiredFields,
    validateFileType,
    createPetData
};