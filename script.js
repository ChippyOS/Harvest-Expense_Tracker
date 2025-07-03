// Array to store all expenses
const expenses = []

// DOM element references
const expenseForm = document.getElementById('expense-form');
const expenseList = document.getElementById('expense-items');
const emptyMessage = document.getElementById('empty-message');
const breakEvenResult = document.getElementById('break-even-result');
const bushelInput = document.getElementById('bushel-amount');
const calculateButton = document.getElementById('calculate-break-even');

// Event listener for form submission
expenseForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Get form input values
    const name = document.getElementById('expense-name').value;
    const amount = parseFloat(document.getElementById('expense-amount').value);
    const date = document.getElementById('expense-date').value;
    const category = document.getElementById('expense-category').value;

    // Add new expense to array
    expenses.push({name, amount, date, category});

    // Update the display
    updateExpenseList();

    // Reset form fields
    expenseForm.reset();
});

// Function to update the expense list display
function updateExpenseList() {
    // Clear current list
    expenseList.innerHTML = '';

    // Handle empty state
    if (expenses.length === 0) {
        emptyMessage.classList.add('show');
    } else {
        emptyMessage.classList.remove('show');
        // Create and append expense items
        expenses.forEach((expense, index) => {
            const expenseItem = document.createElement('div');
            expenseItem.className = 'expense-item';
            expenseItem.textContent = `${expense.name} - $${expense.amount} - ${expense.date} - ${expense.category}`;
            expenseItem.style.padding = '8px';
            expenseItem.style.marginBottom = '5px';
            expenseItem.style.display = 'inline-block';
            expenseList.appendChild(expenseItem);

            // Create delete button
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.className = 'delete-btn';
            deleteButton.addEventListener('click', () => {

                const confirmDelete = confirm('Are you sure you want to delete this expense?');
                if (confirmDelete) {
                    // Remove expense from array
                    expenses.splice(index, 1);
                    // Update the display
                    updateExpenseList();
                }
            });
            expenseItem.appendChild(deleteButton);
        });
    }
}

// Function to calculate break-even price
function calculateBreakEven() {
    const totalExpenses = expenses.reduce((total, expense) => total + expense.amount, 0);
    const bushels = parseFloat(bushelInput.value);

    if (bushels > 0) {
        const breakEvenPrice = totalExpenses / bushels;
        breakEvenResult.textContent = `Break-even price per bushel: $${breakEvenPrice.toFixed(3)}`;
    } else {
        breakEvenResult.textContent = 'Please enter a valid number of bushels.';
    }
}

// Add event listener for the calculate button
calculateButton.addEventListener('click', calculateBreakEven);