<!--
  author: USERNAME
  created: 2024年05月29日
  description: 
-->
<template>
  <div 
    class="canvas-contain"
    ref="canvasContain"
    @mousedown="onMousedown"
    @mouseup="onMouseup"
    @mouseout="onMouseout"
    @mousemove="onMousemove"
    @mousewheel="onMousewheel"
  >
    <canvas ref="canvas"></canvas>
    <canvas class="canvas-line" ref="canvasLine"></canvas>
  </div>
</template>

<script>
import moment from 'moment'

export default {
  name: "VTimeShaft",
  props: {
    timeSegmentsData: {
      type: Array,
      default: () => ([])
    },
    gridStyles: {
      type: Object,
      default: () => ({})
    },
    hoverStyles: {
      type: Object,
      default: () => ({})
    },
    isLimit: Boolean,
    date: {
      type: String,
      default: moment().format('YYYY-MM-DD')
    },
    dateRange: {
      type: Array,
      default: () => ([])
    }
  },
  // 定义属性
  data() {
    return {
      segmentBgColorActive: '#F90000',
      segmentBorderColorActive: '#840101',
      segmentBgColor: '#FB8989',
      segmentBorderColor: '#EB452C',
      isMouseDown: false,
      canvas: null,
      canvasLine: null,
      contain: null,
      ctx: null,
      ctxLine: null,
      width: 0,
      height: 0,
      mouseDownPx: 0,
      mouseMovePx: 0,
      mousedownCachStartTime: 0,
      timeScaleData: [],
      // 全部时间轴展示的时间小时数
      zoom: [0.1, 0.5, 1, 2, 6, 12, 24],
      zoom_hour_grid: [1/60, 1/60, 1/60, 1/30, 1/8, 1/4, 1/2],
      currentIndex: 6,
      startTime: 0,
      currentTime: '',
      one_hour_stamp: 60 * 60 * 1000,
      zoom_date_show_rule: [
        () => {// 全都显示
          return true
        },
        () => {// 全都显示
          return true
        },
        date => {// 每五分钟显示
          return date.getMinutes() % 5 === 0
        },
        date => {// 显示10、20、30...分钟数
          return date.getMinutes() % 10 === 0
        },
        date => {// 显示整点和半点小时
          return date.getMinutes() === 0 || date.getMinutes() === 30
        },
        date => {// 显示整点小时
          return date.getMinutes() === 0
        },
        date => {
          // 显示2、4、6...整点小时
          // return date.getHours() % 2 === 0 && date.getMinutes() === 0
          // 显示整点小时
          return date.getMinutes() === 0
        }
      ],
      // 时间范围数据
      timeSegments: [],
      timeGridStyle: {
        lineColor: '#ccc',
        color: '#ccc',
        dateColor: '#F4BF75',
        bgColor: '#ececec',
        bgHeight: 50,
        lineWidth: 1,
        lineHeight: 20
      },
      timeHoverStyle: {
        color: '#00f',
        lineWidth: 1,
        lineColor: '#00f',
        lineHeight: 30
      },
    }
  },
  // 计算属性，会监听依赖属性值随之变化
  computed: {
    gridStyle() {
      return Object.assign({}, this.timeGridStyle, this.gridStyles)
    },
    hoverStyle() {
      return Object.assign({}, this.timeHoverStyle, this.hoverStyles)
    },
  },
  // 监控data中的数据变化
  watch: {
    timeSegmentsData(val) {
      this.timeSegments = val;
      this.drawTimeSegments()
    },
    gridStyles() {
      this.draw()
    }
  },
  // 生命周期 - 创建完成（可以访问当前this实例）
  created() {
    const date = this.date + ' 00:00:00';
    this.startTime = new Date(date).getTime()
    
    if (this.timeSegmentsData.length) {
      this.timeSegments = this.timeSegmentsData
      return
    }
    // 初始化时间段数据
    this.initSegmentsData()
  },
  mounted() {
    this.init();
    window.addEventListener('resize', this.init)
  },
  // 方法集合
  methods: {
    init() {
      this.contain = this.$refs.canvasContain
      if (!this.contain) return
      this.canvas = this.$refs.canvas
      this.canvasLine = this.$refs.canvasLine
      let {width, height} = this.contain.getBoundingClientRect()
      Object.assign(this, {width, height})
      Object.assign(this.canvas, {width, height})
      Object.assign(this.canvasLine, {width, height})
      this.ctx = this.canvas.getContext('2d')
      this.ctxLine = this.canvasLine.getContext('2d')
      this.draw()
    },
    draw() {
      // 绘制时间轴背景
      this.drawGridBg()
      // 绘制时间轴
      this.drawTimeGrid()
      // 绘制时间段
      this.drawTimeSegments()
    },
    initSegmentsData() {
      this.timeSegments = [];
      for (let i = 0; i < 50; i++) {
        const finishTime = i !== 49 ? this.startTime + (60 * 1000 * (i + 1)) : this.zoom[this.currentIndex] * this.one_hour_stamp
        const segments = {
          id: `${100100 + i}`,
          beginTime: this.startTime + (10 * 1000) + (60 * 1000 * i),
          finishTime,
          active: i === 0,
          lineWidth: '2',
          y: 54,
          h: 42,
          bgColor: this.segmentBgColor,
          borderColor: this.segmentBorderColor,
          bgColorActive: this.segmentBgColorActive,
          borderColorActive: this.segmentBorderColorActive,
        }
        this.timeSegments.push(segments);
      }
    },
    // 画线段方法
    drawLine(ctx, x1, y1, x2, y2, lineWidth = 1, color = '#123456') {
      // 开始一段新路径
      ctx.beginPath()
      // 设置线段颜色
      ctx.strokeStyle = color
      // 设置线段宽度
      ctx.lineWidth = lineWidth
      // 将路径起点移到x1,y1
      ctx.moveTo(x1, y1)
      // 将路径移动到x2,y2
      ctx.lineTo(x2, y2)
      // 把路径画出来
      ctx.stroke()
    },
    drawTimeGrid() {
      // 一格多少毫秒，将每格代表的小时数转成毫秒数就可以了
      const currentZoomHour = this.zoom_hour_grid[this.currentIndex] * this.one_hour_stamp
      // 要画多少个格子
      const gridNum = this.zoom[this.currentIndex] / this.zoom_hour_grid[this.currentIndex];
      // 每个格子所占的宽度单位px
      const wPx = this.width / gridNum;

      // 时间偏移量
      const msOffset = currentZoomHour - (this.startTime % currentZoomHour)
      // 距离偏移量
      const pxOffset = (msOffset / currentZoomHour) * wPx;
      
      // 先画出格子
      for (let i = 0; i < gridNum; i++) {
        const x = i * wPx + pxOffset;
        const time = this.startTime + (currentZoomHour * i) + msOffset;
        const show = this.zoom_date_show_rule[this.currentIndex];
        let text = moment(time).format('HH:mm');
        let h = this.gridStyle.lineHeight;
        let lineWidth = this.gridStyle.lineWidth;
        let fillStyle = this.gridStyle.color;
        if (text === '00:00') {
          text = moment(time).format('MM-DD');
          fillStyle = this.gridStyle.dateColor;
        }
        if (show(new Date(time))) {
          // 画出时间
          this.ctx.fillStyle = fillStyle
          this.ctx.fillText(text, x - 14, h + 12)
        } else {
          h = lineWidth / 2;
        }
        // 画出刻度线
        this.drawLine(this.ctx, x, 0, x, h, lineWidth, this.gridStyle.lineColor)
      }
    },
    drawCurrentDate(x) {
      const h = this.hoverStyle.lineHeight;
      const lineWidth = this.hoverStyle.lineWidth;
      const text = moment(this.currentTime).format('YYYY-MM-DD HH:mm:ss')
      let tX = x - 20;
      // 处理时间指示器，时间文字 超出左侧边界 问题
      if (tX < 0) {
        tX = 0;
      }
      // 处理时间指示器，时间文字 超出右侧边界 问题
      if (tX + 100 > this.width) {
        tX = this.width - 100;
      }
      this.clearCanvas(this.ctxLine, this.width, this.height)
      this.drawLine(this.ctxLine, x, 0, x, h, lineWidth, this.hoverStyle.lineColor)
      this.ctxLine.fillStyle = this.hoverStyle.color
      this.ctxLine.fillText(text, tX, h + 12)
    },
    drawGridBg() {
      this.ctx.fillStyle = this.gridStyle.bgColor;
      this.ctx.fillRect(0, 0, this.width, this.gridStyle.bgHeight)
      this.ctx.fill();
    },
    drawTimeSegments(e) {
      if (e && this.isMouseDown) return;
      // 计算每一像素所占的时间，单位毫秒
      const pxPerMs = this.width / (this.zoom[this.currentIndex] * this.one_hour_stamp)
      this.timeSegments.forEach(t => {
        if (e) t.active = false;
        const isDraw = t.beginTime <= (this.zoom[this.currentIndex] * this.one_hour_stamp + this.startTime) && t.finishTime >= this.startTime
        if (isDraw) {
          let x = (t.beginTime - this.startTime) * pxPerMs;
          let w = (t.finishTime - t.beginTime) * pxPerMs
          if (x < 0) {
            x = 0;
            w = (t.finishTime - this.startTime) * pxPerMs
          }
          this.ctx.beginPath()
          this.ctx.rect(x, t.y, w, t.h)
          if (e && this.ctx.isPointInPath(e.offsetX, e.offsetY)) {
            t.active = true;
            this.$emit('update', t)
          }
          t.style = {
            bgColor: t.active ? t.bgColorActive : t.bgColor,
            borderColor: t.active ? t.borderColorActive: t.borderColor
          }
          this.ctx.fillStyle = t.style.bgColor
          this.ctx.strokeStyle = t.style.borderColor
          this.ctx.fill()
          this.ctx.stroke()
        }
      })
    },
    onMousemove(e) {
      const {left} = this.canvasLine.getBoundingClientRect()
      const x = e.clientX - left
      // 计算时间轴每一像素所占的毫秒数
      const pxPerMs = this.zoom[this.currentIndex] * this.one_hour_stamp / this.width
      // 记录鼠标移动过程中，x方向的距离
      this.mouseMovePx = x;
      // 鼠标拖动
      if (this.isMouseDown) {
        // 计算拖动的距离
        const diffX = x - this.mouseDownPx
        // 计算开始时间的偏移量
        this.startTime = this.mousedownCachStartTime - Math.round(diffX * pxPerMs)
        if (this.isLimit) {
          this.limitTimeRange()
        }
        // 重新绘制时间轴
        this.clearCanvas(this.ctx, this.width, this.height)
        this.draw()
      }

      // 鼠标移动 获取鼠标所在的时间
      this.currentTime = moment(this.startTime + x * pxPerMs).format('YYYY-MM-DD HH:mm:ss')
      // 鼠标移动 绘制时间指示器
      this.drawCurrentDate(x);
    },
    onMousedown(e) {
      const {left} = this.canvasLine.getBoundingClientRect();
      this.isMouseDown = true;
      this.mouseDownPx = e.clientX - left;
      this.mousedownCachStartTime = this.startTime;
    },
    onMouseup(e) {
      const {left} = this.canvasLine.getBoundingClientRect()
      const x = e.clientX - left
      const diffX = x - this.mouseDownPx;
      this.isMouseDown = false;
      this.mouseDownPx = 0;
      if (diffX === 0) {
        this.drawTimeSegments(e)
      }
    },
    onMousewheel(e) {
      e = e || window.event;
      let delta = Math.max(-1, Math.min(1, e.wheelDelta || -e.detail))
      if (delta < 0) {
        // 缩小
        if (this.currentIndex + 1 >= this.zoom.length - 1) {
          this.currentIndex = this.zoom.length - 1
        } else {
          this.currentIndex++
        }
      } else if (delta > 0) {
        // 放大
        if (this.currentIndex - 1 <= 0) {
          this.currentIndex = 0
        } else {
          this.currentIndex--
        }
      }
      this.clearCanvas(this.ctx, this.width, this.height);

      // mouseMovePx 重新计算起始时间点，根据当前距左侧的距离计算出
      // 计算出当前时间轴每一像素所占时间，单位毫秒
      const pxPerMs = (this.zoom[this.currentIndex] * this.one_hour_stamp) / this.width;
      this.startTime = new Date(this.currentTime).getTime() - pxPerMs * this.mouseMovePx
      
      // 重新计算起始时间点，当前时间-新的时间范围的一半
      // this.startTime = new Date(this.currentTime).getTime() - this.getTotalMs() / 2;
      if (this.currentIndex === this.zoom.length - 1) {
        this.startTime = new Date(moment(this.date).format('YYYY-MM-DD 00:00:00')).getTime();
      }
      if (this.isLimit) {
        this.limitTimeRange()
      }
      this.draw()
    },
    onMouseout(e) {
      this.isMouseDown = false;
      this.mouseDownPx = 0;
      this.clearCanvas(this.ctxLine, this.width, this.height)
    },
    limitTimeRange() {
      if (this.dateRange.length === 0) {
        return;
      }
      // --------------------------------- 限制时间轴范围 ---------------------------------------------
      // 如果拖动超出当前选择日期的时间, 禁止再次拖动
      const start = new Date(this.dateRange[0]).getTime();
      const end = new Date(this.dateRange[1]).getTime();
      // 一共可以绘制的格数，时间轴的时间范围小时数除以每格代表的小时数，24/0.5=48
      let gridNum = this.zoom[this.currentIndex] / this.zoom_hour_grid[this.currentIndex];

      // 一格多少毫秒，将每格代表的小时数转成毫秒数就可以了
      let msPerGrid = this.zoom_hour_grid[this.currentIndex] * this.one_hour_stamp;

      // 时间偏移量，初始时间除每格时间取余数，
      let msOffset = msPerGrid - (this.startTime % msPerGrid)
      // 距离偏移量，时间偏移量和每格时间比例乘每格像素
      let graduationTime = this.startTime + msOffset + (gridNum - 1) * msPerGrid;
      let endX = new Date(graduationTime).getTime();
      
      if (this.startTime <= start) {
        this.startTime = new Date(start).getTime()
      }
      if (endX >= end) {
        this.startTime = new Date(end).getTime() - this.getTotalMs();
      }
      // ----------------------------------- 限制时间轴范围 -------------------------------------------
    },
    getTotalMs() {
      return this.zoom[this.currentIndex] * this.one_hour_stamp
    },
    clearCanvas(ctx, w, h) {
      ctx.clearRect(0, 0, w, h)
    },
  },
  // 生命周期 - 挂载完成（可以访问DOM元素）
  // 生命周期 - 创建之前
  beforeCreate() {},
  // 生命周期 - 挂载之前
  beforeMount() {},
  // 生命周期 - 更新之前
  beforeUpdate() {},
  // 生命周期 - 更新之后
  updated() {}, 
  // 生命周期 - 销毁之前
  beforeDestroy() {
    window.removeEventListener('resize', this.init);
  }, 
  // 生命周期 - 销毁完成
  destroyed() {
  },
  // 如果页面有keep-alive缓存功能，这个函数会触发
  activated() {}, 
}
</script>
<style lang="less" scoped>
.canvas-contain {
  width: 100%;
  height: 100%;
  position: relative;
  .canvas-line {
    position: absolute;
    left: 0;
    top: 0;
  }
}
</style>