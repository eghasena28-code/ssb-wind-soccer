/**
 * ADMIN HELPERS - Database Siswa Functions
 * Mengelola Tagihan, Edit Data, dan Hapus Siswa
 */

console.log("📋 Loading admin-helpers.js...");

// ===== GLOBAL STATE =====
let adminState = {
  currentEditTagihan: null,
  currentEditSiswa: null,
  allSiswaData: [],
  allTagihan: {}
};

// ===== LOAD ALL TAGIHAN =====
function loadAllTagihan() {
  const stored = localStorage.getItem('dataTagihan');
  adminState.allTagihan = stored ? JSON.parse(stored) : {};
  console.log("✅ Tagihan loaded:", Object.keys(adminState.allTagihan).length);
}

// ===== SAVE ALL TAGIHAN =====
function saveAllTagihan() {
  localStorage.setItem('dataTagihan', JSON.stringify(adminState.allTagihan));
  console.log("✅ Tagihan saved");
}

// ===== GET TAGIHAN =====
function getTagihan(nisw) {
  loadAllTagihan(); // Refresh dulu
  return adminState.allTagihan[nisw] || {
    bulan: new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
    iuran: 150000,
    dendaAbsen: 0,
    dendaTurnamen: 0,
    keteranganDenda: '',
    status: 'Belum Lunas'
  };
}

// ===== OPEN TAGIHAN MODAL =====
window.openTagihanModal = function(nisw) {
  console.log("💰 Opening tagihan modal for:", nisw);
  
  const siswa = adminState.allSiswaData.find(s => s.nisw === nisw);
  if (!siswa) {
    showAlert("❌ Siswa tidak ditemukan!", "error");
    return;
  }

  const tagihan = getTagihan(nisw);
  adminState.currentEditTagihan = nisw;

  const modal = document.getElementById('modalTagihan');
  const modalHeader = modal.querySelector('.modal-header');
  const modalBody = modal.querySelector('.modal-body');

  modalHeader.innerHTML = `💰 Kelola Tagihan - ${siswa.nama} (${nisw})`;

  const totalTag = (tagihan.iuran || 0) + (tagihan.dendaAbsen || 0) + (tagihan.dendaTurnamen || 0);

  modalBody.innerHTML = `
    <label>Bulan Iuran:</label>
    <input type="text" id="editBulan" value="${tagihan.bulan}" placeholder="Misal: April 2026" required>

    <label>Iuran Bulanan (Rp):</label>
    <input type="number" id="editIuran" value="${tagihan.iuran}" placeholder="150000" min="0" required>

    <label>Denda Absensi (Rp):</label>
    <input type="number" id="editDendaAbsen" value="${tagihan.dendaAbsen}" placeholder="0" min="0">

    <label>Denda Turnamen (Rp):</label>
    <input type="number" id="editDendaTurnamen" value="${tagihan.dendaTurnamen}" placeholder="0" min="0">

    <label>Keterangan Denda:</label>
    <input type="text" id="editKeteranganDenda" value="${tagihan.keteranganDenda}" placeholder="Misal: Absen 3x latihan">

    <label>Status Pembayaran:</label>
    <select id="editStatusTagihan" required>
      <option value="Belum Lunas" ${tagihan.status === 'Belum Lunas' ? 'selected' : ''}>Belum Lunas</option>
      <option value="Lunas" ${tagihan.status === 'Lunas' ? 'selected' : ''}>Lunas</option>
      <option value="Cicil" ${tagihan.status === 'Cicil' ? 'selected' : ''}>Cicil</option>
    </select>

    <div style="background: #e8f5e9; padding: 12px; border-radius: 6px; margin-top: 15px; border-left: 4px solid #28a745;">
      <strong style="color: #28a745; display: block; margin-bottom: 8px;">📊 TOTAL TAGIHAN:</strong>
      <div style="font-size: 18px; font-weight: bold; color: #28a745;">
        Rp ${formatRupiah(totalTag)}
      </div>
    </div>
  `;

  modal.classList.add('active');
  console.log("✅ Tagihan modal opened");
};

