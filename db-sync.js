// ==================== DBManager FULL FIREBASE REALTIME - SSB Wind Soccer ====================
// Versi Pure Cloud - Siap Publish 18 April 2026
const firebaseConfig = {
    apiKey: "AIzaSyD2BTJ2Nz3pu7Wx2bITPhLLIF3PnP0l4xk",
    authDomain: "ssb-wind-soccer-pro.firebaseapp.com",
    projectId: "ssb-wind-soccer-pro",
    storageBucket: "ssb-wind-soccer-pro.firebasestorage.app",
    messagingSenderId: "1080769161840",
    appId: "1:1080769161840:web:839f18578776bbc8d862b5"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const DBManager = {
    initData: function() {
        console.log("✅ Firebase Realtime Database SIAP - Full Cloud Mode");
    },

    getTglSekarang: function() {
        const d = new Date();
        return `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()}`;
    },

    // Login Session
    setLoginUser: function(user) { sessionStorage.setItem("userAktif", JSON.stringify(user)); },
    getLoginUser: function() {
        const data = sessionStorage.getItem("userAktif");
        return data ? JSON.parse(data) : null;
    },
    clearLoginUser: function() { sessionStorage.removeItem("userAktif"); },

    // ====================== SISWA ======================
    getSiswaAktif: function(callback) {
        Promise.all([
            db.ref('dataSiswa').once('value'),
            db.ref('dataBeasiswa').once('value')
        ]).then(([snap1, snap2]) => {
            const reguler = snap1.val() ? Object.values(snap1.val()) : [];
            const beasiswa = snap2.val() ? Object.values(snap2.val()) : [];
            callback([...reguler, ...beasiswa]);
        });
    },

    addSiswaAktif: function(siswa, callback) {
        const key = siswa.tipe === "Beasiswa" ? "dataBeasiswa" : "dataSiswa";
        db.ref(key).push(siswa).then(() => {
            if (callback) callback(true);
        });
    },

    updateSiswaAktif: function(nisw, updateData, callback) {
        const keys = ["dataSiswa", "dataBeasiswa"];
        let updated = false;
        keys.forEach(key => {
            db.ref(key).once('value', snap => {
                snap.forEach(child => {
                    if (String(child.val().nisw).toUpperCase() === String(nisw).toUpperCase()) {
                        child.ref.update(updateData).then(() => {
                            updated = true;
                            if (callback) callback(true);
                        });
                    }
                });
            });
        });
    },

    deleteSiswaAktif: function(nisw, callback) {
        const keys = ["dataSiswa", "dataBeasiswa"];
        let deleted = false;
        keys.forEach(key => {
            db.ref(key).once('value', snap => {
                snap.forEach(child => {
                    if (String(child.val().nisw).toUpperCase() === String(nisw).toUpperCase()) {
                        child.ref.remove().then(() => {
                            deleted = true;
                            if (callback) callback(true);
                        });
                    }
                });
            });
        });
    },

    // ====================== PENDAFTAR ======================
    getPendaftar: function(callback) {
        db.ref('dataPendaftar').once('value').then(snap => {
            callback(snap.val() ? Object.values(snap.val()) : []);
        });
    },

    addPendaftar: function(data, callback) {
        this.getSiswaAktif(siswaList => {
            const total = siswaList.length + 1;
            const prefix = data.tipe === "Beasiswa" ? "B" : "R";
            data.nisw = prefix + new Date().getFullYear() + total.toString().padStart(3, '0');
            data.status = "Menunggu Verifikasi";
            data.tglDaftar = this.getTglSekarang();

            db.ref('dataPendaftar').push(data).then(() => {
                if (callback) callback(data.nisw);
            });
        });
    },

    // ====================== ABSENSI ======================
    addAbsensi: function(data, callback) {
        data.tgl = data.tgl || this.getTglSekarang();
        db.ref('dataAbsensi').push(data).then(() => {
            if (callback) callback(true);
        });
    },

    getAbsensi: function(callback) {
        db.ref('dataAbsensi').once('value').then(snap => {
            callback(snap.val() ? Object.values(snap.val()) : []);
        });
    },

    // ====================== KEUANGAN ======================
    addKeuangan: function(data, callback) {
        data.tgl = data.tgl || this.getTglSekarang();
        db.ref('dataKeuangan').push(data).then(() => {
            if (callback) callback(true);
        });
    },

    getKeuangan: function(callback) {
        db.ref('dataKeuangan').once('value').then(snap => {
            callback(snap.val() ? Object.values(snap.val()) : []);
        });
    },

    // ====================== NILAI / RAPORT ======================
    updateNilai: function(nisw, dataNilai, callback) {
        db.ref('dataNilai').once('value', snap => {
            let found = false;
            snap.forEach(child => {
                if (String(child.val().nisw).toUpperCase() === String(nisw).toUpperCase()) {
                    child.ref.update(dataNilai).then(() => {
                        found = true;
                        if (callback) callback(true);
                    });
                }
            });
            if (!found) {
                db.ref('dataNilai').push(dataNilai).then(() => {
                    if (callback) callback(true);
                });
            }
        });
    },

    getNilai: function(callback) {
        db.ref('dataNilai').once('value').then(snap => {
            callback(snap.val() ? Object.values(snap.val()) : []);
        });
    },

    // ====================== SARAN ======================
    addSaran: function(data, callback) {
        data.id = Date.now();
        data.waktu = this.getTglSekarang();
        data.dibaca = false;
        db.ref('dataSaran').push(data).then(() => {
            if (callback) callback(true);
        });
    },

    getSaran: function(callback) {
        db.ref('dataSaran').once('value').then(snap => {
            callback(snap.val() ? Object.values(snap.val()) : []);
        });
    },

    // ====================== JADWAL ======================
    getJadwalLatihan: function(callback) {
        db.ref('db_latihan').once('value').then(snap => {
            callback(snap.val() ? Object.values(snap.val()) : []);
        });
    },

    addJadwalLatihan: function(data, callback) {
        data.id = Date.now();
        db.ref('db_latihan').push(data).then(() => {
            if (callback) callback(true);
        });
    },

    getJadwalTurnamen: function(callback) {
        db.ref('db_turnamen').once('value').then(snap => {
            callback(snap.val() ? Object.values(snap.val()) : []);
        });
    },

    addJadwalTurnamen: function(data, callback) {
        data.id = Date.now();
        db.ref('db_turnamen').push(data).then(() => {
            if (callback) callback(true);
        });
    },

    getTotalSiswa: function(callback) {
        this.getSiswaAktif(list => callback(list.length));
    },

    // Backup (opsional)
    exportDataToFile: function() {
        // Bisa dikembangkan nanti
        alert("Export backup akan ditambahkan di step berikutnya");
    }
};

// ====================== START APP ======================
function startApp() {
    DBManager.initData();
    window.DBManager = DBManager;
    console.log("🚀 DBManager FULL FIREBASE AKTIF - Siap Publish!");
}

startApp();
