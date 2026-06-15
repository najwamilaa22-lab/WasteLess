# Business Rules & Logic Specification (BUSINESS_RULES.md)
## Project: WasteLess (Platform Manajemen Food Waste, Nutrisi, dan Budgeting Rumah Tangga Berbasis AI)

**Versi:** 1.0  
**Tanggal:** 3 Juni 2026  
**Status:** Approved  
**Author:** Product Management & Sharia Governance Team  
**Referensi Utama:** `PRD_WasteLess.md`, `ARCHITECTURE.md`, `WasteLess (1).pdf`, dan `BLUEPRINT RANCANGAN SISTEM.docx`

---

## 1. Pendahuluan (Introduction)
Dokumen **BUSINESS_RULES.md** ini mendefinisikan seluruh aturan bisnis, batasan operasional, logika perhitungan matematis, dan kebijakan fungsional yang wajib diterapkan ke dalam kode program platform **WasteLess**. Aturan-aturan ini memastikan konsistensi sistem dalam mengolah data inventaris dapur (*Digital Fridge*), kalkulasi batas anggaran bulanan (*Budget Ceiling*), kepatuhan nilai Syariah (*Anti-Tabdzir*), serta sinkronisasi target nutrisi keluarga.

---

## 2. Matriks Aturan Manajemen Inventaris (Digital Fridge Rules)

Sistem pemantauan kesegaran bahan pangan wajib mengadopsi pendekatan manajemen inventaris **FIFO (First In, First Out)** untuk memastikan bahan makanan yang dibeli lebih awal menjadi prioritas utama untuk dikonsumsi.

### 2.1 Logika Indikator Urgensi Kesegaran (Freshness Traffic-Light System)
Setiap item bahan pangan yang dimasukkan melalui *AI Smart Scanner* atau input manual akan dihitung sisa masa amannya berdasarkan formula:
$$\text{Sisa Hari} = \text{Estimated Expiry Date} - \text{Current Date}$$

Warna indikator pada *Inventory Page* ditentukan secara ketat oleh aturan berikut:

| Sisa Masa Aman (Hari) | Status Sistem | Refleksi Warna UI (Tailwind) | Aturan Bisnis & Tindakan Sistem |
| :--- | :--- | :--- | :--- |
| $> 2 \text{ Hari}$ | `Segar` | 🟢 `bg-green-500` | Bahan pangan dalam kondisi aman untuk disimpan. |
| $\le 2 \text{ Hari}$ dan $> 1 \text{ Hari}$ | `Warning` | 🟡 `bg-yellow-500` | Sistem memicu alert pemicu pada dashboard untuk segera dijadwalkan masuk ke menu mingguan. |
| $\le 1 \text{ Hari}$ | `Kritis` | 🔴 `bg-red-500` | Bahan pangan berstatus kritis. Sistem mengirim push notification dan otomatis memasukkannya sebagai parameter wajib ke komponen *AI Meal Planner*. |
| $< 0 \text{ Hari}$ | `Busuk` | ❌ Abu-abu / Coret | Item otomatis dipindahkan dari tabel `pantry_assets` ke tabel `waste_logs` sebagai kerugian finansial penuh (*Total Loss*). |

### 2.2 Aturan Default Estimasi Kedaluwarsa Otomatis
Jika AI Gemini tidak menemukan tanggal kedaluwarsa tertulis pada struk, sistem wajib menerapkan durasi aman bawaan (*default shelf-life duration*) sejak tanggal pembelian (`purchase_date`):
* **Sayuran Hijau & Jamur:** `Estimated Expiry` = `Purchase Date` + 3 Hari.
* **Daging Sapi & Ayam Segar (Non-Freezer):** `Estimated Expiry` = `Purchase Date` + 3 Hari.
* **Susu Segar & Produk Olahan Susu:** `Estimated Expiry` = `Purchase Date` + 7 Hari.
* **Telur Ayam:** `Estimated Expiry` = `Purchase Date` + 14 Hari.
* **Bumbu Dapur Kering & Beras:** `Estimated Expiry` = `Purchase Date` + 180 Hari.

---

## 3. Aturan Keuangan & Logika Finansial (Budgeting & Waste-to-Cash Analytics)

### 3.1 Pagu Anggaran Bulanan (Budget Ceiling Rules)
* Setiap pengguna wajib mendefinisikan batas atas pengeluaran bulanan (`budget_ceiling`) pada tahap awal penyiapan akun (`Setup`).
* Pengeluaran berjalan (`current_spending`) akan bertambah secara otomatis setiap kali pengguna sukses melakukan pemindaian struk via *AI Smart Scanner*.
* **Aturan Batas Atas:** Jika nilai `current_spending` telah mencapai 90% dari `budget_ceiling`, sistem wajib mengaktifkan banner peringatan warna oranye pada dashboard finansial pengguna. Jika melampaui 100%, status budget berubah menjadi `Overbudget` dan asisten virtual (ChatGPT) akan memberikan rekomendasi penghematan ekstra.

