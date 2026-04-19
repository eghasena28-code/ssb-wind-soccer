/**
 * ===============================================
 * ADMIN HELPERS - SSB WIND SOCCER
 * Database Siswa Helper Functions
 * Version: 2.0
 * ===============================================
 */

console.log("📋 Loading admin-helpers.js v2.0...");

// ===== GLOBAL ADMIN STATE =====
window.adminState = {
  currentEditTagihan: null,
  currentEditSiswa: null,
  allSiswaData: [],
  allTagihan: {},
  allAbsensi: []
};

/**
 * LOAD ALL TAGIHAN FROM LOCALSTORAGE
 */
function loadAllTagihan() {
  try {
    const stored = localStorage.getItem('dataTagihan');
    window.adminState.allTagihan = stored ? JSON.parse(stored) : {};
    console.log("✅ Tagihan loaded:", Object.keys(window.adminState.allTagihan).length, "records");
    return window.adminState.allTagihan;
  } catch (err) {
    console.error("❌ Error loading tagihan:", err);
    window.adminState.allTagihan = {};
    return {};
  }
}

/**
 * SAVE ALL TAGIHAN TO LOCALSTORAGE
 */
function saveAllTagihan() {
  try {
    localStorage.setItem('dataTagihan', JSON.stringify(window.adminState.allTagihan));
    console.log("✅ Tagihan saved to localStorage");
    return true;
  } catch (err) {
    console.error("❌ Error saving tagihan:", err);
    showAlert("❌ Gagal menyimpan tagihan!", "error");
    return false;
  }
}

/**
 * GET TAGIHAN FOR SPECIFIC STUDENT
 */
function getTagihan(nisw) {
  loadAllTagihan();
  
  if (!nisw) {
    console.warn("⚠️ NISW not provided");
    return null;
  }

  const tagihan = window.adminState.allTagihan[nisw];
  
  if (!tagihan) {
    console.log("ℹ️ No tagihan found, returning default:", nisw);
    return {
      bulan: new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
      iuran: 150000,
      dendaAbsen: 0,
      dendaTurnamen: 0,
      keteranganDenda: '',
      status: 'Belum Lunas'
    };
  }

  console.log("✅ Tagihan found for", nisw);
  return tagihan;
}

/**
 * OPEN TAGIHAN MODAL
 */
window.openTagihanModal = function(nisw) {
  console.log("💰 [TAGIHAN] Opening modal for:", nisw);
  
  if (!nisw) {
    showAlert("❌ NISW tidak valid!", "error");
    return;
  }

  // Find siswa
  const siswa = window.adminState.allSiswaData.find(s => s.nisw === nisw);
  if (!siswa) {
    console.error("❌ Siswa not found:", nisw);
    showAlert("❌ Siswa tidak ditemukan!", "error");
    return;
  }

  console.log("✅ Siswa found:", siswa.nama);

  // Get tagihan
  const tagihan = getTagihan(nisw);
  window.adminState.currentEditTagihan = nisw;

  // Update modal
  const modal = document.getElementById('modalTagihan');
  const modalHeader = modal.querySelector('.modal-header');
  const modalBody = modal.querySelector('.modal-body');

  if (!modal || !modalHeader || !modalBody) {
    console.error("❌ Modal elements not found");
    return;
  }

  // Calculate total
  const totalTag = (tagihan.iuran || 0) + (tagihan.dendaAbsen || 0) + (tagihan.dendaTurnamen || 0);

  // Build HTML
  modalHeader.innerHTML = `💰 Kelola Tagihan - ${siswa.nama} (${nisw})`;
  
  modalBody.innerHTML = `
    <div class="info-box">
      <strong>👤 Siswa:</strong> ${siswa.nama}<br>
      <strong>🆔 NISW:</strong> ${siswa.nisw}<br>
      <strong>📚 Kategori:</strong> ${siswa.kategori}<br>
      <strong>💳 Tipe:</strong> ${siswa.tipe}
    </div>

    <label><strong>📅 Bulan Iuran:</strong></label>
    <input type="text" id="editBulan" value="${tagihan.bulan || ''}" placeholder="Misal: April 2026" required>

    <label><strong>💵 Iuran Bulanan (Rp):</strong></label>
    <input type="number" id="editIuran" value="${tagihan.iuran || 0}" placeholder="150000" min="0" required>

    <label><strong>🚫 Denda Absensi (Rp):</strong></label>
    <input type="number" id="editDendaAbsen" value="${tagihan.dendaAbsen || 0}" placeholder="0" min="0">

    <label><strong>🏆 Denda Turnamen (Rp):</strong></label>
    <input type="number" id="editDendaTurnamen" value="${tagihan.dendaTurnamen || 0}" placeholder="0" min="0">

    <label><strong>📝 Keterangan Denda:</strong></label>
    <input type="text" id="editKeteranganDenda" value="${tagihan.keteranganDenda || ''}" placeholder="Misal: Absen 3x latihan">

    <label><strong>📊 Status Pembayaran:</strong></label>
    <select id="editStatusTagihan" required>
      <option value="Belum Lunas" ${tagihan.status === 'Belum Lunas' ? 'selected' : ''}>❌ Belum Lunas</option>
      <option value="Cicilan" ${tagihan.status === 'Cicilan' ? 'selected' : ''}>⏳ Cicilan</option>
      <option value="Lunas" ${tagihan.status === 'Lunas' ? 'selected' : ''}>✅ Lunas</option>
    </select>

    <div style="background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); padding: 15px; border-radius: 8px; margin-top: 20px; border-left: 5px solid #28a745; box-shadow: 0 2px 8px rgba(40,167,69,0.2);">
      <strong style="color: #1b5e20; display: block; margin-bottom: 10px; font-size: 14px;">📊 TOTAL TAGIHAN:</strong>
      <div style="font-size: 24px; font-weight: bold; color: #28a745;">
        Rp ${formatRupiah(totalTag)}
      </div>
      <small style="color: #558b2f; margin-top: 8px; display: block;">
        💰 ${formatRupiah(tagihan.iuran)} + 
        🚫 ${formatRupiah(tagihan.dendaAbsen)} + 
        🏆 ${formatRupiah(tagihan.dendaTurnamen)}
      </small>
    </div>

    <div style="background: #fff3cd; padding: 10px; border-radius: 6px; margin-top: 15px; font-size: 12px; color: #856404; border-left: 4px solid #ffc107;">
      <strong>💡 Tips:</strong> Simpan tagihan setiap kali ada perubahan. Status akan muncul di database.
    </div>
  `;

  modal.classList.add('active');
  console.log("✅ Tagihan modal opened successfully");
};

