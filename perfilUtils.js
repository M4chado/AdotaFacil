// perfilUtils.js
function populateUserData(userData, documentRef = document) {
    if (userData.nome) {
        documentRef.getElementById('fullName').value = userData.nome;
    }
    if (userData.email) {
        documentRef.getElementById('email').value = userData.email;
    }
    if (userData.telefone) {
        documentRef.getElementById('phone').value = userData.telefone;
    }
    if (userData.cidade) {
        documentRef.getElementById('city').value = userData.cidade;
    }
    if (userData.estado) {
        documentRef.getElementById('state').value = userData.estado;
    }
}

module.exports = { populateUserData };
