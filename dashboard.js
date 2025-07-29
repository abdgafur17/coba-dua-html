// Firebase SDK imports for authentication and Firestore database operations
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Global variables for Firebase instances and user data
let app;
let db;
let auth;
let userId;
let appId; // Application ID, typically provided by the environment

// Array of month names for display purposes
const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

// Event listener for when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', async function() {
    // Initialize Firebase application
    try {
        // Retrieve appId from global variable if available, otherwise use a default
        appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
        // Parse firebaseConfig from global variable if available, otherwise use an empty object
        const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
        
        // Initialize Firebase app with the configuration
        app = initializeApp(firebaseConfig);
        // Get Firestore and Auth service instances
        db = getFirestore(app);
        auth = getAuth(app);

        // Authenticate the user
        // If an initial auth token is provided, sign in with custom token
        if (typeof __initial_auth_token !== 'undefined') {
            await signInWithCustomToken(auth, __initial_auth_token);
        } else {
            // Otherwise, sign in anonymously
            await signInAnonymously(auth);
        }

        // Listen for authentication state changes
        onAuthStateChanged(auth, (user) => {
            if (user) {
                // If user is signed in, set the userId and initialize the month/year selector
                userId = user.uid;
                console.log("Firebase initialized and user authenticated:", userId);
                initializeMonthYearSelector();
            } else {
                // If no user is signed in, log a warning
                console.log("No user signed in.");
                // Optionally, handle unauthenticated state, e.g., redirect to a login page
            }
        });

    } catch (error) {
        // Log and alert if there's an error during Firebase initialization
        console.error("Error initializing Firebase:", error);
        alert("Gagal menginisialisasi aplikasi. Silakan coba lagi.");
    }
});

/**
 * Initializes the month and year selector dropdowns on the dashboard.
 * Populates the month dropdown and sets the default year to the current year.
 * Then, it triggers loading of budget data for the current month/year.
 */
function initializeMonthYearSelector() {
    const monthSelect = document.getElementById('month_select_dashboard');
    const yearInput = document.getElementById('year_input_dashboard');
    const today = new Date();
    const currentMonth = today.getMonth(); // 0-11 for JavaScript months
    const currentYear = today.getFullYear();

    // Populate the month dropdown with month names
    monthNames.forEach((name, index) => {
        const option = document.createElement('option');
        option.value = index + 1; // Convert to 1-12 for month value
        option.textContent = name;
        monthSelect.appendChild(option);
    });

    // Set the default selected month and year to the current date
    monthSelect.value = currentMonth + 1;
    yearInput.value = currentYear;

    // Load data for the initially selected (current) month and year
    loadAndDisplayData();
}

/**
 * Formats a number as Indonesian Rupiah currency.
 * @param {number} amount - The number to format.
 * @returns {string} The formatted currency string (e.g., "Rp 1.500.000").
 */
function formatCurrency(amount) {
    return 'Rp ' + amount.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

/**
 * Updates the text content and applies CSS classes (positive, negative, neutral)
 * to an HTML element based on the value of a difference.
 * @param {string} elementId - The ID of the HTML element to update.
 * @param {number} value - The numerical difference.
 */
function updateDifferenceDisplay(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = formatCurrency(value);
        // Remove existing difference classes
        element.classList.remove('diff-positive', 'diff-negative', 'diff-neutral');
        // Add appropriate class based on value
        if (value > 0) {
            element.classList.add('diff-positive');
        } else if (value < 0) {
            element.classList.add('diff-negative');
        } else {
            element.classList.add('diff-neutral');
        }
    }
}

/**
 * Loads budget data from Firestore for the currently selected month and year
 * and displays it on the dashboard. Uses onSnapshot for real-time updates.
 */
