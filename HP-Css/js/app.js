/* ============================================================
   설정
   ============================================================ */
const DATA_DIR = "data/";
const MANIFEST_URL = DATA_DIR + "manifest.txt";
const PAGE_SIZE = 9;

/* ============================================================
   상태
   ============================================================ */
let allEntries = [];
let filtered = [];
let currentPage = 1;
let activeCategory = "전체";
let activeExtension = "전체";
let activeDevice = "전체";
let searchTerm = "";

/* ============================================================
   DOM 참조
   ============================================================ */
const el = {
  stateArea: document.getElementById("stateArea"),
  grid: document.getElementById("cardGrid"),
  pagination: document.getElementById("pagination"),
  categoryList: document.getElementById("categoryList"),
  extensionChips: document.getElementById("extensionChips"),
  deviceChips: document.getElementById("deviceChips"),
  searchInput: document.getElementById("searchInput"),
  searchClear: document.getElementById("searchClear"),
  resultCount: document.getElementById("resultCount"),
  resetFilters: document.getElementById("resetFilters"),
  sidebar: document.getElementById("sidebar"),
  sidebarScrim: document.getElementById("sidebarScrim"),
  filterToggle: document.getElementById("filterToggle"),
  toast: document.getElementById("toast"),
  modalBackdrop: document.getElementById("modalBackdrop"),
  codeBlock: document.getElementById("codeBlock"),
  modalClose: document.getElementById("modalClose"),
  modalTitle: document.getElementById("modalTitle"),
  modalBadges: document.getElementById("modalBadges"),
  modalCode: document.getElementById("modalCode"),
  codeBlockLabel: document.getElementById("codeBlockLabel"),
  modalCopyBtn: document.getElementById("modalCopyBtn"),
  modalPreview: document.getElementById("modalPreview"),
  modalTip: document.getElementById("modalTip"),
  modalTipText: document.getElementById("modalTipText"),
  noticeBanner: document.getElementById("noticeBanner"),
  noticeText: document.getElementById("noticeText"),
  noticeContent: document.querySelector(".notice-content"),
  noticeToggle: document.getElementById("noticeToggle"),
  imgTooltip: document.getElementById("imgTooltip"),
  imgLightbox: document.getElementById("imgLightbox"),
  imgLightboxImg: document.getElementById("imgLightboxImg"),
};

/* ============================================================
   0) 공지 배너 (data/notice.txt) — CSS와 무관한 사이트 전체 안내문

   notice.txt 안에서 {{표시할 텍스트|이미지URL}} 형식으로 쓰면,
   그 텍스트에 마우스를 올리거나(포커스해도) 이미지가 롤오버로 뜬다.
   예: 맨 아래 {{Custom CSS 칸|images/custom-css-location.png}}에 붙여넣고
   ============================================================ */
function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// 이스케이프된 텍스트 안의 {{텍스트|이미지URL}}를 롤오버 span으로 치환
function renderNoticeHtml(rawText) {
  const escaped = escapeHtml(rawText);
  return escaped.replace(/\{\{([^|{}]+)\|([^{}]+)\}\}/g, (match, label, url) => {
    return `<span class="notice-tooltip" tabindex="0" data-tip-img="${url.trim()}">${label.trim()}</span>`;
  });
}

async function loadNotice() {
  try {
    const res = await fetch(DATA_DIR + "notice.txt", { cache: "no-store" });
    if (!res.ok) return; // 파일이 없으면 그냥 배너를 표시하지 않는다
    const text = (await res.text())
      .split("\n")
      .filter(line => !line.trim().startsWith("#"))
      .join("\n")
      .trim();
    if (!text) return;

    el.noticeText.innerHTML = renderNoticeHtml(text);
    el.noticeBanner.hidden = false;

    // 접었을 때(46px) 내용이 넘치면 "더 보기" 버튼을 보여준다.
    requestAnimationFrame(() => {
      const overflowing = el.noticeContent.scrollHeight > el.noticeContent.clientHeight + 4;
      el.noticeToggle.hidden = !overflowing;
    });
  } catch (err) {
    console.error("공지 배너 로드 실패:", err);
  }
}

