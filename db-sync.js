// ==================== DBManager FULL FIRESTORE v2.0 ====================
// SSB Wind Soccer - db-sync.js
// Perbaikan: findSiswa, cekDuplicateAbsensi, getNextNomorUrut, addPendaftar returns NISW
// =========================================================================

const DBManager = {

    // ── Inisialisasi ──────────────────────────────────────────────────────
    initData: function() {
        console.log("✅ Firebase Firestore SIAP - Full Cloud Mode v2.0");
    },

    // ── Utilitas Tanggal ──────────────────────────────────────────────────
    getTglSekarang: function() {
        const d = new Date();
        return `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()}`;
    },

    // ── Session Login ─────────────────────────────────────────────────────
    setLoginUser: function(user) {
        sessionStorage.setItem("userAktif", JSON.stringify(user));
    },
    getLoginUser: function() {
        const data = sessionStorage.getItem("userAktif");
        return data ? JSON.parse(data) : null;
    },
    clearLoginUser: function() {
        sessionStorage.removeItem("userAktif");
    },

    // ── NOMOR URUT TERPUSAT (Firestore Transaction) ───────────────────────
    // Menjamin tidak ada nomor NISW yang dobel meskipun 2 orang daftar bersamaan
    getNextNomorUrut: async function(tipe) {
        const db = firebase.firestore();
        const counterRef = db.collection("counters").doc("pendaftaran");
        const field = tipe === "Beasiswa" ? "totalBeasiswa" : "totalReguler";
        const prefix = tipe === "Beasiswa" ? "B" : "R";
        const tahun = new Date().getFullYear();

        let nomorBaru = null;

        await db.runTransaction(async (transaction) => {
            const doc = await transaction.get(counterRef);
            let nilai = 0;
            if (doc.exists) {
                nilai = doc.data()[field] || 0;
            }
            nilai += 1;
            transaction.set(counterRef, { [field]: nilai }, { merge: true });
            // Format: R2026001 atau B2026001
            nomorBaru = prefix + tahun + nilai.toString().padStart(3, '0');
        });

        return nomorBaru;
    },

    // ── FIND SISWA (untuk login) ──────────────────────────────────────────
    // Cari siswa berdasarkan NISW di Firestore (async, pakai callback)
    findSiswa: function(nisw, callback) {
        const db = firebase.firestore();
        const niswUpper = String(nisw).toUpperCase().trim();

        // Cari di dataSiswa (reguler)
        db.collection("dataSiswa")
            .where("nisw", "==", niswUpper)
            .limit(1)
            .get()
            .then(snapshot => {
                if (!snapshot.empty) {
                    callback(snapshot.docs[0].data());
                    return;
                }
                // Kalau tidak ada, cari di dataBeasiswa
                return db.collection("dataBeasiswa")
                    .where("nisw", "==", niswUpper)
                    .limit(1)
                    .get();
            })
            .then(snapshot => {
                if (snapshot && !snapshot.empty) {
                    callback(snapshot.docs[0].data());
                } else if (snapshot && snapshot.empty) {
                    callback(null); // Tidak ditemukan
                }
            })
            .catch(err => {
                console.error("❌ Gagal findSiswa:", err);
                callback(null);
            });
    },

    // ── DATABASE SISWA ────────────────────────────────────────────────────
    getSiswaAktif: function(callback) {
        const db = firebase.firestore();
        db.collection("dataSiswa").get().then(s1 => {
            db.collection("dataBeasiswa").get().then(s2 => {
                const semua = [
                    ...s1.docs.map(d => ({ id: d.id, ...d.data() })),
                    ...s2.docs.map(d => ({ id: d.id, ...d.data() }))
                ];
                callback(semua);
            });
        }).catch(err => {
            console.error("❌ getSiswaAktif:", err);
            callback([]);
        });
    },

    addSiswaAktif: function(siswa, callback) {
        const db = firebase.firestore();
        const col = siswa.tipe === "Beasiswa" ? "dataBeasiswa" : "dataSiswa";
        db.collection(col).add(siswa)
            .then(() => callback && callback(true))
            .catch(err => { console.error("❌ addSiswaAktif:", err); callback && callback(false); });
    },

    hapusSiswa: function(docId, tipe, callback) {
        const db = firebase.firestore();
        const col = tipe === "Beasiswa" ? "dataBeasiswa" : "dataSiswa";
        db.collection(col).doc(docId).delete()
            .then(() => callback && callback(true))
            .catch(err => { console.error("❌ hapusSiswa:", err); callback && callback(false); });
    },

    // ── PENDAFTARAN (dengan nomor urut terpusat) ──────────────────────────
    // Mengembalikan NISW yang digenerate (Promise)
    addPendaftar: async function(data) {
        const db = firebase.firestore();

        // Generate NISW unik via Transaction
        const niswBaru = await DBManager.getNextNomorUrut(data.tipe || "Reguler");

        const dataDenganNisw = {
            ...data,
            nisw: niswBaru,
            tglDaftar: DBManager.getTglSekarang(),
            status: "Menunggu Verifikasi",
            timestampDaftar: firebase.firestore.FieldValue.serverTimestamp()
        };

        await db.collection("dataPendaftar").doc(niswBaru).set(dataDenganNisw);
        console.log("✅ Pendaftar tersimpan dengan NISW:", niswBaru);
        return niswBaru;
    },

    getPendaftar: function(callback) {
        const db = firebase.firestore();
        db.collection("dataPendaftar")
            .orderBy("timestampDaftar", "asc")
            .get()
            .then(s => callback(s.docs.map(d => ({ id: d.id, ...d.data() }))))
            .catch(() => {
                // Fallback tanpa orderBy jika index belum dibuat
                db.collection("dataPendaftar").get()
                    .then(s => callback(s.docs.map(d => ({ id: d.id, ...d.data() }))))
                    .catch(err => { console.error("❌ getPendaftar:", err); callback([]); });
            });
    },

    getPendaftarRealtime: function(callback) {
        const db = firebase.firestore();
        return db.collection("dataPendaftar")
            .onSnapshot(snapshot => {
                callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
            }, err => {
                console.error("❌ getPendaftarRealtime:", err);
                callback([]);
            });
    },

    verifikasiPendaftar: async function(docId, dataSiswa) {
        const db = firebase.firestore();
        const col = dataSiswa.tipe === "Beasiswa" ? "dataBeasiswa" : "dataSiswa";
        const batch = db.batch();

        // Tambah ke dataSiswa/dataBeasiswa
        const siswaRef = db.collection(col).doc(dataSiswa.nisw);
        batch.set(siswaRef, { ...dataSiswa, status: "Aktif", tglVerifikasi: DBManager.getTglSekarang() });

        // Update status di dataPendaftar
        const pendaftarRef = db.collection("dataPendaftar").doc(docId);
        batch.update(pendaftarRef, { status: "Terverifikasi", tglVerifikasi: DBManager.getTglSekarang() });

        await batch.commit();
        return true;
    },

    tolakPendaftar: function(docId, callback) {
        const db = firebase.firestore();
        db.collection("dataPendaftar").doc(docId)
            .update({ status: "Ditolak" })
            .then(() => callback && callback(true))
            .catch(err => { console.error("❌ tolakPendaftar:", err); callback && callback(false); });
    },

    // ── ABSENSI ───────────────────────────────────────────────────────────
    // cekDuplicateAbsensi: async, pakai callback karena harus query Firestore
    cekDuplicateAbsensi: function(nisw, tanggal, callback) {
        const db = firebase.firestore();
        db.collection("dataAbsensi")
            .where("nisw", "==", nisw)
            .where("tanggal", "==", tanggal)
            .limit(1)
            .get()
            .then(snapshot => {
                callback(!snapshot.empty); // true = sudah ada (duplikat)
            })
            .catch(err => {
                console.error("❌ cekDuplicateAbsensi:", err);
                callback(false); // Kalau error, biarkan lanjut
            });
    },

    addAbsensi: function(data, callback) {
        const db = firebase.firestore();
        const dataLengkap = {
            ...data,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        };
        db.collection("dataAbsensi").add(dataLengkap)
            .then(() => callback && callback(true))
            .catch(err => { console.error("❌ addAbsensi:", err); callback && callback(false); });
    },

    getAbsensi: function(callback) {
        const db = firebase.firestore();
        db.collection("dataAbsensi").get()
            .then(s => callback(s.docs.map(d => ({ id: d.id, ...d.data() }))))
            .catch(err => { console.error("❌ getAbsensi:", err); callback([]); });
    },

    // ── KEUANGAN ──────────────────────────────────────────────────────────
    addKeuangan: function(data, callback) {
        const db = firebase.firestore();
        const dataLengkap = {
            ...data,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        };
        db.collection("dataKeuangan").add(dataLengkap)
            .then(() => callback && callback(true))
            .catch(err => { console.error("❌ addKeuangan:", err); callback && callback(false); });
    },

    getKeuangan: function(callback) {
        const db = firebase.firestore();
        db.collection("dataKeuangan").get()
            .then(s => callback(s.docs.map(d => ({ id: d.id, ...d.data() }))))
            .catch(err => { console.error("❌ getKeuangan:", err); callback([]); });
    },

    // ── NILAI / RAPORT ────────────────────────────────────────────────────
    updateNilai: function(nisw, dataNilai, callback) {
        const db = firebase.firestore();
        const dataLengkap = {
            ...dataNilai,
            nisw: nisw,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        };
        db.collection("dataNilai").add(dataLengkap)
            .then(() => callback && callback(true))
            .catch(err => { console.error("❌ updateNilai:", err); callback && callback(false); });
    },

    getNilai: function(callback) {
        const db = firebase.firestore();
        db.collection("dataNilai").get()
            .then(s => callback(s.docs.map(d => ({ id: d.id, ...d.data() }))))
            .catch(err => { console.error("❌ getNilai:", err); callback([]); });
    },

    getNilaiBySiswa: function(nisw, callback) {
        const db = firebase.firestore();
        db.collection("dataNilai")
            .where("nisw", "==", nisw)
            .get()
            .then(s => callback(s.docs.map(d => ({ id: d.id, ...d.data() }))))
            .catch(err => { console.error("❌ getNilaiBySiswa:", err); callback([]); });
    },

    // ── SARAN & MASUKAN ───────────────────────────────────────────────────
    addSaran: function(data, callback) {
        const db = firebase.firestore();
        const dataLengkap = {
            ...data,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        };
        db.collection("dataSaran").add(dataLengkap)
            .then(() => callback && callback(true))
            .catch(err => { console.error("❌ addSaran:", err); callback && callback(false); });
    },

    getSaran: function(callback) {
        const db = firebase.firestore();
        db.collection("dataSaran").get()
            .then(s => callback(s.docs.map(d => ({ id: d.id, ...d.data() }))))
            .catch(err => { console.error("❌ getSaran:", err); callback([]); });
    },

    // ── JADWAL ────────────────────────────────────────────────────────────
    getJadwalLatihan: function(callback) {
        const db = firebase.firestore();
        db.collection("db_latihan").get()
            .then(s => callback(s.docs.map(d => ({ id: d.id, ...d.data() }))))
            .catch(err => { console.error("❌ getJadwalLatihan:", err); callback([]); });
    },

    addJadwalLatihan: function(data, callback) {
        const db = firebase.firestore();
        db.collection("db_latihan").add(data)
            .then(() => callback && callback(true))
            .catch(err => { console.error("❌ addJadwalLatihan:", err); callback && callback(false); });
    },

    hapusJadwalLatihan: function(docId, callback) {
        const db = firebase.firestore();
        db.collection("db_latihan").doc(docId).delete()
            .then(() => callback && callback(true))
            .catch(err => { console.error("❌ hapusJadwalLatihan:", err); callback && callback(false); });
    },

    getJadwalTurnamen: function(callback) {
        const db = firebase.firestore();
        db.collection("db_turnamen").get()
            .then(s => callback(s.docs.map(d => ({ id: d.id, ...d.data() }))))
            .catch(err => { console.error("❌ getJadwalTurnamen:", err); callback([]); });
    },

    addJadwalTurnamen: function(data, callback) {
        const db = firebase.firestore();
        db.collection("db_turnamen").add(data)
            .then(() => callback && callback(true))
            .catch(err => { console.error("❌ addJadwalTurnamen:", err); callback && callback(false); });
    },

    hapusJadwalTurnamen: function(docId, callback) {
        const db = firebase.firestore();
        db.collection("db_turnamen").doc(docId).delete()
            .then(() => callback && callback(true))
            .catch(err => { console.error("❌ hapusJadwalTurnamen:", err); callback && callback(false); });
    }
};

// ── Jalankan ──────────────────────────────────────────────────────────────
function startApp() {
    DBManager.initData();
    window.DBManager = DBManager;
    console.log("🚀 DBManager v2.0 AKTIF - findSiswa ✅ cekDuplicate ✅ getNextNomorUrut ✅");
}
startApp();
