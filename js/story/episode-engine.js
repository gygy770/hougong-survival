/* =====================================================
   後宮生還錄
   共用劇情引擎
   RPG / 視覺小說滿版模式
===================================================== */


/* =====================================================
   固定角色立繪
===================================================== */

const STORY_CHARACTER_PORTRAITS = {

  "青禾": {
    image: "images/npc-qinghe-01.png",
    position: "right"
  },

  "寧嬪・蘇婉容": {
    image: "images/npc-ningpin-01.png",
    position: "center"
  },

  "寧嬪": {
    image: "images/npc-ningpin-01.png",
    position: "center"
  },

  "沈知意": {
    image: "images/npc-shen-zhiyi-01.png",
    position: "left"
  },

  "小順子": {
    image: "images/npc-xiaoshunzi-01.png",
    position: "right"
  }

};


/* =====================================================
   建立共用劇情樣式
===================================================== */

function ensureStoryEngineStyles() {

  const oldStyle =
    document.getElementById(
      "storyEngineStyles"
    );

  if (oldStyle) {
    oldStyle.remove();
  }


  const style =
    document.createElement(
      "style"
    );

  style.id =
    "storyEngineStyles";


  style.textContent = `

    /* ================================================
       故事主畫面
    ================================================ */

    #storyScreen{
      position:absolute !important;

      inset:0 !important;

      z-index:50 !important;

      width:100% !important;

      height:100dvh !important;
      min-height:100dvh !important;
      max-height:100dvh !important;

      padding:0 !important;
      margin:0 !important;

      overflow:hidden !important;

      background:#160408;

      box-sizing:border-box;
    }


    /* ================================================
       RPG 滿版場景
    ================================================ */

    .story-rpg-scene{
      position:relative;

      width:100%;
      height:100%;

      overflow:hidden;

      background-color:#160408;

      background-size:cover;

      background-repeat:no-repeat;

      background-position:center center;
    }


    /* ================================================
       場景暗角
    ================================================ */

    .story-rpg-overlay{
      position:absolute;

      inset:0;

      z-index:1;

      pointer-events:none;

      background:
        linear-gradient(
          to bottom,

          rgba(13,2,5,.18) 0%,

          rgba(13,2,5,.02) 28%,

          rgba(13,2,5,.02) 52%,

          rgba(13,2,5,.18) 66%,

          rgba(13,2,5,.74) 100%
        );
    }


    /* ================================================
       人物立繪
    ================================================ */

    .story-rpg-character{
      position:absolute;

      z-index:2;

      bottom:14%;

      height:69%;

      max-width:82%;

      display:flex;

      align-items:flex-end;

      justify-content:center;

      pointer-events:none;

      filter:
        drop-shadow(
          0 12px 18px
          rgba(0,0,0,.42)
        );
    }


    .story-rpg-character img{
      display:block;

      width:auto;

      height:100%;

      max-width:100%;

      object-fit:contain;

      object-position:center bottom;

      user-select:none;

      -webkit-user-drag:none;
    }


    .story-rpg-character-right{
      right:-5%;
    }


    .story-rpg-character-left{
      left:-5%;
    }


    .story-rpg-character-center{
      left:50%;

      transform:
        translateX(-50%);
    }


    /* ================================================
       上方集數 / 地點 / 標題
    ================================================ */

    .story-rpg-top{
      position:absolute;

      top:
        calc(
          10px +
          env(safe-area-inset-top)
        );

      left:12px;
      right:12px;

      z-index:3;

      text-align:center;

      pointer-events:none;
    }


    .story-rpg-episode{
      color:
        rgba(240,201,121,.92);

      font-size:10px;

      letter-spacing:4px;

      text-shadow:
        0 2px 6px
        rgba(0,0,0,.85);
    }


    .story-rpg-location{
      margin-top:5px;

      color:
        rgba(255,245,225,.72);

      font-size:9px;

      letter-spacing:3px;

      text-shadow:
        0 2px 6px
        rgba(0,0,0,.85);
    }


    .story-rpg-title{
      margin-top:5px;

      color:#f0ca7d;

      font-size:22px;

      font-weight:600;

      letter-spacing:5px;

      line-height:1.25;

      text-shadow:
        0 2px 8px
        rgba(0,0,0,.9);
    }


    /* ================================================
       底部對話區
    ================================================ */

    .story-rpg-bottom{
      position:absolute;

      left:10px;
      right:10px;

      bottom:
        calc(
          10px +
          env(safe-area-inset-bottom)
        );

      z-index:4;
    }


    /* ================================================
       說話者名字
    ================================================ */

    .story-rpg-speaker{
      display:inline-block;

      position:relative;

      z-index:5;

      margin-left:10px;
      margin-bottom:-1px;

      padding:
        6px 12px;

      border:
        1px solid
        rgba(224,184,105,.45);

      border-bottom:none;

      border-radius:
        8px 8px 0 0;

      background:
        rgba(55,8,17,.92);

      color:#e7bd6e;

      font-size:11px;

      letter-spacing:2px;

      box-shadow:
        0 -4px 14px
        rgba(0,0,0,.18);
    }


    /* ================================================
       對話框
    ================================================ */

    .story-rpg-dialogue{
      position:relative;

      border:
        1px solid
        rgba(224,184,105,.38);

      border-radius:13px;

      background:
        rgba(28,2,8,.84);

      box-shadow:
        0 8px 30px
        rgba(0,0,0,.38);

      backdrop-filter:
        blur(7px);

      -webkit-backdrop-filter:
        blur(7px);

      padding:
        13px 13px 12px;

      overflow:hidden;
    }


    .story-rpg-content{
      max-height:25dvh;

      overflow-y:auto;

      overscroll-behavior:contain;

      -webkit-overflow-scrolling:touch;

      padding:
        1px 3px 2px;

      color:
        rgba(255,244,224,.93);

      font-size:14px;

      line-height:1.75;

      text-align:left;

      scrollbar-width:thin;
    }


    .story-rpg-content::-webkit-scrollbar{
      width:4px;
    }


    .story-rpg-content::-webkit-scrollbar-thumb{
      background:
        rgba(224,184,105,.30);

      border-radius:999px;
    }


    .story-rpg-content strong{
      color:#f0ca7d;

      font-weight:600;
    }


    /* ================================================
       舊版相容
    ================================================ */

    .story-speaker{
      display:inline-block;

      margin:
        2px 0 7px;

      padding:
        4px 8px;

      border:
        1px solid
        rgba(224,184,105,.30);

      border-radius:4px;

      background:
        rgba(224,184,105,.08);

      color:#efc979;

      font-size:10px;

      letter-spacing:2px;
    }


    .story-effect{
      margin-top:11px;

      padding:
        8px 10px;

      border-left:
        2px solid
        #c99546;

      background:
        rgba(201,149,70,.09);

      color:#dfc38d;

      font-size:11px;

      line-height:1.65;
    }


    /* ================================================
       選項區
    ================================================ */

    .story-rpg-actions{
      display:grid;

      gap:7px;

      margin-top:11px;
    }


    .story-choice{
      width:100%;

      padding:
        9px 10px;

      border:
        1px solid
        rgba(230,193,119,.38);

      border-radius:6px;

      background:
        linear-gradient(
          135deg,
          rgba(71,12,22,.93),
          rgba(93,35,28,.93)
        );

      color:#f6ddb0;

      text-align:left;

      font-size:11px;

      line-height:1.42;

      letter-spacing:.3px;

      cursor:pointer;

      box-shadow:
        0 3px 10px
        rgba(0,0,0,.16);
    }


    .story-choice:active{
      transform:
        scale(.99);

      background:
        rgba(135,76,43,.92);
    }


    /* ================================================
       下一步
    ================================================ */

    .story-next{
      width:100%;

      padding:
        11px 10px;

      border:none;

      border-radius:6px;

      background:
        linear-gradient(
          135deg,
          #b77c38,
          #e1bb70,
          #b77c38
        );

      color:#2b1307;

      font-size:13px;

      font-weight:bold;

      letter-spacing:5px;

      cursor:pointer;

      box-shadow:
        0 4px 13px
        rgba(0,0,0,.20);
    }


    .story-next:active{
      transform:
        scale(.99);
    }


    /* ================================================
       無背景
    ================================================ */

    .story-rpg-scene.no-image{
      background:
        radial-gradient(
          circle at top,
          #551822,
          #150407 70%
        );
    }


    /* ================================================
       手機
    ================================================ */

    @media(max-width:480px){

      .story-rpg-scene{
        background-position:
          center center;
      }


      .story-rpg-character{
        bottom:15%;

        height:66%;

        max-width:85%;
      }


      .story-rpg-character-right{
        right:-8%;
      }


      .story-rpg-character-left{
        left:-8%;
      }


      .story-rpg-top{
        top:
          calc(
            8px +
            env(safe-area-inset-top)
          );

        left:9px;
        right:9px;
      }


      .story-rpg-episode{
        font-size:9px;

        letter-spacing:3px;
      }


      .story-rpg-location{
        font-size:8px;

        margin-top:3px;
      }


      .story-rpg-title{
        margin-top:3px;

        font-size:20px;

        letter-spacing:4px;
      }


      .story-rpg-bottom{
        left:8px;
        right:8px;

        bottom:
          calc(
            8px +
            env(safe-area-inset-bottom)
          );
      }


      .story-rpg-dialogue{
        padding:
          11px 11px 10px;

        border-radius:11px;
      }


      .story-rpg-content{
        max-height:24dvh;

        font-size:13px;

        line-height:1.68;
      }


      .story-choice{
        padding:
          8px 9px;

        font-size:10px;
      }


      .story-next{
        padding:10px;

        font-size:12px;
      }

    }


    /* ================================================
       較矮手機
    ================================================ */

    @media(max-height:720px){

      .story-rpg-character{
        bottom:17%;

        height:61%;
      }


      .story-rpg-content{
        max-height:20dvh;

        font-size:12px;

        line-height:1.58;
      }


      .story-rpg-actions{
        gap:5px;

        margin-top:8px;
      }


      .story-choice{
        padding:
          7px 8px;
      }


      .story-next{
        padding:8px;
      }

    }

  `;


  document.head.appendChild(
    style
  );

}


