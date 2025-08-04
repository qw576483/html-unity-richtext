# HTML-Unity-RichText  
A lightweight rich text editor that bridges HTML formatting with Unity-style markup syntax. 

![Demo](demo/demo.mp4)   
## Features  
- **Unity-like Syntax**: Use Unity-style markup (e.g. `<color=#ff0000>`) that gets converted to HTML ,
Enables direct editing of in-game rich text content (emails, announcements, etc.) within Unity environments.
- **Live Preview**: Real-time HTML rendering as you type  
- **Extensible**: Add custom tags and validators  
- **Responsive**: Works on both desktop and mobile browsers  
## Quick Start  
```html  
<script src="./html.unity.richtext.js"></script>   
<script>  
const editor=new RichTextEditor('#myTextarea','#previewContainer');  
editor.applyBold();editor.clearAllFormat();   
</script>  
```

---
# zh-cn:
# 轻量级Unity富文本编辑器  
实现Unity标记语法与HTML格式无缝转换的富文本编辑工具  （讲道理应该是客户端用c#转html,但是我们client太鸡儿懒了）
 
## 核心特性  
- **Unity风格语法**：支持`<color=#ff0000>`等Unity原生标记，自动转换为标准HTML ，可以直接编辑unity游戏中邮件，公告等富文本内容  
- **实时可视化预览**：输入时同步渲染HTML效果，所见即所得  
- **可扩展架构**：允许开发者自定义标签和验证规则  
- **全端适配**：完美兼容桌面浏览器和移动设备  
