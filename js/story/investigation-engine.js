/* =====================================================
   後宮生還錄
   搜查 / 搜證互動系統

   功能：
   - 搜證熱點
   - 行動次數限制
   - 搜過位置永久保存
   - 搜證結果永久保存
   - F5 後恢復搜證進度
   - 防止同一位置重複取得獎勵
===================================================== */


/* =====================================================
   目前搜證設定
   config 本身含 function，不能直接存 localStorage
   F5 後由劇情重新傳入 config，再套用已保存的 state
===================================================== */

let currentInvestigationConfig = null;


/* =====================================================
   建立空白搜證狀態
===================================================== */

function createEmptyInvestigationState() {

  return {

    active: false,

    investigationId: null,

    actionsLeft: 0,

    maxActions: 0,

    searchedLocations: [],

    results: [],

    complete: false

  };

}


/* =====================================================
   初始化 / 修復舊存檔
===================================================== */

function ensureInvestigationState() {

  if (
    !gameState.investigation
    ||
    typeof gameState.investigation !==
      "object"
  ) {

    gameState.investigation =
      createEmptyInvestigationState();

  }


  const state =
    gameState.investigation;


  if (
    !Array.isArray(
      state.searchedLocations
    )
  ) {

    state.searchedLocations = [];

  }


  if (
    !Array.isArray(
      state.results
    )
  ) {

    state.results = [];

  }


  state.actionsLeft =
    Math.max(
      0,
      Number(
        state.actionsLeft
        || 0
      )
    );


  state.maxActions =
    Math.max(
      0,
      Number(
        state.maxActions
        || 0
      )
    );


  state.active =
    state.active === true;


  state.complete =
    state.complete === true;


  return state;

}


/* =====================================================
   儲存
===================================================== */

function saveInvestigationState() {

  ensureInvestigationState();


  if (
    typeof saveGame ===
    "function"
  ) {

    saveGame();

  }

}


/* =====================================================
   強制重設搜證狀態
   測試 / 新搜證事件可使用
===================================================== */

function resetInvestigationState() {

  gameState.investigation =
    createEmptyInvestigationState();


  currentInvestigationConfig =
    null;


  saveInvestigationState();


  return getInvestigationState();

}


/* =====================================================
   搜查介面樣式
===================================================== */

