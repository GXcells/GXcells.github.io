////////////
///Need to fix sometimes same ingredient but 1 rcipe does not say how much so need to add a bit
///   OK  ///  Need to add serving number in list of ingredients
/// Find a way for serving number and sum list ingredients for 6 personnes but also when not 6 personnes 
/// Need to fix display title list ingredients etc
///   OK  ///  Need to add recipeid in the original data.json from colab notebook
/// Add button to copy the list for shopping
/// In aggregate ingredients add list of recipes and number of serving per recipe
/// better style for the Show sum ingredients
/// Create another dialog to say if we are sure to remove a favorite
/// Save button to save list of favorites recipes in json or other format

///Return values of modal.title modal.ingredients modal serving to "" when the modal is closed (to avoid that it is reused in another modal if the functio nthat calls the modal does not implement t ochange these)
////////////////////////
////// LARGE CHANGE TO DO : modify code so that i nfavorites and recipes it adds only the "recipeID" and then use it to retrieve recipes directly fro mdatabase instead of saving the recipes themselves in favorites and slected recipes in local storage
////////////////////////

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
    const mainCourseRecipes = Object.values(data).filter(recipe => recipe.category === 'platprincipal' && (recipe.difficulty === 'facile' || recipe.difficulty === 'tr\u00e8s facile') && recipe.temps_prep_min <= 30);//&& recipe.country === "Mexico"
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
            <div class="recipe-info" >
                <h2>${recipe.name}</h2>
                
                <p>Selection: ${recipe.selection}</p>
                <p>Category: ${recipe.category}</p>
                <p>Prep Time: ${recipe.temps_prep}</p>
                <p>Total Time: ${recipe.temps_total}</p>
                <p>Difficulty: ${recipe.difficulty}</p>
                <a href="${recipe.URL}" target="_blank">View Recipe</a>
                <button class="view-ingredients">View Ingredients</button>
                
            </div>
            <i class="favorite-icon ${isFavorite ? 'fas' : 'far'} fa-heart ${isFavorite ? 'active' : ''}"></i>
            <i class="list-icon fas fa-list ${isSelected ? 'active' : ''}"></i>
        `;
        //console.log(recipe)
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
function displayRandomRecipes(data) {
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
    //console.log(favorites)
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
    const modalrecipeName = document.getElementById('modalrecipeName');
    const ingredientsList = document.getElementById('ingredientsList');
    const serving = document.getElementById('servingDefault');
    

    ingredientsList.innerHTML = '';
    const ingredientsObj = recipe.ingredients_default_;
    let ingredientString = "";

    for (const [ingredient, details] of Object.entries(ingredientsObj)) {
    const { count, unit } = details;
    
        ingredientString = `${ingredient}: ${count} ${unit}; `;
        const li = document.createElement('li');
        li.textContent = ingredientString
        ingredientsList.appendChild(li);
    modalTitle.textContent = `Liste of ingredients`;
    modalrecipeName.textContent = `${recipe.name}`;
    serving.textContent = `Pour ${recipe.serving_nb} ${recipe.serving_unit} `;
    modal.style.display = 'block';
    }
}



function closeModal() {
    const modal = document.getElementById('ingredientsModal');
    modal.style.display = 'none';
}

// function to aggregate ingredients from the "selected recipes" (to sum al lsimilar ingredients for shopping)
function aggregateIngredients(selectedRecipes) {
    const ingredientMap = {};
        
    selectedRecipes.forEach(recipe => {
        const ingredients = recipe.ingredients_default_;
        
        for (const [ingredient, details] of Object.entries(ingredients)) {
            const unit = details.unit;
            const count = parseFloat(details.count) || 0;

            if (!ingredientMap[ingredient]) {
                ingredientMap[ingredient] = { unit, count };
            } else if (ingredientMap[ingredient].unit === unit) {
                ingredientMap[ingredient].count += count;
            } else {
                // Handle different units (if necessary, e.g., convert units)
                console.warn(`Different units found for ${ingredient}: ${ingredientMap[ingredient].unit} and ${unit};`);
            }
        }
    });

    return ingredientMap;
}

// Function to display aggregated ingredients in the modal dialog
function showAggregatedIngredients() {
    const modal = document.getElementById('ingredientsModal');
    const modalTitle = document.getElementById('modalTitle');
    const ingredientsList = document.getElementById('ingredientsList');
    const modalrecipeName = document.getElementById('modalrecipeName');
    const selectedRecipes = JSON.parse(localStorage.getItem('selectedRecipes')) || [];
    var recipesNames = ''
    const serving = document.getElementById('servingDefault');

    ingredientsList.innerHTML = '';
    const aggregatedIngredients = aggregateIngredients(selectedRecipes);

    selectedRecipes.forEach(recipe => {
        recipesNames += `${recipe.name}, `;
    })
    for (const [ingredient, details] of Object.entries(aggregatedIngredients)) {
        const { count, unit } = details;
        const ingredientString = `${ingredient}: ${count.toFixed(2)} ${unit};`;
        const li = document.createElement('li');
        li.textContent = ingredientString;
        ingredientsList.appendChild(li);
    }

    modalTitle.textContent = 'Aggregated Ingredients for Selected recipes of the week';
    modalrecipeName.textContent = `${recipesNames}`;
    serving.textContent = ``;
    modal.style.display = 'block';
}

function CopyToClipboard() {
    var copiedText =''
    var r1=document.getElementById("modalrecipeName").textContent;
    var r2=(document.getElementById("ingredientsList").textContent).replaceAll(";","\n");

    console.log(r2)
    copiedText = `${r1}\n\n${r2}`;

    navigator.clipboard.writeText(copiedText);
}


async function initializeApp() {
    const data = await loadRecipes();
    
    document.getElementById('newRecipesButton').addEventListener('click', () => {
        const randomRecipes = getRandomMainCourseRecipes(data);
        //displayRecipes(randomRecipes);
        displayRandomRecipes(data)
        document.getElementById('recipesContainer').style.display = 'grid';
        document.getElementById('selectionOfWeekContainer').style.display = 'none';
    });
    document.getElementById('showsumIngredientsButton').addEventListener('click', () => {
        const randomRecipes = getRandomMainCourseRecipes(data);
        //displayRecipes(randomRecipes);
        showAggregatedIngredients()
        document.getElementById('recipesContainer').style.display = 'grid';
        document.getElementById('selectionOfWeekContainer').style.display = 'none';
    });
    document.getElementById('copytoclipboardButton').addEventListener('click', () => {           
        CopyToClipboard()
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