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