function ensureInvestigationStyles() {

  const oldStyle =
    document.getElementById(
      "investigationEngineStyles"
    );


  if (oldStyle) {

    oldStyle.remove();

  }


  const style =
    document.createElement(
      "style"
    );


  style.id =
    "investigationEngineStyles";


  style.textContent = `

    #storyScreen {
      position: fixed !important;
      inset: 0 !important;

      width: 100% !important;
      height: 100dvh !important;
      min-height: 100dvh !important;
      max-height: 100dvh !important;

      margin: 0 !important;
      padding: 0 !important;

      overflow: hidden !important;

      z-index: 999 !important;

      background: #111;
    }


    .investigation-stage {
      position: relative;

      width: 100%;
      height: 100dvh;

      overflow: hidden;

      background-color: #111;
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
    }


    .investigation-dark {
      position: absolute;
      inset: 0;

      pointer-events: none;

      background:
        linear-gradient(
          to bottom,
          rgba(0,0,0,0.45) 0%,
          rgba(0,0,0,0.05) 28%,
          rgba(0,0,0,0.05) 62%,
          rgba(0,0,0,0.65) 100%
        );
    }


    .investigation-header {
      position: absolute;

      top:
        calc(
          14px +
          env(safe-area-inset-top)
        );

      left: 14px;
      right: 14px;

      z-index: 4;

      padding: 12px 14px;

      border:
        1px solid
        rgba(255,255,255,0.22);

      border-radius: 14px;

      background:
        rgba(18,12,10,0.72);

      backdrop-filter:
        blur(8px);

      -webkit-backdrop-filter:
        blur(8px);

      color: #fff;
    }


    .investigation-title {
      margin-bottom: 4px;

      font-size: 17px;
      font-weight: 700;

      letter-spacing: 1px;
    }


    .investigation-subtitle {
      font-size: 12px;

      opacity: 0.78;

      line-height: 1.5;
    }


    .investigation-actions {
      display: inline-flex;

      align-items: center;

      gap: 6px;

      margin-top: 8px;

      padding: 5px 10px;

      border-radius: 999px;

      background:
        rgba(170,121,51,0.85);

      font-size: 12px;
      font-weight: 700;
    }


    .investigation-hotspot {
      position: absolute;

      z-index: 3;

      transform:
        translate(-50%, -50%);

      min-width: 70px;
      min-height: 38px;

      padding: 8px 12px;

      border:
        1px solid
        rgba(255,225,166,0.75);

      border-radius: 999px;

      background:
        rgba(37,24,18,0.78);

      color:
        #f9e8bd;

      font-size: 13px;
      font-weight: 700;

      box-shadow:
        0 4px 18px
        rgba(0,0,0,0.35);

      backdrop-filter:
        blur(6px);

      -webkit-backdrop-filter:
        blur(6px);

      cursor: pointer;

      transition:
        transform 0.15s ease,
        opacity 0.15s ease;
    }


    .investigation-hotspot:active {
      transform:
        translate(-50%, -50%)
        scale(0.94);
    }


    .investigation-hotspot.searched {
      opacity: 0.38;

      border-style: dashed;

      cursor: default;
    }


    .investigation-hotspot.exhausted {
      opacity: 0.38;

      cursor: default;
    }


    .investigation-footer {
      position: absolute;

      left: 14px;
      right: 14px;

      bottom:
        calc(
          14px +
          env(safe-area-inset-bottom)
        );

      z-index: 4;

      display: flex;

      gap: 10px;
    }


    .investigation-footer button {
      flex: 1;

      min-height: 46px;

      border:
        1px solid
        rgba(255,255,255,0.18);

      border-radius: 12px;

      background:
        rgba(25,17,14,0.84);

      color: #fff;

      font-size: 14px;
      font-weight: 700;

      cursor: pointer;
    }


    .investigation-result-overlay {
      position: absolute;
      inset: 0;

      z-index: 10;

      display: flex;

      align-items: flex-end;

      padding:
        16px
        14px
        calc(
          16px +
          env(safe-area-inset-bottom)
        );

      background:
        rgba(0,0,0,0.32);
    }


    .investigation-result-card {
      width: 100%;

      padding: 18px;

      border:
        1px solid
        rgba(255,255,255,0.20);

      border-radius: 18px;

      background:
        rgba(24,16,13,0.94);

      color: #fff;

      box-shadow:
        0 15px 50px
        rgba(0,0,0,0.55);

      backdrop-filter:
        blur(10px);

      -webkit-backdrop-filter:
        blur(10px);
    }


    .investigation-result-name {
      margin-bottom: 10px;

      color:
        #e8c57f;

      font-size: 15px;
      font-weight: 700;
    }


    .investigation-result-text {
      font-size: 14px;

      line-height: 1.8;

      white-space: pre-line;
    }


    .investigation-result-reward {
      margin-top: 12px;

      padding: 9px 11px;

      border-radius: 10px;

      background:
        rgba(184,134,67,0.15);

      color:
        #f0d59a;

      font-size: 13px;
    }


    .investigation-result-card button {
      width: 100%;

      margin-top: 16px;

      min-height: 46px;

      border: 0;

      border-radius: 12px;

      background:
        linear-gradient(
          135deg,
          #b7833f,
          #7b5127
        );

      color: #fff;

      font-size: 14px;
      font-weight: 700;

      cursor: pointer;
    }


    @media(max-width:480px) {

      .investigation-header {
        left: 10px;
        right: 10px;

        padding: 10px 11px;
      }


      .investigation-title {
        font-size: 15px;
      }


      .investigation-subtitle {
        font-size: 11px;
      }


      .investigation-hotspot {
        min-width: 62px;
        min-height: 34px;

        padding: 7px 10px;

        font-size: 12px;
      }


      .investigation-footer {
        left: 10px;
        right: 10px;
      }

    }

  `;


  document.head.appendChild(
    style
  );

}


