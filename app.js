// Function to load recipes from data.json
async function loadRecipes() {
    try {
        const response = await fetch('./data.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Could not load recipes:", error);
        return {};
    }
}



function getRandomMainCourseRecipes(data, count = 5) {
    const mainCourseRecipes = Object.values(data).filter(recipe => recipe.category === 'main course' );//&& recipe.country === "Mexico"
    const shuffled = mainCourseRecipes.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

function displayRecipes(recipes, container = document.getElementById('recipesContainer')) {
    container.innerHTML = '';
    recipes.forEach(recipe => {
        const recipeDiv = document.createElement('div');
        recipeDiv.classList.add('recipe');
        const isFavorite = isFavoriteRecipe(recipe.name);
        const isSelected = isSelectedRecipe(recipe.name);
        recipeDiv.innerHTML = `
            <img src="${recipe.IMG}" alt="${recipe.name}">
            <div class="recipe-info">
                <h2>${recipe.name}</h2>
                <p>Country: ${recipe.country}</p>
                <p>Prep Time: ${recipe.prep_time}</p>
                <a href="${recipe.URL}" target="_blank">View Recipe</a>
                <button class="view-ingredients">View Ingredients</button>
            </div>
            <i class="favorite-icon ${isFavorite ? 'fas' : 'far'} fa-heart ${isFavorite ? 'active' : ''}"></i>
            <i class="list-icon fas fa-list ${isSelected ? 'active' : ''}"></i>
        `;
        //<i class="list-icon fas fa-list ${isSelected ? 'active' : ''}"></i>
        container.appendChild(recipeDiv);

        const favoriteIcon = recipeDiv.querySelector('.favorite-icon');
        favoriteIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFavorite(recipe, favoriteIcon);
        });

        const listIcon = recipeDiv.querySelector('.list-icon');
        listIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleSelection(recipe, listIcon);
        });

        const viewIngredientsButton = recipeDiv.querySelector('.view-ingredients');
        viewIngredientsButton.addEventListener('click', (e) => {
            e.stopPropagation();
            showIngredients(recipe);
        });
    });
}
// Function to display and store last random recipes
function displayRandomRecipes() {
    const randomRecipes = getRandomMainCourseRecipes(data);
    displayRecipes(randomRecipes);
    storelast(randomRecipes);
}

function toggleFavorite(recipe, icon) {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const index = favorites.findIndex(fav => fav.name === recipe.name);
 
    if (index === -1) {
        favorites.push(recipe);
        icon.classList.remove('far');//fas is icon in style regular (see Font Awesome)
        icon.classList.add('fas', 'active');//fas is icon in style solid (see Font Awesome)
    } else {
        favorites.splice(index, 1);
        icon.classList.remove('fas', 'active');
        icon.classList.add('far');
    }

    localStorage.setItem('favorites', JSON.stringify(favorites));
}

function toggleSelection(recipe, icon) {
    const selected = JSON.parse(localStorage.getItem('selectedRecipes')) || [];
    const index = selected.findIndex(sel => sel.name === recipe.name);

    if (index === -1) {
        selected.push(recipe);
        icon.classList.remove('fas');//fas is icon in style solid (see Font Awesome) I cannot use the far "list" icon because it is in paid version
        icon.classList.add('fas', 'active');
    } else {
        selected.splice(index, 1);
        icon.classList.remove('fas', 'active');
        icon.classList.add('fas');
    }

    localStorage.setItem('selectedRecipes', JSON.stringify(selected));
}
//function to store last recipes shown
function storelast(recipes) {
    localStorage.setItem('last_recipes', JSON.stringify(recipes));
}




function isFavoriteRecipe(recipeName) {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    return favorites.some(fav => fav.name === recipeName);
}

function isSelectedRecipe(recipeName) {
    const selected = JSON.parse(localStorage.getItem('selectedRecipes')) || [];
    return selected.some(sel => sel.name === recipeName);
}

function showFavorites() {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    displayRecipes(favorites);
}
//added
//function showLast() {
//    const last_recipes = JSON.parse(localStorage.getItem('last_recipes')) || [];
//    displayRecipes(last_recipes);
//}

function showSelectionOfWeek() {
    const selected = JSON.parse(localStorage.getItem('selectedRecipes')) || [];
    //const selectionContainer = document.getElementById('selectionOfWeekContainer');
    //selectionContainer.style.display = 'grid';
   // selectionContainer.innerHTML = '<h2>Selection of the Week</h2>';
    //displayRecipes(selected, selectionContainer);
    displayRecipes(selected);
    //document.getElementById('recipesContainer').style.display = 'none';
}

function showIngredients(recipe) {
    const modal = document.getElementById('ingredientsModal');
    const modalTitle = document.getElementById('modalTitle');
    const ingredientsList = document.getElementById('ingredientsList');

    modalTitle.textContent = `Ingredients for ${recipe.name}`;
    ingredientsList.innerHTML = '';
    recipe.ingredients.forEach(ingredient => {
        const li = document.createElement('li');
        li.textContent = ingredient;
        ingredientsList.appendChild(li);
    });

    modal.style.display = 'block';
}

function closeModal() {
    const modal = document.getElementById('ingredientsModal');
    modal.style.display = 'none';
}

async function initializeApp() {
    const data = await loadRecipes();
    
    document.getElementById('newRecipesButton').addEventListener('click', () => {
        const randomRecipes = getRandomMainCourseRecipes(data);
        //displayRecipes(randomRecipes);
        displayRandomRecipes()
        document.getElementById('recipesContainer').style.display = 'grid';
        document.getElementById('selectionOfWeekContainer').style.display = 'none';
    });

    document.getElementById('favorites').addEventListener('click', (e) => {
        e.preventDefault();
        showFavorites();
        document.getElementById('recipesContainer').style.display = 'grid';
        document.getElementById('selectionOfWeekContainer').style.display = 'none';
    });

    document.getElementById('shuffler').addEventListener('click', (e) => {
        e.preventDefault();
        //const randomRecipes = getRandomMainCourseRecipes(data);
        //displayRecipes(randomRecipes);
        
        //showLast();
        const last_recipes = JSON.parse(localStorage.getItem('last_recipes')) || [];
        displayRecipes(last_recipes);
        document.getElementById('recipesContainer').style.display = 'grid';
        document.getElementById('selectionOfWeekContainer').style.display = 'none';
    });

    document.getElementById('selectionOfWeek').addEventListener('click', (e) => {
        e.preventDefault();
        showSelectionOfWeek();
        document.getElementById('recipesContainer').style.display = 'grid';
        document.getElementById('selectionOfWeekContainer').style.display = 'none';
    });

    // Close modal when clicking on the close button or outside the modal
    document.querySelector('.close').addEventListener('click', closeModal);
    window.addEventListener('click', (event) => {
        const modal = document.getElementById('ingredientsModal');
        if (event.target === modal) {
            closeModal();
        }
    });

    // Initial load
    //const initialRecipes = getRandomMainCourseRecipes(data);
    const last_recipes = JSON.parse(localStorage.getItem('last_recipes')) || [];
    displayRecipes(last_recipes);
}

// Start the app
initializeApp();