// ===== SAVE TAGIHAN =====
window.saveTagihan = function() {
  console.log("💾 Saving tagihan...");
  
  if (!adminState.currentEditTagihan) {
    console.error("❌ No tagihan selected");
    return false;
  }

  // Get form values
  const bulan = document.getElementById('editBulan').value.trim();
  const iuran = parseInt(document.getElementById('editIuran').value) || 0;
  const dendaAbsen = parseInt(document.getElementById('editDendaAbsen').value) || 0;
  const dendaTurnamen = parseInt(document.getElementById('editDendaTurnamen').value) || 0;
  const keteranganDenda = document.getElementById('editKeteranganDenda').value.trim();
  const status = document.getElementById('editStatusTagihan').value;

  // Validation
  if (!bulan) {
    showAlert("⚠️ Bulan iuran harus diisi!", "warn");
    return false;
  }

  if (iuran < 0 || dendaAbsen < 0 || dendaTurnamen < 0) {
    showAlert("⚠️ Nominal tidak boleh negatif!", "warn");
    return false;
  }

  // Save ke adminState
  adminState.allTagihan[adminState.currentEditTagihan] = {
    bulan,
    iuran,
    dendaAbsen,
    dendaTurnamen,
    keteranganDenda,
    status,
    updatedAt: new Date().toISOString()
  };

  // Save ke localStorage
  saveAllTagihan();

  console.log("✅ Tagihan saved:", adminState.currentEditTagihan);
  showAlert(`✅ Tagihan ${adminState.currentEditTagihan} berhasil disimpan!`, "success");
  
  // Close modal & refresh
  closeTagihanModal();
  renderAllSiswa();
  
  return true;
};

// ===== CLOSE TAGIHAN MODAL =====
window.closeTagihanModal = function() {
  console.log("🔙 Closing tagihan modal");
  
  const modal = document.getElementById('modalTagihan');
  modal.classList.remove('active');
  adminState.currentEditTagihan = null;
};

// ===== EDIT SISWA =====
window.editSiswa = function(nisw) {
  console.log("✏️ Opening edit modal for:", nisw);
  
  const siswa = adminState.allSiswaData.find(s => s.nisw === nisw);
  if (!siswa) {
    console.error("❌ Siswa not found");
    return;
  }

  adminState.currentEditSiswa = nisw;

  const modal = document.getElementById('modalEditSiswa');
  const modalHeader = modal.querySelector('.modal-header');
  const modalBody = modal.querySelector('.modal-body');

  modalHeader.innerHTML = `✏️ Edit Data Siswa - ${siswa.nama}`;

  modalBody.innerHTML = `
    <label>Nama Lengkap:</label>
    <input type="text" id="editNamaSiswa" value="${siswa.nama || ''}" placeholder="Nama siswa" required minlength="3" maxlength="100">

    <label>Posisi:</label>
    <select id="editPosisiSiswa" required>
      <option value="">-- Pilih Posisi --</option>
      <option value="Kiper" ${siswa.posisi === 'Kiper' ? 'selected' : ''}>Kiper (GK)</option>
      <option value="Bek" ${siswa.posisi === 'Bek' ? 'selected' : ''}>Bek (DF)</option>
      <option value="Gelandang" ${siswa.posisi === 'Gelandang' ? 'selected' : ''}>Gelandang (MF)</option>
      <option value="Penyerang" ${siswa.posisi === 'Penyerang' ? 'selected' : ''}>Penyerang (FW)</option>
    </select>

    <label>Nama Orang Tua:</label>
    <input type="text" id="editOrangtua" value="${siswa.namaOrtu || ''}" placeholder="Nama orang tua" required minlength="3">

    <label>No HP:</label>
    <input type="tel" id="editHpSiswa" value="${siswa.noHp || ''}" placeholder="08xxxxxxxxxx" pattern="^08[0-9]{8,11}$" required>

    <label>Alamat:</label>
    <textarea id="editAlamatSiswa" placeholder="Alamat lengkap" required minlength="10" rows="3">${siswa.alamat || ''}</textarea>

    <div style="background: #f0f4ff; padding: 10px; border-radius: 6px; margin-top: 15px; font-size: 12px; color: #003399;">
      <strong>📝 Info:</strong><br>
      NISW: <strong>${siswa.nisw}</strong><br>
      Kategori: <strong>${siswa.kategori}</strong><br>
      Tipe: <strong>${siswa.tipe}</strong>
    </div>
  `;

  modal.classList.add('active');
  console.log("✅ Edit modal opened");
};