/* =====================================================
   取得 storyScreen
===================================================== */

function getInvestigationScreen() {

  let screen =
    document.getElementById(
      "storyScreen"
    );


  if (!screen) {

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


    if (game) {

      game.appendChild(
        screen
      );

    }

    else {

      document.body.appendChild(
        screen
      );

    }

  }


  return screen;

}


/* =====================================================
   正規化搜證設定
===================================================== */

function normalizeInvestigationConfig(
  config = {}
) {

  return {

    id:
      config.id
      || "investigation",

    title:
      config.title
      || "搜查",

    subtitle:
      config.subtitle
      || "",

    image:
      config.image
      || "",

    imagePosition:
      config.imagePosition
      || "center",

    maxActions:
      Math.max(
        1,
        Number(
          config.maxActions
          || 3
        )
      ),

    locations:
      Array.isArray(
        config.locations
      )
      ?
      config.locations
      :
      [],

    canEndEarly:
      config.canEndEarly
      !== false,

    forceRestart:
      config.forceRestart
      === true,

    onComplete:
      typeof config.onComplete
      === "function"
      ?
      config.onComplete
      :
      null

  };

}


/* =====================================================
   是否可以恢復上一次搜證

   核心：
   同一 investigationId
   + 還在進行中
   + 尚未 complete
   = 不准重設 searchedLocations / actionsLeft
===================================================== */

function canResumeInvestigation(
  config
) {

  const state =
    ensureInvestigationState();


  if (
    !config
    ||
    config.forceRestart === true
  ) {

    return false;

  }


  return (

    state.active === true

    &&

    state.complete !== true

    &&

    state.investigationId ===
      config.id

  );

}


/* =====================================================
   修復恢復中的資料
===================================================== */

function sanitizeInvestigationState(
  config
) {

  const state =
    ensureInvestigationState();


  state.investigationId =
    config.id;


  state.maxActions =
    Math.max(
      1,
      Number(
        state.maxActions
        ||
        config.maxActions
      )
    );


  state.actionsLeft =
    Math.max(
      0,
      Math.min(
        state.maxActions,
        Number(
          state.actionsLeft
          ?? state.maxActions
        )
      )
    );


  state.searchedLocations =
    [
      ...new Set(
        state.searchedLocations
          .filter(
            function (
              locationId
            ) {

              return config
                .locations
                .some(
                  function (
                    location
                  ) {

                    return (
                      location.id ===
                      locationId
                    );

                  }
                );

            }
          )
      )
    ];


  if (
    !Array.isArray(
      state.results
    )
  ) {

    state.results = [];

  }


  state.active = true;

  state.complete = false;


  return state;

}


/* =====================================================
   開始搜查

   重要：
   如果 F5 後重新呼叫相同 investigationId，
   會恢復原本狀態，不再重設。
===================================================== */

function startInvestigation(
  config = {}
) {

  ensureInvestigationState();

  ensureInvestigationStyles();


  currentInvestigationConfig =
    normalizeInvestigationConfig(
      config
    );


  const resume =
    canResumeInvestigation(
      currentInvestigationConfig
    );


  if (resume) {

    sanitizeInvestigationState(
      currentInvestigationConfig
    );


    console.log(
      "恢復搜證進度：",
      currentInvestigationConfig.id,
      getInvestigationState()
    );

  }

  else {

    gameState.investigation = {

      active:
        true,

      investigationId:
        currentInvestigationConfig.id,

      actionsLeft:
        currentInvestigationConfig
          .maxActions,

      maxActions:
        currentInvestigationConfig
          .maxActions,

      searchedLocations:
        [],

      results:
        [],

      complete:
        false

    };


    console.log(
      "開始新的搜證：",
      currentInvestigationConfig.id
    );

  }


  saveInvestigationState();


  renderInvestigationScene();


  return getInvestigationState();

}


