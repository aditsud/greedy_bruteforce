// file utils.js berisi function-function yang dapat membantu proses di sini
// sengaja dipisah ke file utils.js agar pada file ini hanya fokus pada vogels saja
// jika ingin melihat isi function yang dipanggil, dapat melihat langsung ke file utils.js
import { checkRowColLeft, cloneObject, countTheVogelCost, determinePenalty, findFirstLowCost, getAreaOfInterest, satisfyTheSupplyAndDemand } from './utils.js';

export async function calcVogelsApproximation(cost_matriks, demand_matriks, supply_matriks){
  // menggunakan Promise agar dapat berjalan secara asynchronous pada tampilan web nya
  return new Promise((resolve) => {

    // cost matriks dilakukan copy object agar tidak mereferensi ke variabel sebelumnya
    let c_m = cloneObject(cost_matriks);
    let d_m = cloneObject(demand_matriks);
    let s_m = cloneObject(supply_matriks);

    // membuat variabel matriks mxn untuk menampung supply/demand yang cellsnya berisi 0 semua
    let vogels = new Array(cost_matriks.length).fill(0).map(()=>new Array(cost_matriks[0].length).fill(0));

    // membuat array yang menampung baris dan kolom mana saja yang sudah dihapus dari matriks cost
    let forbidden_row = [];
    let forbidden_col = [];

    // selama masih ada baris dan kolom yang belum masuk menjadi forbidden, while akan dieksekusi
    while(forbidden_row.length < d_m.length || forbidden_col.length < s_m.length){
      // menghitung penalty
      let penalty = determinePenalty(c_m, forbidden_row, forbidden_col);
      // jika penalty tidak bisa dihitung, maka perhitungan vogels approximation tidak bisa dihitung
      if(penalty === false){
        resolve({
          status: 'error',
          value: 'Ada kondisi dimana penalty terbesar tidak dapat ditentukan'
        });
      }
      
      // menentukan area baris dan kolom mana saja yang termasuk memiliki penalty terbesar
      let { rowAoI, columnAoI } = getAreaOfInterest(d_m, s_m, penalty.supply_penalty, penalty.demand_penalty, penalty.max_penalty, penalty.isAllPenaltySame);

      // jika rowAoI dan columnAoI bernilai [] (array kosong), maka proses vogel tidak bisa dilanjutkan
      if(rowAoI.length===0 && columnAoI.length===0){
        resolve({
          status: 'error',
          value: 'Ada kondisi dimana tidak ada baris dan kolom yang dapat ditentukan berdasarkan nilai penalty terbesar'
        });
      }

      // menentukan cost terkecil dari area of interest beserta index posisi baris dan kolomnya
      let theLowCost = findFirstLowCost(c_m, rowAoI, columnAoI, forbidden_row, forbidden_col);

      // jika indeks baris dan kolom dari theLowCost bernilai -1 dan -1, maka proses vogel tidak bisa dilanjutkan
      if(theLowCost.idx_row === -1 || theLowCost.idx_col === -1){
        resolve({
          status: 'error',
          value: 'Ada kondisi dimana nilai cost terkecil yang terpilih tidak ditemukan di matriks cost'
        });
      }

      // terlebih dahulu cek apakah sisa baris dan kolom pada matriks_cost yang tidak forbidden sudah ada yang tersisa 1 baris atau 1 kolom
      // kalau kondisi terpenuhi, keluar dari while
      let oneRowOrOneColLeft = checkRowColLeft(vogels, d_m, s_m, theLowCost, forbidden_row, forbidden_col);
      if(oneRowOrOneColLeft) break;

      // menentukan supply/demand yang satisfied dengan nilai theLowCost
      satisfyTheSupplyAndDemand(c_m, vogels, d_m, s_m, theLowCost, forbidden_row, forbidden_col);

      
    }

    // matriks vogels sudah terbentuk, sekarang tinggal menghitung costnya

    let cost_vogels = countTheVogelCost(c_m, vogels);

    
    resolve({
      status: 'success',
      value: {
        matriks_vogels: vogels,
        cost_vogels: cost_vogels
      }
    });
  })
  
}
