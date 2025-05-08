const expenses = []

const expenseForm = document.getElementById('expense-form');
const expenseList = document.getElementById('expense-items');
const emptyMessage = document.getElementById('empty-message');
const breakEvenResult = document.getElementById('break-even-result');
const bushelInput = document.getElementById('bushel-amount');
const calculateButton = document.getElementById('calculate-break-even');

expenseForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('expense-name').value;
    const amount = parseFloat(document.getElementById('expense-amount').value);
    const date = document.getElementById('expense-date').value;
    const category = document.getElementById('expense-category').value;

    expenses.push({name, amount, date, category});

    updateExpenseList();

    expenseForm.reset();
});

function updateExpenseList() {
    expenseList.innerHTML = '';

    if (expenses.length === 0) {
        emptyMessage.classList.add('show');
    } else {
        emptyMessage.classList.remove('show');
        expenses.forEach(expense => {
            const expenseItem = document.createElement('div');
            expenseItem.className = 'expense-item';
            expenseItem.textContent = `${expense.name} - $${expense.amount} - ${expense.date} - ${expense.category}`;
            expenseItem.style.padding = '8px';
            expenseItem.style.marginBottom = '5px';
            expenseItem.style.display = 'inline-block';
            expenseList.appendChild(expenseItem);
        });
    }
}