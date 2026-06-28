---
name: 自由时间指南灯 · 设计系统
alias: freedom-time-guide-design
summary: 纸张黄东方简约 · 全季酒店式克制 · 仪式服从数据

# ===========================================
# 设计原则(Prose > Tokens)
# ===========================================

## Overview(品牌与气质)

**核心意象**:一盏放在木桌上的纸灯笼。灯光是暖黄的,但周围是克制的。
不是深夜的天空,不是高对比的极简主义,而是"在安静的房间里看一眼自己的进度"。

**灵感锚点**(供 agent 校准用):
- 全季酒店 4.0 版的纸质手册 · 大面积留白 + 衬线小标题
- 日本 midori 笔记本的纸张黄与橄榄绿点缀
- MUJI 无印良品价签的克制感 · 没有阴影,只有线条和留白
- 故宫日历的"页眉/页脚/正文"三段式层级
- Kindle 移动端的"目标感 + 静谧感"
- Apple Health 移动端的"大数字 + 微妙动画"

**主受众**:在通勤路上用手机看一眼自己今天花了多少、又买到多少天自由的年轻人。
他们不在乎精致,只在乎"信息清晰、交互不烦、看着不焦虑"。

**一个强调色**:宣纸金 #B6822C(收入 / 点亮)。其他都是中性色。
月光 #6B7E96(资产)是一个对称的冷色强调,不要再多加。

