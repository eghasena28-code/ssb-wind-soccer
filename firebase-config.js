<!-- firebase-config.js -->
const firebaseConfig = {
    apiKey: "AIzaSyD2BTJ2Nz3pu7Wx2bITPhLLIF3PnP0l4xk",
    authDomain: "ssb-wind-soccer-pro.firebaseapp.com",
    projectId: "ssb-wind-soccer-pro",
    storageBucket: "ssb-wind-soccer-pro.firebasestorage.app",
    messagingSenderId: "1080769161840",
    appId: "1:1080769161840:web:839f18578776bbc8d862b5"
};

// Inisialisasi Firebase (akan kita pakai di db-sync.js nanti)
let app;
let db;

async function initializeFirebase() {
    if (typeof firebase === 'undefined') {
        // Load Firebase SDK via script tag (modular style)
        const script = document.createElement('script');
        script.src = "https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js";
        script.onload = () => {
            // Load Firestore juga
            const firestoreScript = document.createElement('script');
            firestoreScript.src = "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore-compat.js";
            firestoreScript.onload = () => {
                app = firebase.initializeApp(firebaseConfig);
                db = firebase.firestore();
                console.log("✅ Firebase berhasil diinisialisasi (Compat version)");
                // Panggil fungsi sync setelah Firebase siap
                if (typeof window.syncToFirebase === 'function') {
                    window.syncToFirebase();
                }
            };
            document.head.appendChild(firestoreScript);
        };
        document.head.appendChild(script);
    } else {
        app = firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
        console.log("✅ Firebase sudah siap");
    }
}

// Export agar bisa dipakai di file lain
window.firebaseConfig = firebaseConfig;
window.initializeFirebase = initializeFirebase;
window.getFirestoreDB = () => db;