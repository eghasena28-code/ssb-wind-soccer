// db-sync.js
// Database Manager untuk SSB Wind Soccer - FULL LENGKAP

const DBManager = {
  
  // ===== GET TANGGAL =====
  getTglSekarang: function() {
    return new Date().toLocaleDateString('id-ID');
  },

  // ===== ADD PENDAFTAR =====
  addPendaftar: async function(data) {
    try {
      const tahun = new Date().getFullYear().toString().slice(-2);
      const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      const nisw = 'R' + tahun + randomNum;

      await db.collection('pendaftar').doc(nisw).set({
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
        status: 'Menunggu Verifikasi',
        tglDaftar: this.getTglSekarang(),
        createdAt: new Date().toISOString()
      });

      let pendaftarData = [];
      const stored = localStorage.getItem('pendaftarData');
      if (stored) {
        pendaftarData = JSON.parse(stored);
      }
      
      const newData = { ...data, nisw: nisw };
      pendaftarData.push(newData);
      localStorage.setItem('pendaftarData', JSON.stringify(pendaftarData));

      console.log("✅ Pendaftar ditambahkan:", nisw);
      return nisw;

    } catch (error) {
      console.error("❌ Error addPendaftar:", error);
      throw error;
    }
  },

  // ===== GET PENDAFTAR =====
  getPendaftar: async function(callback) {
    try {
      const stored = localStorage.getItem('pendaftarData');
      if (stored) {
        const data = JSON.parse(stored);
        callback(data);
        console.log("✅ Pendaftar dari localStorage:", data.length);
        return;
      }

      const querySnapshot = await db.collection('pendaftar').get();
      const data = [];
      
      querySnapshot.forEach(doc => {
        data.push({
          nisw: doc.id,
          ...doc.data()
        });
      });

      localStorage.setItem('pendaftarData', JSON.stringify(data));
      callback(data);
      console.log("✅ Pendaftar dari Firestore:", data.length);

    } catch (error) {
      console.error("❌ Error getPendaftar:", error);
      callback([]);
    }
  },

  // ===== GET SISWA AKTIF - DENGAN INISIALISASI DEMO =====
  getSiswaAktif: async function(callback) {
    try {
      const stored = localStorage.getItem('siswaData');
      
      // Jika sudah ada data siswa, gunakan itu
      if (stored && stored !== '[]') {
        const siswa = JSON.parse(stored).filter(s => s.status === 'Aktif');
        console.log("✅ Siswa aktif dari localStorage:", siswa.length);
        callback(siswa);
        return;
      }

      // Jika belum ada, buat demo data
      console.log("📝 Membuat demo data siswa...");
      const demoSiswa = [
        {
          nisw: "R260001",
          nama: "Ahmad Rizky",
          tglLahir: "2010-05-15",
          kategori: "KU-14",
          tipe: "Reguler",
          posisi: "Penyerang",
          foto: "https://via.placeholder.com/40?text=AR",
          namaOrtu: "Budi Santoso",
          noHp: "082123456789",
          alamat: "Jl. Merdeka 123, Bogor",
          statusPembayaran: "Lunas",
          tagihan: 0,
          status: "Aktif",
          catatan: "Siswa berprestasi"
        },
        {
          nisw: "R260002",
          nama: "Sinta Purwanto",
          tglLahir: "2012-08-22",
          kategori: "KU-12",
          tipe: "Beasiswa",
          posisi: "Gelandang",
          foto: "https://via.placeholder.com/40?text=SP",
          namaOrtu: "Purwanto",
          noHp: "081234567890",
          alamat: "Jl. Sudirman 456, Tangerang",
          statusPembayaran: "Cicilan",
          tagihan: 100000,
          status: "Aktif",
          catatan: "Beasiswa 50%"
        },
        {
          nisw: "R260003",
          nama: "Rendi Maulana",
          tglLahir: "2014-03-10",
          kategori: "KU-10",
          tipe: "Beasiswa",
          posisi: "Bek",
          foto: "https://via.placeholder.com/40?text=RM",
          namaOrtu: "Maulana",
          noHp: "085123456789",
          alamat: "Jl. Ahmad Yani 789, Bekasi",
          statusPembayaran: "Belum Bayar",
          tagihan: 200000,
          status: "Aktif",
          catatan: "Beasiswa 100% (Yatim)"
        }
      ];

      localStorage.setItem('siswaData', JSON.stringify(demoSiswa));
      callback(demoSiswa);
      console.log("✅ Demo data siswa dibuat:", demoSiswa.length);

    } catch (error) {
      console.error("❌ Error getSiswaAktif:", error);
      callback([]);
    }
  },

  // ===== FIND SISWA BY NISW - PERBAIKAN UTAMA =====
  findSiswa: async function(nisw, callback) {
    try {
      console.log("🔍 Mencari NISW:", nisw.toUpperCase());
      
      // 1. Cek di localStorage siswaData dulu
      const stored = localStorage.getItem('siswaData');
      if (stored) {
        const siswaList = JSON.parse(stored);
        const siswa = siswaList.find(s => s.nisw?.toUpperCase() === nisw.toUpperCase());
        
        if (siswa) {
          console.log("✅ Siswa ditemukan di localStorage:", siswa.nama);
          callback(siswa);
          return;
        }
      }

      // 2. Jika tidak ada di siswaData, buat demo data dulu
      console.log("⚠️ NISW tidak ditemukan di localStorage, membuat demo data...");
      await new Promise(resolve => {
        this.getSiswaAktif(() => resolve());
      });

      // 3. Coba cari lagi
      const storedAgain = localStorage.getItem('siswaData');
      if (storedAgain) {
        const siswaList = JSON.parse(storedAgain);
        const siswa = siswaList.find(s => s.nisw?.toUpperCase() === nisw.toUpperCase());
        
        if (siswa) {
          console.log("✅ Siswa ditemukan setelah demo:", siswa.nama);
          callback(siswa);
          return;
        }
      }

      console.log("❌ NISW tidak ditemukan:", nisw);
      callback(null);

    } catch (error) {
      console.error("❌ Error findSiswa:", error);
      callback(null);
    }
  },

  // ===== GET ABSENSI =====
  getAbsensi: async function(callback) {
    try {
      const stored = localStorage.getItem('absensiData');
      if (stored) {
        const data = JSON.parse(stored);
        callback(data);
        console.log("✅ Absensi dari localStorage:", data.length);
        return;
      }

      const demoAbsensi = [
        {
          tanggal: new Date().toLocaleDateString('id-ID'),
          nisw: "R260001",
          nama: "Ahmad Rizky",
          status: "Hadir",
          alasan: "-"
        }
      ];

      localStorage.setItem('absensiData', JSON.stringify(demoAbsensi));
      callback(demoAbsensi);

    } catch (error) {
      console.error("❌ Error getAbsensi:", error);
      callback([]);
    }
  },

  // ===== GET SARAN =====
  getSaran: async function(callback) {
    try {
      const stored = localStorage.getItem('saranData');
      if (stored) {
        const data = JSON.parse(stored);
        callback(data);
        console.log("✅ Saran dari localStorage:", data.length);
        return;
      }

      callback([]);

    } catch (error) {
      console.error("❌ Error getSaran:", error);
      callback([]);
    }
  },

  // ===== UPDATE PENDAFTAR STATUS =====
  updatePendaftarStatus: async function(nisw, status) {
    try {
      await db.collection('pendaftar').doc(nisw).update({
        status: status,
        updatedAt: new Date().toISOString()
      });

      const stored = localStorage.getItem('pendaftarData');
      if (stored) {
        let data = JSON.parse(stored);
        const idx = data.findIndex(p => p.nisw === nisw);
        if (idx !== -1) {
          data[idx].status = status;
          localStorage.setItem('pendaftarData', JSON.stringify(data));
        }
      }

      console.log("✅ Status pendaftar updated:", nisw, status);
      return true;

    } catch (error) {
      console.error("❌ Error updatePendaftarStatus:", error);
      return false;
    }
  },

  // ===== ADD SISWA (dari pendaftar yang disetujui) =====
  addSiswa: async function(pendaftar) {
    try {
      const siswaData = {
        nisw: pendaftar.nisw || '',
        nama: pendaftar.nama || '',
        tglLahir: pendaftar.tglLahir || '',
        kategori: pendaftar.kategori || '',
        tipe: pendaftar.tipe || 'Reguler',
        posisi: pendaftar.posisi || '',
        namaOrtu: pendaftar.namaOrtu || '',
        noHp: pendaftar.noHp || '',
        alamat: pendaftar.alamat || '',
        statusPembayaran: 'Belum Bayar',
        tagihan: pendaftar.tipe === 'Beasiswa' ? 200000 : 400000,
        status: 'Aktif',
        tglMasuk: this.getTglSekarang(),
        catatan: ''
      };

      // Simpan ke localStorage
      let siswaList = [];
      const stored = localStorage.getItem('siswaData');
      if (stored) {
        siswaList = JSON.parse(stored);
      }

      siswaList.push(siswaData);
      localStorage.setItem('siswaData', JSON.stringify(siswaList));

      console.log("✅ Siswa ditambahkan dari pendaftar:", siswaData.nama);
      return true;

    } catch (error) {
      console.error("❌ Error addSiswa:", error);
      return false;
    }
  }
};

console.log("✅ db-sync.js loaded - DBManager ready");
