<template>
  <v-dialog v-model="dialog" scrollable transition="dialog-bottom-transition">
    <v-card>
        
        <v-toolbar color="purple" class="px-5">Hasil Perhitungan Minimum Transportation Cost</v-toolbar>
        <v-card-text >
          <div id="tabelVogel" style="position: relative;">

            <h2 class="text-center" v-if="bruteforce && bruteforce.length > 0">OPTIMUM COST: {{bruteforce[bruteforce.length - 1].new_cost}}</h2>
            <h2 class="text-center" v-else>OPTIMUM COST: {{hasil ? hasil.vogel_cost : '-'}}</h2><br/>
            <h3>Matriks Vogels Approximation <small>Cost: {{hasil ? hasil.vogel_cost : '-'}}</small></h3>
            
            <div class="vld-parent">
              <!-- <loading :active="loadingPattern===true" :can-cancel="false" :is-full-page="false"></loading> -->
              <v-table class="tabelMatriks tabelResult border-kiri border-atas" theme="ligth" >
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
                    <td v-for="j in kolom" :key="`kolom${j}`" class="border-kanan pa-0" :id="`vogels_cell_x${i-1}_y${j-1}`">
                      <v-text-field type="text" readonly class="matriks" >{{ hasil.matriks_original[i-1][j-1] + ' ' + getMatriksVogel(hasil.matriks_vogel, i-1, j-1) }}</v-text-field>
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </div>
            <div v-if="bruteforce && bruteforce.length > 0">
              <br/>
              <h4 v-if=" bruteforce[0].square_list > 0">List Square and L Pants:</h4>
              <v-list lines="one" class="keterangan">
                <v-list-item
                  class="keterangan"
                  v-for="(item, idx) in bruteforce[0].square_list"
                  :key="item.pk"
                  :title="(idx + 1) + '. ' +item.type + '. Different Cost Value: ' + item.diff_cost_temp"
                >
                  <span v-for="(sq, idxs) in item.square" :key="`square${idxs}`">
                    (A{{sq.x+1}},B{{sq.y+1}})={{sq.value}} <span v-if="idxs < item.square.length-1">→</span>
                  </span>
                </v-list-item>
              </v-list>
            </div>
            <div v-for="(bf,id) in bruteforce" :key="`bruteforce-step${id}`">
              <div v-if="id < bruteforce.length - 1">
                <br/>
                <h3>Stepping Stone Step ke-{{id+1}} <small>Cost: {{ bf.new_cost }}</small></h3>
                <div class="vld-parent">
                  <!-- <loading :active="loadingPattern===true" :can-cancel="false" :is-full-page="false"></loading> -->
                  <v-table class="tabelMatriks tabelResult border-kiri border-atas" theme="ligth" >
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
                        <td v-for="j in kolom" :key="`kolom${j}`" class="border-kanan pa-0" :id="`bruteforce_cell_m${id+1}_x${i-1}_y${j-1}`">
                          <v-text-field type="text" readonly class="matriks" >{{ hasil.matriks_original[i-1][j-1] + ' ' + getMatriksVogel(bf.new_vogels, i-1, j-1) }}</v-text-field>
                        </td>
                      </tr>
                    </tbody>
                  </v-table>
                </div>
                <br/>
                <h4 v-if="bruteforce[id+1].square_list > 0">List Square and L Pants:</h4>
                <v-list lines="one" class="keterangan">
                  <v-list-item
                    class="keterangan"
                    v-for="(item, idx) in bruteforce[id+1].square_list"
                    :key="item.pk"
                    :title="(idx + 1) + '. ' +item.type + '. Different cost value: ' + item.diff_cost_temp"
                  >
                    <span v-for="(sq, idxs) in item.square" :key="`square${idxs}`">
                      (A{{sq.x+1}},B{{sq.y+1}})={{sq.value}} <span v-if="idxs < item.square.length-1">→</span>
                    </span>
                  </v-list-item>
                </v-list>
              </div>
              
            </div>
          </div>  
        </v-card-text>
        
        <slot name="footer"></slot>
      </v-card>
  </v-dialog>
</template>

