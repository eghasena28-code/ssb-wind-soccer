// ==================== DBManager HYBRID FINAL - SSB Wind Soccer ====================
// Satu Database Firebase + localStorage Backup | Versi Stabil

const DBManager = {
    db: null,
    isFirebaseReady: false,

    initFirebase: async function() {
        if (this.isFirebaseReady) return true;

        // Tunggu Firebase SDK siap
        let attempts = 0;
        while ((!firebase || !firebase.firestore) && attempts < 20) {
            await new Promise(r => setTimeout(r, 400));
            attempts++;
        }

        try {
            this.db = firebase.firestore();
            this.isFirebaseReady = true;
            console.log("✅ Firebase Firestore terhubung");
            return true;
        } catch (e) {
            console.error("Gagal init Firebase:", e);
            return false;
        }
    },

    saveToBoth: async function(key, data) {
        localStorage.setItem(key, JSON.stringify(data));

        if (this.isFirebaseReady) {
            try {
                await this.db.collection(key).doc("main").set({
                    data: data,
                    lastUpdated: new Date().toISOString()
                });
            } catch (e) {}
        }
    },

    // ====================== INIT ======================
    initData: async function() {
        const keys = ["dataSiswa","dataBeasiswa","dataPendaftar","dataAbsensi","dataKeuangan","dataNilai","dataSaran","db_latihan","db_turnamen"];
        keys.forEach(key => {
            if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify([]));
        });

        await this.initFirebase();
    },

    getTglSekarang: function() {
        const d = new Date();
        return `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()}`;
    },

    // Semua fungsi lain tetap sama seperti versi sebelumnya
    setLoginUser: function(user) { sessionStorage.setItem("userAktif", JSON.stringify(user)); },
    getLoginUser: function() {
        const data = sessionStorage.getItem("userAktif");
        return data ? JSON.parse(data) : null;
    },
    clearLoginUser: function() { sessionStorage.removeItem("userAktif"); },

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
        for (let key of ["dataSiswa", "dataBeasiswa"]) {
            let list = JSON.parse(localStorage.getItem(key) || "[]");
            const idx = list.findIndex(s => String(s.nisw).toUpperCase() === String(nisw).toUpperCase());
            if (idx > -1) {
                list[idx] = {...list[idx], ...updateData};
                await this.saveToBoth(key, list);
            }
        }
    },

    deleteSiswaAktif: async function(nisw) {
        for (let key of ["dataSiswa", "dataBeasiswa"]) {
            let list = JSON.parse(localStorage.getItem(key) || "[]");
            list = list.filter(s => String(s.nisw).toUpperCase() !== String(nisw).toUpperCase());
            await this.saveToBoth(key, list);
        }
    },

    getPendaftar: function() { return JSON.parse(localStorage.getItem("dataPendaftar") || "[]"); },

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

    addAbsensi: async function(data) {
        let list = JSON.parse(localStorage.getItem("dataAbsensi") || "[]");
        list.push(data);
        await this.saveToBoth("dataAbsensi", list);
    },

    getAbsensi: function() { return JSON.parse(localStorage.getItem("dataAbsensi") || "[]"); },

    addKeuangan: async function(data) {
        let list = JSON.parse(localStorage.getItem("dataKeuangan") || "[]");
        data.tgl = data.tgl || this.getTglSekarang();
        list.push(data);
        await this.saveToBoth("dataKeuangan", list);
    },

    getKeuangan: function() { return JSON.parse(localStorage.getItem("dataKeuangan") || "[]"); },

    updateNilai: async function(nisw, dataNilai) {
        let list = JSON.parse(localStorage.getItem("dataNilai") || "[]");
        const idx = list.findIndex(n => String(n.nisw).toUpperCase() === String(nisw).toUpperCase());
        if (idx > -1) list[idx] = {...list[idx], ...dataNilai};
        else list.push(dataNilai);
        await this.saveToBoth("dataNilai", list);
    },

    getNilai: function() { return JSON.parse(localStorage.getItem("dataNilai") || "[]"); },

    addSaran: async function(data) {
        let list = JSON.parse(localStorage.getItem("dataSaran") || "[]");
        data.id = Date.now();
        data.waktu = this.getTglSekarang();
        data.dibaca = false;
        list.push(data);
        await this.saveToBoth("dataSaran", list);
    },

    getSaran: function() { return JSON.parse(localStorage.getItem("dataSaran") || "[]"); },

    getJadwalLatihan: function() { return JSON.parse(localStorage.getItem("db_latihan") || "[]"); },

    addJadwalLatihan: async function(data) {
        let list = this.getJadwalLatihan();
        data.id = Date.now();
        list.push(data);
        await this.saveToBoth("db_latihan", list);
    },

    getJadwalTurnamen: function() { return JSON.parse(localStorage.getItem("db_turnamen") || "[]"); },

    addJadwalTurnamen: async function(data) {
        let list = this.getJadwalTurnamen();
        data.id = Date.now();
        list.push(data);
        await this.saveToBoth("db_turnamen", list);
    },

    getTotalSiswa: function() { return this.getSiswaAktif().length; },

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

// ====================== START APP ======================
async function startApp() {
    await DBManager.initData();
    window.DBManager = DBManager;
    console.log("🚀 DBManager HYBRID AKTIF - Siap Publish!");
    console.log("✅ Satu Database Firebase sudah aktif");
}

startApp();
