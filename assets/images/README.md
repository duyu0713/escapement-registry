# 正式图片资源

所有原图均保留原始文件名和内容，路径集中在 js/config.js 的 assets。

- 牌背.png：主页展示及翻牌卡背，2244×3425。
- ESP-ORG-2.png：卡面顶部镇徽。
- ESP-HRT-2.png：Roswyn。
- ESP-SPD-2.png：Vesper。
- ESP-CLR-2.png：Cloverden。
- ESP-DIA-2.png：Diamora。
- ESPT-2.png：仅已觉醒时额外显示。

所有图片使用 contain，透明背景保留。卡背成功加载后移除占位及 CSS 边框；失败则显示原占位卡背。区域纹章失败时回退到对应花色。
四区视觉尺寸参数位于 css/style.css 的 --emblem-size。
