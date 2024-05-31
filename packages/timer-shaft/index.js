import timer from './index.vue'
// 为组件添加 install 方法，用于按需引入
timer.install = function (Vue) {
  Vue.component(timer.name, timer)
}
export default timer;