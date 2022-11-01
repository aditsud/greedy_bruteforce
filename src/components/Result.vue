<template>
  <v-dialog v-model="dialog" scrollable >
    <v-card>
        <v-toolbar color="purple" class="px-5">Hasil Perhitungan Minimum Transportation Cost</v-toolbar>
        <v-card-text>
          <h2 class="text-center" v-if="bruteforce && bruteforce.length > 0">OPTIMUM COST: {{bruteforce[bruteforce.length - 1].new_cost}}</h2>
          <h2 class="text-center" v-else>OPTIMUM COST: {{hasil ? hasil.vogel_cost : '-'}}</h2>
          <h3>Matriks Vogels Approximation <small>Cost: {{hasil ? hasil.vogel_cost : '-'}}</small></h3>
          <div id="div1"></div>
          <v-table  class="tabelMatriks border-kiri border-atas" theme="ligth">
            <thead>
              <tr>
                <th class="border-kanan border-bawah">Stock \ Depot</th>
                <th v-for="i in kolom - 1" :key="`titlex${i}`" class="border-kanan border-bawah">B{{i}}</th>
                <th class="border-kanan border-bawah">Supply</th>
              </tr>

            </thead>
            <tbody>
              <tr v-for="i in baris" :key="`baris${i}`">
                <th v-if="i < baris" class="border-kanan border-bawah">
                  A{{i}}
                </th>
                <th v-else class="border-kanan border-bawah">
                  Demand
                </th>
                <td v-for="j in kolom" :key="`kolom${j}`" style="padding:0; border-right: 1px solid #9E9E9E">
                  <v-text-field type="text" readonly class="matriks" >{{ hasil.matriks_original[i-1][j-1] + ' ' + getMatriksVogel(hasil.matriks_vogel, i-1, j-1) }}</v-text-field>
                </td>
              </tr>
            </tbody>
          </v-table>

          <div v-for="(bf,id) in bruteforce" :key="`bruteforce-step${id}`">
            <br/>
            <h3>Stepping Stone Step ke-{{id+1}} <small>Cost: {{ bf.new_cost }}</small></h3>
            <v-table  class="tabelMatriks border-kiri border-atas" theme="ligth" >
              <thead>
                <tr>
                  <th class="border-kanan border-bawah">Stock \ Depot</th>
                  <th v-for="i in kolom - 1" :key="`titlex${i}`" class="border-kanan border-bawah">B{{i}}</th>
                  <th class="border-kanan border-bawah">Supply</th>
                </tr>

              </thead>
              <tbody>
                <tr v-for="i in baris" :key="`baris${i}`">
                  <th v-if="i < baris" class="border-kanan border-bawah">
                    A{{i}}
                  </th>
                  <th v-else class="border-kanan border-bawah">
                    Demand
                  </th>
                  <td v-for="j in kolom" :key="`kolom${j}`" class="border-kanan pa-0">
                    <v-text-field type="text" readonly class="matriks" >{{ hasil.matriks_original[i-1][j-1] + ' ' + getMatriksVogel(bf.new_vogels, i-1, j-1) }}</v-text-field>
                  </td>
                </tr>
              </tbody>
            </v-table><br/>
            <h4>List Square and L Pants:</h4>
            <v-list lines="one">
              <v-list-item
                v-for="(item, idx) in bf.square_list"
                :key="item.pk"
                :title="(idx + 1) + '. ' +item.type + '. Diff-cost value: ' + item.diff_cost_temp"
              >
                <div v-for="(sq, idxs) in item.square" :key="`square${idxs}`">
                  (x,y): ({{sq.x}},{{sq.y}}) value: {{sq.value}}
                </div>
              </v-list-item>
            </v-list>
          </div>
          <div id="div2"></div>
        </v-card-text>
        
        <slot name="footer"></slot>
      </v-card>
  </v-dialog>
</template>

<script>
import { onMounted, ref, toRef, watch } from 'vue';

import { testIt } from '../greedy_plugin/createLine';

export default{
  props:['dialog', 'hasil', 'bruteforce'],
  setup(props){
    const baris = ref(0);
    const kolom = ref(0);
    const dialog = toRef(props, 'dialog')
    const hasil = toRef(props, 'hasil');
    const bruteforce = toRef(props, 'bruteforce');
    watch(hasil, (val)=>{
      baris.value = val ? val.matriks_original.length : 0;
      kolom.value = val ? val.matriks_original[0].length : 0;
    })
    const getMatriksVogel = (matriks_vogel, i, j) =>{
      
      if(typeof matriks_vogel !== 'undefined' && typeof matriks_vogel[i] !== 'undefined' && typeof matriks_vogel[i][j] !== 'undefined' && matriks_vogel[i][j] !== 0){
        return '(' + matriks_vogel[i][j] + ')';
      }
      return '';
    }

    onMounted(()=>{
        setTimeout(()=>{
          //testIt();
        },5000)
      })
    
    
    return {
      dialog,
      hasil,
      baris,
      kolom,
      bruteforce,
      getMatriksVogel
    }
  }
}
</script>


<style scoped>
@import '../assets/gaya.css'
</style>