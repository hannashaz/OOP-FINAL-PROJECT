const searchBtn = document.getElementById('search-btn');
const mealList = document.getElementById('meal');
const mealDetailsContent = document.querySelector('.meal-details-content');
const recipeCloseBtn = document.getElementById('recipe-close-btn');
const categorySelect = document.getElementById('category-select');

document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    loadCookbook();
});

searchBtn.addEventListener('click', getMealList);
mealList.addEventListener('click', getMealRecipe);
recipeCloseBtn.addEventListener('click', () => {
    mealDetailsContent.parentElement.classList.remove('showRecipe');
});

// Fetch categories from the MealDB API and populate the category dropdown
function loadCategories() {
    fetch('https://www.themealdb.com/api/json/v1/1/categories.php')
        .then(response => response.json())
        .then(data => {
            data.categories.forEach(category => {
                let option = document.createElement('option');
                option.value = category.strCategory;
                option.textContent = category.strCategory;
                categorySelect.appendChild(option);
            });
        })
        .catch(error => console.error('Error fetching categories:', error));
}

// Fetch meal list based on ingredient input and selected category
function getMealList() {
    let searchInputTxt = document.getElementById('search-input').value.trim().toLowerCase();
    let category = categorySelect.value;
    let url;

    // Check if user entered an ingredient
    if (searchInputTxt) {
        url = `https://www.themealdb.com/api/json/v1/1/filter.php?i=${searchInputTxt}`;
    } else if (category) {
        url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`;
    } else {
        displayError("Please enter an ingredient or select a category.");
        return;
    }

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.meals) {
                displayMeals(data.meals);
            } else {
                displayError("No meals found for the selected ingredient or category.");
            }
        })
        .catch(error => {
            console.error('Error fetching meal data:', error);
            displayError("Error fetching meal data!");
        });
}

// Display fetched meals
function displayMeals(meals) {
    let html = "";
    if (meals.length > 0) {
        meals.forEach(meal => {
            html += `
                <div class="meal-item" data-id="${meal.idMeal}">
                    <div class="meal-img">
                        <img src="${meal.strMealThumb}" alt="food">
                    </div>
                    <div class="meal-name">
                        <h3>${meal.strMeal}</h3>
                        <a href="#" class="recipe-btn">Get Recipe</a>
                        <button class="add-to-cookbook-btn recipe-btn">Add to Cookbook</button>
                        <button class="add-to-grocery-btn recipe-btn" onclick="addToGrocery('${meal.strMeal}')">
                            <i class="fas fa-shopping-cart"></i> Add to Groceries
                        </button>
                    </div>
                </div>
            `;
        });
        mealList.classList.remove('notFound');
    } else {
        html = "Sorry, we didn't find any meal!";
        mealList.classList.add('notFound');
    }
    mealList.innerHTML = html;
}

// Display error message if no meals are found
function displayError(message) {
    mealList.innerHTML = `<p class="error">${message}</p>`;
    mealList.classList.add('notFound');
}

function getMealRecipe(e) {
    e.preventDefault();
    if (e.target.classList.contains('recipe-btn')) {
        let mealItem = e.target.parentElement.parentElement;
        fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealItem.dataset.id}`)
            .then(response => response.json())
            .then(data => mealRecipeModal(data.meals));
    }
}

function mealRecipeModal(meal) {
    meal = meal[0];
    let ingredients = '';
    for (let i = 1; i <= 20; i++) {
        if (meal[`strIngredient${i}`]) {
            ingredients += `<li>${meal[`strIngredient${i}`]} - ${meal[`strMeasure${i}`]}</li>`;
        }
    }

    let html = `
        <h2 class="recipe-title">${meal.strMeal}</h2>
        <p class="recipe-category">${meal.strCategory} | ${meal.strArea}</p>
        <div class="recipe-description">
            <p>${meal.strTags || 'No Description Available'}</p>
        </div>
        <div class="recipe-instruct">
            <h3>Instructions:</h3>
            <p>${meal.strInstructions}</p>
        </div>
        <div class="recipe-meal-img">
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
        </div>
        <div class="recipe-ingredients">
            <h3>Ingredients:</h3>
            <ul>${ingredients}</ul>
        </div>
        <div class="recipe-link">
            <a href="${meal.strYoutube}" target="_blank">Watch Video</a>
        </div>
    `;
    mealDetailsContent.innerHTML = html;
    mealDetailsContent.parentElement.classList.add('showRecipe');
}

