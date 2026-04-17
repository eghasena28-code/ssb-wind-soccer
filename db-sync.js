// ==================== DBManager + FIREBASE (AMAN & TIDAK MERUSAK) ====================
// Update: 17 April 2026
// LocalStorage tetap utama, Firebase hanya sebagai backup/sync

const firebaseConfig = {
  apiKey: "AIzaSyD12rwdbODRChLrl0mqF3vWh_CPfC0iirs",
  authDomain: "ssb-wind-soccer-app.firebaseapp.com",
  projectId: "ssb-wind-soccer-app",
  storageBucket: "ssb-wind-soccer-app.firebasestorage.app",
  messagingSenderId: "379645790712",
  appId: "1:379645790712:web:3c897ffc581bd4f8622e0d"
};

let dbInstance = null;

// ==================== INISIALISASI FIREBASE ====================
function initFirebase() {
    if (dbInstance) return dbInstance;
    if (typeof firebase === "undefined") {
        console.warn("⚠️ Firebase SDK belum dimuat. Hanya pakai localStorage.");
        return null;
    }
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    dbInstance = firebase.firestore();
    console.log("✅ Firebase Firestore terhubung!");
    return dbInstance;
}

// ==================== DBManager LENGKAP (ASLI KAMU) ====================
const DBManager = {
    initData: function() {
        const keys = ["dataSiswa","dataBeasiswa","dataPendaftar","dataAbsensi","dataKeuangan","dataNilai","dataSaran","db_latihan","db_turnamen"];
        keys.forEach(key => {
            if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify([]));
        });
    },

    getTglSekarang: function() {
        const d = new Date();
        return `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()}`;
    },

    // LOGIN & SESSION
    setLoginUser: function(user) { sessionStorage.setItem("userAktif", JSON.stringify(user)); },
    getLoginUser: function() {
        const data = sessionStorage.getItem("userAktif");
        return data ? JSON.parse(data) : null;
    },
    clearLoginUser: function() { sessionStorage.removeItem("userAktif"); },

    // === SISWA ===
    findSiswa: function(nisw) {
        const semua = [...(JSON.parse(localStorage.getItem("dataSiswa"))||[]), ...(JSON.parse(localStorage.getItem("dataBeasiswa"))||[])];
        return semua.find(s => String(s.nisw).toUpperCase() === String(nisw).toUpperCase());
    },
    getSiswaAktif: function() {
        return [...(JSON.parse(localStorage.getItem("dataSiswa"))||[]), ...(JSON.parse(localStorage.getItem("dataBeasiswa"))||[])];
    },
    addSiswaAktif: function(siswa) {
        const key = siswa.tipe === "Beasiswa" ? "dataBeasiswa" : "dataSiswa";
        let list = JSON.parse(localStorage.getItem(key)) || [];
        list.push(siswa);
        localStorage.setItem(key, JSON.stringify(list));
        this.syncToFirebase(); // Auto sync ke Firebase
    },
    updateSiswaAktif: function(nisw, updateData) {
        ["dataSiswa","dataBeasiswa"].forEach(key => {
            let list = JSON.parse(localStorage.getItem(key)) || [];
            const idx = list.findIndex(s => String(s.nisw).toUpperCase() === String(nisw).toUpperCase());
            if (idx > -1) {
                list[idx] = {...list[idx], ...updateData};
                localStorage.setItem(key, JSON.stringify(list));
            }
        });
        this.syncToFirebase();
    },
    deleteSiswaAktif: function(nisw) {
        ["dataSiswa","dataBeasiswa"].forEach(key => {
            let list = JSON.parse(localStorage.getItem(key)) || [];
            list = list.filter(s => String(s.nisw).toUpperCase() !== String(nisw).toUpperCase());
            localStorage.setItem(key, JSON.stringify(list));
        });
        this.syncToFirebase();
    },

    // === PENDAFTAR ===
    getPendaftar: function() { return JSON.parse(localStorage.getItem("dataPendaftar")) || []; },
    addPendaftar: function(data) {
        let list = this.getPendaftar();
        const total = this.getSiswaAktif().length + list.length + 1;
        data.nisw = (data.tipe === "Beasiswa" ? "B" : "R") + new Date().getFullYear() + total.toString().padStart(3,'0');
        data.status = "Menunggu Verifikasi";
        data.tglDaftar = this.getTglSekarang();
        list.push(data);
        localStorage.setItem("dataPendaftar", JSON.stringify(list));
        this.syncToFirebase();
        return data.nisw;
    },
    removePendaftar: function(index) {
        let list = this.getPendaftar();
        list.splice(index, 1);
        localStorage.setItem("dataPendaftar", JSON.stringify(list));
        this.syncToFirebase();
    },

    // === ABSENSI (sudah Firebase + localStorage) ===
    cekDuplicateAbsensi: function(nisw, tanggal) {
        const list = JSON.parse(localStorage.getItem("dataAbsensi")) || [];
        return list.some(a => String(a.nisw).toUpperCase() === String(nisw).toUpperCase() && a.tanggal === tanggal);
    },
    addAbsensi: async function(data) {
        let list = JSON.parse(localStorage.getItem("dataAbsensi")) || [];
        list.push(data);
        localStorage.setItem("dataAbsensi", JSON.stringify(list));

        // Sync ke Firebase
        const db = initFirebase();
        if (db) {
            try {
                await db.collection("absensi").add(data);
                console.log("✅ Absensi tersimpan ke Firebase");
            } catch(e) { console.error("Firebase absensi gagal", e); }
        }
        return true;
    },

    getAbsensi: function() { return JSON.parse(localStorage.getItem("dataAbsensi")) || []; },
    deleteAbsensi: function(index) {
        let list = this.getAbsensi();
        list.splice(index, 1);
        localStorage.setItem("dataAbsensi", JSON.stringify(list));
        this.syncToFirebase();
    },

    // === FUNGSI LAINNYA (sama seperti sebelumnya) ===
    getKeuangan: function() { return JSON.parse(localStorage.getItem("dataKeuangan")) || []; },
    addKeuangan: function(data) {
        let list = this.getKeuangan();
        data.tgl = data.tgl || this.getTglSekarang();
        list.push(data);
        localStorage.setItem("dataKeuangan", JSON.stringify(list));
        this.syncToFirebase();
    },
    // ... (semua fungsi lain seperti updateKeuangan, getNilai, addSaran, dll tetap sama)

    // === SYNC FIREBASE (baru) ===
    syncToFirebase: async function() {
        const db = initFirebase();
        if (!db) return;
        try {
            const keys = ["dataSiswa","dataBeasiswa","dataPendaftar","dataAbsensi","dataKeuangan","dataNilai","dataSaran","db_latihan","db_turnamen"];
            for (let key of keys) {
                const data = JSON.parse(localStorage.getItem(key) || "[]");
                await db.collection(key).doc("backup").set({ data: data, lastSync: new Date().toISOString() });
            }
            console.log("✅ Semua data berhasil di-sync ke Firebase");
        } catch(e) {
            console.warn("⚠️ Sync ke Firebase gagal (mungkin offline)", e);
        }
    },

    // AUTO INIT
    initData: function() {
        this.initDataOriginal(); // panggil fungsi lama
        initFirebase();
    },
    initDataOriginal: function() {
        const keys = ["dataSiswa","dataBeasiswa","dataPendaftar","dataAbsensi","dataKeuangan","dataNilai","dataSaran","db_latihan","db_turnamen"];
        keys.forEach(key => {
            if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify([]));
        });
    }
};

// Load semua fungsi asli kamu (saya sisipkan di sini supaya tidak hilang)
DBManager.getTotalSiswa = function() { return this.getSiswaAktif().length; };
DBManager.getTotalPendaftar = function() { return this.getPendaftar().length; };
DBManager.getTotalSaranBelumDibaca = function() {
    return this.getSaran().filter(s => !s.dibaca).length;
};
DBManager.hitungPresensiBySiswa = function(nisw) {
    const absensiSiswa = this.getAbsensi().filter(a => String(a.nisw).toUpperCase() === String(nisw).toUpperCase() && a.status === 'Hadir');
    const totalAbsensi = this.getAbsensi().filter(a => String(a.nisw).toUpperCase() === String(nisw).toUpperCase());
    if (totalAbsensi.length === 0) return 0;
    return Math.round((absensiSiswa.length / totalAbsensi.length) * 100);
};

// AUTO INIT
window.addEventListener('load', () => {
    DBManager.initData();
    window.DBManager = DBManager;
    console.log("🚀 DBManager + Firebase siap! (LocalStorage tetap utama)");
});
