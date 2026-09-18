window.editor = window.editor || null;
window.viewMode = window.viewMode || 'content';
window.rawInput = window.rawInput || null;
window.regexInput = window.regexInput || null;
window.trimInput = window.trimInput || null;
window.renderTarget = window.renderTarget || null;
window.regexError = window.regexError || null;
window.groupList = window.groupList || null;
window.presetContainer = window.presetContainer || null;
window.searchMarks = window.searchMarks || [];
window.baseRegexRule = window.baseRegexRule || { name: '기본', regex: '', template: '', enabled: true, trimStrings: [] };
window.baseRegexRule.name = window.baseRegexRule.name || '기본';
window.baseRegexRule.enabled = window.baseRegexRule.enabled !== false;
window.baseRegexRule.trimStrings = Array.isArray(window.baseRegexRule.trimStrings) ? window.baseRegexRule.trimStrings : [];
window.regexStages = window.regexStages || [];
window.activeRegexStageId = window.activeRegexStageId || 'base';
window.isRegexStageEditing = window.isRegexStageEditing || false;
window.isLoadingRegexStage = false;

/* ?좏떥由ы떚 ?⑥닔 */
function getTemplateValue() {
  return window.editor ? window.editor.getValue() : document.getElementById('template-input').value;
}

function setTemplateValue(value) {
  if (window.editor) {
    window.editor.setValue(value);
  } else {
    document.getElementById('template-input').value = value;
  }
}

function showMessage(message) {
  let toast = document.getElementById('app-toast-message');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'app-toast-message';
    toast.setAttribute('role', 'status');
    toast.style.position = 'fixed';
    toast.style.left = '50%';
    toast.style.bottom = '24px';
    toast.style.transform = 'translateX(-50%)';
    toast.style.zIndex = '2000';
    toast.style.maxWidth = 'min(420px, calc(100vw - 32px))';
    toast.style.padding = '10px 14px';
    toast.style.borderRadius = '8px';
    toast.style.background = 'rgba(20, 20, 20, 0.92)';
    toast.style.color = '#fff';
    toast.style.fontSize = '13px';
    toast.style.lineHeight = '1.4';
    toast.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.25)';
    toast.style.opacity = '0';
    toast.style.pointerEvents = 'none';
    toast.style.transition = 'opacity 0.2s ease';
    document.body.appendChild(toast);
  }

  clearTimeout(showMessage.hideTimer);
  toast.textContent = message;
  toast.style.opacity = '1';
  showMessage.hideTimer = setTimeout(() => {
    toast.style.opacity = '0';
  }, 1800);
}

function normalizeTrimStrings(trimStrings) {
  if (!Array.isArray(trimStrings)) return [];
  return trimStrings
    .filter(value => typeof value === 'string')
    .map(value => value.trim())
    .filter(Boolean);
}

function getTrimInputValue() {
  if (!window.trimInput) return [];
  return normalizeTrimStrings(window.trimInput.value.split(/\r?\n/));
}

function setTrimInputValue(trimStrings) {
  if (!window.trimInput) return;
  window.trimInput.value = normalizeTrimStrings(trimStrings).join('\n');
  if (!window.trimInput.closest('.collapsed')) {
    autoResizeTextarea(window.trimInput);
  }
}

function applyTrimStrings(value, trimStrings) {
  return normalizeTrimStrings(trimStrings).reduce((result, trimString) => {
    return result.split(trimString).join('');
  }, value || '');
}

function createRegexStage() {
  return {
    id: `stage-${generateUUID()}`,
    name: getNextRegexStageName(),
    regex: '',
    template: '',
    trimStrings: [],
    enabled: true
  };
}

function getNextRegexStageName() {
  const usedNumbers = window.regexStages
    .map(stage => (stage.name || '').match(/^추가(\d+)$/))
    .filter(Boolean)
    .map(match => Number(match[1]));
  const maxNumber = usedNumbers.length ? Math.max(...usedNumbers) : 0;
  return `추가${maxNumber + 1}`;
}

function getActiveRegexStage() {
  if (window.activeRegexStageId === 'base') return window.baseRegexRule;
  return window.regexStages.find(stage => stage.id === window.activeRegexStageId) || window.baseRegexRule;
}

function persistActiveRegexStageValues() {
  if (window.isLoadingRegexStage) return;
  const stage = getActiveRegexStage();
  stage.regex = window.regexInput ? window.regexInput.value : stage.regex;
  stage.template = getTemplateValue();
  stage.trimStrings = getTrimInputValue();
}

function loadActiveRegexStageValues() {
  const stage = getActiveRegexStage();
  window.isLoadingRegexStage = true;
  if (window.regexInput) {
    window.regexInput.value = stage.regex || '';
    autoResizeTextarea(window.regexInput);
  }
  setTemplateValue(stage.template || '');
  setTrimInputValue(stage.trimStrings || []);
  window.isLoadingRegexStage = false;
}

function parseRegexInput(regexStr) {
  let pattern;
  let flags;
  const slashMatch = regexStr.trim().match(/^\/(.*)\/([a-z]*)$/s);
  if (slashMatch) {
    pattern = slashMatch[1];
    flags = slashMatch[2];
  } else {
    pattern = regexStr.trim();
    flags = '';
  }

  return new RegExp(pattern, flags);
}

