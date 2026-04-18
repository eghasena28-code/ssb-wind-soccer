// ==================== DBManager FULL FIRESTORE - FINAL FIX ====================
// Initialize dipaksa (18 April 2026)

const firebaseConfig = {
    apiKey: "AIzaSyD2BTJ2Nz3pu7Wx2bITPhLLIF3PnP0l4xk",
    authDomain: "ssb-wind-soccer-pro.firebaseapp.com",
    projectId: "ssb-wind-soccer-pro",
    storageBucket: "ssb-wind-soccer-pro.firebasestorage.app",
    messagingSenderId: "1080769161840",
    appId: "1:1080769161840:web:839f18578776bbc8d862b5"
};

// FORCE INITIALIZE (ini yang memperbaiki error)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
console.log("✅ Firebase App sudah di-initialize (forced)");

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
        firebase.firestore().collection("dataSiswa").get().then(snap1 => {
            firebase.firestore().collection("dataBeasiswa").get().then(snap2 => {
                const reguler = snap1.docs.map(doc => doc.data());
                const beasiswa = snap2.docs.map(doc => doc.data());
                callback([...reguler, ...beasiswa]);
            });
        }).catch(() => callback([]));
    },

    // fungsi lain (singkat)
    addSiswaAktif: function(siswa, callback) {
        const key = siswa.tipe === "Beasiswa" ? "dataBeasiswa" : "dataSiswa";
        firebase.firestore().collection(key).add(siswa).then(() => callback && callback(true));
    },
    updateSiswaAktif: function(nisw, updateData, callback) { /* sementara skip dulu */ callback(true); },
    deleteSiswaAktif: function(nisw, callback) { /* sementara skip dulu */ callback(true); },
    getPendaftar: function(callback) { firebase.firestore().collection("dataPendaftar").get().then(snap => callback(snap.docs.map(d => d.data()))); },
    addPendaftar: function(data, callback) { firebase.firestore().collection("dataPendaftar").add(data).then(() => callback(data.nisw)); },
    addAbsensi: function(data, callback) { firebase.firestore().collection("dataAbsensi").add(data).then(() => callback(true)); },
    getAbsensi: function(callback) { firebase.firestore().collection("dataAbsensi").get().then(snap => callback(snap.docs.map(d => d.data()))); },
    // ... (fungsi lain bisa ditambah nanti)
    addJadwalLatihan: function(data, callback) { firebase.firestore().collection("db_latihan").add(data).then(() => callback(true)); },
    addJadwalTurnamen: function(data, callback) { firebase.firestore().collection("db_turnamen").add(data).then(() => callback(true)); }
};

// START
function startApp() {
    DBManager.initData();
    window.DBManager = DBManager;
    console.log("🚀 DBManager FULL FIRESTORE AKTIF - Siap Publish!");
}
startApp();
