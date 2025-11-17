# 🚗 BBM Dashboard - Sistem Monitoring BBM Real-time

Dashboard monitoring konsumsi BBM (Bahan Bakar Minyak) berbasis web dengan visualisasi data real-time menggunakan Next.js dan Google Sheets API.

## ✨ Fitur

- 📊 **Visualisasi Data Real-time** - Menampilkan data konsumsi BBM dalam berbagai format chart (Bar, Pie, Line)
- 🔄 **Auto-refresh** - Data diperbarui otomatis setiap 30 detik
- 📅 **Filter Periode** - Filter data berdasarkan hari ini, kemarin, 7 hari, atau 30 hari terakhir
- 🚙 **Filter Unit** - Filter berdasarkan unit kendaraan tertentu
- 📈 **Statistik Lengkap** - Total volume, jumlah transaksi, unit aktif, dan rata-rata konsumsi
- 📱 **Responsive Design** - Tampilan optimal di berbagai ukuran layar
- 🎨 **Modern UI** - Interface modern dengan Tailwind CSS

## 🛠️ Teknologi

- **Framework**: Next.js 14
- **UI Library**: React 18
- **Styling**: Tailwind CSS 3
- **Charts**: Recharts
- **Icons**: Lucide React
- **Data Source**: Google Sheets API

## 📋 Prasyarat

- Node.js 18+ dan npm
- Google Sheets API Key
- Google Spreadsheet dengan format:
  - Kolom A: Timestamp
  - Kolom B: Unit Kendaraan
  - Kolom C: Volume (Liter)
  - Kolom D: EPC

## 🚀 Instalasi

1. Clone repository:
```bash
git clone https://github.com/sahikjaman/bbm-dashboard.git
cd bbm-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Konfigurasi API (opsional, sudah ada default):
   - Buka file `pages/index.js`
   - Update `SPREADSHEET_ID` dan `API_KEY` dengan credentials Anda

4. Jalankan development server:
```bash
npm run dev
```

5. Buka browser di [http://localhost:3000](http://localhost:3000)

## 📦 Build untuk Production

```bash
npm run build
npm start
```

## 📁 Struktur Project

```
bbm-dashboard/
├── pages/
│   ├── _app.js          # App wrapper dengan global styles
│   └── index.js         # Dashboard utama
├── styles/
│   └── globals.css      # Global CSS dengan Tailwind
├── public/              # Static assets
├── package.json         # Dependencies
├── next.config.js       # Konfigurasi Next.js
├── tailwind.config.js   # Konfigurasi Tailwind CSS
└── postcss.config.js    # Konfigurasi PostCSS
```

## 🎯 Fitur Dashboard

### 📊 Statistik Cards
- **Total Volume**: Total konsumsi BBM dalam liter
- **Total Transaksi**: Jumlah pengisian BBM
- **Unit Aktif**: Jumlah kendaraan yang aktif
- **Rata-rata**: Volume rata-rata per transaksi

### 📈 Visualisasi Data
1. **Bar Chart**: Volume BBM per unit kendaraan
2. **Pie Chart**: Distribusi volume per unit
3. **Line Chart**: Trend volume harian (untuk periode > 1 hari)

### 📋 Tabel Riwayat
- Menampilkan semua transaksi dengan detail lengkap
- Sortir berdasarkan waktu terbaru
- Hover effect untuk kemudahan membaca

## 🔧 Konfigurasi

### Google Sheets Setup
1. Buat Google Spreadsheet baru
2. Format data sesuai kolom yang dibutuhkan
3. Enable Google Sheets API di Google Cloud Console
4. Generate API Key
5. Update credentials di `pages/index.js`

## 🤝 Kontribusi

Kontribusi sangat diterima! Silakan buat Pull Request atau laporkan issue.

## 📄 Lisensi

MIT License - silakan digunakan untuk keperluan apapun.

## 👨‍💻 Developer

Dikembangkan dengan ❤️ untuk monitoring BBM yang lebih efisien.

---

**Note**: Pastikan API Key dan Spreadsheet ID Anda sudah dikonfigurasi dengan benar sebelum deployment ke production.
