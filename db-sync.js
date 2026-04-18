// ==================== DBManager FULL FIREBASE REALTIME - SSB Wind Soccer ====================
// Versi Pure Cloud - Fix init error (18 April 2026)
const firebaseConfig = {
    apiKey: "AIzaSyD2BTJ2Nz3pu7Wx2bITPhLLIF3PnP0l4xk",
    authDomain: "ssb-wind-soccer-pro.firebaseapp.com",
    projectId: "ssb-wind-soccer-pro",
    storageBucket: "ssb-wind-soccer-pro.firebasestorage.app",
    messagingSenderId: "1080769161840",
    appId: "1:1080769161840:web:839f18578776bbc8d862b5"
};

firebase.initializeApp(firebaseConfig);   // ← Ini yang memperbaiki error
const db = firebase.database();

const DBManager = {
    initData: function() {
        console.log("✅ Firebase Realtime Database SIAP - Full Cloud Mode");
    },

    getTglSekarang: function() {
        const d = new Date();
        return `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()}`;
    },

    setLoginUser: function(user) { sessionStorage.setItem("userAktif", JSON.stringify(user)); },
    getLoginUser: function() {
        const data = sessionStorage.getItem("userAktif");
        return data ? JSON.parse(data) : null;
    },
    clearLoginUser: function() { sessionStorage.removeItem("userAktif"); },

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
        db.ref(key).push(siswa).then(() => callback && callback(true));
    },

    updateSiswaAktif: function(nisw, updateData, callback) {
        ["dataSiswa", "dataBeasiswa"].forEach(key => {
            db.ref(key).once('value', snap => {
                snap.forEach(child => {
                    if (String(child.val().nisw).toUpperCase() === String(nisw).toUpperCase()) {
                        child.ref.update(updateData).then(() => callback && callback(true));
                    }
                });
            });
        });
    },

    deleteSiswaAktif: function(nisw, callback) {
        ["dataSiswa", "dataBeasiswa"].forEach(key => {
            db.ref(key).once('value', snap => {
                snap.forEach(child => {
                    if (String(child.val().nisw).toUpperCase() === String(nisw).toUpperCase()) {
                        child.ref.remove().then(() => callback && callback(true));
                    }
                });
            });
        });
    },

    getPendaftar: function(callback) {
        db.ref('dataPendaftar').once('value').then(snap => callback(snap.val() ? Object.values(snap.val()) : []));
    },

    addPendaftar: function(data, callback) {
        this.getSiswaAktif(siswaList => {
            const total = siswaList.length + 1;
            const prefix = data.tipe === "Beasiswa" ? "B" : "R";
            data.nisw = prefix + new Date().getFullYear() + total.toString().padStart(3, '0');
            data.status = "Menunggu Verifikasi";
            data.tglDaftar = this.getTglSekarang();
            db.ref('dataPendaftar').push(data).then(() => callback && callback(data.nisw));
        });
    },

    // (fungsi lain disingkat agar cepat — nanti kita tambah kalau perlu)
    addAbsensi: function(data, callback) { data.tgl = data.tgl || this.getTglSekarang(); db.ref('dataAbsensi').push(data).then(() => callback && callback(true)); },
    getAbsensi: function(callback) { db.ref('dataAbsensi').once('value').then(snap => callback(snap.val() ? Object.values(snap.val()) : [])); },
    addKeuangan: function(data, callback) { data.tgl = data.tgl || this.getTglSekarang(); db.ref('dataKeuangan').push(data).then(() => callback && callback(true)); },
    getKeuangan: function(callback) { db.ref('dataKeuangan').once('value').then(snap => callback(snap.val() ? Object.values(snap.val()) : [])); },
    updateNilai: function(nisw, dataNilai, callback) { db.ref('dataNilai').push(dataNilai).then(() => callback && callback(true)); },
    getNilai: function(callback) { db.ref('dataNilai').once('value').then(snap => callback(snap.val() ? Object.values(snap.val()) : [])); },
    addSaran: function(data, callback) { data.id = Date.now(); data.waktu = this.getTglSekarang(); data.dibaca = false; db.ref('dataSaran').push(data).then(() => callback && callback(true)); },
    getSaran: function(callback) { db.ref('dataSaran').once('value').then(snap => callback(snap.val() ? Object.values(snap.val()) : [])); },
    getJadwalLatihan: function(callback) { db.ref('db_latihan').once('value').then(snap => callback(snap.val() ? Object.values(snap.val()) : [])); },
    addJadwalLatihan: function(data, callback) { data.id = Date.now(); db.ref('db_latihan').push(data).then(() => callback && callback(true)); },
    getJadwalTurnamen: function(callback) { db.ref('db_turnamen').once('value').then(snap => callback(snap.val() ? Object.values(snap.val()) : [])); },
    addJadwalTurnamen: function(data, callback) { data.id = Date.now(); db.ref('db_turnamen').push(data).then(() => callback && callback(true)); }
};

// ====================== START ======================
function startApp() {
    DBManager.initData();
    window.DBManager = DBManager;
    console.log("🚀 DBManager FULL FIREBASE AKTIF - Siap Publish!");
}
startApp();