/**
 * SAVE TAGIHAN
 */
window.saveTagihan = function() {
  console.log("💾 [TAGIHAN] Saving tagihan...");
  
  const nisw = window.adminState.currentEditTagihan;
  if (!nisw) {
    console.error("❌ No tagihan selected");
    showAlert("❌ Data tidak valid!", "error");
    return false;
  }

  try {
    // Get form values
    const bulan = (document.getElementById('editBulan').value || '').trim();
    const iuran = parseInt(document.getElementById('editIuran').value) || 0;
    const dendaAbsen = parseInt(document.getElementById('editDendaAbsen').value) || 0;
    const dendaTurnamen = parseInt(document.getElementById('editDendaTurnamen').value) || 0;
    const keteranganDenda = (document.getElementById('editKeteranganDenda').value || '').trim();
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

    if (!status) {
      showAlert("⚠️ Status pembayaran harus dipilih!", "warn");
      return false;
    }

    console.log("✅ Form validation passed");

    // Save to state
    window.adminState.allTagihan[nisw] = {
      bulan: bulan,
      iuran: iuran,
      dendaAbsen: dendaAbsen,
      dendaTurnamen: dendaTurnamen,
      keteranganDenda: keteranganDenda,
      status: status,
      updatedAt: new Date().toISOString(),
      updatedBy: "admin"
    };

    // Save to localStorage
    if (!saveAllTagihan()) {
      throw new Error("Failed to save to localStorage");
    }

    console.log("✅ Tagihan saved successfully");
    showAlert(`✅ Tagihan ${nisw} berhasil disimpan!`, "success");
    
    // Close modal
    window.closeTagihanModal();
    
    // Refresh table
    setTimeout(() => {
      renderAllSiswa();
    }, 300);
    
    return true;

  } catch (err) {
    console.error("❌ Error saving tagihan:", err);
    showAlert("❌ Gagal menyimpan tagihan: " + err.message, "error");
    return false;
  }
};

/**
 * CLOSE TAGIHAN MODAL
 */
window.closeTagihanModal = function() {
  console.log("🔙 Closing tagihan modal");
  
  const modal = document.getElementById('modalTagihan');
  if (modal) {
    modal.classList.remove('active');
  }
  
  window.adminState.currentEditTagihan = null;
};

/**
 * EDIT SISWA
 */
