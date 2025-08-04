class RichTextEditor {
    constructor(selector, previewSelector, options = null) {
        this.textarea  = document.querySelector(selector); 
        if (!this.textarea)  throw new Error('textarea not found');
        
        this.preview  = document.querySelector(previewSelector)  || this._createPreviewElement();
        this.preview.className  = 'rich-text-preview';
        
        this.toolbar  = this._createToolbar();
        this._renderToolbarButtons();
    
        this.TAG_CONFIG = {
            color: { 
                open: (v) => `<color=${v}>`, 
                close: '</color>',
                validator: (v) => /^(#[0-9A-F]{6}|[a-zA-Z]+)$/i.test(v)   
            },
            bold: { open: '<b>', close: '</b>' },
            italic: { open: '<i>', close: '</i>' },
            size: { 
                open: (v) => `<size=${v}>`, 
                close: '</size>',
                validator: (v) => /^\d+%?$/.test(v)
            },
            link: { 
                open: (v) => `<link=${v}>`, 
                close: '</link>',
                validator: (v) => /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i.test(v)   
            },
            img: { 
                open: (v) => `$img:${v}\n`,
                close: '',
                isBlock: true,
                validator: (v) => /^(https?):\/\/[^\s/$.?#].[^\s]*$/i.test(v)   
            }
        };
    
        if (options) {
            for (const key in options) {
                if (options.hasOwnProperty(key))  {
                    this.TAG_CONFIG[key] = options[key];
                }
            }
        }
        this._bindEvents();
    }
    _bindEvents() {
        this.textarea.addEventListener('input',  () => this.updateOutput()); 
    }
    _createPreviewElement() {
        const preview = document.createElement('div'); 
        preview.className  = 'rich-text-preview';
        return preview;
    }
    
    _createToolbar() {
        const toolbar = document.createElement('div'); 
        toolbar.className  = 'rich-text-toolbar';
        this.textarea.parentNode.insertBefore(toolbar,  this.textarea); 
        this._injectToolbarStyles();
        return toolbar;
    }
    
    _injectToolbarStyles() {
        const styleId = 'rich-text-toolbar-styles';
        if (document.getElementById(styleId))  return;
    
        const css = `

            .rich-text-toolbar {
                display: flex;
                gap: 6px;
                flex-wrap: wrap;
                padding: 8px 10px;
                background: #f8f9fa;
                border: 1px solid #dee2e6;
                border-radius: 4px 4px 0 0;
                margin-bottom: -1px;
            }

            .rtbtn {
                min-width: 60px;
                padding: 4px 8px;
                border: 1px solid transparent;
                border-radius: 3px;
                cursor: pointer;
                transition: all 0.2s;
                font-size: 14px;
            }

            .rtbtn-sm {
                padding: 3px 6px;
                font-size: 12px;
                min-width: 50px;
            }
        

            .rtbtn-dark {
                background-color: #343a40;
                color: white;
                border-color: #343a40;
            }
            .rtbtn-dark:hover {
                background-color: #23272b;
                border-color: #1d2124;
            }
        
            .rtbtn-danger {
                background-color: #dc3545;
                color: white;
                border-color: #dc3545;
            }
            .rtbtn-danger:hover {
                background-color: #c82333;
                border-color: #bd2130;
            }
        

            .rtbtn:hover {
                filter: brightness(0.9);
                transform: translateY(-1px);
            }
            .rtbtn:active {
                transform: translateY(0);
            }
        `;
        
        const styleTag = document.createElement('style'); 
        styleTag.id  = styleId;
        styleTag.textContent  = css;
        document.head.appendChild(styleTag); 
    }
    
    _renderToolbarButtons() {
        const buttons = [
            { icon: '🎨', text: 'color', method: 'applyColor', class: 'rtbtn-dark' },
            { icon: '𝐁', text: 'bold', method: 'applyBold', class: 'rtbtn-dark' },
            { icon: '𝐼', text: 'italic', method: 'applyItalic', class: 'rtbtn-dark' },
            { icon: '🔠', text: 'size', method: 'applyFontSize', class: 'rtbtn-dark' },
            { icon: '🔗', text: 'link', method: 'applyLink', class: 'rtbtn-dark' },
            { icon: '🖼️', text: 'image', method: 'applyImage', class: 'rtbtn-dark' },
            { icon: '🗑️', text: 'clear', method: 'clearAllFormat', class: 'rtbtn-danger' }
        ];
        
        buttons.forEach(btn  => {
            const button = document.createElement('button'); 
            button.className  = `rtbtn rtbtn-sm ${btn.class}`; 
            button.innerHTML  = `${btn.icon}  ${btn.text}`; 

            button.addEventListener('click',  (e) => {
                e.preventDefault();
                e.stopPropagation();
                this[btn.method]();
            });
            
            this.toolbar.appendChild(button); 
        });
    }
    
    applyStyle(styleType, value) {
        const { selectionStart: start, selectionEnd: end, value: fullText } = this.textarea; 
        let newStart = start;
        let newEnd = end;
        if (newStart === newEnd) {
            newStart = newEnd = fullText.length; 
            this.textarea.setSelectionRange(newStart,  newEnd);
        }
        const selectedText = fullText.substring(newStart,  newEnd);
        const beforeText = fullText.substring(0,  newStart);
        const afterText = fullText.substring(newEnd); 
        if (this.TAG_CONFIG[styleType].validator && !this.TAG_CONFIG[styleType].validator(value)) {
            alert(`invalid ${styleType} , value: ${value}`);
            return;
        }
        const currentTag = {
            ...this.TAG_CONFIG[styleType],
            open: typeof this.TAG_CONFIG[styleType].open === 'function' 
                ? this.TAG_CONFIG[styleType].open(value) 
                : this.TAG_CONFIG[styleType].open 
        };
        let processedText = selectedText;
        if (currentTag.isBlock)  {
        processedText = selectedText.includes(currentTag.open)  
            ? selectedText.replace(new  RegExp(this.escapeRegExp(currentTag.open),  'g'), '')
            : `${currentTag.open}${selectedText}`; 
        } else {
            const regex = new RegExp(`${this.escapeRegExp(currentTag.open)}(.*?)${this.escapeRegExp(currentTag.close)}`,  's');
            processedText = regex.test(selectedText)  
                ? selectedText.replace(regex,  '$1')
                : `${currentTag.open}${selectedText}${currentTag.close}`; 
        }
        this.textarea.value  = beforeText + processedText + afterText;
        const lengthDiff = processedText.length  - selectedText.length; 
        this.selectTextRange(this.textarea,  newStart, newEnd + lengthDiff);
        this.updateOutput(); 
    }
    
    escapeRegExp(string) {
        return string.replace(/[.*+?^${}()  |[\]\\]/g, '\\$&');
    }
    
    selectTextRange(element, start, end) {
        element.focus(); 
        element.setSelectionRange(start,  end);
    }
    
    applyColor() {
        const color = prompt("input color code (eq:#FF0000):", "#EA1A1A");
        if (color == null) return;
        if (color) this.applyStyle('color',  color);
    }
    
    applyBold = () => this.applyStyle('bold'); 
    applyItalic = () => this.applyStyle('italic'); 
    
    applyFontSize() {
        const size = prompt("input font size (eq:12):", "12");
        if (size == null) return;
        if (size) this.applyStyle('size',  size);
    }
    
    applyLink() {
        const url = prompt("input link (need http:// or https://):", "http://");
        if (url == null) return;
        if (url && this.TAG_CONFIG.link.validator(url))  {
            this.applyStyle('link',  url);
        } else {
            alert("link error, please input a valid link");
        }
    }
    
    applyImage() {
        const url = prompt("input link of image (need http:// or https://):", "http://");
        if (url == null) return;
        if (url && this.TAG_CONFIG.img.validator(url))  {
            this.applyStyle('img',  url);
        } else {
            alert("link error, please input a valid link");
        }
    }
    
    clearAllFormat() {
        let { selectionStart: start, selectionEnd: end, value: fullText } = this.textarea; 
        const isFullText = (start === end);
        const targetText = isFullText ? fullText : fullText.substring(start,  end);
        const cleanedText = targetText 
            .replace(/<\/?(color|b|i|size|link|strong|em|span)[^>]*>/g, '')
            .replace(/^\s*\$img:[^\n]+\s*$/gm, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>');
        this.textarea.value  = isFullText 
            ? cleanedText 
            : fullText.substring(0,  start) + cleanedText + fullText.substring(end); 
        if (!isFullText) {
            // const lengthDiff = cleanedText.length  - (end - start);
            end = start + cleanedText.length; 
            this.selectTextRange(this.textarea,  start, end);
        }
        this.updateOutput(); 
    }
    
    updateOutput() {
        const outputText = this.preview; 

        let htmlText = this.textarea.value 
            .split('\n')
            .map(line => {
                if (line.trim().startsWith('$img:'))  {
                        const url = line.substring(5).trim() 
                        .replace(/&/g, '&amp;')
                        .replace(/</g, '&lt;');
                        return `<img src="${url}" style="max-width:100%;height:auto;display:block">`;
                    }
                    return line;
                })
                .join('\n')
                .replace(/<link=([^>]+)>([^<]+)<\/link>/g, '<a href="$1" target="_blank" style="text-decoration:underline">$2</a>')
                .replace(/\r?\n/g, '<br>')
                .replace(/  /g, '&nbsp;&nbsp;')
                .replace(/<b>/g, '<strong>').replace(/<\/b>/g, '</strong>')
                .replace(/<i>/g, '<em>').replace(/<\/i>/g, '</em>')
                .replace(/<size=([\d.]+)(%?)\>/g, (_, size, unit) => {
                    const pxSize = unit ? `${parseFloat(size)/5}px` : `${size}px`;
                    return `<span style="font-size:${pxSize}">`;
                })
                .replace(/<\/size>/g, '</span>')
                .replace(/<color=(#[0-9a-fA-F]{6}|[a-zA-Z]+)\>/g, '<span style="color:$1">')
                .replace(/<\/color>/g, '</span>');

        outputText.innerHTML  = htmlText;
    }


    _sanitizeURL(url) {
        return String(url)
            .replace(/[^a-z0-9-._~:/?#[\]@!$&'()*+,;=]/gi, '')
            .replace(/&/g, '&amp;');
    }
    
    static create(selector, previewSelector, options = null) {
        return new RichTextEditor(selector , previewSelector, options);
    } 
}