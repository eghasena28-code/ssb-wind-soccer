// ============================================
// db-sync.js - ENHANCED VERSION (ADDITIONS)
// ============================================

console.log("🔧 Enhancing db-sync.js...");

// ===== PERBAIKAN: ADD findSiswa ke DBManager =====
DBManager.findSiswa = function(nisw, callback) {
    console.log("🔍 findSiswa:", nisw);
    
    if (!nisw) {
        console.warn("⚠️ NISW is empty");
        callback(null);
        return;
    }

    firebase.firestore().collection("dataSiswa").where("nisw", "==", nisw).get()
        .then(snapshot => {
            if (!snapshot.empty) {
                const siswa = snapshot.docs[0].data();
                console.log("✅ Found in dataSiswa:", siswa.nama);
                callback(siswa);
                return;
            }
            
            // Cek di dataBeasiswa
            firebase.firestore().collection("dataBeasiswa").where("nisw", "==", nisw).get()
                .then(snapshot2 => {
                    if (!snapshot2.empty) {
                        const siswa = snapshot2.docs[0].data();
                        console.log("✅ Found in dataBeasiswa:", siswa.nama);
                        callback(siswa);
                    } else {
                        console.warn("⚠️ Siswa not found:", nisw);
                        callback(null);
                    }
                })
                .catch(err => {
                    console.error("❌ Error in dataBeasiswa query:", err);
                    callback(null);
                });
        })
        .catch(err => {
            console.error("❌ Error in dataSiswa query:", err);
            callback(null);
        });
};

// ===== PERBAIKAN: ADD cekDuplicateAbsensi ke DBManager =====
DBManager.cekDuplicateAbsensi = function(nisw, tanggal, callback) {
    console.log("🔍 cekDuplicateAbsensi:", nisw, tanggal);
    
    firebase.firestore().collection("dataAbsensi")
        .where("nisw", "==", nisw)
        .where("tanggal", "==", tanggal)
        .get()
        .then(snapshot => {
            const isDuplikat = !snapshot.empty;
            console.log("✅ Duplicate check result:", isDuplikat);
            callback(isDuplikat);
        })
        .catch(err => {
            console.error("❌ Error checking duplicate:", err);
            callback(false);
        });
};

// ===== PERBAIKAN: ADD getNilaiBySiswa ke DBManager =====
DBManager.getNilaiBySiswa = function(nisw, callback) {
    console.log("📂 getNilaiBySiswa:", nisw);
    
    firebase.firestore().collection("dataNilai")
        .where("nisw", "==", nisw)
        .orderBy("createdAt", "desc")
        .limit(1)
        .get()
        .then(snapshot => {
            const data = snapshot.docs.map(d => d.data());
            console.log("✅ Nilai siswa retrieved, count:", data.length);
            callback(data);
        })
        .catch(err => {
            console.error("❌ Error getting nilai:", err);
            callback([]);
        });
};

// ===== PERBAIKAN: Add Promise-based addPendaftar =====
DBManager.addPendaftar = function(data, callback) {
    console.log("💾 addPendaftar:", data.nama);
    
    const tahun = new Date().getFullYear();
    const prefix = data.tipe === "Beasiswa" ? "B" : "R";
    const urut = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const nisw = prefix + tahun + urut;
    
    data.nisw = nisw;
    data.status = "Menunggu Verifikasi";
    data.tglDaftar = new Date().toLocaleString('id-ID');
    data.createdAt = new Date().toISOString();
    
    return new Promise((resolve, reject) => {
        firebase.firestore().collection("dataPendaftar").add(data)
            .then(() => {
                console.log("✅ Pendaftar added:", nisw);
                if (callback) callback(nisw);
                resolve(nisw);
            })
            .catch((err) => {
                console.error("❌ Error adding pendaftar:", err);
                if (callback) callback(null);
                reject(err);
            });
    });
};

// ===== PERBAIKAN: Add Error Boundary =====
DBManager.safeQuery = function(collectionName, whereClause, callback) {
    console.log("🔍 safeQuery:", collectionName);
    
    try {
        let query = firebase.firestore().collection(collectionName);
        
        if (whereClause) {
            query = query.where(whereClause.field, whereClause.operator, whereClause.value);
        }
        
        query.get().then(snapshot => {
            const data = snapshot.docs.map(d => ({
                id: d.id,
                ...d.data()
            }));
            console.log("✅ Query successful:", data.length, "documents");
            callback(data);
        }).catch(err => {
            console.error("❌ Query error:", err);
            callback([]);
        });
    } catch (error) {
        console.error("❌ Safe query error:", error);
        callback([]);
    }
};

// ===== PERBAIKAN: Version Info =====
DBManager.getVersion = function() {
    return {
        version: "2.0.0-enhanced",
        lastUpdated: "2026-04-18",
        features: [
            "Firestore integration",
            "Promise support",
            "Error handling",
            "Offline persistence"
        ]
    };
};

console.log("🚀 DBManager Enhanced Version:", DBManager.getVersion());
