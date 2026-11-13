"""Build the single-page Korean reference (macros, STscript, slash commands, LALib).

Inputs (all inside this _src folder): dump/*.json (live registry export and the category
of each command), ko/*.txt|md (Korean text). Output: ../index.html, one self-contained page.

Run from anywhere:  python -X utf8 _src/tools/build.py
"""
import html
import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
KO = ROOT / 'ko'
OUT = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT.parent / 'index.html'

ST_VERSION = '1.19.0'
LALIB_VERSION = '3.12.1'
BUILD_DATE = '2026-11-13'

# ---------------------------------------------------------------- inputs

cmds = json.load(open(ROOT / 'dump/commands.json', encoding='utf-8'))
macros = json.load(open(ROOT / 'dump/macros.json', encoding='utf-8'))

# LALib's /test replaces the core /test in the live registry, so the core one is restored by hand.
cmds.append({
    'name': 'test', 'aliases': [], 'src': 'core:scripts/slash-commands.js', 'returns': 'true | false',
    'help': '<pre><code>/let x Blue house and green car ||</code></pre>'
            '<pre><code>/test pattern="green" {{var::x}} | /echo |/# true ||</code></pre>'
            '<pre><code>/test pattern="blue" {{var::x}} | /echo |/# false ||</code></pre>'
            '<pre><code>/test pattern="/blue/i" {{var::x}} | /echo |/# true ||</code></pre>',
    'named': [{'n': 'pattern', 'd': 'pattern to find', 't': ['string'], 'r': True, 'e': []}],
    'unnamed': [{'d': 'text to test', 't': ['string'], 'r': True, 'e': []}],
})


def norm(s):
    return re.sub(r'\s+', ' ', s or '').strip()


def load_common():
    table, buf = {}, ''
    for line in open(KO / 'common.txt', encoding='utf-8'):
        line = line.rstrip('\n')
        if not buf and (not line.strip() or line.startswith('#')):
            continue
        buf = (buf + ' ' + line) if buf else line
        if '⇒' in buf:
            en, ko = buf.split('⇒', 1)
            table[norm(en)] = ko.strip()
            buf = ''
    return table


COMMON = load_common()


def parse_ko_blocks(path):
    """Parse the @name block format used by ko/*.txt.

    Description lines are mini-markdown (see card_md); a ``` fence is kept whole as one line.
    """
    blocks, cur, fence = {}, None, None
    for raw in open(path, encoding='utf-8'):
        line = raw.rstrip('\n')
        if fence is not None:
            fence.append(line)
            if line.startswith('```'):
                cur['d'].append('\n'.join(fence))
                fence = None
            continue
        if cur is not None and line.startswith('```'):
            fence = [line]
            continue
        if line.startswith('@'):
            name = line[1:].strip()
            cur = blocks.setdefault(name, {'d': [], 'a': {}, 'u': {}, 'n': [], 'e': {}, 'x': {}, 'ex': []})
            continue
        if cur is None or not line.strip():
            continue
        m = re.match(r'^\.(\S+(?: variables)?) (.*)$', line)
        if m:
            cur['a'][m.group(1)] = m.group(2)
            continue
        m = re.match(r'^#(\d+) (.*)$', line)
        if m:
            cur['u'][int(m.group(1))] = m.group(2)
            continue
        m = re.match(r'^=(\S+) (.*)$', line)
        if m:
            cur['e'][m.group(1)] = m.group(2)
            continue
        m = re.match(r'^~(\d+) (.*)$', line)
        if m:
            cur['x'][int(m.group(1))] = m.group(2)
            continue
        if line.startswith('! '):
            cur['n'].append(line[2:])
        elif line.startswith('> '):
            cur['ex'].append(line[2:])
        else:
            cur['d'].append(line)
    return blocks


def merge(dst, src):
    for name, b in src.items():
        t = dst.setdefault(name, {'d': [], 'a': {}, 'u': {}, 'n': [], 'e': {}, 'x': {}, 'ex': []})
        t['d'] += b['d']
        t['n'] += b['n']
        t['ex'] += b['ex']
        for k in ('a', 'u', 'e', 'x'):
            t[k].update(b[k])


KO_CORE, KO_LALIB = {}, {}
for p in sorted(KO.glob('core*.txt')):
    merge(KO_CORE, parse_ko_blocks(p))
for p in sorted(KO.glob('lalib*.txt')):
    merge(KO_LALIB, parse_ko_blocks(p))
KO_MACRO = {}
for p in sorted(KO.glob('macro[0-9].txt')):
    KO_MACRO.update(parse_ko_blocks(p))