window.editSiswa = function(nisw) {
  console.log("✏️ [EDIT] Opening modal for:", nisw);
  
  if (!nisw) {
    showAlert("❌ NISW tidak valid!", "error");
    return;
  }

  const siswa = window.adminState.allSiswaData.find(s => s.nisw === nisw);
  if (!siswa) {
    console.error("❌ Siswa not found:", nisw);
    showAlert("❌ Siswa tidak ditemukan!", "error");
    return;
  }

  console.log("✅ Siswa found:", siswa.nama);

  window.adminState.currentEditSiswa = nisw;

  const modal = document.getElementById('modalEditSiswa');
  const modalHeader = modal.querySelector('.modal-header');
  const modalBody = modal.querySelector('.modal-body');

  if (!modal || !modalHeader || !modalBody) {
    console.error("❌ Modal elements not found");
    return;
  }

  modalHeader.innerHTML = `✏️ Edit Data Siswa - ${siswa.nama}`;

  modalBody.innerHTML = `
    <div class="info-box">
      <strong>🆔 NISW:</strong> ${siswa.nisw}<br>
      <strong>📚 Kategori:</strong> ${siswa.kategori}<br>
      <strong>🎂 Tgl Lahir:</strong> ${formatTanggal(siswa.tglLahir)}
    </div>

    <label><strong>👤 Nama Lengkap:</strong></label>
    <input type="text" id="editNamaSiswa" value="${siswa.nama || ''}" placeholder="Nama siswa" required minlength="3" maxlength="100">

    <label><strong>⚽ Posisi:</strong></label>
    <select id="editPosisiSiswa" required>
      <option value="">-- Pilih Posisi --</option>
      <option value="Kiper" ${siswa.posisi === 'Kiper' ? 'selected' : ''}>🧤 Kiper (GK)</option>
      <option value="Bek" ${siswa.posisi === 'Bek' ? 'selected' : ''}>🛡️ Bek (DF)</option>
      <option value="Gelandang" ${siswa.posisi === 'Gelandang' ? 'selected' : ''}>⚙️ Gelandang (MF)</option>
      <option value="Penyerang" ${siswa.posisi === 'Penyerang' ? 'selected' : ''}>⚡ Penyerang (FW)</option>
    </select>

    <label><strong>👨‍👩‍👦 Nama Orang Tua:</strong></label>
    <input type="text" id="editOrangtua" value="${siswa.namaOrtu || ''}" placeholder="Nama orang tua" required minlength="3" maxlength="100">

    <label><strong>📱 No HP:</strong></label>
    <input type="tel" id="editHpSiswa" value="${siswa.noHp || ''}" placeholder="08xxxxxxxxxx" pattern="^08[0-9]{8,11}$" required>

    <label><strong>📍 Alamat:</strong></label>
    <textarea id="editAlamatSiswa" placeholder="Alamat lengkap" required minlength="10" maxlength="200" rows="3">${siswa.alamat || ''}</textarea>

    <div style="background: #f0f4ff; padding: 12px; border-radius: 6px; margin-top: 15px; font-size: 12px; color: #003399; border-left: 4px solid #003399;">
      <strong>ℹ️ Informasi Siswa:</strong><br>
      💳 Tipe: ${siswa.tipe}<br>
      📊 Status: ${siswa.status}<br>
      📅 Terdaftar: ${formatTanggal(siswa.createdAt || siswa.tglAktif)}
    </div>
  `;

  modal.classList.add('active');
  console.log("✅ Edit modal opened successfully");
};

/**
 * SAVE SISWA CHANGES
 */
window.saveSiswaEditFinal = function() {
  console.log("💾 [EDIT] Saving siswa changes...");
  
  const nisw = window.adminState.currentEditSiswa;
  if (!nisw) {
    console.error("❌ No siswa selected");
    showAlert("❌ Data tidak valid!", "error");
    return false;
  }

  try {
    // Get form values
    const nama = (document.getElementById('editNamaSiswa').value || '').trim();
    const posisi = (document.getElementById('editPosisiSiswa').value || '').trim();
    const namaOrtu = (document.getElementById('editOrangtua').value || '').trim();
    const noHp = (document.getElementById('editHpSiswa').value || '').trim();
    const alamat = (document.getElementById('editAlamatSiswa').value || '').trim();

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

    console.log("✅ Form validation passed");

    // Find and update
    const idx = window.adminState.allSiswaData.findIndex(s => s.nisw === nisw);
    if (idx === -1) {
      console.error("❌ Siswa not found in data");
      showAlert("❌ Siswa tidak ditemukan di database!", "error");
      return false;
    }

    // Update data
    window.adminState.allSiswaData[idx].nama = nama;
    window.adminState.allSiswaData[idx].posisi = posisi;
    window.adminState.allSiswaData[idx].namaOrtu = namaOrtu;
    window.adminState.allSiswaData[idx].noHp = noHp;
    window.adminState.allSiswaData[idx].alamat = alamat;
    window.adminState.allSiswaData[idx].updatedAt = new Date().toISOString();

    // Save to localStorage
    localStorage.setItem('siswaAktif', JSON.stringify(window.adminState.allSiswaData));
    console.log("✅ Siswa data saved to localStorage");

    showAlert(`✅ Data ${nisw} (${nama}) berhasil diperbarui!`, "success");
    
    // Close modal
    window.closeEditSiswaModal();
    
    // Refresh table
    setTimeout(() => {
      renderAllSiswa();
    }, 300);
    
    return true;

  } catch (err) {
    console.error("❌ Error saving siswa:", err);
    showAlert("❌ Gagal menyimpan data: " + err.message, "error");
    return false;
  }
};