/* =====================================================
   建立故事畫面
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

    console.error(
      "故事引擎：找不到 .game"
    );

    return null;

  }


  game.appendChild(
    screen
  );


  return screen;

}


/* =====================================================
   選項隨機排列
===================================================== */

function shuffleStoryChoices(
  choices = []
) {

  const list =
    Array.isArray(choices)
      ? [...choices]
      : [];


  for (
    let i = list.length - 1;
    i > 0;
    i--
  ) {

    const j =
      Math.floor(
        Math.random()
        *
        (i + 1)
      );


    const temp =
      list[i];


    list[i] =
      list[j];


    list[j] =
      temp;

  }


  return list;

}


/* =====================================================
   取得角色立繪

   第一優先：
   場景手動指定 characterImage

   第二優先：
   依 speaker 自動尋找固定立繪
===================================================== */

function getStoryCharacterPortrait({

  speaker = "",

  characterImage = "",

  characterPosition = ""

} = {}) {


  if (characterImage) {

    return {

      image:
        characterImage,

      position:
        characterPosition
        ||
        "right"

    };

  }


  const preset =
    STORY_CHARACTER_PORTRAITS[
      speaker
    ];


  if (!preset) {

    return null;

  }


  return {

    image:
      preset.image,

    position:
      characterPosition
      ||
      preset.position
      ||
      "right"

  };

}


