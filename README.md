# Hugo Theme Lumin

一款现代化的 Hugo 博客主题，灵感来源于 onedayxyy.cn，具有优雅的暗色/亮色模式切换、丰富的侧边栏组件和多种特色页面。

## ✨ 特性

- 🌓 **暗色/亮色模式** - 支持自动切换和手动切换，默认亮色模式
- 📱 **响应式设计** - 完美适配桌面、平板和手机
- 🎨 **现代化 UI** - 简洁优雅的设计风格
- 📐 **可配置侧边栏** - 支持左侧或右侧布局
- 🔍 **内置搜索** - 客户端搜索功能
- 📅 **日历组件** - 显示当前月份和倒计时
- 📝 **多种内容类型** - 博客、相册、电影、音乐、日记、专题
- 💬 **评论系统** - 支持多种评论系统
- 💰 **打赏功能** - 微信/支付宝打赏
- 🔗 **友链页面** - 友情链接管理
- 📊 **站点统计** - 文章数、访客数统计
- 🏷️ **标签云** - 文章标签可视化
- 📂 **归档页面** - 按时间归档文章
- 🎬 **404 页面** - 自定义 404 页面
- 🚀 **返回顶部** - 平滑滚动返回顶部

## 📦 安装

### 方法一：Git Clone

```bash
cd your-hugo-site
git clone https://github.com/yourname/hugo-theme-lumin.git themes/lumin
```

### 方法二：Git Submodule

```bash
cd your-hugo-site
git submodule add https://github.com/yourname/hugo-theme-lumin.git themes/lumin
```

### 方法三：Hugo Modules

```bash
hugo mod init github.com/yourname/your-site
hugo mod get github.com/yourname/hugo-theme-lumin
```

## ⚙️ 配置

复制 `exampleSite` 目录下的配置文件到你的站点根目录，然后根据需要修改。

### 基本配置

```toml
baseURL = "https://yourdomain.com"
languageCode = "zh-cn"
title = "我的博客"
theme = "lumin"

[params]
  author = "作者名"
  description = "博客描述"
  defaultTheme = "light"  # light, dark, auto
  sidebarPosition = "left"  # left, right
```

### 菜单配置

```toml
[menu]
  [[menu.main]]
    identifier = "home"
    name = "首页"
    url = "/"
    weight = 10
  
  [[menu.main]]
    identifier = "archives"
    name = "归档"
    url = "/archives/"
    weight = 20
  
  [[menu.main]]
    identifier = "categories"
    name = "分类"
    url = "/categories/"
    weight = 30
  
  [[menu.main]]
    identifier = "tags"
    name = "标签"
    url = "/tags/"
    weight = 40
  
  [[menu.main]]
    identifier = "gallery"
    name = "相册"
    url = "/gallery/"
    weight = 50
  
  [[menu.main]]
    identifier = "friends"
    name = "友链"
    url = "/friends/"
    weight = 60
  
  [[menu.main]]
    identifier = "about"
    name = "关于"
    url = "/about/"
    weight = 70
```

## 📝 内容类型

### 博客文章

```yaml
---
title: "文章标题"
date: 2024-01-15T10:00:00+08:00
draft: false
categories: ["技术"]
tags: ["hugo", "博客"]
featured_image: "/images/posts/cover.jpg"
description: "文章描述"
author: "作者名"
toc: true
comments: true
reward: true
---
```

### 相册

创建 `content/gallery/_index.md`：

```yaml
---
title: "相册"
layout: "gallery"
---
```

### 电影

创建 `content/movies/_index.md`：

```yaml
---
title: "电影"
layout: "movies"
---
```

### 音乐

创建 `content/music/_index.md`：

```yaml
---
title: "音乐"
layout: "music"
---
```

### 日记

```yaml
---
title: "日记标题"
date: 2024-01-15
type: "diary"
mood: "开心"
weather: "晴天"
location: "北京"
---
```

## 🎨 自定义样式

在 `assets/scss/custom.scss` 中覆盖默认样式：

```scss
:root {
  --primary-color: #3b82f6;
  --accent-color: #8b5cf6;
}
```

## 🚀 部署

### Cloudflare Pages

1. 将代码推送到 GitHub
2. 在 Cloudflare Pages 中连接仓库
3. 构建设置：
   - Build command: `hugo --gc --minify`
   - Build output directory: `public`

### Vercel

```bash
npm i -g vercel
vercel --prod
```

### Netlify

```toml
[build]
  publish = "public"
  command = "hugo --gc --minify"

[build.environment]
  HUGO_VERSION = "0.120.0"
  HUGO_ENV = "production"
```

## 📄 许可证

MIT License © 2024 Lumin Theme

## 🙏 致谢

- 灵感来源于 [onedayxyy.cn](https://onedayxyy.cn/)
- 参考 [hugo-theme-stack](https://github.com/CaiJimmy/hugo-theme-stack) 的结构设计
