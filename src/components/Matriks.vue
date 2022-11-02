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
    <v-row class="text-center mt-0 opsiMatriks">
      <v-col cols="12">
        <div class="float-left mr-10">
          <v-checkbox
            v-model="withSquarePattern"
            color="indigo"
            true-icon="fa-regular fa-square-check"
            false-icon="fa-regular fa-square"
          >
          <template v-slot:label>
            <div>
              <v-tooltip location="bottom">
                <template v-slot:activator="{ props }">
                  <span
                    v-bind="props"
                    @click.stop
                  >
                    Menampilkan Hasil Square dan L
                  </span>
                </template>
                Jika ukuran matriks besar, bisa membuat proses lebih lambat atau hang dikarenakan proses rendering 
                pola Square dan L yang mungkin akan harus dibuat banyak sesuai Square dan L yang
              </v-tooltip>
            </div>
          </template>
          </v-checkbox>
        </div>
        <div class="float-left">
          <v-btn 
            color="purple" 
            class="mt-3" 
            block 
            variant="text" 
            :disabled="isLoading" 
            @click="generateRandomMatriks()"
            prepend-icon="fa-solid fa-shuffle"
          >
            Generate Random Matriks
          </v-btn>
        </div>
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
  <Result :dialog="dialog" :hasil="hasil_vogels_approximation" :bruteforce="hasil_bruteforce" :withSquarePattern="withSquarePattern">
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
import { inject, onMounted, ref, watch } from 'vue';
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
          // matriks.value = [
          //   [70,37,6,76,17,18],
          //   [59,90,93,5,10,17],
          //   [93,62,77,47,62,19],
          //   [54,55,26,9,84,13],
          //   [53,20,84,15,9,15],
          //   [16,18,20,14,14,82]
          // ]

          matriks.value = [
            [2,3,5,1,8],
            [7,3,5,1,10],
            [4,1,7,2,20],
            [6,8,9,15,38]
          ]

          // soal uts
          // matriks.value = [
          //   [2,3,5,6,10],
          //   [3,2,4,5,10],
          //   [3,5,7,4,20],
          //   [10,10,10,10,40]
          // ]
        },500);
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

      const emitter = inject('emitter');
      emitter.on('stopLoading', ()=>{
        isLoading.value = false;
      })

      const withSquarePattern = ref(false);
      const randomInteger = (min, max) => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
      }
      const getStandardDeviation = (array)=> {
        const n = array.length
        const mean = array.reduce((a, b) => a + b) / n
        return Math.sqrt(array.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n)
      }
      const generateRandomMatriks = () =>{
        let totalSupply = 0;
        let averageDemand = 0;
        let varianceDemand = 0;
        for(let i=0; i<matriks.value.length; i++){
          for(let j=0; j<matriks.value[i].length; j++){
            if(i===matriks.value.length - 1){
              if(j===matriks.value[i].length - 2){
                matriks.value[i][j] = totalSupply;
              }else if(j<matriks.value[i].length - 2){
                let demand = averageDemand + randomInteger(-1*varianceDemand, varianceDemand);
                totalSupply = totalSupply - demand;
                matriks.value[i][j] = demand;
              }
              
            }else if(j===matriks.value[i].length - 1){
              let supply = randomInteger(1,30);
              totalSupply = totalSupply + supply;
              matriks.value[i][j] = supply;
              if(i==matriks.value.length - 2){
                let total_temp = totalSupply;
                averageDemand = Math.ceil(totalSupply / (matriks.value[matriks.value.length-1].length - 1));
                let temp_demand_array = [];
                for(let x=0; x<=matriks.value[matriks.value.length-1].length - 2; x++){
                  if(x===matriks.value[matriks.value.length-1].length - 2){
                    temp_demand_array.push(total_temp);
                  }else if(x<matriks.value[matriks.value.length-1].length - 2){
                    total_temp = total_temp - averageDemand;
                    temp_demand_array.push(averageDemand);
                  }
                }
                varianceDemand = Math.ceil(getStandardDeviation(temp_demand_array));
              }
            }else{
              matriks.value[i][j] = randomInteger(1,99);
            }
          }
        }
      }

      const isLoading = ref(false)
      const dialog = ref(false)
      const hasil_vogels_approximation = ref(null);
      const hasil_bruteforce = ref(null);
      const toast = useToast();
      const hitungMatriks = async () => {
        isLoading.value = true;
        await wait(1000); // biar keliatan ada loading indicator

        let result = await hitungOptimumCost(cloneObject(matriks.value));
        if(result.status === 'error'){
          toast(result.value);
          isLoading.value = false;
        }

        // untuk menampilkan hasil perhitungan di console browser
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
        
        // munculkan dialog
        dialog.value = true;
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
        hasil_bruteforce,
        withSquarePattern,
        generateRandomMatriks
      }
    }
  }
  </script>

<style scoped>
@import '../assets/gaya.css';
</style>