/**
 * DATABASE MANAGER - SSB WIND SOCCER
 * Firestore + LocalStorage Sync
 * Version: 3.0 (Production Ready)
 */

console.log("📦 Loading db-sync.js...");

// ============ GLOBAL DB MANAGER ============
window.DBManager = {

  // ===== GET CURRENT DATE =====
  getTglSekarang: function() {
    return new Date().toLocaleDateString('id-ID');
  },

  // ===== GENERATE NISW =====
  generateNISW: function() {
    const tahun = new Date().getFullYear().toString().slice(-2);
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return 'R' + tahun + randomNum;
  },

  // ===== ADD PENDAFTAR =====
  addPendaftar: function(data, callback) {
    console.log("➕ Adding pendaftar...");
    
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
        tipe: data.tipe || 'Reguler',
        status: 'Menunggu',
        tglDaftar: this.getTglSekarang(),
        createdAt: new Date().toISOString()
      };

      // Simpan ke localStorage
      let pendaftarList = [];
      const stored = localStorage.getItem('pendaftarData');
      if (stored) {
        pendaftarList = JSON.parse(stored);
      }
      pendaftarList.push(newPendaftar);
      localStorage.setItem('pendaftarData', JSON.stringify(pendaftarList));

      console.log("✅ Pendaftar added:", nisw);
      callback(true);

    } catch (error) {
      console.error("❌ Error addPendaftar:", error);
      callback(false);
    }
  },

  // ===== GET PENDAFTAR =====
  getPendaftar: function(callback) {
    console.log("🔍 Fetching pendaftar...");
    
    try {
      const stored = localStorage.getItem('pendaftarData');
      const data = stored ? JSON.parse(stored) : [];
      
      console.log("✅ Pendaftar loaded:", data.length);
      callback(data);

    } catch (error) {
      console.error("❌ Error getPendaftar:", error);
      callback([]);
    }
  },

  // ===== GET SISWA AKTIF =====
  getSiswaAktif: function(callback) {
    console.log("🔍 Fetching siswa aktif...");
    
    try {
      // Cek localStorage dulu
      const stored = localStorage.getItem('siswaData');
      
      if (stored && stored !== '[]') {
        const allSiswa = JSON.parse(stored);
        const aktivSiswa = allSiswa.filter(s => s.status === 'Aktif');
        console.log("✅ Siswa aktif loaded:", aktivSiswa.length);
        callback(aktivSiswa);
        return;
      }

      // Jika tidak ada, buat demo data
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
      callback(demoSiswa);

    } catch (error) {
      console.error("❌ Error getSiswaAktif:", error);
      callback([]);
    }
  },

  // ===== FIND SISWA BY NISW =====
  findSiswa: function(nisw, callback) {
    console.log("🔍 Finding siswa:", nisw.toUpperCase());
    
    try {
      // Pertama cek di siswaData
      const stored = localStorage.getItem('siswaData');
      if (stored) {
        const siswaList = JSON.parse(stored);
        const siswa = siswaList.find(s => s.nisw?.toUpperCase() === nisw.toUpperCase());
        
        if (siswa) {
          console.log("✅ Siswa found:", siswa.nama);
          callback(siswa);
          return;
        }
      }

      // Jika tidak ketemu, cek di pendaftarData
      const pendaftarStored = localStorage.getItem('pendaftarData');
      if (pendaftarStored) {
        const pendaftarList = JSON.parse(pendaftarStored);
        const pendaftar = pendaftarList.find(p => p.nisw?.toUpperCase() === nisw.toUpperCase());
        
        if (pendaftar) {
          console.log("✅ Pendaftar found:", pendaftar.nama);
          callback(pendaftar);
          return;
        }
      }

      console.warn("⚠️ Siswa not found:", nisw);
      callback(null);

    } catch (error) {
      console.error("❌ Error findSiswa:", error);
      callback(null);
    }
  },

  // ===== GET ABSENSI =====
  getAbsensi: function(callback) {
    console.log("🔍 Fetching absensi...");
    
    try {
      const stored = localStorage.getItem('absensiData');
      const data = stored ? JSON.parse(stored) : [];
      
      console.log("✅ Absensi loaded:", data.length);
      callback(data);

    } catch (error) {
      console.error("❌ Error getAbsensi:", error);
      callback([]);
    }
  },

  // ===== ADD ABSENSI =====
  addAbsensi: function(data, callback) {
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
      callback(true);

    } catch (error) {
      console.error("❌ Error addAbsensi:", error);
      callback(false);
    }
  },

  // ===== GET SARAN =====
  getSaran: function(callback) {
    console.log("🔍 Fetching saran...");
    
    try {
      const stored = localStorage.getItem('saranData');
      const data = stored ? JSON.parse(stored) : [];
      
      console.log("✅ Saran loaded:", data.length);
      callback(data);

    } catch (error) {
      console.error("❌ Error getSaran:", error);
      callback([]);
    }
  },

  // ===== ADD SARAN =====
  addSaran: function(data, callback) {
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
      callback(true);

    } catch (error) {
      console.error("❌ Error addSaran:", error);
      callback(false);
    }
  },

  // ===== DELETE SARAN =====
  deleteSaran: function(id, callback) {
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
      callback(true);

    } catch (error) {
      console.error("❌ Error deleteSaran:", error);
      callback(false);
    }
  },

  // ===== GET RAPORT =====
  getRaport: function(callback) {
    console.log("🔍 Fetching raport...");
    
    try {
      const stored = localStorage.getItem('raportData');
      const data = stored ? JSON.parse(stored) : [];
      
      console.log("✅ Raport loaded:", data.length);
      callback(data);

    } catch (error) {
      console.error("❌ Error getRaport:", error);
      callback([]);
    }
  },

  // ===== ADD RAPORT =====
  addRaport: function(data, callback) {
    console.log("➕ Adding raport...");
    
    try {
      let raportList = [];
      const stored = localStorage.getItem('raportData');
      if (stored) {
        raportList = JSON.parse(stored);
      }

      const newRaport = {
        id: Date.now(),
        nisw: data.nisw || '',
        nama: data.nama || '',
        ...data,
        createdAt: new Date().toISOString()
      };

      raportList.push(newRaport);
      localStorage.setItem('raportData', JSON.stringify(raportList));

      console.log("✅ Raport added");
      callback(true);

    } catch (error) {
      console.error("❌ Error addRaport:", error);
      callback(false);
    }
  },

  // ===== UPDATE PENDAFTAR STATUS =====
  updatePendaftarStatus: function(nisw, status, callback) {
    console.log("✏️ Updating status:", nisw, status);
    
    try {
      let pendaftarList = [];
      const stored = localStorage.getItem('pendaftarData');
      if (stored) {
        pendaftarList = JSON.parse(stored);
      }

      const idx = pendaftarList.findIndex(p => p.nisw === nisw);
      if (idx !== -1) {
        pendaftarList[idx].status = status;
        localStorage.setItem('pendaftarData', JSON.stringify(pendaftarList));
        console.log("✅ Status updated");
        callback(true);
      } else {
        console.warn("⚠️ Pendaftar not found");
        callback(false);
      }

    } catch (error) {
      console.error("❌ Error updatePendaftarStatus:", error);
      callback(false);
    }
  }
};

console.log("✅ db-sync.js loaded - DBManager ready!");
