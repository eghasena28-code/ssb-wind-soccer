// ========================================
// db-sync.js - COMPLETE FIREBASE INTEGRATION
// SSB WIND SOCCER ADMIN PANEL
// ========================================

const DBManager = {
    // ===== UTILITY =====
    getTglSekarang: function() {
        const d = new Date();
        return `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()}`;
    },

    setLoginUser: function(user) { 
        sessionStorage.setItem("userAktif", JSON.stringify(user));
        console.log("💾 Login user set:", user.nama);
    },

    getLoginUser: function() {
        const data = sessionStorage.getItem("userAktif");
        return data ? JSON.parse(data) : null;
    },

    clearLoginUser: function() { 
        sessionStorage.removeItem("userAktif");
        console.log("🗑️ Login user cleared");
    },

    // ===== 1. SISWA AKTIF =====
    findSiswa: function(nisw, callback) {
        console.log("🔍 findSiswa:", nisw);
        
        firebase.firestore().collection("dataSiswa").where("nisw", "==", nisw).get()
            .then(snapshot => {
                if (!snapshot.empty) {
                    callback(snapshot.docs[0].data());
                    return;
                }
                
                // Cek di dataBeasiswa
                firebase.firestore().collection("dataBeasiswa").where("nisw", "==", nisw).get()
                    .then(snapshot2 => {
                        if (!snapshot2.empty) {
                            callback(snapshot2.docs[0].data());
                        } else {
                            callback(null);
                        }
                    })
                    .catch(() => callback(null));
            })
            .catch(() => callback(null));
    },

    getSiswaAktif: function(callback) {
        console.log("📂 getSiswaAktif");
        
        firebase.firestore().collection("dataSiswa").get()
            .then(s1 => {
                const reguler = s1.docs.map(d => d.data());
                
                firebase.firestore().collection("dataBeasiswa").get()
                    .then(s2 => {
                        const beasiswa = s2.docs.map(d => d.data());
                        const all = [...reguler, ...beasiswa];
                        console.log("✅ Total siswa:", all.length);
                        callback(all);
                    })
                    .catch(() => callback(reguler));
            })
            .catch(() => callback([]));
    },

    addSiswaAktif: function(siswa, callback) {
        console.log("💾 addSiswaAktif:", siswa.nisw);
        
        const collection = siswa.tipe === "Beasiswa" ? "dataBeasiswa" : "dataSiswa";
        
        firebase.firestore().collection(collection).add(siswa)
            .then(() => {
                console.log("✅ Siswa added:", siswa.nisw);
                callback(true);
            })
            .catch((err) => {
                console.error("❌ Error adding siswa:", err);
                callback(false);
            });
    },

    // ===== 2. PENDAFTAR =====
    getPendaftar: function(callback) {
        console.log("📂 getPendaftar");
        
        firebase.firestore().collection("dataPendaftar").get()
            .then(snapshot => {
                const data = snapshot.docs.map(d => d.data());
                console.log("✅ Pendaftar count:", data.length);
                callback(data);
            })
            .catch(() => callback([]));
    },

    addPendaftar: function(data, callback) {
        console.log("💾 addPendaftar:", data.nama);
        
        const tahun = new Date().getFullYear();
        const prefix = data.tipe === "Beasiswa" ? "B" : "R";
        const urut = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        const nisw = prefix + tahun + urut;
        
        data.nisw = nisw;
        data.status = "Menunggu Verifikasi";
        data.tglDaftar = new Date().toLocaleString('id-ID');
        
        firebase.firestore().collection("dataPendaftar").add(data)
            .then(() => {
                console.log("✅ Pendaftar added:", nisw);
                callback(nisw);
            })
            .catch((err) => {
                console.error("❌ Error adding pendaftar:", err);
                callback(null);
            });
    },

    // ===== 3. ABSENSI =====
    getAbsensi: function(callback) {
        console.log("📂 getAbsensi");
        
        firebase.firestore().collection("dataAbsensi").get()
            .then(snapshot => {
                const data = snapshot.docs.map(d => d.data());
                console.log("✅ Absensi count:", data.length);
                callback(data);
            })
            .catch(() => callback([]));
    },

    addAbsensi: function(data, callback) {
        console.log("💾 addAbsensi:", data.nisw, data.tanggal);
        
        firebase.firestore().collection("dataAbsensi").add(data)
            .then(() => {
                console.log("✅ Absensi added");
                callback(true);
            })
            .catch((err) => {
                console.error("❌ Error adding absensi:", err);
                callback(false);
            });
    },

    cekDuplicateAbsensi: function(nisw, tanggal, callback) {
        console.log("🔍 cekDuplicateAbsensi:", nisw, tanggal);
        
        firebase.firestore().collection("dataAbsensi")
            .where("nisw", "==", nisw)
            .where("tanggal", "==", tanggal)
            .get()
            .then(snapshot => {
                const isDuplikat = !snapshot.empty;
                console.log("✅ Duplicate check:", isDuplikat);
                callback(isDuplikat);
            })
            .catch(() => callback(false));
    },

    // ===== 4. KEUANGAN =====
    getKeuangan: function(callback) {
        console.log("📂 getKeuangan - FRESH LOAD");
        
        firebase.firestore().collection("dataKeuangan")
            .orderBy("tanggal", "desc")
            .limit(100)
            .get()
            .then(snapshot => {
                const data = snapshot.docs.map(d => {
                    const docData = d.data();
                    return {
                        id: d.id,
                        ...docData
                    };
                });
                console.log("✅ Keuangan count:", data.length);
                console.log("📊 Keuangan data:", data);
                callback(data);
            })
            .catch((err) => {
                console.error("❌ Error getting keuangan:", err);
                callback([]);
            });
    },

    addKeuangan: function(data, callback) {
        console.log("💾 addKeuangan:", data);
        
        // STANDARDISASI: Pastikan field jenisMasukKeluar ada
        if (!data.jenisMasukKeluar) {
            data.jenisMasukKeluar = data.jenis === 'Keluar' ? 'Keluar' : 'Masuk';
        }
        
        data.createdAt = new Date().toISOString();
        
        firebase.firestore().collection("dataKeuangan").add(data)
            .then((docRef) => {
                console.log("✅ Keuangan added, ID:", docRef.id);
                callback(true);
            })
            .catch((err) => {
                console.error("❌ Error adding keuangan:", err);
                callback(false);
            });
    },

    // ===== 5. NILAI RAPORT =====
    getNilai: function(callback) {
        console.log("📂 getNilai");
        
        firebase.firestore().collection("dataNilai")
            .orderBy("createdAt", "desc")
            .get()
            .then(snapshot => {
                const data = snapshot.docs.map(d => d.data());
                console.log("✅ Nilai count:", data.length);
                callback(data);
            })
            .catch(() => callback([]));
    },

    getNilaiBySiswa: function(nisw, callback) {
        console.log("📂 getNilaiBySiswa:", nisw);
        
        firebase.firestore().collection("dataNilai")
            .where("nisw", "==", nisw)
            .orderBy("createdAt", "desc")
            .get()
            .then(snapshot => {
                const data = snapshot.docs.map(d => d.data());
                console.log("✅ Nilai siswa count:", data.length);
                callback(data);
            })
            .catch(() => callback([]));
    },

    addNilai: function(data, callback) {
        console.log("💾 addNilai:", data.nisw);
        
        data.createdAt = new Date().toISOString();
        
        firebase.firestore().collection("dataNilai").add(data)
            .then(() => {
                console.log("✅ Nilai added");
                callback(true);
            })
            .catch((err) => {
                console.error("❌ Error adding nilai:", err);
                callback(false);
            });
    },

    // ===== 6. SARAN & MASUKAN =====
    getSaran: function(callback) {
        console.log("📂 getSaran");
        
        firebase.firestore().collection("dataSaran")
            .orderBy("tanggal", "desc")
            .get()
            .then(snapshot => {
                const data = snapshot.docs.map(d => d.data());
                console.log("✅ Saran count:", data.length);
                callback(data);
            })
            .catch(() => callback([]));
    },

    getSaranByKategori: function(kategori, callback) {
        console.log("📂 getSaranByKategori:", kategori);
        
        firebase.firestore().collection("dataSaran")
            .where("kategori", "==", kategori)
            .orderBy("tanggal", "desc")
            .get()
            .then(snapshot => {
                const data = snapshot.docs.map(d => d.data());
                console.log("✅ Saran kategori count:", data.length);
                callback(data);
            })
            .catch(() => callback([]));
    },

    addSaran: function(data, callback) {
        console.log("💾 addSaran:", data.nisw);
        
        data.createdAt = new Date().toISOString();
        
        firebase.firestore().collection("dataSaran").add(data)
            .then(() => {
                console.log("✅ Saran added");
                callback(true);
            })
            .catch((err) => {
                console.error("❌ Error adding saran:", err);
                callback(false);
            });
    },

    // ===== 7. JADWAL LATIHAN =====
    getJadwalLatihan: function(callback) {
        console.log("📂 getJadwalLatihan");
        
        firebase.firestore().collection("db_latihan")
            .get()
            .then(snapshot => {
                const data = snapshot.docs.map(d => d.data());
                console.log("✅ Jadwal latihan count:", data.length);
                callback(data);
            })
            .catch(() => callback([]));
    },

    addJadwalLatihan: function(data, callback) {
        console.log("💾 addJadwalLatihan:", data.hari);
        
        firebase.firestore().collection("db_latihan").add(data)
            .then(() => {
                console.log("✅ Jadwal latihan added");
                callback(true);
            })
            .catch((err) => {
                console.error("❌ Error adding jadwal latihan:", err);
                callback(false);
            });
    },

    // ===== 8. JADWAL TURNAMEN =====
    getJadwalTurnamen: function(callback) {
        console.log("📂 getJadwalTurnamen");
        
        firebase.firestore().collection("db_turnamen")
            .orderBy("tanggal", "asc")
            .get()
            .then(snapshot => {
                const data = snapshot.docs.map(d => d.data());
                console.log("✅ Jadwal turnamen count:", data.length);
                callback(data);
            })
            .catch(() => callback([]));
    },

    addJadwalTurnamen: function(data, callback) {
        console.log("💾 addJadwalTurnamen:", data.nama_event);
        
        firebase.firestore().collection("db_turnamen").add(data)
            .then(() => {
                console.log("✅ Jadwal turnamen added");
                callback(true);
            })
            .catch((err) => {
                console.error("❌ Error adding jadwal turnamen:", err);
                callback(false);
            });
    },

    // ===== INIT =====
    initData: function() {
        console.log("✅ Firebase Firestore SIAP - Full Cloud Mode");
    }
};

// Initialize
function startApp() {
    DBManager.initData();
    window.DBManager = DBManager;
    console.log("🚀 DBManager READY!");
}

startApp();
