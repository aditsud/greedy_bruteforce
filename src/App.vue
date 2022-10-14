<template>
  <v-app>
    <v-main>
      <div class="text-center mt-10 mb-5 font-weight-bold" style="color: #2E9AF4">ALAT PENGHITUNG MINIMUM TRANSPORTATION COST BY OLAF</div>
      <Matriks></Matriks>
    </v-main>
  </v-app>
</template>

<script>

import Matriks from './components/Matriks.vue'
export default {
  name: 'App',

  components: {
    Matriks
  },

  data: () => ({
    //
  }),
}
</script>
