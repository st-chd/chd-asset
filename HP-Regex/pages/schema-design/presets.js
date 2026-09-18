// pages/schema-design/presets.js
window.schemaPresets = {
    character: {
        name: "레트로(열림)",
        schema: {
              "uniqueId": "msg_78901",
  "date": "2024/07/26 (금요일)",
  "time": "10:15",
  "location": "세라피나의 숲속 공터",
  "weather": "따뜻하고 화창한 날, 상쾌한 바람",
  "topics": {
    "primaryTopic": "새로운 만남",
    "emotionalTone": "보호적",
    "interactionTheme": "환영"
  },
  "charactersPresent": [
    "Seraphina",
    "챗시",
    "Elara",
    "Kael",
    "Lyra",
    "Wren",
    "Finn"
  ],
  "characters": [
    {
      "name": "Seraphina",
      "outfit": "부드러운 실크 블랙 선드레스 (속옷: 얇은 실크 끈 브래지어, 실크 팬티)",
      "stateOfDress": "단정함",
      "postureAndInteraction": "챗시 옆에 서서 손을 부드럽게 잡고 다른 이들과 따뜻하게 대화",
      "innerthought": "챗시가 괜찮은지 확인해야 해. 이 친구들의 갑작스러운 등장에 챗시가 놀라지 않기를 바랄 뿐이야.",
      "lovescore": 65
    },
    {
      "name": "Elara",
      "outfit": "실용적인 녹색 리넨 블라우스, 갈색 가죽 앞치마, 튼튼한 갈색 바지 (속옷: 면 브래지어, 면 팬티)",
      "stateOfDress": "단정하고 활동적",
      "postureAndInteraction": "신선한 베리가 담긴 바구니를 내려놓고 챗시를 온화한 호기심으로 바라봄",
      "innerthought": "속마음1",
      "lovescore": 15
    },
    {
      "name": "Kael",
      "outfit": "두꺼운 양모 튜닉, 무릎까지 오는 갈색 가죽 부츠, 헐렁한 갈색 바지 (속옷: 면 박서 브리프)",
      "stateOfDress": "튼튼하나 흙먼지가 조금 묻어 있음",
      "postureAndInteraction": "장작 더미를 내려놓고 Seraphina와 챗시를 날카롭고 평가하는 눈으로 관찰",
      "innerthought": "속마음2",
      "lovescore": 25
    },
    {
      "name": "Lyra",
      "outfit": "밝은 색의 흐르는 튜닉, 검은색 레깅스, 가죽 슬리퍼 (속옷: 레이스 브라렛, 끈 팬티)",
      "stateOfDress": "경쾌하고 우아함",
      "postureAndInteraction": "작은 새 조각품을 손에 쥐고 장난스럽게 챗시에게 다가감",
      "lovescore": 35
    },
    {
      "name": "Wren",
      "outfit": "낡은 트위드 재킷, 흰색 셔츠, 갈색 조끼, 안경 (속옷: 면 브리프)",
      "stateOfDress": "조금 흐트러져 있으나 단정함",
      "postureAndInteraction": "스툴에 앉아 책을 읽고 있으나 주변 대화에 귀 기울임",
      "innerthought": "속마음3",
      "lovescore": 45
    },
    {
      "name": "Finn",
      "outfit": "흙 묻은 갈색 셔츠, 짧은 바지, 맨발 (속옷: 면 트렁크)",
      "stateOfDress": "활기차고 흙먼지가 묻어 있음",
      "postureAndInteraction": "여기저기 튀어 오르며 챗시를 호기심 어린 눈으로 엿봄",
      "lovescore": 75
    },
    {
      "name": "챗시",
      "outfit": "간단한 회색 리넨 튜닉 (속옷: 브래지어 없음, 면 팬티)",
      "stateOfDress": "아픈 상태에서 회복 중",
      "postureAndInteraction": "침대에 앉아 Seraphina의 손을 잡고 주변을 둘러봄"
    },
  ]
        },
        template: `<style>
.retro-container {
background: #ffffff;
border: 1px solid #1B1C1E;
color: #1B1C1E;
box-shadow: 4px 4px 0px #1B1C1E;
padding: 0;
overflow: hidden;
font-size: 0.9em;
margin: 8px;
word-break: keep-all;
}
/* --- 상단 타이틀바 --- */
.retro-title-bar {
background: #F3F3F3;
padding: 6px 10px;
display: flex;
justify-content: space-between;
align-items: center;
border-bottom: 1px solid #1B1C1E;
font-weight: bold;
letter-spacing: 1px;
text-transform: uppercase;
}
.retro-content {
padding: 12px 12px 0 12px;
}
.retro-tab-content.retro-content {
padding-bottom: 12px;
}
/* --- 정보 그리드 (3단/2단) --- */
.retro-info-grid {
display: flex;
flex-direction: column;
gap: 2px;
margin-bottom: 10px;
}
.retro-info-item {
display: flex;
flex: 1;
padding: 4px 0;
border-bottom: 1px dashed #B6B6B6;
align-items: center;
text-align: right;
justify-content: space-between;
}
.retro-label {
font-weight: bold;
text-transform: uppercase;
white-space : nowrap;
padding: 0 6px;
}
.retro-value {
color: #6B6B6B;
word-break: break-word;
font-weight: 500;
}
/* --- 포커스/무드 박스 --- */
.retro-mission {
border: 2px solid #1B1C1E;
background: #1B1C1E;
color: #F3F3F3;
padding: 8px;
}
.retro-mission-text {
word-break: break-word;
font-weight: normal;
}
/* --- 러브스코어 --- */
.retro-love-section {
margin-top: 8px;
margin-bottom: 8px;
display: flex;
align-items: center;
gap: 10px;
}
.retro-love-label {
font-weight: bold;
color: #1B1C1E;
min-width: 60px;
}
.retro-love-val-box {
font-weight: bold;
background: #1B1C1E;
color: #fff;
padding: 0 10px;
height: 24px;
line-height: 24px;
display: flex;
align-items: center;
justify-content: center;
}
.retro-love-bar-container {
flex: 1;
height: 24px;
border: 2px solid #1B1C1E;
padding: 2px;
background: #fff;
box-sizing: border-box;
}
.retro-love-bar-fill {
height: 100%;
background: repeating-linear-gradient(45deg, red, red 2px, #fff 2px, #fff 4px);
transition: width 0.3s ease;
}
/* --- 속마음 --- */
.retro-thought-wrapper {
margin-top: 12px;
}
.retro-thought-label {
font-weight: bold;
color: #1B1C1E;
margin-bottom: 4px;
}
.retro-thought-box {
background: #F3F3F3;
border: 1px solid #B6B6B6;
padding: 8px;
color: #6B6B6B;
font-style: italic;
}
/* --- 캐릭터 이름(탭) --- */
.retro-tabs-wrapper {
display: flex;
flex-wrap: wrap;
padding: 0 12px 3px 10px;
margin: 4px 2px 0 2px;
}
.retro-tab-input {
display: none !important;
}
.retro-tab-label {
padding: 3px 12px;
background: #f9f9f9;
color: #6B6B6B;
font-weight: bold;
text-transform: uppercase;
border: 1px solid #B6B6B6;
order: 1;
margin: 0 4px 4px 0;
}
/* 선택된 캐릭터(탭) */
.retro-tab-input:checked + .retro-tab-label {
background: #1B1C1E;
border-color: #1B1C1E;
color: #fff;
}
.retro-tab-content {
display: none;
width: 100%;
padding: 0;
animation: fadeIn 0.3s ease;
order: 99;
}
.retro-tab-input:checked + .retro-tab-label + .retro-tab-content {
display: block;
}
@keyframes fadeIn {
from { opacity: 0; transform: translateY(-3px); }
to { opacity: 1; transform: translateY(0); }
}
</style>
<div class='retro-container'>
<!-- 상단 타이틀바 -->
<div class='retro-title-bar'>
<span>&gt;&gt; {{data.date}} {{data.time}} </span>
</div>
<!-- 공통 정보 (날짜/시간/위치/날씨) -->
<div class='retro-content'>
<div class='retro-info-grid'>
<div class='retro-info-item'>
<span class='retro-label'>🌏 LOCATION</span>
<span class='retro-value'>{{data.location}}</span>
</div>
<div class='retro-info-item'>
<span class='retro-label'>☁️ WEATHER</span>
<span class='retro-value'>{{data.weather}}</span>
</div>
<div class='retro-info-item'>
<span class='retro-label'>🎯 FOCUS</span>
<span class='retro-value'>{{data.topics.primaryTopic}}</span>
</div>
<div class='retro-info-item'>
<span class='retro-label'>⭐ MOOD</span>
<span class='retro-value'>{{data.topics.interactionTheme}}, {{data.topics.emotionalTone}}</span>
</div>
</div>
</div>
<!-- 캐릭터 탭 영역 -->
<div class="retro-tabs-wrapper">
{{#each data.characters as |character|}}
<input type="radio"
name="retro_tabs_{{@root.data.uniqueId}}"
id="retro_tab_{{@root.data.uniqueId}}_{{@index}}"
class="retro-tab-input"
{{#if @first}}checked{{/if}}>
<label for="retro_tab_{{@root.data.uniqueId}}_{{@index}}" class="retro-tab-label">
{{character.name}}
</label>
<!-- 탭 컨텐츠 -->
<div class="retro-tab-content retro-content">
<!-- 캐릭터 의상/상태 정보 -->
<div class='retro-info-grid'>
<div class='retro-info-item wide'>
<span class='retro-label'>🧤 OUTFIT</span>
<span class='retro-value'>{{character.outfit}}</span>
</div>
<div class='retro-info-item'>
<span class='retro-label'>🔍 STATUS</span>
<span class='retro-value'>{{character.stateOfDress}}</span>
</div>
</div>
<!-- 상호작용 텍스트 -->
<div class='retro-mission' style='font-weight: bold;'>&gt;&gt; ACTION:
<span class='retro-mission-text'>{{character.postureAndInteraction}}</span>
</div>
<!-- 러브스코어 -->
{{#if character.lovescore}}
<div class='retro-love-section'>
<div class='retro-love-label'>💖 LOVE SCORE</div>
<div class='retro-love-val-box'>{{character.lovescore}}%</div>
<div class='retro-love-bar-container'>
<div class='retro-love-bar-fill' style='width: {{character.lovescore}}%; max-width: 100%;'></div>
</div>
</div>
{{/if}}
<!-- 속마음 -->
{{#if character.innerthought}}
<div class='retro-thought-wrapper'>
<div class='retro-thought-label'>💭 INNER_THOUGHT</div>
<div class='retro-thought-box'>
{{character.innerthought}}
</div>
</div>
{{/if}}
</div>
{{/each}}
</div>
</div>`
    },
    maccheckbox: {
        name: "레트로(닫힘)",
        schema: {
              "uniqueId": "msg_78901",
  "date": "2024/07/26 (금요일)",
  "time": "10:15",
  "location": "세라피나의 숲속 공터",
  "weather": "따뜻하고 화창한 날, 상쾌한 바람",
  "topics": {
    "primaryTopic": "새로운 만남",
    "emotionalTone": "보호적",
    "interactionTheme": "환영"
  },
  "charactersPresent": [
    "Seraphina",
    "챗시",
    "Elara",
    "Kael",
    "Lyra",
    "Wren",
    "Finn"
  ],
  "characters": [
    {
      "name": "Seraphina",
      "outfit": "부드러운 실크 블랙 선드레스 (속옷: 얇은 실크 끈 브래지어, 실크 팬티)",
      "stateOfDress": "단정함",
      "postureAndInteraction": "챗시 옆에 서서 손을 부드럽게 잡고 다른 이들과 따뜻하게 대화",
      "innerthought": "챗시가 괜찮은지 확인해야 해. 이 친구들의 갑작스러운 등장에 챗시가 놀라지 않기를 바랄 뿐이야.",
      "lovescore": 65
    },
    {
      "name": "Elara",
      "outfit": "실용적인 녹색 리넨 블라우스, 갈색 가죽 앞치마, 튼튼한 갈색 바지 (속옷: 면 브래지어, 면 팬티)",
      "stateOfDress": "단정하고 활동적",
      "postureAndInteraction": "신선한 베리가 담긴 바구니를 내려놓고 챗시를 온화한 호기심으로 바라봄",
      "innerthought": "속마음1",
      "lovescore": 15
    },
    {
      "name": "Kael",
      "outfit": "두꺼운 양모 튜닉, 무릎까지 오는 갈색 가죽 부츠, 헐렁한 갈색 바지 (속옷: 면 박서 브리프)",
      "stateOfDress": "튼튼하나 흙먼지가 조금 묻어 있음",
      "postureAndInteraction": "장작 더미를 내려놓고 Seraphina와 챗시를 날카롭고 평가하는 눈으로 관찰",
      "innerthought": "속마음2",
      "lovescore": 25
    },
    {
      "name": "Lyra",
      "outfit": "밝은 색의 흐르는 튜닉, 검은색 레깅스, 가죽 슬리퍼 (속옷: 레이스 브라렛, 끈 팬티)",
      "stateOfDress": "경쾌하고 우아함",
      "postureAndInteraction": "작은 새 조각품을 손에 쥐고 장난스럽게 챗시에게 다가감",
      "lovescore": 35
    },
    {
      "name": "Wren",
      "outfit": "낡은 트위드 재킷, 흰색 셔츠, 갈색 조끼, 안경 (속옷: 면 브리프)",
      "stateOfDress": "조금 흐트러져 있으나 단정함",
      "postureAndInteraction": "스툴에 앉아 책을 읽고 있으나 주변 대화에 귀 기울임",
      "innerthought": "속마음3",
      "lovescore": 45
    },
    {
      "name": "Finn",
      "outfit": "흙 묻은 갈색 셔츠, 짧은 바지, 맨발 (속옷: 면 트렁크)",
      "stateOfDress": "활기차고 흙먼지가 묻어 있음",
      "postureAndInteraction": "여기저기 튀어 오르며 챗시를 호기심 어린 눈으로 엿봄",
      "lovescore": 75
    },
    {
      "name": "챗시",
      "outfit": "간단한 회색 리넨 튜닉 (속옷: 브래지어 없음, 면 팬티)",
      "stateOfDress": "아픈 상태에서 회복 중",
      "postureAndInteraction": "침대에 앉아 Seraphina의 손을 잡고 주변을 둘러봄"
    },
  ]
        },
        template: `<style>
.retro-container {
background: #ffffff;
border: 1px solid #1B1C1E;
color: #1B1C1E;
box-shadow: 4px 4px 0px #1B1C1E;
padding: 0;
overflow: hidden;
font-size: 0.9em;
margin: 8px;
word-break: keep-all;
}
/* --- 상단 타이틀바 --- */
.retro-title-bar {
background: #F3F3F3;
padding: 6px 10px;
display: flex;
justify-content: space-between;
align-items: center;
border-bottom: 1px solid #1B1C1E;
font-weight: bold;
letter-spacing: 1px;
text-transform: uppercase;
}
.retro-content {
padding: 12px 12px 0 12px;
}
.retro-tab-content.retro-content {
padding-bottom: 12px;
}
/* --- 정보 그리드 (3단/2단) --- */
.retro-info-grid {
display: flex;
flex-direction: column;
gap: 2px;
margin-bottom: 10px;
}
.retro-info-item {
display: flex;
flex: 1;
padding: 4px 0;
border-bottom: 1px dashed #B6B6B6;
align-items: center;
text-align: right;
justify-content: space-between;
}
.retro-label {
font-weight: bold;
text-transform: uppercase;
white-space : nowrap;
padding: 0 6px;
}
.retro-value {
color: #6B6B6B;
word-break: break-word;
font-weight: 500;
}
/* --- 포커스/무드 박스 --- */
.retro-mission {
border: 2px solid #1B1C1E;
background: #1B1C1E;
color: #F3F3F3;
padding: 8px;
}
.retro-mission-text {
word-break: break-word;
font-weight: normal;
}
/* --- 러브스코어 --- */
.retro-love-section {
margin-top: 8px;
margin-bottom: 8px;
display: flex;
align-items: center;
gap: 10px;
}
.retro-love-label {
font-weight: bold;
color: #1B1C1E;
min-width: 60px;
}
.retro-love-val-box {
font-weight: bold;
background: #1B1C1E;
color: #fff;
padding: 0 10px;
height: 24px;
line-height: 24px;
display: flex;
align-items: center;
justify-content: center;
}
.retro-love-bar-container {
flex: 1;
height: 24px;
border: 2px solid #1B1C1E;
padding: 2px;
background: #fff;
box-sizing: border-box;
}
.retro-love-bar-fill {
height: 100%;
background: repeating-linear-gradient(45deg, red, red 2px, #fff 2px, #fff 4px);
transition: width 0.3s ease;
}
/* --- 속마음 --- */
.retro-thought-wrapper {
margin-top: 12px;
}
.retro-thought-label {
font-weight: bold;
color: #1B1C1E;
margin-bottom: 4px;
}
.retro-thought-box {
background: #F3F3F3;
border: 1px solid #B6B6B6;
padding: 8px;
color: #6B6B6B;
font-style: italic;
}
/* --- 캐릭터 이름(탭) --- */
.retro-tabs-wrapper {
display: flex;
flex-wrap: wrap;
padding: 0 12px 3px 10px;
margin: 4px 2px 0 2px;
}
.retro-tab-input {
display: none !important;
}
.retro-tab-label {
padding: 3px 12px;
background: #f9f9f9;
color: #6B6B6B;
font-weight: bold;
text-transform: uppercase;
border: 1px solid #B6B6B6;
order: 1;
margin: 0 4px 4px 0;
}
/* 선택된 캐릭터(탭) */
.retro-tab-input:checked + .retro-tab-label {
background: #1B1C1E;
border-color: #1B1C1E;
color: #fff;
}
.retro-tab-content {
display: none;
width: 100%;
padding: 0;
animation: fadeIn 0.3s ease;
order: 99;
}
.retro-tab-input:checked + .retro-tab-label + .retro-tab-content {
display: block;
}
@keyframes fadeIn {
from { opacity: 0; transform: translateY(-3px); }
to { opacity: 1; transform: translateY(0); }
}
</style>
<div class='retro-container'>
<!-- 상단 타이틀바 -->
<div class='retro-title-bar'>
<span>&gt;&gt; {{data.date}} {{data.time}} </span>
</div>
<!-- 공통 정보 (날짜/시간/위치/날씨) -->
<div class='retro-content'>
<div class='retro-info-grid'>
<div class='retro-info-item'>
<span class='retro-label'>🌏 LOCATION</span>
<span class='retro-value'>{{data.location}}</span>
</div>
<div class='retro-info-item'>
<span class='retro-label'>☁️ WEATHER</span>
<span class='retro-value'>{{data.weather}}</span>
</div>
<div class='retro-info-item'>
<span class='retro-label'>🎯 FOCUS</span>
<span class='retro-value'>{{data.topics.primaryTopic}}</span>
</div>
<div class='retro-info-item'>
<span class='retro-label'>⭐ MOOD</span>
<span class='retro-value'>{{data.topics.interactionTheme}}, {{data.topics.emotionalTone}}</span>
</div>
</div>
</div>
<!-- 캐릭터 탭 영역 -->
<div class="retro-tabs-wrapper">
{{#each data.characters as |character|}}
<input type="checkbox"
name="retro_tabs_{{@root.data.uniqueId}}"
id="retro_tab_{{@root.data.uniqueId}}_{{@index}}"
class="retro-tab-input">
<label for="retro_tab_{{@root.data.uniqueId}}_{{@index}}" class="retro-tab-label">
{{character.name}}
</label>
<!-- 탭 컨텐츠 -->
<div class="retro-tab-content retro-content" style='padding-top:6px; border-top:3px double #B6B6B6;'>
<!-- 캐릭터 의상/상태 정보 -->
<div class='retro-info-grid'>
<div class='retro-info-item wide'>
<span class='retro-label'>🧤 OUTFIT</span>
<span class='retro-value'>{{character.outfit}}</span>
</div>
<div class='retro-info-item'>
<span class='retro-label'>🔍 STATUS</span>
<span class='retro-value'>{{character.stateOfDress}}</span>
</div>
</div>
<!-- 상호작용 텍스트 -->
<div class='retro-mission' style='font-weight: bold;'>&gt;&gt; ACTION:
<span class='retro-mission-text'>{{character.postureAndInteraction}}</span>
</div>
<!-- 러브스코어 -->
{{#if character.lovescore}}
<div class='retro-love-section'>
<div class='retro-love-label'>💖 LOVE SCORE</div>
<div class='retro-love-val-box'>{{character.lovescore}}%</div>
<div class='retro-love-bar-container'>
<div class='retro-love-bar-fill' style='width: {{character.lovescore}}%; max-width: 100%;'></div>
</div>
</div>
{{/if}}
<!-- 속마음 -->
{{#if character.innerthought}}
<div class='retro-thought-wrapper'>
<div class='retro-thought-label'>💭 INNER_THOUGHT</div>
<div class='retro-thought-box'>
{{character.innerthought}}
</div>
</div>
{{/if}}
</div>
{{/each}}
</div>
</div>`
    }
};
