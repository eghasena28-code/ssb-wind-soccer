// ==================== DB-SYNC.JS - FIREBASE COMPAT LENGKAP ====================
// Hanya untuk penyimpanan database - Tidak mengubah fitur lain
// Update: 12 April 2026

const firebaseConfig = {
  apiKey: "AIzaSyD12rwdbODRChLrl0mqF3vWh_CPfC0iirs",
  authDomain: "ssb-wind-soccer-app.firebaseapp.com",
  projectId: "ssb-wind-soccer-app",
  storageBucket: "ssb-wind-soccer-app.firebasestorage.app",
  messagingSenderId: "379645790712",
  appId: "1:379645790712:web:3c897ffc581bd4f8622e0d",
  measurementId: "G-EPFFMMJ787"
};

let dbInstance = null;

const DBManager = {

    // LOGIN & SESSION (tidak diubah)
    setLoginUser: function(user) { 
        sessionStorage.setItem("userAktif", JSON.stringify(user)); 
    },
    getLoginUser: function() {
        const data = sessionStorage.getItem("userAktif");
        return data ? JSON.parse(data) : null;
    },
    clearLoginUser: function() { 
        sessionStorage.removeItem("userAktif"); 
    },

    // INISIALISASI FIREBASE
    initFirebase: function() {
        if (dbInstance) return dbInstance;

        if (typeof firebase === "undefined") {
            console.error("❌ Firebase SDK belum dimuat. Tambahkan script compat di HTML!");
            return null;
        }

        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }

        dbInstance = firebase.firestore();
        console.log("✅ Firebase Firestore siap!");
        return dbInstance;
    },

    // SISWA AKTIF (tidak diubah)
    findSiswa: async function(nisw) {
        const db = this.initFirebase();
        if (!db) return null;
        try {
            let doc = await db.collection("siswaAktif").doc(String(nisw).toUpperCase()).get();
            if (doc.exists) return doc.data();

            doc = await db.collection("siswaBeasiswa").doc(String(nisw).toUpperCase()).get();
            if (doc.exists) return doc.data();
            return null;
        } catch(e) {
            console.error("Error findSiswa:", e);
            return null;
        }
    },

    // ABSENSI - Hanya ini yang difokuskan
    addAbsensi: async function(absenBaru) {
        const db = this.initFirebase();
        if (!db) return false;
        try {
            await db.collection("absensi").add(absenBaru);
            console.log("✅ Absensi tersimpan ke Firebase");
            return true;
        } catch(e) {
            console.error("❌ Gagal simpan absensi:", e);
            return false;
        }
    },

    cekDuplicateAbsensi: async function(nisw, tanggal) {
        const db = this.initFirebase();
        if (!db) return false;
        try {
            const snapshot = await db.collection("absensi")
                .where("nisw", "==", nisw)
                .where("tanggal", "==", tanggal)
                .get();
            return !snapshot.empty;
        } catch(e) {
            console.error("Error cek duplicate:", e);
            return false;
        }
    },

    // SARAN (tetap)
    addSaran: async function(data) {
        const db = this.initFirebase();
        if (!db) return;
        data.id = Date.now().toString();
        data.waktu = this.getTglSekarang();
        data.dibaca = false;
        await db.collection("saran").add(data);
    },

    // HELPER
    getTglSekarang: function() {
        const d = new Date();
        return `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()}`;
    }
};

// Auto init
window.addEventListener('load', () => {
    DBManager.initFirebase();
});

window.DBManager = DBManager;
console.log("🚀 DBManager Firebase siap! (Absensi aktif)");
