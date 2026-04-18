// firebase-config.js
// Konfigurasi Firebase untuk SSB Wind Soccer - VERSI LENGKAP

// ===== FIREBASE CONFIGURATION =====
const firebaseConfig = {
  apiKey: "AIzaSyDemoKeyABC123XYZ", // GANTI DENGAN API KEY FIREBASE ANDA
  authDomain: "ssb-wind-soccer.firebaseapp.com", // GANTI
  projectId: "ssb-wind-soccer", // GANTI
  storageBucket: "ssb-wind-soccer.appspot.com", // GANTI
  messagingSenderId: "123456789", // GANTI
  appId: "1:123456789:web:abcdef123456" // GANTI
};

// ===== INITIALIZE FIREBASE =====
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();

console.log("🔧 Firebase Config Loaded");
console.log("📊 Project ID:", firebaseConfig.projectId);

// ===== GLOBAL FIREBASE STATE =====
let firebaseReady = false;
let firebaseError = null;

// ===== INITIALIZE FIREBASE ASYNC =====
async function initializeFirebase() {
  try {
    // Test Firestore Connection
    const testRef = db.collection('_test').doc('connection');
    await testRef.get();
    
    firebaseReady = true;
    firebaseError = null;
    
    console.log("✅ Firebase Initialized Successfully");
    console.log("✅ Firestore Connected");
    console.log("✅ Storage Ready");
    
    return db;
  } catch (error) {
    firebaseReady = false;
    firebaseError = error;
    console.error("❌ Firebase Init Error:", error.message);
    console.warn("⚠️  Sistem akan beralih ke localStorage");
    return null;
  }
}

// ===== CHECK FIREBASE STATUS =====
function isFirebaseReady() {
  return firebaseReady;
}

function getFirebaseError() {
  return firebaseError;
}

// ===== HELPER: TIMESTAMP =====
function getTimestamp() {
  return firebase.firestore.Timestamp.now();
}

function getCurrentDate() {
  return new Date().toLocaleDateString('id-ID');
}

function getCurrentDateTime() {
  const now = new Date();
  const date = now.toLocaleDateString('id-ID');
  const time = now.toLocaleTimeString('id-ID');
  return `${date} ${time}`;
}

// ===== HELPER: VALIDATE EMAIL =====
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// ===== HELPER: VALIDATE PHONE =====
function validatePhone(phone) {
  const re = /^08[0-9]{8,11}$/;
  return re.test(phone);
}

// ===== HELPER: GENERATE ID =====
function generateID(prefix = '') {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substr(2, 5).toUpperCase();
  return prefix + timestamp + random;
}

// ===== HELPER: FORMAT RUPIAH =====
function formatRupiah(nominal) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(nominal || 0);
}

// ===== HELPER: FORMAT DATE =====
function formatDate(date) {
  if (!date) return '-';
  if (typeof date === 'string') {
    if (date.includes('-')) {
      const [tahun, bulan, hari] = date.split('-');
      return `${hari}/${bulan}/${tahun}`;
    }
    return date;
  }
  if (date instanceof firebase.firestore.Timestamp) {
    return date.toDate().toLocaleDateString('id-ID');
  }
  return new Date(date).toLocaleDateString('id-ID');
}

// ===== HELPER: CALCULATE AGE =====
function calculateAge(birthDate) {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

// ===== HELPER: GET KATEGORI FROM AGE =====
function getKategoriFromAge(age) {
  if (age >= 17) return "KU-17";
  if (age >= 15) return "KU-16";
  if (age >= 13) return "KU-14";
  if (age >= 11) return "KU-12";
  if (age >= 9) return "KU-10";
  if (age >= 7) return "KU-8";
  return "KU-6";
}

// ===== HELPER: RETRY FUNCTION =====
async function retryAsync(fn, maxRetries = 3, delay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      console.warn(`⚠️ Retry attempt ${i + 1}/${maxRetries}...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// ===== COLLECTIONS INFO =====
const COLLECTIONS = {
  PENDAFTAR: 'pendaftar',
  SISWA: 'siswa',
  ABSENSI: 'absensi',
  KEUANGAN: 'keuangan',
  JADWAL: 'jadwal',
  SARAN: 'saran',
  PELATIH: 'pelatih',
  ORANG_TUA: 'orang_tua'
};

// ===== KONSTANTA =====
const NOMINAL_DAFTAR = {
  'Reguler': 400000,
  'Beasiswa': 100000
};

const KATEGORI_KU = ['KU-6', 'KU-8', 'KU-10', 'KU-12', 'KU-14', 'KU-16', 'KU-17'];

const POSISI_PEMAIN = ['Kiper', 'Bek', 'Gelandang', 'Penyerang'];

const TIPE_PENDAFTAR = ['Reguler', 'Beasiswa'];

// ===== LOG UTILITY =====
const Logger = {
  info: function(message) {
    console.log('ℹ️ INFO:', message);
  },
  success: function(message) {
    console.log('✅ SUCCESS:', message);
  },
  warning: function(message) {
    console.warn('⚠️ WARNING:', message);
  },
  error: function(message) {
    console.error('❌ ERROR:', message);
  },
  debug: function(message) {
    if (true) { // Set to false untuk disable debug
      console.log('🔍 DEBUG:', message);
    }
  }
};

// ===== EXPORT UNTUK GLOBAL USE =====
window.firebaseHelpers = {
  formatRupiah,
  formatDate,
  calculateAge,
  getKategoriFromAge,
  validateEmail,
  validatePhone,
  generateID,
  getCurrentDate,
  getCurrentDateTime,
  getTimestamp,
  isFirebaseReady,
  getFirebaseError,
  retryAsync,
  Logger,
  COLLECTIONS,
  NOMINAL_DAFTAR,
  KATEGORI_KU,
  POSISI_PEMAIN,
  TIPE_PENDAFTAR
};

// ===== INIT CONSOLE =====
console.log('════════════════════════════════════');
console.log('🚀 SSB WIND SOCCER - FIREBASE SETUP');
console.log('════════════════════════════════════');
console.log('📦 Firebase SDK loaded');
console.log('🌐 Project:', firebaseConfig.projectId);
console.log('💾 Using Firestore Database');
console.log('📁 Storage Bucket:', firebaseConfig.storageBucket);
console.log('════════════════════════════════════');

// ===== AUTO INIT =====
window.addEventListener('load', async function() {
  console.log('🔄 Initializing Firebase...');
  await initializeFirebase();
});

console.log("✅ firebase-config.js loaded successfully!");
