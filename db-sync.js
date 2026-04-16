// ==================== db-sync.js (REALTIME DATABASE - FIXED & LENGKAP) ====================
// Versi April 2026 - Siap pakai dengan admin.html

const DBManager = {
    // Helper tanggal
    getTglSekarang: function() {
        const d = new Date();
        return d.toISOString().split('T')[0]; // format YYYY-MM-DD (standar)
    },

    formatTanggalPendek: function(tgl) {
        if (!tgl) return '-';
        const date = new Date(tgl);
        return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    },

    // ================== SISWA AKTIF ==================
    getSiswaAktif: function() {
        return new Promise((resolve) => {
            firebase.database().ref('siswaAktif').once('value', (snap) => {
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
        return firebase.database().ref('siswaAktif/' + nisw).remove();
    },
    findSiswa: function(nisw) {
        return new Promise((resolve) => {
            firebase.database().ref('siswaAktif/' + nisw).once('value', (snap) => {
                resolve(snap.exists() ? snap.val() : null);
            });
        });
    },

    // ================== PENDAFTAR ==================
    getPendaftar: function() {
        return new Promise((resolve) => {
            firebase.database().ref('pendaftar').once('value', (snap) => {
                const data = snap.val();
                resolve(data ? Object.values(data) : []);
            });
        });
    },
    removePendaftar: function(index) {
        // index diambil dari array hasil getPendaftar()
        return this.getPendaftar().then(list => {
            if (index < 0 || index >= list.length) return;
            const fbKey = list[index].fbKey || list[index].id;
            return firebase.database().ref('pendaftar/' + fbKey).remove();
        });
    },

    // ================== KEUANGAN ==================
    getKeuangan: function() {
        return new Promise((resolve) => {
            firebase.database().ref('keuangan').orderByChild('tgl').once('value', (snap) => {
                const data = snap.val();
                const arr = data ? Object.values(data) : [];
                arr.reverse(); // terbaru di atas
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
            const key = list[index].id || Object.keys(firebase.database().ref('keuangan').once('value')).find(k => firebase.database().ref('keuangan/' + k).val() === list[index]);
            return firebase.database().ref('keuangan/' + list[index].key).update(updates); // pakai .key jika push
        });
    },
    deleteKeuangan: function(index) {
        return this.getKeuangan().then(list => {
            if (index < 0 || index >= list.length) return;
            return firebase.database().ref('keuangan/' + list[index].key).remove();
        });
    },

    // ================== ABSENSI ==================
    getAbsensi: function() {
        return new Promise((resolve) => {
            firebase.database().ref('absensi').orderByChild('tanggal').once('value', (snap) => {
                const data = snap.val();
                resolve(data ? Object.values(data) : []);
            });
        });
    },
    updateAbsensi: function(index, updates) {
        return this.getAbsensi().then(list => {
            if (index < 0 || index >= list.length) return;
            return firebase.database().ref('absensi/' + list[index].key).update(updates);
        });
    },
    deleteAbsensi: function(index) {
        return this.getAbsensi().then(list => {
            if (index < 0 || index >= list.length) return;
            return firebase.database().ref('absensi/' + list[index].key).remove();
        });
    },
    hitungPresensiBySiswa: function(nisw) {
        return new Promise((resolve) => {
            firebase.database().ref('absensi').orderByChild('nisw').equalTo(nisw).once('value', (snap) => {
                let hadir = 0, total = 0;
                snap.forEach(child => {
                    total++;
                    if (child.val().status === "Hadir") hadir++;
                });
                resolve(total ? Math.round((hadir / total) * 100) : 0);
            });
        });
    },

    // ================== SARAN ==================
    getSaran: function() {
        return new Promise((resolve) => {
            firebase.database().ref('saran').orderByChild('waktu').once('value', (snap) => {
                const data = snap.val();
                resolve(data ? Object.values(data) : []);
            });
        });
    },
    getTotalSaranBelumDibaca: function() {
        return new Promise((resolve) => {
            firebase.database().ref('saran').orderByChild('dibaca').equalTo(false).once('value', (snap) => {
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

    // ================== JADWAL ==================
    getJadwalLatihan: function() {
        return new Promise((resolve) => {
            firebase.database().ref('jadwalLatihan').once('value', (snap) => {
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
        return new Promise((resolve) => {
            firebase.database().ref('jadwalTurnamen').once('value', (snap) => {
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

    // ================== TAGIHAN & NILAI ==================
    getTagihan: function(nisw) {
        return new Promise((resolve) => {
            firebase.database().ref('tagihan/' + nisw).once('value', (snap) => {
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

window.DBManager = DBManager;
console.log("✅ DBManager Realtime Database FIXED & LENGKAP - SSB Wind Soccer");