/* =====================================================
   畫面
===================================================== */

function renderInvestigationScene() {

  const state =
    ensureInvestigationState();


  const screen =
    getInvestigationScreen();


  if (
    !currentInvestigationConfig
  ) {

    console.error(
      "尚未設定搜查資料"
    );

    return;

  }


  const noActionsLeft =
    state.actionsLeft <= 0;


  const hotspots =
    currentInvestigationConfig
      .locations
      .map(
        function (
          location
        ) {

          const searched =
            state
              .searchedLocations
              .includes(
                location.id
              );


          const disabled =
            searched
            ||
            noActionsLeft;


          const x =
            Number(
              location.x
              ?? 50
            );


          const y =
            Number(
              location.y
              ?? 50
            );


          return `

            <button

              class="
                investigation-hotspot
                ${
                  searched
                  ?
                  "searched"
                  :
                  ""
                }
                ${
                  noActionsLeft
                  &&
                  !searched
                  ?
                  "exhausted"
                  :
                  ""
                }
              "

              style="
                left:${x}%;
                top:${y}%;
              "

              ${
                disabled
                ?
                "disabled"
                :
                ""
              }

              onclick="
                investigateLocation(
                  '${location.id}'
                )
              "

            >

              ${
                searched
                ?
                "已搜・"
                :
                ""
              }

              ${location.label}

            </button>

          `;

        }
      )
      .join("");


  const footerText =
    noActionsLeft
    ?
    "行動已用盡・前往下一步"
    :
    "結束搜查";


  screen.innerHTML = `

    <div

      class="
        investigation-stage
      "

      style="
        background-image:
          url('${currentInvestigationConfig.image}');

        background-position:
          ${currentInvestigationConfig.imagePosition};
      "

    >

      <div
        class="
          investigation-dark
        "
      ></div>


      <div
        class="
          investigation-header
        "
      >

        <div
          class="
            investigation-title
          "
        >
          ${currentInvestigationConfig.title}
        </div>


        <div
          class="
            investigation-subtitle
          "
        >
          ${currentInvestigationConfig.subtitle}
        </div>


        <div
          class="
            investigation-actions
          "
        >

          剩餘行動：
          ${state.actionsLeft}
          /
          ${state.maxActions}

        </div>

      </div>


      ${hotspots}


      <div
        class="
          investigation-footer
        "
      >

        ${
          currentInvestigationConfig
            .canEndEarly

          ||

          noActionsLeft

          ?

          `

            <button
              onclick="
                finishInvestigation()
              "
            >
              ${footerText}
            </button>

          `

          :

          ""
        }

      </div>

    </div>

  `;


  /*
    確保 F5 恢復時 storyScreen
    真的顯示在目前畫面。
  */

  if (
    typeof showScreen ===
    "function"
  ) {

    showScreen(
      "storyScreen"
    );

  }


  screen.style.display =
    "block";


  window.scrollTo(
    0,
    0
  );

}


/* =====================================================
   找位置
===================================================== */

function getInvestigationLocation(
  locationId
) {

  if (
    !currentInvestigationConfig
  ) {

    return null;

  }


  return (

    currentInvestigationConfig
      .locations
      .find(
        function (
          location
        ) {

          return (
            location.id ===
            locationId
          );

        }
      )

    ||

    null

  );

}


/* =====================================================
   已搜過？
===================================================== */

function hasInvestigatedLocation(
  locationId
) {

  const state =
    ensureInvestigationState();


  return state
    .searchedLocations
    .includes(
      locationId
    );

}


/* =====================================================
   隨機結果
===================================================== */

function pickInvestigationOutcome(
  location
) {

  if (
    !Array.isArray(
      location.outcomes
    )
    ||
    location.outcomes.length ===
      0
  ) {

    return location;

  }


  const weighted = [];


  location
    .outcomes
    .forEach(
      function (
        outcome
      ) {

        const weight =
          Math.max(
            1,
            Number(
              outcome.weight
              || 1
            )
          );


        for (
          let i = 0;
          i < weight;
          i++
        ) {

          weighted.push(
            outcome
          );

        }

      }
    );


  return weighted[
    Math.floor(
      Math.random()
      *
      weighted.length
    )
  ];

}


