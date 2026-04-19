/**
 * FIREBASE CONFIG - SSB WIND SOCCER
 * Complete Firebase Setup with Helpers
 * Version: 4.0 (Production Ready with Demo Data)
 */

console.log("🔧 Loading firebase-config.js v4.0...");

// ============ FIREBASE CONFIGURATION ============
const firebaseConfig = {
  apiKey: "AIzaSyDemoKeyABC123XYZ", // GANTI DENGAN API KEY ANDA
  authDomain: "ssb-wind-soccer.firebaseapp.com",
  projectId: "ssb-wind-soccer",
  storageBucket: "ssb-wind-soccer.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// ============ INITIALIZE FIREBASE ============
try {
  firebase.initializeApp(firebaseConfig);
  window.db = firebase.firestore();
  window.storage = firebase.storage();
  console.log("✅ Firebase Initialized");
  console.log("✅ Firestore Ready");
  console.log("✅ Storage Ready");
} catch (error) {
  console.error("❌ Firebase Error:", error);
  console.warn("⚠️ Using localStorage fallback");
}

// ============ GLOBAL STATE ============
window.firebaseReady = false;
window.firebaseError = null;

// ============ FORMAT HELPERS ============

/**
 * Format angka menjadi rupiah
 * @param {number} nominal - Nominal uang
 * @returns {string} Format rupiah dengan titik pemisah ribuan
 */
window.formatRupiah = function(nominal) {
  return new Intl.NumberFormat('id-ID').format(nominal || 0);
};

/**
 * Format tanggal dari berbagai format
 * @param {string|Date} date - Tanggal yang ingin diformat
 * @returns {string} Format DD/MM/YYYY
 */
window.formatDate = function(date) {
  if (!date) return '-';
  
  if (typeof date === 'string') {
    // Jika sudah DD/MM/YYYY, kembalikan langsung
    if (date.includes('/')) return date;
    
    // Jika format YYYY-MM-DD, ubah ke DD/MM/YYYY
    if (date.includes('-')) {
      const [tahun, bulan, hari] = date.split('-');
      return `${hari}/${bulan}/${tahun}`;
    }
    
    return date;
  }
  
  return new Date(date).toLocaleDateString('id-ID');
};

/**
 * Dapatkan tanggal hari ini
 * @returns {string} Format DD/MM/YYYY
 */
window.getCurrentDate = function() {
  return new Date().toLocaleDateString('id-ID');
};

/**
 * Dapatkan tanggal dan waktu saat ini
 * @returns {string} Format "DD/MM/YYYY HH:MM:SS"
 */
window.getCurrentDateTime = function() {
  const now = new Date();
  const date = now.toLocaleDateString('id-ID');
  const time = now.toLocaleTimeString('id-ID');
  return `${date} ${time}`;
};

/**
 * Format tanggal menjadi format Indonesia yang panjang
 * @param {string|Date} date - Tanggal yang ingin diformat
 * @returns {string} Format "dd Bulan yyyy"
 */
window.formatDateLong = function(date) {
  if (!date) return '-';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) return date;
  
  const bulanID = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  
  return `${dateObj.getDate()} ${bulanID[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
};

// ============ VALIDATION HELPERS ============

/**
 * Validasi format email
 * @param {string} email - Email yang ingin divalidasi
 * @returns {boolean} true jika valid, false jika tidak
 */
window.validateEmail = function(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

/**
 * Validasi format nomor telepon Indonesia
 * @param {string} phone - Nomor yang ingin divalidasi
 * @returns {boolean} true jika valid, false jika tidak
 */
window.validatePhone = function(phone) {
  const re = /^08[0-9]{8,11}$/;
  return re.test(phone);
};

/**
 * Validasi format NISW
 * @param {string} nisw - NISW yang ingin divalidasi
 * @returns {boolean} true jika valid, false jika tidak
 */
window.validateNISW = function(nisw) {
  // Format: R2026001 atau B2026001
  const re = /^[RB]\d{7}$/;
  return re.test(nisw);
};

// ============ GENERATE ID ============

/**
 * Generate ID unik dengan prefix
 * @param {string} prefix - Prefix untuk ID
 * @returns {string} ID unik
 */
window.generateID = function(prefix = '') {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substr(2, 5).toUpperCase();
  return prefix + timestamp + random;
};

/**
 * Generate nomor urut untuk keuangan
 * @returns {string} Nomor urut KAS/xxx
 */
window.generateKasNumber = function() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `KAS/${year}${month}${day}${random}`;
};

// ============ CALCULATE AGE ============

/**
 * Hitung umur dari tanggal lahir
 * @param {string|Date} birthDate - Tanggal lahir
 * @returns {number} Umur dalam tahun
 */
window.calculateAge = function(birthDate) {
  const today = new Date();
  const birth = new Date(birthDate);
  
  if (isNaN(birth.getTime())) return 0;
  
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

// ============ GET KATEGORI FROM AGE ============

/**
 * Dapatkan kategori umur (KU) berdasarkan usia
 * @param {number} age - Usia dalam tahun
 * @returns {string} Kategori KU (KU-6, KU-8, dst)
 */
window.getKategoriFromAge = function(age) {
  if (age >= 17) return "KU-17";
  if (age >= 15) return "KU-16";
  if (age >= 13) return "KU-14";
  if (age >= 11) return "KU-12";
  if (age >= 9) return "KU-10";
  if (age >= 7) return "KU-8";
  return "KU-6";
};

/**
 * Dapatkan kategori umur dari tanggal lahir
 * @param {string|Date} birthDate - Tanggal lahir
 * @returns {string} Kategori KU
 */
window.getKategoriFromBirthDate = function(birthDate) {
  const age = calculateAge(birthDate);
  return getKategoriFromAge(age);
};

// ============ CONSTANTS ============

/**
 * Nominal biaya pendaftaran berdasarkan tipe
 * @type {Object}
 */
window.NOMINAL_DAFTAR = {
  'Reguler': 500000,
  'Beasiswa': 100000
};

/**
 * Nominal SPP (Sumbangan Pembinaan Pemain)
 * @type {number}
 */
window.NOMINAL_SPP = 150000;

/**
 * Daftar kategori umur
 * @type {Array<string>}
 */
window.KATEGORI_KU = ['KU-6', 'KU-8', 'KU-10', 'KU-12', 'KU-14', 'KU-16', 'KU-17'];

/**
 * Daftar posisi pemain
 * @type {Array<string>}
 */
window.POSISI_PEMAIN = ['Kiper', 'Bek', 'Gelandang', 'Penyerang'];

/**
 * Daftar tipe pendaftar
 * @type {Array<string>}
 */
window.TIPE_PENDAFTAR = ['Reguler', 'Beasiswa'];

/**
 * Daftar kategori saran
 * @type {Array<string>}
 */
window.KATEGORI_SARAN = ['Fasilitas', 'Pelatih', 'Jadwal', 'Administrasi', 'Lainnya'];

/**
 * Status pembayaran
 * @type {Array<string>}
 */
window.STATUS_PEMBAYARAN = ['Lunas', 'Cicilan', 'Belum Bayar'];

/**
 * Status absensi
 * @type {Array<string>}
 */
window.STATUS_ABSENSI = ['Hadir', 'Izin', 'Tanpa Keterangan'];

// ============ LOGGER ============

/**
 * Global Logger untuk debugging
 * @type {Object}
 */
window.Logger = {
  info: function(msg) {
    console.log('ℹ️ INFO:', msg);
  },
  success: function(msg) {
    console.log('✅ SUCCESS:', msg);
  },
  warn: function(msg) {
    console.warn('⚠️ WARN:', msg);
  },
  error: function(msg) {
    console.error('❌ ERROR:', msg);
  },
  debug: function(msg) {
    console.log('🔍 DEBUG:', msg);
  },
  table: function(data) {
    console.table(data);
  }
};

// ============ STRING UTILITIES ============

/**
 * Capitalize string (ubah huruf pertama menjadi kapital)
 * @param {string} str - String yang ingin dikapitalkan
 * @returns {string} String yang sudah dikapitalkan
 */
window.capitalize = function(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Truncate string dengan ellipsis
 * @param {string} str - String yang ingin dipotong
 * @param {number} length - Panjang maksimal
 * @returns {string} String yang sudah dipotong
 */
window.truncate = function(str, length) {
  if (str.length <= length) return str;
  return str.substring(0, length) + '...';
};

/**
 * Capitalize setiap kata dalam string
 * @param {string} str - String yang ingin dikapitalkan
 * @returns {string} String dengan setiap kata dikapitalkan
 */
window.titleCase = function(str) {
  return str.split(' ').map(word => capitalize(word)).join(' ');
};

// ============ ARRAY UTILITIES ============

/**
 * Urutkan array berdasarkan property
 * @param {Array} arr - Array yang ingin diurutkan
 * @param {string} prop - Property untuk diurutkan
 * @param {string} order - 'asc' atau 'desc'
 * @returns {Array} Array yang sudah diurutkan
 */
window.sortByProperty = function(arr, prop, order = 'asc') {
  return arr.sort((a, b) => {
    if (order === 'asc') {
      return a[prop] > b[prop] ? 1 : -1;
    } else {
      return a[prop] < b[prop] ? 1 : -1;
    }
  });
};

/**
 * Filter array berdasarkan property
 * @param {Array} arr - Array yang ingin difilter
 * @param {string} prop - Property untuk difilter
 * @param {any} value - Nilai yang ingin dicocokkan
 * @returns {Array} Array yang sudah difilter
 */
window.filterByProperty = function(arr, prop, value) {
  return arr.filter(item => item[prop] === value);
};

/**
 * Group array berdasarkan property
 * @param {Array} arr - Array yang ingin dikelompokkan
 * @param {string} prop - Property untuk dikelompokkan
 * @returns {Object} Object dengan key adalah nilai property
 */
window.groupByProperty = function(arr, prop) {
  return arr.reduce((groups, item) => {
    const key = item[prop];
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {});
};

// ============ COLOR UTILITIES ============

/**
 * Dapatkan warna berdasarkan status pembayaran
 * @param {string} status - Status pembayaran
 * @returns {string} Kode warna hex
 */
window.getPaymentStatusColor = function(status) {
  const colors = {
    'Lunas': '#28a745',      // Hijau
    'Cicilan': '#ffc107',    // Kuning
    'Belum Bayar': '#dc3545' // Merah
  };
  return colors[status] || '#6c757d'; // Default Abu-abu
};

/**
 * Dapatkan warna berdasarkan status absensi
 * @param {string} status - Status absensi
 * @returns {string} Kode warna hex
 */
window.getAbsensiStatusColor = function(status) {
  const colors = {
    'Hadir': '#28a745',              // Hijau
    'Izin': '#ffc107',               // Kuning
    'Tanpa Keterangan': '#dc3545'   // Merah
  };
  return colors[status] || '#6c757d'; // Default Abu-abu
};

/**
 * Dapatkan warna berdasarkan kategori KU
 * @param {string} kategori - Kategori KU
 * @returns {string} Kode warna hex
 */
window.getKuCategoryColor = function(kategori) {
  const colors = {
    'KU-6': '#FF6B6B',      // Merah terang
    'KU-8': '#4ECDC4',      // Teal
    'KU-10': '#45B7D1',     // Biru
    'KU-12': '#96CEB4',     // Hijau muda
    'KU-14': '#FFEAA7',     // Kuning muda
    'KU-16': '#DDA0DD',     // Plum
    'KU-17': '#FF8B94'      // Pink
  };
  return colors[kategori] || '#003399'; // Default biru SSB
};

// ============ NUMBER UTILITIES ============

/**
 * Format nomor dengan separasi ribuan
 * @param {number} num - Nomor yang ingin diformat
 * @returns {string} Nomor dengan separasi ribuan
 */
window.formatNumber = function(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

/**
 * Hitung persentase
 * @param {number} value - Nilai
 * @param {number} total - Total
 * @returns {number} Persentase (0-100)
 */
window.calculatePercentage = function(value, total) {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

/**
 * Hitung rata-rata dari array
 * @param {Array<number>} arr - Array angka
 * @returns {number} Nilai rata-rata
 */
window.calculateAverage = function(arr) {
  if (arr.length === 0) return 0;
  const sum = arr.reduce((a, b) => a + b, 0);
  return Math.round(sum / arr.length);
};

// ============ STORAGE UTILITIES ============

/**
 * Simpan data ke localStorage dengan encryption sederhana
 * @param {string} key - Key untuk disimpan
 * @param {any} value - Value untuk disimpan
 */
window.saveToLocalStorage = function(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    Logger.debug(`Data saved: ${key}`);
  } catch (error) {
    Logger.error(`Error saving to localStorage: ${error}`);
  }
};

/**
 * Ambil data dari localStorage
 * @param {string} key - Key yang ingin diambil
 * @param {any} defaultValue - Nilai default jika key tidak ada
 * @returns {any} Data dari localStorage
 */
window.getFromLocalStorage = function(key, defaultValue = null) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    Logger.error(`Error getting from localStorage: ${error}`);
    return defaultValue;
  }
};

/**
 * Hapus data dari localStorage
 * @param {string} key - Key yang ingin dihapus
 */
window.removeFromLocalStorage = function(key) {
  try {
    localStorage.removeItem(key);
    Logger.debug(`Data removed: ${key}`);
  } catch (error) {
    Logger.error(`Error removing from localStorage: ${error}`);
  }
};

// ============ NOTIFICATION UTILITIES ============

/**
 * Tampilkan notifikasi success
 * @param {string} message - Pesan notifikasi
 * @param {number} duration - Durasi tampil dalam ms (default 3000)
 */
window.showSuccessNotification = function(message, duration = 3000) {
  console.log('✅ SUCCESS:', message);
  // Implementasi UI notifikasi bisa ditambahkan di sini
};

/**
 * Tampilkan notifikasi error
 * @param {string} message - Pesan notifikasi
 * @param {number} duration - Durasi tampil dalam ms (default 5000)
 */
window.showErrorNotification = function(message, duration = 5000) {
  console.error('❌ ERROR:', message);
  // Implementasi UI notifikasi bisa ditambahkan di sini
};

/**
 * Tampilkan notifikasi warning
 * @param {string} message - Pesan notifikasi
 * @param {number} duration - Durasi tampil dalam ms (default 4000)
 */
window.showWarningNotification = function(message, duration = 4000) {
  console.warn('⚠️ WARNING:', message);
  // Implementasi UI notifikasi bisa ditambahkan di sini
};

// ============ DEBUGGING UTILITIES ============

/**
 * Print semua data di localStorage
 */
window.printAllLocalStorageData = function() {
  console.log("📊 ===== ALL LOCAL STORAGE DATA =====");
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const value = getFromLocalStorage(key);
    console.log(`${key}:`, value);
  }
  console.log("====================================");
};

/**
 * Clear semua data di localStorage
 * @param {boolean} confirm - Konfirmasi sebelum menghapus
 */
window.clearAllLocalStorageData = function(confirm = true) {
  if (confirm && !window.confirm('Yakin ingin menghapus semua data?')) {
    return;
  }
  localStorage.clear();
  Logger.warn('All localStorage data cleared!');
};

/**
 * Export data sebagai JSON file
 * @param {Object} data - Data yang ingin di-export
 * @param {string} filename - Nama file
 */
window.exportDataAsJSON = function(data, filename = 'export.json') {
  const dataStr = JSON.stringify(data, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  Logger.success(`Data exported as ${filename}`);
};

// ============ INITIALIZATION ============

/**
 * Inisialisasi Firebase Config
 */
window.initializeFirebaseConfig = function() {
  console.log("🎬 Initializing Firebase Config...");
  
  // Cek Firebase status
  if (window.firebase) {
    window.firebaseReady = true;
    console.log("✅ Firebase ready!");
  } else {
    window.firebaseReady = false;
    console.warn("⚠️ Firebase SDK not loaded!");
  }
  
  // Initialize demo data jika diperlukan
  if (typeof DBManager !== 'undefined' && typeof DBManager.initializeDemoData === 'function') {
    DBManager.initializeDemoData();
  }
};

// Auto-initialize ketika window siap
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    initializeFirebaseConfig();
  });
} else {
  initializeFirebaseConfig();
}

// Initialize juga ketika window load
window.addEventListener('load', function() {
  if (typeof DBManager !== 'undefined' && typeof DBManager.initializeDemoData === 'function') {
    DBManager.initializeDemoData();
  }
});

// ============ ERROR HANDLING ============

/**
 * Global error handler
 */
window.addEventListener('error', function(event) {
  Logger.error('Global error:', event.message);
  Logger.error('Stack:', event.error?.stack);
});

/**
 * Unhandled promise rejection handler
 */
window.addEventListener('unhandledrejection', function(event) {
  Logger.error('Unhandled rejection:', event.reason);
});

console.log("✅ firebase-config.js v4.0 loaded successfully!");
console.log("📊 Available Functions:");
console.log("   - formatRupiah(nominal)");
console.log("   - formatDate(date)");
console.log("   - formatDateLong(date)");
console.log("   - getCurrentDate()");
console.log("   - getCurrentDateTime()");
console.log("   - validateEmail(email)");
console.log("   - validatePhone(phone)");
console.log("   - validateNISW(nisw)");
console.log("   - calculateAge(birthDate)");
console.log("   - getKategoriFromAge(age)");
console.log("   - getKategoriFromBirthDate(birthDate)");
console.log("   - dan banyak lagi...");
console.log("🔐 Admin Code: 110admin");
console.log("📋 Demo NISW:");
console.log("   Reguler: R2026001, R2026002, R2026003");
console.log("   Beasiswa: B2026001, B2026002, B2026003");
