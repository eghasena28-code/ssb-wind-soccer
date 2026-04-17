// ==================== DBManager HYBRID - SSB Wind Soccer ====================
// Firebase + localStorage | April 2026 | Satu Database Firebase

const DBManager = {
    db: null,
    isFirebaseReady: false,

    // ====================== FIREBASE INIT ======================
    initFirebase: async function() {
        if (this.isFirebaseReady) return true;
        try {
            if (typeof firebase === 'undefined' || !firebase.firestore) {
                console.warn("Firebase SDK belum siap");
                return false;
            }
            this.db = firebase.firestore();
            this.isFirebaseReady = true;
            console.log("✅ Firebase Firestore connected - Hybrid Mode Active");
            return true;
        } catch (e) {
            console.error("Firebase init failed:", e);
            return false;
        }
    },

    // ====================== HELPER ======================
    getCollection: function(name) {
        return this.db ? this.db.collection(name) : null;
    },

    saveToBoth: async function(key, dataArray) {
        // Simpan ke localStorage (selalu)
        localStorage.setItem(key, JSON.stringify(dataArray));

        // Simpan ke Firebase jika siap
        if (this.isFirebaseReady) {
            try {
                await this.getCollection(key).doc("main").set({
                    data: dataArray,
                    lastUpdated: new Date().toISOString()
                });
                console.log(`✅ Synced to Firebase → ${key}`);
            } catch (e) {
                console.warn(`Firebase sync failed for ${key}`, e);
            }
        }
    },

    loadFromHybrid: async function(key) {
        // Ambil dari localStorage dulu
        let data = JSON.parse(localStorage.getItem(key) || "[]");

        // Coba ambil dari Firebase jika sudah siap
        if (this.isFirebaseReady) {
            try {
                const doc = await this.getCollection(key).doc("main").get();
                if (doc.exists) {
                    const fbData = doc.data().data || [];
                    // Gunakan data Firebase jika lebih banyak / lebih baru
                    if (fbData.length > data.length) {
                        data = fbData;
                        localStorage.setItem(key, JSON.stringify(data));
                        console.log(`🔄 Loaded from Firebase → ${key}`);
                    }
                }
            } catch (e) {
                console.warn(`Firebase load failed for ${key}`);
            }
        }
        return data;
    },

    // ====================== INIT ======================
    initData: async function() {
        const keys = ["dataSiswa", "dataBeasiswa", "dataPendaftar", "dataAbsensi", 
                     "dataKeuangan", "dataNilai", "dataSaran", "db_latihan", "db_turnamen"];

        keys.forEach(key => {
            if (!localStorage.getItem(key)) {
                localStorage.setItem(key, JSON.stringify([]));
            }
        });

        await this.initFirebase();
    },

    getTglSekarang: function() {
        const d = new Date();
        return `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()}`;
    },

    // ====================== LOGIN & SESSION ======================
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

    // ====================== SISWA ======================
    findSiswa: function(nisw) {
        const semua = this.getSiswaAktif();
        return semua.find(s => String(s.nisw).toUpperCase() === String(nisw).toUpperCase());
    },

    getSiswaAktif: function() {
        const reguler = JSON.parse(localStorage.getItem("dataSiswa") || "[]");
        const beasiswa = JSON.parse(localStorage.getItem("dataBeasiswa") || "[]");
        return [...reguler, ...beasiswa];
    },

    addSiswaAktif: async function(siswa) {
        const key = siswa.tipe === "Beasiswa" ? "dataBeasiswa" : "dataSiswa";
        let list = JSON.parse(localStorage.getItem(key) || "[]");
        list.push(siswa);
        await this.saveToBoth(key, list);
    },

    updateSiswaAktif: async function(nisw, updateData) {
        ["dataSiswa", "dataBeasiswa"].forEach(async (key) => {
            let list = JSON.parse(localStorage.getItem(key) || "[]");
            const idx = list.findIndex(s => String(s.nisw).toUpperCase() === String(nisw).toUpperCase());
            if (idx > -1) {
                list[idx] = { ...list[idx], ...updateData };
                await this.saveToBoth(key, list);
            }
        });
    },

    deleteSiswaAktif: async function(nisw) {
        ["dataSiswa", "dataBeasiswa"].forEach(async (key) => {
            let list = JSON.parse(localStorage.getItem(key) || "[]");
            list = list.filter(s => String(s.nisw).toUpperCase() !== String(nisw).toUpperCase());
            await this.saveToBoth(key, list);
        });
    },

    // ====================== PENDAFTAR ======================
    getPendaftar: function() {
        return JSON.parse(localStorage.getItem("dataPendaftar") || "[]");
    },

    addPendaftar: async function(data) {
        let list = this.getPendaftar();
        const total = this.getSiswaAktif().length + list.length + 1;
        const prefix = data.tipe === "Beasiswa" ? "B" : "R";
        data.nisw = prefix + new Date().getFullYear() + total.toString().padStart(3, '0');
        data.status = "Menunggu Verifikasi";
        data.tglDaftar = this.getTglSekarang();
        list.push(data);
        await this.saveToBoth("dataPendaftar", list);
        return data.nisw;
    },

    removePendaftar: async function(index) {
        let list = this.getPendaftar();
        list.splice(index, 1);
        await this.saveToBoth("dataPendaftar", list);
    },

    // ====================== ABSENSI ======================
    addAbsensi: async function(data) {
        let list = JSON.parse(localStorage.getItem("dataAbsensi") || "[]");
        list.push(data);
        await this.saveToBoth("dataAbsensi", list);
    },

    getAbsensi: function() {
        return JSON.parse(localStorage.getItem("dataAbsensi") || "[]");
    },

    deleteAbsensi: async function(index) {
        let list = this.getAbsensi();
        list.splice(index, 1);
        await this.saveToBoth("dataAbsensi", list);
    },

    // ====================== KEUANGAN ======================
    getKeuangan: function() {
        return JSON.parse(localStorage.getItem("dataKeuangan") || "[]");
    },

    addKeuangan: async function(data) {
        let list = this.getKeuangan();
        data.tgl = data.tgl || this.getTglSekarang();
        list.push(data);
        await this.saveToBoth("dataKeuangan", list);
    },

    // ====================== NILAI ======================
    getNilai: function() {
        return JSON.parse(localStorage.getItem("dataNilai") || "[]");
    },

    updateNilai: async function(nisw, dataNilai) {
        let list = this.getNilai();
        const idx = list.findIndex(n => String(n.nisw).toUpperCase() === String(nisw).toUpperCase());
        if (idx > -1) list[idx] = { ...list[idx], ...dataNilai };
        else list.push(dataNilai);
        await this.saveToBoth("dataNilai", list);
    },

    // ====================== SARAN ======================
    getSaran: function() {
        return JSON.parse(localStorage.getItem("dataSaran") || "[]");
    },

    addSaran: async function(data) {
        let list = this.getSaran();
        data.id = Date.now();
        data.waktu = this.getTglSekarang();
        data.dibaca = false;
        list.push(data);
        await this.saveToBoth("dataSaran", list);
    },

    // ====================== JADWAL ======================
    getJadwalLatihan: function() {
        return JSON.parse(localStorage.getItem("db_latihan") || "[]");
    },

    addJadwalLatihan: async function(data) {
        let list = this.getJadwalLatihan();
        data.id = Date.now();
        list.push(data);
        await this.saveToBoth("db_latihan", list);
    },

    getJadwalTurnamen: function() {
        return JSON.parse(localStorage.getItem("db_turnamen") || "[]");
    },

    addJadwalTurnamen: async function(data) {
        let list = this.getJadwalTurnamen();
        data.id = Date.now();
        list.push(data);
        await this.saveToBoth("db_turnamen", list);
    },

    // ====================== HELPER LAINNYA ======================
    getTotalSiswa: function() {
        return this.getSiswaAktif().length;
    },

    getTotalPendaftar: function() {
        return this.getPendaftar().length;
    },

    exportDataToFile: function() {
        const backup = {};
        ["dataSiswa","dataBeasiswa","dataPendaftar","dataAbsensi","dataKeuangan","dataNilai","dataSaran","db_latihan","db_turnamen"].forEach(key => {
            backup[key] = JSON.parse(localStorage.getItem(key) || "[]");
        });
        const dataStr = JSON.stringify(backup, null, 2);
        const blob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `SSB_Backup_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
    }
};

// ====================== AUTO INIT ======================
DBManager.initData().then(() => {
    window.DBManager = DBManager;
    console.log("🚀 DBManager HYBRID (Firebase + localStorage) AKTIF - Siap Publish!");
});