function replaceWithTemplate(input, regexStr, template, debugMode = false, trimStrings = []) {
  if (!regexStr.trim()) {
    return {
      output: input,
      matches: [],
      changed: false
    };
  }

  const re = parseRegexInput(regexStr);
  const matches = [];
  let changed = false;
  const output = input.replace(re, (...args) => {
    const match = args[0];
    const groups = args.slice(1, -2);
    const matchArray = [match, ...groups].map(value => applyTrimStrings(value, trimStrings));
    matches.push(matchArray);
    changed = true;

    return template.replace(/\$(\d+)/g, (fullMatch, num) => {
      const index = parseInt(num, 10);
      if (index >= matchArray.length) return fullMatch;
      if (debugMode) {
        return `<span style="background:yellow; color:red;">$${index}</span>`;
      }
      return matchArray[index] || '';
    });
  });

  return { output, matches, changed };
}

/* 초기???⑥닔 */
function initApp() {
  window.rawInput = document.getElementById('raw-input');
  window.regexInput = document.getElementById('regex-input');
  window.trimInput = document.getElementById('trim-input');
  window.renderTarget = document.getElementById('render-target');
  window.regexError = document.getElementById('regex-error');
  window.groupList = document.getElementById('group-list');
  window.presetContainer = document.getElementById('preset-container');
  const textArea = document.getElementById('template-input');

  if (!window.rawInput || !window.regexInput || !window.renderTarget || !window.regexError || !window.groupList) {
    console.error('?꾩닔 DOM ?붿냼瑜?찾을 ???놁뒿?덈떎.');
    return;
  }

  if (window.editor && window.editor.toTextArea) {
    try {
      window.editor.toTextArea();
    } catch (e) {}
  }

  if (textArea) {
    window.editor = CodeMirror.fromTextArea(textArea, {
      mode: 'htmlmixed',
      lineNumbers: true,
      lineWrapping: true,
      theme: 'default',
      colorpicker: {
          mode: 'edit',
          type: 'sketch'
      }
    });
    window.editor.on('change', () => {
      persistActiveRegexStageValues();
      render();
    });
  }

  if (window.rawInput) window.rawInput.addEventListener('input', render);
  if (window.regexInput) {
    window.regexInput.addEventListener('input', () => {
      persistActiveRegexStageValues();
      render();
    });
  }

  if (window.trimInput) {
    window.trimInput.addEventListener('input', () => {
      persistActiveRegexStageValues();
      render();
    });
  }

  if (window.regexInput) {
    window.regexInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        render();
      }
    });
  }

  const findQuery = document.getElementById('find-query');
  if (findQuery) {
    findQuery.addEventListener('input', () => {
      performSearch();
    });
    findQuery.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.shiftKey ? findText('prev') : findText('next');
      }
    });
  }

  initPresets();
  window.baseRegexRule.regex = window.regexInput.value;
  window.baseRegexRule.template = getTemplateValue();
  window.baseRegexRule.trimStrings = getTrimInputValue();
  initStageTabInteractions();
  renderStageControls();
  setViewMode('content');
  initMobileView();
  initResizer();
}

/* 모바??초기 酉?*/
function initMobileView() {
  if (window.innerWidth <= 768) {
    switchMobileTab('preview');
  }
}

/* ?띿뒪??찾기 */
function clearSearchHighlights() {
  window.searchMarks.forEach(mark => mark.clear());
  window.searchMarks = [];
}

function performSearch() {
  if (!window.editor) return;
  const query = document.getElementById('find-query').value;
  clearSearchHighlights();
  if (!query) return;

  let cursor = window.editor.getSearchCursor(query, { line: 0, ch: 0 }, { caseFold: true });
  while (cursor.findNext()) {
    const mark = window.editor.markText(cursor.from(), cursor.to(), {
      className: 'search-highlight'
    });
    window.searchMarks.push(mark);
  }
}

function findText(direction = 'next') {
  if (!window.editor) return;
  const query = document.getElementById('find-query').value;
  if (!query) {
    showMessage("검색어를 입력해주세요.");
    return;
  }

  const startPos = (direction === 'next') ? window.editor.getCursor('to') : window.editor.getCursor('from');
  let cursor = window.editor.getSearchCursor(query, startPos, { caseFold: true });

  if (!cursor.find(direction === 'prev')) {
    const loopStart = (direction === 'next') ? { line: 0, ch: 0 } : { line: window.editor.lineCount(), ch: 0 };
    cursor = window.editor.getSearchCursor(query, loopStart, { caseFold: true });
    if (!cursor.find(direction === 'prev')) {
      showMessage("일치하는 단어가 없습니다.");
      return;
    }
  }

  clearSearchHighlights();

  let allCursor = window.editor.getSearchCursor(query, { line: 0, ch: 0 }, { caseFold: true });
  while (allCursor.findNext()) {
    const mark = window.editor.markText(allCursor.from(), allCursor.to(), {
      className: 'search-highlight'
    });
    window.searchMarks.push(mark);
  }

  const currentMark = window.editor.markText(cursor.from(), cursor.to(), {
    className: 'search-highlight-current'
  });
  window.searchMarks.push(currentMark);

  const isMobile = window.innerWidth <= 768;
  if (isMobile) {
    const from = cursor.from();
    const to = cursor.to();
    window.editor.setSelection(from, to);
    window.editor.focus();
    setTimeout(() => {
      const cmContent = window.editor.getWrapperElement().querySelector('.CodeMirror-code');
      if (cmContent) {
        const range = document.createRange();
        const selection = window.getSelection();
        const lines = cmContent.querySelectorAll('.CodeMirror-line');
        if (lines.length > from.line) {
          const textNode = lines[from.line].firstChild;
          if (textNode) {
            range.setStart(textNode, Math.min(from.ch, textNode.textContent.length));
            range.setEnd(textNode, Math.min(to.ch, textNode.textContent.length));
            selection.removeAllRanges();
            selection.addRange(range);
          }
        }
      }
    }, 50);
    window.editor.scrollIntoView({ from, to }, 150);
  } else {
    window.editor.setSelection(cursor.from(), cursor.to());
    window.editor.scrollIntoView({ from: cursor.from(), to: cursor.to() }, 150);
  }
}

