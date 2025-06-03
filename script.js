// Gestion du site de recettes avec navigation et stockage local

const pages = document.querySelectorAll('.page');
const navLinks = document.querySelectorAll('nav a');
let viewMode = 'list';
let recipes = [];

// ----- Navigation -----
navLinks.forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();
        showPage(link.dataset.page);
    });
});

function showPage(name) {
    pages.forEach(p => p.classList.remove('active'));
    document.getElementById(`${name}-page`).classList.add('active');
    navLinks.forEach(l => l.classList.toggle('active', l.dataset.page === name));
    if (name === 'recipes') {
        renderRecipeList();
        renderRandomMenu();
    }
    if (name === 'search') {
        renderSearchResults();
    }
}

// ----- Chargement et sauvegarde -----
function loadFromStorage() {
    const data = localStorage.getItem('recipes');
    if (data) {
        recipes = JSON.parse(data);
    }
}

function saveToStorage() {
    localStorage.setItem('recipes', JSON.stringify(recipes));
}

// ----- Utilitaires -----
function allIngredients() {
    const set = new Set();
    recipes.forEach(r => r.ingredients.forEach(i => set.add(i)));
    return Array.from(set).sort();
}

function updateIngredientList() {
    const datalist = document.getElementById('ingredient-list');
    datalist.innerHTML = '';
    allIngredients().forEach(ing => {
        const opt = document.createElement('option');
        opt.value = ing;
        datalist.appendChild(opt);
    });
}

function randomRecipe(cat) {
    const list = recipes.filter(r => r.category === cat);
    if (!list.length) return null;
    return list[Math.floor(Math.random() * list.length)];
}

// ----- Formulaire d'ajout -----
document.getElementById('add-form').addEventListener('submit', e => {
    e.preventDefault();
    const title = document.getElementById('add-title').value.trim();
    const url = document.getElementById('add-image').value.trim();
    const file = document.getElementById('add-image-file').files[0];
    const category = document.getElementById('add-category').value;
    const ing = document.getElementById('add-ingredients').value.split(',').map(i => i.trim()).filter(Boolean);
    const steps = document.getElementById('add-steps').value.trim();
    if (!title || !steps) return;

    const finalize = imageUrl => {
        const recipe = { id: Date.now(), title, image: imageUrl, category, ingredients: ing, steps };
        recipes.push(recipe);
        saveToStorage();
        updateIngredientList();
        e.target.reset();
        showPage('recipes');
    };

    if (file) {
        const reader = new FileReader();
        reader.onload = () => finalize(reader.result);
        reader.readAsDataURL(file);
    } else {
        finalize(url);
    }
});

// ----- Affichage des recettes -----
function renderRecipeList() {
    const container = document.getElementById('recipe-container');
    container.className = viewMode;
    const filter = document.getElementById('category-filter').value;
    let list = recipes;
    if (filter) list = list.filter(r => r.category === filter);
    container.innerHTML = '';
    list.forEach(r => {
        container.appendChild(recipeCard(r));
    });
}

function recipeCard(r) {
    const div = document.createElement('div');
    div.className = 'recipe-card';
    div.innerHTML = `<h3>${r.title}</h3>` +
        (r.image ? `<img src="${r.image}" alt="${r.title}">` : '') +
        `<p><strong>Catégorie :</strong> ${r.category}</p>` +
        `<p><strong>Ingrédients :</strong> ${r.ingredients.join(', ')}</p>` +
        `<p>${r.steps}</p>`;
    return div;
}

document.getElementById('list-view').addEventListener('click', () => { viewMode = 'list'; renderRecipeList(); });
document.getElementById('grid-view').addEventListener('click', () => { viewMode = 'grid'; renderRecipeList(); });
document.getElementById('category-filter').addEventListener('change', renderRecipeList);

function renderRandomMenu() {
    const box = document.getElementById('random-menu');
    const e = randomRecipe('entree');
    const p = randomRecipe('plat');
    const d = randomRecipe('dessert');
    box.innerHTML = `<h3>Menu aléatoire</h3>
        <p>Entrée : ${e ? e.title : 'Aucune'}</p>
        <p>Plat : ${p ? p.title : 'Aucun'}</p>
        <p>Dessert : ${d ? d.title : 'Aucun'}</p>`;
}

// ----- Recherche -----
document.getElementById('search-form').addEventListener('input', renderSearchResults);

function renderSearchResults() {
    const container = document.getElementById('search-results');
    const query = document.getElementById('ingredient-search').value
        .toLowerCase()
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
    let list = recipes;
    if (query.length) {
        list = recipes.filter(r => r.ingredients.some(i => query.includes(i.toLowerCase())));
    }
    container.innerHTML = '';
    list.forEach(r => {
        container.appendChild(recipeCard(r));
    });
}

// ----- Initialisation -----
window.addEventListener('load', () => {
    loadFromStorage();
    updateIngredientList();
    renderRecipeList();
    renderRandomMenu();
    showPage('recipes');
});
