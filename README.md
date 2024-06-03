# 时间轴

## Project setup
```
yarn install
```

### Compiles and hot-reloads for development
```
yarn serve
```

### Compiles and minifies for production
```
yarn build
```

### Lints and fixes files
```
yarn lint
```

### Document
See [详细使用文档](https://blog.csdn.net/z_blackbear/article/details/139357133?spm=1001.2014.3001.5501).

## 说明

### 属性

#### timeSegmentsData 时间范围片段数据，类型：Array[object]
```javascript
// 基本结构如下：
[{
  id,
  beginTime,          // 片段开始时间，时间戳，单位毫秒
  finishTime,         // 片段结束时间，时间戳，单位毫秒
  active,             // 是否选中状态
  lineWidth,          // 片段边框的线宽
  y,                  // 片段在canvas上距离顶部距离
  h,                  // 片段在canvas上的高度
  bgColor,            // 片段背景颜色
  borderColor,        // 片段边框颜色
  bgColorActive,      // 片段选中状态背景颜色
  borderColorActive,  // 片段选中状态边框颜色
  ...
}]
```
#### gridStyles 时间刻度样式 Object

```javascript
// 支持属性：
{
  lineColor,  // 刻度线条颜色
  lineWidth,  // 刻度线条宽度
  lineHeight  // 刻度线条高度
  color,      // 刻度上时间的文字颜色
  dateColor,  // 刻度上的日期文字颜色
  bgColor,    // 刻度条背景颜色
  bgHeight,   // 刻度条背景高度
}
```
#### hoverStyles 鼠标滑过的时间指示器 Object

```javascript
// 支持属性：
{
  lineColor,  // 刻度线条颜色
  lineWidth,  // 刻度线条宽度
  lineHeight  // 刻度线条高度
  color,      // 刻度上时间的文字颜色
}
```

#### isLimit 是否限制时间范围 Boolean 
* 该属性必须与 dateRange 配合

#### dateRange 限制时间范围 Array[string]
* 该属性必须与 isLimit 配合
* 时间范围的日期不能与date冲突，
  如：date是2024-5-31, 时间范围的日期必须是在31日内的时间
* 时间范围格式："YYYY-MM-DD HH:mm:ss"
* 例如：['2024-5-31 00:00:00', '2024-5-31 23:59:59']

#### date 用于确定时间轴展示哪一天 String
* 该属性不能携带时间："YYYY-MM-DD"
* 时间范围的日期不能与date冲突，
  如：date是2024-5-31, 时间范围的日期必须是在31日内的时
