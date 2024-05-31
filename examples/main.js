import Vue from 'vue'
import App from './App.vue'

// import TimerShaft from '../packages'
import TimerShaft from '../node_modules/c-time-shaft/lib/c-time-shaft.umd'

Vue.config.productionTip = false

Vue.use(TimerShaft)

new Vue({
  render: h => h(App)
}).$mount('#app')
