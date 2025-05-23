// utils.js
function filterPets(petsArray, filter) {
    return petsArray.filter(pet => {
        if (filter.size !== 'all' && pet.porte !== filter.size) {
            return false;
        }
        if (filter.type && pet.tipo !== filter.type) {
            return false;
        }
        return true;
    });
}

module.exports = { filterPets };
