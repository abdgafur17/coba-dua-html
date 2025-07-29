document.addEventListener('DOMContentLoaded', function() {
    // Load saved data when the page loads
    loadData();
});

function saveData() {
    const data = {
        // Income
        proj_income1: parseFloat(document.getElementById('proj_income1').value) || 0,
        proj_additional_income: parseFloat(document.getElementById('proj_additional_income').value) || 0,
        actual_income1: parseFloat(document.getElementById('actual_income1').value) || 0,
        actual_mandiri_balance: parseFloat(document.getElementById('actual_mandiri_balance').value) || 0,
        actual_additional_income: parseFloat(document.getElementById('actual_additional_income').value) || 0,

        // Balances
        uang_dana: parseFloat(document.getElementById('uang_dana').value) || 0,
        uang_bca: parseFloat(document.getElementById('uang_bca').value) || 0,
        real_duit_aktual: parseFloat(document.getElementById('real_duit_aktual').value) || 0,

        // Expenses - TRANSPORTASI
        trans_bensin_proj: parseFloat(document.getElementById('trans_bensin_proj').value) || 0,
        trans_bensin_actual: parseFloat(document.getElementById('trans_bensin_actual').value) || 0,
        trans_parkir_proj: parseFloat(document.getElementById('trans_parkir_proj').value) || 0,
        trans_parkir_actual: parseFloat(document.getElementById('trans_parkir_actual').value) || 0,
        trans_tol_proj: parseFloat(document.getElementById('trans_tol_proj').value) || 0,
        trans_tol_actual: parseFloat(document.getElementById('trans_tol_actual').value) || 0,

        // Expenses - UTILITAS
        util_listrik_proj: parseFloat(document.getElementById('util_listrik_proj').value) || 0,
        util_listrik_actual: parseFloat(document.getElementById('util_listrik_actual').value) || 0,
        util_air_proj: parseFloat(document.getElementById('util_air_proj').value) || 0,
        util_air_actual: parseFloat(document.getElementById('util_air_actual').value) || 0,
        util_internet_proj: parseFloat(document.getElementById('util_internet_proj').value) || 0,
        util_internet_actual: parseFloat(document.getElementById('util_internet_actual').value) || 0,

        // Expenses - KOMUNIKASI
        kom_pulsa_proj: parseFloat(document.getElementById('kom_pulsa_proj').value) || 0,
        kom_pulsa_actual: parseFloat(document.getElementById('kom_pulsa_actual').value) || 0,

        // Expenses - ASURANSI
        asuransi_admin_bca_proj: parseFloat(document.getElementById('asuransi_admin_bca_proj').value) || 0,
        asuransi_admin_bca_actual: parseFloat(document.getElementById('asuransi_admin_bca_actual').value) || 0,

        // Expenses - MAKANAN
        makan_bahan_proj: parseFloat(document.getElementById('makan_bahan_proj').value) || 0,
        makan_bahan_actual: parseFloat(document.getElementById('makan_bahan_actual').value) || 0,
        makan_belanja_proj: parseFloat(document.getElementById('makan_belanja_proj').value) || 0,
        makan_belanja_actual: parseFloat(document.getElementById('makan_belanja_actual').value) || 0,
        makan_gas_proj: parseFloat(document.getElementById('makan_gas_proj').value) || 0,
        makan_gas_actual: parseFloat(document.getElementById('makan_gas_actual').value) || 0,

        // Expenses - PELIHARAAN
        peliharaan_proj: parseFloat(document.getElementById('peliharaan_proj').value) || 0,
        peliharaan_actual: parseFloat(document.getElementById('peliharaan_actual').value) || 0,

        // Expenses - TABUNGAN ATAU INVESTASI
        tabung_tabungan_proj: parseFloat(document.getElementById('tabung_tabungan_proj').value) || 0,
        tabung_tabungan_actual: parseFloat(document.getElementById('tabung_tabungan_actual').value) || 0,

        // Expenses - HADIAH DAN DONASI
        hadiah_kasih_mama_proj: parseFloat(document.getElementById('hadiah_kasih_mama_proj').value) || 0,
        hadiah_kasih_mama_actual: parseFloat(document.getElementById('hadiah_kasih_mama_actual').value) || 0,

        // Expenses - Tambahan Hiburan / Lain-lain
        hiburan_proj: parseFloat(document.getElementById('hiburan_proj').value) || 0,
        hiburan_actual: parseFloat(document.getElementById('hiburan_actual').value) || 0,

        // Expenses - PERAWATAN PRIBADI
        perawatan_proj: parseFloat(document.getElementById('perawatan_proj').value) || 0,
        perawatan_actual: parseFloat(document.getElementById('perawatan_actual').value) || 0,

        // Expenses - HUKUM
        hukum_proj: parseFloat(document.getElementById('hukum_proj').value) || 0,
        hukum_actual: parseFloat(document.getElementById('hukum_actual').value) || 0,
    };

    localStorage.setItem('budgetData', JSON.stringify(data));
    alert('Data anggaran berhasil disimpan! Mengalihkan ke Dashboard.');
    window.location.href = 'index.html'; // <--- Perubahan di sini!
}

function loadData() {
    const savedData = localStorage.getItem('budgetData');
    if (savedData) {
        const data = JSON.parse(savedData);
        for (const key in data) {
            const element = document.getElementById(key);
            if (element) {
                element.value = data[key];
            }
        }
    }
}