import Quicksort from '@softnami/quicksort';

function consoleMatriks(matriks){
  for(let i=0; i<matriks.length; i++){
    let mat = ''
    for(let j=0; j<matriks[i].length; j++){
      mat = mat + ' ' + matriks[i][j] + ' '
    }
    console.log(i  + ': ' + mat)
  }
  console.log('_________')
}

function cloneObject(obj){
  // Objek dilakukan clone agar tidak merefer ke variabel sebelumnya
  return JSON.parse(JSON.stringify(obj))
}

function sortArray(arr){
  let sorter = new Quicksort();
  sorter.sort(arr);
  sorter = null;
  return arr
}

function clasifyMatriks(matriks){ 
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

function determinePenalty(matriks){
  let demand_penalty = [];
  let supply_penalty = [];
  let original_matriks = cloneObject(matriks);

  let original_matriks2 = cloneObject(matriks);
  for(let i=0; i<original_matriks2.length; i++){
    sortArray(original_matriks2[i]);
    supply_penalty.push(Math.abs(original_matriks2[i][0] - original_matriks2[i][1]));
  }

  let transpose_matriks = original_matriks[0].map((_, colIndex) => original_matriks.map(row => row[colIndex]));
  for(let i=0; i<transpose_matriks.length; i++){
    sortArray(transpose_matriks[i]);
    demand_penalty.push(Math.abs(transpose_matriks[i][0] - transpose_matriks[i][1]));
  }

  let join_penalty = supply_penalty.concat(demand_penalty);
  sortArray(join_penalty);
  let max_penalty = join_penalty[join_penalty.length - 1];

  return { supply_penalty, demand_penalty, max_penalty }
}

function getAreaOfInterest(supply_penalty, demand_penalty, max_penalty){
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
  return { rowAoI, columnAoI }
}

function determineCostQuantity(original_cost_matriks, cost_matriks, demand_matriks, supply_matriks, vogels_matriks, rowAoI, columnAoI, row_forbidden, col_forbidden){
  
  let allPossibleCostAoI = [];
  for(let i=0; i<cost_matriks.length; i++){
    for(let j=0; j<cost_matriks[i].length; j++){
      if(rowAoI.indexOf(i) !== -1 || columnAoI.indexOf(j) !== -1){
        allPossibleCostAoI.push(cost_matriks[i][j])
      }
    }
  }
  sortArray(allPossibleCostAoI)
  let minimumCost = allPossibleCostAoI[0];
  let row_minimumCost = -1;
  let column_minimumCost = -1;
  for(let i=0; i<cost_matriks.length; i++){
    let endLoop = false;
    for(let j=0; j<cost_matriks[i].length; j++){
      if(rowAoI.indexOf(i) !== -1 || columnAoI.indexOf(j) !== -1){
        
        if(cost_matriks[i][j]==minimumCost){
          row_minimumCost = i;
          column_minimumCost = j;
          endLoop = true;
          break;
        }
      }
    }
    if(endLoop) break;
  }
  let new_cost_matriks = cloneObject(cost_matriks);
  if(row_minimumCost !== -1 && column_minimumCost !== -1){
    let supply_minimumCost = supply_matriks[row_minimumCost];
    let demand_minimumCost = demand_matriks[column_minimumCost];
    if(supply_minimumCost < demand_minimumCost && supply_minimumCost !== 0){
      let row_minCost_ori = row_minimumCost;
      let col_minCost_ori = column_minimumCost;
      insertToVogel(original_cost_matriks, cost_matriks, row_minCost_ori, col_minCost_ori,  vogels_matriks, row_minimumCost, column_minimumCost, 'r', supply_minimumCost, row_forbidden, col_forbidden);
      
      supply_matriks.splice(row_minimumCost,1); // remove supply yang sudah habis
      new_cost_matriks.splice(row_minimumCost, 1); // remove row yang sudah habis
      demand_matriks[column_minimumCost] = demand_minimumCost - supply_minimumCost;

      // check jika nilai demand_matriks[column_minimumCost] ternyata sudah 0 juga, maka diremove juga demandnya
      if(demand_matriks[column_minimumCost] === 0){
        demand_matriks.splice(column_minimumCost, 1); // remove demand yang sudah habis
        new_cost_matriks.map(function(val) { return val.splice(column_minimumCost, 1); }); // remove column yang sudah habis
        col_forbidden.push(column_minimumCost);
      }
    }else if(demand_minimumCost !== 0){
      let row_minCost_ori = row_minimumCost;
      let col_minCost_ori = column_minimumCost;
      insertToVogel(original_cost_matriks, cost_matriks, row_minCost_ori, col_minCost_ori,  vogels_matriks, row_minimumCost, column_minimumCost, 'c', demand_minimumCost, row_forbidden, col_forbidden);

      demand_matriks.splice(column_minimumCost, 1); // remove demand yang sudah habis
      new_cost_matriks.map(function(val) { return val.splice(column_minimumCost, 1); }); // remove column yang sudah habis
      supply_matriks[row_minimumCost] = supply_minimumCost - demand_minimumCost;

      // check jika nilai supply_matriks[row_minimumCost] ternyata sudah 0 juga, maka diremove juga supplynya
      if(supply_matriks[row_minimumCost] === 0){
        supply_matriks.splice(row_minimumCost,1); // remove supply yang sudah habis
        new_cost_matriks.splice(row_minimumCost, 1); // remove row yang sudah habis
        row_forbidden.push(row_minimumCost);
      }
    }else{
      // supply or demand sudah 0
    }
  }else{
    // kalau tidak ketemu minimumCost
  }
  return { vogels_matriks, demand_matriks, supply_matriks, new_cost_matriks};
}



function insertToVogel(original_cost_matriks, cost_matriks, row_minCost_ori, col_minCost_ori,  vogels_matriks, row_minimumCost, column_minimumCost, type, val, row_forbidden, col_forbidden){
  
  if(type=='r'){
    let row_key = row_forbidden.indexOf(row_minimumCost);
    let col_key = col_forbidden.indexOf(column_minimumCost);
    if(row_key !== -1)
      return insertToVogel(original_cost_matriks, cost_matriks, row_minCost_ori, col_minCost_ori, vogels_matriks, row_minimumCost + 1, column_minimumCost, type, val, row_forbidden, col_forbidden);
    else if(col_key !== -1)
      return insertToVogel(original_cost_matriks, cost_matriks, row_minCost_ori, col_minCost_ori, vogels_matriks, row_minimumCost, column_minimumCost + 1, type, val, row_forbidden, col_forbidden);
    else{
      // dicek lagi apakah baris cost nya sudah sesuai dengan yang aslinya, jika tidak, insertToVogel lagi dengan baris + 1
      let row_original = [];
      let row_cost = [];
      
      for(let j=0; j<original_cost_matriks[row_minimumCost].length; j++){
        if(col_forbidden.indexOf(j) === -1){
          row_original.push(original_cost_matriks[row_minimumCost][j]);
        }
      }
      for(let j=0; j<cost_matriks[row_minCost_ori].length; j++){
        row_cost.push(cost_matriks[row_minCost_ori][j]);
      }

      
      if(JSON.stringify(row_original) != JSON.stringify(row_cost))
        return insertToVogel(original_cost_matriks, cost_matriks, row_minCost_ori, col_minCost_ori, vogels_matriks, row_minimumCost + 1, column_minimumCost, type, val, row_forbidden, col_forbidden);
      else
        row_forbidden.push(row_minimumCost);
    }
  }else{
    let row_key = row_forbidden.indexOf(row_minimumCost);
    let col_key = col_forbidden.indexOf(column_minimumCost);
    if(col_key !== -1)
      return insertToVogel(original_cost_matriks, cost_matriks, row_minCost_ori, col_minCost_ori, vogels_matriks, row_minimumCost, column_minimumCost + 1, type, val, row_forbidden, col_forbidden);
    else if(row_key !== -1)
      return insertToVogel(original_cost_matriks, cost_matriks, row_minCost_ori, col_minCost_ori, vogels_matriks, row_minimumCost + 1, column_minimumCost, type, val, row_forbidden, col_forbidden);
    else{
      // dicek lagi apakah kolom cost nya sudah sesuai dengan yang aslinya, jika tidak, insertToVogel lagi dengan kolom + 1
      let col_original = [];
      let col_cost = [];
      for(let i=0; i<original_cost_matriks.length; i++){
        if(row_forbidden.indexOf(i)=== -1){
          col_original.push(original_cost_matriks[i][column_minimumCost]);
        }
      }
      for(let i=0; i<cost_matriks.length; i++){
        col_cost.push(cost_matriks[i][col_minCost_ori]);
      }
      if(JSON.stringify(col_original) != JSON.stringify(col_cost))
        return insertToVogel(original_cost_matriks, cost_matriks, row_minCost_ori, col_minCost_ori, vogels_matriks, row_minimumCost, column_minimumCost + 1, type, val, row_forbidden, col_forbidden);
      else
        col_forbidden.push(column_minimumCost);
    }
      
  }
  vogels_matriks.push({r: row_minimumCost, c: column_minimumCost, val: val});

}

function checkIfMatriks2x1or2x1(matriks){
  if(matriks.length <= 1) return true;
  if(matriks[0].length == 1) return true;
  return false;
}

function countTheCost(matriks_original, matriks_vogels){
  let vogel_cost = 0;
  for(let i=0; i<matriks_vogels.length; i++){
    for(let j=0; j<matriks_vogels[i].length; j++){
      vogel_cost = vogel_cost + matriks_original[i][j] * matriks_vogels[i][j];
    }
  }
  return vogel_cost
}


export function calcVogelsApproximation(matriks){
  let { cost_matriks, demand_matriks, supply_matriks } = clasifyMatriks(matriks);
  let original_cost_matriks = cloneObject(cost_matriks);
  let vogels_matriks = [] 
  let row_forbidden = [];
  let col_forbidden = [];
  // do the vogels approximations
  while(!checkIfMatriks2x1or2x1(cost_matriks)){
    let { supply_penalty, demand_penalty, max_penalty } = determinePenalty(cost_matriks);
    let { rowAoI, columnAoI } = getAreaOfInterest(supply_penalty, demand_penalty, max_penalty)
    let result = determineCostQuantity(original_cost_matriks, cost_matriks, demand_matriks, supply_matriks, vogels_matriks, rowAoI, columnAoI, row_forbidden, col_forbidden)
    vogels_matriks = result.vogels_matriks;
    demand_matriks = result.demand_matriks;
    supply_matriks = result.supply_matriks;
    cost_matriks = result.new_cost_matriks;
  }
  // do the rest of vogel with remaining cost matrix 2x1 or 1x2
  // get the remaining cost
  let restCost = supply_matriks.length > demand_matriks.length ? supply_matriks : demand_matriks;
  // get the available indexes
  for(let i=0; i<original_cost_matriks.length; i++){
    if(row_forbidden.indexOf(i)===-1){
      for(let j=0; j<original_cost_matriks[i].length; j++){
        if(col_forbidden.indexOf(j)===-1){
          // insert to vogel matriks\
          vogels_matriks.push({r: i, c: j, val: restCost[0]});
          restCost.shift();
        }
      }
    }
  }
  // now construct the vogels matriks
  let final_vogels = new Array(original_cost_matriks.length).fill(0).map(()=>new Array(original_cost_matriks[0].length).fill(0));
  for(let i=0; i<vogels_matriks.length; i++){
    final_vogels[vogels_matriks[i].r][vogels_matriks[i].c] = vogels_matriks[i].val;
  }
  // count the optimum cost by vogel approximation
  let vogel_cost = countTheCost(original_cost_matriks, final_vogels);

  let matriks_original = cloneObject(original_cost_matriks);
  let matriks_vogel = cloneObject(final_vogels);
  for(let i=0; i<matriks_original.length; i++){
    matriks_original[i].push(matriks[i][matriks[0].length - 1])
  }
  matriks_original.push(cloneObject(matriks[matriks.length - 1]));
  
  
  return { matriks_original, matriks_vogel, vogel_cost };
}

export async function calcBruteForce(matriks_original, matriks_vogels, optimum_cost, bruteforce = []){
  matriks_original = cloneObject(matriks_original);
  matriks_vogels = cloneObject(matriks_vogels);
  
  // step 1: finding the Square or L Pants
  let square_list = [];
  for(let i=0; i<matriks_vogels.length; i++){
    for(let j=0; j<matriks_vogels[i].length; j++){
      if(matriks_vogels[i][j]!==0){
        // console.log('TITIK: ' + matriks_vogels[i][j]);
        getSquare(matriks_vogels, i, j, 'awal', square_list);
      }
      
    }
  }

  // console.log('square_list', cloneObject(square_list));

  // step 2: count the different cost if we added +1 into the zero
  for(let i=0; i<square_list.length; i++){
    // note: position of zero always on latest index of array square
    square_list[i].diff_cost_temp = 0;
    let minPlus = 1; // untuk positif dan negatif
    for(let j=square_list[i].square.length - 1; j>=0; j--){ // hitung mundur dari yang 0
      square_list[i].diff_cost_temp = square_list[i].diff_cost_temp + (minPlus * matriks_original[square_list[i].square[j].x][square_list[i].square[j].y]);
      minPlus = minPlus * -1;
    }
  }

  // step 3: sort the square_list asc by diff_cost_temp key, and see the first child is having the diff_cost_temp below 0 or not
  square_list.sort(function(a, b) { return a.diff_cost_temp - b.diff_cost_temp ; }); // sort array square base on property x asc and y asc (bawaan JS)
  if(square_list[0].diff_cost_temp < 0){
    // jika ada yang di bawah 0, maka kemungkinkan ada cost yang lebih optimum
    let optimum_square = square_list[0].square;
    // console.log('diff_cost_temp minimum', square_list[0].diff_cost_temp, 'from square: ', optimum_square);

    // step 3: change the previous vogels with new quantity position
    // check the neighbor of the zero where node that have the biggest quantity
    let neighbor_idx0 = matriks_vogels[ optimum_square[0].x][ optimum_square[0].y];
    let neighbor_idxLenMin1 = matriks_vogels[ optimum_square[optimum_square.length - 2].x][ optimum_square[optimum_square.length - 2].y];
    let diff_quant_value = neighbor_idx0 < neighbor_idxLenMin1 ? neighbor_idx0 : neighbor_idxLenMin1;

    // step 4: update the matriks_vogels
    let minPlus = 1; // untuk positif dan negatif
    // let new_optimum_cost = 0;
    for(let j=optimum_square.length - 1; j>=0; j--){ // hitung mundur dari yang 0
      matriks_vogels[optimum_square[j].x][optimum_square[j].y] = matriks_vogels[optimum_square[j].x][optimum_square[j].y] + diff_quant_value*minPlus;
      // new_optimum_cost = new_optimum_cost + (minPlus * matriks_original[optimum_square[j].x][optimum_square[j].y] * diff_quant_value);
      minPlus = minPlus * -1;
    }
    // console.log("matriks_vogels_baru: ", cloneObject(matriks_vogels));

    // step 5: hitung nilai cost optimum terbaru
    let new_optimum_cost = countTheCost(matriks_original, matriks_vogels);
    // console.log('new_optimum_cost', new_optimum_cost);

    // step 6: validasi cost optimumnya dengan cara stepping stone lagi
    // save all value for display in html
    bruteforce.push({
      square_list: square_list,
      diff_cost_temp: square_list[0].diff_cost_temp,
      new_vogels: matriks_vogels,
      new_cost: new_optimum_cost
    });

    if(new_optimum_cost<optimum_cost)
      return await calcBruteForce(matriks_original, matriks_vogels, new_optimum_cost, bruteforce);

  }else{
    let new_optimum_cost = countTheCost(matriks_original, matriks_vogels);
    bruteforce.push({
      square_list: square_list,
      diff_cost_temp: square_list[0].diff_cost_temp,
      new_vogels: matriks_vogels,
      new_cost: new_optimum_cost
    });
  }
  // tidak ada yang optimum, tidak perlu melanjutkan bruteforce
  // vogels has already the optimum cost
  return bruteforce;
  

  // console.log('square_list', square_list);
}

function checkIntersectionVertical(square, i, x, y){
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
  return false;
}

function checkIntersectionHorizontal(square, j, x, y){
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
  
  return false
}

function getSquare(matriks_vogels, x, y, posisi, square_list, square = []){
  square = cloneObject(square);
  square.push({ x: x, y: y, value: matriks_vogels[x][y], posisi });
  if(square[square.length - 1].posisi === 'akhir'){ // ketemu square atau L
    let pk = cloneObject(square);
    pk.sort(function(a, b) { return a.x - b.x || (a.y - b.y) ; }); // sort array square base on property x asc and y asc (bawaan JS)
    pk.forEach(function(a){ delete a.posisi }); // hapus key posisi
    pk = JSON.stringify(pk);
    // check array square in array square_list, if doesn't exist, push array square to the array square_list
    for(let i=0; i<square_list.length; i++){
      if(square_list[i].pk === pk){
        return;
      }
    }
    // console.log('Found a Square or L', cloneObject(square));
    square_list.push({
      square: square,
      type: (square.length===4 ? 'square pants': 'L pants'),
      pk: pk // primary key untuk nanti digunakan sebagai pengecekkan eksistensi sebelum ditambah lagi square yang lain agar tidak double
    });
  }else if(square.length === 1){ // first time execution
    // cari titik berikutnya di baris tersebut
    for(let j=0; j<matriks_vogels[x].length; j++){
      if(j === y) continue;
      if(matriks_vogels[x][j] !== 0){
        getSquare(matriks_vogels, x, j, (j>y ? 'kanan' : 'kiri'), square_list, square);
      }
    }
    // cari titik berikutnya di kolom tersebut
    for(let i=0; i<matriks_vogels.length; i++){
      if(i === x) continue;
      if(matriks_vogels[i][y] !== 0){
        getSquare(matriks_vogels, i, y, (i>x ? 'bawah' : 'atas'), square_list, square)
      }
    }
    
  }else{
    // cek titik sebelumnya dari posisi mana
    if(square[square.length - 1].posisi === 'kanan' || square[square.length - 1].posisi === 'kiri'){
      // cari titik berikutnya di kolom tersebut
      for(let i=0; i<matriks_vogels.length; i++){
        if(i === x) continue;
        if(matriks_vogels[i][y] !== 0){    
          if(square.length > 3 && checkIntersectionVertical(square, i, x, y))
            return; // jika terdeteksi intersection pada saat membuat jalur pola L pants      
          getSquare(matriks_vogels, i, y, (i>x ? 'bawah' : 'atas'), square_list, square)
        }
      }
    }else if(square[square.length - 1].posisi === 'atas' || square[square.length - 1].posisi === 'bawah'){
      // cari titik berikutnya di baris tersebut
      for(let j=0; j<matriks_vogels[x].length; j++){
        if(j === y) continue;
        if(matriks_vogels[x][j] !== 0){          
          if(square.length > 3 && checkIntersectionHorizontal(square, j, x, y))
            return; // jika terdeteksi intersection pada saat membuat jalur pola L pants  
          getSquare(matriks_vogels, x, j, (j>y ? 'kanan' : 'kiri'), square_list, square);
        }
      }
    }
    // console.log(cloneObject(square));

    // cek kelengkapan square
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
    if(square.length > 5){
      return;
    }

    
  }
}