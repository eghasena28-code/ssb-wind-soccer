/**
 * FIREBASE CONFIG - SSB WIND SOCCER
 * Complete Firebase Setup with Helpers
 * Version: 3.0 (Production Ready)
 */

console.log("🔧 Loading firebase-config.js...");

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
window.formatRupiah = function(nominal) {
  return new Intl.NumberFormat('id-ID').format(nominal || 0);
};

window.formatDate = function(date) {
  if (!date) return '-';
  if (typeof date === 'string') {
    if (date.includes('-')) {
      const [tahun, bulan, hari] = date.split('-');
      return `${hari}/${bulan}/${tahun}`;
    }
    return date;
  }
  return new Date(date).toLocaleDateString('id-ID');
};

window.getCurrentDate = function() {
  return new Date().toLocaleDateString('id-ID');
};

window.getCurrentDateTime = function() {
  const now = new Date();
  const date = now.toLocaleDateString('id-ID');
  const time = now.toLocaleTimeString('id-ID');
  return `${date} ${time}`;
};

// ============ VALIDATION HELPERS ============
window.validateEmail = function(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

window.validatePhone = function(phone) {
  const re = /^08[0-9]{8,11}$/;
  return re.test(phone);
};

// ============ GENERATE ID ============
window.generateID = function(prefix = '') {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substr(2, 5).toUpperCase();
  return prefix + timestamp + random;
};

// ============ CALCULATE AGE ============
window.calculateAge = function(birthDate) {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

// ============ GET KATEGORI FROM AGE ============
window.getKategoriFromAge = function(age) {
  if (age >= 17) return "KU-17";
  if (age >= 15) return "KU-16";
  if (age >= 13) return "KU-14";
  if (age >= 11) return "KU-12";
  if (age >= 9) return "KU-10";
  if (age >= 7) return "KU-8";
  return "KU-6";
};

// ============ CONSTANTS ============
window.NOMINAL_DAFTAR = {
  'Reguler': 500000,
  'Beasiswa': 100000
};

window.KATEGORI_KU = ['KU-6', 'KU-8', 'KU-10', 'KU-12', 'KU-14', 'KU-16', 'KU-17'];

window.POSISI_PEMAIN = ['Kiper', 'Bek', 'Gelandang', 'Penyerang'];

window.TIPE_PENDAFTAR = ['Reguler', 'Beasiswa'];

// ============ LOGGER ============
window.Logger = {
  info: (msg) => console.log('ℹ️ INFO:', msg),
  success: (msg) => console.log('✅ SUCCESS:', msg),
  warn: (msg) => console.warn('⚠️ WARN:', msg),
  error: (msg) => console.error('❌ ERROR:', msg),
  debug: (msg) => console.log('🔍 DEBUG:', msg)
};

console.log("✅ firebase-config.js loaded successfully!");