el.noticeToggle.addEventListener("click", () => {
  const expanded = el.noticeContent.classList.toggle("expanded");
  el.noticeToggle.textContent = expanded ? "접기" : "더 보기";
});

el.modalPreview.addEventListener("click", () => {
  el.imgLightboxImg.src = el.modalPreview.src;
  el.imgLightbox.classList.add("open");
});

el.imgLightbox.addEventListener("click", () => {
  el.imgLightbox.classList.remove("open");
  el.imgLightboxImg.src = "";
});

/* 공지 배너 안 이미지 롤오버 텍스트: hover / focus 시 이미지 팝업 표시 */
function positionImgTooltip(target) {
  const rect = target.getBoundingClientRect();
  const tw = el.imgTooltip.offsetWidth || 260;
  const th = el.imgTooltip.offsetHeight || 160;
  const margin = 10;

  let left = rect.left + rect.width / 2 - tw / 2;
  left = Math.max(8, Math.min(left, window.innerWidth - tw - 8));

  let top = rect.top - th - margin;
  if (top < 8) top = rect.bottom + margin; // 위 공간이 부족하면 아래로 뒤집기

  el.imgTooltip.style.left = left + "px";
  el.imgTooltip.style.top = top + "px";
}

function showImgTooltip(target) {
  const url = target.dataset.tipImg;
  if (!url) return;
  el.imgTooltip.style.backgroundImage = `url("${url}")`;
  el.imgTooltip.classList.add("visible");
  positionImgTooltip(target);
}

function hideImgTooltip() {
  el.imgTooltip.classList.remove("visible");
}

el.noticeContent.addEventListener("mouseover", (e) => {
  const target = e.target.closest(".notice-tooltip");
  if (target) showImgTooltip(target);
});
el.noticeContent.addEventListener("mouseout", (e) => {
  const target = e.target.closest(".notice-tooltip");
  if (target) hideImgTooltip();
});
el.noticeContent.addEventListener("focusin", (e) => {
  const target = e.target.closest(".notice-tooltip");
  if (target) showImgTooltip(target);
});
el.noticeContent.addEventListener("focusout", (e) => {
  const target = e.target.closest(".notice-tooltip");
  if (target) hideImgTooltip();
});
window.addEventListener("scroll", hideImgTooltip, true);
window.addEventListener("resize", hideImgTooltip);

/* ============================================================
   1) 데이터 로드 & 파싱
   ============================================================ */
async function loadData() {
  el.stateArea.innerHTML = `<div class="state-msg">불러오는 중...</div>`;
  try {
    const manifestRes = await fetch(MANIFEST_URL, { cache: "no-store" });
    if (!manifestRes.ok) throw new Error("HTTP " + manifestRes.status);
    const manifestText = await manifestRes.text();
    const fileNames = parseManifest(manifestText);

    if (fileNames.length === 0) {
      el.stateArea.innerHTML = `<div class="state-msg"><strong>등록된 파일이 없습니다</strong>data/manifest.txt 에 불러올 .txt 파일 이름을 한 줄씩 적어주세요.</div>`;
      allEntries = [];
      buildSidebar();
      applyFilters();
      return;
    }

    const failedFiles = [];
    let idCounter = 0;
    const results = await Promise.all(fileNames.map(async (fileName) => {
      try {
        const res = await fetch(DATA_DIR + fileName, { cache: "no-store" });
        if (!res.ok) throw new Error("HTTP " + res.status);
        const text = await res.text();
        return parseEntries(text, fileName);
      } catch (err) {
        console.error(`"${fileName}" 로드 실패:`, err);
        failedFiles.push(fileName);
        return [];
      }
    }));

    allEntries = results.flat().map(entry => ({ ...entry, id: idCounter++ }));

    el.stateArea.innerHTML = "";
    if (allEntries.length === 0) {
      el.stateArea.innerHTML = `<div class="state-msg"><strong>등록된 CSS가 없습니다</strong>data/manifest.txt 에 적힌 파일들에 항목을 추가해 보세요.</div>`;
    } else if (failedFiles.length > 0) {
      el.stateArea.innerHTML = `<div class="state-msg" style="padding:14px 20px;font-size:13px;">⚠️ 다음 파일을 불러오지 못했습니다: <code>${failedFiles.map(escapeHtml).join(", ")}</code> (manifest.txt의 파일명과 실제 파일명이 일치하는지 확인해주세요)</div>`;
    }
    buildSidebar();
    applyFilters();
  } catch (err) {
    console.error(err);
    el.stateArea.innerHTML = `
      <div class="state-msg">
        <strong>데이터를 불러오지 못했습니다</strong>
        파일을 직접 더블클릭해서 열었다면(<code>file://</code>) 브라우저 보안 정책으로 fetch가 차단됩니다.<br>
        로컬 서버(예: <code>npx serve</code>)로 열거나, 배포된 사이트에서 확인해주세요.<br>
        <code>data/manifest.txt</code> 파일이 존재하는지도 확인해주세요.
      </div>`;
  }
}