function toggleReplaceBox() {
  const box = document.getElementById('replace-box');
  const btn = document.getElementById('toggle-replace-btn');
  const isActive = box.classList.toggle('active');
  btn.textContent = isActive ? '접기' : '바꾸기';
  if (isActive) {
    setTimeout(() => {
      document.getElementById('replace-query').focus();
    }, 10);
  }
}

function replaceOne() {
  if (!window.editor) return;
  const findVal = document.getElementById('find-query').value;
  const replaceVal = document.getElementById('replace-query').value;
  if (!findVal) {
    showMessage("검색어를 먼저 입력해주세요.");
    return;
  }

  const startPos = window.editor.getCursor('to');
  let cursor = window.editor.getSearchCursor(findVal, startPos, { caseFold: true });
  if (!cursor.findNext()) {
    cursor = window.editor.getSearchCursor(findVal, { line: 0, ch: 0 }, { caseFold: true });
    if (!cursor.findNext()) {
      showMessage("일치하는 단어가 없습니다.");
      return;
    }
  }

  cursor.replace(replaceVal);
  window.editor.setSelection(cursor.from(), cursor.to());
  window.editor.scrollIntoView({ from: cursor.from(), to: cursor.to() }, 150);
  setTimeout(() => {
    performSearch();
  }, 10);
}

function replaceAll() {
  if (!window.editor) return;
  const findVal = document.getElementById('find-query').value;
  const replaceVal = document.getElementById('replace-query').value;
  if (!findVal) {
    showMessage("검색어를 먼저 입력해주세요.");
    return;
  }

  let cursor = window.editor.getSearchCursor(findVal, { line: 0, ch: 0 }, { caseFold: true });
  let count = 0;
  window.editor.operation(function () {
    while (cursor.findNext()) {
      cursor.replace(replaceVal);
      count++;
    }
  });

  clearSearchHighlights();
  if (count === 0) {
    showMessage("일치하는 단어가 없습니다.");
  } else {
    showMessage(count + "개를 변경했습니다.");
  }
}

/* ?대┰蹂대뱶 복사 */
function writeClipboardText(text) {
  const clipboardWrite = navigator.clipboard && navigator.clipboard.writeText
    ? navigator.clipboard.writeText(text)
    : Promise.reject(new Error('Clipboard API unavailable'));

  return clipboardWrite.catch(() => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand('copy');
    document.body.removeChild(textarea);
    if (!copied) throw new Error('Fallback copy failed');
  });
}

function copyToClipboard(id, btn) {
  let textToCopy = "";
  if (id === 'template-input') {
    textToCopy = getTemplateValue();
  } else {
    const el = document.getElementById(id);
    if (el) textToCopy = el.value;
  }

  if (!textToCopy) {
    showMessage("복사할 내용이 없습니다.");
    return;
  }

  writeClipboardText(textToCopy).then(() => {
    const oldText = btn.innerText;
    btn.innerText = "복사?꾨즺!";
    btn.classList.add('success');
    setTimeout(() => {
      btn.innerText = oldText;
      btn.classList.remove('success');
    }, 1200);
  }).catch(err => {
    console.error('복사 ?ㅽ뙣:', err);
    showMessage("복사에 실패했습니다.");
  });
}

/* ?꾨━??愿由?*/
function initPresets() {
  if (typeof window.customPresets === 'undefined') {
    console.warn('customPresets媛 로드?섏? ?딆븯?듬땲??');
    return;
  }

  const leftGroup = document.querySelector('.preset-bar-left');
  if (!leftGroup) {
    console.error('.preset-bar-left瑜?찾을 ???놁뒿?덈떎.');
    return;
  }

  window.customPresets.forEach(p => {
    const btn = document.createElement('button');
    btn.className = 'preset-btn';
    btn.innerText = p.name;
    btn.onclick = () => {
      leftGroup.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (window.rawInput) window.rawInput.value = p.input || "";
      if (Array.isArray(p.rules) && p.rules.length > 0) {
        importRegexRules(p.rules);
      } else {
        window.baseRegexRule.name = '기본';
        window.baseRegexRule.regex = p.regex || "";
        window.baseRegexRule.template = p.template || "";
        window.baseRegexRule.trimStrings = [];
        window.baseRegexRule.enabled = true;
        window.regexStages = [];
      }
      window.activeRegexStageId = 'base';
      window.isRegexStageEditing = false;
      loadActiveRegexStageValues();
      renderStageControls();
      if (window.rawInput) autoResizeTextarea(window.rawInput);
      if (window.regexInput) autoResizeTextarea(window.regexInput);
      render();
    };
    leftGroup.appendChild(btn);
  });
}

