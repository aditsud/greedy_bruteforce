<template>
  <v-app>
    <v-main>
      <div class="text-center mt-10 mb-10 font-weight-bold">
        <div class="post-container">                
            <div class="post-thumb"><img class="olafimage" :src="olafimage" /></div>
            <div class="post-content">
                <h3 class="post-title">Greedy - Brute Force</h3>
                <p>Kelompok Olaf</p>
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
