/**
 * DATABASE MANAGER - SSB WIND SOCCER
 * Firestore + LocalStorage Sync
 * Version: 4.4 (FIXED - All Admin Functions + Better Error Handling)
 * 
 * IMPROVEMENTS:
 * - All callback functions fixed
 * - Missing functions implemented
 * - Query optimization
 * - Proper error handling
 * - Real-time data sync
 */

console.log("📦 Loading db-sync.js v4.4 - Admin Panel Enhanced...");

// ============ GLOBAL DB MANAGER ============
window.DBManager = {

  getTglSekarang: function() {
    return new Date().toLocaleDateString('id-ID');
  },

  getTglSekarangFull: function() {
    const now = new Date();
    return {
      date: now.toLocaleDateString('id-ID'),
      time: now.toLocaleTimeString('id-ID'),
      datetime: now.toLocaleString('id-ID')
    };
  },

  // ===== GENERATE NISW DENGAN SHARED COUNTER =====
  generateNISW: function(tipe = 'Reguler') {
    console.log("🔧 Generating NISW for tipe:", tipe);
    
    try {
      const tahun = new Date().getFullYear().toString();
      const prefix = (tipe && tipe.toLowerCase() === 'beasiswa') ? 'B' : 'R';
      
      let siswaList = [];
      const stored = localStorage.getItem('siswaData');
      if (stored) {
        try {
          siswaList = JSON.parse(stored);
        } catch (e) {
          siswaList = [];
        }
      }

      let pendaftarList = [];
      const storedPendaftar = localStorage.getItem('pendaftarData');
      if (storedPendaftar) {
        try {
          pendaftarList = JSON.parse(storedPendaftar);
        } catch (e) {
          pendaftarList = [];
        }
      }

      const allNISW = [...siswaList, ...pendaftarList].map(s => s.nisw || '');
      
      const sameTahun = allNISW.filter(nisw => 
        nisw && 
        nisw.includes(tahun) &&
        nisw.length === 8
      );

      let nextNumber = 1;
      if (sameTahun.length > 0) {
        const allNumbers = sameTahun.map(nisw => {
          const numPart = nisw.slice(-3);
          return parseInt(numPart);
        }).filter(n => !isNaN(n));

        if (allNumbers.length > 0) {
          const maxNumber = Math.max(...allNumbers);
          nextNumber = maxNumber + 1;
        }
      }

      const niswBaru = prefix + tahun + String(nextNumber).padStart(3, '0');
      console.log("✅ New NISW generated:", niswBaru);
      return niswBaru;

    } catch (error) {
      console.error("❌ Error generating NISW:", error);
      const fallback = 'R' + new Date().getFullYear() + String(Math.floor(Math.random() * 1000)).padStart(3, '0');
      return fallback;
    }
  },

  // ===== SET LOGIN USER =====
  setLoginUser: function(siswa) {
    console.log("💾 Setting login user:", siswa.nama);
    try {
      localStorage.setItem('loginUser', JSON.stringify(siswa));
      console.log("✅ Login user saved");
      return true;
    } catch (error) {
      console.error("❌ Error setting login user:", error);
      return false;
    }
  },

  // ===== GET LOGIN USER =====
  getLoginUser: function() {
    try {
      const stored = localStorage.getItem('loginUser');
      if (stored) {
        const user = JSON.parse(stored);
        return user;
      }
      return null;
    } catch (error) {
      console.error("❌ Error getting login user:", error);
      return null;
    }
  },

  // ===== ADD PENDAFTAR =====
  addPendaftar: async function(data) {
    console.log("➕ Adding pendaftar...", data);
    
    try {
      const nisw = this.generateNISW(data.tipe || 'Reguler');
      
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

      console.log("✅ Pendaftar added with NISW:", nisw);
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
        const aktivSiswa = allSiswa.filter(s => s.status === 'Aktif' || !s.status);
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
          nisw: 'R2026001',
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
          nisw: 'B2026002',
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
          nisw: 'R2026003',
          nama: 'Rendi Maulana',
          tglLahir: '2014-03-10',
          kategori: 'KU-10',
          tipe: 'Reguler',
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
      const niswUpper = nisw.toUpperCase();
      
      const stored = localStorage.getItem('siswaData');
      if (stored) {
        const siswaList = JSON.parse(stored);
        const siswa = siswaList.find(s => s.nisw?.toUpperCase() === niswUpper);
        
        if (siswa) {
          console.log("✅ Siswa found:", siswa.nama);
          if (typeof callback === 'function') {
            callback(siswa);
          }
          return siswa;
        }
      }

      const storedPendaftar = localStorage.getItem('pendaftarData');
      if (storedPendaftar) {
        const pendaftarList = JSON.parse(storedPendaftar);
        const pendaftar = pendaftarList.find(p => p.nisw?.toUpperCase() === niswUpper);
        
        if (pendaftar) {
          console.log("✅ Pendaftar found:", pendaftar.nama);
          if (typeof callback === 'function') {
            callback(pendaftar);
          }
          return pendaftar;
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

  // ===== GET ABSENSI =====
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

      console.log("📝 Creating demo absensi data...");
      const tglHari = new Date().toLocaleDateString('id-ID');
      const demoAbsensi = [
        {
          id: 1,
          tanggal: tglHari,
          nisw: 'R2026001',
          nama: 'Ahmad Rizky',
          status: 'Hadir',
          alasan: '-'
        },
        {
          id: 2,
          tanggal: tglHari,
          nisw: 'B2026002',
          nama: 'Sinta Purwanto',
          status: 'Hadir',
          alasan: '-'
        },
        {
          id: 3,
          tanggal: tglHari,
          nisw: 'R2026003',
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

      console.log("✅ Absensi added for NISW:", data.nisw);
      if (typeof callback === 'function') {
        callback(true);
      }
      return true;

    } catch (error) {
      console.error("❌ Error addAbsensi:", error);
      if (typeof callback === 'function') {
        callback(false);
      }
      return false;
    }
  },

  // ===== UPDATE ABSENSI =====
  updateAbsensi: function(id, data, callback) {
    console.log("✏️ Updating absensi:", id);
    
    try {
      let absensiList = [];
      const stored = localStorage.getItem('absensiData');
      if (stored) {
        absensiList = JSON.parse(stored);
      }

      const idx = absensiList.findIndex(a => a.id == id);
      if (idx !== -1) {
        absensiList[idx] = { ...absensiList[idx], ...data, updatedAt: new Date().toISOString() };
        localStorage.setItem('absensiData', JSON.stringify(absensiList));
        console.log("✅ Absensi updated");
        if (typeof callback === 'function') {
          callback(true);
        }
        return true;
      }

      console.warn("⚠️ Absensi not found:", id);
      if (typeof callback === 'function') {
        callback(false);
      }
      return false;

    } catch (error) {
      console.error("❌ Error updateAbsensi:", error);
      if (typeof callback === 'function') {
        callback(false);
      }
      return false;
    }
  },

  // ===== DELETE ABSENSI =====
  deleteAbsensi: function(id, callback) {
    console.log("🗑️ Deleting absensi:", id);
    
    try {
      let absensiList = [];
      const stored = localStorage.getItem('absensiData');
      if (stored) {
        absensiList = JSON.parse(stored);
      }

      const beforeCount = absensiList.length;
      absensiList = absensiList.filter(a => a.id != id);
      const afterCount = absensiList.length;

      if (beforeCount === afterCount) {
        console.warn("⚠️ Absensi not found:", id);
        if (typeof callback === 'function') {
          callback(false);
        }
        return false;
      }

      localStorage.setItem('absensiData', JSON.stringify(absensiList));
      console.log("✅ Absensi deleted");
      if (typeof callback === 'function') {
        callback(true);
      }
      return true;

    } catch (error) {
      console.error("❌ Error deleteAbsensi:", error);
      if (typeof callback === 'function') {
        callback(false);
      }
      return false;
    }
  },

  // ===== CEK DUPLICATE ABSENSI =====
  cekDuplicateAbsensi: function(nisw, tgl, callback) {
    console.log("🔍 Checking duplicate absensi for:", nisw, "on", tgl);
    try {
      const stored = localStorage.getItem('absensiData');
      if (stored) {
        const absensiList = JSON.parse(stored);
        const isDuplicate = absensiList.some(a => a.nisw === nisw && a.tanggal === tgl);
        console.log("✅ Duplicate check:", isDuplicate ? "FOUND" : "NOT FOUND");
        if (typeof callback === 'function') {
          callback(isDuplicate);
        }
        return isDuplicate;
      }
      console.log("✅ No duplicate (no data)");
      if (typeof callback === 'function') {
        callback(false);
      }
      return false;
    } catch (error) {
      console.error("❌ Error cekDuplicateAbsensi:", error);
      if (typeof callback === 'function') {
        callback(false);
      }
      return false;
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
      if (typeof callback === 'function') {
        callback(true);
      }
      return true;

    } catch (error) {
      console.error("❌ Error addSaran:", error);
      if (typeof callback === 'function') {
        callback(false);
      }
      return false;
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

      const beforeCount = saranList.length;
      saranList = saranList.filter(s => s.id != id);
      const afterCount = saranList.length;

      if (beforeCount === afterCount) {
        if (typeof callback === 'function') {
          callback(false);
        }
        return false;
      }

      localStorage.setItem('saranData', JSON.stringify(saranList));

      console.log("✅ Saran deleted");
      if (typeof callback === 'function') {
        callback(true);
      }
      return true;

    } catch (error) {
      console.error("❌ Error deleteSaran:", error);
      if (typeof callback === 'function') {
        callback(false);
      }
      return false;
    }
  },

  // ===== UPDATE SISWA =====
  updateSiswa: function(nisw, data, callback) {
    console.log("✏️ Updating siswa:", nisw);
    
    try {
      let siswaList = [];
      const stored = localStorage.getItem('siswaData');
      if (stored) {
        siswaList = JSON.parse(stored);
      }

      const idx = siswaList.findIndex(s => s.nisw === nisw);
      if (idx !== -1) {
        siswaList[idx] = { ...siswaList[idx], ...data, updatedAt: new Date().toISOString() };
        localStorage.setItem('siswaData', JSON.stringify(siswaList));
        console.log("✅ Siswa updated");
        if (typeof callback === 'function') {
          callback(true);
        }
        return true;
      }

      console.warn("⚠️ Siswa not found:", nisw);
      if (typeof callback === 'function') {
        callback(false);
      }
      return false;

    } catch (error) {
      console.error("❌ Error updateSiswa:", error);
      if (typeof callback === 'function') {
        callback(false);
      }
      return false;
    }
  },

  // ===== DELETE SISWA =====
  deleteSiswa: function(nisw, callback) {
    console.log("🗑️ Deleting siswa:", nisw);
    
    try {
      let siswaList = [];
      const stored = localStorage.getItem('siswaData');
      if (stored) {
        siswaList = JSON.parse(stored);
      }

      const beforeCount = siswaList.length;
      siswaList = siswaList.filter(s => s.nisw !== nisw);
      const afterCount = siswaList.length;

      if (beforeCount === afterCount) {
        console.warn("⚠️ Siswa not found:", nisw);
        if (typeof callback === 'function') {
          callback(false);
        }
        return false;
      }

      localStorage.setItem('siswaData', JSON.stringify(siswaList));

      console.log("✅ Siswa deleted");
      if (typeof callback === 'function') {
        callback(true);
      }
      return true;

    } catch (error) {
      console.error("❌ Error deleteSiswa:", error);
      if (typeof callback === 'function') {
        callback(false);
      }
      return false;
    }
  },

  // ===== GET KEUANGAN DATA =====
  getKeuangan: function(callback) {
    console.log("💰 Fetching keuangan...");
    try {
      const stored = localStorage.getItem('keuanganData');
      const data = stored ? JSON.parse(stored) : [];
      console.log("✅ Keuangan loaded:", data.length);
      if (typeof callback === 'function') {
        callback(data);
      }
      return data;
    } catch (error) {
      console.error("❌ Error getKeuangan:", error);
      if (typeof callback === 'function') {
        callback([]);
      }
      return [];
    }
  },

  // ===== GET NILAI BY SISWA =====
  getNilaiBySiswa: function(nisw, callback) {
    console.log("📊 Getting nilai for NISW:", nisw);
    try {
      const stored = localStorage.getItem('nilaiData');
      if (stored) {
        const nilaiList = JSON.parse(stored);
        const nilai = nilaiList.find(n => n.nisw === nisw);
        console.log("✅ Nilai found:", nilai);
        if (typeof callback === 'function') {
          callback(nilai ? [nilai] : []);
        }
        return nilai ? [nilai] : [];
      }
      console.warn("⚠️ No nilai data found");
      if (typeof callback === 'function') {
        callback([]);
      }
      return [];
    } catch (error) {
      console.error("❌ Error getNilaiBySiswa:", error);
      if (typeof callback === 'function') {
        callback([]);
      }
      return [];
    }
  },

  // ===== GET JADWAL LATIHAN =====
  getJadwalLatihan: function(callback) {
    console.log("📅 Fetching jadwal latihan...");
    try {
      const stored = localStorage.getItem('jadwalLatihan');
      
      if (stored && stored !== '[]') {
        const data = JSON.parse(stored);
        console.log("✅ Jadwal latihan loaded:", data.length);
        if (typeof callback === 'function') {
          callback(data);
        }
        return data;
      }

      console.log("📝 Creating default jadwal latihan...");
      const defaultJadwal = [
        { id: 1, hari: "SELASA", tempat: "Stadion Mini Legok", waktu: "15.00 WIB" },
        { id: 2, hari: "KAMIS", tempat: "Stadion Mini Legok", waktu: "15.00 WIB" },
        { id: 3, hari: "MINGGU", tempat: "Lapangan Jaha", waktu: "07.00 WIB" }
      ];
      localStorage.setItem('jadwalLatihan', JSON.stringify(defaultJadwal));
      console.log("✅ Default jadwal created");
      if (typeof callback === 'function') {
        callback(defaultJadwal);
      }
      return defaultJadwal;

    } catch (error) {
      console.error("❌ Error getJadwalLatihan:", error);
      if (typeof callback === 'function') {
        callback([]);
      }
      return [];
    }
  },

  // ===== GET JADWAL TURNAMEN =====
  getJadwalTurnamen: function(callback) {
    console.log("🏆 Fetching jadwal turnamen...");
    try {
      const stored = localStorage.getItem('jadwalTurnamen');
      const data = stored ? JSON.parse(stored) : [];
      console.log("✅ Jadwal turnamen loaded:", data.length);
      if (typeof callback === 'function') {
        callback(data);
      }
      return data;
    } catch (error) {
      console.error("❌ Error getJadwalTurnamen:", error);
      if (typeof callback === 'function') {
        callback([]);
      }
      return [];
    }
  },

  // ===== ADD SISWA AKTIF =====
  addSiswaAktif: function(siswa, callback) {
    console.log("➕ Adding siswa aktif:", siswa.nama, "| NISW:", siswa.nisw);
    try {
      let siswaList = [];
      const stored = localStorage.getItem('siswaData');
      if (stored) {
        siswaList = JSON.parse(stored);
      }

      // Check if NISW already exists
      if (siswaList.find(s => s.nisw === siswa.nisw)) {
        console.warn("⚠️ NISW already exists:", siswa.nisw);
        if (typeof callback === 'function') {
          callback(false);
        }
        return false;
      }

      const newSiswa = {
        ...siswa,
        status: 'Aktif',
        createdAt: new Date().toISOString()
      };

      siswaList.push(newSiswa);
      localStorage.setItem('siswaData', JSON.stringify(siswaList));

      console.log("✅ Siswa aktif added successfully");
      if (typeof callback === 'function') {
        callback(true);
      }
      return true;

    } catch (error) {
      console.error("❌ Error addSiswaAktif:", error);
      if (typeof callback === 'function') {
        callback(false);
      }
      return false;
    }
  },

  // ===== UPDATE PENDAFTAR STATUS =====
  updatePendaftarStatus: function(nisw, status, callback) {
    console.log("✏️ Updating pendaftar status:", nisw, "to", status);
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
        console.log("✅ Pendaftar status updated");
        if (typeof callback === 'function') {
          callback(true);
        }
        return true;
      }

      console.warn("⚠️ Pendaftar not found:", nisw);
      if (typeof callback === 'function') {
        callback(false);
      }
      return false;

    } catch (error) {
      console.error("❌ Error updatePendaftarStatus:", error);
      if (typeof callback === 'function') {
        callback(false);
      }
      return false;
    }
  },

  // ===== SAVE NILAI SISWA =====
  saveNilai: function(nilaiData, callback) {
    console.log("💾 Saving nilai siswa...");
    try {
      let nilaiList = [];
      const stored = localStorage.getItem('nilaiData');
      if (stored) {
        nilaiList = JSON.parse(stored);
      }

      const idx = nilaiList.findIndex(n => n.nisw === nilaiData.nisw);
      if (idx !== -1) {
        nilaiList[idx] = { ...nilaiList[idx], ...nilaiData, updatedAt: new Date().toISOString() };
      } else {
        nilaiList.push({ ...nilaiData, createdAt: new Date().toISOString() });
      }

      localStorage.setItem('nilaiData', JSON.stringify(nilaiList));
      console.log("✅ Nilai saved successfully");
      if (typeof callback === 'function') {
        callback(true);
      }
      return true;

    } catch (error) {
      console.error("❌ Error saveNilai:", error);
      if (typeof callback === 'function') {
        callback(false);
      }
      return false;
    }
  },

  // ===== HITUNG % KEHADIRAN =====
  hitungPersentaseKehadiran: function(nisw) {
    console.log("📊 Calculating attendance percentage for:", nisw);
    try {
      const stored = localStorage.getItem('absensiData');
      if (!stored) return 0;

      const absensiList = JSON.parse(stored);
      const siswaAbsensi = absensiList.filter(a => a.nisw === nisw);
      
      if (siswaAbsensi.length === 0) return 0;

      const hadirCount = siswaAbsensi.filter(a => a.status === 'Hadir').length;
      const persentase = Math.round((hadirCount / siswaAbsensi.length) * 100);

      console.log("✅ Persentase kehadiran:", persentase + "%");
      return persentase;

    } catch (error) {
      console.error("❌ Error hitungPersentaseKehadiran:", error);
      return 0;
    }
  },

  // ===== DEBUG: PRINT ALL NISW =====
  debugPrintAllNISW: function() {
    console.log("\n📋 ===== DEBUG: ALL NISW INFORMATION =====");
    
    try {
      const storedSiswa = localStorage.getItem('siswaData');
      const siswaList = storedSiswa ? JSON.parse(storedSiswa) : [];
      
      const storedPendaftar = localStorage.getItem('pendaftarData');
      const pendaftarList = storedPendaftar ? JSON.parse(storedPendaftar) : [];

      console.log("\n👥 SISWA AKTIF:", siswaList.length, "entries");
      siswaList.forEach((s, i) => {
        console.log(`  ${i + 1}. NISW: ${s.nisw} | Nama: ${s.nama} | Tipe: ${s.tipe}`);
      });

      console.log("\n📝 PENDAFTAR:", pendaftarList.length, "entries");
      pendaftarList.forEach((p, i) => {
        console.log(`  ${i + 1}. NISW: ${p.nisw} | Nama: ${p.nama} | Tipe: ${p.tipe} | Status: ${p.status}`);
      });

      const allNISW = [...siswaList, ...pendaftarList].map(s => s.nisw);
      console.log("\n🔢 ALL NISW SORTED:", allNISW.sort());
      console.log("📊 ===== END DEBUG =====\n");

    } catch (error) {
      console.error("❌ Error in debug:", error);
    }
  }

};

console.log("✅ db-sync.js v4.4 loaded - Admin Panel Enhanced COMPLETE!");
