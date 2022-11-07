# _Optimum Transportation Cost dengan Vogels Approximation dan Bruteforce_
Untuk Tugas Besar Matematika Lanjut

#### Kelompok Olaf
- Aditya Sudyana (23222063)
- Atikasari (23222049)
- Ananda Sadam Firdaus (23222040)
- Lukman Eka Arifandhi (23222075)
- Naufal Fahmi Zakiuddin (23222070)

#### Daftar Isi
- [Demo](#demo)
- [Tools yang Dipakai](#tools-yang-dipakai)
- [Lokasi Kodingan Inti](#lokasi-kodingan-inti)
- [Sedikit Informasi Tentang Web Frontendnya](#sedikit-informasi-tentang-web-frontendnya)
- [Dokumen Flowchart](#dokumen-flowchart)
- [Kompleksitas Algoritma](#kompleksitas-algoritma)
- [Pedoman Penggunaan Aplikasi](#pedoman-penggunaan-aplikasi)
- [Screenshot Aplikasi](#screenshot-aplikasi)
  * [Beranda](#beranda)
  * [Vogels Approximation](#vogels-approximation)
  * [Brute Force (Stepping Stone)](#brute-force--stepping-stone-)
- [Cara Instalasi di Localhost](#cara-instalasi-di-localhost)
- [Keunggulan Aplikasi Ini](#keunggulan-aplikasi-ini)
- [Kelemahan Aplikasi Ini](#kelemahan-aplikasi-ini)
- [Semoga Bermanfaat](#semoga-bermanfaat)


#### Demo
https://greedy-olaf.herokuapp.com/

#### Tools yang Dipakai
- Kondingan inti pada perhitungan vogels dan bruteforce menggunakan Javascript 
- Selebihnya kami menggunakan VueJS Framework hanya untuk tampilan frontend saja

#### Lokasi Kodingan Inti
- Seluruh Kodingan yang kami tulis berada di folder ```src/greedy_plugin```
- Kodingan untuk perhitungan vogels berada di file  ```src/greedy_plugin/greedy.js```
- Kodingan untuk perhitungan bruteforce berada di file  ```src/greedy_plugin/bruteforce.js```
- Kodingan UTAMA yang digunakan untuk menjalankan vogels dan bruteforce secara bersamaan ada di file ```src/greedy_plugin/main.js```
- file  ```src/greedy_plugin/utils.js``` merupakan kodingan yang berisi seluruh fungsi-fungsi untuk menjalankan greedy dan bruteforce, sengaja dipisah menjadi satu file agar pada file ```greedy.js``` dan  ```bruteforce.js``` dapat menampilkan dengan lebih jelas step-step algoritmanya
- file  ```src/greedy_plugin/createLine.js``` hanya untuk menampilkan pola Square dan L pada hasil result di aplikasi webnya
- file  ```src/greedy_plugin/quicksort.js``` berisi algoritma pengurutan yang kami pakai untuk penyelesaian greedy dan bruteforce
- Selebihnya, kami sudah menuliskan comment secara lengkap di file masing-masing pada setiap function yang ada sehingga harapannya mudah untuk diikuti dan ditelusuri

#### Sedikit Informasi Tentang Web Frontendnya
- File untuk menampilkan halaman Beranda: ```src/components/Matriks.vue```
- File untuk menampilkan dialog Result: ```src/components/Result.vue```
- Kodingan yang dieksekusi saat menekan tombol **Hitung Biaya Transportasi** berada di file ```src/components/Matriks.vue``` dengan isi function seperti berikut: 
```javascript
// memunculkan loading indicator
isLoading.value = true;

// menghitung optimum cost yang berasal dari function hitungOptimumCost dari file src/greedy_plugin/main.js
let result = await hitungOptimumCost(cloneObject(matriks.value));
if(result.status === 'error'){
  toast(result.value);
  isLoading.value = false;
}

// hasil perhitungan dimasukkan ke dalam variabel hasil_vogels_approximation dan hasil_bruteforce untuk ditransfer ke halaman dialog Result.vue untuk ditampilkan pada web
hasil_vogels_approximation.value = {
  matriks_original: result.value.original_matriks,
  matriks_vogel: result.value.vogels_result.matriks_vogels,
  vogel_cost: result.value.vogels_result.cost_vogels
};
hasil_bruteforce.value = result.value.bruteforce_result;

// memunculkan dialog result
dialog.value = true;
```

#### Dokumen Flowchart
_Segera Menyusul_

#### Kompleksitas Algoritma
_Segera Menyusul_

#### Pedoman Penggunaan Aplikasi
https://github.com/aditsud/greedy_bruteforce/raw/main/public/panduan.pdf

#### Screenshot Aplikasi

##### Beranda
![Home](https://github.com/aditsud/greedy_bruteforce/raw/main/screenshot/home.png)

##### Vogels Approximation
![Result1](https://github.com/aditsud/greedy_bruteforce/raw/main/screenshot/result1.png)

##### Brute Force (Stepping Stone)
![Result2](https://github.com/aditsud/greedy_bruteforce/raw/main/screenshot/result2.png)

#### Cara Instalasi di Localhost
Jika ingin menggunakan aplikasi web ini secara online, Anda dapat membukanya di https://greedy-olaf.herokuapp.com/. Akan tetapi jika ingin dipasang pada localhost komputer Anda, berikut adalah langkah-langkahnya:
1. Install NodeJS pada komputer Anda (https://nodejs.org/en/)
2. Clone Repository Github ini ke komputer Anda
3. Buka Command Prmpot/Terminal pada folder tempat repo ini Anda clone, kemudian jalankan ```npm install```
4. Setelah itu, jalankan ```npm run dev``` untuk menjalankan secara lokal


#### Keunggulan Aplikasi Ini
Pengguna bisa memasukkan **_matriks cost, supply,_ dan _demand_** dengan sesuka hati dengan berapapun **jumlah baris** dan **jumlah kolom**nya yang diinginkan. Namun, perlu diingat bahwa semakin banyak baris dan kolom, akan membutuhkan kinerja yang maksimal dari perangkat dan browser Anda.

#### Kelemahan Aplikasi Ini
Karena ini adalah aplikasi berbasis web (javascript), kinerja dari aplikasi ini akan sangat bergantung pada spesifikasi dari perangkat pengguna (laptop/PC/smartphone/dll) dan juga browsernya karena javascript berjalan di atas browser.

#### Semoga Bermanfaat