function addToCookbook(meal) {
    let cookbook = JSON.parse(localStorage.getItem('cookbook')) || [];
    if (!cookbook.find(item => item.id === meal.id)) {
        cookbook.push(meal);
        localStorage.setItem('cookbook', JSON.stringify(cookbook));
        alert(`${meal.name} added to your Cookbook!`);
    } else {
        alert(`${meal.name} is already in your Cookbook.`);
    }
}

function loadCookbook() {
    let cookbook = JSON.parse(localStorage.getItem('cookbook')) || [];
    let html = "";
    cookbook.forEach(meal => {
        html += `
            <div class="meal-item" data-id="${meal.id}">
                <div class="meal-img">
                    <img src="${meal.thumb}" alt="food">
                </div>
                <div class="meal-name">
                    <h3>${meal.name}</h3>
                    <button class="remove-from-cookbook-btn">Remove</button>
                </div>
            </div>
        `;
    });
    cookbookList.innerHTML = html;
}

function removeFromCookbook(mealId) {
    let cookbook = JSON.parse(localStorage.getItem('cookbook')) || [];
    cookbook = cookbook.filter(meal => meal.id !== mealId);
    localStorage.setItem('cookbook', JSON.stringify(cookbook));
    loadCookbook();
}

document.addEventListener('click', function (e) {
    if (e.target.classList.contains('add-to-cookbook-btn')) {
        const mealItem = e.target.closest('.meal-item');
        const mealId = mealItem.dataset.id;
        const mealName = mealItem.querySelector('.meal-name h3').textContent;
        const mealThumb = mealItem.querySelector('.meal-img img').src;

        const mealData = { id: mealId, name: mealName, thumb: mealThumb };
        addToCookbook(mealData);
    } else if (e.target.classList.contains('remove-from-cookbook-btn')) {
        const mealId = e.target.closest('.meal-item').dataset.id;
        removeFromCookbook(mealId);
    }
});
// Function to add a meal to groceries
function addToGrocery(mealName) {
    let groceryList = JSON.parse(localStorage.getItem('groceryList')) || [];

    // Check if the meal is already in the grocery list
    if (!groceryList.includes(mealName)) {
        groceryList.push(mealName);
        localStorage.setItem('groceryList', JSON.stringify(groceryList));
        alert(`${mealName} has been added to your Groceries!`);
        displayGroceryList(); // Refresh the grocery list display
    } else {
        alert(`${mealName} is already in your Groceries.`);
    }
}

// Display grocery items
function displayGroceryList() {
    const groceryListContainer = document.getElementById('grocery-list');
    groceryListContainer.innerHTML = '';
    let groceryList = JSON.parse(localStorage.getItem('groceryList')) || [];

    if (groceryList.length === 0) {
        groceryListContainer.innerHTML = '<p>Your grocery list is empty!</p>';
    } else {
        groceryList.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.classList.add('grocery-item');
            itemElement.innerHTML = `
                <span>${item}</span>
                <button class="remove-item" onclick="removeFromGrocery('${item}')">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            groceryListContainer.appendChild(itemElement);
        });
    }
}

// Remove item from grocery list
function removeFromGrocery(item) {
    let groceryList = JSON.parse(localStorage.getItem('groceryList')) || [];
    groceryList = groceryList.filter(groceryItem => groceryItem !== item);
    localStorage.setItem('groceryList', JSON.stringify(groceryList));
    displayGroceryList();
}

// Initial display
document.addEventListener('DOMContentLoaded', displayGroceryList);