# glossary.txt: "@용어|별칭|…" blocks. Card text links to them with [[용어]] or [[용어|표시할 글]].
TERMS = [(name.split('|'), b) for name, b in parse_ko_blocks(KO / 'glossary.txt').items()]
TERM_INDEX = {}
for i, (names, _) in enumerate(TERMS):
    for n in names:
        TERM_INDEX[n.lower()] = f'term-{i}'

WI_FIELDS = {}
for line in open(KO / 'wifields.txt', encoding='utf-8'):
    if line.strip():
        k, v = line.rstrip('\n').split(' ', 1)
        WI_FIELDS[k] = v


def parse_ctx():
    items, cur, fence = [], None, None
    for line in open(KO / 'macros_ctx.txt', encoding='utf-8'):
        line = line.rstrip('\n')
        if fence is not None:
            fence.append(line)
            if line.startswith('```'):
                cur['d'].append('\n'.join(fence))
                fence = None
            continue
        if cur is not None and line.startswith('```'):
            fence = [line]
            continue
        if line.startswith('#') or not line.strip():
            continue
        if line.startswith('@'):
            sig, cat = line[1:].rsplit('|', 1)
            cur = {'sig': sig, 'cat': cat, 'd': [], 'n': []}
            items.append(cur)
        elif line.startswith('! '):
            cur['n'].append(line[2:])
        else:
            cur['d'].append(line)
    return items


CTX = parse_ctx()

# group id -> lines shown right under the group title (ko/groupnotes.txt: "@id" then text lines)
GROUP_NOTES = {k: b['d'] for k, b in parse_ko_blocks(KO / 'groupnotes.txt').items()}


def group_note(gid):
    lines = GROUP_NOTES.get(gid)
    return f'<div class="group-note">{card_md(lines)}</div>' if lines else ''

# ---------------------------------------------------------------- categories


# dump/categories.json: which group each command belongs to, and the order of groups and of commands in them.
# A command missing from it is reported as "unmapped" and shown under "기타".
CATEGORIES = json.load(open(ROOT / 'dump/categories.json', encoding='utf-8'))
CORE_CAT, CORE_ORDER = CATEGORIES['core']['commands'], CATEGORIES['core']['order']
LALIB_CAT, LALIB_ORDER = CATEGORIES['lalib']['commands'], CATEGORIES['lalib']['order']
CORE_CAT.update({'test': '텍스트 처리', 'yt-script': '기타/유틸리티'})

# ---------------------------------------------------------------- text helpers

TYPE_KO = {
    'string': '문자열', 'number': '숫자', 'bool': '불리언', 'boolean': '불리언', 'list': '리스트',
    'dictionary': '딕셔너리', 'closure': '클로저', 'subcommand': '명령', 'varname': '변수 이름',
    'range': '범위', 'integer': '정수',
}

CMD_INDEX = {}   # name/alias -> anchor id
MACRO_INDEX = {}


def slug(name):
    rep = {'/': 'slash', '?': 'q', '=': 'eq', '$': 'dollar', '#': 'hash'}
    s = ''.join(rep.get(ch, ch) for ch in name)
    return re.sub(r'[^0-9A-Za-z_-]', '-', s)


def link_code(code_html, raw):
    """Turn `/cmd` and `{{macro}}` inline code into links to their cards."""
    m = re.match(r'^/([^\s|]+)', raw)
    if m and m.group(1) in CMD_INDEX:
        return f'<a class="ref" href="#{CMD_INDEX[m.group(1)]}">{code_html}</a>'
    m = re.match(r'^\{\{\s*([A-Za-z][\w-]*)', raw)
    if m and m.group(1).lower() in MACRO_INDEX:
        return f'<a class="ref" href="#{MACRO_INDEX[m.group(1).lower()]}">{code_html}</a>'
    return code_html


def inline(text):
    """Escape and render `code` / **bold** / [[term]], with cross-links.

    Code spans are swapped for placeholders first so **bold** may contain them.
    """
    codes = []

    def keep(m):
        raw = m.group(1)
        codes.append(link_code(f'<code>{html.escape(raw, quote=False)}</code>', raw))
        return f'\x00{len(codes) - 1}\x00'

    s = bold(html.escape(re.sub(r'`([^`]+)`', keep, text), quote=False))
    return re.sub(r'\x00(\d+)\x00', lambda m: codes[int(m.group(1))], s)


def term_link(m):
    key, _, label = m.group(1).partition('|')
    label = label or key
    tid = TERM_INDEX.get(key.lower())
    if not tid:
        MISSING['term'].append(key)
        return label
    return f'<a class="term" href="#{tid}">{label}</a>'