/* =====================================================
   顯示劇情場景
===================================================== */

function renderStoryScene({

  episode = "",

  location = "",

  title = "",

  speaker = "",

  image = "",

  imageAlt = "",

  imagePosition =
    "center center",

  content = "",

  choices = [],

  shuffle = true,

  nextText = "",

  nextAction = null,

  characterImage = "",

  characterPosition = "",

  showCharacter = true

}) {


  const screen =
    ensureStoryScreen();


  if (!screen) {
    return;
  }


  /* ===============================================
     選項洗牌
  =============================================== */

  const normalizedChoices =
    Array.isArray(choices)
      ? choices
      : [];


  const displayChoices =

    shuffle === false

      ? [...normalizedChoices]

      : shuffleStoryChoices(
          normalizedChoices
        );


  /* ===============================================
     選項 HTML
  =============================================== */

  let actionsHTML =
    "";


  if (
    displayChoices.length
  ) {

    actionsHTML = `

      <div
        class="story-rpg-actions"
      >

        ${
          displayChoices
            .map(
              (
                choice,
                index
              ) => {

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


  else if (

    nextText

    &&

    typeof nextAction
    === "function"

  ) {

    actionsHTML = `

      <div
        class="story-rpg-actions"
      >

        <button
          class="story-next"

          onclick="
            storyEngineNext()
          "
        >

          ${nextText}

        </button>

      </div>

    `;

  }


  /* ===============================================
     背景
  =============================================== */

  let backgroundStyle =
    "";


  if (image) {

    backgroundStyle = `

      background-image:
        url('${image}');

      background-position:
        ${imagePosition};

    `;

  }


  /* ===============================================
     說話者名字
  =============================================== */

  const speakerHTML =

    speaker

      ?

      `

        <div
          class="story-rpg-speaker"
        >

          ${speaker}

        </div>

      `

      :

      "";


  /* ===============================================
     尋找人物
  =============================================== */

  const portrait =

    showCharacter === false

      ? null

      : getStoryCharacterPortrait({

          speaker:
            speaker,

          characterImage:
            characterImage,

          characterPosition:
            characterPosition

        });


  /* ===============================================
     人物 HTML
  =============================================== */

  const characterHTML =

    portrait

      ?

      `

        <div
          class="
            story-rpg-character
            story-rpg-character-${portrait.position}
          "
        >

          <img
            src="${portrait.image}"

            alt="${
              speaker
              ||
              imageAlt
              ||
              "角色"
            }"

            onerror="
              this.parentElement.style.display='none'
            "
          >

        </div>

      `

      :

      "";


  /* ===============================================
     完整畫面
  =============================================== */

  screen.innerHTML = `

    <div
      class="
        story-rpg-scene
        ${image ? "" : "no-image"}
      "

      style="
        ${backgroundStyle}
      "
    >

      <div
        class="story-rpg-overlay"
      ></div>


      ${characterHTML}


      <div
        class="story-rpg-top"
      >

        ${
          episode

            ?

            `
              <div
                class="story-rpg-episode"
              >

                ${episode}

              </div>
            `

            :

            ""
        }


        ${
          location

            ?

            `
              <div
                class="story-rpg-location"
              >

                ${location}

              </div>
            `

            :

            ""
        }


        ${
          title

            ?

            `
              <div
                class="story-rpg-title"
              >

                ${title}

              </div>
            `

            :

            ""
        }

      </div>


      <div
        class="story-rpg-bottom"
      >

        ${speakerHTML}


        <div
          class="story-rpg-dialogue"
        >

          <div
            class="story-rpg-content"
          >

            ${content}

          </div>


          ${actionsHTML}

        </div>

      </div>

    </div>

  `;


  /* ===============================================
     儲存洗牌後選項
  =============================================== */

  window.__storyChoices =
    displayChoices;


  window.__storyNextAction =
    nextAction;


  /* ===============================================
     顯示故事畫面
  =============================================== */

  if (
    typeof showScreen ===
    "function"
  ) {

    showScreen(
      "storyScreen"
    );

  }

  else {

    screen.style.display =
      "block";

  }


  window.scrollTo(
    0,
    0
  );

}


/* =====================================================
   執行玩家選項
===================================================== */

function storyEngineChoose(
  index
) {

  const choices =
    window.__storyChoices
    ||
    [];


  const choice =
    choices[index];


  if (!choice) {
    return;
  }


  if (
    typeof choice.action ===
    "function"
  ) {

    choice.action();

    return;

  }


  if (
    typeof choice.nextAction ===
    "function"
  ) {

    choice.nextAction();

  }

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
   套用玩家數值變化
===================================================== */

function applyStoryEffects(
  effects = {}
) {

  if (
    effects.money !==
    undefined
  ) {

    playerData.money =
      Number(
        playerData.money
        ||
        0
      )
      +
      Number(
        effects.money
        ||
        0
      );

  }


  if (
    effects.favor !==
    undefined
  ) {

    playerData.favor =
      Number(
        playerData.favor
        ||
        0
      )
      +
      Number(
        effects.favor
        ||
        0
      );

  }


  if (
    effects.alert !==
    undefined
  ) {

    playerData.alert =
      Number(
        playerData.alert
        ||
        0
      )
      +
      Number(
        effects.alert
        ||
        0
      );

  }


  if (
    effects.etiquette !==
    undefined
  ) {

    playerData.etiquette =
      Number(
        playerData.etiquette
        ||
        0
      )
      +
      Number(
        effects.etiquette
        ||
        0
      );

  }


  if (
    typeof saveGame ===
    "function"
  ) {

    saveGame();

  }

}


/* =====================================================
   NPC 關係系統
===================================================== */

function changeRelationship(
  npc,
  amount
) {

  if (
    !gameState.relationships
  ) {

    gameState.relationships =
      {};

  }


  const current =
    Number(
      gameState.relationships[npc]
      ||
      0
    );


  gameState.relationships[npc] =
    current
    +
    Number(
      amount
      ||
      0
    );


  if (
    typeof saveGame ===
    "function"
  ) {

    saveGame();

  }

}


/* =====================================================
   取得 NPC 關係
===================================================== */

function getRelationship(
  npc
) {

  if (
    !gameState.relationships
  ) {

    return 0;

  }


  return Number(
    gameState.relationships[npc]
    ||
    0
  );

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

    gameState.storyFlags =
      {};

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


  return gameState.storyFlags[key];

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
   對外提供
===================================================== */

window.shuffleStoryChoices =
  shuffleStoryChoices;


window.getStoryCharacterPortrait =
  getStoryCharacterPortrait;


window.renderStoryScene =
  renderStoryScene;


window.storyEngineChoose =
  storyEngineChoose;


window.storyEngineNext =
  storyEngineNext;


window.applyStoryEffects =
  applyStoryEffects;


window.changeRelationship =
  changeRelationship;


window.getRelationship =
  getRelationship;


window.setStoryFlag =
  setStoryFlag;


window.getStoryFlag =
  getStoryFlag;


window.setStoryProgress =
  setStoryProgress;