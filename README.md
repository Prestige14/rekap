# Rekap

Web-based automated document and invoice extractor to Microsoft Excel and CSV.

Rekap memungkinkan pengguna mengunggah banyak berkas PDF invoice, bukti transfer, nota, dan struk belanja sekaligus, mengekstrak data keuangan penting secara terstruktur menggunakan AI Vision (Google Gemini), melakukan verifikasi serta koreksi langsung pada tabel spreadsheet interaktif di browser, dan mengunduh hasilnya dalam format `.xlsx` (lengkap dengan formula total otomatis dan format Rupiah) atau `.csv`.

---

## Fitur Utama

- **Batch Drag & Drop Upload**: Menerima berkas `.pdf`, `.png`, `.jpg`, `.jpeg`, dan `.webp` hingga 30+ berkas dalam satu antrean.
- **Visual File Queue**: Indikator progres horizontal dan status setiap dokumen (*Queued*, *Processing*, *Success*, *Failed*).
- **Vision Extraction Engine**: Ekstraksi cerdas nomor invoice, nama vendor, tanggal terbit, jatuh tempo, kategori pengeluaran, subtotal, pajak (PPN), total nominal, serta skor keyakinan (*confidence level*).
- **Interactive Review Table**: Tabel bergaya spreadsheet dengan *inline editing* (klik sel untuk mengedit langsung), penandaan baris perhatian, serta penambahan/penghapusan baris manual.
- **Side-by-Side Document Preview**: Pratinjau berkas asli (PDF / gambar) bersebelahan dengan data hasil ekstraksi untuk kemudahan verifikasi mata.
- **1-Click Export Engine**:
  - **Excel (.xlsx)**: Dihasilkan via ExcelJS dengan styling profesional, format cell mata uang Rupiah (`Rp`), dan baris ringkasan dengan formula `SUM` dinamis.
  - **CSV**: Format UTF-8 dengan BOM untuk kompatibilitas penuh dengan software akuntansi (Jurnal, Accurate, QuickBooks, dsb).

---

## Tech Stack

- **Framework**: Next.js (App Router) & React 19
- **Bahasa**: TypeScript
- **Styling**: Tailwind CSS
- **Ikon**: Lucide React
- **AI Engine**: Google Gen AI SDK (`@google/genai` / Gemini 2.5 Flash)
- **Excel Generator**: ExcelJS

---

## Memulai Cepat

### 1. Instalasi Dependensi

```bash
npm install
```

### 2. Konfigurasi Lingkungan (Opsional)

Buat berkas `.env.local` jika ingin menyetel API key di level server:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

> **Catatan:** Pengguna juga dapat memasukkan API Key secara langsung melalui tombol **"Pengaturan API"** pada antarmuka web. Kunci disimpan aman di penyimpanan lokal peramban (*localStorage*). Tanpa API key, sistem tetap dapat diuji menggunakan mode simulasi lokal dan contoh data siap pakai.

### 3. Menjalankan Server Pengembangan

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) pada peramban web.

### 4. Build untuk Produksi

```bash
npm run build
npm start
```
