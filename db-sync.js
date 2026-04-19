/**
 * DATABASE MANAGER - SSB WIND SOCCER
 * Full Final Version with Approve & Reject + WA Notif Ready
 * Version: 5.2 (FINAL)
 */

console.log("📦 db-sync.js v5.2 - FULL FINAL LOADED");

window.DBManager = {

    // ==================== HELPER ====================
    getTglSekarang: function() {
        return new Date().toLocaleDateString('id-ID');
    },

    // ==================== GENERATE NISW ====================
    generateNISW: function(tipe = 'Reguler') {
        const tahun = new Date().getFullYear().toString().slice(-2);
        const prefix = tipe === 'Beasiswa' ? 'B' : 'R';

        let allNISW = [];
        const siswaStored = localStorage.getItem('siswaData');
        const pendaftarStored = localStorage.getItem('pendaftarData');

        if (siswaStored) {
            try { allNISW = allNISW.concat(JSON.parse(siswaStored).map(s => s.nisw || '')); } catch(e){}
        }
        if (pendaftarStored) {
            try { allNISW = allNISW.concat(JSON.parse(pendaftarStored).map(p => p.nisw || '')); } catch(e){}
        }

        const niswDenganPrefix = allNISW.filter(n => n && n.startsWith(prefix + tahun));
        let nextUrutan = 1;

        if (niswDenganPrefix.length > 0) {
            const urutanArray = niswDenganPrefix.map(n => parseInt(n.substring(5))).sort((a, b) => b - a);
            nextUrutan = urutanArray[0] + 1;
        }

        const nomorUrutan = nextUrutan.toString().padStart(3, '0');
        return prefix + tahun + nomorUrutan;
    },

    // ==================== PENDAFTAR ====================
    addPendaftar: async function(data) {
        const nisw = this.generateNISW(data.tipe || 'Reguler');
        
        const newPendaftar = {
            nisw: nisw,
            nama: data.nama || '',
            tglLahir: data.tglLahir || '',
            kategori: data.kategori || '',
            posisi: data.posisi || '',
            namaOrtu: data.namaOrtu || '',
            noHp: data.noHp || '',
            alamat: data.alamat || '',
            alasan: data.alasan || '',
            penjelasanAlasan: data.penjelasanAlasan || '',
            tipe: data.tipe || 'Reguler',
            foto: data.foto || '',
            status: 'Menunggu Verifikasi',
            tglDaftar: this.getTglSekarang(),
            createdAt: new Date().toISOString()
        };

        let list = this.getPendaftar();
        list.push(newPendaftar);
        localStorage.setItem('pendaftarData', JSON.stringify(list));

        console.log(`✅ Pendaftar ditambahkan → NISW: ${nisw}`);
        return nisw;
    },

    getPendaftar: function(callback) {
        const stored = localStorage.getItem('pendaftarData');
        const data = stored ? JSON.parse(stored) : [];
        if (typeof callback === 'function') callback(data);
        return data;
    },

    // ==================== APPROVE PENDAFTAR ====================
    approvePendaftar: function(nisw, callback) {
        let pendaftarList = this.getPendaftar();
        const index = pendaftarList.findIndex(p => p.nisw === nisw);

        if (index === -1) {
            if (typeof callback === 'function') callback(false);
            return false;
        }

        const pendaftar = pendaftarList[index];

        const siswaBaru = {
            ...pendaftar,
            status: "Aktif",
            tglAktif: new Date().toLocaleString('id-ID'),
            createdAt: new Date().toISOString()
        };

        let siswaList = [];
        const storedSiswa = localStorage.getItem('siswaData');
        if (storedSiswa) siswaList = JSON.parse(storedSiswa);
        
        siswaList.push(siswaBaru);
        localStorage.setItem('siswaData', JSON.stringify(siswaList));

        pendaftarList.splice(index, 1);
        localStorage.setItem('pendaftarData', JSON.stringify(pendaftarList));

        console.log(`✅ ${pendaftar.nama} (${nisw}) BERHASIL DISETUJUI`);
        if (typeof callback === 'function') callback(true, nisw);
        return true;
    },

    // ==================== REJECT PENDAFTAR (BARU) ====================
    rejectPendaftar: function(nisw, callback) {
        let pendaftarList = this.getPendaftar();
        const index = pendaftarList.findIndex(p => p.nisw === nisw);

        if (index === -1) {
            if (typeof callback === 'function') callback(false);
            return false;
        }

        const pendaftar = pendaftarList[index];
        pendaftarList.splice(index, 1);
        localStorage.setItem('pendaftarData', JSON.stringify(pendaftarList));

        console.log(`❌ ${pendaftar.nama} (${nisw}) DITOLAK`);
        if (typeof callback === 'function') callback(true);
        return true;
    },

    // ==================== SISWA AKTIF ====================
    getSiswaAktifArray: function() {
        const stored = localStorage.getItem('siswaData');
        return stored ? JSON.parse(stored) : [];
    },

    getSiswaAktif: function(callback) {
        const list = this.getSiswaAktifArray();
        const aktif = list.filter(s => s.status === 'Aktif');
        if (typeof callback === 'function') callback(aktif);
        return aktif;
    },

    findSiswa: function(nisw, callback) {
        const list = this.getSiswaAktifArray();
        const siswa = list.find(s => s.nisw === nisw);
        if (typeof callback === 'function') callback(siswa || null);
        return siswa || null;
    },

    // ==================== ABSENSI ====================
    cekDuplicateAbsensi: function(nisw, tanggal, callback) {
        const stored = localStorage.getItem('absensiData');
        if (!stored) return callback ? callback(false) : false;
        const list = JSON.parse(stored);
        const duplikat = list.some(a => a.nisw === nisw && a.tanggal === tanggal);
        if (callback) callback(duplikat);
        return duplikat;
    },

    addAbsensi: function(data, callback) {
        let list = [];
        const stored = localStorage.getItem('absensiData');
        if (stored) list = JSON.parse(stored);

        list.push({
            ...data,
            id: Date.now(),
            waktuInput: new Date().toLocaleString('id-ID'),
            createdAt: new Date().toISOString()
        });

        localStorage.setItem('absensiData', JSON.stringify(list));
        if (callback) callback(true);
    },

    getAbsensi: function(callback) {
        const stored = localStorage.getItem('absensiData');
        const data = stored ? JSON.parse(stored) : [];
        if (callback) callback(data);
        return data;
    },

    // ==================== SARAN ====================
    addSaran: function(data) {
        let list = [];
        const stored = localStorage.getItem('saranData');
        if (stored) list = JSON.parse(stored);

        list.push({
            id: Date.now(),
            ...data,
            tanggal: new Date().toLocaleDateString('id-ID'),
            createdAt: new Date().toISOString()
        });

        localStorage.setItem('saranData', JSON.stringify(list));
        return true;
    },

    getSaran: function(callback) {
        const stored = localStorage.getItem('saranData');
        const data = stored ? JSON.parse(stored) : [];
        if (callback) callback(data);
        return data;
    },

    deleteSaran: function(id) {
        let list = [];
        const stored = localStorage.getItem('saranData');
        if (stored) list = JSON.parse(stored);

        list = list.filter(s => s.id !== id);
        localStorage.setItem('saranData', JSON.stringify(list));
        return true;
    },

    // ==================== DEMO DATA ====================
    initializeDemoData: function() {
        console.log("🎬 Initializing demo data...");

        if (!localStorage.getItem('siswaData')) {
            localStorage.setItem('siswaData', JSON.stringify([
                { nisw: "R2026001", nama: "Ahmad Rizky", kategori: "KU-14", tipe: "Reguler", status: "Aktif" },
                { nisw: "B2026001", nama: "Sinta Purwanto", kategori: "KU-12", tipe: "Beasiswa", status: "Aktif" }
            ]));
        }

        if (!localStorage.getItem('pendaftarData')) {
            localStorage.setItem('pendaftarData', JSON.stringify([]));
        }

        console.log("✅ Demo data ready");
    },

    setLoginUser: function(siswa) {
        sessionStorage.setItem('loginUser', JSON.stringify(siswa));
    },

    getLoginUser: function() {
        const user = sessionStorage.getItem('loginUser');
        return user ? JSON.parse(user) : null;
    }
};

// Auto initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => DBManager.initializeDemoData());
} else {
    DBManager.initializeDemoData();
}

console.log("✅ db-sync.js v5.2 FULL LOADED & READY!");