/* =====================================================
   執行搜查
===================================================== */

function investigateLocation(
  locationId
) {

  const state =
    ensureInvestigationState();


  if (
    !state.active
    ||
    state.complete
  ) {

    return;

  }


  if (
    state.actionsLeft <= 0
  ) {

    finishInvestigation();

    return;

  }


  /*
    已搜過的位置絕對不能再搜。

    這是防止：
    - 重複拿證物
    - 重複觸發 story flag
    - 重複扣行動
  */

  if (
    hasInvestigatedLocation(
      locationId
    )
  ) {

    console.warn(
      "此位置已調查：",
      locationId
    );

    return;

  }


  const location =
    getInvestigationLocation(
      locationId
    );


  if (!location) {

    console.warn(
      "找不到搜查位置：",
      locationId
    );

    return;

  }


  /* ===============================================
     先扣次數
  =============================================== */

  state.actionsLeft =
    Math.max(
      0,
      state.actionsLeft - 1
    );


  /* ===============================================
     立刻標記已搜
     必須在獎勵前完成
  =============================================== */

  state
    .searchedLocations
    .push(
      locationId
    );


  /* ===============================================
     決定這次搜查結果
  =============================================== */

  const outcome =
    pickInvestigationOutcome(
      location
    );


  const result = {

    locationId:
      location.id,

    locationLabel:
      location.label,

    title:
      outcome.title
      || location.label,

    text:
      outcome.text
      || "什麼也沒有發現。",

    reward:
      outcome.reward
      || null,

    hiddenData:
      outcome.hiddenData
      || null

  };


  state
    .results
    .push(
      result
    );


  /*
    先存一次。

    就算玩家在獎勵畫面時直接 F5，
    也已經知道這個位置搜過。
  */

  saveInvestigationState();


  /* ===============================================
     套用獎勵
  =============================================== */

  applyInvestigationReward(
    result.reward
  );


  /*
    獎勵可能改 inventory / flag，
    再保存一次完整狀態。
  */

  saveInvestigationState();


  showInvestigationResult(
    result
  );

}


/* =====================================================
   套用獎勵
===================================================== */

function applyInvestigationReward(
  reward
) {

  if (!reward) {

    return;

  }


  if (
    reward.type ===
    "evidence"
  ) {

    if (
      typeof addEvidence ===
      "function"
    ) {

      addEvidence(
        reward.item
      );

    }


    return;

  }


  if (
    reward.type ===
    "item"
  ) {

    if (
      typeof addInventoryItem ===
      "function"
    ) {

      addInventoryItem(

        reward.item,

        reward.quantity
        || 1

      );

    }


    return;

  }


  if (
    reward.type ===
    "key_item"
  ) {

    if (
      typeof addKeyItem ===
      "function"
    ) {

      addKeyItem(
        reward.item
      );

    }


    return;

  }


  if (
    reward.type ===
    "special_resource"
  ) {

    if (
      typeof addSpecialResource ===
      "function"
    ) {

      addSpecialResource(

        reward.key,

        reward.amount
        || 1

      );

    }


    return;

  }


  if (
    reward.type ===
    "story_flag"
  ) {

    if (
      typeof setStoryFlag ===
      "function"
    ) {

      setStoryFlag(

        reward.key,

        reward.value

      );

    }


    return;

  }


  if (
    reward.type ===
    "callback"

    &&

    typeof reward.action ===
    "function"
  ) {

    reward.action();

  }

}


/* =====================================================
   顯示搜查結果
===================================================== */

