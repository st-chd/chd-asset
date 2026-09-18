const TOOLS_DATA = [
    {
        title: "정규식 디자인 미리보기",
        path: "index.html",
        helpTitle: "🔍 정규식 디자인 미리보기",
        helpDescription: "정규식 꾸미기 할 때 미리보기와 파일 저장이 가능합니다.",
        helpContent: `<p>정규식 꾸미기를 위한 텍스트를 입력하고, 실시간으로 적용되는 디자인 결과를 미리 확인할 수 있습니다.</p>
                      <p>어떻게 입력해야할지 모르겠다면 프리셋(COD, 에코 ... 등)을 눌러보세요.</p>
                      <hr style="margin: 15px 0;">
                      <p><strong>💡 사용 방법</strong></p>
                      <ol>
                        <li>채팅 내 출력 형식을 입력하세요.</li>
                        <li>정규식 패턴을 입력하세요.</li>
                        <li>디자인을 입력하세요.</li>
                        <li>실시간으로 결과를 확인할 수 있습니다.</li>
                      </ol>
                      <ul>
                        <li>기존 정규식 파일을 불러와 수정하거나 새로 저장할 수 있습니다.</li>
                        <li>내용보기/캡쳐보기 버튼으로 캡쳐 위치를 보기 쉽게 확인할 수 있습니다.</li>
                        <li>입력창은 [+칸 늘리기]버튼으로 쉽게 늘릴 수 있습니다.</li>
                        <li>박스,내용을 별도로 쓰고 싶다면 [+]버튼으로 추가하세요.</li>
                      </ul>
                      <hr style="margin: 15px 0;">
                      <p><strong>📌 메모</strong></p>
                      <p>ST에서 오류 발생시</p>
                      <ol>
                        <li>주석처리(/* */)지워보기</li>
                        <li>큰따옴표(" ")대신 작은따옴표(' ')사용해보기</li>
                        <li>줄바꿈 없애보기</li>
                        <li>공홈에 뭐가 잘못된거냐고 물어보기</li>
                      </ol>`
    },
    {
        title: "JSON & TXT 뷰어",
        path: "pages/theme-viewer/index.html",
        helpTitle: "🎨 테마 & TXT 뷰어",
        helpDescription: ".JSON파일 및 .txt파일을 볼 수 있습니다. ST 테마용 JSON파일이라면 색상값 일괄 붙여넣기/불러오기 및 파일 저장이 가능합니다.",
        helpContent: `<p>JSON, TXT 형식의 파일을 보거나 편집할 수 있습니다.</p>
                      <p>ST 테마파일을 불러온 경우 커스텀 색상 일괄 변경이 가능해요.</p>
                      <hr style="margin: 15px 0;">
                      <p><strong>💡 사용 방법</strong></p>
                      <ul>
                        <li>파일을 불러오세요.</li>
                        <li>(테마 파일의 경우) 색상 편집기 탭이 생깁니다.
                          <ol>
                            <li>[복사]를 누르면 현재 색상값이 모두 복사됩니다.</li>
                            <li>[붙여넣기]를 누르면 색상값을 한번에 바꿀 수 있습니다.</li>
                            <li>예시:</li>
                            <img src='{basePath}pages/theme-viewer/img/EG.png'>
                          </ol>
                        </li>
                        <li>찾기/바꾸기로 특정 텍스트를 찾거나 일괄적으로 바꿀 수 있습니다.</li>
                        <li>복사하거나 파일로 저장할 수 있습니다.</li>
                      </ul>`
    },
        {
        title: "텍스트 비교",
        path: "pages/Text-Comparison/index.html",
        helpTitle: "🔍 텍스트 비교",
        helpDescription: "두 개의 텍스트 파일을 비교하여 차이점을 확인할 수 있습니다.",
        helpContent: `<p>두 개의 텍스트 파일을 업로드하여 차이점을 비교할 수 있습니다.</p>
                      <p>차이점은 강조 표시되며, 각각의 파일 내용을 확인할 수 있습니다.</p>
                      <hr style="margin: 15px 0;">
                      <p><strong>💡 사용 방법</strong></p>
                      <ul>
                        <li>파일을 불러오세요.</li>
                        <li>(테마 파일의 경우) 색상 편집기 탭이 생깁니다.
                          <ol>
                            <li>[복사]를 누르면 현재 색상값이 모두 복사됩니다.</li>
                            <li>[붙여넣기]를 누르면 색상값을 한번에 바꿀 수 있습니다.</li>
                            <li>예시:</li>
                            <img src='{basePath}pages/theme-viewer/img/EG.png'>
                          </ol>
                        </li>
                        <li>찾기/바꾸기로 특정 텍스트를 찾거나 일괄적으로 바꿀 수 있습니다.</li>
                        <li>복사하거나 파일로 저장할 수 있습니다.</li>
                      </ul>`
    },
    {
        title: "스키마 디자인 미리보기",
        path: "pages/schema-design/index.html",
        helpTitle: "🗂️ 스키마 디자인 미리보기",
        helpDescription: "스키마 꾸미기 할 때 미리보기가 가능 합니다.",
        helpContent: `<p>특정 확장프로그램을 위한 스키마 텍스트를 입력하고, 실시간으로 적용되는 디자인 결과를 미리 확인할 수 있습니다.</p>
                      <p>어떻게 입력해야할지 모르겠다면 프리셋(레트로(열림), 레트로(닫힘))을 눌러보세요.</p>
                      <hr style="margin: 15px 0;">
                      <p><strong>💡 사용 방법</strong></p>
                      <ol>
                        <li>채팅에 출력된 스키마를 입력하세요.</li>
                        <li>추출값에서 {{변수명}}과 갯수를 확인하세요.</li>
                        <li>디자인을 입력하세요.</li>
                        <li>실시간으로 결과를 확인할 수 있습니다.</li>
                      </ol>`
    }
];

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[char]));
}

