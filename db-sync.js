// db-sync.js
// Database Manager untuk SSB Wind Soccer

const DBManager = {
  
  // ===== GET TANGGAL =====
  getTglSekarang: function() {
    return new Date().toLocaleDateString('id-ID');
  },

  // ===== ADD PENDAFTAR =====
  addPendaftar: async function(data) {
    try {
      // Generate NISW format: R + TAHUN + NOMOR (contoh: R202601)
      const tahun = new Date().getFullYear().toString().slice(-2);
      const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      const nisw = 'R' + tahun + randomNum;

      // Set data ke Firestore
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

      // Juga simpan ke localStorage
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
      // Cek localStorage dulu
      const stored = localStorage.getItem('pendaftarData');
      if (stored) {
        const data = JSON.parse(stored);
        callback(data);
        console.log("✅ Pendaftar dari localStorage:", data.length);
        return;
      }

      // Jika tidak ada, fetch dari Firestore
      const querySnapshot = await db.collection('pendaftar').get();
      const data = [];
      
      querySnapshot.forEach(doc => {
        data.push({
          nisw: doc.id,
          ...doc.data()
        });
      });

      // Simpan ke localStorage
      localStorage.setItem('pendaftarData', JSON.stringify(data));
      callback(data);
      console.log("✅ Pendaftar dari Firestore:", data.length);

    } catch (error) {
      console.error("❌ Error getPendaftar:", error);
      callback([]);
    }
  },

  // ===== GET SISWA AKTIF =====
  getSiswaAktif: async function(callback) {
    try {
      // Cek localStorage
      const stored = localStorage.getItem('siswaData');
      if (stored) {
        const siswa = JSON.parse(stored).filter(s => s.status === 'Aktif');
        callback(siswa);
        console.log("✅ Siswa aktif dari localStorage:", siswa.length);
        return;
      }

      // Mock data untuk demo
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
          status: "Aktif"
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
          status: "Aktif"
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
          status: "Aktif"
        }
      ];

      localStorage.setItem('siswaData', JSON.stringify(demoSiswa));
      callback(demoSiswa);
      console.log("✅ Siswa aktif demo:", demoSiswa.length);

    } catch (error) {
      console.error("❌ Error getSiswaAktif:", error);
      callback([]);
    }
  },

  // ===== FIND SISWA =====
  findSiswa: async function(nisw, callback) {
    try {
      const stored = localStorage.getItem('siswaData');
      if (stored) {
        const siswa = JSON.parse(stored).find(s => s.nisw?.toUpperCase() === nisw.toUpperCase());
        callback(siswa || null);
        return;
      }

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

      // Demo data
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
      // Update di Firestore
      await db.collection('pendaftar').doc(nisw).update({
        status: status,
        updatedAt: new Date().toISOString()
      });

      // Update di localStorage
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
  }
};

console.log("✅ db-sync.js loaded - DBManager ready");
