/**
 * DATABASE MANAGER - SSB WIND SOCCER
 * Firestore + LocalStorage Sync
 * Version: 4.0 (FIXED - Async/Await Pattern)
 */

console.log("📦 Loading db-sync.js v4.0...");

// ============ GLOBAL DB MANAGER ============
window.DBManager = {

  getTglSekarang: function() {
    return new Date().toLocaleDateString('id-ID');
  },

  generateNISW: function() {
    const tahun = new Date().getFullYear().toString().slice(-2);
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return 'R' + tahun + randomNum;
  },

  // ===== ADD PENDAFTAR (ASYNC) =====
  addPendaftar: async function(data) {
    console.log("➕ Adding pendaftar...", data);
    
    try {
      const nisw = this.generateNISW();
      
      const newPendaftar = {
        nisw: nisw,
        nama: data.nama || '',
        tglLahir: data.tglLahir || '',
        kategori: data.kategori || '',
        posisi: data.posisi || 'Forward',
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

      // Simpan ke localStorage
      let pendaftarList = [];
      const stored = localStorage.getItem('pendaftarData');
      if (stored) {
        try {
          pendaftarList = JSON.parse(stored);
        } catch (e) {
          pendaftarList = [];
        }
      }
      
      pendaftarList.push(newPendaftar);
      localStorage.setItem('pendaftarData', JSON.stringify(pendaftarList));

      console.log("✅ Pendaftar added:", nisw);
      return nisw;

    } catch (error) {
      console.error("❌ Error addPendaftar:", error);
      throw error;
    }
  },

  // ===== GET PENDAFTAR =====
  getPendaftar: function(callback) {
    console.log("🔍 Fetching pendaftar...");
    
    try {
      const stored = localStorage.getItem('pendaftarData');
      const data = stored ? JSON.parse(stored) : [];
      
      console.log("✅ Pendaftar loaded:", data.length);
      if (typeof callback === 'function') {
        callback(data);
      }
      return data;

    } catch (error) {
      console.error("❌ Error getPendaftar:", error);
      if (typeof callback === 'function') {
        callback([]);
      }
      return [];
    }
  },

  // ===== GET SISWA AKTIF (DENGAN DEMO DATA) =====
  getSiswaAktif: function(callback) {
    console.log("🔍 Fetching siswa aktif...");
    
    try {
      const stored = localStorage.getItem('siswaData');
      
      if (stored && stored !== '[]') {
        const allSiswa = JSON.parse(stored);
        const aktivSiswa = allSiswa.filter(s => s.status === 'Aktif');
        console.log("✅ Siswa aktif loaded:", aktivSiswa.length);
        if (typeof callback === 'function') {
          callback(aktivSiswa);
        }
        return;
      }

      // GENERATE DEMO DATA SISWA
      console.log("📝 Creating demo siswa data...");
      const demoSiswa = [
        {
          nisw: 'R260001',
          nama: 'Ahmad Rizky',
          tglLahir: '2010-05-15',
          kategori: 'KU-14',
          tipe: 'Reguler',
          posisi: 'Penyerang',
          foto: 'https://via.placeholder.com/40?text=AR',
          namaOrtu: 'Budi Santoso',
          noHp: '082123456789',
          alamat: 'Jl. Merdeka 123, Bogor',
          statusPembayaran: 'Lunas',
          tagihan: 0,
          status: 'Aktif'
        },
        {
          nisw: 'R260002',
          nama: 'Sinta Purwanto',
          tglLahir: '2012-08-22',
          kategori: 'KU-12',
          tipe: 'Beasiswa',
          posisi: 'Gelandang',
          foto: 'https://via.placeholder.com/40?text=SP',
          namaOrtu: 'Purwanto',
          noHp: '081234567890',
          alamat: 'Jl. Sudirman 456, Tangerang',
          statusPembayaran: 'Cicilan',
          tagihan: 100000,
          status: 'Aktif'
        },
        {
          nisw: 'R260003',
          nama: 'Rendi Maulana',
          tglLahir: '2014-03-10',
          kategori: 'KU-10',
          tipe: 'Beasiswa',
          posisi: 'Bek',
          foto: 'https://via.placeholder.com/40?text=RM',
          namaOrtu: 'Maulana',
          noHp: '085123456789',
          alamat: 'Jl. Ahmad Yani 789, Bekasi',
          statusPembayaran: 'Belum Bayar',
          tagihan: 200000,
          status: 'Aktif'
        }
      ];

      localStorage.setItem('siswaData', JSON.stringify(demoSiswa));
      console.log("✅ Demo siswa created:", demoSiswa.length);
      if (typeof callback === 'function') {
        callback(demoSiswa);
      }

    } catch (error) {
      console.error("❌ Error getSiswaAktif:", error);
      if (typeof callback === 'function') {
        callback([]);
      }
    }
  },

  // ===== FIND SISWA BY NISW =====
  findSiswa: function(nisw, callback) {
    console.log("🔍 Finding siswa:", nisw.toUpperCase());
    
    try {
      const stored = localStorage.getItem('siswaData');
      if (stored) {
        const siswaList = JSON.parse(stored);
        const siswa = siswaList.find(s => s.nisw?.toUpperCase() === nisw.toUpperCase());
        
        if (siswa) {
          console.log("✅ Siswa found:", siswa.nama);
          if (typeof callback === 'function') {
            callback(siswa);
          }
          return siswa;
        }
      }

      console.warn("⚠️ Siswa not found:", nisw);
      if (typeof callback === 'function') {
        callback(null);
      }
      return null;

    } catch (error) {
      console.error("❌ Error findSiswa:", error);
      if (typeof callback === 'function') {
        callback(null);
      }
      return null;
    }
  },

  // ===== GET ABSENSI (DENGAN DEMO DATA) =====
  getAbsensi: function(callback) {
    console.log("🔍 Fetching absensi...");
    
    try {
      const stored = localStorage.getItem('absensiData');
      
      if (stored && stored !== '[]') {
        const data = JSON.parse(stored);
        console.log("✅ Absensi loaded:", data.length);
        if (typeof callback === 'function') {
          callback(data);
        }
        return data;
      }

      // GENERATE DEMO DATA ABSENSI
      console.log("📝 Creating demo absensi data...");
      const tglHari = new Date().toLocaleDateString('id-ID');
      const demoAbsensi = [
        {
          id: 1,
          tanggal: tglHari,
          nisw: 'R260001',
          nama: 'Ahmad Rizky',
          status: 'Hadir',
          alasan: '-'
        },
        {
          id: 2,
          tanggal: tglHari,
          nisw: 'R260002',
          nama: 'Sinta Purwanto',
          status: 'Hadir',
          alasan: '-'
        },
        {
          id: 3,
          tanggal: tglHari,
          nisw: 'R260003',
          nama: 'Rendi Maulana',
          status: 'Izin',
          alasan: 'Sakit'
        }
      ];

      localStorage.setItem('absensiData', JSON.stringify(demoAbsensi));
      console.log("✅ Demo absensi created:", demoAbsensi.length);
      if (typeof callback === 'function') {
        callback(demoAbsensi);
      }
      return demoAbsensi;

    } catch (error) {
      console.error("❌ Error getAbsensi:", error);
      if (typeof callback === 'function') {
        callback([]);
      }
      return [];
    }
  },

  // ===== ADD ABSENSI =====
  addAbsensi: async function(data) {
    console.log("➕ Adding absensi...");
    
    try {
      let absensiList = [];
      const stored = localStorage.getItem('absensiData');
      if (stored) {
        absensiList = JSON.parse(stored);
      }

      const newAbsensi = {
        id: Date.now(),
        tanggal: data.tanggal || new Date().toLocaleDateString('id-ID'),
        nisw: data.nisw || '',
        nama: data.nama || '',
        status: data.status || 'Hadir',
        alasan: data.alasan || '-',
        createdAt: new Date().toISOString()
      };

      absensiList.push(newAbsensi);
      localStorage.setItem('absensiData', JSON.stringify(absensiList));

      console.log("✅ Absensi added");
      return true;

    } catch (error) {
      console.error("❌ Error addAbsensi:", error);
      throw error;
    }
  },

  // ===== GET SARAN =====
  getSaran: function(callback) {
    console.log("🔍 Fetching saran...");
    
    try {
      const stored = localStorage.getItem('saranData');
      const data = stored ? JSON.parse(stored) : [];
      
      console.log("✅ Saran loaded:", data.length);
      if (typeof callback === 'function') {
        callback(data);
      }
      return data;

    } catch (error) {
      console.error("❌ Error getSaran:", error);
      if (typeof callback === 'function') {
        callback([]);
      }
      return [];
    }
  },

  // ===== ADD SARAN =====
  addSaran: async function(data) {
    console.log("➕ Adding saran...");
    
    try {
      let saranList = [];
      const stored = localStorage.getItem('saranData');
      if (stored) {
        saranList = JSON.parse(stored);
      }

      const newSaran = {
        id: Date.now(),
        tanggal: new Date().toLocaleDateString('id-ID'),
        nisw: data.nisw || '',
        nama: data.nama || '',
        kategori: data.kategori || 'Lainnya',
        pesan: data.pesan || '',
        createdAt: new Date().toISOString()
      };

      saranList.push(newSaran);
      localStorage.setItem('saranData', JSON.stringify(saranList));

      console.log("✅ Saran added");
      return true;

    } catch (error) {
      console.error("❌ Error addSaran:", error);
      throw error;
    }
  },

  // ===== DELETE SARAN =====
  deleteSaran: async function(id) {
    console.log("🗑️ Deleting saran:", id);
    
    try {
      let saranList = [];
      const stored = localStorage.getItem('saranData');
      if (stored) {
        saranList = JSON.parse(stored);
      }

      saranList = saranList.filter(s => s.id !== id);
      localStorage.setItem('saranData', JSON.stringify(saranList));

      console.log("✅ Saran deleted");
      return true;

    } catch (error) {
      console.error("❌ Error deleteSaran:", error);
      throw error;
    }
  },

  // ===== UPDATE SISWA =====
  updateSiswa: async function(nisw, data) {
    console.log("✏️ Updating siswa:", nisw);
    
    try {
      let siswaList = [];
      const stored = localStorage.getItem('siswaData');
      if (stored) {
        siswaList = JSON.parse(stored);
      }

      const idx = siswaList.findIndex(s => s.nisw === nisw);
      if (idx !== -1) {
        siswaList[idx] = { ...siswaList[idx], ...data };
        localStorage.setItem('siswaData', JSON.stringify(siswaList));
        console.log("✅ Siswa updated");
        return true;
      }

      return false;

    } catch (error) {
      console.error("❌ Error updateSiswa:", error);
      throw error;
    }
  },

  // ===== DELETE SISWA =====
  deleteSiswa: async function(nisw) {
    console.log("🗑️ Deleting siswa:", nisw);
    
    try {
      let siswaList = [];
      const stored = localStorage.getItem('siswaData');
      if (stored) {
        siswaList = JSON.parse(stored);
      }

      siswaList = siswaList.filter(s => s.nisw !== nisw);
      localStorage.setItem('siswaData', JSON.stringify(siswaList));

      console.log("✅ Siswa deleted");
      return true;

    } catch (error) {
      console.error("❌ Error deleteSiswa:", error);
      throw error;
    }
  }
};

console.log("✅ db-sync.js v4.0 loaded - DBManager ready!");
