---
name: I wanna go to China
description: 悬浮群岛 · 实景探索与旅行规划
colors:
  forest: "#12332b"
  forest-panel: "#173c30"
  forest-field: "#183b2f"
  forest-raised: "#214836"
  cream: "#efeedf"
  card: "#fafbf3"
  leaf: "#b8db9b"
  ink: "#173c2e"
  muted-ink: "#50694e"
  focus: "#88b76c"
typography:
  display:
    fontFamily: "ChinaJourney, Noto Serif CJK SC, serif"
    fontSize: "clamp(46px, 5.8vw, 88px)"
    fontWeight: 400
    lineHeight: 1.26
    letterSpacing: "0"
  headline:
    fontFamily: "ChinaJourney, Noto Serif CJK SC, serif"
    fontSize: "32px"
    fontWeight: 400
  introduction:
    fontFamily: "system-ui, sans-serif"
    fontSize: "14px"
    lineHeight: 1.9
  control:
    fontSize: "12px"
rounded:
  card: "16px"
  panel: "24px"
  directory: "48px"
  directory-mobile: "32px"
  capsule: "999px"
spacing:
  tight: "8px"
  control: "12px"
  comfortable: "20px"
  panel: "24px"
  section: "40px"
components:
  button-primary:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.ink}"
    rounded: "{rounded.capsule}"
    padding: "12px 14px 12px 24px"
  directory-card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
  budget-field:
    backgroundColor: "{colors.forest-field}"
    textColor: "#eef1df"
  navigation:
    backgroundColor: "{colors.cream}"
    rounded: "{rounded.capsule}"
    padding: "7px"
---

# Design System: I wanna go to China

## Overview

**Creative North Star: "悬浮群岛"**

真实风景承载探索入口，森林绿底色与浅色目录形成清晰的浏览层次。圆润的独立控件与照片的空间感提供灵动体验；查攻略和计算预算仍使用明确的列表、表单与数字。

本系统来自用户选定的新版首页与目的地探索。其他页面统一了导航、部分表面、控件和消费统计配色，仍保留既有工具布局，不代表所有旧样式已重构。

**Key Characteristics:**
- 实景照片与可访问的来源链接。
- 深绿、浅米色与叶绿的区域分工。
- 悬浮照片、胶囊控件和连续目录。
- 动效可关闭，预算和筛选不依赖动效。

## Colors

森林绿用于外层与规划环境，浅米色用于目的地目录，叶绿强调行动与选中状态。

- forest：页面背景。
- forest-panel：攻略面板。
- forest-field / forest-raised：预算输入与统计。
- cream / card：目录底色与卡片。
- ink / muted-ink：浅色区域正文与辅助文本。
- focus：键盘焦点，不与选择状态混用。

## Typography

ChinaJourney 是自托管 Noto Serif CJK SC Regular 子集，采用 SIL OFL 1.1；来源和生成方式见 assets/fonts/README.md。字体仅包含当前页面文案，缺字由后备字体补齐。更改展示文案时应重做子集。

大标题采用 46–88px 流体字号；非中日韩语言用 40–68px，手机进一步缩小。目录标题 32px、手机 26–28px。正文保留工具原有字体栈，首页引言为 14px/1.9 system-ui；新控件与图注以 12px 为主要字号。

## Layout

首页最大宽度 1700px；目录工作区最大宽度 1600px。桌面目录为卡片网格与右侧攻略面板，手机切换到底部可展开面板。1200px 导航换行；800px 下采用纵向首页、横向可滚动导航及双列目录；420px 下搜索独占一行。目录卡片在 1650px 以上增为四列。

地区筛选保留全部大区。省、市、县逐级导航，资料空缺如实呈现；布局不能要求预先下载全国完整数据。

## Elevation & Depth

照片通过旋转、尺寸差和偏移阴影形成层次。卡片阴影为 `0 7px 16px #213d2810`；悬停为 `0 18px 28px #213d2820`。照片使用 `drop-shadow(0 22px 23px #041b2540)`。文字胶囊的局部模糊是为了隔开复杂照片，不作为全屏装饰。

照片悬停或聚焦可上浮 12px 并回正，750ms、`cubic-bezier(.16,1,.3,1)`。地区卡片使用有数量上限的短入场动效。系统减少动态效果设置和用户开关均优先于动效。

## Shapes

控件采用胶囊；内容卡片 16px，攻略面板 24px；目录顶角桌面 48px、手机 32px。首页照片使用不同圆角比例形成独立岛屿，属于照片容器，不表示真实地理轮廓。

## Components

- **主行动**：浅米色胶囊、深绿文字，内含叶绿色箭头圆点；全站焦点环 3px、外移 4px。
- **次行动**：深绿底和浅色文字；不改变原有预算事件。
- **大区筛选**：未选为透明底加绿边，选中为实心深绿、白字；最小高度 44px。
- **目的地卡片**：照片、地点图注、名称和真实资料数量；不得以假照片替代缺图。
- **搜索**：浅色目录中使用近白底、深绿文字与胶囊形边框；预算输入保持矩形圆角和深绿底。
- **导航**：浅色胶囊容器，深绿活动项；手机可横向滚动，所有入口保留。
- **照片来源**：来源链接位于照片外侧，可独立点击，不被相邻照片遮挡。翻译同步更新按钮可访问名称。

## Do's and Don'ts

- Do 保留真实资料、图片出处、未知费用和本地存储语义。
- Do 在中英文、长译文、手机与宽屏验证布局。
- Do 用系统减少动态效果设置停用运动。
- Don't 将照片裁剪形状解释为行政区地图。
- Don't 用装饰性编号或重复的前置标签增加视觉层级。
- Don't 将遗留工具中的细小文本、字符箭头或残留旧配色当作新设计规范。
