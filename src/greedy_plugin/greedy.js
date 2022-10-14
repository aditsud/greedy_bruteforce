import Quicksort from '@softnami/quicksort';
let sorter = new Quicksort();

function consoleMatriks(matriks){
  for(let i=0; i<matriks.length; i++){
    let mat = ''
    for(let j=0; j<matriks[i].length; j++){
      mat = mat + ' ' + matriks[i][j] + ' '
    }
    console.log(i  + ': ' + mat)
  }
  console.log()
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
  let original_matriks = JSON.parse(JSON.stringify(matriks));

  let original_matriks2 = JSON.parse(JSON.stringify(matriks));
  for(let i=0; i<original_matriks2.length; i++){
    sorter.sort(original_matriks2[i]);
    supply_penalty.push(Math.abs(original_matriks2[i][0] - original_matriks2[i][1]));
  }

  let transpose_matriks = original_matriks[0].map((_, colIndex) => original_matriks.map(row => row[colIndex]));
  for(let i=0; i<transpose_matriks.length; i++){
    sorter.sort(transpose_matriks[i]);
    demand_penalty.push(Math.abs(transpose_matriks[i][0] - transpose_matriks[i][1]));
  }

  let join_penalty = supply_penalty.concat(demand_penalty);
  sorter.sort(join_penalty);
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
  sorter.sort(allPossibleCostAoI)
  let minimumCost = allPossibleCostAoI[0]
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
  let new_cost_matriks = JSON.parse(JSON.stringify(cost_matriks))
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
    }else if(demand_minimumCost !== 0){
      let row_minCost_ori = row_minimumCost;
      let col_minCost_ori = column_minimumCost;
      insertToVogel(original_cost_matriks, cost_matriks, row_minCost_ori, col_minCost_ori,  vogels_matriks, row_minimumCost, column_minimumCost, 'c', demand_minimumCost, row_forbidden, col_forbidden);

      demand_matriks.splice(column_minimumCost, 1); // remove demand yang sudah habis
      new_cost_matriks.map(function(val) { return val.splice(column_minimumCost, 1); }); // remove column yang sudah habis
      supply_matriks[row_minimumCost] = supply_minimumCost - demand_minimumCost;
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

      consoleMatriks(original_cost_matriks);
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


export function hitungMatriks(matriks){
  let { cost_matriks, demand_matriks, supply_matriks } = clasifyMatriks(matriks);
  let original_cost_matriks = JSON.parse(JSON.stringify(cost_matriks));
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
  consoleMatriks(vogels_matriks);
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
  let vogel_cost = 0;
  for(let i=0; i<original_cost_matriks.length; i++){
    for(let j=0; j<original_cost_matriks[i].length; j++){
      vogel_cost = vogel_cost + original_cost_matriks[i][j] * final_vogels[i][j];
    }
  }

  let matriks_original = JSON.parse(JSON.stringify(original_cost_matriks));
  let matriks_vogel = JSON.parse(JSON.stringify(final_vogels));
  for(let i=0; i<matriks_original.length; i++){
    matriks_original[i].push(matriks[i][matriks[0].length - 1])
  }
  matriks_original.push(JSON.parse(JSON.stringify(matriks[matriks.length - 1])));
  
  
  return { matriks_original, matriks_vogel, vogel_cost };
}