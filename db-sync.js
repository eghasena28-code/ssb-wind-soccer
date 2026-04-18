// db-sync.js - PRODUCTION READY VERSION
// All Firestore functions complete with error handling

const DBManager = {
    // ==================== SESSION MANAGEMENT ====================
    getTglSekarang: function() {
        const d = new Date();
        return `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()}`;
    },

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

    // ==================== SISWA QUERIES ====================
    /**
     * Cari siswa berdasarkan NISW
     * Query: dataSiswa & dataBeasiswa
     * @param {string} nisw - NISW siswa (format: R2026001 atau B2026001)
     * @param {function} callback - callback(siswaObj || null)
     */
    findSiswa: function(nisw, callback) {
        if (!nisw) {
            callback(null);
            return;
        }
        
        const niswUpper = nisw.toString().toUpperCase().trim();
        
        // Query dataSiswa DULU
        firebase.firestore().collection("dataSiswa")
            .where("nisw", "==", niswUpper)
            .limit(1)
            .get()
            .then(snapshot => {
                if (snapshot.size > 0) {
                    const siswa = snapshot.docs[0].data();
                    siswa.docId = snapshot.docs[0].id; // Store doc ID untuk update
                    callback(siswa);
                    return;
                }
                
                // Jika tidak ketemu di reguler, cari di beasiswa
                firebase.firestore().collection("dataBeasiswa")
                    .where("nisw", "==", niswUpper)
                    .limit(1)
                    .get()
                    .then(snapshot2 => {
                        if (snapshot2.size > 0) {
                            const siswa = snapshot2.docs[0].data();
                            siswa.docId = snapshot2.docs[0].id;
                            callback(siswa);
                        } else {
                            console.warn("⚠️ NISW tidak ditemukan:", niswUpper);
                            callback(null);
                        }
                    })
                    .catch(err => {
                        console.error("❌ Error query dataBeasiswa:", err);
                        callback(null);
                    });
            })
            .catch(err => {
                console.error("❌ Error query dataSiswa:", err);
                callback(null);
            });
    },

    /**
     * Cek absensi sudah dilakukan di tanggal yang sama
     * @param {string} nisw - NISW siswa
     * @param {string} tanggal - Format YYYY-MM-DD
     * @param {function} callback - callback(isDuplicate: boolean)
     */
    cekDuplicateAbsensi: function(nisw, tanggal, callback) {
        if (!nisw || !tanggal) {
            callback(false);
            return;
        }

        firebase.firestore().collection("dataAbsensi")
            .where("nisw", "==", nisw.toUpperCase())
            .where("tanggal", "==", tanggal)
            .limit(1)
            .get()
            .then(snapshot => {
                const isDuplicate = snapshot.size > 0;
                callback(isDuplicate);
            })
            .catch(err => {
                console.error("❌ Error cek duplicate absensi:", err);
                callback(false);
            });
    },

    /**
     * Ambil nilai siswa berdasarkan NISW
     * @param {string} nisw - NISW siswa
     * @param {function} callback - callback(arrayOfNilai)
     */
    getNilaiBySiswa: function(nisw, callback) {
        if (!nisw) {
            callback([]);
            return;
        }

        firebase.firestore().collection("dataNilai")
            .where("nisw", "==", nisw.toUpperCase())
            .orderBy("createdAt", "desc")
            .limit(1) // Ambil nilai terbaru
            .get()
            .then(snapshot => {
                const nilaiList = snapshot.docs.map(doc => doc.data());
                callback(nilaiList);
            })
            .catch(err => {
                console.error("❌ Error get nilai siswa:", err);
                callback([]);
            });
    },

    // ==================== ADD/UPDATE SISWA ====================
    getSiswaAktif: function(callback) {
        firebase.firestore().collection("dataSiswa")
            .get()
            .then(s1 => {
                firebase.firestore().collection("dataBeasiswa")
                    .get()
                    .then(s2 => {
                        const allSiswa = [
                            ...s1.docs.map(d => ({ ...d.data(), docId: d.id })),
                            ...s2.docs.map(d => ({ ...d.data(), docId: d.id }))
                        ];
                        callback(allSiswa);
                    })
                    .catch(err => {
                        console.error("❌ Error get dataBeasiswa:", err);
                        callback(s1.docs.map(d => ({ ...d.data(), docId: d.id })));
                    });
            })
            .catch(err => {
                console.error("❌ Error get dataSiswa:", err);
                callback([]);
            });
    },

    addSiswaAktif: function(siswa, callback) {
        const key = siswa.tipe === "Beasiswa" ? "dataBeasiswa" : "dataSiswa";
        firebase.firestore().collection(key)
            .add(siswa)
            .then(() => {
                console.log("✅ Siswa berhasil ditambahkan ke", key);
                callback && callback(true);
            })
            .catch(err => {
                console.error("❌ Error add siswa:", err);
                callback && callback(false);
            });
    },

    // ==================== PENDAFTAR ====================
    getPendaftar: function(callback) {
        firebase.firestore().collection("dataPendaftar")
            .get()
            .then(s => {
                const pendaftar = s.docs.map(d => ({ ...d.data(), docId: d.id }));
                callback(pendaftar);
            })
            .catch(err => {
                console.error("❌ Error get pendaftar:", err);
                callback([]);
            });
    },

    /**
     * Tambah pendaftar & auto-generate NISW
     * Format NISW: R[TAHUN][URUTAN3DIGIT] atau B[TAHUN][URUTAN3DIGIT]
     * @param {object} data - Data pendaftar
     * @param {function} callback - callback(nisw)
     */
    addPendaftar: function(data, callback) {
        const tahun = new Date().getFullYear();
        const prefix = data.tipe === "Beasiswa" ? "B" : "R";

        // Count total siswa untuk generate urutan
        firebase.firestore().collection("dataSiswa")
            .get()
            .then(s1 => {
                firebase.firestore().collection("dataBeasiswa")
                    .get()
                    .then(s2 => {
                        const totalSiswa = s1.size + s2.size + 1;
                        const urut = totalSiswa.toString().padStart(3, '0');
                        const nisw = prefix + tahun + urut;

                        data.nisw = nisw;
                        data.status = "Menunggu Verifikasi";
                        data.tglDaftar = DBManager.getTglSekarang();

                        firebase.firestore().collection("dataPendaftar")
                            .add(data)
                            .then(() => {
                                console.log("✅ Pendaftar berhasil ditambahkan, NISW:", nisw);
                                callback && callback(nisw);
                            })
                            .catch(err => {
                                console.error("❌ Error add pendaftar:", err);
                                callback && callback(null);
                            });
                    })
                    .catch(err => {
                        console.error("❌ Error count beasiswa:", err);
                        callback && callback(null);
                    });
            })
            .catch(err => {
                console.error("❌ Error count siswa:", err);
                callback && callback(null);
            });
    },

    // ==================== ABSENSI ====================
    addAbsensi: function(data, callback) {
        data.tanggal = data.tanggal || new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
        data.waktuInput = new Date().toLocaleString('id-ID');

        firebase.firestore().collection("dataAbsensi")
            .add(data)
            .then(() => {
                console.log("✅ Absensi berhasil disimpan");
                callback && callback(true);
            })
            .catch(err => {
                console.error("❌ Error add absensi:", err);
                callback && callback(false);
            });
    },

    getAbsensi: function(callback) {
        firebase.firestore().collection("dataAbsensi")
            .orderBy("tanggal", "desc")
            .get()
            .then(s => {
                const absensi = s.docs.map(d => d.data());
                callback(absensi);
            })
            .catch(err => {
                console.error("❌ Error get absensi:", err);
                callback([]);
            });
    },

    /**
     * Ambil absensi berdasarkan tanggal
     * @param {string} tanggal - Format YYYY-MM-DD
     * @param {function} callback - callback(arrayOfAbsensi)
     */
    getAbsensiByTanggal: function(tanggal, callback) {
        if (!tanggal) {
            DBManager.getAbsensi(callback);
            return;
        }

        firebase.firestore().collection("dataAbsensi")
            .where("tanggal", "==", tanggal)
            .get()
            .then(s => {
                callback(s.docs.map(d => d.data()));
            })
            .catch(err => {
                console.error("❌ Error get absensi by tanggal:", err);
                callback([]);
            });
    },

    // ==================== NILAI / EVALUASI ====================
    /**
     * Tambah/update nilai siswa
     * @param {object} dataNilai - {nisw, passing, shooting, dribbling, control, positioning, speed, tb, bb, lingkarPerut, bmi, catatan}
     * @param {function} callback - callback(berhasil)
     */
    addNilai: function(dataNilai, callback) {
        dataNilai.nisw = dataNilai.nisw.toUpperCase();
        dataNilai.createdAt = new Date().toISOString();

        firebase.firestore().collection("dataNilai")
            .add(dataNilai)
            .then(() => {
                console.log("✅ Nilai siswa berhasil disimpan");
                callback && callback(true);
            })
            .catch(err => {
                console.error("❌ Error add nilai:", err);
                callback && callback(false);
            });
    },

    getNilai: function(callback) {
        firebase.firestore().collection("dataNilai")
            .orderBy("createdAt", "desc")
            .get()
            .then(s => {
                callback(s.docs.map(d => d.data()));
            })
            .catch(err => {
                console.error("❌ Error get nilai:", err);
                callback([]);
            });
    },

    // ==================== KEUANGAN ====================
    addKeuangan: function(data, callback) {
        data.tanggal = new Date().toLocaleString('id-ID');
        data.tipe = data.tipe || "Pemasukan"; // Default ke pemasukan

        firebase.firestore().collection("dataKeuangan")
            .add(data)
            .then(() => {
                console.log("✅ Transaksi keuangan berhasil disimpan");
                callback && callback(true);
            })
            .catch(err => {
                console.error("❌ Error add keuangan:", err);
                callback && callback(false);
            });
    },

    getKeuangan: function(callback) {
        firebase.firestore().collection("dataKeuangan")
            .orderBy("tanggal", "desc")
            .get()
            .then(s => {
                callback(s.docs.map(d => d.data()));
            })
            .catch(err => {
                console.error("❌ Error get keuangan:", err);
                callback([]);
            });
    },

    // ==================== SARAN ====================
    addSaran: function(data, callback) {
        data.tanggal = new Date().toLocaleString('id-ID');

        firebase.firestore().collection("dataSaran")
            .add(data)
            .then(() => {
                console.log("✅ Saran berhasil disimpan");
                callback && callback(true);
            })
            .catch(err => {
                console.error("❌ Error add saran:", err);
                callback && callback(false);
            });
    },

    getSaran: function(callback) {
        firebase.firestore().collection("dataSaran")
            .orderBy("tanggal", "desc")
            .get()
            .then(s => {
                callback(s.docs.map(d => d.data()));
            })
            .catch(err => {
                console.error("❌ Error get saran:", err);
                callback([]);
            });
    },

    /**
     * Ambil saran berdasarkan kategori
     * @param {string} kategori - Kategori saran (Fasilitas, Pelatih, dll)
     * @param {function} callback - callback(arrayOfSaran)
     */
    getSaranByKategori: function(kategori, callback) {
        if (!kategori) {
            DBManager.getSaran(callback);
            return;
        }

        firebase.firestore().collection("dataSaran")
            .where("kategori", "==", kategori)
            .orderBy("tanggal", "desc")
            .get()
            .then(s => {
                callback(s.docs.map(d => d.data()));
            })
            .catch(err => {
                console.error("❌ Error get saran by kategori:", err);
                callback([]);
            });
    },

    // ==================== JADWAL ====================
    getJadwalLatihan: function(callback) {
        firebase.firestore().collection("db_latihan")
            .get()
            .then(s => {
                callback(s.docs.map(d => ({ ...d.data(), docId: d.id })));
            })
            .catch(err => {
                console.error("❌ Error get jadwal latihan:", err);
                callback([]);
            });
    },

    addJadwalLatihan: function(data, callback) {
        firebase.firestore().collection("db_latihan")
            .add(data)
            .then(() => {
                console.log("✅ Jadwal latihan berhasil ditambahkan");
                callback && callback(true);
            })
            .catch(err => {
                console.error("❌ Error add jadwal latihan:", err);
                callback && callback(false);
            });
    },

    getJadwalTurnamen: function(callback) {
        firebase.firestore().collection("db_turnamen")
            .orderBy("tanggal", "asc")
            .get()
            .then(s => {
                callback(s.docs.map(d => ({ ...d.data(), docId: d.id })));
            })
            .catch(err => {
                console.error("❌ Error get jadwal turnamen:", err);
                callback([]);
            });
    },

    addJadwalTurnamen: function(data, callback) {
        firebase.firestore().collection("db_turnamen")
            .add(data)
            .then(() => {
                console.log("✅ Jadwal turnamen berhasil ditambahkan");
                callback && callback(true);
            })
            .catch(err => {
                console.error("❌ Error add jadwal turnamen:", err);
                callback && callback(false);
            });
    },

    // ==================== UTILITY ====================
    initData: function() {
        console.log("✅ Firebase Firestore SIAP - Full Cloud Mode");
    }
};

// ==================== INITIALIZATION ====================
function startApp() {
    DBManager.initData();
    window.DBManager = DBManager;
    console.log("🚀 DBManager PRODUCTION READY - Semua fungsi Firestore aktif!");
}

// Auto-start saat script load
startApp();