async function loadAndDisplayData() {
    // Get the selected month and year from the dashboard dropdowns
    const month = document.getElementById('month_select_dashboard').value;
    const year = document.getElementById('year_input_dashboard').value;
    // Create a unique ID for the document (e.g., "2025-07")
    const monthYearId = `${year}-${String(month).padStart(2, '0')}`;

    // Warn if userId is not available (Firebase not fully initialized)
    if (!userId) {
        console.warn("User ID not available yet. Cannot load data.");
        return;
    }

    showLoadingIndicator(true); // Show loading indicator
    // Create a reference to the Firestore document for the specific month/year
    const docRef = doc(db, 'artifacts', appId, 'users', userId, 'budgets', monthYearId);

    // Use onSnapshot for real-time updates:
    // This listener will be triggered initially with the current data,
    // and then again every time the data in Firestore changes.
    onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
            // If document exists, retrieve its data and display it
            const data = docSnap.data();
            console.log("Data received for", monthYearId, ":", data);
            displayBudget(data); // Update all budget displays
            displayLastUpdated(data.lastUpdated); // Update the last updated timestamp
        } else {
            // If document does not exist, display zeros and a "no data" message
            console.log("No data found for", monthYearId, ". Displaying zeros.");
            displayBudget({}); // Display empty/zero data
            displayLastUpdated(null); // Clear last updated note
        }
        showLoadingIndicator(false); // Hide loading indicator
    }, (error) => {
        // Handle errors during snapshot listening
        console.error("Error fetching document:", error);
        alert("Gagal memuat data anggaran. Silakan coba lagi.");
        showLoadingIndicator(false); // Hide loading indicator on error
    });
}

/**
 * Populates all budget-related elements on the dashboard with the provided data.
 * Defaults to 0 if data for a specific field is missing.
 * @param {Object} data - The budget data object.
 */
