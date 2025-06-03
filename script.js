// Script pour gérer l'ajout, l'affichage et le filtrage des recettes
// Les recettes sont sauvegardées dans le localStorage du navigateur

const form = document.getElementById('recipe-form');
const list = document.getElementById('recipe-list');
const searchInput = document.getElementById('search');

let recipes = [];

// Charger les recettes enregistrées au démarrage
loadFromStorage();
renderRecipes(recipes);

// Ajout d'une recette via le formulaire
form.addEventListener('submit', e => {
    e.preventDefault();

    const title = document.getElementById('title').value.trim();
    const ingredients = document.getElementById('ingredients').value.trim();
    const instructions = document.getElementById('instructions').value.trim();

    if (!title || !ingredients || !instructions) {
        return;
    }

    const recipe = {
        id: Date.now(),
        title,
        ingredients: ingredients.split(',').map(i => i.trim()),
        instructions
    };

    recipes.push(recipe);
    saveToStorage();
    renderRecipes(recipes);
    form.reset();
});

// Filtrage en direct selon l'ingrédient saisi
searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    const filtered = recipes.filter(r => r.ingredients.some(i => i.toLowerCase().includes(query)));
    renderRecipes(filtered);
});

// Sauvegarde dans localStorage
function saveToStorage() {
    localStorage.setItem('recipes', JSON.stringify(recipes));
}

// Chargement depuis localStorage
function loadFromStorage() {
    const data = localStorage.getItem('recipes');
    if (data) {
        recipes = JSON.parse(data);
    }
}

// Afficher la liste des recettes
function renderRecipes(listToRender) {
    list.innerHTML = '';
    listToRender.forEach(recipe => {
        const li = document.createElement('li');
        li.innerHTML = `<h3>${recipe.title}</h3>
            <p><strong>Ingrédients :</strong> ${recipe.ingredients.join(', ')}</p>
            <p>${recipe.instructions}</p>`;
        list.appendChild(li);
    });
}
