// ==================== DBManager FINAL - SSB Wind Soccer (April 2026) ====================
const DBManager = {
    initData: function() {
        const keys = ["dataSiswa","dataBeasiswa","dataPendaftar","dataAbsensi","dataKeuangan","dataNilai","dataSaran"];
        keys.forEach(key => {
            if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify([]));
        });
    },

    getTglSekarang: function() {
        const d = new Date();
        return `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()}`;
    },

    // ===== LOGIN & SESSION =====
    setLoginUser: function(user) { sessionStorage.setItem("userAktif", JSON.stringify(user)); },
    getLoginUser: function() {
        const data = sessionStorage.getItem("userAktif");
        return data ? JSON.parse(data) : null;
    },
    clearLoginUser: function() { sessionStorage.removeItem("userAktif"); },

    // ===== SISWA (Reguler & Beasiswa) =====
    findSiswa: function(nisw) {
        const semua = [...(JSON.parse(localStorage.getItem("dataSiswa"))||[]), ...(JSON.parse(localStorage.getItem("dataBeasiswa"))||[])];
        return semua.find(s => String(s.nisw).toUpperCase() === String(nisw).toUpperCase());
    },
    
    getSiswaAktif: function() {
        return [...(JSON.parse(localStorage.getItem("dataSiswa"))||[]), ...(JSON.parse(localStorage.getItem("dataBeasiswa"))||[])];
    },
    
    addSiswaAktif: function(siswa) {
        const key = siswa.tipe === "Beasiswa" ? "dataBeasiswa" : "dataSiswa";
        let list = JSON.parse(localStorage.getItem(key)) || [];
        list.push(siswa);
        localStorage.setItem(key, JSON.stringify(list));
    },
    
    updateSiswaAktif: function(nisw, updateData) {
        ["dataSiswa","dataBeasiswa"].forEach(key => {
            let list = JSON.parse(localStorage.getItem(key)) || [];
            const idx = list.findIndex(s => String(s.nisw).toUpperCase() === String(nisw).toUpperCase());
            if (idx > -1) {
                list[idx] = {...list[idx], ...updateData};
                localStorage.setItem(key, JSON.stringify(list));
            }
        });
    },
    
    deleteSiswaAktif: function(nisw) {
        ["dataSiswa","dataBeasiswa"].forEach(key => {
            let list = JSON.parse(localStorage.getItem(key)) || [];
            list = list.filter(s => String(s.nisw).toUpperCase() !== String(nisw).toUpperCase());
            localStorage.setItem(key, JSON.stringify(list));
        });
    },

    // ===== PENDAFTAR =====
    getPendaftar: function() { 
        return JSON.parse(localStorage.getItem("dataPendaftar")) || []; 
    },
    
    addPendaftar: function(data) {
        let list = this.getPendaftar();
        const total = this.getSiswaAktif().length + list.length + 1;
        const prefix = data.tipe === "Beasiswa" ? "B" : "R";
        data.nisw = prefix + new Date().getFullYear() + total.toString().padStart(3,'0');
        data.status = "Menunggu Verifikasi";
        data.tglDaftar = this.getTglSekarang();
        list.push(data);
        localStorage.setItem("dataPendaftar", JSON.stringify(list));
        return data.nisw;
    },
    
    removePendaftar: function(index) {
        let list = this.getPendaftar();
        list.splice(index, 1);
        localStorage.setItem("dataPendaftar", JSON.stringify(list));
    },

    // ===== ABSENSI =====
    cekDuplicateAbsensi: function(nisw, tanggal) {
        const list = JSON.parse(localStorage.getItem("dataAbsensi")) || [];
        return list.some(a => String(a.nisw).toUpperCase() === String(nisw).toUpperCase() && a.tanggal === tanggal);
    },
    
    addAbsensi: function(data) {
        let list = JSON.parse(localStorage.getItem("dataAbsensi")) || [];
        list.push(data);
        localStorage.setItem("dataAbsensi", JSON.stringify(list));
        return true;
    },
    
    getAbsensi: function() { 
        return JSON.parse(localStorage.getItem("dataAbsensi")) || []; 
    },
    
    deleteAbsensi: function(index) {
        let list = this.getAbsensi();
        list.splice(index, 1);
        localStorage.setItem("dataAbsensi", JSON.stringify(list));
    },
    
    updateAbsensi: function(index, updateData) {
        let list = this.getAbsensi();
        if (list[index]) list[index] = {...list[index], ...updateData};
        localStorage.setItem("dataAbsensi", JSON.stringify(list));
    },

    // ===== KEUANGAN =====
    getKeuangan: function() { 
        return JSON.parse(localStorage.getItem("dataKeuangan")) || []; 
    },
    
    addKeuangan: function(data) {
        let list = this.getKeuangan();
        data.tgl = data.tgl || this.getTglSekarang();
        list.push(data);
        localStorage.setItem("dataKeuangan", JSON.stringify(list));
    },
    
    deleteKeuangan: function(index) {
        let list = this.getKeuangan();
        list.splice(index, 1);
        localStorage.setItem("dataKeuangan", JSON.stringify(list));
    },
    
    updateKeuangan: function(index, updateData) {
        let list = this.getKeuangan();
        if (list[index]) list[index] = {...list[index], ...updateData};
        localStorage.setItem("dataKeuangan", JSON.stringify(list));
    },

    // ===== NILAI RAPORT =====
    getNilai: function() { 
        return JSON.parse(localStorage.getItem("dataNilai")) || []; 
    },
    
    updateNilai: function(nisw, dataNilai) {
        let list = this.getNilai();
        const idx = list.findIndex(n => String(n.nisw).toUpperCase() === String(nisw).toUpperCase());
        if (idx > -1) list[idx] = {...list[idx], ...dataNilai};
        else list.push(dataNilai);
        localStorage.setItem("dataNilai", JSON.stringify(list));
    },

    // ===== SARAN =====
    getSaran: function() {
        return JSON.parse(localStorage.getItem("dataSaran")) || [];
    },
    
    addSaran: function(data) {
        let list = this.getSaran();
        data.id = Date.now();
        data.waktu = this.getTglSekarang();
        data.dibaca = false;
        list.push(data);
        localStorage.setItem("dataSaran", JSON.stringify(list));
        return true;
    },
    
    deleteSaran: function(id) {
        let list = this.getSaran();
        list = list.filter(s => s.id !== id);
        localStorage.setItem("dataSaran", JSON.stringify(list));
    },
    
    markSaranAsDibaca: function(id) {
        let list = this.getSaran();
        const idx = list.findIndex(s => s.id === id);
        if (idx > -1) {
            list[idx].dibaca = true;
            localStorage.setItem("dataSaran", JSON.stringify(list));
        }
    },

    // ===== JADWAL LATIHAN =====
    getJadwalLatihan: function() {
        return JSON.parse(localStorage.getItem("db_latihan")) || [
            { id: 1, hari: "SELASA", tempat: "Stadion Mini Legok", waktu: "15.00 WIB" },
            { id: 2, hari: "KAMIS", tempat: "Stadion Mini Legok", waktu: "15.00 WIB" },
            { id: 3, hari: "MINGGU", tempat: "Lapangan Jaha", waktu: "07.00 WIB" }
        ];
    },
    
    addJadwalLatihan: function(data) {
        let list = this.getJadwalLatihan();
        data.id = Date.now();
        list.push(data);
        localStorage.setItem("db_latihan", JSON.stringify(list));
    },
    
    updateJadwalLatihan: function(id, updateData) {
        let list = this.getJadwalLatihan();
        const idx = list.findIndex(j => j.id === id);
        if (idx > -1) {
            list[idx] = {...list[idx], ...updateData};
            localStorage.setItem("db_latihan", JSON.stringify(list));
        }
    },
    
    deleteJadwalLatihan: function(id) {
        let list = this.getJadwalLatihan();
        list = list.filter(j => j.id !== id);
        localStorage.setItem("db_latihan", JSON.stringify(list));
    },

    // ===== JADWAL TURNAMEN =====
    getJadwalTurnamen: function() {
        return JSON.parse(localStorage.getItem("db_turnamen")) || [];
    },
    
    addJadwalTurnamen: function(data) {
        let list = this.getJadwalTurnamen();
        data.id = Date.now();
        list.push(data);
        localStorage.setItem("db_turnamen", JSON.stringify(list));
    },
    
    updateJadwalTurnamen: function(id, updateData) {
        let list = this.getJadwalTurnamen();
        const idx = list.findIndex(j => j.id === id);
        if (idx > -1) {
            list[idx] = {...list[idx], ...updateData};
            localStorage.setItem("db_turnamen", JSON.stringify(list));
        }
    },
    
    deleteJadwalTurnamen: function(id) {
        let list = this.getJadwalTurnamen();
        list = list.filter(j => j.id !== id);
        localStorage.setItem("db_turnamen", JSON.stringify(list));
    },

    // ===== HELPER FUNCTIONS =====
    getTotalSiswa: function() { 
        return this.getSiswaAktif().length; 
    },
    
    getTotalPendaftar: function() {
        return this.getPendaftar().length;
    },
    
    getTotalSaranBelumDibaca: function() {
        return this.getSaran().filter(s => !s.dibaca).length;
    },
    
    hitungPresensiBySiswa: function(nisw) {
        const absensiSiswa = this.getAbsensi().filter(a => 
            String(a.nisw).toUpperCase() === String(nisw).toUpperCase() && a.status === 'Hadir'
        );
        const totalAbsensi = this.getAbsensi().filter(a => 
            String(a.nisw).toUpperCase() === String(nisw).toUpperCase()
        );
        if (totalAbsensi.length === 0) return 0;
        return Math.round((absensiSiswa.length / totalAbsensi.length) * 100);
    },

    // ===== FORMAT TANGGAL =====
    formatTanggalPendek: function(tgl) {
        if (!tgl) return "-";
        let [d,m,y] = tgl.split(/[\/\-]/);
        return `${d}-${m}-${String(y).slice(-2)}`;
    },
    
    formatTanggalIndonesia: function(tgl) {
        if (!tgl) return "-";
        let [d,m,y] = tgl.split(/[\/\-]/);
        const bln = ["Januari", "Feb", "Maret", "April", "Mei", "Juni", "Juli", "Agu", "Sep", "Okt", "Nov", "Des"];
        return `${d} ${bln[(Number(m)-1) || 0]} ${y}`;
    },

    // ===== BACKUP & RESTORE =====
    backupAllData: function() {
        const backup = {};
        ["dataSiswa","dataBeasiswa","dataPendaftar","dataAbsensi","dataKeuangan","dataNilai","dataSaran","db_latihan","db_turnamen"].forEach(key => {
            backup[key] = JSON.parse(localStorage.getItem(key) || "[]");
        });
        return JSON.stringify(backup, null, 2);
    },
    
    exportDataToFile: function() {
        const dataStr = this.backupAllData();
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `SSB_Backup_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
    },
    
    restoreDataFromFile: function(jsonString) {
        try {
            const backup = JSON.parse(jsonString);
            Object.keys(backup).forEach(key => {
                localStorage.setItem(key, JSON.stringify(backup[key]));
            });
            return true;
        } catch(e) {
            console.error("Error restoring backup:", e);
            return false;
        }
    }
};

// AUTO INIT
DBManager.initData();
window.DBManager = DBManager;
console.log("🚀 DBManager ENHANCED sudah aktif - Semua halaman sinkron dengan koneksi penuh");