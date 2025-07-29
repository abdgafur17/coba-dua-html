// Firebase SDK imports for authentication and Firestore database operations
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

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
 * Initializes the month and year selector dropdowns.
 * Populates the month dropdown and sets the default year to the current year.
 * Then, it attempts to load budget data for the current month/year.
 */
function initializeMonthYearSelector() {
    const monthSelect = document.getElementById('month_select');
    const yearInput = document.getElementById('year_input');
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
    loadDataForSelectedMonth();
}

/**
 * Loads budget data from Firestore for the currently selected month and year.
 * If data exists, it fills the form fields with that data.
 * If no data exists, it resets the form fields to zero.
 */
async function loadDataForSelectedMonth() {
    // Get the selected month and year from the dropdowns
    const month = document.getElementById('month_select').value;
    const year = document.getElementById('year_input').value;
    // Create a unique ID for the document (e.g., "2025-07")
    const monthYearId = `${year}-${String(month).padStart(2, '0')}`;

    // Warn if userId is not available (Firebase not fully initialized)
    if (!userId) {
        console.warn("User ID not available yet. Cannot load data.");
        return;
    }

    showLoadingIndicator(true); // Show loading indicator
    try {
        // Create a reference to the Firestore document for the specific month/year
        const docRef = doc(db, 'artifacts', appId, 'users', userId, 'budgets', monthYearId);
        // Fetch the document snapshot
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            // If document exists, retrieve its data and fill the form
            const data = docSnap.data();
            console.log("Data loaded for", monthYearId, ":", data);
            fillFormWithData(data);
        } else {
            // If document does not exist, log it and reset the form
            console.log("No data found for", monthYearId, ". Resetting form.");
            resetForm();
        }
    } catch (error) {
        // Log and alert if there's an error during data loading
        console.error("Error loading document:", error);
        alert("Gagal memuat data anggaran. Silakan coba lagi.");
    } finally {
        showLoadingIndicator(false); // Hide loading indicator regardless of success or failure
    }
}

/**
 * Fills the input form fields with the provided data object.
 * If a field's data is undefined, it defaults to 0.
 * @param {Object} data - The budget data object retrieved from Firestore.
 */
function fillFormWithData(data) {
    // Define all input IDs to iterate through them
    const inputIds = [
        'proj_income1', 'proj_additional_income',
        'actual_income1', 'actual_mandiri_balance', 'actual_additional_income',
        'uang_dana', 'uang_bca', 'real_duit_aktual',
        'trans_bensin_proj', 'trans_bensin_actual', 'trans_parkir_proj', 'trans_parkir_actual', 'trans_tol_proj', 'trans_tol_actual',
        'util_listrik_proj', 'util_listrik_actual', 'util_air_proj', 'util_air_actual', 'util_internet_proj', 'util_internet_actual',
        'kom_pulsa_proj', 'kom_pulsa_actual',
        'asuransi_admin_bca_proj', 'asuransi_admin_bca_actual',
        'makan_bahan_proj', 'makan_bahan_actual', 'makan_belanja_proj', 'makan_belanja_actual', 'makan_gas_proj', 'makan_gas_actual',
        'peliharaan_proj', 'peliharaan_actual',
        'tabung_tabungan_proj', 'tabung_tabungan_actual',
        'hadiah_kasih_mama_proj', 'hadiah_kasih_mama_actual',
        'hiburan_proj', 'hiburan_actual',
        'perawatan_proj', 'perawatan_actual',
        'hukum_proj', 'hukum_actual'
    ];

    // Iterate over each ID and set the input value
    inputIds.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            // If data for the ID exists, use it; otherwise, default to 0
            element.value = data[id] !== undefined ? data[id] : 0;
        }
    });
}

/**
 * Resets all input form fields to 0.
 */
function resetForm() {
    // Define all input IDs to iterate through them
    const inputIds = [
        'proj_income1', 'proj_additional_income',
        'actual_income1', 'actual_mandiri_balance', 'actual_additional_income',
        'uang_dana', 'uang_bca', 'real_duit_aktual',
        'trans_bensin_proj', 'trans_bensin_actual', 'trans_parkir_proj', 'trans_parkir_actual', 'trans_tol_proj', 'trans_tol_actual',
        'util_listrik_proj', 'util_listrik_actual', 'util_air_proj', 'util_air_actual', 'util_internet_proj', 'util_internet_actual',
        'kom_pulsa_proj', 'kom_pulsa_actual',
        'asuransi_admin_bca_proj', 'asuransi_admin_bca_actual',
        'makan_bahan_proj', 'makan_bahan_actual', 'makan_belanja_proj', 'makan_belanja_actual', 'makan_gas_proj', 'makan_gas_actual',
        'peliharaan_proj', 'peliharaan_actual',
        'tabung_tabungan_proj', 'tabung_tabungan_actual',
        'hadiah_kasih_mama_proj', 'hadiah_kasih_mama_actual',
        'hiburan_proj', 'hiburan_actual',
        'perawatan_proj', 'perawatan_actual',
        'hukum_proj', 'hukum_actual'
    ];

    // Iterate over each ID and set the input value to 0
    inputIds.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.value = 0;
        }
    });
}

/**
 * Saves the current form data to Firestore for the selected month and year.
 * Includes a timestamp for the last update.
 */