function renderStageControls() {
  const tabs = document.getElementById('stage-tabs');
  const controls = document.getElementById('stage-edit-controls');
  if (!tabs || !controls) return;

  tabs.innerHTML = '';

  const baseTab = document.createElement('button');
  baseTab.className = `stage-tab ${window.activeRegexStageId === 'base' ? 'active' : ''} ${window.baseRegexRule.enabled !== false ? '' : 'disabled'}`;
  baseTab.type = 'button';
  baseTab.dataset.stageId = 'base';
  baseTab.textContent = window.baseRegexRule.name || '기본';
  bindStageButtonAction(baseTab);
  tabs.appendChild(baseTab);

  window.regexStages.forEach((stage, index) => {
    const tab = document.createElement('button');
    tab.className = `stage-tab ${window.activeRegexStageId === stage.id ? 'active' : ''} ${stage.enabled ? '' : 'disabled'}`;
    tab.type = 'button';
    tab.dataset.stageId = stage.id;
    tab.textContent = stage.name || `추가${index + 1}`;
    bindStageButtonAction(tab);
    tabs.appendChild(tab);
  });

  renderStageActionButtons();
  renderActiveStageControls();
}

function renderStageActionButtons() {
  const actions = document.getElementById('stage-tab-actions');
  if (!actions) return;

  actions.innerHTML = '';
  if (window.activeRegexStageId === 'base' && window.regexStages.length === 0) {
    actions.classList.remove('active');
    return;
  }

  const stage = findStage(window.activeRegexStageId);
  if (!stage) {
    actions.classList.remove('active');
    return;
  }

  actions.classList.add('active');

  const editBtn = document.createElement('button');
  editBtn.className = `stage-icon-btn ${window.isRegexStageEditing ? 'active' : ''}`;
  editBtn.type = 'button';
  editBtn.textContent = String.fromCharCode(9998);
  editBtn.title = 'Edit';
  editBtn.addEventListener('click', () => {
    window.isRegexStageEditing = !window.isRegexStageEditing;
    renderStageControls();
  });

  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'stage-icon-btn';
  cancelBtn.type = 'button';
  cancelBtn.textContent = '취소';
  cancelBtn.title = '취소';
  cancelBtn.addEventListener('click', () => {
    window.isRegexStageEditing = false;
    renderStageControls();
  });

  actions.append(editBtn, cancelBtn);
}

function bindStageButtonAction(button) {
  const runAction = () => {
    const stageId = button.dataset.stageId;
    if (stageId) {
      selectRegexStageInternal(stageId);
      return;
    }
    window.addRegexStage();
  };

  button.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    runAction();
  });
  button.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    runAction();
  });
}

function initStageTabInteractions() {
  const addButton = document.querySelector('.stage-add-tab');
  if (!addButton || addButton.dataset.bound === 'true') return;
  addButton.dataset.bound = 'true';
  bindStageButtonAction(addButton);
}

function renderActiveStageControls() {
  const controls = document.getElementById('stage-edit-controls');
  if (!controls) return;

  controls.innerHTML = '';
  if ((window.activeRegexStageId === 'base' && window.regexStages.length === 0) || !window.isRegexStageEditing) {
    controls.classList.remove('active');
    return;
  }

  const stage = findStage(window.activeRegexStageId);
  if (!stage) {
    window.activeRegexStageId = 'base';
    window.isRegexStageEditing = false;
    controls.classList.remove('active');
    return;
  }

  controls.classList.add('active');
  const activeStageId = window.activeRegexStageId;

  const nameInput = document.createElement('input');
  nameInput.className = 'stage-name-input';
  nameInput.type = 'text';
  nameInput.value = stage.name;
  nameInput.placeholder = '단계 이름';
  nameInput.addEventListener('input', () => {
    stage.name = nameInput.value;
    renderStageControls();
  });

  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'stage-icon-btn';
  toggleBtn.type = 'button';
  toggleBtn.textContent = stage.enabled ? '비활성화' : '활성화';
  toggleBtn.title = '활성화/비활성화';
  toggleBtn.addEventListener('click', () => toggleRegexStageEnabled(activeStageId));

  const upBtn = document.createElement('button');
  upBtn.className = 'stage-icon-btn';
  upBtn.type = 'button';
  upBtn.textContent = '←';
  upBtn.title = '왼쪽으로 이동';
  upBtn.addEventListener('click', () => moveRegexStage(activeStageId, -1));

  const downBtn = document.createElement('button');
  downBtn.className = 'stage-icon-btn';
  downBtn.type = 'button';
  downBtn.textContent = '→';
  downBtn.title = '오른쪽으로 이동';
  downBtn.addEventListener('click', () => moveRegexStage(activeStageId, 1));

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'stage-icon-btn danger';
  deleteBtn.type = 'button';
  deleteBtn.textContent = '삭제';
  deleteBtn.title = '삭제';
  deleteBtn.addEventListener('click', () => removeRegexStage(activeStageId));

  controls.append(nameInput, toggleBtn, upBtn, downBtn, deleteBtn);
}

