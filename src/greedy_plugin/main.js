import { calcBruteForce } from './bruteforce.js';
import { calcVogelsApproximation } from './greedy.js';
import { clasifyMatriks } from './utils.js';


// ini adalah fungsi untuk menjalankan perhitungan cost minimum dengan vogels approximation dan stepping stone
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

  // step 1: pecah matriks menjadi matriks cost, supply, dan demand
  let {cost_matriks, demand_matriks, supply_matriks} = clasifyMatriks(matriks);

  // step 2: melakukan perhitungan matriks vogels dan cost optimumnya
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
  while(result_bruteforce !== false && result_bruteforce.value.new_cost < current_optimum_cost){
    proses_bruteforce.push(result_bruteforce.value);
    current_optimum_cost = result_bruteforce.value.new_cost;
    result_bruteforce = await calcBruteForce(cost_matriks, result_vogel.value.matriks_vogels);
    if(result_bruteforce.status==='error'){
      return {
        status: 'error',
        value: result_bruteforce.value
      }
    }
  }
  if(result_bruteforce !== false){
    proses_bruteforce.push(result_bruteforce.value);
  }

  return {
    status: 'success',
    value: {
      original_matriks: matriks,
      vogels_result: result_vogel.value,
      bruteforce_result: proses_bruteforce
    }
  }
}