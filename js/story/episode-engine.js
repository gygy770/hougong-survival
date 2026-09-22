/* =====================================================
   後宮生還錄
   共用劇情引擎
===================================================== */


/* =====================================================
   建立共用劇情樣式
===================================================== */

function ensureStoryEngineStyles() {

  if (
    document.getElementById(
      "storyEngineStyles"
    )
  ) {
    return;
  }


  const style =
    document.createElement("style");


  style.id =
    "storyEngineStyles";


  style.textContent = `

    #storyScreen{
      width:100%;
      height:100dvh;
      min-height:100dvh;
      max-height:100dvh;

      overflow:hidden;

      padding:
        9px 14px
        calc(
          10px +
          env(safe-area-inset-bottom)
        );

      background:
        radial-gradient(
          circle at top,
          #45131c,
          #120507 68%
        );
    }


    .story-shell{
      width:100%;
      height:100%;

      display:grid;

      grid-template-rows:
        auto
        auto
        minmax(0,1fr)
        auto;

      gap:8px;
    }


    /* 集數 */

    .story-episode{
      min-height:22px;

      display:flex;
      align-items:center;
      justify-content:center;

      color:
        rgba(239,201,121,.78);

      font-size:10px;
      letter-spacing:4px;
    }


    /* 標題 */

    .story-heading{
      padding:
        9px 10px 10px;

      text-align:center;

      border-top:
        1px solid
        rgba(239,201,121,.16);

      border-bottom:
        1px solid
        rgba(239,201,121,.16);
    }


    .story-location{
      color:
        rgba(255,255,255,.38);

      font-size:9px;
      letter-spacing:3px;
    }


    .story-title{
      margin-top:4px;

      color:#efc979;

      font-size:22px;
      line-height:1.3;

      letter-spacing:5px;
    }


    /* 主要劇情內容 */

    .story-content{
      min-height:0;

      overflow-y:auto;
      overscroll-behavior:contain;

      padding:
        14px 13px;

      border:
        1px solid
        rgba(239,201,121,.15);

      background:
        rgba(0,0,0,.20);

      color:
        rgba(255,245,226,.87);

      font-size:13px;
      line-height:1.8;
    }


    .story-content strong{
      color:#efc979;
      font-weight:600;
    }


    /* NPC 名字 */

    .story-speaker{
      display:inline-block;

      margin-bottom:7px;

      padding:
        4px 8px;

      border:
        1px solid
        rgba(239,201,121,.20);

      background:
        rgba(239,201,121,.06);

      color:#efc979;

      font-size:10px;
      letter-spacing:2px;
    }


    /* 狀態提示 */

    .story-effect{
      margin-top:12px;

      padding:
        8px 10px;

      border-left:
        2px solid
        #c99546;

      background:
        rgba(201,149,70,.07);

      color:#d9bc82;

      font-size:10px;
      line-height:1.6;
    }


    /* 選項區 */

    .story-actions{
      display:grid;

      gap:6px;
    }


    .story-choice{
      width:100%;

      padding:
        10px 11px;

      border:
        1px solid
        rgba(239,201,121,.22);

      border-radius:4px;

      background:
        rgba(255,255,255,.035);

      color:#f3dbac;

      text-align:left;

      font-size:11px;
      line-height:1.45;

      cursor:pointer;
    }


    .story-choice:active{
      background:
        rgba(239,201,121,.10);
    }


    /* 單一下一步按鈕 */

    .story-next{
      width:100%;

      padding:12px;

      border:none;
      border-radius:4px;

      background:
        linear-gradient(
          135deg,
          #b78240,
          #e6c17b
        );

      color:#241306;

      font-size:13px;
      font-weight:bold;

      letter-spacing:5px;

      cursor:pointer;
    }


    @media(max-height:720px){

      .story-content{
        padding:
          10px 11px;

        font-size:12px;

        line-height:1.65;
      }


      .story-title{
        font-size:19px;
      }


      .story-choice{
        padding:
          8px 9px;

        font-size:10px;
      }


      .story-next{
        padding:10px;
      }

    }

  `;


  document.head.appendChild(
    style
  );

}


/* =====================================================
   建立共用故事畫面
===================================================== */