function escapeAttribute(value) {
    return escapeHtml(value).replace(/`/g, '&#96;');
}

function getNavbarBasePath() {
    const scriptTag = document.querySelector('script[src$="navbar.js"], script[src*="navbar.js?"]');
    if (!scriptTag) return '';

    const src = (scriptTag.getAttribute('src') || '').replace(/[?#].*$/, '');
    return src.replace(/js\/navbar\.js$/, '');
}

function getMenuTools() {
    return TOOLS_DATA.filter(tool => tool.showInMenu !== false);
}

class NavbarManager {
    constructor() {
        this.dropdown = document.querySelector('.dropdown');
        this.dropdownBtn = document.querySelector('.dropdown-btn');
        this.currentTitle = document.getElementById('currentPageTitle');
        this.helpBtn = document.getElementById('helpBtn');
        
        this.init();
    }

    init() {
        this.injectDropdownAndModal();

        this.helpModal = document.getElementById('helpModal');
        this.closeModal = this.helpModal ? this.helpModal.querySelector('.close') : null;

        // 드롭다운 토글
        if (this.dropdownBtn) {
            this.dropdownBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.dropdown.classList.toggle('active');
            });
        }

        // 외부 클릭 시 드롭다운 닫기
        document.addEventListener('click', () => {
            if (this.dropdown) {
                this.dropdown.classList.remove('active');
            }
        });

        // 메뉴 아이템 클릭
        document.querySelectorAll('.dropdown-content a').forEach(link => {
            link.addEventListener('click', (e) => {
                const title = e.target.getAttribute('data-title');
                this.updateTitle(title);
                this.dropdown.classList.remove('active');
            });
        });

        // 도움말 모달
        if (this.helpBtn && this.helpModal) {
            this.helpBtn.addEventListener('click', () => {
                this.helpModal.style.display = 'flex';
            });

            if (this.closeModal) {
                this.closeModal.addEventListener('click', () => {
                    this.helpModal.style.display = 'none';
                });
            }

            window.addEventListener('click', (e) => {
                if (e.target === this.helpModal) {
                    this.helpModal.style.display = 'none';
                }
            });

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.helpModal.style.display !== 'none') {
                    this.helpModal.style.display = 'none';
                }
            });

            // 모달 탭 처리
            const tabBtns = this.helpModal.querySelectorAll('.modal-tab-btn');
            const tabContents = this.helpModal.querySelectorAll('.modal-tab-content');
            
            if (tabBtns.length > 0) {
                tabBtns.forEach(btn => {
                    btn.addEventListener('click', () => {
                        const targetTab = btn.getAttribute('data-tab');
                        
                        // 모든 버튼과 콘텐츠의 active 클래스 제거
                        tabBtns.forEach(b => b.classList.remove('active'));
                        tabContents.forEach(c => c.classList.remove('active'));
                        
                        // 클릭한 탭 활성화
                        btn.classList.add('active');
                        const targetContent = this.helpModal.querySelector(`#${targetTab}`);
                        if (targetContent) {
                            targetContent.classList.add('active');
                        }
                    });
                });
            }
        }
    }

    injectDropdownAndModal() {
        // 경로 기준 찾기
        const basePath = getNavbarBasePath();

        // 현재 페이지 타이틀 가져오기
        let currentToolTitle = "";
        if (this.currentTitle) {
            currentToolTitle = this.currentTitle.textContent.replace('▼', '').trim();
        }

        // 드롭다운 채우기
        let dropdownContent = document.querySelector('.dropdown-content');
        if (!dropdownContent) {
            dropdownContent = document.createElement('div');
            dropdownContent.className = 'dropdown-content';
            if (this.dropdown) this.dropdown.appendChild(dropdownContent);
        }
        
        let dropdownHTML = '';
        getMenuTools().forEach(tool => {
            dropdownHTML += `<a href="${escapeAttribute(basePath + tool.path)}" data-title="${escapeAttribute(tool.title)}">${escapeHtml(tool.title)}</a>`;
        });
        dropdownContent.innerHTML = dropdownHTML;

        // 도움말 모달 채우기
        const currentToolData = TOOLS_DATA.find(t => t.title === currentToolTitle) || TOOLS_DATA[0];

        let toolsListHTML = '<ul>';
        getMenuTools().forEach(tool => {
            toolsListHTML += `<li><strong>${escapeHtml(tool.title)}:</strong> ${escapeHtml(tool.helpDescription)}</li>`;
        });
        toolsListHTML += '</ul>';

        const modalHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>📖 도움말</h2>
            <div id="helpContent">
                <div class="modal-tabs">
                    <button class="modal-tab-btn active" data-tab="tab-current">현재 도구</button>
                    <button class="modal-tab-btn" data-tab="tab-tools">도구 목록</button>
                    <button class="modal-tab-btn" data-tab="tab-general">공통 안내</button>
                </div>

                <!-- 현재 도구 탭 -->
                <div class="modal-tab-content active" id="tab-current">
                    <h3>${escapeHtml(currentToolData.helpTitle)}</h3>
                    ${currentToolData.helpContent.replace(/{basePath}/g, escapeAttribute(basePath))}
                </div>

                <!-- 도구 목록 탭 -->
                <div class="modal-tab-content" id="tab-tools">
                    <h3>🛠️ 도구 목록</h3>
                    ${toolsListHTML}
                </div>

                <!-- 공통 안내 탭 -->
                <div class="modal-tab-content" id="tab-general">
                    <h3>🎯 메뉴 선택</h3>
                    <p>상단 메뉴를 클릭하여 원하는 도구를 선택하세요.</p>
                    <h3>🎨 테마 전환</h3>
                    <p>🌙 버튼으로 밝은/어두운 테마를 전환할 수 있습니다.</p>
                </div>
            </div>
        </div>
        `;

        let helpModal = document.getElementById('helpModal');
        if (!helpModal) {
            helpModal = document.createElement('div');
            helpModal.id = 'helpModal';
            helpModal.className = 'modal';
            document.body.appendChild(helpModal);
        }
        helpModal.innerHTML = modalHTML;
    }

    updateTitle(title) {
        if (!this.currentTitle) return;
        
        const textNode = Array.from(this.currentTitle.childNodes)
            .find(node => node.nodeType === Node.TEXT_NODE);
        
        if (textNode) {
            textNode.textContent = title + ' ';
        } else {
            this.currentTitle.insertBefore(
                document.createTextNode(title + ' '),
                this.currentTitle.firstChild
            );
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.navbarManager = new NavbarManager();
});