function findStage(stageId) {
  if (stageId === 'base') return window.baseRegexRule;
  return window.regexStages.find(stage => stage.id === stageId);
}

function swapStageData(left, right) {
  const leftSnapshot = {
    name: left.name,
    regex: left.regex,
    template: left.template,
    trimStrings: normalizeTrimStrings(left.trimStrings),
    enabled: left.enabled !== false
  };
  left.name = right.name;
  left.regex = right.regex;
  left.template = right.template;
  left.trimStrings = normalizeTrimStrings(right.trimStrings);
  left.enabled = right.enabled !== false;
  right.name = leftSnapshot.name;
  right.regex = leftSnapshot.regex;
  right.template = leftSnapshot.template;
  right.trimStrings = leftSnapshot.trimStrings;
  right.enabled = leftSnapshot.enabled;
}

function promoteFirstRegexStageToBase() {
  const nextBase = window.regexStages.shift();
  if (!nextBase) return;
  window.baseRegexRule.name = nextBase.name || '기본';
  window.baseRegexRule.regex = nextBase.regex || '';
  window.baseRegexRule.template = nextBase.template || '';
  window.baseRegexRule.trimStrings = normalizeTrimStrings(nextBase.trimStrings);
  window.baseRegexRule.enabled = nextBase.enabled !== false;
}

function isRegexRuleJson(value) {
  return value && typeof value === 'object' && value.findRegex !== undefined && value.replaceString !== undefined;
}

function getImportedRegexName(rule, fallbackIndex) {
  const name = typeof rule.scriptName === 'string' ? rule.scriptName.trim() : '';
  if (fallbackIndex === 0) return name || '기본';
  return name || `추가${fallbackIndex}`;
}

function importRegexRules(rules) {
  const [baseRule, ...stageRules] = rules;
  window.baseRegexRule.name = getImportedRegexName(baseRule, 0) || '기본';
  window.baseRegexRule.regex = baseRule.findRegex || '';
  window.baseRegexRule.template = baseRule.replaceString || '';
  window.baseRegexRule.trimStrings = normalizeTrimStrings(baseRule.trimStrings);
  window.baseRegexRule.enabled = baseRule.disabled !== true;
  window.regexStages = stageRules.map((rule, index) => ({
    id: rule.id ? `stage-${rule.id}` : `stage-${generateUUID()}`,
    name: getImportedRegexName(rule, index + 1),
    regex: rule.findRegex || '',
    template: rule.replaceString || '',
    trimStrings: normalizeTrimStrings(rule.trimStrings),
    enabled: rule.disabled !== true
  }));
  window.activeRegexStageId = 'base';
  window.isRegexStageEditing = false;
}

window.addRegexStage = function() {
  persistActiveRegexStageValues();
  const stage = createRegexStage();
  window.regexStages.push(stage);
  window.activeRegexStageId = stage.id;
  window.isRegexStageEditing = false;
  loadActiveRegexStageValues();
  renderStageControls();
  render();
};

window.removeRegexStage = function(stageId) {
  persistActiveRegexStageValues();
  if (stageId === 'base') {
    if (window.regexStages.length === 0) return;
    promoteFirstRegexStageToBase();
    window.activeRegexStageId = 'base';
    window.isRegexStageEditing = false;
    loadActiveRegexStageValues();
    renderStageControls();
    render();
    return;
  }
  window.regexStages = window.regexStages.filter(stage => stage.id !== stageId);
  if (window.activeRegexStageId === stageId) {
    window.activeRegexStageId = 'base';
    window.isRegexStageEditing = false;
    loadActiveRegexStageValues();
  }
  renderStageControls();
  render();
};

window.moveRegexStage = function(stageId, direction) {
  if (stageId === 'base') {
    if (direction > 0 && window.regexStages.length > 0) {
      persistActiveRegexStageValues();
      const nextActiveStageId = window.regexStages[0].id;
      swapStageData(window.baseRegexRule, window.regexStages[0]);
      window.activeRegexStageId = nextActiveStageId;
      loadActiveRegexStageValues();
      renderStageControls();
      render();
    }
    return;
  }
  const index = window.regexStages.findIndex(stage => stage.id === stageId);
  if (index === 0 && direction < 0) {
    persistActiveRegexStageValues();
    swapStageData(window.baseRegexRule, window.regexStages[0]);
    window.activeRegexStageId = 'base';
    loadActiveRegexStageValues();
    renderStageControls();
    render();
    return;
  }
  const nextIndex = index + direction;
  if (index < 0 || nextIndex < 0 || nextIndex >= window.regexStages.length) return;
  persistActiveRegexStageValues();
  const [stage] = window.regexStages.splice(index, 1);
  window.regexStages.splice(nextIndex, 0, stage);
  renderStageControls();
  render();
};

window.toggleRegexStageEnabled = function(stageId) {
  const stage = findStage(stageId);
  if (!stage) return;
  stage.enabled = !stage.enabled;
  renderStageControls();
  render();
};

window.selectRegexStage = function(stageId) {
  selectRegexStageInternal(stageId);
};

function selectRegexStageInternal(stageId) {
  persistActiveRegexStageValues();
  window.activeRegexStageId = stageId;
  window.isRegexStageEditing = false;
  loadActiveRegexStageValues();
  renderStageControls();
  render();
}