def bold(s):
    s = re.sub(r'\[\[([^\]]+)\]\]', term_link, s)
    s = re.sub(r'\[([^\[\]]+)\]\(#([\w-]+)\)', r'<a class="jump" href="#\2">\1</a>', s)
    return re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', s)


TOKEN = re.compile(
    r'(?P<c>\|/#.*$|(?<=\s)//\s.*$)'
    r'|(?P<m>\{\{[^{}]*?\}\})'
    r'|(?P<k>\{:|:\}(?:\(\))?)'
    r'|(?P<f>(?<![^\s|:{])/[^\s|{}]+)'
    r'|(?P<a>(?<![\w/.\-])[A-Za-z][\w-]*(?==))'
)


def highlight(code):
    """Very small single-pass STscript / macro highlighter."""
    lines = []
    for line in code.split('\n'):
        if re.match(r'^\s*(//|/#)', line):
            lines.append(f'<span class="t-c">{html.escape(line, quote=False)}</span>')
            continue
        out, pos = [], 0
        for m in TOKEN.finditer(line):
            out.append(html.escape(line[pos:m.start()], quote=False))
            out.append(f'<span class="t-{m.lastgroup}">{html.escape(m.group(), quote=False)}</span>')
            pos = m.end()
        out.append(html.escape(line[pos:], quote=False))
        lines.append(''.join(out))
    return '\n'.join(lines)


def code_block(code, caption=None):
    cap = f'<figcaption>{inline(caption)}</figcaption>' if caption else ''
    return f'<figure class="ex">{cap}<pre><code>{highlight(code)}</code></pre></figure>'


def result_block(text):
    return f'<figure class="ex out"><pre><code>{html.escape(text, quote=False)}</code></pre></figure>'


