// firebase-config.js - Versi Stabil untuk GitHub Pages
const firebaseConfig = {
    apiKey: "AIzaSyD2BTJ2Nz3pu7Wx2bITPhLLIF3PnP0l4xk",
    authDomain: "ssb-wind-soccer-pro.firebaseapp.com",
    projectId: "ssb-wind-soccer-pro",
    storageBucket: "ssb-wind-soccer-pro.firebasestorage.app",
    messagingSenderId: "1080769161840",
    appId: "1:1080769161840:web:839f18578776bbc8d862b5"
};

// Inisialisasi Firebase dengan cara yang lebih aman
let app = null;
let db = null;

function initializeFirebase() {
    return new Promise((resolve, reject) => {
        if (app && db) {
            console.log("✅ Firebase sudah diinisialisasi sebelumnya");
            resolve();
            return;
        }

        try {
            // Load Firebase jika belum ada
            if (typeof firebase === "undefined") {
                console.warn("Firebase SDK belum dimuat, tunggu...");
                setTimeout(() => initializeFirebase().then(resolve).catch(reject), 500);
                return;
            }

            app = firebase.initializeApp(firebaseConfig);
            db = firebase.firestore();

            console.log("✅ Firebase berhasil diinisialisasi");
            window.firebaseDB = db;   // agar bisa diakses global
            resolve();
        } catch (error) {
            console.error("❌ Gagal initialize Firebase:", error);
            reject(error);
        }
    });
}

// Export ke global scope
window.initializeFirebase = initializeFirebase;
window.getFirestoreDB = () => db;

console.log("🔧 firebase-config.js loaded successfully");
