// ==================== db-sync.js - FIXED & STABIL (17 April 2026) ====================
const DBManager = {
    getTglSekarang: function() {
        const d = new Date();
        return d.toISOString().split('T')[0]; // YYYY-MM-DD
    },

    formatTanggalPendek: function(tgl) {
        if (!tgl) return '-';
        const date = new Date(tgl);
        return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    },

    // ===================== SISWA AKTIF =====================
    getSiswaAktif: function() {
        return new Promise(resolve => {
            firebase.database().ref('siswaAktif').once('value', snap => {
                const data = snap.val();
                resolve(data ? Object.values(data) : []);
            });
        });
    },
    addSiswaAktif: function(data) {
        return firebase.database().ref('siswaAktif/' + data.nisw).set(data);
    },
    updateSiswaAktif: function(nisw, updates) {
        return firebase.database().ref('siswaAktif/' + nisw).update(updates);
    },
    deleteSiswaAktif: function(nisw) {
        return firebase.database().ref('siswaAktif/' + nisw).remove();ini kode db sekarang, analisa dengan benar jangan samapai kode error 
 
// ==================== DBManager FIREBASE - SSB Wind Soccer (April 2026) ====================
// Versi ini menggantikan LocalStorage dengan Firebase agar data sinkron di semua HP/Laptop
const DBManager = {
    db: firebase.database(),
    getTglSekarang: function() {
        const d = new Date();
        return `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()}`;
    },
    // ===== LOGIN & SESSION (Tetap di SessionStorage karena ini hanya untuk login sementara) =====
    setLoginUser: function(user) { sessionStorage.setItem("userAktif", JSON.stringify(user)); },
    getLoginUser: function() {
        const data = sessionStorage.getItem("userAktif");
        return data ? JSON.parse(data) : null;
    },
    clearLoginUser: function() { sessionStorage.removeItem("userAktif"); },
    // ===== SISWA (FIREBASE) =====
    getSiswaAktif: function(callback) {
        // Karena Firebase asinkron, kita pakai callback untuk kirim data ke UI
        this.db.ref('dataSiswa').on('value', (snap) => {
            const data = snap.val();
            callback(data ? Object.values(data) : []);
        });
    },
    addSiswaAktif: function(siswa) {
        return this.db.ref('dataSiswa/' + siswa.nisw).set(siswa);
    },
    // ===== PENDAFTAR (FIREBASE) =====
    getPendaftar: function(callback) {
        this.db.ref('dataPendaftar').on('value', (snap) => {
            const data = snap.val();
            callback(data ? Object.values(data) : []);
        });
    },
    addPendaftar: function(data) {
        const newRef = this.db.ref('dataPendaftar').push();
        const year = new Date().getFullYear();
        const prefix = data.tipe === "Beasiswa" ? "B" : "R";
       
        // ID unik Firebase digunakan sebagai kunci
        data.nisw = prefix + year + Math.floor(1000 + Math.random() * 9000);
        data.status = "Menunggu Verifikasi";
        data.tglDaftar = this.getTglSekarang();
        data.fbKey = newRef.key; // Simpan key untuk hapus/edit nanti
        return newRef.set(data).then(() => data.nisw);
    },
    removePendaftar: function(fbKey) {
        return this.db.ref('dataPendaftar/' + fbKey).remove();
    },
    // ===== KEUANGAN (FIREBASE) =====
    addKeuangan: function(data) {
        data.tgl = data.tgl || this.getTglSekarang();
        return this.db.ref('dataKeuangan').push(data);
    },
    getKeuangan: function(callback) {
        this.db.ref('dataKeuangan').on('value', (snap) => {
            callback(snap.val() ? Object.values(snap.val()) : []);
        });
    },
    // ===== NILAI RAPORT (FIREBASE) =====
    updateNilai: function(nisw, dataNilai) {
        return this.db.ref('dataNilai/' + nisw).set({
            ...dataNilai,
            lastUpdate: this.getTglSekarang()
        });
    },
    // ===== JADWAL LATIHAN (FIREBASE) =====
    getJadwalLatihan: function(callback) {
        this.db.ref('db_latihan').on('value', (snap) => {
            const defaultJadwal = [
                { id: 1, hari: "SELASA", tempat: "Stadion Mini Legok", waktu: "15.00 WIB" },
                { id: 2, hari: "KAMIS", tempat: "Stadion Mini Legok", waktu: "15.00 WIB" },
                { id: 3, hari: "MINGGU", tempat: "Lapangan Jaha", waktu: "07.00 WIB" }
            ];
            callback(snap.val() || defaultJadwal);
        });
    }
};
// Pasang di Window agar bisa diakses di semua file HTML
window.DBManager = DBManager;
console.log("🚀 DBManager FIREBASE ONLINE - SSB Wind Soccer");
    },
    findSiswa: function(nisw) {
        return new Promise(resolve => {
            firebase.database().ref('siswaAktif/' + nisw).once('value', snap => {
                resolve(snap.exists() ? snap.val() : null);
            });
        });
    },

    // ===================== PENDAFTAR =====================
    getPendaftar: function() {
        return new Promise(resolve => {
            firebase.database().ref('pendaftar').once('value', snap => {
                const data = snap.val();
                resolve(data ? Object.values(data) : []);
            });
        });
    },
    removePendaftar: function(index) {
        return this.getPendaftar().then(list => {
            if (index < 0 || index >= list.length) return;
            const key = list[index].fbKey || list[index].id || Object.keys(list[index])[0];
            return firebase.database().ref('pendaftar/' + key).remove();
        });
    },

    // ===================== KEUANGAN =====================
    getKeuangan: function() {
        return new Promise(resolve => {
            firebase.database().ref('keuangan').once('value', snap => {
                const data = snap.val();
                const arr = data ? Object.values(data) : [];
                arr.sort((a,b) => new Date(b.tgl) - new Date(a.tgl)); // terbaru dulu
                resolve(arr);
            });
        });
    },
    addKeuangan: function(data) {
        data.tgl = data.tgl || this.getTglSekarang();
        return firebase.database().ref('keuangan').push(data);
    },
    updateKeuangan: function(index, updates) {
        return this.getKeuangan().then(list => {
            if (index < 0 || index >= list.length) return;
            const key = list[index].key || Object.keys(list[index])[0];
            return firebase.database().ref('keuangan/' + key).update(updates);
        });
    },
    deleteKeuangan: function(index) {
        return this.getKeuangan().then(list => {
            if (index < 0 || index >= list.length) return;
            const key = list[index].key || Object.keys(list[index])[0];
            return firebase.database().ref('keuangan/' + key).remove();
        });
    },

    // ===================== ABSENSI =====================
    getAbsensi: function() {
        return new Promise(resolve => {
            firebase.database().ref('absensi').once('value', snap => {
                const data = snap.val();
                resolve(data ? Object.values(data) : []);
            });
        });
    },
    updateAbsensi: function(index, updates) {
        return this.getAbsensi().then(list => {
            if (index < 0 || index >= list.length) return;
            const key = list[index].key || Object.keys(list[index])[0];
            return firebase.database().ref('absensi/' + key).update(updates);
        });
    },
    deleteAbsensi: function(index) {
        return this.getAbsensi().then(list => {
            if (index < 0 || index >= list.length) return;
            const key = list[index].key || Object.keys(list[index])[0];
            return firebase.database().ref('absensi/' + key).remove();
        });
    },
    hitungPresensiBySiswa: function(nisw) {
        return new Promise(resolve => {
            firebase.database().ref('absensi').orderByChild('nisw').equalTo(nisw).once('value', snap => {
                let hadir = 0, total = 0;
                snap.forEach(child => {
                    total++;
                    if (child.val().status === "Hadir") hadir++;
                });
                resolve(total ? Math.round((hadir / total) * 100) : 0);
            });
        });
    },

    // ===================== SARAN =====================
    getSaran: function() {
        return new Promise(resolve => {
            firebase.database().ref('saran').once('value', snap => {
                const data = snap.val();
                resolve(data ? Object.values(data) : []);
            });
        });
    },
    getTotalSaranBelumDibaca: function() {
        return new Promise(resolve => {
            firebase.database().ref('saran').orderByChild('dibaca').equalTo(false).once('value', snap => {
                resolve(snap.numChildren());
            });
        });
    },
    markSaranAsDibaca: function(id) {
        return firebase.database().ref('saran/' + id).update({ dibaca: true });
    },
    deleteSaran: function(id) {
        return firebase.database().ref('saran/' + id).remove();
    },

    // ===================== JADWAL =====================
    getJadwalLatihan: function() {
        return new Promise(resolve => {
            firebase.database().ref('jadwalLatihan').once('value', snap => {
                const data = snap.val();
                const defaultJadwal = [
                    { id: 1, hari: "SELASA", tempat: "Stadion Mini Legok", waktu: "15.00 WIB" },
                    { id: 2, hari: "KAMIS", tempat: "Stadion Mini Legok", waktu: "15.00 WIB" },
                    { id: 3, hari: "MINGGU", tempat: "Lapangan Jaha", waktu: "07.00 WIB" }
                ];
                resolve(data ? Object.values(data) : defaultJadwal);
            });
        });
    },
    addJadwalLatihan: function(data) {
        return firebase.database().ref('jadwalLatihan').push(data);
    },
    updateJadwalLatihan: function(id, updates) {
        return firebase.database().ref('jadwalLatihan/' + id).update(updates);
    },
    deleteJadwalLatihan: function(id) {
        return firebase.database().ref('jadwalLatihan/' + id).remove();
    },

    getJadwalTurnamen: function() {
        return new Promise(resolve => {
            firebase.database().ref('jadwalTurnamen').once('value', snap => {
                const data = snap.val();
                resolve(data ? Object.values(data) : []);
            });
        });
    },
    addJadwalTurnamen: function(data) {
        return firebase.database().ref('jadwalTurnamen').push(data);
    },
    updateJadwalTurnamen: function(id, updates) {
        return firebase.database().ref('jadwalTurnamen/' + id).update(updates);
    },
    deleteJadwalTurnamen: function(id) {
        return firebase.database().ref('jadwalTurnamen/' + id).remove();
    },

    // ===================== TAGIHAN & NILAI =====================
    getTagihan: function(nisw) {
        return new Promise(resolve => {
            firebase.database().ref('tagihan/' + nisw).once('value', snap => {
                resolve(snap.exists() ? snap.val() : {
                    bulan: "April 2026", iuran: 150000, dendaAbsen: 0,
                    dendaTurnamen: 0, status: "Belum Lunas", keteranganDenda: ""
                });
            });
        });
    },
    saveTagihan: function(nisw, data) {
        return firebase.database().ref('tagihan/' + nisw).set(data);
    },

    simpanNilaiRaport: function(data) {
        return firebase.database().ref('nilaiRaport/' + data.nisw).set(data);
    }
};

