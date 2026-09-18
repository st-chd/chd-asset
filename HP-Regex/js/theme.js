class ThemeManager {
    constructor() {
        this.themeToggle = document.getElementById('globalThemeToggle');
        this.currentTheme = localStorage.getItem('globalTheme') || 'light';
        this.init();
    }

    init() {
        this.applyTheme(this.currentTheme);
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => this.toggleTheme());
        }
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        document.body.setAttribute('data-theme', theme);
        if (this.themeToggle) {
            this.themeToggle.textContent = theme === 'light' ? '🌙' : '☀️';
        }
        this.currentTheme = theme;
        localStorage.setItem('globalTheme', theme);
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.themeManager = new ThemeManager();
});

window.expandEditor = function(type) {
    let ed = null;
    if (type === 'theme-viewer' && window.themeEditor && window.themeEditor.editor) {
        ed = window.themeEditor.editor;
        const mainEl = ed.getWrapperElement().closest('.editor-main');
        if (mainEl) {
            mainEl.style.maxHeight = 'none';
            mainEl.style.height = 'auto';
        }
    } else {
        ed = window.editor;
    }
    
    if (ed) {
        const el = ed.getWrapperElement();
        const currentHeight = el.offsetHeight;
        el.style.maxHeight = 'none';
        ed.setSize(null, currentHeight + 300);
        
        const scrollEl = el.querySelector('.CodeMirror-scroll');
        if(scrollEl) {
            scrollEl.style.maxHeight = 'none';
        }
    }
};

window.resetEditor = function(type) {
    let ed = null;
    if (type === 'theme-viewer' && window.themeEditor && window.themeEditor.editor) {
        ed = window.themeEditor.editor;
        const mainEl = ed.getWrapperElement().closest('.editor-main');
        if (mainEl) {
            mainEl.style.maxHeight = '';
            mainEl.style.height = '';
        }
    } else {
        ed = window.editor;
    }
    
    if (ed) {
        const el = ed.getWrapperElement();
        el.style.maxHeight = '';
        ed.setSize(null, null); // reset to CSS default height
        
        const scrollEl = el.querySelector('.CodeMirror-scroll');
        if(scrollEl) {
            scrollEl.style.maxHeight = '';
        }
    }
};