async function saveData() {
    // Check if userId is available (Firebase initialized)
    if (!userId) {
        alert("Aplikasi belum siap. Silakan tunggu sebentar atau refresh halaman.");
        return;
    }

    // Get the selected month and year
    const month = document.getElementById('month_select').value;
    const year = document.getElementById('year_input').value;
    // Create a unique document ID
    const monthYearId = `${year}-${String(month).padStart(2, '0')}`;

    // Collect all data from the form fields
    const dataToSave = {
        // Income fields
        proj_income1: parseFloat(document.getElementById('proj_income1').value) || 0,
        proj_additional_income: parseFloat(document.getElementById('proj_additional_income').value) || 0,
        actual_income1: parseFloat(document.getElementById('actual_income1').value) || 0,
        actual_mandiri_balance: parseFloat(document.getElementById('actual_mandiri_balance').value) || 0,
        actual_additional_income: parseFloat(document.getElementById('actual_additional_income').value) || 0,

        // Balance fields
        uang_dana: parseFloat(document.getElementById('uang_dana').value) || 0,
        uang_bca: parseFloat(document.getElementById('uang_bca').value) || 0,
        real_duit_aktual: parseFloat(document.getElementById('real_duit_aktual').value) || 0,

        // Expense fields (projected and actual for each)
        trans_bensin_proj: parseFloat(document.getElementById('trans_bensin_proj').value) || 0,
        trans_bensin_actual: parseFloat(document.getElementById('trans_bensin_actual').value) || 0,
        trans_parkir_proj: parseFloat(document.getElementById('trans_parkir_proj').value) || 0,
        trans_parkir_actual: parseFloat(document.getElementById('trans_parkir_actual').value) || 0,
        trans_tol_proj: parseFloat(document.getElementById('trans_tol_proj').value) || 0,
        trans_tol_actual: parseFloat(document.getElementById('trans_tol_actual').value) || 0,

        util_listrik_proj: parseFloat(document.getElementById('util_listrik_proj').value) || 0,
        util_listrik_actual: parseFloat(document.getElementById('util_listrik_actual').value) || 0,
        util_air_proj: parseFloat(document.getElementById('util_air_proj').value) || 0,
        util_air_actual: parseFloat(document.getElementById('util_air_actual').value) || 0,
        util_internet_proj: parseFloat(document.getElementById('util_internet_proj').value) || 0,
        util_internet_actual: parseFloat(document.getElementById('util_internet_actual').value) || 0,

        kom_pulsa_proj: parseFloat(document.getElementById('kom_pulsa_proj').value) || 0,
        kom_pulsa_actual: parseFloat(document.getElementById('kom_pulsa_actual').value) || 0,

        asuransi_admin_bca_proj: parseFloat(document.getElementById('asuransi_admin_bca_proj').value) || 0,
        asuransi_admin_bca_actual: parseFloat(document.getElementById('asuransi_admin_bca_actual').value) || 0,

        makan_bahan_proj: parseFloat(document.getElementById('makan_bahan_proj').value) || 0,
        makan_bahan_actual: parseFloat(document.getElementById('makan_bahan_actual').value) || 0,
        makan_belanja_proj: parseFloat(document.getElementById('makan_belanja_proj').value) || 0,
        makan_belanja_actual: parseFloat(document.getElementById('makan_belanja_actual').value) || 0,
        makan_gas_proj: parseFloat(document.getElementById('makan_gas_proj').value) || 0,
        makan_gas_actual: parseFloat(document.getElementById('makan_gas_actual').value) || 0,

        peliharaan_proj: parseFloat(document.getElementById('peliharaan_proj').value) || 0,
        peliharaan_actual: parseFloat(document.getElementById('peliharaan_actual').value) || 0,

        tabung_tabungan_proj: parseFloat(document.getElementById('tabung_tabungan_proj').value) || 0,
        tabung_tabungan_actual: parseFloat(document.getElementById('tabung_tabungan_actual').value) || 0,

        hadiah_kasih_mama_proj: parseFloat(document.getElementById('hadiah_kasih_mama_proj').value) || 0,
        hadiah_kasih_mama_actual: parseFloat(document.getElementById('hadiah_kasih_mama_actual').value) || 0,

        hiburan_proj: parseFloat(document.getElementById('hiburan_proj').value) || 0,
        hiburan_actual: parseFloat(document.getElementById('hiburan_actual').value) || 0,

        perawatan_proj: parseFloat(document.getElementById('perawatan_proj').value) || 0,
        perawatan_actual: parseFloat(document.getElementById('perawatan_actual').value) || 0,

        hukum_proj: parseFloat(document.getElementById('hukum_proj').value) || 0,
        hukum_actual: parseFloat(document.getElementById('hukum_actual').value) || 0,

        lastUpdated: new Date().toISOString() // Add current timestamp for log note
    };

    try {
        // Create a reference to the Firestore document
        const docRef = doc(db, 'artifacts', appId, 'users', userId, 'budgets', monthYearId);
        // Set (overwrite or create) the document with the collected data
        await setDoc(docRef, dataToSave);
        alert(`Data anggaran untuk ${monthNames[month - 1]} ${year} berhasil disimpan!`);
        // Optionally, you can redirect to the dashboard after saving
        // window.location.href = 'index.html';
    } catch (error) {
        // Log and alert if there's an error during saving
        console.error("Error saving document:", error);
        alert("Gagal menyimpan data anggaran. Silakan coba lagi.");
    }
}

/**
 * Shows or hides the loading indicator on the input page.
 * @param {boolean} show - True to show, false to hide.
 */
function showLoadingIndicator(show) {
    const indicator = document.getElementById('loading_indicator_input');
    if (indicator) {
        indicator.style.display = show ? 'block' : 'none';
    }
}

// Expose functions to the global scope so they can be called from HTML
window.loadDataForSelectedMonth = loadDataForSelectedMonth;
window.saveData = saveData;
