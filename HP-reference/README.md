# 수정 방법

1. 고칠 문구가 어느 파일에 있는지 찾습니다. 문구 일부를 `_src/ko` 폴더에서 검색하면 가장 빠릅니다.

| 고치려는 곳 | 파일 |
|---|---|
| 처음 시작하기 | `guide-basics.md` |
| 매크로 문법 | `guide-macro.md` |
| STscript 문법 | `guide-stscript.md` |
| LALib 식 설명 | `guide-lalib.md` |
| 용어 풀이 | `glossary.txt` |
| 매크로 카드 | `macro1.txt` ~ `macro4.txt`, `macros_ctx.txt` |
| 슬래시 명령 카드 | `core1.txt` ~ `core7.txt` |
| LALib 명령 카드 | `lalib1.txt` ~ `lalib3.txt` |
| 묶음 제목 아래 안내문 | `groupnotes.txt` |

2. 파일을 고친 뒤 빌드합니다.

```bash
python -X utf8 _src/tools/build.py
```

3. 새로 만들어진 `index.html`을 열어 확인하고, `_src`와 `index.html`을 같이 커밋해서 올립니다.

색·배치 같은 화면 모양은 `_src/tools/template.html`에 있고, 이것도 고친 뒤 빌드해야 반영됩니다.

카드 파일에서는 줄 맨 앞의 `@`, `.`, `#숫자`, `=`, `!`가 칸을 구분하는 표시입니다. 이 기호들은 그대로 두고 뒤의 글만 고치세요. 빌드 후 `_src/missing.txt`에 항목이 생기면 링크가 깨졌다는 뜻입니다.