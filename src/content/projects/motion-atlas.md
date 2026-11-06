---
title: "Motion Atlas"
year: "2024"
category: "Open Source Library"
role: "Maintainer"
cover: "/covers/atlas.svg"
---

## 概述与灵感

一套可复用的缓动与编排集合：60 组经过实机调校的运动曲线，以及把它们组合成「一段动效」的编排器。

它解决的是一个很具体的问题 —— 每次做新项目，都要重新调一遍「这个弹窗该多快」。

## 核心设计与技术亮点

### 曲线不是数字，是手感

每组曲线都标注了适用场景（进场 / 退场 / 强调 / 转场）与建议时长，避免只给一条贝塞尔却不知道怎么用。

```ts
import { atlas } from "motion-atlas";

const enter = atlas.presets.enter.soft; // dur 0.42 · ease [0.22, 1, 0.36, 1]
element.animate(keyframes, enter);
```

### 编排器

把多个元素的动效按时间轴排列，支持相对延迟与交错，导出的是一段可读的配置而不是黑盒代码。

- **零依赖**：核心只有 4KB，框架适配层单独按需引入。
- **可预览**：官网上的每条曲线都可以拖时间轴看慢放。

> "Motion is the texture of an interface."

## 交互细节展示

![曲线预览](/covers/atlas.svg)

## 反思

最初我想做「万能动效引擎」，最后发现最有价值的是**那份被调好的默认值**。库只是载体，手感才是产品。
