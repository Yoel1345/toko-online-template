# Toko Online Template

Template toko online satu halaman untuk produk kerajinan, dengan katalog, keranjang belanja, dan checkout lewat WhatsApp. Dibuat dengan HTML, CSS, dan JavaScript murni, tanpa framework dan tanpa proses build.

> **Catatan:** "Tenun Nusa" beserta produk, harga, testimoni, jumlah pelanggan, dan kontaknya adalah **data fiktif** untuk contoh tampilan. Ganti dengan data toko sebenarnya sebelum dipakai.

## Tampilan

<!-- Tambahkan screenshot setelah diunggah, contoh:
![Halaman toko](docs/screenshot-home.png)
-->

## Fitur

- **Katalog produk** dengan pencarian, filter kategori (Kain tenun, Aksesori, Tas, Dekorasi), dan urutan harga
- **Detail produk** yang terbuka dalam jendela dialog
- **Keranjang belanja** berbentuk panel samping dengan subtotal
- **Checkout via WhatsApp**: nama dan alamat pembeli, catatan, serta kode promo disusun menjadi pesan siap kirim
- Banner pengumuman, strip promo, bagian keunggulan, cerita brand, testimoni, dan FAQ
- Form newsletter di footer
- Responsif, dengan menu navigasi untuk layar kecil
- Aksesibilitas dasar: tautan "Lewati ke konten utama", label ARIA, dan teks pengumuman untuk pembaca layar
- Tag SEO dan Open Graph

## Struktur folder

```
toko-online-template/
├── index.html
├── assets/
│   ├── css/style.css      Semua gaya tampilan
│   ├── js/products.js     Data produk
│   ├── js/main.js         Katalog, keranjang, checkout WhatsApp, interaksi
│   └── img/               Ilustrasi SVG dan gambar og-image
├── .gitignore
└── README.md
```

## Cara menjalankan

Buka `index.html` langsung di browser, atau jalankan server lokal:

```
python -m http.server 8000
```

Lalu buka http://localhost:8000

Koneksi internet dibutuhkan untuk memuat font dari Google Fonts (Fraunces dan Inter).

## Cara menyesuaikan

Cari komentar `GANTI` di `index.html`. Komentar itu menandai bagian yang harus diisi dengan data sebenarnya:

- **Brand dan SEO**: nama toko, judul, deskripsi, `canonical`, `og:url`, dan `og:image`
- **Angka dan klaim**: jumlah pelanggan, nilai ulasan, persentase karya perajin, dan masa garansi
- **Promo**: teks promo dan kode (contoh: `NUSABARU`). Potongan harga dikonfirmasi manual lewat WhatsApp
- **Testimoni**: pakai ulasan pelanggan asli yang sudah memberi izin
- **Media sosial, email, dan jam operasional** di footer

### Produk

Daftar produk ada di `assets/js/products.js`. Tambah, ubah, atau hapus item di sana. Gambar produk disimpan di `assets/img/`.

### Nomor WhatsApp

Ubah nomor tujuan pesanan di `assets/js/main.js` (cari bagian yang membuat tautan WhatsApp). Gunakan format internasional tanpa tanda plus, contoh `6281234567890`.

## Batasan

Template ini murni tampilan di sisi browser. Tidak ada database, akun pelanggan, atau pembayaran online. Pesanan dikirim sebagai pesan WhatsApp dan dikonfirmasi manual oleh penjual.

## Deploy gratis

**GitHub Pages**
1. Buka Settings pada repo ini, lalu pilih Pages.
2. Pada Source, pilih branch `main` dan folder `/ (root)`, lalu Save.
3. Situs online di `https://USERNAME.github.io/toko-online-template/`.

**Netlify**: seret folder proyek ke https://app.netlify.com/drop

## Teknologi

HTML5 · CSS3 · JavaScript (ES6)

## Lisensi

Belum ditentukan. Tambahkan file `LICENSE` bila template ini ingin dibagikan untuk dipakai orang lain.