// manifest.txt: 한 줄에 파일명 하나. "#"으로 시작하는 줄과 빈 줄은 무시.
function parseManifest(text) {
  return text
    .split("\n")
    .map(line => line.trim())
    .filter(line => line && !line.startsWith("#"));
}

function parseEntries(rawText, sourceFile = "") {
  // 주석 줄 제거. 단, [CSS코드] ~ [/CSS코드] 내부는 건드리지 않는다.
  // (CSS의 #id 선택자, #hex색상 등이 "#"으로 시작할 수 있기 때문)
  let inCode = false;
  const cleaned = rawText
    .split("\n")
    .filter(line => {
      const trimmed = line.trim();
      if (trimmed === "[CSS코드]") inCode = true;
      if (trimmed === "[/CSS코드]") { inCode = false; return true; }
      if (inCode) return true;
      return !trimmed.startsWith("#");
    })
    .join("\n");

  // "===" 단독 줄을 구분자로 사용
  const blocks = cleaned.split(/\n\s*===\s*\n?/).map(b => b.trim()).filter(Boolean);

  const entries = [];
  blocks.forEach((block, idx) => {
    const category = matchField(block, "카테고리");
    const extension = matchField(block, "확장프로그램");
    if (!category || !extension) return; // 필수 필드 없으면 건너뜀

    const title = matchField(block, "제목") || "제목 없음";
    const tagsRaw = matchField(block, "태그");
    const tags = tagsRaw ? tagsRaw.split(",").map(t => t.trim()).filter(Boolean) : [];
    const preview = matchField(block, "미리보기");
    const tip = matchField(block, "팁", true);
    const envRaw = matchField(block, "환경");
    const source = matchField(block, "출처");
    const devices = parseDevices(envRaw);

    const codeMatch = block.match(/\[CSS코드\]\s*\n?([\s\S]*?)\n?\[\/CSS코드\]/);
    const code = codeMatch ? codeMatch[1].trim() : "";
    if (!code && !tip) return; // 코드도 팁도 없으면 빈 항목이므로 건너뜀

    entries.push({
      id: idx,
      sourceFile,
      category: category.trim(),
      extension: extension.trim(),
      title: title.trim(),
      tags,
      preview: preview ? preview.trim() : "",
      tip: tip ? tip.trim() : "",
      source: source ? source.trim() : "",
      code,
      isTipOnly: !code,
      devices, // ["pc"], ["mobile"], ["pc","mobile"] 또는 [] (미지정 = 둘 다 해당)
    });
  });
  return entries;
}

// [환경] 필드 값을 파싱해서 ["pc"], ["mobile"], ["pc","mobile"] 중 하나로 정리한다.
// "컴퓨터/컴/PC/데스크탑" → pc, "모바일/폰/mobile/스마트폰" → mobile. 쉼표로 여러 개 가능.
// 필드 자체가 없거나 비어있으면 빈 배열([]) → 특정 환경을 가리지 않는(둘 다 해당) 항목으로 취급.
function parseDevices(envRaw) {
  if (!envRaw) return [];
  const set = new Set();
  envRaw.split(",").map(v => v.trim()).filter(Boolean).forEach(v => {
    if (/컴퓨터|데스크탑|desktop|^pc$/i.test(v) || v === "컴") set.add("pc");
    if (/모바일|스마트폰|mobile|phone/i.test(v) || v === "폰") set.add("mobile");
  });
  return [...set];
}

