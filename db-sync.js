/**
 * DATABASE MANAGER - SSB WIND SOCCER
 * Firestore + LocalStorage Sync
 * Version: 5.0 (FIXED - CORRECT NISW LOGIC)
 */

console.log("📦 Loading db-sync.js v5.0...");

// ============ GLOBAL DB MANAGER ============
window.DBManager = {

  // ===== GET CURRENT DATE =====
  getTglSekarang: function() {
    return new Date().toLocaleDateString('id-ID');
  },

  // ===== GENERATE NISW DENGAN LOGIKA BENAR =====
  // Format: R2026001 (Reguler), B2026001 (Beasiswa)
  // Nomor urut berlanjut, yang membedakan hanya prefix R atau B
  generateNISW: function(tipe = 'Reguler') {
    console.log("🔢 Generating NISW with tipe:", tipe);
    
    const tahun = new Date().getFullYear().toString().slice(-2); // "26" dari 2026
    
    // Ambil semua NISW yang sudah ada
    let allNISW = [];
    const siswaStored = localStorage.getItem('siswaData');
    const pendaftarStored = localStorage.getItem('pendaftarData');
    
    if (siswaStored) {
      try {
        allNISW = allNISW.concat(JSON.parse(siswaStored).map(s => s.nisw || ''));
      } catch (e) {
        console.warn("⚠️ Error parsing siswaData:", e);
      }
    }
    if (pendaftarStored) {
      try {
        allNISW = allNISW.concat(JSON.parse(pendaftarStored).map(p => p.nisw || ''));
      } catch (e) {
        console.warn("⚠️ Error parsing pendaftarData:", e);
      }
    }
    
    // Tentukan prefix berdasarkan tipe
    const prefix = tipe === 'Beasiswa' ? 'B' : 'R';
    
    // Filter NISW yang sesuai dengan prefix
    const niswDenganPrefix = allNISW.filter(n => n && n.startsWith(prefix + tahun));
    
    // Hitung urutan selanjutnya
    let nextUrutan = 1;
    if (niswDenganPrefix.length > 0) {
      // Ambil nomor terakhir dan urutkan
      const urutanArray = niswDenganPrefix.map(n => parseInt(n.substring(5))).sort((a, b) => b - a);
      const lastUrutan = urutanArray[0];
      nextUrutan = lastUrutan + 1;
    }
    
    // Format nomor urutan dengan leading zeros (3 digit)
    const nomorUrutan = nextUrutan.toString().padStart(3, '0');
    const nisw = prefix + tahun + nomorUrutan;
    
    console.log(`✅ Generated NISW: ${nisw} (${tipe})`);
    return nisw;
  },

  // ===== SET LOGIN USER =====
  setLoginUser: function(siswa) {
    console.log("🔐 Setting login user:", siswa.nama);
    sessionStorage.setItem('loginUser', JSON.stringify(siswa));
    localStorage.setItem('lastLoginUser', JSON.stringify(siswa));
  },

  // ===== GET LOGIN USER =====
  getLoginUser: function() {
    const user = sessionStorage.getItem('loginUser') || localStorage.getItem('lastLoginUser');
    if (user) {
      console.log("✅ Login user retrieved");
      return JSON.parse(user);
    }
    console.warn("⚠️ No login user found");
    return null;
  },

  // ===== ADD PENDAFTAR (DENGAN NISW YANG BENAR) =====
  addPendaftar: async function(data) {
    console.log("➕ Adding pendaftar...", data);
    
    try {
      // ✅ GENERATE NISW DENGAN TIPE YANG BENAR!
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

  // ===== ADD SISWA AKTIF =====
  addSiswaAktif: function(data, callback) {
    console.log("➕ Adding siswa aktif...", data);
    
    try {
      let siswaList = [];
      const stored = localStorage.getItem('siswaData');
      if (stored) {
        try {
          siswaList = JSON.parse(stored);
        } catch (e) {
          siswaList = [];
        }
      }

      const newSiswa = {
        ...data,
        status: 'Aktif',
        createdAt: new Date().toISOString()
      };

      siswaList.push(newSiswa);
      localStorage.setItem('siswaData', JSON.stringify(siswaList));

      console.log("✅ Siswa aktif added");
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

  // ===== GET SISWA AKTIF =====
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
      this.initializeDemoData();
      
      const stored2 = localStorage.getItem('siswaData');
      const allSiswa = JSON.parse(stored2);
      const aktivSiswa = allSiswa.filter(s => s.status === 'Aktif');
      
      if (typeof callback === 'function') {
        callback(aktivSiswa);
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

  // ===== CEK DUPLICATE ABSENSI =====
  cekDuplicateAbsensi: function(nisw, tanggal, callback) {
    console.log("🔍 Checking duplicate absensi:", nisw, tanggal);
    
    try {
      const stored = localStorage.getItem('absensiData');
      if (!stored) {
        console.log("ℹ️ No absensi data yet");
        if (typeof callback === 'function') {
          callback(false);
        }
        return false;
      }

      const absensiList = JSON.parse(stored);
      const isDuplicate = absensiList.some(a => a.nisw === nisw && a.tanggal === tanggal);

      console.log(isDuplicate ? "⚠️ Duplicate found" : "✅ No duplicate");
      if (typeof callback === 'function') {
        callback(isDuplicate);
      }
      return isDuplicate;

    } catch (error) {
      console.error("❌ Error cekDuplicateAbsensi:", error);
      if (typeof callback === 'function') {
        callback(false);
      }
      return false;
    }
  },

  // ===== ADD ABSENSI =====
  addAbsensi: async function(data, callback) {
    console.log("➕ Adding absensi...");
    
    try {
      let absensiList = [];
      const stored = localStorage.getItem('absensiData');
      if (stored) {
        try {
          absensiList = JSON.parse(stored);
        } catch (e) {
          absensiList = [];
        }
      }

      const newAbsensi = {
        id: Date.now(),
        tanggal: data.tanggal || new Date().toLocaleDateString('id-ID'),
        nisw: data.nisw || '',
        nama: data.nama || '',
        kategori: data.kategori || '',
        status: data.status || 'Hadir',
        alasan: data.alasan || '-',
        waktuInput: new Date().toLocaleString('id-ID'),
        tipeJalur: data.tipeJalur || 'Reguler',
        createdAt: new Date().toISOString()
      };

      absensiList.push(newAbsensi);
      localStorage.setItem('absensiData', JSON.stringify(absensiList));

      console.log("✅ Absensi added");
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

  // ===== GET ABSENSI =====
  getAbsensi: function(callback) {
    console.log("🔍 Fetching absensi...");
    
    try {
      const stored = localStorage.getItem('absensiData');
      const data = stored ? JSON.parse(stored) : [];
      
      console.log("✅ Absensi loaded:", data.length);
      if (typeof callback === 'function') {
        callback(data);
      }
      return data;

    } catch (error) {
      console.error("❌ Error getAbsensi:", error);
      if (typeof callback === 'function') {
        callback([]);
      }
      return [];
    }
  },

  // ===== GET KEUANGAN =====
  getKeuangan: function(callback) {
    console.log("🔍 Fetching keuangan...");
    
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

  // ===== ADD SARAN =====
  addSaran: async function(data) {
    console.log("➕ Adding saran...");
    
    try {
      let saranList = [];
      const stored = localStorage.getItem('saranData');
      if (stored) {
        try {
          saranList = JSON.parse(stored);
        } catch (e) {
          saranList = [];
        }
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

  // ===== DELETE SARAN =====
  deleteSaran: async function(id) {
    console.log("🗑️ Deleting saran:", id);
    
    try {
      let saranList = [];
      const stored = localStorage.getItem('saranData');
      if (stored) {
        try {
          saranList = JSON.parse(stored);
        } catch (e) {
          saranList = [];
        }
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
        try {
          siswaList = JSON.parse(stored);
        } catch (e) {
          siswaList = [];
        }
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
        try {
          siswaList = JSON.parse(stored);
        } catch (e) {
          siswaList = [];
        }
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

  // ===== GET JADWAL LATIHAN =====
  getJadwalLatihan: function(callback) {
    console.log("🔍 Fetching jadwal latihan...");
    
    try {
      const stored = localStorage.getItem('jadwalLatihan');
      const data = stored ? JSON.parse(stored) : [];
      
      console.log("✅ Jadwal latihan loaded:", data.length);
      if (typeof callback === 'function') {
        callback(data);
      }
      return data;

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
    console.log("🔍 Fetching jadwal turnamen...");
    
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

  // ===== GET NILAI BY SISWA =====
  getNilaiBySiswa: function(nisw, callback) {
    console.log("🔍 Fetching nilai for NISW:", nisw);
    
    try {
      const stored = localStorage.getItem('nilaiData');
      if (stored) {
        const nilaiList = JSON.parse(stored);
        const nilai = nilaiList.filter(n => n.nisw === nisw);
        
        console.log("✅ Nilai loaded:", nilai.length);
        if (typeof callback === 'function') {
          callback(nilai);
        }
        return nilai;
      }

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

  // ===== INITIALIZE DEMO DATA =====
  initializeDemoData: function() {
    console.log("🎬 Initializing demo data with CORRECT NISW format...");

    // ✅ DEMO SISWA AKTIF
    const demoSiswa = [
      {
        nisw: 'R2026001',
        nama: 'Ahmad Rizky',
        tglLahir: '2010-05-15',
        kategori: 'KU-14',
        tipe: 'Reguler',
        posisi: 'Penyerang',
        foto: 'https://via.placeholder.com/160?text=Ahmad',
        namaOrtu: 'Budi Santoso',
        noHp: '082123456789',
        alamat: 'Jl. Merdeka 123, Bogor',
        statusPembayaran: 'Lunas',
        tagihan: 0,
        status: 'Aktif',
        createdAt: new Date().toISOString()
      },
      {
        nisw: 'B2026001',
        nama: 'Sinta Purwanto',
        tglLahir: '2012-08-22',
        kategori: 'KU-12',
        tipe: 'Beasiswa',
        posisi: 'Gelandang',
        foto: 'https://via.placeholder.com/160?text=Sinta',
        namaOrtu: 'Purwanto',
        noHp: '081234567890',
        alamat: 'Jl. Sudirman 456, Tangerang',
        statusPembayaran: 'Cicilan',
        tagihan: 100000,
        status: 'Aktif',
        createdAt: new Date().toISOString()
      },
      {
        nisw: 'B2026002',
        nama: 'Rendi Maulana',
        tglLahir: '2014-03-10',
        kategori: 'KU-10',
        tipe: 'Beasiswa',
        posisi: 'Bek',
        foto: 'https://via.placeholder.com/160?text=Rendi',
        namaOrtu: 'Maulana',
        noHp: '085123456789',
        alamat: 'Jl. Ahmad Yani 789, Bekasi',
        statusPembayaran: 'Belum Bayar',
        tagihan: 200000,
        status: 'Aktif',
        createdAt: new Date().toISOString()
      },
      {
        nisw: 'R2026002',
        nama: 'Dika Pratama',
        tglLahir: '2009-02-28',
        kategori: 'KU-16',
        tipe: 'Reguler',
        posisi: 'Gelandang',
        foto: 'https://via.placeholder.com/160?text=Dika',
        namaOrtu: 'Bambang Irawan',
        noHp: '087654321098',
        alamat: 'Jl. Gatot Subroto 321, Jakarta',
        statusPembayaran: 'Lunas',
        tagihan: 0,
        status: 'Aktif',
        createdAt: new Date().toISOString()
      }
    ];

    // ✅ DEMO PENDAFTAR
    const demoPendaftar = [
      {
        nisw: 'R2026003',
        nama: 'Fajar Hidayat',
        tglLahir: '2013-09-05',
        kategori: 'KU-11',
        tipe: 'Reguler',
        posisi: 'Penyerang',
        namaOrtu: 'Hidayat Rasyid',
        noHp: '089876543210',
        alamat: 'Jl. Merdeka Barat 789, Bogor',
        alasan: '',
        penjelasanAlasan: '',
        foto: '',
        status: 'Menunggu Verifikasi',
        tglDaftar: new Date().toLocaleDateString('id-ID'),
        createdAt: new Date().toISOString()
      },
      {
        nisw: 'B2026003',
        nama: 'Gilang Saputra',
        tglLahir: '2014-11-20',
        kategori: 'KU-10',
        tipe: 'Beasiswa',
        posisi: 'Bek',
        namaOrtu: 'Saputra Aditya',
        noHp: '088765432109',
        alamat: 'Jl. Ahmad Yani 555, Bekasi',
        alasan: 'Tidak Mampu',
        penjelasanAlasan: 'Orang tua hanya buruh tani, ingin mengembangkan bakat olahraga',
        foto: '',
        status: 'Menunggu Verifikasi',
        tglDaftar: new Date().toLocaleDateString('id-ID'),
        createdAt: new Date().toISOString()
      }
    ];

    // ✅ DEMO ABSENSI
    const today = new Date();
    const day1 = new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toLocaleDateString('id-ID');
    const day2 = new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toLocaleDateString('id-ID');
    const day3 = today.toLocaleDateString('id-ID');

    const demoAbsensi = [
      { id: 1, tanggal: day1, nisw: 'R2026001', nama: 'Ahmad Rizky', status: 'Hadir', alasan: '-', createdAt: new Date().toISOString() },
      { id: 2, tanggal: day1, nisw: 'B2026001', nama: 'Sinta Purwanto', status: 'Hadir', alasan: '-', createdAt: new Date().toISOString() },
      { id: 3, tanggal: day1, nisw: 'B2026002', nama: 'Rendi Maulana', status: 'Izin', alasan: 'Sakit', createdAt: new Date().toISOString() },
      { id: 4, tanggal: day1, nisw: 'R2026002', nama: 'Dika Pratama', status: 'Hadir', alasan: '-', createdAt: new Date().toISOString() },
      
      { id: 5, tanggal: day2, nisw: 'R2026001', nama: 'Ahmad Rizky', status: 'Hadir', alasan: '-', createdAt: new Date().toISOString() },
      { id: 6, tanggal: day2, nisw: 'B2026001', nama: 'Sinta Purwanto', status: 'Izin', alasan: 'Acara Keluarga', createdAt: new Date().toISOString() },
      { id: 7, tanggal: day2, nisw: 'B2026002', nama: 'Rendi Maulana', status: 'Hadir', alasan: '-', createdAt: new Date().toISOString() },
      { id: 8, tanggal: day2, nisw: 'R2026002', nama: 'Dika Pratama', status: 'Hadir', alasan: '-', createdAt: new Date().toISOString() },
      
      { id: 9, tanggal: day3, nisw: 'R2026001', nama: 'Ahmad Rizky', status: 'Hadir', alasan: '-', createdAt: new Date().toISOString() },
      { id: 10, tanggal: day3, nisw: 'B2026001', nama: 'Sinta Purwanto', status: 'Hadir', alasan: '-', createdAt: new Date().toISOString() },
      { id: 11, tanggal: day3, nisw: 'B2026002', nama: 'Rendi Maulana', status: 'Hadir', alasan: '-', createdAt: new Date().toISOString() },
      { id: 12, tanggal: day3, nisw: 'R2026002', nama: 'Dika Pratama', status: 'Izin', alasan: 'Ujian', createdAt: new Date().toISOString() }
    ];

    // ✅ DEMO KEUANGAN
    const demoKeuangan = [
      { id: 1, tanggal: '2026-04-01', jenisMasukKeluar: 'Masuk', jenis: 'SPP', kategori: 'SPP', sumber: 'Ahmad Rizky (R2026001)', keterangan: 'SPP Bulan April', nominal: 150000, nisw: 'R2026001', referensi: 'SPP_R2026001_0401', createdAt: new Date().toISOString() },
      { id: 2, tanggal: '2026-04-02', jenisMasukKeluar: 'Masuk', jenis: 'SPP', kategori: 'SPP', sumber: 'Sinta Purwanto (B2026001)', keterangan: 'SPP Bulan April - Cicilan', nominal: 75000, nisw: 'B2026001', referensi: 'SPP_B2026001_0402', createdAt: new Date().toISOString() },
      { id: 3, tanggal: '2026-04-03', jenisMasukKeluar: 'Masuk', jenis: 'Daftar', kategori: 'Uang Daftar', sumber: 'Fajar Hidayat (R2026003)', keterangan: 'Uang Daftar Reguler - KU-11', nominal: 500000, nisw: 'R2026003', referensi: 'DAFTAR_R2026003', createdAt: new Date().toISOString() },
      { id: 4, tanggal: '2026-04-05', jenisMasukKeluar: 'Keluar', jenis: 'Pengeluaran', kategori: 'Pengeluaran', sumber: 'Pembelian Bola', keterangan: '5 buah bola kulit premium untuk latihan', nominal: 750000, referensi: '', createdAt: new Date().toISOString() },
      { id: 5, tanggal: '2026-04-08', jenisMasukKeluar: 'Masuk', jenis: 'Kompetisi', kategori: 'Kompetisi', sumber: 'Ahmad Rizky (R2026001)', keterangan: 'Biaya Kompetisi Liga Danone 2026', nominal: 200000, nisw: 'R2026001', referensi: 'KOMPETISI_R2026001', createdAt: new Date().toISOString() }
    ];

    // ✅ DEMO NILAI RAPORT
    const demoNilai = [
      {
        id: 1,
        nisw: 'R2026001',
        nama: 'Ahmad Rizky',
        passing: 85,
        shooting: 88,
        dribbling: 82,
        control: 86,
        positioning: 80,
        speed: 87,
        tb: 175,
        bb: 68,
        lingkarPerut: 72,
        catatan: 'Pemain yang konsisten dan disiplin. Terus tingkatkan passing accuracy.',
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        nisw: 'B2026001',
        nama: 'Sinta Purwanto',
        passing: 78,
        shooting: 75,
        dribbling: 80,
        control: 79,
        positioning: 77,
        speed: 76,
        tb: 165,
        bb: 58,
        lingkarPerut: 68,
        catatan: 'Perlu meningkatkan kecepatan reaksi dan akurasi tendangan.',
        createdAt: new Date().toISOString()
      },
      {
        id: 3,
        nisw: 'B2026002',
        nama: 'Rendi Maulana',
        passing: 82,
        shooting: 80,
        dribbling: 85,
        control: 83,
        positioning: 88,
        speed: 84,
        tb: 170,
        bb: 64,
        lingkarPerut: 70,
        catatan: 'Bek yang solid dengan positioning bagus. Pertahankan performa.',
        createdAt: new Date().toISOString()
      }
    ];

    // ✅ DEMO SARAN
    const demoSaran = [
      {
        id: 1,
        tanggal: '2026-04-15',
        nisw: 'R2026001',
        nama: 'Ahmad Rizky',
        kategori: 'Fasilitas',
        pesan: 'Lapangan latihan sebaiknya ditambah lighting untuk latihan malam.',
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        tanggal: '2026-04-16',
        nisw: 'B2026001',
        nama: 'Sinta Purwanto',
        kategori: 'Jadwal',
        pesan: 'Jadwal latihan hari Minggu terlalu pagi, bisa dimulai jam 08.00?',
        createdAt: new Date().toISOString()
      },
      {
        id: 3,
        tanggal: '2026-04-17',
        nisw: 'B2026002',
        nama: 'Rendi Maulana',
        kategori: 'Pelatih',
        pesan: 'Terima kasih coach, latihan hari ini sangat bermanfaat!',
        createdAt: new Date().toISOString()
      }
    ];

    // ✅ DEMO JADWAL LATIHAN
    const demoJadwalLatihan = [
      { id: 1, hari: 'SELASA', tempat: 'Stadion Mini Legok', waktu: '15.00 WIB', createdAt: new Date().toISOString() },
      { id: 2, hari: 'KAMIS', tempat: 'Stadion Mini Legok', waktu: '15.00 WIB', createdAt: new Date().toISOString() },
      { id: 3, hari: 'MINGGU', tempat: 'Lapangan Jaha', waktu: '07.00 WIB', createdAt: new Date().toISOString() }
    ];

    // ✅ DEMO JADWAL TURNAMEN
    const demoJadwalTurnamen = [
      {
        id: 1,
        namaEvent: 'Liga Danone 2026',
        tanggal: '2026-05-15',
        lokasi: 'Lapangan Jaha',
        waktu: '08.00 WIB',
        status: 'Upcoming',
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        namaEvent: 'Turnamen Sentra Regional DKI U-12',
        tanggal: '2026-06-20',
        lokasi: 'Lapangan Citayam',
        waktu: '07.00 WIB',
        status: 'Upcoming',
        createdAt: new Date().toISOString()
      }
    ];

    // ��� SIMPAN SEMUA DATA
    if (!localStorage.getItem('siswaData') || JSON.parse(localStorage.getItem('siswaData') || '[]').length === 0) {
      localStorage.setItem('siswaData', JSON.stringify(demoSiswa));
      console.log("✅ Demo Siswa Aktif initialized (R2026001, B2026001, B2026002, R2026002)");
    }

    if (!localStorage.getItem('pendaftarData') || JSON.parse(localStorage.getItem('pendaftarData') || '[]').length === 0) {
      localStorage.setItem('pendaftarData', JSON.stringify(demoPendaftar));
      console.log("✅ Demo Pendaftar initialized (R2026003, B2026003)");
    }

    if (!localStorage.getItem('absensiData') || JSON.parse(localStorage.getItem('absensiData') || '[]').length === 0) {
      localStorage.setItem('absensiData', JSON.stringify(demoAbsensi));
      console.log("✅ Demo Absensi initialized");
    }

    if (!localStorage.getItem('keuanganData') || JSON.parse(localStorage.getItem('keuanganData') || '[]').length === 0) {
      localStorage.setItem('keuanganData', JSON.stringify(demoKeuangan));
      console.log("✅ Demo Keuangan initialized");
    }

    if (!localStorage.getItem('nilaiData') || JSON.parse(localStorage.getItem('nilaiData') || '[]').length === 0) {
      localStorage.setItem('nilaiData', JSON.stringify(demoNilai));
      console.log("✅ Demo Nilai Raport initialized");
    }

    if (!localStorage.getItem('saranData') || JSON.parse(localStorage.getItem('saranData') || '[]').length === 0) {
      localStorage.setItem('saranData', JSON.stringify(demoSaran));
      console.log("✅ Demo Saran initialized");
    }

    if (!localStorage.getItem('jadwalLatihan') || JSON.parse(localStorage.getItem('jadwalLatihan') || '[]').length === 0) {
      localStorage.setItem('jadwalLatihan', JSON.stringify(demoJadwalLatihan));
      console.log("✅ Demo Jadwal Latihan initialized");
    }

    if (!localStorage.getItem('jadwalTurnamen') || JSON.parse(localStorage.getItem('jadwalTurnamen') || '[]').length === 0) {
      localStorage.setItem('jadwalTurnamen', JSON.stringify(demoJadwalTurnamen));
      console.log("✅ Demo Jadwal Turnamen initialized");
    }

    console.log("🎬 ✅ Demo data initialization COMPLETE!");
    console.log("📋 NISW DEMO:");
    console.log("   REGULER: R2026001, R2026002, R2026003");
    console.log("   BEASISWA: B2026001, B2026002, B2026003");
    console.log("🔐 ADMIN: 110admin");
  }
};

// Auto-initialize demo data
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    DBManager.initializeDemoData();
  });
} else {
  DBManager.initializeDemoData();
}

console.log("✅ db-sync.js v5.0 loaded - DBManager ready!");
