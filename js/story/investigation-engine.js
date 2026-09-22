/* =====================================================
   後宮生還錄
   搜查 / 搜證互動系統
===================================================== */


/* =====================================================
   基本狀態
===================================================== */

let currentInvestigationConfig = null;


/* =====================================================
   初始化
===================================================== */

function ensureInvestigationState() {

  if (!gameState.investigation) {

    gameState.investigation = {

      active: false,

      investigationId: null,

      actionsLeft: 0,

      maxActions: 0,

      searchedLocations: [],

      results: [],

      complete: false

    };

  }

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
      position: fixed;
      inset: 0;
      width: 100%;
      height: 100dvh;
      overflow: hidden;
      z-index: 999;
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
      top: 16px;
      left: 14px;
      right: 14px;
      z-index: 4;

      padding: 12px 14px;

      border: 1px solid rgba(255,255,255,0.22);
      border-radius: 14px;

      background:
        rgba(18, 12, 10, 0.72);

      backdrop-filter:
        blur(8px);

      color: #fff;
    }

    .investigation-title {
      font-size: 17px;
      font-weight: 700;
      letter-spacing: 1px;
      margin-bottom: 4px;
    }

    .investigation-subtitle {
      font-size: 12px;
      opacity: 0.78;
      line-height: 1.5;
    }

    .investigation-actions {
      margin-top: 8px;

      display: inline-flex;
      align-items: center;
      gap: 6px;

      padding: 5px 10px;

      border-radius: 999px;

      background:
        rgba(170, 121, 51, 0.85);

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
        1px solid rgba(255, 225, 166, 0.75);

      border-radius: 999px;

      background:
        rgba(37, 24, 18, 0.78);

      color:
        #f9e8bd;

      font-size: 13px;
      font-weight: 700;

      box-shadow:
        0 4px 18px rgba(0,0,0,0.35);

      backdrop-filter:
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

    .investigation-footer {
      position: absolute;
      left: 14px;
      right: 14px;
      bottom: calc(
        14px + env(safe-area-inset-bottom)
      );

      z-index: 4;

      display: flex;
      gap: 10px;
    }

    .investigation-footer button {
      flex: 1;

      min-height: 46px;

      border: 1px solid rgba(255,255,255,0.18);
      border-radius: 12px;

      background:
        rgba(25, 17, 14, 0.84);

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
          16px
          + env(safe-area-inset-bottom)
        );

      background:
        rgba(0,0,0,0.32);
    }

    .investigation-result-card {
      width: 100%;

      padding: 18px;

      border:
        1px solid rgba(255,255,255,0.2);

      border-radius: 18px;

      background:
        rgba(24, 16, 13, 0.94);

      color: #fff;

      box-shadow:
        0 15px 50px rgba(0,0,0,0.55);

      backdrop-filter:
        blur(10px);
    }

    .investigation-result-name {
      color:
        #e8c57f;

      font-size: 15px;
      font-weight: 700;

      margin-bottom: 10px;
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
        rgba(184, 134, 67, 0.15);

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
        "div"
      );


    screen.id =
      "storyScreen";


    document.body.appendChild(
      screen
    );

  }


  return screen;

}


/* =====================================================
   開始搜查
===================================================== */

