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

// Clear grocery list
function clearGroceryList() {
    localStorage.removeItem('groceryList');
    displayGroceryList();
}

// Initial display
displayGroceryList();
