// ==================== DBManager FULL FIREBASE REALTIME - SSB Wind Soccer ====================
// Versi BERSIH - Tidak deklarasi ulang firebaseConfig (18 April 2026)
// firebase-config.js sudah handle initializeApp

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
            firebase.database().ref('dataSiswa').once('value'),
            firebase.database().ref('dataBeasiswa').once('value')
        ]).then(([snap1, snap2]) => {
            const reguler = snap1.val() ? Object.values(snap1.val()) : [];
            const beasiswa = snap2.val() ? Object.values(snap2.val()) : [];
            callback([...reguler, ...beasiswa]);
        });
    },

    addSiswaAktif: function(siswa, callback) {
        const key = siswa.tipe === "Beasiswa" ? "dataBeasiswa" : "dataSiswa";
        firebase.database().ref(key).push(siswa).then(() => callback && callback(true));
    },

    updateSiswaAktif: function(nisw, updateData, callback) {
        ["dataSiswa", "dataBeasiswa"].forEach(key => {
            firebase.database().ref(key).once('value', snap => {
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
            firebase.database().ref(key).once('value', snap => {
                snap.forEach(child => {
                    if (String(child.val().nisw).toUpperCase() === String(nisw).toUpperCase()) {
                        child.ref.remove().then(() => callback && callback(true));
                    }
                });
            });
        });
    },

    // ====================== PENDAFTAR ======================
    getPendaftar: function(callback) {
        firebase.database().ref('dataPendaftar').once('value').then(snap => {
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
            firebase.database().ref('dataPendaftar').push(data).then(() => callback && callback(data.nisw));
        });
    },

    // ====================== FUNGSI LAINNYA ======================
    addAbsensi: function(data, callback) { 
        data.tgl = data.tgl || this.getTglSekarang(); 
        firebase.database().ref('dataAbsensi').push(data).then(() => callback && callback(true)); 
    },
    getAbsensi: function(callback) { 
        firebase.database().ref('dataAbsensi').once('value').then(snap => callback(snap.val() ? Object.values(snap.val()) : [])); 
    },
    addKeuangan: function(data, callback) { 
        data.tgl = data.tgl || this.getTglSekarang(); 
        firebase.database().ref('dataKeuangan').push(data).then(() => callback && callback(true)); 
    },
    getKeuangan: function(callback) { 
        firebase.database().ref('dataKeuangan').once('value').then(snap => callback(snap.val() ? Object.values(snap.val()) : [])); 
    },
    updateNilai: function(nisw, dataNilai, callback) { 
        firebase.database().ref('dataNilai').push(dataNilai).then(() => callback && callback(true)); 
    },
    getNilai: function(callback) { 
        firebase.database().ref('dataNilai').once('value').then(snap => callback(snap.val() ? Object.values(snap.val()) : [])); 
    },
    addSaran: function(data, callback) { 
        data.id = Date.now(); 
        data.waktu = this.getTglSekarang(); 
        data.dibaca = false; 
        firebase.database().ref('dataSaran').push(data).then(() => callback && callback(true)); 
    },
    getSaran: function(callback) { 
        firebase.database().ref('dataSaran').once('value').then(snap => callback(snap.val() ? Object.values(snap.val()) : [])); 
    },
    getJadwalLatihan: function(callback) { 
        firebase.database().ref('db_latihan').once('value').then(snap => callback(snap.val() ? Object.values(snap.val()) : [])); 
    },
    addJadwalLatihan: function(data, callback) { 
        data.id = Date.now(); 
        firebase.database().ref('db_latihan').push(data).then(() => callback && callback(true)); 
    },
    getJadwalTurnamen: function(callback) { 
        firebase.database().ref('db_turnamen').once('value').then(snap => callback(snap.val() ? Object.values(snap.val()) : [])); 
    },
    addJadwalTurnamen: function(data, callback) { 
        data.id = Date.now(); 
        firebase.database().ref('db_turnamen').push(data).then(() => callback && callback(true)); 
    }
};

// ====================== START APP ======================
function startApp() {
    DBManager.initData();
    window.DBManager = DBManager;
    console.log("🚀 DBManager FULL FIREBASE AKTIF - Siap Publish!");
}
startApp();
