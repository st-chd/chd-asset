function sanitizePreviewHtml(html) {
    const template = document.createElement('template');
    template.innerHTML = html;
    const blockedTags = new Set(['SCRIPT', 'IFRAME', 'OBJECT', 'EMBED', 'LINK', 'META', 'BASE']);
    const urlAttributes = new Set(['href', 'src', 'xlink:href', 'formaction']);

    function normalizeDangerousValue(value) {
        return value
            .trim()
            .toLowerCase()
            .replace(/[\u0000-\u001f\u007f\s]+/g, '');
    }

    function isDangerousUrl(value) {
        const normalized = normalizeDangerousValue(value);
        return normalized.startsWith('javascript:') || normalized.startsWith('vbscript:');
    }

    function isDangerousStyle(value) {
        const normalized = normalizeDangerousValue(value);
        return (
            normalized.includes('javascript:') ||
            normalized.includes('vbscript:') ||
            normalized.includes('expression(') ||
            normalized.includes('-moz-binding') ||
            normalized.includes('behavior:') ||
            normalized.includes('url(')
        );
    }

    template.content.querySelectorAll('*').forEach(el => {
        if (blockedTags.has(el.tagName.toUpperCase())) {
            el.remove();
            return;
        }

        [...el.attributes].forEach(attr => {
            const name = attr.name.toLowerCase();
            if (
                name.startsWith('on') ||
                name === 'srcdoc' ||
                (urlAttributes.has(name) && isDangerousUrl(attr.value)) ||
                (name === 'style' && isDangerousStyle(attr.value))
            ) {
                el.removeAttribute(attr.name);
            }
        });
    });

    return template.innerHTML;
}

window.sanitizePreviewHtml = sanitizePreviewHtml;

const previewFrames = new WeakMap();

function clearPreview(target) {
    const state = previewFrames.get(target);
    if (state) {
        state.resizeObserver.disconnect();
        state.themeObserver.disconnect();
        window.removeEventListener('resize', state.resize);
        previewFrames.delete(target);
    }
    target.replaceChildren();
}

function renderPreviewHtml(target, html) {
    let state = previewFrames.get(target);
    if (!state) {
        clearPreview(target);
        const frame = document.createElement('iframe');
        frame.title = '디자인 미리보기';
        // 같은 출처 접근은 부모의 테마 전달용이다. 스크립트·폼·팝업 권한은 부여하지 않는다.
        frame.setAttribute('sandbox', 'allow-same-origin');
        frame.style.cssText = 'display:block;width:100%;border:0;height:1px;background:transparent;';
        const previewSide = target.closest('.preview-side') || target.parentElement;
        const resize = () => {
            if (!frame.isConnected || !previewSide.getClientRects().length) return;
            const padding = getComputedStyle(target.parentElement);
            const stacked = getComputedStyle(previewSide.parentElement).flexDirection === 'column';
            // 모바일에서는 부모 높이가 내용에 달려 있으므로 iframe 자체 높이를 다시 기준으로 삼지 않는다.
            const available = stacked
                ? Math.max(240, window.innerHeight - (previewSide.getBoundingClientRect().top + window.scrollY))
                : previewSide.clientHeight;
            const height = Math.max(1, available - parseFloat(padding.paddingTop || 0) - parseFloat(padding.paddingBottom || 0));
            frame.style.height = `${height}px`;
            if (state?.ready) syncTheme();
        };
        state = { frame, html: '', ready: false, resize, resizeObserver: new ResizeObserver(resize), themeObserver: null };
        const syncTheme = () => {
            if (!state.ready || previewFrames.get(target) !== state) return;
            const doc = frame.contentDocument;
            if (!doc) return;
            const computed = getComputedStyle(target);
            doc.documentElement.dataset.theme = document.documentElement.dataset.theme || 'light';
            const variables = Array.from(computed).filter(name => name.startsWith('--'))
                .map(name => `${name}:${computed.getPropertyValue(name)};`).join('');
            const themeCss = `
                :root { ${variables} font-size: ${getComputedStyle(document.documentElement).fontSize}; }
                body { color: ${computed.color}; font-size: ${computed.fontSize}; line-height: ${computed.lineHeight}; }
                * { font-family: ${computed.fontFamily}; }
            `;
            const themeStyle = doc.getElementById('preview-theme');
            if (themeStyle.textContent !== themeCss) themeStyle.textContent = themeCss;
        };
        state.themeObserver = new MutationObserver(syncTheme);
        previewFrames.set(target, state);
        frame.addEventListener('load', () => {
            if (previewFrames.get(target) !== state) return;
            const doc = frame.contentDocument;
            if (!doc?.getElementById('preview-theme')) return;
            state.ready = true;
            // 부모의 페이지 배치 CSS 대신 폰트 정의와 기본 텍스트/테마 값만 전달한다.
            const fonts = doc.createElement('style');
            for (const sheet of document.styleSheets) {
                try {
                    for (const rule of sheet.cssRules) {
                        if (rule.type === CSSRule.FONT_FACE_RULE) fonts.textContent += rule.cssText;
                    }
                } catch { /* 외부 출처 스타일시트는 CSSOM 접근을 허용하지 않을 수 있다. */ }
            }
            doc.head.appendChild(fonts);
            doc.body.innerHTML = state.html;
            resize();
        });
        frame.srcdoc = `<!doctype html><html lang="ko"><head><meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <meta http-equiv="Content-Security-Policy" content="script-src 'none'; object-src 'none'; frame-src 'none'; base-uri 'none'; form-action 'none'">
            <style>*{margin:0;padding:0;box-sizing:border-box}html,body{min-height:100%;background:transparent}body{display:block;overflow:auto}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:var(--btn-1);border-radius:10px}::-webkit-scrollbar-track{background:transparent}</style>
            <style id="preview-theme"></style></head><body></body></html>`;
        target.appendChild(frame);
        state.resizeObserver.observe(previewSide);
        window.addEventListener('resize', resize);
        state.themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
        resize();
    }
    state.html = sanitizePreviewHtml(html);
    if (state.ready && state.frame.contentDocument) state.frame.contentDocument.body.innerHTML = state.html;
}

window.renderPreviewHtml = renderPreviewHtml;
window.clearPreview = clearPreview;