/* 酉?모드 */
function toggleViewMode() {
  setViewMode(window.viewMode === 'content' ? 'debug' : 'content');
}

function setViewMode(mode) {
  window.viewMode = mode;
  const viewToggle = document.getElementById('view-toggle');
  if (viewToggle) {
    viewToggle.innerText = mode === 'content' ? '내용보기' : '캡쳐보기';
  }
  render();
}

function formatGroupValueForDisplay(value) {
  if (!value) return '-';

  const text = String(value);
  if (!/[<>&]/.test(text)) return text;

  const withoutHiddenBlocks = text
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');

  const container = document.createElement('div');
  container.innerHTML = withoutHiddenBlocks;

  const factItems = [...container.querySelectorAll('.Facts-dn-item')];
  if (factItems.length > 0) {
    return factItems.map(item => {
      const title = item.querySelector('.Facts-dn-title')?.textContent?.trim();
      const content = item.querySelector('.Facts-dn-content')?.textContent?.trim();
      return [
        title ? `Title: ${title}` : '',
        content ? `Content: ${content}` : ''
      ].filter(Boolean).join('\n');
    }).filter(Boolean).join('\n\n') || '-';
  }

  return (container.textContent || container.innerText || '').trim() || '-';
}

function renderGroupList(matches) {
  if (!window.groupList) return;
  window.groupList.innerHTML = '';
  const firstMatch = matches[0];
  if (!firstMatch) return;

  for (let i = 1; i < firstMatch.length; i++) {
    const item = document.createElement('div');
    item.className = 'group-item';
    const groupId = document.createElement('span');
    groupId.className = 'group-id';
    groupId.textContent = `$${i}`;
    const groupValue = document.createElement('span');
    groupValue.style.overflow = 'hidden';
    groupValue.style.textOverflow = 'ellipsis';
    groupValue.style.whiteSpace = 'nowrap';
    const displayValue = formatGroupValueForDisplay(firstMatch[i]);
    groupValue.textContent = displayValue;
    groupValue.title = displayValue;
    item.append(groupId, groupValue);
    window.groupList.appendChild(item);
  }
}

/* ?뚮뜑留?*/
function render() {
  if (!window.rawInput || !window.regexInput || !window.renderTarget) return;
  if (!document.body.contains(window.rawInput) || !document.body.contains(window.regexInput)) return;

  persistActiveRegexStageValues();
  const text = window.rawInput.value;
  const baseRegex = window.baseRegexRule.regex.trim();
  const baseTemplate = window.baseRegexRule.template;
  const baseTrimStrings = window.baseRegexRule.trimStrings || [];

  if (window.regexError) {
    window.regexError.style.display = 'none';
  }

  if (window.groupList) {
    window.groupList.innerHTML = '';
  }

  const headerSpan = document.querySelector('.group-header span');
  if (headerSpan) {
    headerSpan.innerText = '매칭 그룹 정보 ($n)';
    headerSpan.style.color = '';
  }

  const hasBaseRegex = window.baseRegexRule.enabled !== false && !!baseRegex;
  const hasStageRegex = window.regexStages.some(stage => stage.enabled !== false && !!(stage.regex || '').trim());

  if (!text || (!hasBaseRegex && !hasStageRegex)) {
    if (!window.renderTarget.querySelector('.notice-box')) {
      window.renderTarget.innerHTML = '';
    }
    return;
  }

  try {
    let currentOutput = text;
    let activeResult = null;

    if (hasBaseRegex) {
      const baseResult = replaceWithTemplate(currentOutput, baseRegex, baseTemplate, window.viewMode === 'debug', baseTrimStrings);
      if (window.activeRegexStageId === 'base') {
        activeResult = baseResult;
      }
      currentOutput = baseResult.output;
    }

    window.regexStages.forEach((stage, index) => {
      if (!stage.enabled) {
        return;
      }

      if (!stage.regex.trim()) {
        return;
      }

      const stageResult = replaceWithTemplate(currentOutput, stage.regex, stage.template, window.viewMode === 'debug', stage.trimStrings || []);
      currentOutput = stageResult.output;
      if (window.activeRegexStageId === stage.id) {
        activeResult = stageResult;
      }
    });

    if (!activeResult) {
      activeResult = { matches: [] };
    }

    if (activeResult.matches.length > 0) {
      if (headerSpan) {
        headerSpan.innerText = `매칭 그룹 정보 (${activeResult.matches[0].length - 1}개 발견)`;
        headerSpan.style.color = '';
      }
      renderGroupList(activeResult.matches);
    } else {
      if (headerSpan) {
        headerSpan.innerText = '매칭 그룹 정보 (매칭 결과가 없습니다)';
        headerSpan.style.color = '#e74c3c';
      }
    }

    window.renderTarget.innerHTML = window.sanitizePreviewHtml(currentOutput);
  } catch (e) {
    window.regexError.style.display = 'block';
    window.regexError.innerText = e.message;
    if (headerSpan) {
      headerSpan.innerText = '매칭 그룹 정보 (정규식 오류)';
      headerSpan.style.color = '#e74c3c';
    }
  }
}

