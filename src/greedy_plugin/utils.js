// function untuk melakukan sorting menggunakan quick sort
// kodingan dapat dilihat pada file quicksort.js
import { sort } from './quicksort';

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// fungsi untuk melakukan clone/copy object agar tidak merefer ke variabel sebelumnya
export function cloneObject(obj){
  return JSON.parse(JSON.stringify(obj))
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// fungsi untuk memecah matriks mxn yang berasal dari input web menjadi 3 matriks: matriks cost, matriks supply, dan matriks demand
// karena matriks yang berasal dari input web sudah gabung menjadi 1 dengan cost, demand, dan supplynya
export function clasifyMatriks(matriks){ 
  let rows = matriks.length;
  let columns = matriks[0].length;
  let cost_matriks = [];
  let demand_matriks = [];
  let supply_matriks = [];
  for(let i=0; i<rows; i++){
    
    let col = [];
    for(let j=0; j<columns; j++){
      if(i<rows-1){
        if(j<columns-1){
          col.push(matriks[i][j])
        }else{
          supply_matriks.push(matriks[i][j])
        }
      }else if(j<columns-1){
        demand_matriks.push(matriks[i][j])
      }
    }
    if(i<rows-1){
      cost_matriks.push(col)
    }
    
  }

  return { cost_matriks, demand_matriks, supply_matriks }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// fungsi untuk menghitung penalty dari setiap baris dan kolom pada matriks_cost
export function determinePenalty(matriks, forbidden_row, forbidden_col){
  let demand_penalty = [];
  let supply_penalty = [];
  let original_matriks = cloneObject(matriks);
  let isAllPenaltySame = false;

  // sebelum memulai perhitungan penalty, terlebih dahulu cek baris dan kolom terlarang
  // jika ada baris atau kolom terlarang, maka cell-cellnya dijadikan 0 dahulu
  for(let i=0; i< original_matriks.length; i++){
    for(let j=0; j< original_matriks[i].length; j++){
      if(forbidden_row.indexOf(i)!==-1 || forbidden_col.indexOf(j)!==-1){
        original_matriks[i][j] = 0;
      }
    }
  }

  // bagian ini mencari penalty pada baris matriks
  let matriks_cost_1 = cloneObject(original_matriks);
  for(let i=0; i<matriks_cost_1.length; i++){
    sort(matriks_cost_1[i]);
    // cost yang bernilai 0 tidak masuk hitungan
    let idx_adjustment = 0;
    while(idx_adjustment <= matriks_cost_1[i].length - 2 && matriks_cost_1[i][idx_adjustment] <= 0){
      idx_adjustment++;
    }
    if(idx_adjustment === matriks_cost_1[i].length - 1){
      supply_penalty.push(0);
    }else{
      supply_penalty.push(Math.abs(matriks_cost_1[i][idx_adjustment] - matriks_cost_1[i][1 + idx_adjustment]));
    }
    
  }

  // bagian ini mencari penalty pada kolom matriks
  let matriks_cost_transpose = original_matriks[0].map((_, colIndex) => original_matriks.map(row => row[colIndex]));
  for(let i=0; i<matriks_cost_transpose.length; i++){
    sort(matriks_cost_transpose[i]);
    // cost yang bernilai 0 tidak masuk hitungan
    let idx_adjustment = 0;
    while(idx_adjustment <= matriks_cost_transpose[i].length - 2 && matriks_cost_transpose[i][idx_adjustment] <= 0){
      idx_adjustment++;
    }
    if(idx_adjustment === matriks_cost_transpose[i].length - 1){
      demand_penalty.push(0);
    }else{
      demand_penalty.push(Math.abs(matriks_cost_transpose[i][idx_adjustment] - matriks_cost_transpose[i][1 + idx_adjustment]));
    }
    
  }

  // seluruh angka penalty baris dan kolom disatukan
  let join_penalty = supply_penalty.concat(demand_penalty);

  // check apakah seluruh penalty bernilai sama atau tidak
  if(join_penalty.every(val => val === join_penalty[0])){
    isAllPenaltySame = true; // kasih flag
  }

  sort(join_penalty);
  let max_penalty = join_penalty[join_penalty.length - 1];

  return { supply_penalty, demand_penalty, max_penalty, isAllPenaltySame };
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// fungsi untuk menentukan area baris dan kolom mana saja yang termasuk memiliki penalty terbesar
export function getAreaOfInterest(d_m, s_m, supply_penalty, demand_penalty, max_penalty, isAllPenaltySame){
  // jika semua nilai penalty sama, maka cari demand atau supply yang paling besar
  // kemudian jadikan row atau column tersebut menjadi area of interest
  if(isAllPenaltySame){
    let allPossibleDemandSupply = [];
    for(let i=0; i<d_m.length; i++){
      allPossibleDemandSupply.push(d_m[i]);
    }
    for(let i=0; i<s_m.length; i++){
      allPossibleDemandSupply.push(s_m[i]);
    }
    sort(allPossibleDemandSupply);
    let maxDemandSupply = allPossibleDemandSupply[allPossibleDemandSupply.length - 1];

    let rowAoI = s_m.reduce(function(a, e, i) {
      if (e === maxDemandSupply)
        a.push(i);
      return a;
    }, []);
    let columnAoI = d_m.reduce(function(a, e, i) {
      if (e === maxDemandSupply)
        a.push(i);
      return a;
    }, []);

    // return value: jika baris 2, baris 3, dan kolom 1 adalah area of interest, maka rowAoI = [2,3], columnAoI = [1]
    return { rowAoI, columnAoI }
  }

  // di bawah ini jika isAllPenaltySame bernilai false
  let rowAoI = supply_penalty.reduce(function(a, e, i) {
    if (e === max_penalty)
      a.push(i);
    return a;
  }, []);
  let columnAoI = demand_penalty.reduce(function(a, e, i) {
    if (e === max_penalty)
      a.push(i);
    return a;
  }, []);
  // return value: jika baris 2, baris 3, dan kolom 1 adalah area of interest, maka rowAoI = [2,3], columnAoI = [1]
  return { rowAoI, columnAoI }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// fungsi untuk menentukan cost terkecil dari area of interest beserta index posisi baris dan kolomnya
export function findFirstLowCost(cost_matriks, rowAoI, columnAoI, forbidden_row, forbidden_col){
  let allPossibleCostAoI = [];
  for(let i=0; i<cost_matriks.length; i++){
    for(let j=0; j<cost_matriks[i].length; j++){
      if((rowAoI.indexOf(i) !== -1 || columnAoI.indexOf(j) !== -1) && !(forbidden_row.indexOf(i) !== -1 || forbidden_col.indexOf(j) !== -1)){
        allPossibleCostAoI.push(cost_matriks[i][j])
      }
    }
  }
  sort(allPossibleCostAoI);
  let minimumCost = allPossibleCostAoI[0];
  let idx_row = -1; // untuk menyimpan indeks baris dari cost terkecil
  let idx_col = -1; // untuk menyimpan indeks kolom dari cost terkecil
  for(let i=0; i<cost_matriks.length; i++){
    let endLoop = false;
    for(let j=0; j<cost_matriks[i].length; j++){
      if((rowAoI.indexOf(i) !== -1 || columnAoI.indexOf(j) !== -1) && !(forbidden_row.indexOf(i) !== -1 || forbidden_col.indexOf(j) !== -1)){
        
        if(cost_matriks[i][j]==minimumCost){
          idx_row = i;
          idx_col = j;
          endLoop = true;
          break;
        }
      }
    }
    if(endLoop) break;
  }

  return { minimumCost, idx_row, idx_col };
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// fungsi untuk menentukan supply/demand yang satisfied dengan nilai theLowCost
export function satisfyTheSupplyAndDemand(c_m, vogels, d_m, s_m, theLowCost, forbidden_row, forbidden_col){
  // cek antara supply dan demand pada posisi index row dan column dari theLowCost. cari yang terkecil sebagai yang satisfied
  let supp = s_m[theLowCost.idx_row];
  let dem = d_m[theLowCost.idx_col];
  if(supp<dem){
    vogels[theLowCost.idx_row][theLowCost.idx_col] = supp;
    s_m[theLowCost.idx_row] = 0;
    d_m[theLowCost.idx_col] = d_m[theLowCost.idx_col] - supp;
    forbidden_row.push(theLowCost.idx_row);
  }else if(supp>dem){
    vogels[theLowCost.idx_row][theLowCost.idx_col] = dem;
    d_m[theLowCost.idx_col] = 0;
    s_m[theLowCost.idx_row] = s_m[theLowCost.idx_row] - dem;
    forbidden_col.push(theLowCost.idx_col);
  }else{
    // jika masuk ke sini, artinya supply dan demand sama
    vogels[theLowCost.idx_row][theLowCost.idx_col] = dem; // or supp
    d_m[theLowCost.idx_col] = 0;
    s_m[theLowCost.idx_row] = 0;
    forbidden_row.push(theLowCost.idx_row);
    forbidden_col.push(theLowCost.idx_col);
  }

}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// fungsi untuk mengecek apakah ada sisa baris dan kolom pada matriks_cost yang tidak forbidden tapi hanya tersisa tersisa 1 baris atau 1 kolom
export function checkRowColLeft(vogels, d_m, s_m, theLowCost, forbidden_row, forbidden_col){
  let countZeroDM = 0;
  for(let i=0; i<d_m.length; i++){
    if(d_m[i] === 0) countZeroDM++;
  }
  if(countZeroDM >= d_m.length - 1){
    for(let j=0; j<s_m.length; j++){
      if(s_m[j]===0) continue;
      vogels[j][theLowCost.idx_col] = s_m[j];
      s_m[j] = 0;
      forbidden_row.push(j);
    }
    d_m[theLowCost.idx_col] = 0;
    forbidden_col.push(theLowCost.idx_col);
    return true;
  }

  let countZeroSM = 0;
  for(let i=0; i<s_m.length; i++){
    if(s_m[i] === 0) countZeroSM++;
  }
  if(countZeroSM >= s_m.length - 1){
    for(let j=0; j<d_m.length; j++){
      if(d_m[j]===0) continue;
      vogels[theLowCost.idx_row][j] = d_m[j];
      d_m[j] = 0;
      forbidden_col.push(j);
    }
    s_m[theLowCost.idx_row] = 0;
    forbidden_row.push(theLowCost.idx_row);
    return true;
  }

  return false;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// fungsi untuk menghitung cost dari matriks vogels
export function countTheVogelCost(c_m, vogels){
  let cost = 0;
  for(let i=0; i<vogels.length; i++){
    for(let j=0; j<vogels[i].length; j++){
      if(vogels[i][j]===0) continue;
      cost = cost + vogels[i][j]*c_m[i][j];
    }
  }
  return cost;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// fungsi rekursif untuk mencari pola Square dan pola L
// parameter square adalah array untuk menyimpan titik-titik yang diketemui
export function getSquare(matriks_vogels, x, y, posisi, square_list, square = []){
  square = cloneObject(square);

  square.push({ x: x, y: y, value: matriks_vogels[x][y], posisi });
  if(square[square.length - 1].posisi === 'akhir'){ // pertanda jika ketemu Square atau L karena titik terakhirnya sudah diberi flag 'Akhir'
    let pk = cloneObject(square);
    pk.sort(function(a, b) { return a.x - b.x || (a.y - b.y) ; }); // Array square diurut berdasarkan key X dan key Y secara ascending
    pk.forEach(function(a){ delete a.posisi }); // hapus key posisi karna sudah tidak dibutuhkan lagi
    pk = JSON.stringify(pk);
    // cek array square yang sudah didapat apakah sudah pernah ada di array square list
    // kalau masih belum ada, array square dimasukkan ke dalam array square list
    for(let i=0; i<square_list.length; i++){
      if(square_list[i].pk === pk){
        return;
      }
    }
    square_list.push({
      square: square,
      type: (square.length===4 ? 'square pants': 'L pants'), // kategori polanya apakah square atau L
      pk: pk // primary key untuk nanti digunakan sebagai pengecekkan eksistensi suatu square jika ingin ditambah lagi square yang lain agar tidak double
    });
  }else if(square.length === 1){ // eksekusi pertama kali, karena titiknya baru ada satu
    // cari titik berikutnya di satu baris yang sama dengan titik pertama
    for(let j=0; j<matriks_vogels[x].length; j++){
      if(j === y) continue;
      if(matriks_vogels[x][j] !== 0){
        // kalau ketemu titik kedua, rekursif ke fungsi ini lagi untuk mencari titik ketiga
        getSquare(matriks_vogels, x, j, (j>y ? 'kanan' : 'kiri'), square_list, square);
      }
    }
    // juga cari titik berikutnya di satu kolom yang sama dengan titik pertama
    for(let i=0; i<matriks_vogels.length; i++){
      if(i === x) continue;
      if(matriks_vogels[i][y] !== 0){
        // kalau ketemu titik kedua, rekursif ke fungsi ini lagi untuk mencari titik ketiga
        getSquare(matriks_vogels, i, y, (i>x ? 'bawah' : 'atas'), square_list, square)
      }
    }
    
  }else{
    // masuk ke sini jika titik yang sudah dikumpulkan pada array square sudah lebih dari 1 titik
    // cek titik sebelumnya dari posisi mana
    if(square[square.length - 1].posisi === 'kanan' || square[square.length - 1].posisi === 'kiri'){ // jika titik sebelumnya berasal dari suatu baris
      // sekarang cari titik berikutnya di kolom yang sama dengan titik sebelumnya
      for(let i=0; i<matriks_vogels.length; i++){
        if(i === x) continue;
        if(matriks_vogels[i][y] !== 0){    
          // cek apakah terjadi perpotongan garis (mencegah L yang ditemukan menjadi berpotongan)
          if(square.length > 3 && checkIntersectionVertical(square, i, x, y))
            return; // jika terdeteksi intersection pada saat membuat jalur pola L pants, maka proses pencarian titik berikutnya dihentikan   
          // jika tidak terdeteksi intersection, lanjut cari titik berikutnya 
          getSquare(matriks_vogels, i, y, (i>x ? 'bawah' : 'atas'), square_list, square)
        }
      }
    }else if(square[square.length - 1].posisi === 'atas' || square[square.length - 1].posisi === 'bawah'){ // jika titik sebelumnya berasal dari suatu kolom
      // sekarang cari titik berikutnya di kolom yang sama dengan titik sebelumnya
      for(let j=0; j<matriks_vogels[x].length; j++){
        if(j === y) continue;
        if(matriks_vogels[x][j] !== 0){       
          // cek apakah terjadi perpotongan garis (mencegah L yang ditemukan menjadi berpotongan)   
          if(square.length > 3 && checkIntersectionHorizontal(square, j, x, y))
            return; // jika terdeteksi intersection pada saat membuat jalur pola L pants, maka proses pencarian titik berikutnya dihentikan   
          // jika tidak terdeteksi intersection, lanjut cari titik berikutnya 
          getSquare(matriks_vogels, x, j, (j>y ? 'kanan' : 'kiri'), square_list, square);
        }
      }
    }

    // cek kelengkapan square
    // jika sudah tiga titik ditemukan, untuk dapat menjadi square, kita dapat memprediksi titik keempat berada di mana
    // titik keempat dapat ditemukan dengan menggunakan indeks baris dari titik ketiga dan indeks kolom dari titik pertama (jika titik kedua dan ketiga membentuk garis vertikal)
    // titik keempat dapat ditemukan dengan menggunakan indeks baris dari titik pertama dan indeks kolom dari titik ketiga (jika titik kedua dan ketiga membentuk garis horizontal)
    // kemudian harus dipastikan bahwa cell titik keempat matriks vogel bernilai 0
    if(square.length === 3){
      let p2 = square[1].posisi; // cek posisi titik kedua
      let p3 = square[2].posisi; // cek posisi titik ketiga
      if((p2 === 'kanan' || p2 === 'kiri') && (p3 === 'atas' || p3 === 'bawah') && matriks_vogels[square[2].x][square[0].y] === 0){
        getSquare(matriks_vogels, square[2].x, square[0].y, 'akhir', square_list, square);
      }else if((p2 === 'atas' || p2 === 'bawah') && (p3 === 'kanan' || p3 === 'kiri') && matriks_vogels[square[0].x][square[2].y] === 0){
        getSquare(matriks_vogels, square[0].x, square[2].y, 'akhir', square_list, square);
      }
    }

    // cek kelengkapan L
    // jika sudah lima titik ditemukan, untuk dapat menjadi L, kita dapat memprediksi titik keenam berada dimana
    // titik keenam dapat ditemukan dengan menggunakan indeks baris dari titik keempat dan indeks kolom dari titik pertama (jika titik keempat dan kelima membentuk garis vertikal)
    // titik keenam dapat ditemukan dengan menggunakan indeks baris dari titik pertama dan indeks kolom dari titik keempat (jika titik keempat dan kelima membentuk garis horizontal)
    // kemudian harus dipastikan bahwa cell titik keenam matriks vogel bernilai 0
    // dan satu lagi, harus dipastikan tidak ada perpotongan garis dari titik keenam ke titik pertama
    if(square.length === 5){
      let p4 = square[3].posisi; // cek posisi titik keempat
      let p5 = square[4].posisi; // cek posisi titik kelima

      if((p4 === 'kanan' || p4 === 'kiri') && (p5 === 'atas' || p5 === 'bawah') && matriks_vogels[square[4].x][square[0].y] === 0){
        // check apakah ada intersection pada jalur L
        if(!checkIntersectionHorizontal(square, square[0].y, square[square.length-1].x, square[square.length-1].y)) // pengecekkan titik ke-5 -> ke-6
          if(!checkIntersectionVertical(square, square[0].x, square[4].x, square[0].y)) // pengecekkan titik ke-6 -> ke-1
            getSquare(matriks_vogels, square[4].x, square[0].y, 'akhir', square_list, square);
      }else if((p4 === 'atas' || p4 === 'bawah') && (p5 === 'kanan' || p5 === 'kiri') && matriks_vogels[square[0].x][square[4].y] === 0){
        // check apakah ada intersection pada jalur L
        if(!checkIntersectionVertical(square, square[0].x, square[square.length-1].x, square[square.length-1].y)) // pengecekkan titik ke-5 -> ke-6
          if(!checkIntersectionHorizontal(square, square[0].y, square[0].x, square[4].y)) // pengecekkan titik ke-6 -> ke-1
            getSquare(matriks_vogels, square[0].x, square[4].y, 'akhir', square_list, square);
      }
    }

    // mencegah endless loop
    // dengan cara apabila jumlah titik yang ditemukan sudah lebih dari lima, maka distop saja karena sudah tidak mungkin dapat square dan L
    if(square.length > 5){
      return;
    }

    
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// fungsi untuk mendeteksi perpotongan garis pada saat menemukan pola L
// parameter square adalah array untuk menyimpan titik-titik yang diketemui
export function checkIntersectionVertical(square, i, x, y){
  // cek dahulu apakah ada intersection (untuk mencegah jalur L beririsan)
  let minRow = i;
  let maxRow = x;
  if(i > x){
    minRow = x;
    maxRow = i;
  }
  for(let m=0; m<square.length; m++){
    // mencari dahulu apakah ada titik yang koordinat x nya berada di antara i dan x
    if(square[m].x > minRow && square[m].x < maxRow){
      for(let n=0; n<square.length; n++){
        if(square[n].x === square[m].x){
          let minCol = square[n].y;
          let maxCol = square[m].y;
          if(square[n].y > square[m].y){
            minCol = square[m].y;
            maxCol= square[n].y;
          }
          if(y > minCol && y < maxCol){
            // jika koordinat y yang dituju berada di antara koordinat y dari m dan n, maka terdeteksi berpotongan
            return true;
          }
        }
      }
    }
  }
  // tidak terdeteksi perpotongan
  return false;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// fungsi untuk mendeteksi perpotongan garis pada saat menemukan pola L
// parameter square adalah array untuk menyimpan titik-titik yang diketemui
export function checkIntersectionHorizontal(square, j, x, y){
  // cek dahulu apakah ada intersection (untuk mencegah jalur L beririsan)
  let minCol = j;
  let maxCol = y;
  if(j > y){
    minCol = y;
    maxCol = j;
  }
  for(let m=0; m<square.length; m++){
    // mencari dahulu apakah ada titik yang koordinat y nya berada di antara j dan y
    if(square[m].y > minCol && square[m].y < maxCol){
      for(let n=0; n<square.length; n++){
        if(square[n].y === square[m].y){
          let minRow = square[n].x;
          let maxRow = square[m].x;
          if(square[n].y > square[m].x){
            minRow = square[m].x;
            maxRow= square[n].x;
          }
          if(x > minRow && x < maxRow){
            // jika koordinat x yang dituju berada di antara koordinat x dari m dan n, maka terdeteksi berpotongan
            return true;
          }
        }
      }
    }
  }
  
  // tidak terdeteksi perpotongan
  return false
}