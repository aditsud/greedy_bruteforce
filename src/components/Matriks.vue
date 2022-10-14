<template>
  <v-container>
    <v-row>
      <v-col cols="6">
        <v-text-field type="number" label="Baris" v-model="baris"></v-text-field>
      </v-col>
      <v-col cols="6">
        <v-text-field type="number" label="Kolom" v-model="kolom"></v-text-field>
      </v-col>
    </v-row>
    <v-row class="text-center">
      <v-col cols="12">
        <v-table v-if="isConstructing === false" theme="ligth"  style="border-left: 1px solid #9E9E9E; border-top: 1px solid #9E9E9E;">
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
                <v-text-field v-if="i== baris && j==kolom" type="number" readonly class="matriks" v-model="matriks[i-1][j-1]" @keyup="preventEmpty(i,j)" :style="sumDemSup(supply) != sumDemSup(demand) ? 'background-color: #c44d56; color: white' : ''"></v-text-field>
                <v-text-field v-else type="number" class="matriks" clearable clear-icon="fas fa-circle-xmark" v-model="matriks[i-1][j-1]" @keyup="preventEmpty(i,j)"></v-text-field>
              </td>
              
              
            </tr>
          </tbody>
        </v-table>
      </v-col>
    </v-row>
    <v-row class="text-center mt-5">
      <v-col cols="12">
        <v-btn color="blue" block :disabled="isDisabled" @click="hitungMatriks()">
          Hitung Optimum Cost
        </v-btn>
      </v-col>
    </v-row>
    <loading :active="isLoading" 
        :can-cancel="false" 
        :is-full-page="true"></loading>
  </v-container>
  <Result :dialog="dialog" :hasil="hasil_vogels_approximation">
    <template #footer>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="blue"
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
import { onMounted, ref, watch, watchEffect } from 'vue';
import logo from '../assets/logo.svg'
import Loading from 'vue3-loading-overlay';
import 'vue3-loading-overlay/dist/vue3-loading-overlay.css';
import { hitungMatriks as hitung } from '../greedy_plugin/greedy'
import Result from './Result.vue'
  export default{
    components:{
      Loading,
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
        // matriks.value = [
        //   [2,3,5,1,8],
        //   [7,3,5,1,10],
        //   [4,1,7,2,20],
        //   [6,8,9,15,38]
        // ]

        // another matrix
        baris.value = 4;
        kolom.value = 6;
        setTimeout(()=>{
          matriks.value = [
          [4,3,2,1,4,9],
          [2,2,8,2,1,9],
          [2,1,2,3,3,8],
          [10,5,6,3,2,26]
        ]
        },200)
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
            if(matriks.value[i][j] !== 0 && sumDemSup(supply.value) == sumDemSup(demand.value))
              return false
          }
        }
        return true
      })

      const isLoading = ref(false)
      const dialog = ref(false)
      const hasil_vogels_approximation = ref(null);
      const hitungMatriks = () => {
        isLoading.value = true
        let mtrx = matriks.value;
        hasil_vogels_approximation.value = hitung(mtrx);
        console.log(hasil_vogels_approximation.value);
        dialog.value = true;
        isLoading.value = false;
      }
      
      return{
        logo,
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
        hasil_vogels_approximation
      }
    }
  }
  </script>

  <style scoped>
    .matriks :deep(.v-input__details){
      display: none;
    }
  </style>