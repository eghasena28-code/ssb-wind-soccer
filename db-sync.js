/**
 * DATABASE MANAGER - SSB WIND SOCCER
 * Firestore + LocalStorage Sync
 * Version: 4.3 (FIXED NISW LOGIC - Shared Counter Per Tahun)
 * 
 * LOGIC:
 * - Counter BERSAMA per tahun (2026)
 * - Prefix R (Reguler) atau B (Beasiswa) membedakan tipe
 * - Format: R2026001, B2026002, R2026003, B2026004, dst...
 */

console.log("📦 Loading db-sync.js v4.3 - Shared Counter NISW Logic...");

// ============ GLOBAL DB MANAGER ============
window.DBManager = {

  getTglSekarang: function() {
    return new Date().toLocaleDateString('id-ID');
  },

  // ===== GENERATE NISW DENGAN SHARED COUNTER =====
  generateNISW: function(tipe = 'Reguler') {
    console.log("🔧 Generating NISW for tipe:", tipe);
    
    try {
      // Get current year (4 digit)
      const tahun = new Date().getFullYear().toString(); // 2026
      
      // Determine prefix: R for Reguler, B for Beasiswa
      const prefix = (tipe && tipe.toLowerCase() === 'beasiswa') ? 'B' : 'R';
      
      console.log("📊 Prefix:", prefix, "| Tahun:", tahun);

      // Get existing NISW list dari siswa aktif
      let siswaList = [];
      const stored = localStorage.getItem('siswaData');
      if (stored) {
        try {
          siswaList = JSON.parse(stored);
        } catch (e) {
          console.warn("⚠️ Error parsing siswaData");
          siswaList = [];
        }
      }

      // Get existing pendaftar
      let pendaftarList = [];
      const storedPendaftar = localStorage.getItem('pendaftarData');
      if (storedPendaftar) {
        try {
          pendaftarList = JSON.parse(storedPendaftar);
        } catch (e) {
          console.warn("⚠️ Error parsing pendaftarData");
          pendaftarList = [];
        }
      }

      // Combine all NISW (dari siswa aktif + pendaftar)
      const allNISW = [...siswaList, ...pendaftarList].map(s => s.nisw || '');

      console.log("📋 Total NISW found:", allNISW.length);
      console.log("🔍 All NISW:", allNISW);

      // Filter NISW dengan tahun yang sama (tidak peduli prefix)
      const sameTahun = allNISW.filter(nisw => 
        nisw && 
        nisw.includes(tahun) &&
        nisw.length === 8 // Format: R2026001 (8 char)
      );

      console.log("📊 NISW dengan tahun", tahun, ":", sameTahun.length, sameTahun);

      // Extract number dari semua NISW di tahun ini (R atau B)
      let nextNumber = 1;
      if (sameTahun.length > 0) {
        // Get all numbers dari semua NISW tahun ini
        const allNumbers = sameTahun.map(nisw => {
          const numPart = nisw.slice(-3); // Last 3 digits
          return parseInt(numPart);
        }).filter(n => !isNaN(n));

        console.log("🔢 All numbers:", allNumbers);

        // Get max number
        if (allNumbers.length > 0) {
          const maxNumber = Math.max(...allNumbers);
          nextNumber = maxNumber + 1;
          console.log("📈 Max number:", maxNumber, "| Next:", nextNumber);
        }
      }

      // Format: R2026001, B2026002, R2026003, etc
      const niswBaru = prefix + tahun + String(nextNumber).padStart(3, '0');
      
      console.log("✅ New NISW generated:", niswBaru);
      console.log("📌 Components - Prefix:", prefix, "| Year:", tahun, "| Number:", String(nextNumber).padStart(3, '0'));

      return niswBaru;

    } catch (error) {
      console.error("❌ Error generating NISW:", error);
      // Fallback
      const fallback = 'R' + new Date().getFullYear() + String(Math.floor(Math.random() * 1000)).padStart(3, '0');
      console.warn("⚠️ Using fallback NISW:", fallback);
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
    console.log("🔍 Getting login user...");
    try {
      const stored = localStorage.getItem('loginUser');
      if (stored) {
        const user = JSON.parse(stored);
        console.log("✅ Login user retrieved:", user.nama);
        return user;
      }
      console.warn("⚠️ No login user found");
      return null;
    } catch (error) {
      console.error("❌ Error getting login user:", error);
      return null;
    }
  },

  // ===== ADD PENDAFTAR (ASYNC) - DENGAN NISW SHARED COUNTER =====
  addPendaftar: async function(data) {
    console.log("➕ Adding pendaftar...", data);
    
    try {
      // Generate NISW dengan shared counter
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
        const aktivSiswa = allSiswa.filter(s => s.status === 'Aktif');
        console.log("✅ Siswa aktif loaded:", aktivSiswa.length);
        if (typeof callback === 'function') {
          callback(aktivSiswa);
        }
        return;
      }

      // GENERATE DEMO DATA SISWA dengan NISW shared counter
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
      console.log("📌 NISW pattern: R2026001, B2026002, R2026003 (shared counter)");
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
      
      // First check siswa aktif
      const stored = localStorage.getItem('siswaData');
      if (stored) {
        const siswaList = JSON.parse(stored);
        const siswa = siswaList.find(s => s.nisw?.toUpperCase() === niswUpper);
        
        if (siswa) {
          console.log("✅ Siswa found:", siswa.nama, "| Tipe:", siswa.tipe);
          if (typeof callback === 'function') {
            callback(siswa);
          }
          return siswa;
        }
      }

      // Then check pendaftar
      const storedPendaftar = localStorage.getItem('pendaftarData');
      if (storedPendaftar) {
        const pendaftarList = JSON.parse(storedPendaftar);
        const pendaftar = pendaftarList.find(p => p.nisw?.toUpperCase() === niswUpper);
        
        if (pendaftar) {
          console.log("✅ Pendaftar found:", pendaftar.nama, "| Tipe:", pendaftar.tipe);
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
  addAbsensi: async function(data, callback) {
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
      throw error;
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
  },

  // ===== GET KEUANGAN DATA =====
  getKeuangan: function(callback) {
    console.log("💰 Fetching keuangan...");
    try {
      const stored = localStorage.getItem('keuanganData');
      const data = stored ? JSON.parse(stored) : [];
      console.log("✅ Keuangan loaded:", data.length, "items");
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

      // Default jadwal jika tidak ada
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
  addSiswaAktif: async function(siswa, callback) {
    console.log("➕ Adding siswa aktif:", siswa.nama, "| NISW:", siswa.nisw, "| Tipe:", siswa.tipe);
    try {
      let siswaList = [];
      const stored = localStorage.getItem('siswaData');
      if (stored) {
        siswaList = JSON.parse(stored);
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
  saveNilai: async function(nilaiData, callback) {
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

  // ===== VALIDATE NISW FORMAT (HELPER) =====
  validateNISWFormat: function(nisw) {
    console.log("🔍 Validating NISW format:", nisw);
    
    if (!nisw || nisw.length !== 8) {
      console.warn("⚠️ NISW must be 8 characters, got:", nisw.length);
      return false;
    }

    const prefix = nisw.charAt(0).toUpperCase();
    if (prefix !== 'R' && prefix !== 'B') {
      console.warn("⚠️ NISW must start with R (Reguler) or B (Beasiswa)");
      return false;
    }

    const tahun = nisw.substring(1, 5);
    if (!/^\d{4}$/.test(tahun)) {
      console.warn("⚠️ NISW format: prefix + 4 digit year + 3 digit number");
      return false;
    }

    const nomor = nisw.substring(5, 8);
    if (!/^\d{3}$/.test(nomor)) {
      console.warn("⚠️ NISW format: prefix + year + 3 digit number");
      return false;
    }

    console.log("✅ NISW format valid - Prefix:", prefix, "| Year:", tahun, "| Number:", nomor);
    return true;
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

console.log("✅ db-sync.js v4.3 loaded - Shared Counter NISW Logic COMPLETE!");
console.log("📌 Logic: Counter BERSAMA per tahun, prefix berbeda (R/B)");
