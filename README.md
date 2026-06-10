# Muhammad Fachrurrozy - Interactive Portfolio

Welcome to the source code of Muhammad Fachrurrozy's Interactive Portfolio. This project is a highly optimized, single-page application built with raw HTML, Tailwind CSS, and Vanilla JavaScript, featuring a dynamic JSON-based Content Management System (CMS).

## 🌟 Key Features

1. **Cinematic Intro Loader**
   A seamless, philosophical opening sequence that cross-fades quotes over a smooth mountain silhouette, perfectly blending into the main site's particle background.
   
2. **Dynamic 3D Particle Network**
   An interactive, high-performance canvas background that connects particles based on cursor proximity.

3. **Multi-Thematic Engine**
   8 distinct, elegantly crafted color themes (Forest, Light Mode, Aleksandria, Glacier, Neon Tokyo, Abyss, Sunset, Monochrome) that can be switched instantly via CSS variables.

4. **Custom Hardware-Accelerated Cursor**
   A sleek, trailing dot-and-outline cursor with click-ripple animations and magnetic hover states (intelligently disabled on touch devices to ensure peak mobile performance).

5. **Serverless CMS Architecture**
   Content is entirely decoupled from the HTML. Text, links, and images are fetched dynamically from `data.json` and `images.json`, allowing instant content updates without recompiling code.

6. **Glassmorphism & 3D Tilt UI**
   Premium frosted-glass panels with subtle, math-driven 3D tilt effects (`perspective` and `rotateX/Y`) that react to mouse movements.

7. **Markdown Support**
   Built-in Markdown parsing allows formatting (bold, italics, links, lists) directly within the `data.json` text fields.

---

## 📝 Panduan Penggunaan CMS (Content Management System)

Situs ini menggunakan sistem CMS tanpa server (Serverless). Anda tidak perlu menyentuh file `index.html` sama sekali untuk mengubah teks atau gambar.

### 1. Mengubah Teks & Konten (`content/data.json`)
File ini mengontrol seluruh teks di dalam website (Nama, Deskripsi, Riwayat Pendidikan, Keahlian, dan Pengalaman).
- Buka file `content/data.json`.
- Ubah nilai (value) teks yang ada di dalam tanda kutip.
- **Fitur Markdown:** Anda bisa menggunakan format Markdown pada kolom `description`. Contoh: 
  - `**Teks Tebal**` menjadi **Teks Tebal**
  - `[Google](https://google.com)` menjadi tautan yang bisa diklik.

### 2. Mengubah Gambar (`content/images.json`)
File ini menyimpan seluruh gambar yang digunakan pada website.
- Buka file `content/images.json`.
- Ganti URL atau teks `Base64` di sebelah kanan ID gambar.
- Disarankan menggunakan format `Base64` agar gambar memuat seketika tanpa perlu *hosting* file eksternal, atau gunakan URL gambar biasa (`https://...`).

### 3. Mengubah Pengaturan (`content/settings.json`)
- Gunakan file ini untuk mengatur konfigurasi umum seperti perataan teks (`text_alignment`: `"text-justify"` atau `"text-left"`).

**Catatan:** Setiap kali file JSON diperbarui, pengunjung website akan langsung melihat perubahannya secara *live* karena sistem menggunakan *Cache-Busting* (`?v=Date.now()`).

---

## 🛠️ Step-by-Step Proses Pengerjaan (Development Log)

Proyek ini dikembangkan melalui iterasi dan penyempurnaan intensif:

1. **Tahap 1: Fondasi & Arsitektur Tema**
   - Merancang kerangka dasar HTML (*Single Page Layout*) menggunakan Tailwind CSS via CDN.
   - Menginisialisasi sistem CSS Variables dinamis yang memungkinkan pergantian 8 tema warna secara instan.

2. **Tahap 2: Integrasi CMS Berbasis JSON**
   - Memisahkan seluruh konten statis dari HTML ke dalam file `data.json` dan `images.json`.
   - Membuat *pipeline Fetch API* asinkronus untuk membaca dan menyuntikkan data ke DOM saat halaman dimuat.

3. **Tahap 3: Interaktivitas Visual & Efek Premium**
   - Mengimplementasikan *Particle Canvas* dinamis di latar belakang.
   - Menambahkan efek *Custom Cursor* dengan riak air (*ripple*) saat diklik.
   - Memberikan efek *3D Tilt* pada kartu proyek (Glassmorphism) berdasarkan perhitungan kordinat *mouse*.

4. **Tahap 4: Merakit Opening Cinematic Loader**
   - Membangun *loader* pembuka yang menampilkan kutipan filosofis.
   - Melakukan perombakan latar belakang *loader* menjadi transparan agar menyatu secara *seamless* dengan kanvas utama, guna mengeliminasi *lag* dan memperhalus transisi (efek gunung siluet & matahari).

5. **Tahap 5: Responsivitas & Detail Kosmetik**
   - Memperbaiki tata letak (layout) opsi tema pada perangkat *mobile* dengan mengimplementasikan pembungkus (*flex-wrap*) dan *scroll* vertikal.
   - Memperhalus efek mesin tik (Typewriter) dengan mengganti kursor menjadi garis vertikal `|` yang berkedip tajam (*sharp blink*).

6. **Tahap 6: Optimasi Kinerja & Debugging Menyeluruh**
   - Menonaktifkan fitur kursor kustom pada layar sentuh (*mobile/tablet*) untuk menghemat memori.
   - Membersihkan *syntax error*, menstabilkan sistem *garbage collection* (penghapusan elemen riak setelah selesai), dan memastikan tingkat *bug* berada di 0%.

---

*Dibuat khusus untuk Muhammad Fachrurrozy - 2026*