<template>
  <v-container>
    <v-row class="text-center mt-0 opsiMatriks">
      <v-col cols="12">
        <div class="float-left mr-10">
          <v-checkbox
            v-model="withSquarePattern"
            color="indigo"
            true-icon="fa-regular fa-square-check"
            false-icon="fa-regular fa-square"
            :disabled="isLoading"
          >
          <template v-slot:label>
            <div>
              <v-tooltip location="bottom">
                <template v-slot:activator="{ props }">
                  <span
                    v-bind="props"
                    @click.stop
                    class="checkboxSquare"
                  >
                    Menampilkan Hasil Square dan L
                  </span>
                </template>
                Mungkin akan membuat kinerja komputasi melambat karena proses rendering pola Square dan L, bergantung dari jumlah baris dan kolom serta banyaknya pola yang ditemukan.
              </v-tooltip>
            </div>
          </template>
          </v-checkbox>
        </div>
        <div class="float-left">
          <v-btn 
            color="purple" 
            style="margin-top:10px" 
            variant="text" 
            :disabled="isLoading" 
            @click="generateRandomMatriks()"
            prepend-icon="fa-solid fa-shuffle"
          >
            Random Matriks
          </v-btn>
        </div>
        <div class="float-left">
          <v-btn 
            color="purple" 
            style="margin-top:10px" 
            variant="text" 
            :disabled="isLoading" 
            @click="dialogLoadMatriks=true"
            prepend-icon="fa-solid fa-folder-open"
          >
            Load Matriks
          </v-btn>
        </div>
        <div class="float-left">
          <v-btn 
            color="purple" 
            style="margin-top:10px" 
            variant="text" 
            @click="saveMatriksDialog()"
            prepend-icon="fa-solid fa-save"
          >
            Save Matriks
          </v-btn>
        </div>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="6">
        <v-text-field 
          :disabled="isLoading" 
          color="purple" 
          variant="solo" 
          type="number" 
          label="Baris Cost" 
          v-model="baris_cost" 
          @focus="$event.target.select()"
        ></v-text-field>
      </v-col>
      <v-col cols="6">
        <v-text-field 
          :disabled="isLoading" 
          color="purple" 
          variant="solo" 
          type="number" 
          label="Kolom Cost" 
          v-model="kolom_cost"
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
  <LoadMatriks :dialog="dialogLoadMatriks">
    <template #footer>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="purple"
          flat
          @click="dialogLoadMatriks = false"
        >
          Tutup
        </v-btn>
      </v-card-actions>
    </template>
  </LoadMatriks>
  <v-dialog v-model="dialogSave" class="dialogHapus" transition="dialog-bottom-transition" >
    <v-card>
      <v-card-text >
        
        <p class="text-justify text-body-2 mb-2">
          Matriks akan disimpan pada local storage di browser ini. Oleh karena itu, matriks yang Anda akan simpan hanya bisa diakses kembali pada browser ini saja.<br/><br/> 
        </p>
        <v-text-field label="Nama Matriks" variant="outlined" v-model="namaMatriks"></v-text-field>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="purple"
          flat
          @click="simpanMatriks()"
        >
          Simpan
        </v-btn>
        <v-btn
          color="purple"
          flat
          @click="dialogSave=false"
        >
          Batal
        </v-btn>
      </v-card-actions>
    </v-card>
    
  </v-dialog>
</template>

<script>
import { computed } from '@vue/reactivity';
import { inject, onMounted, ref, watch } from 'vue';
import hitungOptimumCost from '../greedy_plugin/main'
import { cloneObject } from '../greedy_plugin/utils';
import Result from './Result.vue';
import LoadMatriks from './LoadMatriks.vue';
import { useToast } from "vue-toastification";
import dayjs from 'dayjs';
import 'dayjs/locale/id';


  export default{
    components:{
      Result,
      LoadMatriks
    },
    setup(){
      const emitter = inject('emitter');
      const baris = ref(4)
      const kolom = ref(4)

      const baris_cost = computed({
        get(){
          return baris.value - 1;
        },
        set(newValue){
          baris.value = newValue + 1;
        }
      })
      const kolom_cost = computed({
        get(){
          return kolom.value - 1;
        },
        set(newValue){
          kolom.value = newValue + 1;
        }
      })

      emitter.on('applyMatriks', (mtrx)=>{
        baris.value = mtrx.length;
        kolom.value = mtrx[0].length;
        setTimeout(()=>{
          matriks.value = mtrx;
          dialogLoadMatriks.value = false;
          toast("Matriks berhasil dimuat")
        },500)
      })
      const dialogLoadMatriks = ref(false);
      const dialogSave = ref(false);
      const namaMatriks = ref('');
      const saveMatriksDialog = () =>{
        namaMatriks.value = '';
        dialogSave.value = true;
      }
      const simpanMatriks = () => {
        if(namaMatriks.value==''){
          toast('Nama Matriks tidak boleh kosong')
          return;
        }
        let getSavedMatriks = localStorage.getItem('saved_matriks_kelompok_olaf');
        if(getSavedMatriks === null || typeof getSavedMatriks === 'undefined'){
          getSavedMatriks = '[]';
        }
        let savedMatriks = JSON.parse(getSavedMatriks);
        savedMatriks.push({
          nama: namaMatriks.value,
          matriks: matriks.value,
          jenis: 'saved',
          tanggal: dayjs().locale('id').format('[Disimpan pada:] DD MMMM YYYY HH:mm:ss')
        })
        localStorage.setItem('saved_matriks_kelompok_olaf', JSON.stringify(savedMatriks));
        namaMatriks.value = '';
        dialogSave.value = false;
        toast('Berhasil menyimpan matriks');
        emitter.emit('loadMatriks')
      }

      const matriks = ref([]);
      const isConstructing = ref(null)
      onMounted(()=>{

        isConstructing.value = true;
        createMatriks();
        generateRandomMatriks();
        isConstructing.value = false;

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
        baris_cost,
        kolom_cost,
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
        generateRandomMatriks,
        dialogLoadMatriks,
        saveMatriksDialog,
        dialogSave,
        namaMatriks,
        simpanMatriks
      }
    }
  }
  </script>

<style scoped>
@import '../assets/gaya.css';
</style>