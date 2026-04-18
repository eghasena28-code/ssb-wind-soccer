// ==================== DBManager FULL FIRESTORE - SSB Wind Soccer ====================
// Versi Stabil - Pakai Firestore (18 April 2026)

const DBManager = {
    initData: function() {
        console.log("✅ Firebase Firestore SIAP - Full Cloud Mode");
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
        const db = firebase.firestore();
        Promise.all([
            db.collection("dataSiswa").get(),
            db.collection("dataBeasiswa").get()
        ]).then(([snap1, snap2]) => {
            const reguler = snap1.docs.map(doc => doc.data());
            const beasiswa = snap2.docs.map(doc => doc.data());
            callback([...reguler, ...beasiswa]);
        }).catch(err => {
            console.error("Error getSiswaAktif:", err);
            callback([]);
        });
    },

    addSiswaAktif: function(siswa, callback) {
        const db = firebase.firestore();
        const key = siswa.tipe === "Beasiswa" ? "dataBeasiswa" : "dataSiswa";
        db.collection(key).add(siswa).then(() => callback && callback(true));
    },

    updateSiswaAktif: function(nisw, updateData, callback) {
        const db = firebase.firestore();
        ["dataSiswa", "dataBeasiswa"].forEach(key => {
            db.collection(key).where("nisw", "==", String(nisw).toUpperCase())
                .get().then(snap => {
                    snap.forEach(doc => doc.ref.update(updateData).then(() => callback && callback(true)));
                });
        });
    },

    deleteSiswaAktif: function(nisw, callback) {
        const db = firebase.firestore();
        ["dataSiswa", "dataBeasiswa"].forEach(key => {
            db.collection(key).where("nisw", "==", String(nisw).toUpperCase())
                .get().then(snap => {
                    snap.forEach(doc => doc.ref.delete().then(() => callback && callback(true)));
                });
        });
    },

    // ====================== PENDAFTAR ======================
    getPendaftar: function(callback) {
        firebase.firestore().collection("dataPendaftar").get().then(snap => {
            callback(snap.docs.map(doc => doc.data()));
        });
    },

    addPendaftar: function(data, callback) {
        this.getSiswaAktif(siswaList => {
            const total = siswaList.length + 1;
            const prefix = data.tipe === "Beasiswa" ? "B" : "R";
            data.nisw = prefix + new Date().getFullYear() + total.toString().padStart(3, '0');
            data.status = "Menunggu Verifikasi";
            data.tglDaftar = this.getTglSekarang();

            firebase.firestore().collection("dataPendaftar").add(data).then(() => callback && callback(data.nisw));
        });
    },

    // ====================== FUNGSI LAINNYA ======================
    addAbsensi: function(data, callback) { 
        data.tgl = data.tgl || this.getTglSekarang(); 
        firebase.firestore().collection("dataAbsensi").add(data).then(() => callback && callback(true)); 
    },
    getAbsensi: function(callback) { 
        firebase.firestore().collection("dataAbsensi").get().then(snap => callback(snap.docs.map(doc => doc.data()))); 
    },
    addKeuangan: function(data, callback) { 
        data.tgl = data.tgl || this.getTglSekarang(); 
        firebase.firestore().collection("dataKeuangan").add(data).then(() => callback && callback(true)); 
    },
    getKeuangan: function(callback) { 
        firebase.firestore().collection("dataKeuangan").get().then(snap => callback(snap.docs.map(doc => doc.data()))); 
    },
    updateNilai: function(nisw, dataNilai, callback) { 
        firebase.firestore().collection("dataNilai").add(dataNilai).then(() => callback && callback(true)); 
    },
    getNilai: function(callback) { 
        firebase.firestore().collection("dataNilai").get().then(snap => callback(snap.docs.map(doc => doc.data()))); 
    },
    addSaran: function(data, callback) { 
        data.id = Date.now(); 
        data.waktu = this.getTglSekarang(); 
        data.dibaca = false; 
        firebase.firestore().collection("dataSaran").add(data).then(() => callback && callback(true)); 
    },
    getSaran: function(callback) { 
        firebase.firestore().collection("dataSaran").get().then(snap => callback(snap.docs.map(doc => doc.data()))); 
    },
    getJadwalLatihan: function(callback) { 
        firebase.firestore().collection("db_latihan").get().then(snap => callback(snap.docs.map(doc => doc.data()))); 
    },
    addJadwalLatihan: function(data, callback) { 
        data.id = Date.now(); 
        firebase.firestore().collection("db_latihan").add(data).then(() => callback && callback(true)); 
    },
    getJadwalTurnamen: function(callback) { 
        firebase.firestore().collection("db_turnamen").get().then(snap => callback(snap.docs.map(doc => doc.data()))); 
    },
    addJadwalTurnamen: function(data, callback) { 
        data.id = Date.now(); 
        firebase.firestore().collection("db_turnamen").add(data).then(() => callback && callback(true)); 
    }
};

// ====================== START APP ======================
function startApp() {
    DBManager.initData();
    window.DBManager = DBManager;
    console.log("🚀 DBManager FULL FIRESTORE AKTIF - Siap Publish!");
}
startApp();
