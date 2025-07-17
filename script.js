import { supabase } from './supabase.js';

const expenses = [];

// // Array to store all expenses that is saved in local storage
// const savedExpenses = localStorage.getItem('expenses');
// const expenses = savedExpenses ? JSON.parse(savedExpenses) : [];

// DOM element references
const expenseForm = document.getElementById('expense-form');
const expenseList = document.getElementById('expense-items');
const emptyMessage = document.getElementById('empty-message');
const breakEvenResult = document.getElementById('break-even-result');
const bushelInput = document.getElementById('bushel-amount');
const calculateButton = document.getElementById('calculate-break-even');
const authBox = document.getElementById('auth-box');
const logoutBtn = document.getElementById('logout');
const emailInput = document.getElementById('email');
const pwInput = document.getElementById('pw');
const loginBtn = document.getElementById('login');
const signupBtn = document.getElementById('signup');

updateExpenseList();

loginBtn.onclick = () => supabase.auth.signInWithPassword({
    email: emailInput.value,
    password: pwInput.value
}).then(({ data, error }) => {
    if (error) {
        alert('Not a valid email or password');
    }
});

signupBtn.onclick = () => supabase.auth.signUp({
    email: emailInput.value,
    password: pwInput.value
}).then(({ data, error }) => {
    if (error) {
        alert('Error signing up');
    } else {
        alert('Check your email to confirm your account');
    }
});



supabase.auth.onAuthStateChange((_event, session) => {
    const userId = session?.user?.id || null;
    const loggedIn = !!session;
    authBox.classList.toggle('hide', loggedIn);
    logoutBtn.classList.toggle('hide', !loggedIn);
    loadExpenses(userId);
});

logoutBtn.onclick = () => supabase.auth.signOut();


async function loadExpenses(userId) {
    if (!userId) {
        // no user = show nothing
        expenses.splice(0);
        updateExpenseList();
        return;
    }
    const { data, error } = await supabase
        .from('expenses')
        .select('*')
    .eq('user_id', userId);
    if (error) { console.error(error); return; }
    expenses.splice(0, expenses.length, ...data);
    updateExpenseList();
}

supabase.auth.getSession().then(({ data: { session } }) => {
    const userId = session?.user?.id || null;
    loadExpenses(userId);
});


// // Function to save expenses to local storage
// function savelocalExpenses() {
//     localStorage.setItem('expenses', JSON.stringify(expenses));
//     updateExpenseList();
// }

// Event listener for form submission
expenseForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        alert('Log in first.');
        return;
    }

    const newExpense = {
        name: document.getElementById('expense-name').value,
        amount: parseFloat(document.getElementById('expense-amount').value),
        date: document.getElementById('expense-date').value,
        category: document.getElementById('expense-category').value,
        user_id: user.id
    };

    const { data, error } = await supabase.from('expenses').insert([newExpense]).select();
    if (error) { console.error(error); return; }

    expenses.push(data[0]);       // keep the id Supabase returns
    updateExpenseList();
    expenseForm.reset();
});

// Function to update the expense list display
function updateExpenseList() {
    // Clear current list
    expenseList.innerHTML = '';

    // Handle empty state
    if (expenses.length === 0) {
        emptyMessage.classList.remove('hide');
        emptyMessage.classList.add('show');
    } else {
        emptyMessage.classList.remove('show');
        emptyMessage.classList.add('hide');
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
            deleteButton.addEventListener('click', async () => {

                const confirmDelete = confirm('Are you sure you want to delete this expense?');
                if (confirmDelete) {
                    // remove from Supabase
                    const { error } = await supabase
                        .from('expenses')
                        .delete()
                        .eq('id', expense.id);   // expense.id comes from Supabase row

                    if (error) {
                        console.error(error);
                        return;            // stop if DB delete failed
                    }

                    // remove locally and refresh UI
                    expenses.splice(index, 1);
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