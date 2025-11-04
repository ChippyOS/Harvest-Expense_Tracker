// HarvestMath front-end logic: authentication, expense CRUD, and break-even math.
// Imports the Supabase client used for auth and database calls.
// Import supabase client for database interactions
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
const authBox = document.querySelector('.auth-box');
const authBox2 = document.querySelector('.auth-box2');
const logoutBtn = document.getElementById('logout');
const emailInput = document.getElementById('email');
const pwInput = document.getElementById('pw');
const loginBtn = document.getElementById('login');
const signupBtn = document.getElementById('signup');


// Initial load: show any locally saved expenses before auth resolves
loadLocalExpenses();

// Event listener for login button
loginBtn.onclick = () => supabase.auth.signInWithPassword({
    email: emailInput.value,
    password: pwInput.value
}).then(({ data, error }) => {
    if (error) {
        alert('Not a valid email or password');
    }
});

// Event listener for signup button
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



// Listen for authentication state changes (login/logout)
// When auth state changes:
// - Get user ID if logged in, null if not
// - Update UI visibility based on login state
// - Load expenses for the current user
supabase.auth.onAuthStateChange((_, session) => {
    const loggedIn = !!session;
    loginBtn.classList.toggle('hide', loggedIn);
    signupBtn.classList.toggle('hide', loggedIn);
    logoutBtn.classList.toggle('hide', !loggedIn);
    emailInput.classList.toggle('hide', loggedIn);
    pwInput.classList.toggle('hide', loggedIn);
    loadExpenses(session?.user?.id || null);
  });

// Handle logout button click by signing out
logoutBtn.onclick = () => {
    const confirmLogout = confirm('Are you sure you want to log out?');
    if (confirmLogout) {
        supabase.auth.signOut();
    }
};

// Load expenses for the current user from Supabase database
async function loadExpenses(userId) {
    if (!userId) {
        // Not logged in: load from local storage
        loadLocalExpenses();
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


// Local storage helpers for offline mode
function loadLocalExpenses() {
    const savedExpenses = localStorage.getItem('expenses');
    expenses.splice(0);
    if (savedExpenses) {
        try {
            const parsed = JSON.parse(savedExpenses);
            if (Array.isArray(parsed)) {
                expenses.push(...parsed);
            }
        } catch (e) {
            console.error('Failed to parse local expenses', e);
        }
    }
    updateExpenseList();
}

function saveLocalExpenses() {
    localStorage.setItem('expenses', JSON.stringify(expenses));
    updateExpenseList();
}

// Event listener for form submission
expenseForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const { data: { user } } = await supabase.auth.getUser();

    const newExpenseBase = {
        name: document.getElementById('expense-name').value,
        amount: parseFloat(document.getElementById('expense-amount').value),
        date: document.getElementById('expense-date').value,
        category: document.getElementById('expense-category').value
    };

    if (user) {
        const newExpense = { ...newExpenseBase, user_id: user.id };
        const { data, error } = await supabase.from('expenses').insert([newExpense]).select();
        if (error) {
            console.error(error);
            // Fallback to local save if remote insert fails
            expenses.push(newExpenseBase);
            saveLocalExpenses();
        } else {
            expenses.push(data[0]);
            updateExpenseList();
        }
    } else {
        // Offline/local mode
        expenses.push(newExpenseBase);
        saveLocalExpenses();
    }

    expenseForm.reset();
});

/**
 * Render the `expenses` array into the UI.
 *
 * 1. Clears any previously rendered items.
 * 2. Shows / hides the "No expenses yet" message depending on state.
 * 3. For each expense row it creates a DOM element displaying the
 *    expense details and wires up a Delete button that removes the
 *    record from Supabase and then from the local array.
 */
function updateExpenseList() {
    // Clear current list
    expenseList.innerHTML = '';

    // Handle empty state
    if (expenses.length === 0) {
        emptyMessage.classList.remove('hide');
    } else {
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
                    // If this expense is from Supabase (has id and user_id), delete remotely first
                    if (expense.id && expense.user_id) {
                        const { error } = await supabase
                            .from('expenses')
                            .delete()
                            .eq('id', expense.id);
                        if (error) {
                            console.error(error);
                            return; // stop if DB delete failed
                        }
                        expenses.splice(index, 1);
                        updateExpenseList();
                    } else {
                        // Local-only expense: remove and persist locally
                        expenses.splice(index, 1);
                        saveLocalExpenses();
                    }
                }
            });
            expenseItem.appendChild(deleteButton);
        });
    }
}

/**
 * Compute and display the break-even price per bushel.
 *
 * Break-even = total expenses / number of bushels.
 * The result is rounded to 3 decimal places and rendered in the UI.
 * If the user has not entered a positive bushel count, an error
 * message is shown instead.
 */
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