/**
 * CLOSE EDIT SISWA MODAL
 */
window.closeEditSiswaModal = function() {
  console.log("🔙 Closing edit modal");
  
  const modal = document.getElementById('modalEditSiswa');
  if (modal) {
    modal.classList.remove('active');
  }
  
  window.adminState.currentEditSiswa = null;
};

/**
 * DELETE SISWA
 */
window.hapusSiswa = function(nisw) {
  console.log("🗑️ [DELETE] Delete request for:", nisw);
  
  if (!nisw) {
    showAlert("❌ NISW tidak valid!", "error");
    return;
  }

  const siswa = window.adminState.allSiswaData.find(s => s.nisw === nisw);
  if (!siswa) {
    console.error("❌ Siswa not found");
    showAlert("❌ Siswa tidak ditemukan!", "error");
    return;
  }

  // First confirmation
  const confirm1 = confirm(
    `⚠️ PERHATIAN!\n\n` +
    `Hapus siswa:\n` +
    `${siswa.nama} (${nisw})\n\n` +
    `Data akan dihapus PERMANEN dan TIDAK BISA DIKEMBALIKAN!\n\n` +
    `Lanjutkan?`
  );
  
  if (!confirm1) {
    console.log("❌ Delete cancelled by user (1st confirm)");
    return;
  }

  // Second confirmation
  const confirm2 = confirm(
    `⚠️⚠️ KONFIRMASI AKHIR!\n\n` +
    `Yakin hapus: ${siswa.nama}?\n\n` +
    `Klik OK untuk menghapus secara permanen!`
  );
  
  if (!confirm2) {
    console.log("❌ Delete cancelled by user (2nd confirm)");
    return;
  }

  console.log("🗑️ Deleting siswa...");

  try {
    // Delete from allSiswaData
    const beforeLength = window.adminState.allSiswaData.length;
    window.adminState.allSiswaData = window.adminState.allSiswaData.filter(s => s.nisw !== nisw);
    const afterLength = window.adminState.allSiswaData.length;

    if (beforeLength === afterLength) {
      throw new Error("Siswa tidak dihapus dari array");
    }

    localStorage.setItem('siswaAktif', JSON.stringify(window.adminState.allSiswaData));
    console.log("✅ Siswa deleted from siswaAktif");

    // Delete tagihan
    loadAllTagihan();
    if (window.adminState.allTagihan[nisw]) {
      delete window.adminState.allTagihan[nisw];
      saveAllTagihan();
      console.log("✅ Tagihan deleted");
    }

    showAlert(
      `✅ Siswa berhasil dihapus!\n\n` +
      `${siswa.nama} (${nisw})\n` +
      `telah dihapus dari database.`,
      "success"
    );
    
    // Refresh table
    setTimeout(() => {
      renderAllSiswa();
    }, 300);

  } catch (err) {
    console.error("❌ Error deleting siswa:", err);
    showAlert("❌ Gagal menghapus siswa: " + err.message, "error");
  }
};

/**
 * GET TOTAL TAGIHAN
 */
window.getTotalTagihan = function(nisw) {
  if (!nisw) return 0;
  
  loadAllTagihan();
  const tagihan = window.adminState.allTagihan[nisw];
  
  if (!tagihan) return 0;
  
  return (tagihan.iuran || 0) + (tagihan.dendaAbsen || 0) + (tagihan.dendaTurnamen || 0);
};

/**
 * GET STATUS TAGIHAN
 */
window.getStatusTagihan = function(nisw) {
  if (!nisw) return 'Belum Bayar';
  
  loadAllTagihan();
  return window.adminState.allTagihan[nisw]?.status || 'Belum Bayar';
};

/**
 * UPDATE ADMIN STATE
 */
window.updateAdminState = function(siswaList) {
  console.log("🔄 Updating admin state...");
  window.adminState.allSiswaData = siswaList || [];
  loadAllTagihan();
  console.log("✅ Admin state updated");
};

/**
 * GET STATUS BAYAR COLOR
 */
window.getStatusBayarColor = function(status) {
  const colors = {
    'Lunas': '#28a745',
    'Cicilan': '#ffc107',
    'Cicil': '#ffc107',
    'Belum Bayar': '#dc3545'
  };
  return colors[status] || '#6c757d';
};

console.log("✅ admin-helpers.js v2.0 fully loaded");