function showInvestigationResult(
  result
) {

  const stage =
    document.querySelector(
      ".investigation-stage"
    );


  if (!stage) {

    return;

  }


  /*
    防止重複 overlay
  */

  const oldOverlay =
    stage.querySelector(
      ".investigation-result-overlay"
    );


  if (oldOverlay) {

    oldOverlay.remove();

  }


  const rewardText =
    getInvestigationRewardText(
      result.reward
    );


  const overlay =
    document.createElement(
      "div"
    );


  overlay.className =
    "investigation-result-overlay";


  overlay.innerHTML = `

    <div
      class="
        investigation-result-card
      "
    >

      <div
        class="
          investigation-result-name
        "
      >
        ${result.title}
      </div>


      <div
        class="
          investigation-result-text
        "
      >
        ${result.text}
      </div>


      ${
        rewardText

        ?

        `

          <div
            class="
              investigation-result-reward
            "
          >
            ${rewardText}
          </div>

        `

        :

        ""
      }


      <button

        onclick="
          closeInvestigationResult()
        "

      >

        ${
          gameState
            .investigation
            .actionsLeft
          <= 0

          ?

          "完成搜查"

          :

          "繼續搜查"
        }

      </button>

    </div>

  `;


  stage.appendChild(
    overlay
  );

}


/* =====================================================
   獎勵顯示文字
===================================================== */

function getInvestigationRewardText(
  reward
) {

  if (!reward) {

    return "";

  }


  if (
    reward.type ===
    "evidence"
  ) {

    return `
      取得證物：
      ${reward.item.name}
    `;

  }


  if (
    reward.type ===
      "item"

    ||

    reward.type ===
      "key_item"
  ) {

    return `
      取得物品：
      ${reward.item.name}
    `;

  }


  /*
    特殊資源與隱藏狀態
    不顯示數值
  */

  return "";

}


/* =====================================================
   關閉結果
===================================================== */

function closeInvestigationResult() {

  const overlay =
    document.querySelector(
      ".investigation-result-overlay"
    );


  if (overlay) {

    overlay.remove();

  }


  const state =
    ensureInvestigationState();


  if (
    state.actionsLeft <= 0
  ) {

    finishInvestigation();

    return;

  }


  renderInvestigationScene();

}


/* =====================================================
   完成搜查
===================================================== */

function finishInvestigation() {

  const state =
    ensureInvestigationState();


  /*
    已完成就不重跑 onComplete
  */

  if (
    state.complete === true
  ) {

    return;

  }


  state.active =
    false;


  state.complete =
    true;


  saveInvestigationState();


  const results =
    state.results.map(
      function (
        result
      ) {

        return {
          ...result
        };

      }
    );


  if (
    currentInvestigationConfig

    &&

    typeof currentInvestigationConfig
      .onComplete ===
      "function"
  ) {

    currentInvestigationConfig
      .onComplete(
        results
      );


    return;

  }


  console.log(
    "搜查完成",
    results
  );

}


/* =====================================================
   取得搜查結果
===================================================== */

function getInvestigationResults() {

  const state =
    ensureInvestigationState();


  return state.results.map(
    function (
      result
    ) {

      return {
        ...result
      };

    }
  );

}


/* =====================================================
   取得目前狀態
===================================================== */

function getInvestigationState() {

  const state =
    ensureInvestigationState();


  return {

    ...state,

    searchedLocations:
      [
        ...state.searchedLocations
      ],

    results:
      state.results.map(
        function (
          result
        ) {

          return {
            ...result
          };

        }
      )

  };

}


/* =====================================================
   是否目前有可恢復搜證
===================================================== */

function hasActiveInvestigation(
  investigationId = null
) {

  const state =
    ensureInvestigationState();


  if (
    state.active !== true
    ||
    state.complete === true
  ) {

    return false;

  }


  if (
    investigationId
  ) {

    return (
      state.investigationId ===
      investigationId
    );

  }


  return true;

}


/* =====================================================
   測試工具
===================================================== */