// 대괄호 필드 하나를 추출. multiline=true면 다음 [필드] 나 블록 끝까지 전부 가져옴.
const FIELD_NAMES = "카테고리|확장프로그램|제목|태그|환경|CSS코드|\\/CSS코드|미리보기|팁";

function matchField(block, name, multiline = false) {
  const pattern = multiline
    ? new RegExp(`\\[${name}\\]\\s*\\n?([\\s\\S]*?)(?=\\n\\[(?:${FIELD_NAMES})\\]|$)`)
    : new RegExp(`\\[${name}\\]\\s*([^\\n]*)`);
  const m = block.match(pattern);
  return m ? m[1] : "";
}

/* ============================================================
   2) 사이드바 구성 (카테고리 / 확장프로그램)
   ============================================================ */
function buildSidebar() {
  const categoryCounts = countBy(allEntries, "category");
  const extensionCounts = countBy(allEntries, "extension");

  el.categoryList.innerHTML = "";
  const allCatBtn = makeCategoryButton("전체", allEntries.length, true);
  el.categoryList.appendChild(allCatBtn);
  Object.entries(categoryCounts)
    .sort((a, b) => a[0].localeCompare(b[0], "ko"))
    .forEach(([name, count]) => {
      el.categoryList.appendChild(makeCategoryButton(name, count, false));
    });

  el.extensionChips.innerHTML = "";
  el.extensionChips.appendChild(makeChip("전체", allEntries.length, true));
  Object.entries(extensionCounts)
    .sort((a, b) => a[0].localeCompare(b[0], "ko"))
    .forEach(([name, count]) => {
      el.extensionChips.appendChild(makeChip(name, count, false));
    });

  // 환경(컴퓨터/모바일) 칩. [환경]을 적지 않은 항목은 둘 다에 포함된다.
  const pcCount = allEntries.filter(e => e.devices.length === 1 && e.devices[0] === "pc").length;
  const mobileCount = allEntries.filter(e => e.devices.length === 1 && e.devices[0] === "mobile").length;
  el.deviceChips.innerHTML = "";
  el.deviceChips.appendChild(makeDeviceChip("전체", "전체", allEntries.length, true));
  if (pcCount > 0) el.deviceChips.appendChild(makeDeviceChip("pc", "💻 컴퓨터", pcCount, false));
  if (mobileCount > 0) el.deviceChips.appendChild(makeDeviceChip("mobile", "📱 모바일", mobileCount, false));
}

function countBy(list, key) {
  const map = {};
  list.forEach(item => { map[item[key]] = (map[item[key]] || 0) + 1; });
  return map;
}

function makeCategoryButton(name, count, isDefault) {
  const li = document.createElement("li");
  const btn = document.createElement("button");
  btn.className = "category-btn" + (isDefault ? " active" : "");
  btn.dataset.category = name;
  btn.innerHTML = `<span>${escapeHtml(name)}</span><span class="count">${count}</span>`;
  btn.addEventListener("click", () => {
    activeCategory = name;
    currentPage = 1;
    document.querySelectorAll(".category-list button").forEach(b => b.classList.toggle("active", b.dataset.category === name));
    applyFilters();
    closeMobileSidebar();
  });
  li.appendChild(btn);
  return li;
}

function makeChip(name, count, isDefault) {
  const btn = document.createElement("button");
  btn.className = "chip" + (isDefault ? " active" : "");
  btn.dataset.extension = name;
  btn.textContent = `${name} (${count})`;
  btn.addEventListener("click", () => {
    activeExtension = name;
    currentPage = 1;
    document.querySelectorAll("#extensionChips .chip").forEach(c => c.classList.toggle("active", c.dataset.extension === name));
    applyFilters();
    closeMobileSidebar();
  });
  return btn;
}

function makeDeviceChip(value, label, count, isDefault) {
  const btn = document.createElement("button");
  btn.className = "chip" + (isDefault ? " active" : "");
  btn.dataset.device = value;
  btn.textContent = `${label} (${count})`;
  btn.addEventListener("click", () => {
    activeDevice = value;
    currentPage = 1;
    document.querySelectorAll("#deviceChips .chip").forEach(c => c.classList.toggle("active", c.dataset.device === value));
    applyFilters();
    closeMobileSidebar();
  });
  return btn;
}