<script>
import { inject, onUpdated, ref, toRef, watch } from 'vue';
import createLine from '../greedy_plugin/createLine'
import Loading from 'vue3-loading-overlay';
import 'vue3-loading-overlay/dist/vue3-loading-overlay.css';

export default{
  components:{
    Loading
  },  
  props:['dialog', 'hasil', 'bruteforce', 'withSquarePattern'],
  setup(props){
    const baris = ref(0);
    const kolom = ref(0);
    const dialog = toRef(props, 'dialog')
    const hasil = toRef(props, 'hasil');
    const bruteforce = toRef(props, 'bruteforce');
    const emitter = inject('emitter');
    const loadingPattern = ref(false);
    watch(hasil, (val)=>{
      baris.value = val ? val.matriks_original.length : 0;
      kolom.value = val ? val.matriks_original[0].length : 0;
      loadingPattern.value = props.withSquarePattern;
      
      setTimeout(()=>{
        if(props.withSquarePattern===true && bruteforce.value && bruteforce.value.length > 0){
          // untuk isi garis pada vogels matriks
          let square_list = bruteforce.value[0].square_list;

          let line_list = [];
          for(let i=0; i<square_list.length; i++){
            let square = square_list[i].square;
            let variasi_x = getRandomFloat(0, 50, 2); // agar garis tidak berdempetan, jadi digeser dikit
            let variasi_y = getRandomFloat(-10, 10, 2);; // agar garis tidak berdempetan, jadi digeser dikit
            let color = generateRandomColorHex();
            for(let j=0; j<square.length; j++){
              if(j===square.length-1){ // membuat garis terakhir dengan garis pertama
                line_list.push(createLine('tabelVogel', `vogels_cell_x${square[j].x}_y${square[j].y}`, `vogels_cell_x${square[0].x}_y${square[0].y}`, variasi_x, variasi_y, color, 85));
              }else{
                line_list.push(createLine('tabelVogel', `vogels_cell_x${square[j].x}_y${square[j].y}`, `vogels_cell_x${square[j+1].x}_y${square[j+1].y}`, variasi_x, variasi_y, color, 85));
              }
            }
          }

          // untuk isi garis pada bruteforce
          for(let m=1; m<bruteforce.value.length; m++){
            let square_list = bruteforce.value[m].square_list;
            for(let i=0; i<square_list.length; i++){
              let square = square_list[i].square;
              let variasi_x = getRandomFloat(0, 50, 2); // agar garis tidak berdempetan, jadi digeser dikit
              let variasi_y = getRandomFloat(-10, 10, 2);; // agar garis tidak berdempetan, jadi digeser dikit
              let color = generateRandomColorHex();
              for(let j=0; j<square.length; j++){
                if(j===square.length-1){ // membuat garis terakhir dengan garis pertama
                  line_list.push(createLine('tabelVogel', `bruteforce_cell_m${m}_x${square[j].x}_y${square[j].y}`, `bruteforce_cell_m${m}_x${square[0].x}_y${square[0].y}`, variasi_x, variasi_y, color, 85));
                }else{
                  line_list.push(createLine('tabelVogel', `bruteforce_cell_m${m}_x${square[j].x}_y${square[j].y}`, `bruteforce_cell_m${m}_x${square[j+1].x}_y${square[j+1].y}`, variasi_x, variasi_y, color, 85));
                }
              }
            }
          }

          
          
          for(let l=0; l<line_list.length; l++){
            document.getElementById(line_list[l].id).innerHTML += line_list[l].html;
          }
        }
        
      }, 1000)
    })
    onUpdated(()=>{
      //console.log('tes', hasil.value);
    })
    const generateRandomColorHex = () => {
      return "#" + ("00000" + Math.floor(Math.random() * Math.pow(16, 6)).toString(16)).slice(-6);
    }
    const getRandomFloat = (min, max, decimals) => {
      const str = (Math.random() * (max - min) + min).toFixed(decimals);
      return parseFloat(str);
    }
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
      getMatriksVogel,
      loadingPattern
    }
  }
}
</script>


<style scoped>
@import '../assets/gaya.css'
</style>