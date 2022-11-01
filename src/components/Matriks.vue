<template>
  <v-container>
    <v-row>
      
      <v-col cols="6">
        <v-text-field 
          :disabled="isLoading" 
          color="purple" 
          variant="solo" 
          type="number" 
          label="Baris" 
          v-model="baris" 
          @focus="$event.target.select()"
        ></v-text-field>
      </v-col>
      <v-col cols="6">
        <v-text-field 
          :disabled="isLoading" 
          color="purple" 
          variant="solo" 
          type="number" 
          label="Kolom" 
          v-model="kolom"
          @focus="$event.target.select()"
        ></v-text-field>
      </v-col>
    </v-row>
    <v-row class="text-center">
      <v-col cols="12">
        <v-table class="tabelMatriks border-kiri border-atas shadow" v-if="isConstructing === false" theme="ligth">
          <thead>
            <tr>
              <th class="border-kanan border-bawah">Stock \ Depot</th>
              <th class="border-kanan border-bawah" v-for="i in kolom - 1" :key="`titlex${i}`">B{{i}}</th>
              <th class="border-kanan border-bawah">Supply</th>
            </tr>

          </thead>
          <tbody>
            <tr v-for="i in baris" :key="`baris${i}`">
              <th class="border-kanan border-bawah" v-if="i<baris">
                A{{i}}
              </th>
              <th class="border-kanan border-bawah" v-else>
                Demand
              </th>
              <td v-for="j in kolom" :key="`kolom${j}`" class="border-kanan pa-0">
                <v-text-field v-if="i== baris && j==kolom" type="number" readonly :disabled="isLoading" class="matriks" v-model="matriks[i-1][j-1]" @keyup="preventEmpty(i,j)" :style="sumDemSup(supply) != sumDemSup(demand) ? 'background-color: #c44d56; color: white' : ''"></v-text-field>
                <v-text-field v-else type="number" class="matriks"  v-model="matriks[i-1][j-1]" @keyup="preventEmpty(i,j)" @focus="$event.target.select()" :disabled="isLoading" ></v-text-field>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-col>
    </v-row>
    <v-row class="text-center mt-5">
      <v-col cols="12">
        <v-btn :loading="isLoading" color="purple" class="py-5" block :disabled="isDisabled" @click="hitungMatriks()">
          Hitung Biaya Transportasi
        </v-btn>
        <br/>
      </v-col>
    </v-row>
  </v-container>
  <Result :dialog="dialog" :hasil="hasil_vogels_approximation" :bruteforce="hasil_bruteforce">
    <template #footer>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="purple"
          flat
          @click="dialog = false"
        >
          Tutup
        </v-btn>
      </v-card-actions>
    </template>
  </Result>
</template>

