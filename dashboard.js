document.addEventListener('DOMContentLoaded', function() {
    loadAndDisplayData();
});

function formatCurrency(amount) {
    return 'Rp ' + amount.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function updateDifferenceDisplay(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = formatCurrency(value);
        element.classList.remove('diff-positive', 'diff-negative', 'diff-neutral');
        if (value > 0) {
            element.classList.add('diff-positive');
        } else if (value < 0) {
            element.classList.add('diff-negative');
        } else {
            element.classList.add('diff-neutral');
        }
    }
}

function loadAndDisplayData() {
    const savedData = localStorage.getItem('budgetData');
    if (!savedData) {
        alert('Tidak ada data anggaran yang tersimpan. Silakan masukkan data di halaman input.');
        // Optionally redirect to input.html
        // window.location.href = 'input.html';
        return;
    }

    const data = JSON.parse(savedData);

    // --- Display Balances ---
    document.getElementById('display_uang_dana').textContent = formatCurrency(data.uang_dana);
    document.getElementById('display_uang_bca').textContent = formatCurrency(data.uang_bca);
    document.getElementById('display_real_duit_aktual').textContent = formatCurrency(data.real_duit_aktual);


    // --- Calculate and Display Income ---
    const total_proj_income = data.proj_income1 + data.proj_additional_income;
    const total_actual_income = data.actual_income1 + data.actual_mandiri_balance + data.actual_additional_income;

    document.getElementById('display_proj_income1').textContent = formatCurrency(data.proj_income1);
    document.getElementById('display_actual_income1').textContent = formatCurrency(data.actual_income1);
    updateDifferenceDisplay('diff_income1', data.actual_income1 - data.proj_income1);

    document.getElementById('display_proj_additional_income').textContent = formatCurrency(data.proj_additional_income);
    document.getElementById('display_actual_additional_income').textContent = formatCurrency(data.actual_additional_income);
    updateDifferenceDisplay('diff_additional_income', data.actual_additional_income - data.proj_additional_income);

    document.getElementById('display_actual_mandiri_balance').textContent = formatCurrency(data.actual_mandiri_balance);

    document.getElementById('display_total_proj_income').textContent = formatCurrency(total_proj_income);
    document.getElementById('display_total_actual_income').textContent = formatCurrency(total_actual_income);
    updateDifferenceDisplay('diff_total_income', total_actual_income - total_proj_income);


    // --- Calculate and Display Expenses ---
    let grand_total_proj_expenses = 0;
    let grand_total_actual_expenses = 0;

    // Helper function to calculate and display subtotal for a category
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

        // For categories that only have one general input (like Peliharaan)
        if (items.length === 1 && items[0] === categoryName.toLowerCase()) {
            const proj_val = data[`${categoryName}_proj`] || 0;
            const actual_val = data[`${categoryName}_actual`] || 0;
            proj_subtotal += proj_val;
            actual_subtotal += actual_val;

            document.getElementById(`display_${categoryName}_proj`).textContent = formatCurrency(proj_val);
            document.getElementById(`display_${categoryName}_actual`).textContent = formatCurrency(actual_val);
            updateDifferenceDisplay(`diff_${categoryName}`, actual_val - proj_val);
        }

        document.getElementById(`display_total_${categoryName}_proj`).textContent = formatCurrency(proj_subtotal);
        document.getElementById(`display_total_${categoryName}_actual`).textContent = formatCurrency(actual_subtotal);
        updateDifferenceDisplay(`diff_total_${categoryName}`, actual_subtotal - proj_subtotal);

        grand_total_proj_expenses += proj_subtotal;
        grand_total_actual_expenses += actual_subtotal;
    }

    calculateAndDisplayCategory('trans', ['bensin', 'parkir', 'tol']);
    calculateAndDisplayCategory('util', ['listrik', 'air', 'internet']);
    calculateAndDisplayCategory('kom', ['pulsa']);
    calculateAndDisplayCategory('asuransi', ['admin_bca']);
    calculateAndDisplayCategory('makan', ['bahan', 'belanja', 'gas']);
    calculateAndDisplayCategory('peliharaan', ['peliharaan']); // This is for the general 'peliharaan' input
    calculateAndDisplayCategory('tabung', ['tabungan']);
    calculateAndDisplayCategory('hadiah', ['kasih_mama']);
    calculateAndDisplayCategory('hiburan', ['hiburan']); // This is for the general 'hiburan' input
    calculateAndDisplayCategory('perawatan', ['perawatan']); // This is for the general 'perawatan' input
    calculateAndDisplayCategory('hukum', ['hukum']); // This is for the general 'hukum' input


    // --- Display Grand Total Expenses ---
    document.getElementById('display_grand_total_proj_expenses').textContent = formatCurrency(grand_total_proj_expenses);
    document.getElementById('display_grand_total_actual_expenses').textContent = formatCurrency(grand_total_actual_expenses);
    updateDifferenceDisplay('diff_grand_total_expenses', grand_total_actual_expenses - grand_total_proj_expenses);


    // --- Calculate and Display Summary Balances ---
    const proj_balance = total_proj_income - grand_total_proj_expenses;
    const actual_balance = total_actual_income - grand_total_actual_expenses;
    const overall_difference = actual_balance - proj_balance;

    document.getElementById('display_proj_balance').textContent = formatCurrency(proj_balance);
    document.getElementById('display_actual_balance').textContent = formatCurrency(actual_balance);
    updateDifferenceDisplay('display_difference', overall_difference);

    const differenceCard = document.getElementById('difference_card');
    differenceCard.classList.remove('positive', 'negative');
    if (overall_difference > 0) {
        differenceCard.classList.add('positive');
    } else if (overall_difference < 0) {
        differenceCard.classList.add('negative');
    }
}