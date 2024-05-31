<template>
  <div id="app">
    <div class="timer-shaft-content">
      <v-timer-shaft date="2024-05-29"></v-timer-shaft>
    </div>
    <div class="timer-shaft-content">
      <v-timer-shaft isLimit :date="date" :dateRange="dateRange"></v-timer-shaft>
    </div>
  </div>
</template>

<script>

export default {
  name: 'App',
  components: {},
  data() {
    return {
      date: '2024-05-31',
      dateRange: ['2024-05-31 00:00:00', '2024-05-31 23:59:59']
    }
  }
}
</script>

<style lang="less" scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
  .timer-shaft-content {
    height: 100px;
    border: 1px solid #c2cad4;
    // background: #123456;
  }
}
</style>
