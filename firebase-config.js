// ============================================
// firebase-config.js - IMPROVED VERSION
// ============================================

console.log("🔧 Loading firebase-config.js...");

const firebaseConfig = {
    apiKey: "AIzaSyD2BTJ2Nz3pu7Wx2bITPhLLIF3PnP0l4xk",
    authDomain: "ssb-wind-soccer-pro.firebaseapp.com",
    projectId: "ssb-wind-soccer-pro",
    storageBucket: "ssb-wind-soccer-pro.firebasestorage.app",
    messagingSenderId: "1080769161840",
    appId: "1:1080769161840:web:839f18578776bbc8d862b5"
};

// ===== PERBAIKAN: Global Firebase instances =====
let app = null;
let db = null;

// ===== PERBAIKAN: Initialize Firebase dengan Error Handling =====
function initializeFirebase() {
    return new Promise((resolve, reject) => {
        try {
            // Jika sudah diinisialisasi, resolve saja
            if (app && db) {
                console.log("✅ Firebase sudah diinisialisasi sebelumnya");
                resolve();
                return;
            }

            // Cek apakah Firebase SDK sudah dimuat
            if (typeof firebase === "undefined") {
                console.warn("⚠️ Firebase SDK belum dimuat, tunggu...");
                setTimeout(() => {
                    initializeFirebase().then(resolve).catch(reject);
                }, 500);
                return;
            }

            // Prevent multiple initializations
            if (firebase.apps.length > 0) {
                app = firebase.app();
                db = firebase.firestore();
                console.log("✅ Firebase sudah diinisialisasi oleh instance lain");
                resolve();
                return;
            }

            // Initialize Firebase
            console.log("🔧 Initializing Firebase...");
            app = firebase.initializeApp(firebaseConfig);
            db = firebase.firestore();

            // Enable offline persistence
            db.enablePersistence().catch((err) => {
                if (err.code === 'failed-precondition') {
                    console.warn("⚠️ Multiple tabs detected, offline persistence disabled");
                } else if (err.code === 'unimplemented') {
                    console.warn("⚠️ Browser doesn't support offline persistence");
                }
            });

            console.log("✅ Firebase berhasil diinisialisasi dengan Firestore");
            window.firebaseDB = db;
            window.firebaseApp = app;
            
            resolve();

        } catch (error) {
            console.error("❌ Gagal initialize Firebase:", error);
            reject(error);
        }
    });
}

// ===== PERBAIKAN: Export ke Global Scope =====
window.initializeFirebase = initializeFirebase;
window.getFirestoreDB = () => db;
window.getFirebaseApp = () => app;

console.log("✅ firebase-config.js loaded successfully");