/* ============================================================
   3) 검색 / 필터 적용
   ============================================================ */
function applyFilters() {
  const term = searchTerm.trim().toLowerCase();

  filtered = allEntries.filter(entry => {
    if (activeCategory !== "전체" && entry.category !== activeCategory) return false;
    if (activeExtension !== "전체" && entry.extension !== activeExtension) return false;
    // [환경]을 지정하지 않은 항목(devices.length === 0)은 컴퓨터/모바일 필터 어느 쪽에도 걸린다.
    if (activeDevice !== "전체" && !(entry.devices.length === 1 && entry.devices[0] === activeDevice)) return false;
    if (!term) return true;
    const haystack = [
      entry.title, entry.category, entry.extension, entry.tags.join(" "), entry.tip
    ].join(" ").toLowerCase();
    return haystack.includes(term);
  });

  el.resultCount.textContent = allEntries.length
    ? `${filtered.length}개의 CSS가 있습니다.`
    : "";

  renderPage();
}

/* ============================================================
   4) 카드 렌더링 + 페이지네이션
   ============================================================ */
function renderPage() {
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  if (currentPage > totalPages) currentPage = totalPages;

  const start = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);

  el.grid.innerHTML = "";

  if (allEntries.length > 0 && filtered.length === 0) {
    el.grid.innerHTML = `<div class="state-msg" style="grid-column: 1/-1;"><strong>일치하는 결과가 없습니다</strong>다른 검색어나 필터를 시도해보세요.</div>`;
  }

  pageItems.forEach(entry => el.grid.appendChild(buildCard(entry)));

  renderPagination(totalPages);
}

// entry.devices → 배지 HTML ("💻 컴퓨터" / "📱 모바일"). 카드와 모달에서 공용으로 사용.
function deviceBadgesHtml(entry) {
  return entry.devices.map(d => d === "pc"
    ? `<span class="badge badge-device">💻</span>`
    : `<span class="badge badge-device">📱</span>`
  ).join("");
}