### 3.2 Rumus Perhitungan Audit Kerugian Finansial (Waste Logs Logic)
Kerugian finansial akibat bahan makanan yang dibuang dihitung secara linear berdasarkan volume gramasi yang terbuang terhadap harga beli awal aset:

$$\text{Financial Loss (Rp)} = \left( \frac{\text{Wasted Weight (Gram)}}{\text{Total Weight Purchased (Gram)}} \right) \times \text{Purchase Price (Rp)}$$

*Contoh Kasus:* Pengguna membeli 500 gram Daging Sapi seharga Rp 70.000. Karena lalai, sebanyak 200 gram membusuk dan dibuang. 
$$\text{Financial Loss} = \left( \frac{200}{500} \right) \times 70.000 = \text{Rp } 28.000$$
Nilai Rp 28.000 ini secara instan dimasukkan ke tabel `waste_logs` dan memotong grafik efisiensi keuangan bulanan.

---

## 4. Aturan Logika AI Meal Planner (Culinary Reasoning Filter)

Rekomendasi menu makanan yang ditenagai oleh **Anthropic Claude 3.5 Sonnet** wajib mematuhi batasan penyaringan (*strict filtering rules*) berikut sebelum ditampilkan ke antarmuka pengguna:

1. **Aturan Prioritas Utama:** 100% dari resep yang direkomendasikan harus mengandung minimal satu bahan makanan yang berstatus `Kritis` (Indikator Merah) dari inventaris digital milik pengguna tersebut.
2. **Aturan Filter Halal & Thayyiban:** Menu masakan dilarang keras mengandung unsur non-halal. Apabila pengguna memasukkan preferensi riwayat kesehatan (misal: "Diabetes" atau "Kolesterol Tinggi"), Claude AI wajib menyaring resep agar batas kandungan gula/lemak jenuh per porsi berada di bawah ambang batas standar kesehatan.
3. **Logika Penghematan Domestik (Saved Asset Analytics):** Setiap resep masakan wajib menampilkan estimasi nominal rupiah yang berhasil diselamatkan dari tempat sampah jika resep tersebut dieksekusi oleh pengguna.

---

## 5. Logika Mutasi Data & Pemotongan Stok Otomatis

* **Pemicu (Trigger):** Pengguna menekan tombol "Konfirmasi Selesai Memasak" pada kartu detail resep.
* **Aksi Mutasi Sistem (Database Mutation):**
  * Jika jumlah gramasi bahan pangan yang digunakan di dalam resep **sama dengan atau lebih besar** dari jumlah stok yang tersedia di tabel `pantry_assets`, maka baris item tersebut diubah statusnya menjadi `is_consumed = TRUE` atau dihapus secara kaskade (tergantung pilihan arsip pengguna).
  * Jika kuantitas bahan yang digunakan **lebih kecil** dari stok tersedia, sistem melakukan kueri pembaruan pengurangan kuantitas:
    $$\text{Stok Baru} = \text{Stok Lama} - \text{Gramasi Resep}$$
* Perubahan data ini secara *real-time* akan memicu kalkulasi ulang grafik pemenuhan target nutrisi harian pengguna pada tabel `nutrition_profiles`.

---

## 6. Tata Kelola Kepatuhan Syariah (Anti-Tabdzir Audit Governance)

Sebagai bagian dari komitmen penegakan perilaku bijak pangan dan penekanan sifat mubazir (*Tabdzir*), sistem menetapkan **Indeks Kebijakan Domestik (Kitchen Efficiency Index)** pada laporan rangkuman akhir periode bulan:

$$\text{Kitchen Efficiency Index (\%)} = \left( 1 - \frac{\text{Total Financial Loss Bulan Ini}}{\text{Total Pengeluaran Belanja Bulan Ini}} \right) \times 100\%$$

* **Index $\ge 90\%$:** Kategori `Mumtaz` (Sangat Bijak - Pengguna berhasil mengamankan aset pangan secara optimal sesuai syariat).
* **Index $70\% - 89\%$:** Kategori `Maqbul` (Cukup Bijak).
* **Index $< 70\%$:** Kategori `Tabdzir Warning` (Mubazir Alert - Sistem secara otomatis akan memicu panduan audio edukasi penghematan dapur dari asisten virtual pada awal bulan berikutnya).