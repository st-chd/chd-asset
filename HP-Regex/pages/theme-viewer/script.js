window.themeEditor = {
    editor: null,
    originalJSON: null,
    searchMatches: [],
    currentMatchIndex: -1,
    currentColors: {},

    colorFields: {
        'main_text_color': '주요 텍스트',
        'italics_text_color': '이탤릭체 텍스트',
        'underline_text_color': '밑줄 텍스트',
        'quote_text_color': '인용 텍스트',
        'blur_tint_color': 'UI 배경',
        'chat_tint_color': '채팅 배경',
        'user_mes_blur_tint_color': '사용자 메시지 흐림 틴트',
        'bot_mes_blur_tint_color': 'AI 메시지 흐림 틴트',
        'shadow_color': '그림자 색상',
        'border_color': 'UI 테두리'
    },

    init: function() {
        const cssEditorTextarea = document.getElementById('cssEditor');
        if (!cssEditorTextarea || typeof CodeMirror === 'undefined') {
            console.error('❌ 초기화 실패');
            return;
        }

        if (this.editor && this.editor.toTextArea) {
            try { this.editor.toTextArea(); } catch (e) {}
        }

        this.editor = CodeMirror.fromTextArea(cssEditorTextarea, {
            mode: 'css',
            theme: 'default',
            lineNumbers: true,
            lineWrapping: true,
            indentUnit: 2,
            tabSize: 2,
            indentWithTabs: false,
             colorpicker: {
                mode: 'edit',
                type: 'sketch'
            }
        });

        document.getElementById('fileInput')?.addEventListener('change', this.handleFileSelect.bind(this));

        const searchInput = document.getElementById('searchInput');
        searchInput?.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                e.shiftKey ? this.searchPrev() : this.searchNext();
            } else {
                this.performSearch();
            }
        });

        document.getElementById('replaceInput')?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.replaceOne();
            }
        });
    },

    handleFileSelect: function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            this.clearSearchHighlights();
            this.searchMatches = [];
            this.currentMatchIndex = -1;
            document.getElementById('searchInput').value = '';
            document.getElementById('searchCounter').textContent = '';
            document.getElementById('replaceInput').value = '';

            if (file.name.endsWith('.txt')) {
                this.originalJSON = null;
                this.editor.setValue(event.target.result || "");
                this.hideColorEditor();
                showToast(`✅ ${file.name} 로드 완료`);
                return;
            }

            const parsedJSON = JSON.parse(event.target.result);
            
            if (parsedJSON.hasOwnProperty('custom_css')) {
                this.originalJSON = parsedJSON;
                this.editor.setValue(parsedJSON.custom_css || "");
                this.showColorEditor();
                showToast(`✅ ${file.name} (테마) 로드 완료`);
            } else {
                this.originalJSON = null;
                this.editor.setValue(JSON.stringify(parsedJSON, null, 2));
                this.hideColorEditor();
                showToast(`✅ ${file.name} (JSON) 로드 완료`);
            }
        } catch (error) {
            showToast('❌ 파일 파싱 오류');
        }
    };
    reader.readAsText(file);
},

    showColorEditor: function() {
        const colorWrapper = document.getElementById('colorEditorWrapper');
        const colorGrid = document.getElementById('colorGrid');
        if (!colorWrapper || !colorGrid) return;

        colorGrid.innerHTML = '';
        this.currentColors = {};

        for (const [key, label] of Object.entries(this.colorFields)) {
            if (!this.originalJSON.hasOwnProperty(key)) continue;

            const value = this.originalJSON[key];
            this.currentColors[key] = value;
            const rgba = this.parseColor(value);

            const colorItem = document.createElement('div');
            colorItem.className = 'color-item';

            const colorLabel = document.createElement('label');
            colorLabel.className = 'color-label';
            colorLabel.textContent = label;

            const controlsWrapper = document.createElement('div');
            controlsWrapper.className = 'color-controls';

            const colorPicker = document.createElement('input');
            colorPicker.type = 'color';
            colorPicker.className = 'color-picker';
            colorPicker.value = this.rgbaToHex(rgba);

            const rgbaInputs = document.createElement('div');
            rgbaInputs.className = 'rgba-inputs';

            const rWrapper = this.createColorInput('R', rgba.r, 0, 255, (val) => {
                rgba.r = val;
                this.updateColorFromRGBA(key, rgba, hexInput, colorPicker);
            });

            const gWrapper = this.createColorInput('G', rgba.g, 0, 255, (val) => {
                rgba.g = val;
                this.updateColorFromRGBA(key, rgba, hexInput, colorPicker);
            });

            const bWrapper = this.createColorInput('B', rgba.b, 0, 255, (val) => {
                rgba.b = val;
                this.updateColorFromRGBA(key, rgba, hexInput, colorPicker);
            });

            const aWrapper = this.createColorInput('A', rgba.a, 0, 1, (val) => {
                rgba.a = val;
                this.updateColorFromRGBA(key, rgba, hexInput, colorPicker);
            }, 0.01);

            rgbaInputs.append(rWrapper, gWrapper, bWrapper, aWrapper);

            const hexInput = document.createElement('input');
            hexInput.type = 'text';
            hexInput.className = 'hex-input';
            hexInput.value = this.rgbaToHex(rgba);
            hexInput.placeholder = '#FFFFFF';
            hexInput.maxLength = 7;

            hexInput.addEventListener('input', (e) => {
                let hex = e.target.value.trim().toUpperCase();
                if (!hex.startsWith('#')) hex = '#' + hex;
                if (/^#[0-9A-F]{6}$/.test(hex)) {
                    const newRgba = this.hexToRgbaObj(hex, rgba.a);
                    rgba.r = newRgba.r;
                    rgba.g = newRgba.g;
                    rgba.b = newRgba.b;
                    rWrapper.querySelector('input').value = rgba.r;
                    gWrapper.querySelector('input').value = rgba.g;
                    bWrapper.querySelector('input').value = rgba.b;
                    colorPicker.value = hex;
                    this.currentColors[key] = this.rgbaObjToString(rgba);
                }
            });

            colorPicker.addEventListener('input', (e) => {
                const hex = e.target.value.toUpperCase();
                const newRgba = this.hexToRgbaObj(hex, rgba.a);
                rgba.r = newRgba.r;
                rgba.g = newRgba.g;
                rgba.b = newRgba.b;
                rWrapper.querySelector('input').value = rgba.r;
                gWrapper.querySelector('input').value = rgba.g;
                bWrapper.querySelector('input').value = rgba.b;
                hexInput.value = hex;
                this.currentColors[key] = this.rgbaObjToString(rgba);
            });

            controlsWrapper.append(colorPicker, rgbaInputs, hexInput);
            colorItem.append(colorLabel, controlsWrapper);
            colorGrid.appendChild(colorItem);
        }

        colorWrapper.style.display = 'block';
        const colorSection = document.getElementById('colorEditorSection');
        if (colorSection) {
            colorSection.style.display = 'none';
            document.getElementById('colorToggleIcon').textContent = '[펼치기]';
        }
    },

    hideColorEditor: function() {
        const colorWrapper = document.getElementById('colorEditorWrapper');
        if (colorWrapper) colorWrapper.style.display = 'none';
    },

    createColorInput: function(label, value, min, max, onChange, step = 1) {
        const wrapper = document.createElement('div');
        wrapper.className = 'rgba-input-wrapper';

        const labelEl = document.createElement('span');
        labelEl.className = 'rgba-label';
        labelEl.textContent = label;

        const input = document.createElement('input');
        input.type = 'number';
        input.className = 'rgba-number-input';
        input.value = value;
        input.min = min;
        input.max = max;
        input.step = step;

        input.addEventListener('input', (e) => {
            let val = parseFloat(e.target.value);
            if (isNaN(val)) val = min;
            val = Math.max(min, Math.min(max, val));
            onChange(val);
        });

        wrapper.append(labelEl, input);
        return wrapper;
    },

    parseColor: function(color) {
        if (color.startsWith('#')) return this.hexToRgbaObj(color, 1);
        const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
        if (match) {
            return {
                r: parseInt(match[1]),
                g: parseInt(match[2]),
                b: parseInt(match[3]),
                a: match[4] ? parseFloat(match[4]) : 1
            };
        }
        return { r: 0, g: 0, b: 0, a: 1 };
    },

    updateColorFromRGBA: function(key, rgba, hexInput, colorPicker) {
        const hex = this.rgbaToHex(rgba);
        hexInput.value = hex;
        colorPicker.value = hex;
        this.currentColors[key] = this.rgbaObjToString(rgba);
    },

    rgbaObjToString: function(rgba) {
        return `rgba(${Math.round(rgba.r)}, ${Math.round(rgba.g)}, ${Math.round(rgba.b)}, ${rgba.a})`;
    },

    rgbaToHex: function(rgba) {
        let r, g, b;
        if (typeof rgba === 'object') {
            r = Math.round(rgba.r);
            g = Math.round(rgba.g);
            b = Math.round(rgba.b);
        } else if (rgba.startsWith('#')) {
            return rgba.substring(0, 7).toUpperCase();
        } else {
            const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
            if (!match) return '#000000';
            r = parseInt(match[1]);
            g = parseInt(match[2]);
            b = parseInt(match[3]);
        }
        return '#' + [r, g, b].map(x => {
            const hex = x.toString(16).toUpperCase();
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    },

    hexToRgbaObj: function(hex, alpha = 1) {
        return {
            r: parseInt(hex.slice(1, 3), 16),
            g: parseInt(hex.slice(3, 5), 16),
            b: parseInt(hex.slice(5, 7), 16),
            a: alpha
        };
    },

    resetColors: function() {
        const file = document.getElementById('fileInput')?.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                this.originalJSON = JSON.parse(event.target.result);
                this.showColorEditor();
                showToast('✅ 색상 복원 완료');
            } catch (error) {
                showToast('❌ 복원 실패');
            }
        };
        reader.readAsText(file);
    },

    copyAllColors: function() {
        if (!this.originalJSON) {
            showToast('❌ 로드된 파일이 없습니다');
            return;
        }

        let textToCopy = '';
        for (const [key, label] of Object.entries(this.colorFields)) {
            if (this.originalJSON.hasOwnProperty(key)) {
                const rgba = this.parseColor(this.originalJSON[key]);
                const hex = this.rgbaToHex(rgba);
                textToCopy += rgba.a !== 1 ? `${label}: ${hex} (A: ${rgba.a})\n` : `${label}: ${hex}\n`;
            }
        }

        if (!textToCopy) {
            showToast('❌ 복사할 색상이 없습니다');
            return;
        }

        navigator.clipboard.writeText(textToCopy.trim()).then(() => {
            showToast('✅ 색상 정보 복사 완료!');
        }).catch(() => {
            const textArea = document.createElement("textarea");
            textArea.value = textToCopy.trim();
            textArea.style.cssText = "position:fixed;opacity:0";
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                showToast('✅ 색상 정보 복사 완료!');
            } catch (e) {
                showToast('❌ 복사 실패');
            }
            document.body.removeChild(textArea);
        });
    },

    pasteColors: function() {
        document.getElementById('pasteModal').style.display = 'flex';
        const textarea = document.getElementById('pasteTextarea');
        textarea.value = '';
        textarea.focus();
    },

    closePasteModal: function() {
        document.getElementById('pasteModal').style.display = 'none';
    },

    applyPastedColors: function() {
        const text = document.getElementById('pasteTextarea').value.trim();
        if (!text) {
            showToast('❌ 붙여넣을 내용이 없습니다');
            return;
        }

        const lines = text.split('\n');
        let successCount = 0;

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            const match = trimmed.match(/^(.+?)[:：\s]+#?([0-9A-Fa-f]{6})(?:\s+A\s*[:：]?\s*([\d.]+))?/);
            if (match) {
                const labelText = match[1].trim();
                const hexValue = match[2].toUpperCase();
                const alphaValue = match[3] ? parseFloat(match[3]) : null;

                for (const [key, label] of Object.entries(this.colorFields)) {
                    if (label === labelText) {
                        const normalizedAlpha = alphaValue > 1 ? alphaValue / 100 : (alphaValue || 1);
                        const rgba = this.hexToRgbaObj('#' + hexValue, normalizedAlpha);
                        const rgbaString = this.rgbaObjToString(rgba);

                        this.currentColors[key] = rgbaString;
                        if (this.originalJSON) this.originalJSON[key] = rgbaString;

                        successCount++;
                        break;
                    }
                }
            }
        }

        if (successCount > 0) {
            this.updateColorEditorUI();
            this.closePasteModal();
            showToast(`✅ ${successCount}개 색상 적용 완료`);
        } else {
            showToast('❌ 인식된 색상이 없습니다');
        }
    },

    updateColorEditorUI: function() {
        const colorItems = document.querySelectorAll('.color-item');
        let itemIndex = 0;

        for (const [key, label] of Object.entries(this.colorFields)) {
            if (this.originalJSON?.hasOwnProperty(key) && itemIndex < colorItems.length) {
                const colorItem = colorItems[itemIndex];
                const rgba = this.parseColor(this.originalJSON[key]);

                colorItem.querySelector('.color-picker').value = this.rgbaToHex(rgba);
                colorItem.querySelector('.hex-input').value = this.rgbaToHex(rgba);

                const rgbaInputs = colorItem.querySelectorAll('.rgba-number-input');
                if (rgbaInputs.length >= 4) {
                    rgbaInputs[0].value = rgba.r;
                    rgbaInputs[1].value = rgba.g;
                    rgbaInputs[2].value = rgba.b;
                    rgbaInputs[3].value = rgba.a;
                }
                itemIndex++;
            }
        }
    },

    performSearch: function() {
        const query = document.getElementById('searchInput').value;
        const counter = document.getElementById('searchCounter');

        this.clearSearchHighlights();

        if (!query) {
            this.searchMatches = [];
            this.currentMatchIndex = -1;
            counter.textContent = '';
            return;
        }

        this.searchMatches = [];
        const cursor = this.editor.getSearchCursor(query, { line: 0, ch: 0 }, { caseFold: true });

        while (cursor.findNext()) {
            this.searchMatches.push({ from: cursor.from(), to: cursor.to() });
        }

        if (this.searchMatches.length > 0) {
            this.currentMatchIndex = 0;
            this.highlightAllMatches();
            this.jumpToMatch(0);
            counter.textContent = `(${this.searchMatches.length}개 찾음)`;
        } else {
            counter.textContent = '(0개 찾음)';
        }
    },

    searchNext: function() {
        if (this.searchMatches.length === 0) {
            this.performSearch();
            return;
        }
        this.currentMatchIndex = (this.currentMatchIndex + 1) % this.searchMatches.length;
        this.jumpToMatch(this.currentMatchIndex);
        document.getElementById('searchCounter').textContent = `(${this.currentMatchIndex + 1}/${this.searchMatches.length})`;
    },

    searchPrev: function() {
        if (this.searchMatches.length === 0) {
            this.performSearch();
            return;
        }
        this.currentMatchIndex = (this.currentMatchIndex - 1 + this.searchMatches.length) % this.searchMatches.length;
        this.jumpToMatch(this.currentMatchIndex);
        document.getElementById('searchCounter').textContent = `(${this.currentMatchIndex + 1}/${this.searchMatches.length})`;
    },

    highlightAllMatches: function() {
        this.searchMatches.forEach((match, index) => {
            this.editor.markText(match.from, match.to, {
                className: index === this.currentMatchIndex ? 'highlight-current' : 'highlight-match'
            });
        });
    },

    clearSearchHighlights: function() {
        this.editor.getAllMarks().forEach(mark => mark.clear());
    },

    jumpToMatch: function(index) {
        if (this.searchMatches.length === 0) return;
        const match = this.searchMatches[index];
        this.editor.scrollIntoView(match.from, 100);
        this.editor.setSelection(match.from, match.to);
        this.clearSearchHighlights();
        this.currentMatchIndex = index;
        this.highlightAllMatches();
    },

    replaceOne: function() {
        if (this.searchMatches.length === 0) {
            showToast('❌ 검색 결과가 없습니다');
            return;
        }
        const replaceText = document.getElementById('replaceInput').value;
        const match = this.searchMatches[this.currentMatchIndex];
        this.editor.replaceRange(replaceText, match.from, match.to);
        showToast('✅ 1개 변경 완료');
        setTimeout(() => this.performSearch(), 100);
    },

    replaceAll: function() {
        if (this.searchMatches.length === 0) {
            showToast('❌ 검색 결과가 없습니다');
            return;
        }
        const replaceText = document.getElementById('replaceInput').value;
        const count = this.searchMatches.length;

        for (let i = this.searchMatches.length - 1; i >= 0; i--) {
            this.editor.replaceRange(replaceText, this.searchMatches[i].from, this.searchMatches[i].to);
        }
        showToast(`✅ ${count}개 변경 완료`);
        setTimeout(() => this.performSearch(), 100);
    },

    copyAllCSS: function() {
        const cssContent = this.editor.getValue();
        if (!cssContent) {
            showToast('❌ 복사할 내용이 없습니다');
            return;
        }

        navigator.clipboard.writeText(cssContent).then(() => {
            showToast('✅ 복사 완료!');
        }).catch(() => {
            const textArea = document.createElement("textarea");
            textArea.value = cssContent;
            textArea.style.cssText = "position:fixed;opacity:0";
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                showToast('✅ 복사 완료!');
            } catch (e) {
                showToast('❌ 복사 실패');
            }
            document.body.removeChild(textArea);
        });
    },

    downloadJSON: function() {
        const content = this.editor.getValue();
        if (!content && !this.originalJSON) {
            showToast('❌ 다운로드할 내용이 없습니다');
            return;
        }

        const originalFile = document.getElementById('fileInput').files[0];

        if (!this.originalJSON) {
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = originalFile ? `modified_${originalFile.name}` : 'modified.txt';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showToast('✅ TXT 파일 다운로드 완료!');
            return;
        }

        const modifiedJSON = { ...this.originalJSON };
        modifiedJSON.custom_css = content;

        for (const [key, value] of Object.entries(this.currentColors)) {
            modifiedJSON[key] = value;
        }

        if (modifiedJSON.name && !modifiedJSON.name.endsWith('수정')) {
            modifiedJSON.name += "수정";
        }

        const blob = new Blob([JSON.stringify(modifiedJSON, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `modified_${originalFile?.name || 'custom_css.json'}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('✅ JSON 파일 다운로드 완료!');
    }
};

window.toastTimeout = null;

function showToast(message) {
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        if (window.toastTimeout) clearTimeout(window.toastTimeout);
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    window.toastTimeout = setTimeout(() => {
        if (toast.parentNode) toast.remove();
    }, 3000);
}

function toggleReplaceBox() {
    const box = document.getElementById('replaceBox');
    const btn = document.getElementById('toggleReplaceBtn');
    const isActive = box.classList.toggle('active');
    btn.textContent = isActive ? '접기' : '바꾸기';
}

function initApp() {
    if (typeof window.themeEditor !== 'undefined') {
        window.themeEditor.init();
    }
}

function toggleColorEditor() {
    const section = document.getElementById('colorEditorSection');
    const icon = document.getElementById('colorToggleIcon');
    if (section.style.display === 'none') {
        section.style.display = 'block';
        icon.textContent = '[접기]';
    } else {
        section.style.display = 'none';
        icon.textContent = '[펼치기]';
    }
}

function toggleSearchSection() {
    const section = document.getElementById('searchSectionContent');
    const icon = document.getElementById('searchToggleIcon');
    if (section.style.display === 'none') {
        section.style.display = 'block';
        icon.textContent = '[접기]';
    } else {
        section.style.display = 'none';
        icon.textContent = '[펼치기]';
    }
}