// ===== SAVE SISWA EDIT =====
window.saveSiswaEditFinal = function() {
  console.log("💾 Saving siswa changes...");
  
  if (!adminState.currentEditSiswa) {
    console.error("❌ No siswa selected");
    return false;
  }

  // Get form values
  const nama = document.getElementById('editNamaSiswa').value.trim();
  const posisi = document.getElementById('editPosisiSiswa').value.trim();
  const namaOrtu = document.getElementById('editOrangtua').value.trim();
  const noHp = document.getElementById('editHpSiswa').value.trim();
  const alamat = document.getElementById('editAlamatSiswa').value.trim();

  // Validation
  if (!nama || nama.length < 3) {
    showAlert("⚠️ Nama minimal 3 karakter!", "warn");
    return false;
  }

  if (!posisi) {
    showAlert("⚠️ Pilih posisi!", "warn");
    return false;
  }

  if (!namaOrtu || namaOrtu.length < 3) {
    showAlert("⚠️ Nama orang tua minimal 3 karakter!", "warn");
    return false;
  }

  if (!noHp || !/^08[0-9]{8,11}$/.test(noHp)) {
    showAlert("⚠️ Format nomor HP salah! (08xxxxxxxxxx)", "warn");
    return false;
  }

  if (!alamat || alamat.length < 10) {
    showAlert("⚠️ Alamat minimal 10 karakter!", "warn");
    return false;
  }

  // Find dan update
  const idx = adminState.allSiswaData.findIndex(s => s.nisw === adminState.currentEditSiswa);
  if (idx === -1) {
    console.error("❌ Siswa not found in allSiswaData");
    return false;
  }

  // Update data
  adminState.allSiswaData[idx].nama = nama;
  adminState.allSiswaData[idx].posisi = posisi;
  adminState.allSiswaData[idx].namaOrtu = namaOrtu;
  adminState.allSiswaData[idx].noHp = noHp;
  adminState.allSiswaData[idx].alamat = alamat;
  adminState.allSiswaData[idx].updatedAt = new Date().toISOString();

  // Save ke localStorage
  localStorage.setItem('siswaAktif', JSON.stringify(adminState.allSiswaData));
  console.log("✅ Siswa data updated");

  showAlert(`✅ Data ${adminState.currentEditSiswa} berhasil diperbarui!`, "success");
  
  // Close modal & refresh
  closeEditSiswaModal();
  renderAllSiswa();
  
  return true;
};

// ===== CLOSE EDIT SISWA MODAL =====
window.closeEditSiswaModal = function() {
  console.log("🔙 Closing edit modal");
  
  const modal = document.getElementById('modalEditSiswa');
  modal.classList.remove('active');
  adminState.currentEditSiswa = null;
};

// ===== HAPUS SISWA =====
window.hapusSiswa = function(nisw) {
  console.log("🗑️ Delete request for:", nisw);
  
  const siswa = adminState.allSiswaData.find(s => s.nisw === nisw);
  if (!siswa) {
    console.error("❌ Siswa not found");
    return;
  }

  // Double confirmation
  const confirm1 = confirm(`⚠️ PERHATIAN!\n\nHapus siswa: ${siswa.nama} (${nisw})?\n\nData akan dihapus dari database dan TIDAK BISA DIKEMBALIKAN!`);
  
  if (!confirm1) {
    console.log("❌ Delete cancelled by user");
    return;
  }

  const confirm2 = confirm(`⚠️⚠️ YAKIN?\n\nHapus: ${siswa.nama}\n\nKlik OK untuk konfirmasi akhir!`);
  
  if (!confirm2) {
    console.log("❌ Delete cancelled (second confirmation)");
    return;
  }

  console.log("🗑️ Deleting siswa...");

  // Delete dari allSiswaData
  adminState.allSiswaData = adminState.allSiswaData.filter(s => s.nisw !== nisw);
  localStorage.setItem('siswaAktif', JSON.stringify(adminState.allSiswaData));
  console.log("✅ Siswa deleted from siswaAktif");

  // Delete tagihan
  loadAllTagihan();
  if (adminState.allTagihan[nisw]) {
    delete adminState.allTagihan[nisw];
    saveAllTagihan();
    console.log("✅ Tagihan deleted");
  }

  showAlert(`✅ Siswa ${nisw} (${siswa.nama}) berhasil dihapus dari database!`, "success");
  
  // Refresh tabel
  renderAllSiswa();
};

// ===== GET TOTAL TAGIHAN =====
window.getTotalTagihan = function(nisw) {
  loadAllTagihan();
  const tagihan = adminState.allTagihan[nisw];
  if (!tagihan) return 0;
  return (tagihan.iuran || 0) + (tagihan.dendaAbsen || 0) + (tagihan.dendaTurnamen || 0);
};

// ===== GET STATUS TAGIHAN =====
window.getStatusTagihan = function(nisw) {
  loadAllTagihan();
  return adminState.allTagihan[nisw]?.status || 'Belum Bayar';
};

// ===== UPDATE GLOBAL STATE =====
window.updateAdminState = function(siswaList) {
  adminState.allSiswaData = siswaList || [];
  loadAllTagihan();
};

console.log("✅ admin-helpers.js loaded");