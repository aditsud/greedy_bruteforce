<template>
  <v-app>
    <v-main>
      <div class="text-center mt-10 mb-10 font-weight-bold">
        <div class="post-container">                
            <div class="post-thumb"><img class="olafimage" :src="olafimage" /></div>
            <div class="post-content">
                <h3 class="post-title">Greedy - Brute Force</h3>
                <v-tooltip location="bottom">
                  <template v-slot:activator="{ props }">
                    <p v-bind="props" @click.stop>Kelompok Olaf</p>
                  </template>
                  Aditya Sudyana (23222063)<br/>
                  Ananda Sadam Firdaus (23222040)<br/>
                  Atikasari (23222049)<br/>
                  Lukman Eka Arifandhi (23222075)<br/>
                  Naufal Fahmi Zakiuddin (23222070)
                </v-tooltip>
                
          </div>
        </div>
      </div>
      <Matriks></Matriks>
    </v-main>
  </v-app>
</template>

<script>
import Matriks from './components/Matriks.vue'
import olafimage from './assets/olaf.png'
export default {
  name: 'App',

  components: {
    Matriks
  },

  setup(){
    return{
      olafimage
    }
  }
}
</script>

<style>
@import './assets/olaf.css';
</style>
