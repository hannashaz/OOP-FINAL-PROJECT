document.addEventListener('DOMContentLoaded', loadCookbook);

function loadCookbook() {
    const cookbook = JSON.parse(localStorage.getItem('cookbook')) || [];
    let html = "";
    cookbook.forEach(meal => {
        html += `
            <div class="meal-item" data-id="${meal.id}">
                <div class="meal-img">
                    <img src="${meal.thumb}" alt="Meal Image">
                </div>
                <div class="meal-name">
                    <h3>${meal.name}</h3>
                    <a href="#" class="recipe-btn">Get Recipe</a>
                    <button class="remove-from-cookbook-btn">Remove</button>
                </div>
            </div>
        `;
    });
    document.getElementById('cookbookList').innerHTML = html;
}

// Get recipe details and display in modal
function getMealRecipe(e) {
    e.preventDefault();
    if (e.target.classList.contains('recipe-btn')) {
        const mealId = e.target.closest('.meal-item').dataset.id;

        fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`)
            .then(response => response.json())
            .then(data => showRecipeModal(data.meals[0]));
    }
}

// Display recipe in modal with close button
function showRecipeModal(meal) {
    // ingredients and measurements
    let ingredients = [];
    for (let i = 1; i <= 20; i++) {
        if (meal[`strIngredient${i}`]) {
            ingredients.push(`${meal[`strIngredient${i}`]} - ${meal[`strMeasure${i}`]}`);
        }
    }

    // Prepare HTML for the meal details
    const html = `
        <h2 class="recipe-title">${meal.strMeal}</h2>
        <p class="recipe-category">${meal.strCategory} | ${meal.strArea}</p>
        <div class="recipe-description">
        <p>${meal.strTags || 'No Description Available'}</p>
        </div>
        <div class="recipe-instruct">
            <h3>Instructions:</h3>
            <p>${meal.strInstructions}</p>
        </div>
        <div class="recipe-ingredients">
            <h3>Ingredients:</h3>
            <ul>
                ${ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
            </ul>
        </div>
        <div class="recipe-meal-img">
            <img src="${meal.strMealThumb}" alt="Meal Image">
        </div>
        <div class="recipe-link">
            <a href="${meal.strYoutube}" target="_blank">Watch Video</a>
        </div>
    `;
    
    document.querySelector('.meal-details-content').innerHTML = html;
    document.querySelector('.meal-details').classList.add('showRecipe');

    // Load notes for the meal
    loadMealNotes(meal.idMeal);
}

// Save meal note
document.getElementById('save-note-btn').addEventListener('click', function () {
    const mealId = document.querySelector('.recipe-title').textContent; // or get meal ID directly
    const notes = document.getElementById('meal-notes').value;
    let mealNotes = JSON.parse(localStorage.getItem('mealNotes')) || {};
    
    mealNotes[mealId] = notes;
    localStorage.setItem('mealNotes', JSON.stringify(mealNotes));
    displayNotes(notes);
});

// Load meal notes
function loadMealNotes(mealId) {
    let mealNotes = JSON.parse(localStorage.getItem('mealNotes')) || {};
    const notes = mealNotes[mealId] || '';
    document.getElementById('meal-notes').value = notes;
    displayNotes(notes);
}

// Display notes
function displayNotes(notes) {
    const notesDisplay = document.getElementById('notes-display');
    if (notes) {
        notesDisplay.innerHTML = `<p>${notes}</p>`;
    } else {
        notesDisplay.innerHTML = '<p>No notes available.</p>';
    }
}

// Delete meal note
document.getElementById('delete-note-btn').addEventListener('click', function () {
    const mealId = document.querySelector('.recipe-title').textContent; // or get meal ID directly
    let mealNotes = JSON.parse(localStorage.getItem('mealNotes')) || {};
    
    delete mealNotes[mealId];
    localStorage.setItem('mealNotes', JSON.stringify(mealNotes));
    
    document.getElementById('meal-notes').value = '';
    displayNotes('');
});

// Close recipe modal
document.addEventListener('click', function (e) {
    if (e.target.classList.contains('recipe-close-btn')) {
        document.querySelector('.meal-details').classList.remove('showRecipe');
    }
});

// Remove meal from cookbook
function removeFromCookbook(mealId) {
    let cookbook = JSON.parse(localStorage.getItem('cookbook')) || [];
    cookbook = cookbook.filter(meal => meal.id !== mealId);
    localStorage.setItem('cookbook', JSON.stringify(cookbook));
    loadCookbook();
}

// Event listener for recipe and remove buttons
document.getElementById('cookbookList').addEventListener('click', function (e) {
    if (e.target.classList.contains('recipe-btn')) {
        getMealRecipe(e);
    } else if (e.target.classList.contains('remove-from-cookbook-btn')) {
        const mealId = e.target.closest('.meal-item').dataset.id;
        removeFromCookbook(mealId);
    }
});
