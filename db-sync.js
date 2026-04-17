// ==================== DBManager HYBRID - SSB Wind Soccer (Firebase + localStorage) ====================
// Versi April 2026 - Satu Database Firebase

const DBManager = {
    // ====================== FIREBASE INTEGRATION ======================
    db: null,
    isFirebaseReady: false,

    initFirebase: async function() {
        if (this.isFirebaseReady) return true;
        
        try {
            if (typeof firebase === 'undefined' || typeof firebase.firestore === 'undefined') {
                console.warn("Firebase SDK belum dimuat");
                return false;
            }

            this.db = firebase.firestore();
            this.isFirebaseReady = true;
            console.log("✅ Firebase Firestore terhubung (Hybrid Mode)");
            return true;
        } catch (e) {
            console.error("Gagal init Firebase:", e);
            return false;
        }
    },

    // ====================== HELPER FIREBASE ======================
    getCollection: function(collectionName) {
        if (!this.db) return null;
        return this.db.collection(collectionName);
    },

    // Save to both localStorage and Firebase
    saveToBoth: async function(key, data) {
        // Save to localStorage (backup)
        localStorage.setItem(key, JSON.stringify(data));

        // Save to Firebase (jika sudah ready)
        if (this.isFirebaseReady) {
            try {
                const collection = this.getCollection(key);
                if (collection) {
                    // Untuk simplicity, kita simpan sebagai document dengan id "main"
                    await collection.doc("main").set({ data: data, lastUpdated: new Date().toISOString() });
                    console.log(`✅ Synced to Firebase: ${key}`);
                }
            } catch (e) {
                console.warn(`Gagal sync ke Firebase ${key}:`, e);
            }
        }
    },

    // Load from localStorage first, then try Firebase
    loadFromHybrid: async function(key) {
        // Prioritas 1: localStorage
        let data = JSON.parse(localStorage.getItem(key) || "[]");

        // Prioritas 2: Coba ambil dari Firebase jika ready
        if (this.isFirebaseReady) {
            try {
                const collection = this.getCollection(key);
                const doc = await collection.doc("main").get();
                if (doc.exists) {
                    const firebaseData = doc.data().data || [];
                    // Merge jika Firebase lebih baru
                    if (firebaseData.length > data.length) {
                        data = firebaseData;
                        localStorage.setItem(key, JSON.stringify(data));
                        console.log(`🔄 Updated from Firebase: ${key}`);
                    }
                }
            } catch (e) {
                console.warn(`Gagal load dari Firebase ${key}`);
            }
        }
        return data;
    },

    // ====================== INIT DATA ======================
    initData: async function() {
        const keys = ["dataSiswa","dataBeasiswa","dataPendaftar","dataAbsensi","dataKeuangan","dataNilai","dataSaran","db_latihan","db_turnamen"];
        
        // Init localStorage dulu
        keys.forEach(key => {
            if (!localStorage.getItem(key)) {
                localStorage.setItem(key, JSON.stringify([]));
            }
        });

        // Init Firebase
        await this.initFirebase();
    },

    getTglSekarang: function() {
        const d = new Date();
        return `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()}`;
    },

    // ====================== LOGIN & SESSION (tetap sama) ======================
    setLoginUser: function(user) { 
        sessionStorage.setItem("userAktif", JSON.stringify(user)); 
    },
    getLoginUser: function() {
        const data = sessionStorage.getItem("userAktif");
        return data ? JSON.parse(data) : null;
    },
    clearLoginUser: function() { sessionStorage.removeItem("userAktif"); },

    // ====================== SISWA (Reguler & Beasiswa) ======================
    findSiswa: function(nisw) {
        const semua = [...this.getSiswaAktif()];
        return semua.find(s => String(s.nisw).toUpperCase() === String(nisw).toUpperCase());
    },

    getSiswaAktif: async function() {
        const reguler = await this.loadFromHybrid("dataSiswa");
        const beasiswa = await this.loadFromHybrid("dataBeasiswa");
        return [...reguler, ...beasiswa];
    },

    addSiswaAktif: async function(siswa) {
        const key = siswa.tipe === "Beasiswa" ? "dataBeasiswa" : "dataSiswa";
        let list = await this.loadFromHybrid(key);
        list.push(siswa);
        await this.saveToBoth(key, list);
        return true;
    },

    // ... (saya akan lengkapi semua fungsi di versi final)

    // Untuk sementara ini, kita pakai versi hybrid dasar dulu
    // Saya akan kasih versi lengkap setelah kamu konfirmasi

    // ====================== BACKUP & RESTORE (tetap sama) ======================
    backupAllData: function() {
        const backup = {};
        ["dataSiswa","dataBeasiswa","dataPendaftar","dataAbsensi","dataKeuangan","dataNilai","dataSaran","db_latihan","db_turnamen"].forEach(key => {
            backup[key] = JSON.parse(localStorage.getItem(key) || "[]");
        });
        return JSON.stringify(backup, null, 2);
    },

    exportDataToFile: function() {
        const dataStr = this.backupAllData();
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `SSB_Backup_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
    }
};

// AUTO INIT
DBManager.initData().then(() => {
    window.DBManager = DBManager;
    console.log("🚀 DBManager HYBRID (Firebase + localStorage) sudah aktif!");
});