window.testInvestigationEngine =
  function () {

    startInvestigation({

      id:
        "test-room-search",

      forceRestart:
        true,

      title:
        "承露宮・夜間搜查",

      subtitle:
        "你只有三次行動。仔細選擇要查看的位置。",

      image:
        "images/scene-ep02-06-first-night.png",

      maxActions:
        3,

      locations: [

        {

          id:
            "dressing-box",

          label:
            "妝匣",

          x:
            28,

          y:
            48,

          title:
            "妝匣",

          text:
            "妝匣底層沾著一點不屬於你的香粉。",

          reward: {

            type:
              "evidence",

            item: {

              id:
                "test-strange-powder",

              name:
                "陌生香粉",

              description:
                "從妝匣底部發現的陌生香粉。",

              sourceEpisode:
                3,

              source:
                "第三集搜查測試",

              metadata: {

                truth:
                  true

              }

            }

          }

        },


        {

          id:
            "window",

          label:
            "窗邊",

          x:
            72,

          y:
            38,

          title:
            "窗框",

          text:
            "窗框邊緣有新鮮擦痕，縫隙裡卡著一小段宮絛。",

          reward: {

            type:
              "evidence",

            item: {

              id:
                "test-palace-cord",

              name:
                "宮絛碎線",

              description:
                "從窗框縫隙找到的一小段宮絛。",

              sourceEpisode:
                3,

              source:
                "第三集搜查測試",

              metadata: {

                truth:
                  true

              }

            }

          }

        },


        {

          id:
            "bed",

          label:
            "床榻",

          x:
            54,

          y:
            64,

          title:
            "床榻",

          text:
            "枕下壓著半張被撕破的紙，上面的字跡難以辨認。",

          reward: {

            type:
              "evidence",

            item: {

              id:
                "test-torn-note",

              name:
                "殘缺紙條",

              description:
                "一張只剩半邊的紙條，暫時無法判斷真假。",

              sourceEpisode:
                3,

              source:
                "第三集搜查測試",

              metadata: {

                truth:
                  false,

                reliability:
                  "unknown"

              }

            }

          }

        },


        {

          id:
            "wardrobe",

          label:
            "衣櫃",

          x:
            20,

          y:
            70,

          title:
            "衣櫃",

          text:
            "衣物的折法和青禾平日整理的方式不同。有人動過這裡。",

          reward: {

            type:
              "story_flag",

            key:
              "test_wardrobe_disturbed",

            value:
              true

          }

        },


        {

          id:
            "incense",

          label:
            "香爐",

          x:
            80,

          y:
            67,

          title:
            "香爐",

          text:
            "香灰已冷，看不出異常。你沒有找到有用的東西。"

        }

      ],


      onComplete:
        function (
          results
        ) {

          console.log(
            "搜查測試完成：",
            results
          );


          if (
            typeof renderStoryScene ===
            "function"
          ) {

            renderStoryScene({

              episode:
                "系統測試",

              location:
                "承露宮",

              title:
                "搜查結束",

              speaker:
                "青禾",

              image:
                "images/scene-ep02-06-first-night.png",

              content:
                `
                  「小主，不能再查了。」
                  <br><br>
                  遠處已經傳來宮人的腳步聲。
                  <br><br>
                  你必須帶著目前找到的東西離開。
                `,

              nextText:
                "查看搜查結果",

              nextAction:
                function () {

                  console.log(
                    getInvestigationResults()
                  );


                  if (
                    typeof getInventoryItems ===
                    "function"
                  ) {

                    console.log(
                      getInventoryItems()
                    );

                  }

                }

            });

          }

        }

    });

  };


/* =====================================================
   初始化
===================================================== */

ensureInvestigationState();


/* =====================================================
   對外提供
===================================================== */

window.startInvestigation =
  startInvestigation;


window.renderInvestigationScene =
  renderInvestigationScene;


window.investigateLocation =
  investigateLocation;


window.closeInvestigationResult =
  closeInvestigationResult;


window.finishInvestigation =
  finishInvestigation;


window.getInvestigationState =
  getInvestigationState;


window.getInvestigationResults =
  getInvestigationResults;


window.hasInvestigatedLocation =
  hasInvestigatedLocation;


window.hasActiveInvestigation =
  hasActiveInvestigation;


window.resetInvestigationState =
  resetInvestigationState;