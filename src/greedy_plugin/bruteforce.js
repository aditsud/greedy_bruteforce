import { cloneObject, countTheVogelCost, getSquare } from "./utils";


export async function calcBruteForce(matriks_cost, matriks_vogels){
  // menggunakan Promise agar dapat berjalan secara asynchronous pada tampilan web nya
  return new Promise(async (resolve) => {
    matriks_cost = cloneObject(matriks_cost);
    matriks_vogels = cloneObject(matriks_vogels);

    // Cari Square Pants dan L Pants
    // Square dan L Pants yang ditemukan dimasukkan ke dalam array square_list
    let square_list = [];
    for(let i=0; i<matriks_vogels.length; i++){
      for(let j=0; j<matriks_vogels[i].length; j++){
        if(matriks_vogels[i][j]!==0){
          // getSquare adalah fungsi rekursif untuk menemukan pola Square dan L
          getSquare(matriks_vogels, i, j, 'awal', square_list);
        }
      }
    }

    // setelah daftar square dan L didapat, hitung perbedaan costnya jika pada titik yang kosong diberi plus satu
    for(let i=0; i<square_list.length; i++){
      // catatan: posisi angka 0 selalu ada di paling belakang array square
      square_list[i].diff_cost_temp = 0;  // perbedaan cost disimpan pada key diff_cost_temp
      let minPlus = 1; // untuk positif dan negatif
      for(let j=square_list[i].square.length - 1; j>=0; j--){ // hitung mundur dari yang 0
        square_list[i].diff_cost_temp = square_list[i].diff_cost_temp + (minPlus * matriks_cost[square_list[i].square[j].x][square_list[i].square[j].y]);
        minPlus = minPlus * -1;
      }
    }
    
    // setelah dihitung perbedaan cost untuk setiap square dan L yang didapatkan,
    // sekarang array square_list diurutkan ascending berdasarkan key diff_cost_temp
    // setelah itu dilihat apakah array square pada urutan pertama memiliki perbedaan cost yang negatif atau tidak
    // jika negatif, maka itu adalah cikal bakal cost yang lebih optimum daripada yang sebelumnya
    if(square_list.length > 0){
      square_list.sort(function(a, b) { return a.diff_cost_temp - b.diff_cost_temp ; }); // urutkan array_list berdasarkan diff_cost_temp asc
      if(square_list[0].diff_cost_temp < 0){ // ditemukan pola square yang memiliki cikal bakal cost yg lebih optimum
        
        let optimum_square = square_list[0].square; // pola square atau L disimpan di variabel ini

        // step 3: change the previous vogels with new quantity position
        // check the neighbor of the zero where node that have the biggest quantity

        // dalam rangka menerapkan perubahan square ke existing matriks vogel,
        // maka kita cek terlebih dahulu nilai cell vogels pada titik pertama square dan pada titik yang ada pada sebelum titik 0
        // cari yang terkecil antara dua titik yang diperiksa teresebut (sebut saja diff_quant_value), 
        // karena diff_quant_value akan digunakan untuk merubah isi cell pada matriks vogel yang termasuk pada pola optimum_square dengan cara
        // menambahkan atau mengurangkan nilai cell sebelumnya dengan diff_quant_value
        let neighbor_idx0 = matriks_vogels[ optimum_square[0].x][ optimum_square[0].y];
        let neighbor_idxLenMin1 = matriks_vogels[ optimum_square[optimum_square.length - 2].x][ optimum_square[optimum_square.length - 2].y];
        let diff_quant_value = neighbor_idx0 < neighbor_idxLenMin1 ? neighbor_idx0 : neighbor_idxLenMin1;

        // update nilai cell vogel yang bersesuaian dengan pola optimum_square
        let minPlus = 1; // untuk positif dan negatif
        // let new_optimum_cost = 0;
        for(let j=optimum_square.length - 1; j>=0; j--){ // hitung mundur dari yang 0
          matriks_vogels[optimum_square[j].x][optimum_square[j].y] = matriks_vogels[optimum_square[j].x][optimum_square[j].y] + diff_quant_value*minPlus;
          minPlus = minPlus * -1;
        }

        // setelah matriks vogels berhasil diperbarui, sekarang kita hitung lagi nilai optimum cost yang terbaru
        let new_optimum_cost = countTheVogelCost(matriks_cost, matriks_vogels);

        // validasi cost optimumnya dengan cara stepping stone lagi
        // save all value for display in html
        resolve({
          status: 'success',
          value: {
            square_list: square_list,
            diff_cost_temp: square_list[0].diff_cost_temp,
            new_vogels: matriks_vogels,
            new_cost: new_optimum_cost
          }
        });

      }

      // jika tidak ada yang optimum, tetap dikembalikan hasilnya untuk ditampilkan hasil square dan L nya
      // untuk memvalidadsi bahwa hasil perhitungan yg sebelumnya (entah bruteforce atau vogel) masih yang terbaik
      // ini dikembalikan hanya untuk memperlihatkan pola L dan Square yang ditemukan tidak memberikan different cost value yang minus
      resolve({
        status: 'success',
        value: {
          square_list: square_list,
          diff_cost_temp: square_list[0].diff_cost_temp,
          new_vogels: matriks_vogels,
          new_cost: countTheVogelCost(matriks_cost, matriks_vogels)
        }
      });
      
    }
    
    resolve(false)


  });
  


}