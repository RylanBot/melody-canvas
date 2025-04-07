# <img src="./public/image/favicon.png" width="35"> Melody Canvas

English | [简体中文](./README-CN.md) 

## 🌷 Preview
[![Live Demo](https://img.shields.io/badge/Live%20Demo-Click%20to%20view-mediumaquamarine?style=for-the-badge&logo=vercel)](https://melody-workshop.rylan.cn/)

### 🌎 How to Use
https://github.com/user-attachments/assets/5fa03e28-d6c8-4c0c-a74f-3bdb902be4b5

(You can skip to `00:25` in the video to see the final creation)

## 🔥 Features

### 💕 Audio Visualization
- Built on the `Web Audio API` with self-designed audio analysis algorithms
- Support adding various types of elements with flexible options

### 💕 Canvas Editing
- Powered by the [FabricJS](https://github.com/fabricjs/fabric.js/) library for a draggable canvas
- Support adding images and text for artistic compositions

### 💕 Video Export
- Powered by the [WebAV](https://github.com/WebAV-Tech/WebAV), a library built on the `WebCodecs API`, to process videos directly in the browser
- Support adjusting other content while a video is rendering

## 🧙🏻 For Developers

<img src="https://img.shields.io/badge/node-20.x-green" alt="node version"/> <img src="https://img.shields.io/badge/pnpm-10.x-yellow" alt="pnpm version"/>

If you are familiar with the Web frontend technologies and are interested in source code, you can run this program using the following commands:

```sh
npm install # pnpm install
npm run dev
```

I recommend you read reading the article ["Audio Visualization: Sampling, Frequency and Fourier Transform"](https://cjting.me/2021/08/07/fourier-transform-and-audio-visualization/) first. Then, explore the source code of [`FrequencyAnalyzer`](./src/visualizers/core/FrequencyAnalyzer.ts) in this project to better understand the core logic behind it.

If you'd like to add more visualization effects, you can refer to the source code in [`visualizers/builder`](./src/visualizers/builder), and follow these steps:
- Create a new folder called `YourEffect` under this path
- Add two files `index.ts` and `Svg.tsx`
- Implement your custom feature