class PreExtractor(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.depth, self.buf, self.blocks = 0, [], []

    def handle_starttag(self, tag, attrs):
        if tag == 'pre':
            self.depth += 1
            self.buf = []
        elif tag == 'br' and self.depth:
            self.buf.append('\n')

    def handle_endtag(self, tag):
        if tag == 'pre' and self.depth:
            self.depth -= 1
            self.blocks.append(''.join(self.buf))

    def handle_data(self, data):
        if self.depth:
            self.buf.append(data)


def examples_from_help(help_html):
    p = PreExtractor()
    p.feed(help_html or '')
    out = []
    for b in p.blocks:
        lines = b.strip('\n').split('\n')
        indent = min((len(l) - len(l.lstrip()) for l in lines if l.strip()), default=0)
        out.append('\n'.join(l[indent:].rstrip() for l in lines).strip())
    return [b for b in out if b]


class TextExtractor(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.skip, self.parts = 0, []

    def handle_starttag(self, tag, attrs):
        if tag == 'pre':
            self.skip += 1
        if tag in ('li', 'div', 'br', 'p'):
            self.parts.append(' ')
        if tag == 'code' and not self.skip:
            self.parts.append('`')

    def handle_endtag(self, tag):
        if tag == 'pre':
            self.skip -= 1
        if tag == 'code' and not self.skip:
            self.parts.append('`')

    def handle_data(self, data):
        if not self.skip:
            self.parts.append(data)


def help_text(help_html):
    t = TextExtractor()
    t.feed(help_html or '')
    s = norm(''.join(t.parts))
    return re.sub(r'\s*Examples?:\s*$', '', s)


MISSING = {'cmd': [], 'arg': [], 'enum': [], 'macro': [], 'term': []}

# ---------------------------------------------------------------- markdown (guides)


def split_row(row):
    cells, cur, in_code = [], '', False
    body = row.strip()
    if body.startswith('|'):
        body = body[1:]
    if body.endswith('|') and not body.endswith('\\|'):
        body = body[:-1]
    i = 0
    while i < len(body):
        ch = body[i]
        if ch == '`':
            in_code = not in_code
        if ch == '|' and not in_code:
            cells.append(cur.strip())
            cur = ''
        else:
            cur += ch
        i += 1
    cells.append(cur.strip())
    return cells


def md(text, id_prefix):
    out, lines, i = [], text.split('\n'), 0
    toc = []
    while i < len(lines):
        line = lines[i]
        if line.startswith('```'):
            lang = line[3:].strip()
            j = i + 1
            buf = []
            while j < len(lines) and not lines[j].startswith('```'):
                buf.append(lines[j])
                j += 1
            out.append((result_block if lang == 'result' else code_block)('\n'.join(buf)))
            i = j + 1
            continue
        m = re.match(r'^%%CARD (.+)%%$', line)
        if m:
            out.append(f'\x01{m.group(1).strip()}\x01')
            i += 1
            continue
        m = re.match(r'^(#{2,4}) (.*)$', line)
        if m:
            level = len(m.group(1))
            title = m.group(2)
            # "### 제목 {#id}" gives the heading a fixed id that [글](#id) can link to
            own = re.search(r'\s*\{#([\w-]+)\}$', title)
            if own:
                title = title[:own.start()]
            hid = own.group(1) if own else f'{id_prefix}-{len(toc)}'
            if level == 3:
                toc.append((hid, title))
            tag = f'h{level}'
            out.append(f'<{tag} id="{hid}">{inline(title)}</{tag}>' if level == 3 or own else f'<{tag}>{inline(title)}</{tag}>')
            i += 1
            continue
        if line.startswith('|'):
            rows = []
            while i < len(lines) and lines[i].startswith('|'):
                rows.append(split_row(lines[i]))
                i += 1
            head, body = rows[0], [r for r in rows[2:]]
            t = ['<div class="tbl"><table><thead><tr>' + ''.join(f'<th>{inline(c)}</th>' for c in head) + '</tr></thead><tbody>']
            for r in body:
                # a short plain label in the first column must not wrap ("채팅 변수")
                first = r[0] if r else ''
                if 0 < len(first) <= 9 and ' ' in first and '`' not in first and '[' not in first:
                    r = [first.replace(' ', ' ')] + r[1:]
                t.append('<tr>' + ''.join(f'<td>{inline(c)}</td>' for c in r) + '</tr>')
            t.append('</tbody></table></div>')
            out.append(''.join(t))
            continue
        if re.match(r'^(\d+\.|-) ', line):
            ordered = line[0].isdigit()
            items = []
            while i < len(lines) and re.match(r'^(\d+\.|-) ', lines[i]):
                items.append(re.sub(r'^(\d+\.|-) ', '', lines[i]))
                i += 1
            # a numbered list split by a code block keeps counting from its first number
            start = re.match(r'^(\d+)\.', line)
            tag = 'ol' if ordered else 'ul'
            attr = f' start="{start.group(1)}"' if start and start.group(1) != '1' else ''
            out.append(f'<{tag}{attr}>' + ''.join(f'<li>{inline(x)}</li>' for x in items) + f'</{tag}>')
            continue
        if line.strip():
            buf = [line]
            i += 1
            while i < len(lines) and lines[i].strip() and not re.match(r'^(```|#|\||\d+\. |- )', lines[i]):
                buf.append(lines[i])
                i += 1
            out.append(f'<p>{inline(" ".join(buf))}</p>')
            continue
        i += 1
    return '\n'.join(out), toc


def card_md(lines):
    """Render card description lines: each line is a paragraph, list/table rows stay together."""
    text, prev = '', None
    for line in lines:
        kind = 'li' if re.match(r'^(\d+\.|-) ', line) else 'tr' if line.startswith('|') else None
        if text:
            text += '\n' if kind and kind == prev else '\n\n'
        text += line
        prev = kind
    return md(text, 'card')[0]

# ---------------------------------------------------------------- commands


def type_label(a):
    types = [TYPE_KO.get(t, t) for t in (a.get('t') or [])]
    s = ' · '.join(dict.fromkeys(types))
    if a.get('m'):
        s += ' …'
    return s


# /api lists each service with the internal name of its connection type; show what that means instead.
API_KIND = {
    'openai': 'Chat Completion 방식',
    'textgenerationwebui': 'Text Completion 방식',
    'kobold': 'KoboldAI Classic',
    'koboldhorde': 'AI Horde',
    'novel': 'NovelAI',
}


def enum_html(cmd_name, arg, ko):
    values = arg.get('e') or []
    if not values:
        return ''
    if cmd_name in ('findentry', 'getentryfield', 'setentryfield') and arg.get('n') == 'field':
        return '<a class="enum-link" href="#wi-fields">필드 목록 →</a>'
    items = []
    plain = all((isinstance(e, str) or len(e) < 2 or not e[1]) for e in values)
    for e in values:
        val, en = (e, None) if isinstance(e, str) else (e[0], e[1] if len(e) > 1 else None)
        desc = ko['e'].get(val) if ko else None
        if desc is None and en:
            desc = COMMON.get(norm(en))
            if desc is None and cmd_name == 'api':
                desc = API_KIND.get(en, en)
            if desc is None and en not in ('openai',):
                if not re.match(r'^\[\w+\??\] default', en):
                    desc = en
        items.append((val, desc))
    if {v for v, _ in items} <= {'true', 'false', 'on', 'off'} and all(d is None for _, d in items):
        return ''
    if plain and not any(d for _, d in items):
        chips = ''.join(f'<code>{html.escape(v)}</code>' for v, _ in items[:24])
        more = f'<span class="more">외 {len(items) - 24}개</span>' if len(items) > 24 else ''
        return f'<div class="chips">{chips}{more}</div>'
    rows = ''.join(
        f'<dt><code>{html.escape(v)}</code></dt><dd>{inline(d) if d else ""}</dd>' for v, d in items
    )
    if len(items) > 14:
        return f'<details class="enum"><summary>{len(items)}개 값</summary><dl>{rows}</dl></details>'
    return f'<dl class="enum">{rows}</dl>'


def arg_desc(cmd_name, a, ko, key):
    if ko:
        if isinstance(key, int) and key in ko['u']:
            return ko['u'][key], False
        name = key if isinstance(key, str) else a.get('n')
        if name and name in ko['a']:
            return ko['a'][name], False
    en = norm(a.get('d'))
    for k, v in COMMON.items():
        if k.lower() == en.lower():
            return v, False
    MISSING['arg'].append(f'{cmd_name} {key}: {en}')
    return en, True


def default_label(a):
    dv = a.get('dv')
    if dv in (None, '', '<null>'):
        return ''
    dv = str(dv)
    if dv.startswith('SillyTavern-20'):
        dv = 'SillyTavern-<현재 시각>'
    return f'<span class="def">= {html.escape(dv)}</span>'


def render_args(c, ko):
    rows = []
    for a in c['named']:
        desc, is_en = arg_desc(c['name'], a, ko, a['n'])
        rows.append(arg_row(c['name'], a, ko, f'<code>{html.escape(a["n"])}=</code>', desc, is_en))
    for i, a in enumerate(c['unnamed']):
        desc, is_en = arg_desc(c['name'], a, ko, i)
        label = f'<span class="pos">{i + 1}</span>' if len(c['unnamed']) > 1 else '<span class="pos">값</span>'
        rows.append(arg_row(c['name'], a, ko, label, desc, is_en, unnamed=True))
    if not rows:
        return ''
    return '<div class="args">' + ''.join(rows) + '</div>'


def arg_row(cmd_name, a, ko, label, desc, is_en, unnamed=False):
    cls = 'arg' + (' req' if a.get('r') else '') + (' un' if unnamed else '')
    lang = ' lang="en"' if is_en else ''
    return (
        f'<div class="{cls}"><div class="an">{label}</div>'
        f'<div class="at">{type_label(a)}{default_label(a)}</div>'
        f'<div class="ad"{lang}>{inline(desc)}{enum_html(cmd_name, a, ko)}</div></div>'
    )


def cmd_anchor(c):
    return ('lalib-' if c['src'] == 'lalib' else 'cmd-') + slug(c['name'])


def render_cmd(c):
    ko = (KO_LALIB if c['src'] == 'lalib' else KO_CORE).get(c['name'])
    aid = cmd_anchor(c)
    aliases = ''.join(f'<code>/{html.escape(a)}</code>' for a in c['aliases'])
    if ko and ko['d']:
        desc = card_md(ko['d'])
    else:
        desc = f'<p lang="en">{inline(help_text(c["help"]))}</p>'
        MISSING['cmd'].append(c['name'])
    notes = ''.join(f'<p class="note">{inline(n)}</p>' for n in (ko['n'] if ko else []))
    own_ex = ko and any(d.startswith('```') for d in ko['d'])
    exs = [] if own_ex else examples_from_help(c['help']) + (ko['ex'] if ko else [])
    if not own_ex and not exs and not c['named'] and not c['unnamed']:
        exs = [f'/{c["name"]}']
    caps = ko['x'] if ko else {}
    ex_html = ''.join(code_block(e, caps.get(i)) for i, e in enumerate(exs))
    search = ' '.join([c['name'], *c['aliases'], *(ko['d'] if ko else [])]).lower()
    return (
        f'<article class="card" id="{aid}" data-s="{html.escape(search)}">'
        f'<header><h4><a href="#{aid}">/{html.escape(c["name"])}</a></h4>'
        f'<div class="alias">{aliases}</div></header>'
        f'{desc}{notes}{render_args(c, ko)}{ex_html}</article>'
    )


def wi_field_table():
    sc = next(c for c in cmds if c['name'] == 'setentryfield')
    fields = next(a for a in sc['named'] if a['n'] == 'field')['e']
    rows = []
    for name, en in fields:
        m = re.match(r'^\[(\w+)(\??)\] default: (.*)$', en)
        typ, dv = (TYPE_KO.get(m.group(1), m.group(1)) + (' (비우면 전역 설정)' if m.group(2) else ''), m.group(3)) if m else ('', '')
        rows.append(
            f'<div class="arg"><div class="an"><code>{name}</code></div>'
            f'<div class="at">{html.escape(typ)}<span class="def">= {html.escape(dv)}</span></div>'
            f'<div class="ad">{inline(WI_FIELDS.get(name, ""))}</div></div>'
        )
    return (
        '<article class="card wide" id="wi-fields" data-s="월드 인포 필드 field findentry getentryfield setentryfield">'
        '<header><h4><a href="#wi-fields">월드 인포 항목 필드</a></h4></header>'
        '<p><code>/findentry</code>, <code>/getentryfield</code>, <code>/setentryfield</code>의 <code>field=</code>에 쓰는 이름입니다.</p>'
        f'<div class="args">{"".join(rows)}</div></article>'
    )

# ---------------------------------------------------------------- macros

MACRO_GROUPS = [
    ('m-names', '이름', lambda m: m['category'] == 'names'),
    ('m-char', '캐릭터·페르소나', lambda m: m['category'] == 'character'),
    ('m-chat', '채팅·메시지', lambda m: m['category'] == 'chat' and m['src']['name'] == 'chat-macros.js'),
    ('m-time', '날짜·시간', lambda m: m['category'] == 'time'),
    ('m-random', '무작위', lambda m: m['category'] == 'random'),
    ('m-var', '변수', lambda m: m['category'] == 'variable'),
    ('m-util', '조건·텍스트 도구', lambda m: m['category'] == 'utility'),
    ('m-state', '모델·실행 상태', lambda m: m['category'] == 'state'),
    ('m-instruct', '시스템 프롬프트·지시 모드', lambda m: m['src']['name'] == 'instruct-macros.js'),
    ('m-note', '작가 노트·추론', lambda m: m['src']['name'] in ('scripts/authors-note.js', 'scripts/reasoning.js')),
    ('m-ext', '기본 확장', lambda m: m['src']['isExtension']),
]
CTX_GROUPS = [
    ('short', 'm-short', '변수 축약 문법'),
    ('story', 'm-story', '이야기 문자열 전용'),
    ('template', 'm-template', '기능 템플릿 전용'),
    ('stscript', 'm-stscript', '스크립트·빠른 답장 전용'),
    ('lalib', 'm-lalib', 'LALib 전용'),
]


def macro_sig(m):
    if m.get('disp'):
        return m['disp'].replace('UTC\ufffd\ufffd(offset)', 'UTC±N').replace('[UTC\ufffd\ufffd(offset)]', '[UTC±N]')
    parts = [m['name']]
    for a in m['args']:
        parts.append(f'[{a["name"]}]' if a.get('optional') else a['name'])
    if m.get('list'):
        parts.append('항목1::항목2::…')
    return '{{' + '::'.join(parts) + '}}'


def render_macro(m):
    ko = KO_MACRO.get(m['name'])
    aid = 'macro-' + slug(m['name'])
    sig = macro_sig(m)
    aliases = ''.join(
        f'<code class="{"" if a["visible"] else "hidden"}">{{{{{html.escape(a["alias"])}}}}}</code>' for a in m['aliases']
    )
    if ko and ko['d']:
        desc = card_md(ko['d'])
    else:
        desc = f'<p lang="en">{inline(m["desc"])}</p>'
        MISSING['macro'].append(m['name'])
    notes = ''.join(f'<p class="note">{inline(n)}</p>' for n in (ko['n'] if ko else []))
    rows = []
    for i, a in enumerate(m['args']):
        d = (ko['u'].get(i) if ko else None) or a.get('description') or ''
        fake = {'t': a['type'] if isinstance(a['type'], list) else [a['type']], 'r': not a.get('optional'),
                'dv': a.get('defaultValue')}
        if fake['dv'] == 'null':
            fake['dv'] = None
        rows.append(
            f'<div class="arg{" req" if fake["r"] else ""} un"><div class="an"><span class="pos">{html.escape(a["name"])}</span></div>'
            f'<div class="at">{type_label(fake)}{default_label(fake)}</div><div class="ad">{inline(d)}</div></div>'
        )
    if m.get('list'):
        rows.append('<div class="arg req un"><div class="an"><span class="pos">항목…</span></div>'
                    f'<div class="at">문자열 …</div><div class="ad">{inline(ko["u"].get(0, "") if ko else "")}</div></div>')
    args = f'<div class="args">{"".join(rows)}</div>' if rows else ''
    # Korean examples written in the card (``` fences) replace the registry's English ones.
    own_ex = ko and any(d.startswith('```') for d in ko['d'])
    caps = ko['x'] if ko else {}
    exs = '' if own_ex else ''.join(
        code_block(e, caps.get(i)) for i, e in enumerate(m.get('ex') or []) if e.strip() != sig)
    search = ' '.join([m['name'], *(a['alias'] for a in m['aliases']), *(ko['d'] if ko else [])]).lower()
    return (
        f'<article class="card" id="{aid}" data-s="{html.escape(search)}">'
        f'<header><h4><a href="#{aid}">{html.escape(sig)}</a></h4><div class="alias">{aliases}</div></header>'
        f'{desc}{notes}{args}{exs}</article>'
    )


def render_ctx(item, idx):
    aid = f'ctx-{item["cat"]}-{idx}'
    desc = card_md(item['d'])
    notes = ''.join(f'<p class="note">{inline(n)}</p>' for n in item['n'])
    return (
        f'<article class="card" id="{aid}" data-s="{html.escape((item["sig"] + " " + " ".join(item["d"])).lower())}">'
        f'<header><h4><a href="#{aid}">{html.escape(item["sig"])}</a></h4></header>{desc}{notes}</article>'
    )

# ---------------------------------------------------------------- assemble


for c in cmds:
    aid = cmd_anchor(c)
    keys = [c['name'], *c['aliases']]
    for k in keys:
        if c['src'] != 'lalib' or k not in CMD_INDEX:
            CMD_INDEX[k] = aid
for m in macros:
    MACRO_INDEX[m['name'].lower()] = 'macro-' + slug(m['name'])
    for a in m['aliases']:
        MACRO_INDEX[a['alias'].lower()] = 'macro-' + slug(m['name'])

nav = []        # (section_id, title, [(anchor, label, count)])
sections = []

# Basics
def render_term(names, b, tid):
    other = ''.join(f'<code>{html.escape(n)}</code>' for n in names[1:])
    search = ' '.join([*names, *b['d']]).lower()
    return (
        f'<article class="card" id="{tid}" data-s="{html.escape(search)}">'
        f'<header><h4><a href="#{tid}">{html.escape(names[0])}</a></h4><div class="alias">{other}</div></header>'
        f'{card_md(b["d"])}</article>'
    )


def sample_card(key):
    """A real card shown inside a guide ("%%CARD /echo%%" or "%%CARD {{roll}}%%"), without its id."""
    if key.startswith('/'):
        c = next(c for c in cmds if c['name'] == key[1:] and c['src'] != 'lalib')
        card = render_cmd(c)
    else:
        m = next(m for m in macros if m['name'].lower() == key.strip('{}').lower())
        card = render_macro(m)
    card = re.sub(r'^<article class="card" id="([^"]+)"', r'<article class="card sample" data-of="\1"', card)
    return f'<div class="cards sample-wrap">{card}</div>'


def guide(name, prefix, gid=None):
    """Render a guide file into white panels; a sample card sits between two panels."""
    g_html, g_toc = md(open(KO / name, encoding='utf-8').read(), prefix)
    out = []
    for k, part in enumerate(g_html.split('\x01')):
        if k % 2:
            out.append(sample_card(part))
        elif part.strip():
            attr = f' id="{gid}"' if gid and not out else ''
            # every "###" section of a guide is its own card
            cards = ''.join(f'<section class="gcard">{c}</section>' for c in re.split(r'(?=<h3 )', part) if c.strip())
            out.append(f'<div class="guide"{attr}>{cards}</div>')
    return ''.join(out), g_toc


g_html, g_toc = guide('guide-basics.md', 'g-basic')
terms_html = ''.join(render_term(names, b, f'term-{i}') for i, (names, b) in enumerate(TERMS))
sections.append(('basics', '처음 시작하기', f'{g_html}'
                 f'<section class="group" id="terms"><h3>용어 풀이</h3><div class="cards">{terms_html}</div></section>'))
nav.append(('basics', '처음 시작하기', [(hid, t, None) for hid, t in g_toc] + [('terms', '용어 풀이', len(TERMS))]))

# Macros
g_html, g_toc = guide('guide-macro.md', 'g-macro', 'macro-guide')
parts = [g_html]
items = [('macro-guide', '문법', None)]
used = set()
for gid, title, pred in MACRO_GROUPS:
    ms = [m for m in macros if m['name'] not in used and pred(m)]
    used.update(m['name'] for m in ms)
    if not ms:
        continue
    parts.append(f'<section class="group" id="{gid}"><h3>{title}</h3>{group_note(gid)}<div class="cards">{"".join(render_macro(m) for m in ms)}</div></section>')
    items.append((gid, title, len(ms)))
left = [m for m in macros if m['name'] not in used]
assert not left, [m['name'] for m in left]
for cat, gid, title in CTX_GROUPS:
    its = [x for x in CTX if x['cat'] == cat]
    parts.append(f'<section class="group" id="{gid}"><h3>{title}</h3>{group_note(gid)}<div class="cards">{"".join(render_ctx(x, i) for i, x in enumerate(its))}</div></section>')
    items.append((gid, title, len(its)))
sections.append(('macros', '매크로', ''.join(parts)))
nav.append(('macros', '매크로', items))

# STscript
g_html, g_toc = guide('guide-stscript.md', 'g-st')
sections.append(('stscript', 'STscript', g_html))
nav.append(('stscript', 'STscript', [(hid, t, None) for hid, t in g_toc]))


# category names come from the older .md docs; show SillyTavern's own Korean UI names instead
CAT_TITLE = {
    '퀵 리플라이': '빠른 답장',
    '작가의 노트': '작가 노트',
    '월드인포(로어북)': '월드 인포(로어북)',
    '첨부파일/데이터뱅크': '첨부파일/데이터 저장소',
    '첨부파일·데이터뱅크': '첨부파일·데이터 저장소',
}


def command_sections(src_filter, cat_map, order, prefix, extra=None):
    groups = {}
    for c in cmds:
        if not src_filter(c):
            continue
        cat = cat_map.get(c['name'])
        if cat is None:
            print('unmapped', c['name'], file=sys.stderr)
            cat = '기타'
        groups.setdefault(cat, []).append(c)
    pos = {}
    for cat in order:
        for i, (n, cc) in enumerate((n, cc) for n, cc in cat_map.items() if cc == cat):
            pos[n] = i
    out, its = [], []
    for k, cat in enumerate(order + [c for c in groups if c not in order]):
        cs = sorted(groups.get(cat, []), key=lambda c: pos.get(c['name'], 999))
        if not cs:
            continue
        gid = f'{prefix}-{k}'
        body = ''.join(render_cmd(c) for c in cs)
        if extra and cat in extra:
            body += extra[cat]()
        title = CAT_TITLE.get(cat, cat).replace('/', '·')
        out.append(f'<section class="group" id="{gid}"><h3>{html.escape(title)}</h3>{group_note(prefix + ":" + cat)}<div class="cards">{body}</div></section>')
        its.append((gid, title, len(cs)))
    return ''.join(out), its


body, its = command_sections(lambda c: c['src'] != 'lalib', CORE_CAT, CORE_ORDER, 'c', {'월드인포(로어북)': wi_field_table})
sections.append(('commands', '슬래시 명령어', body))
nav.append(('commands', '슬래시 명령어', its))

g_html, g_toc = guide('guide-lalib.md', 'g-la', 'lalib-guide')
body, its = command_sections(lambda c: c['src'] == 'lalib', LALIB_CAT, LALIB_ORDER, 'l')
sections.append(('lalib', 'LALib', f'{g_html}{body}'))
nav.append(('lalib', 'LALib', [('lalib-guide', '식(계산식)', None)] + its))

# ---------------------------------------------------------------- page


def nav_html():
    out = []
    for sid, title, its in nav:
        lis = ''.join(
            f'<li><a href="#{a}" data-target="{a}">{html.escape(l.replace("`", ""))}{f"<span>{n}</span>" if n else ""}</a></li>'
            for a, l, n in its
        )
        out.append(f'<div class="nav-sec"><a class="nav-h" href="#{sid}">{title}</a><ul>{lis}</ul></div>')
    return ''.join(out)


counts = {
    'macro': len(macros),
    'core': sum(1 for c in cmds if c['src'] != 'lalib'),
    'lalib': sum(1 for c in cmds if c['src'] == 'lalib'),
}
main = ''.join(f'<section class="top" id="{sid}"><h2>{title}</h2>{body}</section>' for sid, title, body in sections)

template = open(ROOT / 'tools/template.html', encoding='utf-8').read()
page = (template
        .replace('%%NAV%%', nav_html())
        .replace('%%MAIN%%', main)
        .replace('%%ST%%', ST_VERSION)
        .replace('%%LALIB%%', LALIB_VERSION)
        .replace('%%DATE%%', BUILD_DATE)
        .replace('%%NMACRO%%', str(counts['macro']))
        .replace('%%NCORE%%', str(counts['core']))
        .replace('%%NLALIB%%', str(counts['lalib'])))
OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(page, encoding='utf-8')

report = ROOT / 'missing.txt'
with open(report, 'w', encoding='utf-8') as f:
    for k, v in MISSING.items():
        f.write(f'## {k} ({len(v)})\n' + '\n'.join(v) + '\n')
print('written', OUT, f'{len(page) // 1024} KB', {k: len(v) for k, v in MISSING.items()})