/* 湲고? ?⑥닔 */
function toggleGroupList() {
  const list = document.getElementById('group-list');
  const icon = document.getElementById('group-toggle-icon');
  if (list.classList.contains('collapsed')) {
    list.classList.remove('collapsed');
    icon.innerText = '▲';
  } else {
    list.classList.add('collapsed');
    icon.innerText = '▼';
  }
}

function resetAll() {
  if (!confirm('모든 입력 내용을 초기화할까요?')) return;

  window.baseRegexRule = { name: '기본', regex: '', template: '', enabled: true, trimStrings: [] };
  window.regexStages = [];
  window.activeRegexStageId = 'base';
  window.isRegexStageEditing = false;
  window.isLoadingRegexStage = false;

  if (window.rawInput) {
    window.rawInput.value = '';
    autoResizeTextarea(window.rawInput);
  }

  loadActiveRegexStageValues();
  clearSearchHighlights();
  renderStageControls();
  render();
}

function switchMobileTab(tab) {
  const editorSide = document.getElementById('editor-side');
  const previewSide = document.getElementById('preview-side');
  const tabs = document.querySelectorAll('.mobile-tab');
  tabs.forEach(t => t.classList.remove('active'));

  if (tab === 'editor') {
    editorSide.classList.remove('hidden');
    previewSide.classList.add('hidden');
    document.querySelector('.mobile-tab[data-tab="editor"]')?.classList.add('active');
    setTimeout(() => {
      if (window.editor) window.editor.refresh();
      if (window.rawInput) autoResizeTextarea(window.rawInput);
      if (window.regexInput) autoResizeTextarea(window.regexInput);
    }, 10);
  } else {
    editorSide.classList.add('hidden');
    previewSide.classList.remove('hidden');
    document.querySelector('.mobile-tab[data-tab="preview"]')?.classList.add('active');
  }
}

