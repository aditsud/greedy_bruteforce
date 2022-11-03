import { calcBruteForce } from './bruteforce.js';
import { calcVogelsApproximation } from './greedy.js';
import { clasifyMatriks, cloneObject } from './utils.js';


// ini adalah FUNGSI UTAMA PADA APLIKASI INI untuk menjalankan perhitungan cost minimum dengan vogels approximation dan stepping stone
// parameter matriks mxn adalah matriks input yang berasal dari input web dan yang merupakan gabungan dari matriks cost, demand, dan supply
// contoh:
// matriks 
// [[2,4,3,5,10]]
// [[1,2,4,2,5]]
// [[2,3,5,4,6]]
// [[4,5,3,9,21]]
// ini dapat dipecah menjadi:
//  - matriks cost:
//    [[2,4,3,5]]
//    [[1,2,3,2]]
//    [[2,3,5,4]]
//  - supply: [10,5,6]
//  - demand: [4,5,3,9]
export default async function (matriks){

  // pecah matriks menjadi matriks cost, supply, dan demand
  let {cost_matriks, demand_matriks, supply_matriks} = clasifyMatriks(matriks);

  // melakukan perhitungan matriks vogels dan cost optimumnya
  // langkah detail dapat dilihat pada file greedy.js di dalam function calcVogelsApproximation()
  let result_vogel = await calcVogelsApproximation(cost_matriks, demand_matriks, supply_matriks);
  if(result_vogel.status==='error'){
    return {
      status: 'error',
      value: result_vogel.value
    }
  }

  // melakukan stepping stone untuk mencari kemungkinan cost yang lebih optimum
  // langkah detail dapat dilihat pada file bruteforece.js di dalam function calcBruteForce
  let proses_bruteforce = [];
  let result_bruteforce = await calcBruteForce(cost_matriks, result_vogel.value.matriks_vogels);
  if(result_bruteforce.status==='error'){
    return {
      status: 'error',
      value: result_bruteforce.value
    }
  }
  // cek apakah hasil bruteforce yang pertama lebih optimum dari hasil yang dari vogels
  // jika iya, maka masuk ke while dan lakukan bruteforce lagi
  // lalu nanti dibandingkan lagi hasil costnya, jika masih lebih kecil, diulangi terus sampai tidak ditemukan lagi cost yg lebih kecil
  let current_optimum_cost = result_vogel.value.cost_vogels;
  let matriks_vogels = result_vogel.value.vogels;
  if(result_bruteforce.value) proses_bruteforce.push(result_bruteforce.value);
  while(result_bruteforce !== false && result_bruteforce.value.new_cost < current_optimum_cost){
    
    current_optimum_cost = result_bruteforce.value.new_cost;
    matriks_vogels = result_bruteforce.value.new_vogels;
    result_bruteforce = await calcBruteForce(cost_matriks, matriks_vogels);
    if(result_bruteforce.status==='error'){
      return {
        status: 'error',
        value: result_bruteforce.value
      }
    }
    if(result_bruteforce.value) proses_bruteforce.push(result_bruteforce.value);
  }

  // Ini adalah hasil cost terakhir yang sudah paling minimal
  let final_optimum_cost = result_vogel.value.cost_vogels;
  if(proses_bruteforce.length > 0){
    final_optimum_cost = proses_bruteforce[proses_bruteforce.length - 1].new_cost;
  }

  // return value
  return {
    status: 'success',
    value: {
      original_matriks: matriks, // matriks awal dari parameter input, masih tergabung dengan supply dan demand
      cost_matriks: cost_matriks, // matriks cost
      vogels_result: result_vogel.value, // object yang berisi hasil perhitungan cost dari vogels dan matriks vogels yang cell-cellnya berisi pemetaan dari supply dan demand
      bruteforce_result: proses_bruteforce, // array yang berisi seluruh tahapan stepping stone
      final_optimum_cost: final_optimum_cost // integer yang menyatakan hasil terakhir cost yang paling rendah yang ditemukan
    }
  }
}