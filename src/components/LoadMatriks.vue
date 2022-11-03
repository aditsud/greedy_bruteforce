<template>
  <v-dialog v-model="dialog" scrollable class="dialogResult" transition="dialog-bottom-transition">
    <v-card>
      <v-card-text >
        
        <p class="text-justify text-body-2">
          Berikut adalah daftar matriks penting yang telah disediakan oleh kelompok kami untuk uji coba. 
          Selain itu, jika Anda melakukan penyimpanan matriks, maka matriks yang Anda simpan akan muncul juga pada daftar ini.
        </p>
        <v-list lines="two">
          <v-list-item
            v-for="matriks in list_matriks"
            :key="matriks.nama + '' + matriks.tanggal"
            link=""
            
          >
            <v-list-item-title @click="applyMatriks(matriks)">{{ matriks.nama }}</v-list-item-title>

            <v-list-item-subtitle @click="applyMatriks(matriks)">{{ matriks.tanggal }}</v-list-item-subtitle>

            <template v-slot:prepend>
              <v-avatar color="grey-lighten-1">
                <v-icon color="white">fa fa-table</v-icon>
              </v-avatar>
            </template>

            <template v-slot:append>
              <v-btn
                v-if="matriks.jenis!=='given'"
                @click="hapusMatriks(matriks)"
                color="grey-lighten-1"
                icon="fa-sharp fa-solid fa-xmark"
                variant="text"
              ></v-btn>
            </template>
          </v-list-item>
        </v-list>
      </v-card-text>
      <slot name="footer"></slot>
    </v-card>
    
  </v-dialog>

  <v-dialog v-model="dialogHapus" class="dialogHapus" transition="dialog-bottom-transition" :persistent="true">
    <v-card>
      <v-card-text >
        
        <p class="text-justify text-body-2">
          Apakah Anda yakin ingin menghapus matriks yang telah Anda simpan, yaitu matriks: {{matriksDipilih !== null ? matriksDipilih.nama : '-'}}
        </p>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="purple"
          flat
          @click="jadiHapus()"
        >
          Hapus
        </v-btn>
        <v-btn
          color="purple"
          flat
          @click="batalHapus()"
        >
          Batal
        </v-btn>
      </v-card-actions>
    </v-card>
    
  </v-dialog>
</template>

<script>
import { inject, onMounted, ref, toRef } from 'vue';
import { cloneObject } from '../greedy_plugin/utils';

export default{
  props: ["dialog"],
  setup(props){
    const dialog = toRef(props, 'dialog');
    const example_matriks = [
      {
        jenis: 'given',
        nama: 'Matriks dari Slide Greedy',
        tanggal: 'Matriks Contoh',
        matriks: [
          [2,3,5,1,8],
          [7,3,5,1,10],
          [4,1,7,2,20],
          [6,8,9,15,38]
        ]
      },
      {
        jenis: 'given',
        nama: 'Matriks soal UTS no 3',
        tanggal: 'Matriks Contoh',
        matriks: [
          [2,3,5,6,10],
          [3,2,4,5,10],
          [3,5,7,4,20],
          [10,10,10,10,40]
        ]
      }
    ];
    const emitter = inject('emitter');
    emitter.on('loadMatriks', () => loadSavedMatriks());
    
    const list_matriks = ref([]);
    const loadSavedMatriks = () => {
      let getSavedMatriks = localStorage.getItem('saved_matriks_kelompok_olaf');
      if(getSavedMatriks === null || typeof getSavedMatriks === 'undefined'){
        getSavedMatriks = '[]';
      }
      list_matriks.value = example_matriks.concat(JSON.parse(getSavedMatriks));
    }
    onMounted(()=>{
      loadSavedMatriks()
    })
    const dialogHapus = ref(false)
    const hapusMatriks = (matriks) => {
      matriksDipilih.value = matriks;
      dialogHapus.value = true;
    }
    const matriksDipilih = ref(null)
    const batalHapus = () =>{
      dialogHapus.value = false;
      matriksDipilih.value = null;
    }
    const jadiHapus = () => {
      // hapus dari local storage
      let getSavedMatriks = localStorage.getItem('saved_matriks_kelompok_olaf');
      if(getSavedMatriks === null || typeof getSavedMatriks === 'undefined'){
        getSavedMatriks = '[]';
      }
      let savedMatriks = JSON.parse(getSavedMatriks);
      for(let i=0; i<savedMatriks.length; i++){
        if(savedMatriks[i].nama == matriksDipilih.value.nama && savedMatriks[i].tanggal == matriksDipilih.value.tanggal){
          savedMatriks.splice(i,1);
          matriksDipilih.value = null;
          localStorage.setItem('saved_matriks_kelompok_olaf', JSON.stringify(savedMatriks));
          loadSavedMatriks();
          console.log('cek')
          break;
        }
      }
      
      dialogHapus.value = false;
    }
    const applyMatriks = (matriks) => {
      emitter.emit('applyMatriks', cloneObject(matriks.matriks));
    }
    return{
      dialog,
      list_matriks,
      hapusMatriks,
      dialogHapus,
      matriksDipilih,
      batalHapus,
      jadiHapus,
      applyMatriks
    }
  }
}
</script>

<style scoped>
@import '../assets/gaya.css'
</style>