<script>
import { computed } from '@vue/reactivity';
import { onMounted, ref, watch } from 'vue';
import hitungOptimumCost from '../greedy_plugin/main'
import { cloneObject } from '../greedy_plugin/utils';
import Result from './Result.vue';
import { useToast } from "vue-toastification";

  export default{
    components:{
      Result
    },
    setup(){
      
      const baris = ref(4)
      const kolom = ref(5)
      const matriks = ref([]);
      const isConstructing = ref(null)
      onMounted(()=>{
        isConstructing.value = true;
        createMatriks()
        isConstructing.value = false;

        // for using example
        setTimeout(()=>{
          // matriks.value = [
          //   [2,1,5,1,8],
          //   [2,3,5,1,10],
          //   [4,6,7,7,20],
          //   [6,8,9,15,38],
          //   [2,5,9,10,10],
          //   [2,7,5,1,10],
          //   [1,3,5,1,5],
          //   [2,3,4,1,4],
          //   [5,1,4,7,12],
          //   [4,5,3,3,11],
          //   [20,25,47,36,20]
          // ]

          // matriks.value = [
          //   [2,10,6,13,14],
          //   [10,3,7,15,14],
          //   [9,2,14,9,12],
          //   [9,9,13,9,0]
          // ]

          // soal fadli gak bisa
          // matriks.value = [
          //   [6,5,12,7,16,18,13,14,18,9,12,5],
          //   [14,6,19,9,17,2,8,10,8,20,7,9],
          //   [16,2,5,11,16,1,4,8,8,10,11,7],
          //   [20,7,14,19,4,1,2,6,2,9,12,6],
          //   [4,16,9,10,9,14,11,15,10,3,6,11],
          //   [16,18,20,15,9,19,9,1,5,5,9,7],
          //   [16,20,18,18,5,17,19,2,5,4,15,14],
          //   [9,12,17,19,13,13,8,5,4,17,14,4],
          //   [1,2,15,6,1,14,11,6,12,8,13,6],
          //   [5,5,7,14,7,11,19,5,14,8,10,6],
          //   [7,16,10,17,2,3,11,11,1,11,18,5],
          //   [12,11,6,11,7,5,5,6,4,7,6,80]
          // ]

          // matriks fadli 2366
          matriks.value = [
            [70,37,6,76,17,18],
            [59,90,93,5,10,17],
            [93,62,77,47,62,19],
            [54,55,26,9,84,13],
            [53,20,84,15,9,15],
            [16,18,20,14,14,82]
          ]

          // matriks.value = [
          //   [2,3,5,1,8],
          //   [7,3,5,1,10],
          //   [4,1,7,2,20],
          //   [6,8,9,15,38]
          // ]

          // soal uts
          matriks.value = [
            [2,3,5,6,10],
            [3,2,4,5,10],
            [3,5,7,4,20],
            [10,10,10,10,40]
          ]
        },500);
        // console.log('tes')
      })
      watch(baris, (val)=>{
        isConstructing.value = true;
        if(val=='' || val<=1 || val==null) baris.value = 2;
        createMatriks();
        isConstructing.value = false;
      })
      watch(kolom, (val)=>{
        isConstructing.value = true;
        if(val=='' || val<=1 || val==null) kolom.value = 2;
        createMatriks();
        isConstructing.value = false;
      })
      
      const sumDemSup = (arr) => {
        let total = 0;
        for(let i = 0 ; i< arr.length; i++){
          total = total + arr[i]
        }
        return total;
      }
      const demand = computed(()=>{
        let arr = [];
        if(matriks.value.length == 0 || matriks.value[0].length == 0) return arr
        for(let i=0; i<kolom.value - 1; i++){
          arr.push(matriks.value[(baris.value)-1][i]);
        }
        
        return arr;
        
      })
      watch(demand, (val)=>{
        matriks.value[baris.value - 1][kolom.value - 1] = sumDemSup(val)
      })
      const supply = computed(()=>{
        let arr = [];
        if(matriks.value.length == 0 || matriks.value[0].length == 0) return arr
        for(let i=0; i<baris.value - 1; i++){
          if(typeof matriks.value[i] !== 'undefined')
            arr.push(matriks.value[i][(kolom.value)-1]);
        }
        return arr;
        
      })
      watch(supply, (val)=>{
        let sum = sumDemSup(val);
        if(typeof sum !== 'undefined' && typeof matriks.value[baris.value - 1] !== 'undefined')
          matriks.value[baris.value - 1][kolom.value - 1] = sum;
      })
      const createMatriks = () => {
        matriks.value = [];
        for(let i=0; i< baris.value; i++){
          let m_j = [];
          for(let j=0; j<kolom.value; j++){
            m_j.push(0);
          }
          matriks.value.push(m_j);
        }
      }
      const preventEmpty = (i, j) => {
        if(matriks.value[i-1][j-1] == '' || matriks.value[i-1][j-1] == null || matriks.value[i-1][j-1] < 0)
          matriks.value[i-1][j-1] = 0;
      }
      const isDisabled = computed(()=>{
        if(matriks.value.length == 0 || matriks.value[0].length == 0) return true
        for(let i=0; i<matriks.value.length; i++){
          for(let j=0; j<matriks.value[i].length; j++){
            if(matriks.value[i][j]!=='' && matriks.value[i][j] !== 0 && sumDemSup(supply.value) == sumDemSup(demand.value))
              return false
          }
        }
        return true
      })

      const isLoading = ref(false)
      const dialog = ref(false)
      const hasil_vogels_approximation = ref(null);
      const hasil_bruteforce = ref(null);
      const toast = useToast();
      const hitungMatriks = async () => {
        isLoading.value = true;
        await wait(1000);
        let result = await hitungOptimumCost(cloneObject(matriks.value));
        if(result.status === 'error'){
          toast(result.value);
        }

        console.log('---------------');
        console.log('HASIL VOGELS APPROXIMATION DAN BRUTEFORCE');
        console.log(result.value);
        console.log('---------------');

        // lempar hasil ke component Result.vue
        hasil_vogels_approximation.value = {
          matriks_original: result.value.original_matriks,
          matriks_vogel: result.value.vogels_result.matriks_vogels,
          vogel_cost: result.value.vogels_result.cost_vogels
        };
        hasil_bruteforce.value = result.value.bruteforce_result;
        
        dialog.value = true;
        isLoading.value = false;
      }

      const wait = (ms) => {
        return new Promise(r => setTimeout(r, ms));
      }

      
      
      return{
        baris,
        kolom,
        matriks,
        isConstructing,
        preventEmpty,
        isDisabled,
        isLoading,
        hitungMatriks,
        sumDemSup,
        supply,
        dialog,
        demand,
        hasil_vogels_approximation,
        hasil_bruteforce
      }
    }
  }
  </script>

<style scoped>
@import '../assets/gaya.css';
</style>