**不做的事(Don'ts)**:
- ❌ 不做紫色 / 蓝色渐变(典型 AI 滑点)
- ❌ 不做阴影卡片 + 圆角的组合(那是 SaaS 模板)
- ❌ 不做emoji + 大色块(那是消费品 App)
- ❌ 不做 "success / warning / danger" 三色信号灯(那是工程师语言)
- ❌ 不做 Toast / Snackbar(用底部 Sheet,更克制)
- ❌ 不做 Modal 弹窗(用页面内 inline 编辑)
- ❌ 不做"成就解锁""连击天数"等游戏化元素(违反产品理念)

---

## Colors(色板)

```yaml
colors:
  # 背景(纸张黄系)
  paper:      "#F5F2E8"   # 主背景 · 桌面的暖光
  paper-card: "#FBF9F1"   # 卡片底 · 略微提亮的纸
  paper-deep: "#EDE7D6"   # 边框 / 浅色 hairline
  paper-200:  "#E2D9BF"   # 次级底
  paper-300:  "#C9BD9C"   # 分隔线

  # 文字(深墨)
  ink-strong: "#241F14"   # 主文字
  ink-mid:    "#5A503C"   # 次文字
  ink-soft:   "#7A6F58"   # 辅助文字
  ink-faint:  "#A89B7A"   # 占位 / 禁用

  # 强调色(只有两个)
  ember:      "#B6822C"   # 宣纸金 · 收入 / 点亮 / 主按钮
  ember-soft: "#E8B960"   # 暖光 · 高亮 hover
  ember-deep: "#8E6420"   # 暗调 · 已完成

  moon:       "#6B7E96"   # 月光 · 资产 / 支出 / 冷静提示
  moon-soft:  "#9FB1C4"

  # 边界
  hairline:   "rgba(60, 50, 30, 0.08)"
```

**色板使用规则**:
- 90% 屏幕面积是 `paper` 系
- 文字永远是 `ink` 系(从不混用强调色做正文)
- 强调色只在以下场景出现:**金额 + 收入标识 + 主 CTA + 关键状态变化**
- 月光色只在**资产相关 + 支出标识**出现,不能用错

---

## Typography(字体)

```yaml
typography:
  hero:           { fontFamily: "Noto Serif SC", fontWeight: 500, fontSize: 40, lineHeight: 1.15, letterSpacing: 0 }
  h1:             { fontFamily: "Noto Serif SC", fontWeight: 500, fontSize: 28, lineHeight: 1.2 }
  h2:             { fontFamily: "Noto Serif SC", fontWeight: 500, fontSize: 22, lineHeight: 1.3 }
  body:           { fontFamily: "Noto Sans SC",  fontWeight: 400, fontSize: 15, lineHeight: 1.6 }
  body-strong:    { fontFamily: "Noto Sans SC",  fontWeight: 500, fontSize: 15, lineHeight: 1.6 }
  caption:        { fontFamily: "Noto Sans SC",  fontWeight: 400, fontSize: 13, lineHeight: 1.5 }
  label:          { fontFamily: "Noto Sans SC",  fontWeight: 500, fontSize: 11, lineHeight: 1.3, letterSpacing: 1.5, textTransform: "uppercase" }
  numeric:        { fontFamily: "JetBrains Mono", fontWeight: 500, fontSize: 32, lineHeight: 1.1, fontVariantNumeric: "tabular-nums" }
```

**字号梯度(移动优先)**:
- 启动屏 Hero:40-48px(serif,只在"已买自由 XXX 天"那一个数字)
- 标题:22-28px(serif,页面顶部)
- 数字:24-32px(mono,价格 / 数量)
- 正文:15-16px(sans,阅读舒适)
- 辅助:13px(sans,元信息)
- 标签:11px(tracked uppercase,极少用,只用于"自由天数 / 平均日花销"等小标签)

**绝不**:
- ❌ 不用 Inter / Roboto / Arial(通用 AI 字体)
- ❌ 不用 emoji(违反气质)
- ❌ 不用全大写正文(只在标签用)

---

## Layout & Spacing(布局与间距)

```yaml
spacing:
  page-mobile-x:  16      # 移动端页面水平 padding
  page-desktop-x: 40      # 桌面端
  section-gap:    24      # 区段间距
  card-pad:       20      # 卡片内 padding
  field-gap:      16      # 表单字段间距
  hairline:       1       # 分隔线宽度

rounded:
  card:           16      # 卡片圆角
  button:         10      # 按钮
  chip:           999     # 徽章
  sheet-top:      24      # 底部 Sheet 顶部圆角
```

**移动端布局铁律**:
1. **单列堆叠**——移动端绝不做多列 grid
2. **首屏只放一个 hero 数字**——"已买自由 XXX 天",其他都向下折叠
3. **触控目标 ≥ 44x44**——iOS HIG / Android Material 通用
4. **底部固定主 CTA**——录入、确认等关键按钮固定在视口底部
5. **FAB 只在 Dashboard**——其他地方不重复出现"记一笔"按钮
6. **页面顶部有 Back 或关闭**——不允许只靠 Tab 返回

**桌面端布局**:
- 侧边栏 220px · 主内容 max-width 1180px · 居中
- 多列 grid 用 12-column 系统
- 卡片可以更宽,信息密度更高

---

## Elevation & Depth(阴影)

**几乎不用阴影**。纸张黄主题靠**颜色 + hairline** 区分层次,不用阴影做悬浮感。

```yaml
shadow:
  none:     "none"
  hairline: "inset 0 -1px 0 rgba(60, 50, 30, 0.06)"  # 卡片底部细线
  subtle:   "0 1px 0 rgba(60, 50, 30, 0.04), 0 8px 24px rgba(60, 50, 30, 0.05)"  # 仅用于浮动 Sheet
```

**绝不**:
- ❌ 不用 Material Design 那种深阴影
- ❌ 不用渐变阴影
- ❌ 不用 box-shadow 做"发光"效果(光感靠纯色 + animation 实现)

---

## Shapes(形状)

- **圆角**:卡片 16px / 按钮 10px / 输入框 10px / Chip 999
- **方格**:1:1,2px gap,移动端用 4-6px 边长
- **进度条**:高 6px,圆角 999
- **FAB**:圆形 56px,放在 Dashboard 右下,距离底部 80px(避开 tab bar)

---

## Components(组件规范)

```yaml
components:
  button-primary:
    backgroundColor: "{colors.ink-strong}"
    textColor:       "{colors.paper}"
    padding:         "14px 18px"  # 移动端
    minHeight:       44
    rounded:         10
    fontWeight:      500

  button-ember:
    backgroundColor: "{colors.ember}"
    textColor:       "#FFFFFF"
    padding:         "14px 18px"
    minHeight:       44
    rounded:         10

  input-field:
    backgroundColor: "{colors.paper-card}"
    border:          "1px solid {colors.hairline}"
    padding:         "12px 14px"
    minHeight:       48
    rounded:         10
    fontSize:        16  # 防 iOS 自动缩放
    focused:         { borderColor: "{colors.ember}", boxShadow: "0 0 0 3px rgba(232,185,96,0.18)" }

  card:
    backgroundColor: "{colors.paper-card}"
    border:          "1px solid {colors.hairline}"
    padding:         20
    rounded:         16

  bottom-sheet:
    backgroundColor: "{colors.paper}"
    rounded:         "{rounded.sheet-top} {rounded.sheet-top} 0 0"
    padding:         "20px 16px"
    maxHeight:       "85vh"
    handle:          { width: 36, height: 4, backgroundColor: "rgba(60,50,30,0.2)", rounded: 999 }

  segment-toggle:
    height:          44
    padding:         "0 16px"
    rounded:         10
    active-ember:    { color: "{colors.ember}", backgroundColor: "{colors.paper-card}" }
    active-moon:     { color: "{colors.moon}",  backgroundColor: "{colors.paper-card}" }

  empty-state:
    iconSize:        32
    iconColor:       "{colors.ink-faint}"
    textColor:       "{colors.ink-soft}"
    backgroundColor: "transparent"  # 不用卡片
```

---

## Motion(动效)

```yaml
motion:
  fast:      150     # 状态变化、按钮反馈
  base:      240     # 卡片切换、Sheet 滑入
  slow:      400     # 数字变化、强调仪式
  ignite:    1100    # 方格点亮
  extinguish: 1400   # 方格熄灭

easing:
  standard:  cubic-bezier(0.32, 0.72, 0, 1)  # 偏 iOS 风格
  ignite:    cubic-bezier(0.16, 1, 0.3, 1)
```

**动效铁律**:
1. **不要庆祝型动画**(不要 confetti、不要闪光特效、不要 "太棒了!" 弹窗)
2. **仪式型动画有节制**——方格点亮用 ease-out,总时长 ≤ 2s
3. **状态变化用 crossfade**——数字 +1 / -1 用 fade,不用 slide
4. **底部 Sheet 用 spring 曲线**——自然减速
5. **prefers-reduced-motion 必须尊重**——所有动画降级为 0ms

---

## Interaction Patterns(交互模式)

### 输入
- **金额输入**自动 focus,数字键盘,带 +/- 快捷按钮
- **日期**用原生 picker(不自定义)
- **类别**用 chip 选择(可多选),不用下拉
- **保存按钮固定底部**,始终在视口内

### 反馈
- **成功反馈**用底部 Sheet 滑入(不是 Toast)
- **删除**用 swipe-to-delete,误操作可撤销
- **错误**用 inline 文字 + 浅边框,不用红色 alert

### 导航
- **主导航**:底部 5 个 tab(Dashboard / 方格 / 记一笔 / 规划 / 我的)
- **次级入口**:「我的」页收纳(目标 / 设置 / 导入导出 / 帮助)
- **深链接**:每个页面都有明确的 title + 顶部"返回"

### 触控
- **所有可点击元素 ≥ 44x44**
- **滑动操作**:列表项左滑删除 / 右滑标记
- **下拉刷新**:Dashboard / 交易页支持
- **长按**:Grid 页面长按格子查看详情

---

## Do's and Don'ts 速查

| ✅ Do | ❌ Don't |
|------|----------|
| 大数字用 serif/mono | 用 Inter / Roboto |
| 强调色克制 | 紫色蓝色渐变 |
| 底部 Sheet 反馈 | Toast 通知 |
| 单列堆叠布局 | 移动端多列 grid |
| hairline 区分层次 | 阴影卡片 |
| 数字用 JetBrains Mono | 数字用 sans-serif |
| inline 编辑 | Modal 弹窗 |
| 仪式感动画 < 2s | confetti / 闪屏 |
| 触控目标 ≥ 44x44 | 细小的点击区 |
| 数据驱动 UI | 装饰性插画 |