// [팁] 본문에 쓸 수 있는 간단한 서식을 렌더링한다.
//   **굵게**            → <b>굵게</b>
//   `코드`               → <code>코드</code>
//   [[다른 항목의 제목]]  → 클릭하면 그 항목의 모달을 바로 연다
// escapeHtml로 먼저 이스케이프한 뒤에 치환하므로 그대로 안전하게 innerHTML에 넣을 수 있다.
function renderTipHtml(rawText) {
  let html = escapeHtml(rawText);
  html = html.replace(/`([^`\n]+)`/g, (m, code) => `<code>${code}</code>`);
  html = html.replace(/\*\*([^*\n]+)\*\*/g, (m, bold) => `<b>${bold}</b>`);
  html = html.replace(/\[\[([^\]\n]+)\]\]/g, (m, title) => {
    const t = title.trim();
    return `<button type="button" class="tip-link" data-title="${t}">${t}</button>`;
  });
  return html;
}

// /* 주석 */ 부분만 <span class="css-comment">로 감싼다. escapeHtml로 먼저 이스케이프하니 안전함.
function highlightCssComments(rawCode) {
  const escaped = escapeHtml(rawCode);
  return escaped.replace(/\/\*[\s\S]*?\*\//g, (m) => `<span class="css-comment">${m}</span>`);
}

// [[제목]] 링크 클릭 시 해당 항목의 모달을 연다. (모달 안에서 다시 열려도 내용만 교체됨)
document.addEventListener("click", (e) => {
  const link = e.target.closest(".tip-link");
  if (!link) return;
  e.preventDefault();
  const title = link.dataset.title;
  const target = allEntries.find(en => en.title === title);
  if (target) {
    openModal(target);
  } else {
    showToast(`"${title}" 항목을 찾을 수 없습니다`);
  }
});

function buildCard(entry) {
  const card = document.createElement("article");
  card.className = "card";
  card.tabIndex = 0;
  card.setAttribute("role", "button");
  card.setAttribute("aria-label", `${entry.title} 자세히 보기`);

  const previewHtml = entry.isTipOnly
    ? `<div class="card-note-preview">${escapeHtml(entry.tip)}</div>`
    : `<pre class="card-code">${highlightCssComments(entry.code)}</pre>`;

  const copyBtnHtml = `
    <button class="copy-btn" data-role="quick-copy" title="${entry.isTipOnly ? "팁 내용 복사" : "CSS 코드 복사"}">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="9" y="9" width="12" height="12" rx="2" stroke="currentColor" stroke-width="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10" stroke="currentColor" stroke-width="2"/></svg>
      복사
    </button>`;
    

  card.innerHTML = `
    <div class="card-top">
      <div class="card-badges">
        <span class="badge badge-category">${escapeHtml(entry.category)}</span>
        <span class="badge badge-extension">${escapeHtml(entry.extension)}</span>
        ${entry.isTipOnly ? `<span class="badge badge-tip">가이드</span>` : ""}
        ${deviceBadgesHtml(entry)}
        ${entry.source ? `<span class="badge badge-source">출처: ${escapeHtml(entry.source)}</span>` : ""}
      </div>
      <h3 class="card-title">${escapeHtml(entry.title)}</h3>
    </div>
    ${previewHtml}
    <div class="card-bottom">
      <div class="card-tags">${entry.tags.map(t => "#" + escapeHtml(t)).join(" ")}</div>
      ${copyBtnHtml}
    </div>
  `;

  card.querySelector('[data-role="quick-copy"]').addEventListener("click", (e) => {
    e.stopPropagation();
    copyText(entry.isTipOnly ? entry.tip : entry.code, e.currentTarget);
  });

  card.addEventListener("click", () => openModal(entry));
  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openModal(entry); }
  });

  return card;
}

function renderPagination(totalPages) {
  el.pagination.innerHTML = "";
  if (totalPages <= 1) return;

  const addBtn = (label, page, opts = {}) => {
    const btn = document.createElement("button");
    btn.textContent = label;
    if (opts.active) btn.classList.add("active");
    if (opts.disabled) btn.disabled = true;
    btn.addEventListener("click", () => {
      currentPage = page;
      renderPage();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    el.pagination.appendChild(btn);
  };

  addBtn("‹", currentPage - 1, { disabled: currentPage === 1 });

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(renderPage, 150);
  });

  const pages = pageRange(currentPage, totalPages);
  pages.forEach(p => {
    if (p === "...") {
      const span = document.createElement("span");
      span.className = "ellipsis";
      span.textContent = "…";
      el.pagination.appendChild(span);
    } else {
      addBtn(String(p), p, { active: p === currentPage });
    }
  });

  addBtn("›", currentPage + 1, { disabled: currentPage === totalPages });
}

function pageRange(current, total) {
  // 모바일에서는 +2개, pc에서는 +5개
  const delta = window.innerWidth <= 860 ? 2 : 5;
  const range = [];
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
      range.push(i);
    } else if (range[range.length - 1] !== "...") {
      range.push("...");
    }
  }
  return range;
}

/* ============================================================
   5) 모달
   ============================================================ */
function openModal(entry) {
  el.modalTitle.textContent = entry.title;
  el.modalBadges.innerHTML = `
    <span class="badge badge-category">${escapeHtml(entry.category)}</span>
    <span class="badge badge-extension">${escapeHtml(entry.extension)}</span>
    ${entry.isTipOnly ? `<span class="badge badge-tip">가이드</span>` : ""}
    ${deviceBadgesHtml(entry)}
    ${entry.source ? `<span class="badge badge-source">출처: ${escapeHtml(entry.source)}</span>` : ""}
  `;

  if (entry.preview) {
    el.modalPreview.src = entry.preview;
    el.modalPreview.hidden = false;
    el.modalPreview.style.display = "";
  } else {
    el.modalPreview.hidden = true;
    el.modalPreview.style.display = "none"; // CSS 우선순위와 무관하게 확실히 숨긴다
    el.modalPreview.removeAttribute("src");
  }

  if (entry.isTipOnly) {
    // 코드가 없는 순수 팁: 코드 박스를 "가이드" 텍스트 박스로 재사용한다.
    // (모노스페이스 그대로 두면 긴 문장이 줄바꿈 없이 옆으로 흘러버리므로
    //  prose 모드로 전환해 자연스럽게 줄바꿈되게 한다.)
    // is-guide 클래스로 어두운 코드 박스 스타일 대신 밝은 가이드 스타일을 입힌다.
    el.codeBlockLabel.textContent = "가이드";
    el.modalCode.innerHTML = renderTipHtml(entry.tip);
    el.modalCode.classList.add("prose");
    el.codeBlock.classList.add("is-guide");
    el.modalCopyBtn.onclick = () => copyText(entry.tip, el.modalCopyBtn);
    el.modalTip.hidden = true; // 본문에 이미 표시했으므로 하단 팁 박스는 숨김
  } else {
    el.codeBlockLabel.textContent = "CSS";
    el.modalCode.innerHTML = highlightCssComments(entry.code);
    el.modalCode.classList.remove("prose");
    el.codeBlock.classList.remove("is-guide");
    el.modalCopyBtn.onclick = () => copyText(entry.code, el.modalCopyBtn);

    if (entry.tip) {
      el.modalTipText.innerHTML = renderTipHtml(entry.tip);
      el.modalTip.hidden = false;
    } else {
      el.modalTip.hidden = true;
    }
  }

  el.modalBackdrop.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  el.modalBackdrop.classList.remove("open");
  document.body.style.overflow = "";
}

el.modalClose.addEventListener("click", closeModal);
el.modalBackdrop.addEventListener("click", (e) => {
  if (e.target === el.modalBackdrop) closeModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

/* ============================================================
   6) 복사 & 토스트
   ============================================================ */
async function copyText(text, btnEl) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    showToast("클립보드에 복사되었습니다");
    if (btnEl) {
      const original = btnEl.innerHTML;
      btnEl.classList.add("copied");
      btnEl.innerHTML = "복사됨 ✓";
      setTimeout(() => {
        btnEl.classList.remove("copied");
        btnEl.innerHTML = original;
      }, 1400);
    }
  } catch (err) {
    console.error(err);
    showToast("복사에 실패했습니다");
  }
}

let toastTimer = null;
function showToast(msg) {
  el.toast.textContent = msg;
  el.toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.toast.classList.remove("show"), 1800);
}

/* ============================================================
   7) 검색 입력 & 필터 초기화 & 모바일 사이드바
   ============================================================ */
let searchDebounce = null;
el.searchInput.addEventListener("input", (e) => {
  searchTerm = e.target.value;
  el.searchClear.hidden = searchTerm.length === 0;
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(() => {
    currentPage = 1;
    applyFilters();
  }, 150);
});

el.searchClear.addEventListener("click", () => {
  el.searchInput.value = "";
  searchTerm = "";
  el.searchClear.hidden = true;
  currentPage = 1;
  applyFilters();
  el.searchInput.focus();
});

el.resetFilters.addEventListener("click", () => {
  activeCategory = "전체";
  activeExtension = "전체";
  activeDevice = "전체";
  searchTerm = "";
  el.searchInput.value = "";
  el.searchClear.hidden = true;
  currentPage = 1;
  document.querySelectorAll(".category-list button").forEach(b => b.classList.toggle("active", b.dataset.category === "전체"));
  document.querySelectorAll("#extensionChips .chip").forEach(c => c.classList.toggle("active", c.dataset.extension === "전체"));
  document.querySelectorAll("#deviceChips .chip").forEach(c => c.classList.toggle("active", c.dataset.device === "전체"));
  applyFilters();
});

el.filterToggle.addEventListener("click", () => {
  const isOpen = el.sidebar.classList.toggle("open");
  el.sidebarScrim.classList.toggle("open", isOpen);
  el.filterToggle.setAttribute("aria-expanded", String(isOpen));
});
el.sidebarScrim.addEventListener("click", closeMobileSidebar);

function closeMobileSidebar() {
  el.sidebar.classList.remove("open");
  el.sidebarScrim.classList.remove("open");
  el.filterToggle.setAttribute("aria-expanded", "false");
}

/* ============================================================
   유틸
   ============================================================ */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* ============================================================
   시작
   ============================================================ */
loadNotice();
loadData();