function startInvestigation(
  config = {}
) {

  ensureInvestigationState();

  ensureInvestigationStyles();


  currentInvestigationConfig = {

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
      Number(
        config.maxActions
        || 3
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

    onComplete:
      typeof config.onComplete
      === "function"
      ?
      config.onComplete
      :
      null

  };


  gameState.investigation = {

    active:
      true,

    investigationId:
      currentInvestigationConfig.id,

    actionsLeft:
      currentInvestigationConfig.maxActions,

    maxActions:
      currentInvestigationConfig.maxActions,

    searchedLocations:
      [],

    results:
      [],

    complete:
      false

  };


  saveInvestigationState();

  renderInvestigationScene();

}


/* =====================================================
   畫面
===================================================== */

function renderInvestigationScene() {

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


  const state =
    gameState.investigation;


  const hotspots =
    currentInvestigationConfig
      .locations
      .map(
        function (location) {

          const searched =
            state
              .searchedLocations
              .includes(
                location.id
              );


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
              "
              style="
                left:${x}%;
                top:${y}%;
              "
              ${
                searched
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


  screen.innerHTML = `

    <div
      class="investigation-stage"
      style="
        background-image:
          url('${currentInvestigationConfig.image}');
        background-position:
          ${currentInvestigationConfig.imagePosition};
      "
    >

      <div
        class="investigation-dark"
      ></div>


      <div
        class="investigation-header"
      >

        <div
          class="investigation-title"
        >
          ${currentInvestigationConfig.title}
        </div>


        <div
          class="investigation-subtitle"
        >
          ${currentInvestigationConfig.subtitle}
        </div>


        <div
          class="investigation-actions"
        >
          剩餘行動：
          ${state.actionsLeft}
          /
          ${state.maxActions}
        </div>

      </div>


      ${hotspots}


      <div
        class="investigation-footer"
      >

        ${
          currentInvestigationConfig
            .canEndEarly
          ?
          `
            <button
              onclick="
                finishInvestigation()
              "
            >
              結束搜查
            </button>
          `
          :
          ""
        }

      </div>

    </div>

  `;

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
        function (location) {

          return (
            location.id
            === locationId
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

  ensureInvestigationState();


  return gameState
    .investigation
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
    location.outcomes.length
    === 0
  ) {

    return location;

  }


  const weighted = [];

  location.outcomes.forEach(
    function (outcome) {

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

  ensureInvestigationState();


  const state =
    gameState.investigation;


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


  if (
    hasInvestigatedLocation(
      locationId
    )
  ) {

    return;

  }


  const location =
    getInvestigationLocation(
      locationId
    );


  if (!location) {

    return;

  }


  state.actionsLeft -= 1;


  state
    .searchedLocations
    .push(
      locationId
    );


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


  state.results.push(
    result
  );


  applyInvestigationReward(
    result.reward
  );


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
    reward.type
    === "evidence"
  ) {

    addEvidence(
      reward.item
    );

    return;

  }


  if (
    reward.type
    === "item"
  ) {

    addInventoryItem(
      reward.item,
      reward.quantity
      || 1
    );

    return;

  }


  if (
    reward.type
    === "key_item"
  ) {

    addKeyItem(
      reward.item
    );

    return;

  }


  if (
    reward.type
    === "special_resource"
  ) {

    addSpecialResource(
      reward.key,
      reward.amount
      || 1
    );

    return;

  }


  if (
    reward.type
    === "story_flag"
  ) {

    if (
      typeof setStoryFlag
      === "function"
    ) {

      setStoryFlag(
        reward.key,
        reward.value
      );

    }

    return;

  }


  if (
    reward.type
    === "callback"
    &&
    typeof reward.action
    === "function"
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
      class="investigation-result-card"
    >

      <div
        class="investigation-result-name"
      >
        ${result.title}
      </div>


      <div
        class="investigation-result-text"
      >
        ${result.text}
      </div>


      ${
        rewardText
        ?
        `
          <div
            class="investigation-result-reward"
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
        繼續搜查
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
    reward.type
    === "evidence"
  ) {

    return `
      取得證物：
      ${reward.item.name}
    `;

  }


  if (
    reward.type
    === "item"
    ||
    reward.type
    === "key_item"
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


  if (
    gameState
      .investigation
      .actionsLeft
    <= 0
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

  ensureInvestigationState();


  const state =
    gameState.investigation;


  if (
    !state.active
    &&
    state.complete
  ) {

    return;

  }


  state.active =
    false;


  state.complete =
    true;


  saveInvestigationState();


  const results =
    [
      ...state.results
    ];


  if (
    currentInvestigationConfig
    &&
    typeof currentInvestigationConfig
      .onComplete
    === "function"
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

  ensureInvestigationState();


  return [
    ...gameState
      .investigation
      .results
  ];

}


/* =====================================================
   取得目前狀態
===================================================== */

function getInvestigationState() {

  ensureInvestigationState();


  return {

    ...gameState.investigation,

    searchedLocations:
      [
        ...gameState
          .investigation
          .searchedLocations
      ],

    results:
      [
        ...gameState
          .investigation
          .results
      ]

  };

}


/* =====================================================
   測試
===================================================== */

window.testInvestigationEngine =
  function () {

    startInvestigation({

      id:
        "test-room-search",

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
        function (results) {

          console.log(
            "搜查測試完成：",
            results
          );


          if (
            typeof renderStoryScene
            === "function"
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

                  console.log(
                    getInventoryItems()
                  );

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