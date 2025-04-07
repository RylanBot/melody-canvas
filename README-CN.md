# <img src="./public/image/favicon.png" width="35"> Melody Canvas

[English](./README.md) | 简体中文 

## 🌷 效果预览
[![在线示例](https://img.shields.io/badge/在线示例-点击查看-mediumaquamarine?style=for-the-badge&logo=vercel)](https://melody-workshop.rylan.cn/)

### 🌎 操作指引
https://github.com/user-attachments/assets/5fa03e28-d6c8-4c0c-a74f-3bdb902be4b5

（可以直接跳转到视频的 `00:25` 观看最终的成品）


## 🔥 功能介绍

### 💕 音频可视化
- 基于 `Web Audio API`，实现音频分析算法
- 支持多种类型元素的创建，提供灵活的自定义选项

### 💕 画布编辑
- 使用 [FabricJS](https://github.com/fabricjs/fabric.js/) 库，实现可拖拽编辑器
- 支持图片和文本的添加，方便组合搭配

### 💕 视频导出
- 使用基于 `WebCodecs API` 的 [WebAV](https://github.com/WebAV-Tech/WebAV) 库，实现在纯浏览器环境下加工视频
- 支持视频在渲染的过程中，继续调整其它内容

## 🧙🏻 二次开发

<img src="https://img.shields.io/badge/node-20.x-green" alt="node version"/> <img src="https://img.shields.io/badge/pnpm-10.x-yellow" alt="yarn version"/>

如果你熟悉 Web 前端技术且对源码感兴趣，可以根据以下命令，在本地启动这个程序：

```sh
npm install # pnpm install
npm run dev
```

推荐你先阅读文章[《音频可视化：采样、频率和傅里叶变换》](https://cjting.me/2021/08/07/fourier-transform-and-audio-visualization/)，然后查看 [`FrequencyAnalyzer`](./src/visualizers/core/FrequencyAnalyzer.ts) 的源码，这样能更好理解项目背后的核心逻辑。

如果你想添加更多的可视化效果，可以参考 [`visualizers/builder`](./src/visualizers/builder) 下面的源码，并且：
- 在该路径下新建文件夹 `YourEffect`
- 加入两个文件 `index.ts` 和 `Svg.tsx`
- 实现自己的功能
