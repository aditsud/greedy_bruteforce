<template>
  <v-dialog v-model="dialog" scrollable>
    <v-card>
        <v-toolbar color="blue" class="px-5">Hasil Perhitungan Minimum Transportation Cost</v-toolbar>
        <v-card-text>

          <h3>Matriks Vogels Approximation <small>Cost: {{hasil ? hasil.vogel_cost : '-'}}</small></h3>
          <v-table  class="tabelMatriks" theme="ligth"  style="border-left: 1px solid #9E9E9E; border-top: 1px solid #9E9E9E;">
            <thead>
              <tr>
                <th style="border-bottom: 1px solid #9E9E9E; border-right: 1px solid #9E9E9E;">Stock \ Depot</th>
                <th v-for="i in kolom - 1" :key="`titlex${i}`" style="border-bottom: 1px solid #9E9E9E; border-right: 1px solid #9E9E9E;">B{{i}}</th>
                <th style="border-bottom: 1px solid #9E9E9E; border-right: 1px solid #9E9E9E;">Supply</th>
              </tr>

            </thead>
            <tbody>
              <tr v-for="i in baris" :key="`baris${i}`">
                <th v-if="i < baris" style="border-bottom: 1px solid #9E9E9E; border-right: 1px solid #9E9E9E;">
                  A{{i}}
                </th>
                <th v-else style="border-bottom: 1px solid #9E9E9E; border-right: 1px solid #9E9E9E;">
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
            <v-table  class="tabelMatriks" theme="ligth"  style="border-left: 1px solid #9E9E9E; border-top: 1px solid #9E9E9E;">
              <thead>
                <tr>
                  <th style="border-bottom: 1px solid #9E9E9E; border-right: 1px solid #9E9E9E;">Stock \ Depot</th>
                  <th v-for="i in kolom - 1" :key="`titlex${i}`" style="border-bottom: 1px solid #9E9E9E; border-right: 1px solid #9E9E9E;">B{{i}}</th>
                  <th style="border-bottom: 1px solid #9E9E9E; border-right: 1px solid #9E9E9E;">Supply</th>
                </tr>

              </thead>
              <tbody>
                <tr v-for="i in baris" :key="`baris${i}`">
                  <th v-if="i < baris" style="border-bottom: 1px solid #9E9E9E; border-right: 1px solid #9E9E9E;">
                    A{{i}}
                  </th>
                  <th v-else style="border-bottom: 1px solid #9E9E9E; border-right: 1px solid #9E9E9E;">
                    Demand
                  </th>
                  <td v-for="j in kolom" :key="`kolom${j}`" style="padding:0; border-right: 1px solid #9E9E9E">
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
          <br/>
          <h2 class="text-center">OPTIMUM COST: {{bruteforce[bruteforce.length - 1].new_cost}}</h2>
        </v-card-text>
        <slot name="footer"></slot>
      </v-card>
  </v-dialog>
</template>

<script>
import { ref, toRef, watch } from 'vue';

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
.matriks :deep(.v-input__details){
  display: none;
}
.tabelMatriks :deep(td){
  min-width:100px;
}
</style>