import 'vuetify/styles' // Global CSS has to be imported
import { createApp } from 'vue'
import { createVuetify } from 'vuetify'
import App from './App.vue'
import Toast from "vue-toastification";
// Import the CSS or use your own!
import "vue-toastification/dist/index.css";

import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@fortawesome/fontawesome-free/css/all.min.css'

import mitt from 'mitt';                  // Import mitt
const emitter = mitt();  

const app = createApp(App)
const vuetify = createVuetify({
  components,
  directives,
})

app.use(vuetify);
app.use(Toast, {
  timeout: 4000
});
app.provide('emitter', emitter);  
app.mount('#app')