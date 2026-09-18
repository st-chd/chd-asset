function sanitizePreviewHtml(html) {
    const template = document.createElement('template');
    template.innerHTML = html;
    const blockedTags = new Set(['SCRIPT', 'IFRAME', 'OBJECT', 'EMBED', 'LINK', 'META']);
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
        if (blockedTags.has(el.tagName)) {
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