function displayBudget(data) {
    // --- Display Balances ---
    document.getElementById('display_uang_dana').textContent = formatCurrency(data.uang_dana || 0);
    document.getElementById('display_uang_bca').textContent = formatCurrency(data.uang_bca || 0);
    document.getElementById('display_real_duit_aktual').textContent = formatCurrency(data.real_duit_aktual || 0);

    // --- Calculate and Display Income ---
    const proj_income1 = data.proj_income1 || 0;
    const proj_additional_income = data.proj_additional_income || 0;
    const actual_income1 = data.actual_income1 || 0;
    const actual_mandiri_balance = data.actual_mandiri_balance || 0;
    const actual_additional_income = data.actual_additional_income || 0;

    const total_proj_income = proj_income1 + proj_additional_income;
    const total_actual_income = actual_income1 + actual_mandiri_balance + actual_additional_income;

    document.getElementById('display_proj_income1').textContent = formatCurrency(proj_income1);
    document.getElementById('display_actual_income1').textContent = formatCurrency(actual_income1);
    updateDifferenceDisplay('diff_income1', actual_income1 - proj_income1);

    document.getElementById('display_proj_additional_income').textContent = formatCurrency(proj_additional_income);
    document.getElementById('display_actual_additional_income').textContent = formatCurrency(actual_additional_income);
    updateDifferenceDisplay('diff_additional_income', actual_additional_income - proj_additional_income);

    document.getElementById('display_actual_mandiri_balance').textContent = formatCurrency(actual_mandiri_balance);

    document.getElementById('display_total_proj_income').textContent = formatCurrency(total_proj_income);
    document.getElementById('display_total_actual_income').textContent = formatCurrency(total_actual_income);
    updateDifferenceDisplay('diff_total_income', total_actual_income - total_proj_income);


    // --- Calculate and Display Expenses ---
    let grand_total_proj_expenses = 0;
    let grand_total_actual_expenses = 0;

    /**
     * Helper function to calculate and display subtotal for a given expense category.
     * @param {string} categoryName - The base name of the category (e.g., 'trans').
     * @param {string[]} items - An array of item suffixes (e.g., ['bensin', 'parkir', 'tol']).
     */
    function calculateAndDisplayCategory(categoryName, items) {
        let proj_subtotal = 0;
        let actual_subtotal = 0;

        items.forEach(item => {
            const proj_val = data[`${categoryName}_${item}_proj`] || 0;
            const actual_val = data[`${categoryName}_${item}_actual`] || 0;
            proj_subtotal += proj_val;
            actual_subtotal += actual_val;

            document.getElementById(`display_${categoryName}_${item}_proj`).textContent = formatCurrency(proj_val);
            document.getElementById(`display_${categoryName}_${item}_actual`).textContent = formatCurrency(actual_val);
            updateDifferenceDisplay(`diff_${categoryName}_${item}`, actual_val - proj_val);
        });

        // Special handling for categories that might have a single general input
        // (e.g., 'peliharaan' where the input ID is just 'peliharaan_proj'/'peliharaan_actual')
        if (items.length === 1 && items[0] === categoryName.toLowerCase()) {
            const proj_val = data[`${categoryName}_proj`] || 0;
            const actual_val = data[`${categoryName}_actual`] || 0;
            proj_subtotal = proj_val; // For single item, subtotal is just the item itself
            actual_subtotal = actual_val;

            document.getElementById(`display_${categoryName}_proj`).textContent = formatCurrency(proj_val);
            document.getElementById(`display_${categoryName}_actual`).textContent = formatCurrency(actual_val);
            updateDifferenceDisplay(`diff_${categoryName}`, actual_val - proj_val);
        }

        document.getElementById(`display_total_${categoryName}_proj`).textContent = formatCurrency(proj_subtotal);
        document.getElementById(`display_total_${categoryName}_actual`).textContent = formatCurrency(actual_subtotal);
        updateDifferenceDisplay(`diff_total_${categoryName}`, actual_subtotal - proj_subtotal);

        // Add category subtotals to the grand totals
        grand_total_proj_expenses += proj_subtotal;
        grand_total_actual_expenses += actual_subtotal;
    }

    // Call the helper function for each expense category
    calculateAndDisplayCategory('trans', ['bensin', 'parkir', 'tol']);
    calculateAndDisplayCategory('util', ['listrik', 'air', 'internet']);
    calculateAndDisplayCategory('kom', ['pulsa']);
    calculateAndDisplayCategory('asuransi', ['admin_bca']);
    calculateAndDisplayCategory('makan', ['bahan', 'belanja', 'gas']);
    calculateAndDisplayCategory('peliharaan', ['peliharaan']); // Passes 'peliharaan' as both category and item suffix
    calculateAndDisplayCategory('tabung', ['tabungan']);
    calculateAndDisplayCategory('hadiah', ['kasih_mama']);
    calculateAndDisplayCategory('hiburan', ['hiburan']); // Passes 'hiburan' as both category and item suffix
    calculateAndDisplayCategory('perawatan', ['perawatan']); // Passes 'perawatan' as both category and item suffix
    calculateAndDisplayCategory('hukum', ['hukum']); // Passes 'hukum' as both category and item suffix


    // --- Display Grand Total Expenses ---
    document.getElementById('display_grand_total_proj_expenses').textContent = formatCurrency(grand_total_proj_expenses);
    document.getElementById('display_grand_total_actual_expenses').textContent = formatCurrency(grand_total_actual_expenses);
    updateDifferenceDisplay('diff_grand_total_expenses', grand_total_actual_expenses - grand_total_proj_expenses);


    // --- Calculate and Display Summary Balances (Overall) ---
    const proj_balance = total_proj_income - grand_total_proj_expenses;
    const actual_balance = total_actual_income - grand_total_actual_expenses;
    const overall_difference = actual_balance - proj_balance;

    document.getElementById('display_proj_balance').textContent = formatCurrency(proj_balance);
    document.getElementById('display_actual_balance').textContent = formatCurrency(actual_balance);
    updateDifferenceDisplay('display_difference', overall_difference);

    // Update the color of the difference card based on the overall difference
    const differenceCard = document.getElementById('difference_card');
    differenceCard.classList.remove('positive', 'negative');
    if (overall_difference > 0) {
        differenceCard.classList.add('positive');
    } else if (overall_difference < 0) {
        differenceCard.classList.add('negative');
    }
}

/**
 * Displays the last updated timestamp on the dashboard.
 * @param {string|null} timestamp - The ISO string timestamp or null if no data.
 */
function displayLastUpdated(timestamp) {
    const noteElement = document.getElementById('last_updated_note');
    if (timestamp) {
        const date = new Date(timestamp);
        // Format the date for display in Indonesian locale
        const formattedDate = date.toLocaleString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        noteElement.textContent = `Terakhir diperbarui: ${formattedDate}`;
    } else {
        noteElement.textContent = `Belum ada data tersimpan untuk bulan ini.`;
    }
}

/**
 * Shows or hides the loading indicator on the dashboard page.
 * @param {boolean} show - True to show, false to hide.
 */
function showLoadingIndicator(show) {
    const indicator = document.getElementById('loading_indicator_dashboard');
    if (indicator) {
        indicator.style.display = show ? 'block' : 'none';
    }
}

// Expose loadAndDisplayData to the global scope so it can be called from the HTML button
window.loadAndDisplayData = loadAndDisplayData;