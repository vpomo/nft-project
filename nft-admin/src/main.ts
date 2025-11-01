import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import { useConfirm } from './composables/useConfirm'

import './assets/main.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(vuetify)

const confirm = useConfirm()
app.provide('confirm', confirm)

app.mount('#app')
