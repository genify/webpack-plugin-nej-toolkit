# 插件版与原 toolkit 的功能差异

## 打包标记差异

### NOCOMPRESS

不再支持 NOCOMPRESS 标记，所有内容默认不压缩，项目可以使用模板引擎自带压缩功能

### MANIFEST

不再支持离线相关的配置和标记

## 配置参数差异

### FILE_CHARSET

不再支持文件编码格式配置，项目统一使用 UTF-8 编码格式

### OPT_IMAGE_FLAG

不再支持图片压缩优化配置，项目统一使用其他 Webpack 插件支持

### OPT_IMAGE_QUALITY

不再支持图片压缩优化配置，项目统一使用其他 Webpack 插件支持

### 离线配置

离线相关的配置不再支持，包括 MANIFEST_ROOT、MANIFEST_OUTPUT、MANIFEST_TEMPLATE、MANIFEST_FILTER 配置，项目可以使用其他 Webpack 插件支持