function ensureStoryScreen() {

  ensureStoryEngineStyles();


  let screen =
    document.getElementById(
      "storyScreen"
    );


  if (screen) {
    return screen;
  }


  screen =
    document.createElement(
      "section"
    );


  screen.id =
    "storyScreen";

  screen.className =
    "screen";


  const game =
    document.querySelector(
      ".game"
    );


  if (!game) {
    return null;
  }


  game.appendChild(
    screen
  );


  return screen;
}


/* =====================================================
   顯示一般劇情畫面
===================================================== */

function renderStoryScene({
  episode = "",
  location = "",
  title = "",
  content = "",
  choices = [],
  nextText = "",
  nextAction = null
}) {

  const screen =
    ensureStoryScreen();


  if (!screen) {
    return;
  }


  let actionsHTML = "";


  /*
    多選項
  */

  if (
    Array.isArray(choices)
    &&
    choices.length
  ) {

    actionsHTML =
      `
        <div class="story-actions">
          ${
            choices
              .map(
                (choice, index) => {

                  return `
                    <button
                      class="story-choice"
                      onclick="
                        storyEngineChoose(
                          ${index}
                        )
                      "
                    >
                      ${choice.text}
                    </button>
                  `;

                }
              )
              .join("")
          }
        </div>
      `;

  }


  /*
    單一下一步按鈕
  */

  else if (
    nextText
    &&
    typeof nextAction ===
      "function"
  ) {

    actionsHTML =
      `
        <button
          class="story-next"
          onclick="storyEngineNext()"
        >
          ${nextText}
        </button>
      `;

  }


  screen.innerHTML = `

    <div class="story-shell">

      <div class="story-episode">
        ${episode}
      </div>


      <div class="story-heading">

        <div class="story-location">
          ${location}
        </div>

        <div class="story-title">
          ${title}
        </div>

      </div>


      <div class="story-content">
        ${content}
      </div>


      ${actionsHTML}

    </div>

  `;


  window.__storyChoices =
    choices;


  window.__storyNextAction =
    nextAction;


  showScreen(
    "storyScreen"
  );


  window.scrollTo(
    0,
    0
  );

}


/* =====================================================
   執行故事選項
===================================================== */

function storyEngineChoose(index) {

  const choices =
    window.__storyChoices
    || [];


  const choice =
    choices[index];


  if (
    !choice
    ||
    typeof choice.action
      !== "function"
  ) {
    return;
  }


  choice.action();

}


/* =====================================================
   執行下一幕
===================================================== */

function storyEngineNext() {

  const action =
    window.__storyNextAction;


  if (
    typeof action ===
    "function"
  ) {

    action();

  }

}


/* =====================================================
   套用數值變化
===================================================== */

function applyStoryEffects(
  effects = {}
) {

  if (
    effects.money
    !== undefined
  ) {

    playerData.money +=
      effects.money;

  }


  if (
    effects.favor
    !== undefined
  ) {

    playerData.favor +=
      effects.favor;

  }


  if (
    effects.alert
    !== undefined
  ) {

    playerData.alert +=
      effects.alert;

  }


  if (
    effects.etiquette
    !== undefined
  ) {

    playerData.etiquette +=
      effects.etiquette;

  }


  if (
    typeof saveGame ===
    "function"
  ) {

    saveGame();

  }

}


/* =====================================================
   寫入故事旗標
===================================================== */

function setStoryFlag(
  key,
  value = true
) {

  if (
    !gameState.storyFlags
  ) {

    gameState.storyFlags = {};

  }


  gameState.storyFlags[key] =
    value;


  if (
    typeof saveGame ===
    "function"
  ) {

    saveGame();

  }

}


/* =====================================================
   取得故事旗標
===================================================== */

function getStoryFlag(
  key
) {

  if (
    !gameState.storyFlags
  ) {
    return undefined;
  }


  return gameState
    .storyFlags[key];

}


/* =====================================================
   儲存目前集數 / 幕次
===================================================== */

function setStoryProgress(
  episode,
  step
) {

  gameState.currentEpisode =
    episode;

  gameState.storyStep =
    step;


  if (
    typeof saveGame ===
    "function"
  ) {

    saveGame();

  }

}


/* =====================================================
   對外共用
===================================================== */

window.renderStoryScene =
  renderStoryScene;

window.applyStoryEffects =
  applyStoryEffects;

window.setStoryFlag =
  setStoryFlag;

window.getStoryFlag =
  getStoryFlag;

window.setStoryProgress =
  setStoryProgress;

window.storyEngineChoose =
  storyEngineChoose;

window.storyEngineNext =
  storyEngineNext;