function initResizer() {
  const resizer = document.getElementById('resizer');
  const editorSide = document.getElementById('editor-side');
  const previewSide = document.getElementById('preview-side');
  let isResizing = false;

  const startResize = () => {
    isResizing = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const resizeToClientX = (clientX) => {
    if (!isResizing) return;
    const container = document.querySelector('.container');
    const containerRect = container.getBoundingClientRect();
    const newLeftWidth = ((clientX - containerRect.left) / containerRect.width) * 100;
    if (newLeftWidth > 20 && newLeftWidth < 80) {
      editorSide.style.width = `${newLeftWidth}%`;
      previewSide.style.width = `${100 - newLeftWidth}%`;
    }
  };

  const stopResize = () => {
    isResizing = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  };

  resizer.addEventListener('mousedown', startResize);

  document.addEventListener('mousemove', (e) => {
    resizeToClientX(e.clientX);
  });

  document.addEventListener('mouseup', stopResize);

  resizer.addEventListener('touchstart', (e) => {
    startResize();
    e.preventDefault();
  }, { passive: false });

  document.addEventListener('touchmove', (e) => {
    if (!e.touches.length) return;
    resizeToClientX(e.touches[0].clientX);
  }, { passive: false });

  document.addEventListener('touchend', stopResize);
  document.addEventListener('touchcancel', stopResize);
}

function generateUUID() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function autoResizeTextarea(textarea) {
  if (!textarea || !textarea.isConnected || textarea.closest('.collapsed')) return;
  textarea.style.height = 'auto';
  textarea.style.height = textarea.scrollHeight + 'px';
}

function selectAllEditor() {
  if (window.editor) {
    window.editor.execCommand('selectAll');
    window.editor.focus();
  }
}

window.toggleSection = function(sectionId) {
  const section = document.getElementById(sectionId);
  const iconId = sectionId.replace('-section', '-toggle-icon');
  const icon = document.getElementById(iconId);
  if (!section || !icon) {
    console.warn(`toggleSection: ${sectionId} ?먮뒗 ${iconId}瑜?찾을 ???놁뒿?덈떎.`);
    return;
  }

  if (section.classList.contains('collapsed')) {
    section.classList.remove('collapsed');
    icon.innerText = '··· [접기]';
  } else {
    section.classList.add('collapsed');
    icon.innerText = '··· [펼치기]';
  }
};

window.toggleTrimSection = function() {
  const section = document.getElementById('trim-input-section');
  const icon = document.getElementById('trim-input-toggle-icon');
  if (!section || !icon) return;

  if (section.classList.contains('collapsed')) {
    section.classList.remove('collapsed');
    icon.innerText = '··· [접기]';
    if (window.trimInput) autoResizeTextarea(window.trimInput);
  } else {
    section.classList.add('collapsed');
    icon.innerText = '··· [펼치기]';
  }
};

/* ?뺢퇋??JSON ???*/
function saveAsRegexJSON() {
  persistActiveRegexStageValues();
  const rules = getSaveableRegexRules();
  if (rules.length === 0) {
    showMessage('저장할 정규식을 입력해주세요.');
    return;
  }

  openModal();
}

function getSaveableRegexRules() {
  const rules = [
    { id: 'base', rule: window.baseRegexRule },
    ...window.regexStages.map(stage => ({ id: stage.id, rule: stage }))
  ];
  return rules.filter(item => (item.rule.regex || '').trim() || (item.rule.template || '').trim());
}

function openModal() {
  const modal = document.getElementById('custom-modal');
  const input = document.getElementById('script-name-input');
  renderSaveRegexList();
  modal.classList.add('active');
  setTimeout(() => {
    input.focus();
    input.select();
  }, 100);
  input.onkeydown = (e) => {
    if (e.key === 'Enter') {
      confirmSave();
    } else if (e.key === 'Escape') {
      closeModal();
    }
  };
}

function renderSaveRegexList() {
  const list = document.getElementById('save-regex-list');
  const block = document.getElementById('save-regex-select-block');
  if (!list || !block) return;

  const rules = getSaveableRegexRules();
  list.innerHTML = '';
  block.style.display = rules.length > 1 ? 'block' : 'none';

  rules.forEach(item => {
    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'save-regex-checkbox';
    checkbox.value = item.id;
    checkbox.checked = true;
    const text = document.createElement('span');
    text.textContent = item.rule.name || (item.id === 'base' ? '기본' : '추가');
    label.append(checkbox, text);
    list.appendChild(label);
  });
}

function getSelectedRegexRuleIds() {
  const checked = [...document.querySelectorAll('.save-regex-checkbox:checked')].map(input => input.value);
  if (checked.length > 0) return checked;
  const rules = getSaveableRegexRules();
  return rules.length === 1 ? [rules[0].id] : [];
}

function normalizeRegexForExport(regexPattern) {
  return (regexPattern || '').trim();
}

function closeModal() {
  const modal = document.getElementById('custom-modal');
  modal.classList.remove('active');
}

function confirmSave() {
  persistActiveRegexStageValues();
  const scriptName = document.getElementById('script-name-input').value.trim();
  if (!scriptName) {
    showMessage('스크립트 이름을 입력해주세요.');
    return;
  }

  const placement = [];
  if (document.getElementById('chk-user') && document.getElementById('chk-user').checked) placement.push(1);
  if (document.getElementById('chk-ai') && document.getElementById('chk-ai').checked) placement.push(2);

  const markdownOnly = document.getElementById('chk-markdown') ? document.getElementById('chk-markdown').checked : true;
  const promptOnly = document.getElementById('chk-prompt') ? document.getElementById('chk-prompt').checked : false;
  const selectedIds = getSelectedRegexRuleIds();
  if (selectedIds.length === 0) {
    showMessage('저장할 정규식을 선택해주세요.');
    return;
  }

  const selectedRules = getSaveableRegexRules().filter(item => selectedIds.includes(item.id));
  const regexJSON = selectedRules.map((item, index) => {
    const trimStrings = normalizeTrimStrings(item.rule.trimStrings);
    return {
      "id": generateUUID(),
      "scriptName": selectedRules.length === 1 ? scriptName : (item.rule.name || `${scriptName}-${index + 1}`),
      "findRegex": normalizeRegexForExport(item.rule.regex),
      "replaceString": item.rule.template || '',
      "trimStrings": trimStrings.length > 0 ? trimStrings : [""],
      "placement": placement.length > 0 ? placement : [2],
      "disabled": item.rule.enabled === false,
      "markdownOnly": markdownOnly,
      "promptOnly": promptOnly,
      "runOnEdit": true,
      "substituteRegex": 0,
      "minDepth": null,
      "maxDepth": null
    };
  });
  const payload = regexJSON.length === 1 ? regexJSON[0] : regexJSON;

  const blob = new Blob([JSON.stringify(payload, null, 4)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const filename = scriptName.replace(/\s+/g, '-').replace(/[^\w가-힣]/g, '') + '.json';
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  closeModal();
}

window.loadRegexJSON = function(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const json = JSON.parse(e.target.result);
      const regexRules = Array.isArray(json) ? json.filter(isRegexRuleJson) : (isRegexRuleJson(json) ? [json] : []);
      if (regexRules.length > 0) {
        importRegexRules(regexRules);
        loadActiveRegexStageValues();
        renderStageControls();
        if (window.rawInput) {
          window.rawInput.value = "";
          window.rawInput.placeholder = "여기에 채팅 내 출력되는 형식을 입력하세요";
        }
        if (window.regexInput) autoResizeTextarea(window.regexInput);
        if (window.rawInput) autoResizeTextarea(window.rawInput);
        const firstRule = regexRules[0];
        if (firstRule.placement) {
            if (document.getElementById('chk-user')) document.getElementById('chk-user').checked = firstRule.placement.includes(1);
            if (document.getElementById('chk-ai')) document.getElementById('chk-ai').checked = firstRule.placement.includes(2);
        }
        if (firstRule.markdownOnly !== undefined && document.getElementById('chk-markdown')) {
            document.getElementById('chk-markdown').checked = firstRule.markdownOnly;
        }
        if (firstRule.promptOnly !== undefined && document.getElementById('chk-prompt')) {
            document.getElementById('chk-prompt').checked = firstRule.promptOnly;
        }

        render();
        showMessage(regexRules.length > 1 ? `${regexRules.length}개의 정규식을 불러왔습니다.` : "성공적으로 불러왔습니다.");
      } else {
        showMessage("올바른 정규식 JSON 형식이 아닙니다.");
      }
    } catch (err) {
      showMessage("JSON 파일을 파싱하는 중 오류가 발생했습니다.");
    }
  };
  reader.readAsText(file);
  event.target.value = '';
};
