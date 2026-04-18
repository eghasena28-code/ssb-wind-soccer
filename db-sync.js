// ==================== DBManager FULL FIRESTORE - CLEAN (No duplicate) ====================
const DBManager = {
    initData: function() {
        console.log("✅ Firebase Firestore SIAP - Full Cloud Mode");
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
        firebase.firestore().collection("dataSiswa").get().then(s1 => {
            firebase.firestore().collection("dataBeasiswa").get().then(s2 => {
                callback([...s1.docs.map(d=>d.data()), ...s2.docs.map(d=>d.data())]);
            });
        }).catch(() => callback([]));
    },

    addSiswaAktif: function(siswa, callback) {
        const key = siswa.tipe === "Beasiswa" ? "dataBeasiswa" : "dataSiswa";
        firebase.firestore().collection(key).add(siswa).then(() => callback && callback(true));
    },

    // Fungsi lain (minimal dulu)
    getPendaftar: function(callback) { firebase.firestore().collection("dataPendaftar").get().then(s => callback(s.docs.map(d => d.data()))); },
    addPendaftar: function(data, callback) { firebase.firestore().collection("dataPendaftar").add(data).then(() => callback && callback(data.nisw)); },
    addAbsensi: function(data, callback) { firebase.firestore().collection("dataAbsensi").add(data).then(() => callback && callback(true)); },
    getAbsensi: function(callback) { firebase.firestore().collection("dataAbsensi").get().then(s => callback(s.docs.map(d => d.data()))); },
    addKeuangan: function(data, callback) { firebase.firestore().collection("dataKeuangan").add(data).then(() => callback && callback(true)); },
    getKeuangan: function(callback) { firebase.firestore().collection("dataKeuangan").get().then(s => callback(s.docs.map(d => d.data()))); },
    updateNilai: function(nisw, dataNilai, callback) { firebase.firestore().collection("dataNilai").add(dataNilai).then(() => callback && callback(true)); },
    getNilai: function(callback) { firebase.firestore().collection("dataNilai").get().then(s => callback(s.docs.map(d => d.data()))); },
    addSaran: function(data, callback) { firebase.firestore().collection("dataSaran").add(data).then(() => callback && callback(true)); },
    getSaran: function(callback) { firebase.firestore().collection("dataSaran").get().then(s => callback(s.docs.map(d => d.data()))); },
    getJadwalLatihan: function(callback) { firebase.firestore().collection("db_latihan").get().then(s => callback(s.docs.map(d => d.data()))); },
    addJadwalLatihan: function(data, callback) { firebase.firestore().collection("db_latihan").add(data).then(() => callback && callback(true)); },
    getJadwalTurnamen: function(callback) { firebase.firestore().collection("db_turnamen").get().then(s => callback(s.docs.map(d => d.data()))); },
    addJadwalTurnamen: function(data, callback) { firebase.firestore().collection("db_turnamen").add(data).then(() => callback && callback(true)); }
};

function startApp() {
    DBManager.initData();
    window.DBManager = DBManager;
    console.log("🚀 DBManager FULL FIRESTORE AKTIF - Siap Publish!");
}
startApp();
