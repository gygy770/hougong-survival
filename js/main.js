const SAVE_KEY = "hougong-survival-save-v5";
const AUTO_RESUME = true;
const PASS_SCORE = 65;

const AUTH_RETURN_KEY =
  "hougong-auth-return";


/* =============================
   外部資料
============================= */

const CHARACTER_DATA = window.CHARACTER_DATA;
const SELECTION_QUESTIONS = window.SELECTION_QUESTIONS;

if (!CHARACTER_DATA) {
  throw new Error("character-data.js 尚未正確載入");
}

if (!SELECTION_QUESTIONS) {
  throw new Error("selection-questions.js 尚未正確載入");
}

const {
  families,
  talents,
  personalities,
  weaknesses,
  hiddenTraits,
  characterVisuals
} = CHARACTER_DATA;


/* =============================
   玩家資料
============================= */

let playerData = {
  name: "",
  family: "",
  talent: "",
  personality: "",
  weakness: "",
  hiddenTrait: "",
  hiddenRevealed: false,

  money: 0,
  visual: "",

  favor: 0,
  alert: 0,

  etiquette: 0,

  answerScore: 0,
  answerScores: [],

  selectionScore: 0,

  rank: "xiunu",
  coldPalace: false,
  selected: false
};


/* =============================
   遊戲流程
============================= */

let gameState = {
  screen: "start",

  selectionStep: "arrival",

  hallStep: "etiquette",

  eventText: "",
  resultText: "",

  etiquetteResult: "",

  selectedQuestionIds: [],
  questionCursor: 0,

  answerResult: "",
  pendingAnswer: null,

  selectionResult: null,

  /* =============================
     Supabase / 宮籍
  ============================= */

  currentRunId: null,

  currentRunNumber: null,

  selectionResultSaved: false
};


/* =============================
   位份圖片
============================= */

const rankImages = {
  xiunu: "images/player-rank-00-xiunu.png",
  daying: "images/player-rank-01-daying.png",
  changzai: "images/player-rank-02-changzai.png",
  guiren: "images/player-rank-03-guiren.png",
  pin: "images/player-rank-04-pin.png",
  fei: "images/player-rank-05-fei.png",
  guifei: "images/player-rank-06-guifei.png",
  huangguifei: "images/player-rank-07-huangguifei.png",
  huanghou: "images/player-rank-08-huanghou.png"
};

const coldPalaceImages = {
  xiunu: "images/player-rank-00-xiunu-coldpalace.png",
  daying: "images/player-rank-01-daying-coldpalace.png",
  changzai: "images/player-rank-02-changzai-coldpalace.png",
  guiren: "images/player-rank-03-guiren-coldpalace.png",
  pin: "images/player-rank-04-pin-coldpalace.png",
  fei: "images/player-rank-05-fei-coldpalace.png",
  guifei: "images/player-rank-06-guifei-coldpalace.png",
  huangguifei: "images/player-rank-07-huangguifei-coldpalace.png",
  huanghou: "images/player-rank-08-huanghou-coldpalace.png"
};


/* =============================
   皇上思考文字
============================= */

const thinkingPhrases = [
  "嗯……",
  "……",
  "是麼……",
  "如此……",
  "朕知道了……"
];

let answerReactionTimer = null;


/* =============================
   共用工具
============================= */

function randomItem(array) {
  return array[
    Math.floor(
      Math.random() * array.length
    )
  ];
}

function clamp(number, min, max) {
  return Math.max(
    min,
    Math.min(max, number)
  );
}

function showScreen(id) {

  document
    .querySelectorAll(".screen")
    .forEach(screen => {

      screen.style.display =
        "none";

    });


  const target =
    document.getElementById(id);

  if (!target) {
    return;
  }


  const isMobile =
    window.matchMedia(
      "(max-width: 480px)"
    ).matches;


  if (
    isMobile
    &&
    id === "characterScreen"
  ) {

    target.style.display =
      "flex";

  }

  else if (
    isMobile
    &&
    (
      id === "selectionScreen"
      ||
      id === "hallScreen"
    )
  ) {

    target.style.display =
      "grid";

  }

  else {

    target.style.display =
      "block";

  }

}

function updateStatus() {
  document
    .getElementById("favorValue")
    .textContent = playerData.favor;

  document
    .getElementById("alertValue")
    .textContent = playerData.alert;
}

function getCurrentPlayerImage() {
  if (playerData.coldPalace) {
    return (
      coldPalaceImages[playerData.rank]
      || coldPalaceImages.xiunu
    );
  }

  return (
    rankImages[playerData.rank]
    || rankImages.xiunu
  );
}

function shuffle(array) {
  const copy = [...array];

  for (
    let i = copy.length - 1;
    i > 0;
    i--
  ) {
    const j =
      Math.floor(
        Math.random() * (i + 1)
      );

    [
      copy[i],
      copy[j]
    ] = [
      copy[j],
      copy[i]
    ];
  }

  return copy;
}


/* =============================
   存檔
============================= */

function saveGame() {
  localStorage.setItem(
    SAVE_KEY,

    JSON.stringify({
      playerData,
      gameState,
      savedAt: Date.now()
    })
  );
}

function loadGame() {
  const raw =
    localStorage.getItem(
      SAVE_KEY
    );

  if (!raw) {
    return false;
  }

  try {
    const data =
      JSON.parse(raw);

    playerData = {
      ...playerData,
      ...data.playerData
    };

    gameState = {
      ...gameState,
      ...data.gameState
    };

    return true;
  }

  catch (error) {
    console.error(
      "存檔讀取失敗",
      error
    );

    return false;
  }
}

function clearSave() {
  const ok =
    confirm(
      "要清除目前測試存檔並重新開始嗎？"
    );

  if (!ok) {
    return;
  }

  localStorage.removeItem(
    SAVE_KEY
  );

  location.reload();
}

function restartGame() {
  localStorage.removeItem(
    SAVE_KEY
  );

  location.reload();
}


/* =============================
   姓名限制
============================= */

const playerNameInput =
  document.getElementById(
    "playerName"
  );

playerNameInput.addEventListener(
  "input",

  function () {
    this.value =
      this.value.replace(
        /[^\p{Script=Han}]/gu,
        ""
      );
  }
);


/* =============================
   建立角色
============================= */

function createCharacter(name) {
  playerData.name = name;

  playerData.family =
    randomItem(families);

  playerData.talent =
    randomItem(talents);

  playerData.personality =
    randomItem(personalities);

  playerData.weakness =
    randomItem(weaknesses);

  playerData.hiddenTrait =
    randomItem(hiddenTraits);

  playerData.hiddenRevealed =
    false;

  playerData.favor = 0;
  playerData.alert = 0;

  playerData.etiquette = 0;

  playerData.answerScore = 0;
  playerData.answerScores = [];

  playerData.selectionScore = 0;

  playerData.rank = "xiunu";

  playerData.coldPalace = false;

  playerData.selected = false;

  let money =
    Math.floor(
      Math.random() * 31
    ) + 20;

  if (
    playerData.family ===
    "富商之家"
  ) {
    money += 20;
  }

  if (
    playerData.family ===
    "皇商旁支"
  ) {
    money += 15;
  }

  if (
    playerData.family ===
    "戶部官員之女"
  ) {
    money += 10;
  }

  if (
    playerData.family ===
    "沒落官宦之家"
  ) {
    money -= 5;
  }

  playerData.money =
    Math.max(10, money);

  playerData.visual =
    randomItem(
      characterVisuals
    );
}


/* =============================
   角色卡
============================= */

function renderCharacter() {
  document
    .getElementById(
      "playerVisual"
    )
    .src =
    playerData.visual;

  document
    .getElementById(
      "characterName"
    )
    .textContent =
    playerData.name;

  document
    .getElementById(
      "family"
    )
    .textContent =
    playerData.family;

  document
    .getElementById(
      "talent"
    )
    .textContent =
    playerData.talent;

  document
    .getElementById(
      "personality"
    )
    .textContent =
    playerData.personality;

  document
    .getElementById(
      "weakness"
    )
    .textContent =
    playerData.weakness;

  document
    .getElementById(
      "money"
    )
    .textContent =
    playerData.money
    + " 兩";
}


/* =============================
   開局
============================= */

function startGame() {
  const name =
    playerNameInput
      .value
      .trim();

  const chinesePattern =
    /^[\p{Script=Han}]{1,8}$/u;

  if (
    !chinesePattern.test(name)
  ) {
    alert(
      "請輸入中文姓名。"
    );

    return;
  }

  createCharacter(name);

  gameState.screen =
    "character";

  gameState.selectionStep =
    "arrival";

  gameState.hallStep =
    "etiquette";

  gameState.selectedQuestionIds =
    [];

  gameState.questionCursor = 0;

  gameState.answerResult = "";

  gameState.pendingAnswer =
    null;

  gameState.selectionResult =
    null;

  renderCharacter();

  showScreen(
    "characterScreen"
  );

  saveGame();

  window.scrollTo(0, 0);
}


/* =============================
   宮門
============================= */

function enterSelection() {
  gameState.screen =
    "selection";

  gameState.selectionStep =
    "sachet";

  gameState.eventText =
    playerData.name
    + "，你跟著眾秀女走入宮門候選區。";

  gameState.resultText =
    "宮門就在眼前。";

  showScreen(
    "selectionScreen"
  );

  updateStatus();

  renderSelectionBase();

  saveGame();

  setTimeout(
    startSachetEvent,
    700
  );

  window.scrollTo(0, 0);
}


/* =============================
   香囊事件
============================= */

let eventActive = false;

let timerInterval = null;

let totalTime = 7;

let remainingTime = 7;

function renderSelectionBase() {
  document
    .getElementById(
      "eventText"
    )
    .innerHTML =
    gameState.eventText;

  document
    .getElementById(
      "resultBox"
    )
    .innerHTML =
    gameState.resultText;

  document
    .getElementById(
      "eventBanner"
    )
    .style.display =
    "none";

  document
    .getElementById(
      "xiangnang"
    )
    .style.display =
    "none";

  document
    .getElementById(
      "timerBox"
    )
    .style.display =
    "none";

  document
    .getElementById(
      "sachetChoices"
    )
    .style.display =
    "none";

  document
    .getElementById(
      "continueButton"
    )
    .style.display =
    "none";

  document
    .getElementById(
      "enterHallButton"
    )
    .style.display =
    "none";
}

function startSachetEvent() {
  gameState.selectionStep =
    "sachet";

  eventActive = true;

  totalTime = 7;

  if (
    playerData.talent ===
    "臨危不亂"
  ) {
    totalTime += 2;
  }

  if (
    playerData.personality ===
    "果斷"
  ) {
    totalTime += 1;
  }

  if (
    playerData.weakness ===
    "容易緊張"
  ) {
    totalTime -= 1;
  }

  totalTime =
    Math.max(
      4,
      totalTime
    );

  remainingTime =
    totalTime;

  gameState.eventText =
    "一名秀女從你身旁匆匆走過。"
    + "<br><br>"
    + "一只香囊從她腰間掉落。";

  document
    .getElementById(
      "eventText"
    )
    .innerHTML =
    gameState.eventText;

  document
    .getElementById(
      "eventBanner"
    )
    .style.display =
    "block";

  document
    .getElementById(
      "xiangnang"
    )
    .style.display =
    "block";

  document
    .getElementById(
      "timerBox"
    )
    .style.display =
    "block";

  saveGame();

  clearInterval(
    timerInterval
  );

  updateTimer();

  timerInterval =
    setInterval(
      function () {
        remainingTime -= .1;

        if (
          remainingTime <= 0
        ) {
          remainingTime = 0;

          clearInterval(
            timerInterval
          );

          updateTimer();

          missSachet();

          return;
        }

        updateTimer();
      },

      100
    );
}

function updateTimer() {
  document
    .getElementById(
      "timerNumber"
    )
    .textContent =
    remainingTime
      .toFixed(1)
    + " 秒";

  document
    .getElementById(
      "timerBar"
    )
    .style.width =
    (
      remainingTime
      / totalTime
      * 100
    )
    + "%";
}

function pickSachet() {
  if (!eventActive) {
    return;
  }

  eventActive = false;

  clearInterval(
    timerInterval
  );

  playerData.alert += 1;

  gameState.selectionStep =
    "sachetChoice";

  gameState.resultText =
    "你及時將香囊撿了起來。"
    + "<br><br>"
    + "那名秀女仍未察覺。";

  document
    .getElementById(
      "xiangnang"
    )
    .style.display =
    "none";

  document
    .getElementById(
      "timerBox"
    )
    .style.display =
    "none";

  document
    .getElementById(
      "resultBox"
    )
    .innerHTML =
    gameState.resultText;

  document
    .getElementById(
      "sachetChoices"
    )
    .style.display =
    "grid";

  updateStatus();

  saveGame();
}

function missSachet() {
  eventActive = false;

  gameState.selectionStep =
    "afterSachet";

  gameState.resultText =
    "你猶豫了一瞬。"
    + "<br><br>"
    + "另一名秀女先一步撿走香囊。";

  document
    .getElementById(
      "xiangnang"
    )
    .style.display =
    "none";

  document
    .getElementById(
      "timerBox"
    )
    .style.display =
    "none";

  document
    .getElementById(
      "resultBox"
    )
    .innerHTML =
    gameState.resultText;

  document
    .getElementById(
      "continueButton"
    )
    .style.display =
    "block";

  saveGame();
}

function returnSachet() {
  let gain = 1;

  if (
    playerData.personality ===
    "善良"
    ||
    playerData.personality ===
    "溫柔"
  ) {
    gain += 1;
  }

  if (
    playerData.talent ===
    "天生親和"
  ) {
    gain += 1;
  }

  playerData.favor += gain;

  gameState.selectionStep =
    "afterSachet";

  gameState.resultText =
    "你追上那名秀女，將香囊交還。"
    + "<br><br>"
    + "<strong>"
    + "人情 +"
    + gain
    + "</strong>";

  document
    .getElementById(
      "sachetChoices"
    )
    .style.display =
    "none";

  document
    .getElementById(
      "resultBox"
    )
    .innerHTML =
    gameState.resultText;

  document
    .getElementById(
      "continueButton"
    )
    .style.display =
    "block";

  updateStatus();

  saveGame();
}

function inspectSachet() {
  playerData.alert += 1;

  let text =
    "你先查看了香囊。"
    + "<br><br>"
    + "上面繡著一枝白梅。";

  if (
    playerData.talent ===
    "精通香料"
    ||
    playerData.hiddenTrait ===
    "天生識香"
  ) {
    playerData.alert += 1;

    text +=
      "<br><br>"
      + "<strong>"
      + "你聞出其中有極淡的沉水香。"
      + "</strong>";
  }

  text +=
    "<br><br>"
    + "你隨後將香囊歸還。";

  gameState.selectionStep =
    "afterSachet";

  gameState.resultText =
    text;

  document
    .getElementById(
      "sachetChoices"
    )
    .style.display =
    "none";

  document
    .getElementById(
      "resultBox"
    )
    .innerHTML =
    text;

  document
    .getElementById(
      "continueButton"
    )
    .style.display =
    "block";

  updateStatus();

  saveGame();
}


/* =============================
   唱名
============================= */

function continueSelection() {

  gameState.selectionStep =
    "called";

  gameState.eventText =
    "太監展開名冊。"
    + "<br><br>"
    + "<strong>"
    + playerData.name
    + "，進殿！"
    + "</strong>";

  gameState.resultText =
    "終於輪到你。"
    + "<br><br>"
    + "正式殿選之前，需先建立宮籍。";

  document
    .getElementById(
      "eventText"
    )
    .innerHTML =
    gameState.eventText;

  document
    .getElementById(
      "resultBox"
    )
    .innerHTML =
    gameState.resultText;

  document
    .getElementById(
      "continueButton"
    )
    .style.display =
    "none";

  const enterHallButton =
    document.getElementById(
      "enterHallButton"
    );

  enterHallButton.style.display =
    "block";

  enterHallButton.textContent =
    "建 立 宮 籍";

  saveGame();
}


/* =============================
   殿堂人物
============================= */

function renderHallCharacters() {
  document
    .getElementById(
      "hallPlayerVisual"
    )
    .src =
    getCurrentPlayerImage();

  document
    .getElementById(
      "hallEmperor"
    )
    .src =
    "images/npc-emperor-01.png";

  document
    .getElementById(
      "hallEunuch"
    )
    .src =
    "images/npc-eunuch-01.png";
}

function setSpeakerFocus(
  speaker
) {
  const emperor =
    document.getElementById(
      "hallEmperor"
    );

  const eunuch =
    document.getElementById(
      "hallEunuch"
    );

  const player =
    document.getElementById(
      "hallPlayerVisual"
    );

  emperor.classList.remove(
    "character-dim"
  );

  eunuch.classList.remove(
    "character-dim"
  );

  player.classList.remove(
    "character-dim"
  );

  if (
    speaker === "太監"
  ) {
    emperor.classList.add(
      "character-dim"
    );

    player.classList.add(
      "character-dim"
    );
  }

  if (
    speaker === "皇上"
  ) {
    eunuch.classList.add(
      "character-dim"
    );

    player.classList.add(
      "character-dim"
    );
  }

  if (
    speaker === playerData.name
  ) {
    emperor.classList.add(
      "character-dim"
    );

    eunuch.classList.add(
      "character-dim"
    );
  }
}

function setHallDialog(
  speaker,
  text
) {
  setSpeakerFocus(
    speaker
  );

  document
    .getElementById(
      "hallDialog"
    )
    .innerHTML =
    '<div class="speaker-tag">'
    + speaker
    + '</div><br>'
    + text;
}


/* =============================
   進殿
============================= */

/* =============================
   建立宮籍
============================= */

async function createPalaceRun() {

  if (
    gameState.currentRunId
  ) {
    return true;
  }

  const user =
    await getCurrentUser();

  if (!user) {
    return false;
  }

  const {
    data,
    error
  } =
    await window.hougongSupabase
      .from("game_runs")
      .insert({
        user_id:
          user.id,

        player_name:
          playerData.name,

        family_background:
          playerData.family,

        talent:
          playerData.talent,

        personality:
          playerData.personality,

        weakness:
          playerData.weakness,

        hidden_trait:
          playerData.hiddenTrait,

        hidden_trait_revealed:
          playerData.hiddenRevealed,

        silver:
          playerData.money,

        favor:
          playerData.favor,

        alert:
          playerData.alert,

        etiquette:
          playerData.etiquette,

        palace_rank:
          "秀女",

        current_episode:
          1,

        max_episode_reached:
          1,

        status:
          "alive"
      })
      .select(
        "id, run_number"
      )
      .single();


  if (error) {

    console.error(
      "建立宮籍失敗：",
      error
    );

    alert(
      "宮籍建立失敗，請稍後再試。"
    );

    return false;
  }


  gameState.currentRunId =
    data.id;

  gameState.currentRunNumber =
    data.run_number;

  gameState.selectionResultSaved =
    false;

  saveGame();

  return true;
}


/* =============================
   Google 宮籍提示
============================= */

function showPalaceRegistration() {

  let overlay =
    document.getElementById(
      "palaceRegistrationOverlay"
    );


  if (!overlay) {

    overlay =
      document.createElement(
        "div"
      );

    overlay.id =
      "palaceRegistrationOverlay";


    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 99999;

      display: flex;
      align-items: center;
      justify-content: center;

      padding: 22px;

      background:
        rgba(10, 2, 4, .86);

      backdrop-filter:
        blur(7px);
    `;


    overlay.innerHTML = `

      <div
        style="
          width:min(100%,420px);
          padding:28px 22px 24px;

          border:
            1px solid
            rgba(239,201,121,.38);

          background:
            linear-gradient(
              180deg,
              #351017,
              #160609
            );

          box-shadow:
            0 20px 70px
            rgba(0,0,0,.55);

          text-align:center;
        "
      >

        <div
          style="
            color:#b58b55;
            font-size:11px;
            letter-spacing:5px;
          "
        >
          第一集・正式殿選
        </div>


        <div
          style="
            margin-top:12px;

            color:#efc979;

            font-size:29px;
            letter-spacing:7px;
          "
        >
          建 立 宮 籍
        </div>


        <div
          style="
            margin-top:15px;

            color:
              rgba(255,255,255,.70);

            font-size:13px;
            line-height:1.9;
          "
        >
          入殿之前，需先登錄宮籍。<br>
          此帳號將保存你的每一次人生、位分與結局。
        </div>


        <button
          id="googlePalaceLoginButton"

          style="
            width:100%;

            margin-top:22px;
            padding:14px 12px;

            border:
              1px solid
              rgba(255,255,255,.20);

            border-radius:5px;

            background:#ffffff;

            color:#282828;

            cursor:pointer;

            font-size:14px;
            font-weight:600;
          "
        >
          使用 Google 帳號建立宮籍
        </button>


        <button
          onclick="closePalaceRegistration()"

          style="
            width:100%;

            margin-top:10px;
            padding:11px;

            border:0;

            background:transparent;

            color:
              rgba(239,201,121,.58);

            cursor:pointer;

            font-size:11px;
            letter-spacing:3px;
          "
        >
          稍 後 再 說
        </button>

      </div>

    `;


    document.body.appendChild(
      overlay
    );


    document
      .getElementById(
        "googlePalaceLoginButton"
      )
      .onclick =
      async function () {

        localStorage.setItem(
          AUTH_RETURN_KEY,
          "enterHall"
        );

        await signInWithGoogle();

      };

  }


  overlay.style.display =
    "flex";
}


function closePalaceRegistration() {

  const overlay =
    document.getElementById(
      "palaceRegistrationOverlay"
    );


  if (overlay) {

    overlay.style.display =
      "none";

  }

}


/* =============================
   正式進殿
============================= */

async function enterHall() {

  const user =
    await getCurrentUser();


  /* 尚未登入 */

  if (!user) {

    showPalaceRegistration();

    return;
  }


  /* 已登入，建立本局宮籍 */

  const runCreated =
    await createPalaceRun();


  if (!runCreated) {
    return;
  }


  closePalaceRegistration();


  gameState.screen =
    "hall";

  gameState.hallStep =
    "etiquette";

  gameState.selectedQuestionIds =
    [];

  gameState.questionCursor =
    0;

  playerData.answerScores =
    [];

  playerData.answerScore =
    0;


  showScreen(
    "hallScreen"
  );


  renderHall();

  prepareEtiquette();

  saveGame();

  window.scrollTo(
    0,
    0
  );
}

function renderHall() {
  renderHallCharacters();

  setHallDialog(
    "太監",

    "「"
    + playerData.name
    + "，"
    + playerData.family
    + "。」"
    + "<br><br>"
    + "上前三步。"
    + "<br><br>"
    + "<strong>"
    + "行禮。"
    + "</strong>"
  );
}


/* =============================
   行禮遊戲
============================= */

let etiquetteRunning = false;

let etiquetteAnimation = null;

let pointerPosition = 0;

let pointerDirection = 1;

let etiquetteSpeed = .85;

let perfectStart = 45;

let perfectEnd = 55;

let goodStart = 34;

let goodEnd = 66;

function prepareEtiquette() {
  document
    .getElementById(
      "etiquetteGame"
    )
    .style.display =
    "block";

  document
    .getElementById(
      "answerGame"
    )
    .style.display =
    "none";

  etiquetteRunning = true;

  pointerPosition = 0;

  pointerDirection = 1;

  etiquetteSpeed = .85;

  perfectStart = 45;

  perfectEnd = 55;

  goodStart = 34;

  goodEnd = 66;

  if (
    playerData.talent ===
    "沉著冷靜"
  ) {
    etiquetteSpeed -= .18;
  }

  if (
    playerData.talent ===
    "臨危不亂"
  ) {
    etiquetteSpeed -= .12;

    perfectStart -= 2;

    perfectEnd += 2;
  }

  if (
    playerData.weakness ===
    "容易緊張"
  ) {
    etiquetteSpeed += .22;
  }

  if (
    playerData.family ===
    "禮部官員之女"
  ) {
    perfectStart = 42;

    perfectEnd = 58;

    goodStart = 30;

    goodEnd = 70;
  }

  if (
    playerData.personality ===
    "自信"
  ) {
    goodStart -= 3;

    goodEnd += 3;
  }

  document
    .getElementById(
      "perfectZone"
    )
    .style.left =
    perfectStart + "%";

  document
    .getElementById(
      "perfectZone"
    )
    .style.width =
    (
      perfectEnd
      - perfectStart
    )
    + "%";

  document
    .getElementById(
      "goodZone"
    )
    .style.left =
    goodStart + "%";

  document
    .getElementById(
      "goodZone"
    )
    .style.width =
    (
      goodEnd
      - goodStart
    )
    + "%";

  document
    .getElementById(
      "bowButton"
    )
    .disabled =
    false;

  document
    .getElementById(
      "etiquetteResult"
    )
    .innerHTML =
    "看準時機，按下「行禮」。";

  document
    .getElementById(
      "etiquetteScore"
    )
    .textContent =
    playerData.etiquette || 0;

  document
    .getElementById(
      "nextTestButton"
    )
    .style.display =
    "none";

  etiquetteLoop();
}

function etiquetteLoop() {
  if (
    !etiquetteRunning
  ) {
    return;
  }

  pointerPosition +=
    etiquetteSpeed
    * pointerDirection;

  if (
    pointerPosition >= 100
  ) {
    pointerPosition = 100;

    pointerDirection = -1;
  }

  if (
    pointerPosition <= 0
  ) {
    pointerPosition = 0;

    pointerDirection = 1;
  }

  document
    .getElementById(
      "etiquettePointer"
    )
    .style.left =
    "calc("
    + pointerPosition
    + "% - 2px)";

  etiquetteAnimation =
    requestAnimationFrame(
      etiquetteLoop
    );
}

function stopEtiquette() {
  if (
    !etiquetteRunning
  ) {
    return;
  }

  etiquetteRunning = false;

  cancelAnimationFrame(
    etiquetteAnimation
  );

  let score = 35;

  let result =
    "<strong>"
    + "行禮失誤"
    + "</strong>"
    + "<br><br>"
    + "你的動作慢了一拍。";

  if (
    pointerPosition >=
    perfectStart
    &&
    pointerPosition <=
    perfectEnd
  ) {
    score = 100;

    result =
      "<strong>"
      + "完美行禮"
      + "</strong>"
      + "<br><br>"
      + "你的動作恰到好處。";
  }

  else if (
    pointerPosition >=
    goodStart
    &&
    pointerPosition <=
    goodEnd
  ) {
    score = 70;

    result =
      "<strong>"
      + "禮數周全"
      + "</strong>"
      + "<br><br>"
      + "雖稍有生澀，但沒有失禮。";
  }

  if (
    score === 35
    &&
    playerData.talent ===
    "天生好運"
    &&
    Math.random() < .5
  ) {
    score = 60;

    result +=
      "<br><br>"
      + "<strong>"
      + "【天生好運】"
      + "</strong>"
      + "<br>"
      + "殿外恰好傳來聲響，"
      + "主位沒有看清你的失誤。";
  }

  playerData.etiquette =
    score;

  gameState.hallStep =
    "etiquetteDone";

  gameState.etiquetteResult =
    result;

  document
    .getElementById(
      "etiquetteScore"
    )
    .textContent =
    score;

  document
    .getElementById(
      "etiquetteResult"
    )
    .innerHTML =
    result;

  document
    .getElementById(
      "bowButton"
    )
    .disabled =
    true;

  document
    .getElementById(
      "nextTestButton"
    )
    .style.display =
    "block";

  setHallDialog(
    "皇上",
    "……<br><br>抬起頭來。"
  );

  saveGame();
}


/* =============================
   殿前三問
============================= */

function prepareQuestionSet() {
  if (
    gameState
      .selectedQuestionIds
      .length === 3
  ) {
    return;
  }

  gameState.selectedQuestionIds =
    shuffle(
      SELECTION_QUESTIONS
    )
      .slice(0, 3)
      .map(
        question =>
          question.id
      );

  gameState.questionCursor = 0;

  playerData.answerScores =
    [];

  playerData.answerScore = 0;
}

function getCurrentQuestion() {
  const id =
    gameState
      .selectedQuestionIds[
        gameState.questionCursor
      ];

  return (
    SELECTION_QUESTIONS.find(
      question =>
        question.id === id
    )
    || null
  );
}

function startAnswerTest() {
  prepareQuestionSet();

  gameState.hallStep =
    "answer";

  document
    .getElementById(
      "etiquetteGame"
    )
    .style.display =
    "none";

  document
    .getElementById(
      "answerGame"
    )
    .style.display =
    "block";

  renderQuestion();

  saveGame();
}


/* =============================
   顯示殿選題目
============================= */

function renderQuestion() {
  const question =
    getCurrentQuestion();

  if (!question) {
    return;
  }

  const questionNumber =
    gameState.questionCursor + 1;

  const questionNames = [
    "第一問",
    "第二問",
    "第三問"
  ];

  document
    .getElementById(
      "hallTitle"
    )
    .textContent =
    "第二關・殿前應答";

  document
    .getElementById(
      "hallNotice"
    )
    .innerHTML =
    "<strong>"
    + questionNames[
        questionNumber - 1
      ]
    + "</strong>"
    + "<br><br>"
    + "皇上正在問話。";

  setHallDialog(
    "皇上",
    question.question
  );

  document
    .getElementById(
      "questionBox"
    )
    .innerHTML =
    question.question;

  const insightBox =
    document.getElementById(
      "insightBox"
    );

  if (
    playerData.talent ===
    "察言觀色"
    ||
    playerData.talent ===
    "識人有術"
  ) {
    insightBox.style.display =
      "block";

    insightBox.innerHTML =
      "<strong>"
      + "【天賦提示】"
      + "</strong>"
      + "<br>"
      + question.insight;
  }

  else {
    insightBox.style.display =
      "none";
  }

  const container =
    document.getElementById(
      "answerOptions"
    );

  container.innerHTML = "";

  question.options.forEach(
    function (
      option,
      index
    ) {
      const button =
        document.createElement(
          "button"
        );

      button.className =
        "answer-option";

      button.innerHTML =
        option.text;

      button.onclick =
        function () {
          chooseAnswer(
            index
          );
        };

      container.appendChild(
        button
      );
    }
  );

  document
    .getElementById(
      "answerResult"
    )
    .style.display =
    "none";

  document
    .getElementById(
      "answerScoreBox"
    )
    .style.display =
    "none";

  document
    .getElementById(
      "judgementButton"
    )
    .style.display =
    "none";
}


/* =============================
   應答判定
============================= */

function chooseAnswer(
  optionIndex
) {
  if (
    gameState.hallStep ===
    "answerThinking"
  ) {
    return;
  }

  const question =
    getCurrentQuestion();

  if (!question) {
    return;
  }

  const option =
    question.options[
      optionIndex
    ];

  let score =
    option.base;

  const effects = [];

  const possibleKeys = [
    playerData.family,
    playerData.talent,
    playerData.personality,
    playerData.weakness,
    playerData.hiddenTrait
  ];

  possibleKeys.forEach(
    function (key) {
      if (
        option.bonuses
        &&
        option.bonuses[key]
      ) {
        score +=
          option.bonuses[key];

        effects.push(
          key
          + " +"
          + option.bonuses[key]
        );
      }

      if (
        option.penalties
        &&
        option.penalties[key]
      ) {
        score +=
          option.penalties[key];

        effects.push(
          key
          + " "
          + option.penalties[key]
        );
      }
    }
  );

  if (
    playerData.talent ===
    "沉著冷靜"
  ) {
    score += 3;

    effects.push(
      "沉著冷靜 +3"
    );
  }

  if (
    playerData.weakness ===
    "容易緊張"
  ) {
    const penalty =
      Math.floor(
        Math.random() * 7
      );

    score -= penalty;

    if (
      penalty > 0
    ) {
      effects.push(
        "緊張 -"
        + penalty
      );
    }
  }

  if (
    playerData.talent ===
    "天生好運"
  ) {
    const bonus =
      Math.floor(
        Math.random() * 7
      );

    score += bonus;

    if (
      bonus > 0
    ) {
      effects.push(
        "天生好運 +"
        + bonus
      );
    }
  }

  score =
    clamp(
      Math.round(score),
      0,
      100
    );

  let emperorReaction = "";

  if (
    score >= 88
  ) {
    emperorReaction =
      "皇上看了你片刻，"
      + "神色似乎比方才柔和了一些。";
  }

  else if (
    score >= 70
  ) {
    emperorReaction =
      "皇上輕輕點了點頭，"
      + "沒有立刻再說什麼。";
  }

  else if (
    score >= 55
  ) {
    emperorReaction =
      "皇上神色未變，"
      + "你一時看不出他是否滿意。";
  }

  else {
    emperorReaction =
      "皇上的目光在你身上停了一瞬，"
      + "很快便移開了。";
  }

  gameState.hallStep =
    "answerThinking";

  gameState.pendingAnswer = {
    score,

    answerText:
      option.text,

    emperorReaction,

    effects,

    thinkingPhrase:
      randomItem(
        thinkingPhrases
      )
  };

  document
    .querySelectorAll(
      ".answer-option"
    )
    .forEach(
      button => {
        button.disabled = true;
      }
    );

  document
    .getElementById(
      "answerResult"
    )
    .style.display =
    "none";

  document
    .getElementById(
      "answerScoreBox"
    )
    .style.display =
    "none";

  document
    .getElementById(
      "judgementButton"
    )
    .style.display =
    "none";

  setHallDialog(
    playerData.name,

    "「"
    + option.text
    + "」"
  );

  saveGame();

  clearTimeout(
    answerReactionTimer
  );

  answerReactionTimer =
    setTimeout(
      showEmperorThinking,
      650
    );
}

function showEmperorThinking() {
  if (
    !gameState.pendingAnswer
  ) {
    return;
  }

  setHallDialog(
    "皇上",

    '<span class="thinking">'
    + gameState
      .pendingAnswer
      .thinkingPhrase
    + '</span>'
  );

  clearTimeout(
    answerReactionTimer
  );

  answerReactionTimer =
    setTimeout(
      finishAnswerReaction,
      2000
    );
}

function finishAnswerReaction() {
  if (
    !gameState.pendingAnswer
  ) {
    return;
  }

  const pending =
    gameState.pendingAnswer;

  playerData.answerScores[
    gameState.questionCursor
  ] = pending.score;

  playerData.answerScore =
    Math.round(
      playerData
        .answerScores
        .reduce(
          (sum, score) =>
            sum + score,
          0
        )
      /
      playerData
        .answerScores
        .length
    );

  gameState.hallStep =
    "answerDone";

  gameState.answerResult =
    pending.emperorReaction;

  setHallDialog(
    "皇上",
    pending.emperorReaction
  );

  document
    .getElementById(
      "answerResult"
    )
    .style.display =
    "block";

  document
    .getElementById(
      "answerResult"
    )
    .innerHTML =
    pending.emperorReaction
    +
    (
      pending.effects.length
      ?
      "<br><br>"
      + "<strong>"
      + "屬性影響："
      + pending.effects.join("、")
      + "</strong>"
      :
      ""
    );

  document
    .getElementById(
      "answerScoreBox"
    )
    .style.display =
    "flex";

  document
    .getElementById(
      "answerScoreNumber"
    )
    .textContent =
    pending.score;

  const judgementButton =
    document.getElementById(
      "judgementButton"
    );

  judgementButton.style.display =
    "block";

  if (
    gameState.questionCursor < 2
  ) {
    judgementButton.textContent =
      "接 受 下 一 問";
  }

  else {
    judgementButton.textContent =
      "等 候 留 牌";
  }

  gameState.pendingAnswer =
    null;

  saveGame();
}


/* =============================
   下一題 / 最終判定
============================= */

function calculateSelectionResult() {
  if (
    gameState.questionCursor < 2
  ) {
    gameState.questionCursor += 1;

    gameState.hallStep =
      "answer";

    renderQuestion();

    saveGame();

    window.scrollTo(0, 0);

    return;
  }

  calculateFinalSelectionResult();
}


/* =============================
   家世修正
============================= */

function getFamilyModifier() {
  const map = {
    "正四品官員之女": 6,
    "正五品官員之女": 5,
    "正六品官員之女": 4,
    "翰林院官員之女": 4,
    "禮部官員之女": 4,
    "將門之女": 4,

    "太醫世家": 3,
    "書香世家": 3,

    "地方知縣之女": 2,
    "戶部官員之女": 2,
    "武官之家": 2,

    "皇商旁支": 1,
    "地方士紳之家": 1,

    "富商之家": 0,
    "京城普通官戶": 0,
    "邊疆官員之女": 0,

    "沒落官宦之家": -1,
    "官宦繼女": -1,

    "孤女寄居親族": -2,
    "小官庶女": -2
  };

  return (
    map[playerData.family]
    || 0
  );
}


/* =============================
   特質修正
============================= */

function getTraitModifier() {
  let modifier = 0;

  const positiveTalent = [
    "察言觀色",
    "善於交際",
    "心思縝密",
    "沉著冷靜",
    "識人有術",
    "臨危不亂",
    "天生親和"
  ];

  if (
    positiveTalent.includes(
      playerData.talent
    )
  ) {
    modifier += 3;
  }

  if (
    [
      "八面玲瓏",
      "自信",
      "聰慧",
      "冷靜理性"
    ].includes(
      playerData.personality
    )
  ) {
    modifier += 2;
  }

  if (
    playerData.weakness ===
    "容易緊張"
  ) {
    modifier -= 3;
  }

  if (
    [
      "衝動",
      "過度好勝"
    ].includes(
      playerData.weakness
    )
  ) {
    modifier -= 2;
  }

  if (
    playerData.hiddenTrait ===
    "皇帝曾見過你"
  ) {
    modifier += 5;
  }

  if (
    [
      "命格極貴",
      "鳳命傳聞"
    ].includes(
      playerData.hiddenTrait
    )
  ) {
    modifier += 3;
  }

  if (
    [
      "不祥傳聞纏身",
      "克主之命"
    ].includes(
      playerData.hiddenTrait
    )
  ) {
    modifier -= 4;
  }

  return modifier;
}


/* =============================
   宮門事件修正
============================= */

function getEventModifier() {
  return Math.round(
    Math.min(
      playerData.favor * 1.5,
      4
    )
    +
    Math.min(
      playerData.alert * .5,
      2
    )
  );
}

/* =============================
   結果排行榜讀取
============================= */

async function loadResultRanking() {

  if (
    !window.hougongSupabase
    ||
    typeof updateResultRanking
      !== "function"
  ) {
    return;
  }


  try {

    let currentRunId =
      gameState.currentRunId;

    let currentRunNumber =
      gameState.currentRunNumber;


    const user =
      await getCurrentUser();


    if (!user) {
      console.warn(
        "排行榜：尚未登入"
      );

      return;
    }


    /*
      舊存檔如果沒有 currentRunId，
      自動找這個帳號最新的同名角色。
    */

    if (!currentRunId) {

      const {
        data: latestRuns,
        error: latestError
      } =
        await window
          .hougongSupabase
          .from("game_runs")
          .select(
            "id, run_number"
          )
          .eq(
            "user_id",
            user.id
          )
          .eq(
            "player_name",
            playerData.name
          )
          .order(
            "updated_at",
            {
              ascending: false
            }
          )
          .limit(1);


      if (latestError) {

        console.error(
          "排行榜：找不到目前角色",
          latestError
        );

        return;
      }


      if (
        latestRuns
        &&
        latestRuns.length
      ) {

        currentRunId =
          latestRuns[0].id;

        currentRunNumber =
          latestRuns[0]
            .run_number;

        gameState.currentRunId =
          currentRunId;

        gameState.currentRunNumber =
          currentRunNumber;

        saveGame();

      }

    }


    if (!currentRunId) {

      console.warn(
        "排行榜：沒有目前遊戲紀錄"
      );

      return;

    }


    /*
      本局排名
    */

    const {
      data: rankRows,
      error: rankError
    } =
      await window
        .hougongSupabase
        .rpc(
          "get_my_run_rank",
          {
            target_run_id:
              currentRunId
          }
        );


    if (rankError) {

      console.error(
        "排行榜讀取失敗",
        rankError
      );

      return;

    }


    const rankData =
      Array.isArray(rankRows)
      ?
      rankRows[0]
      :
      rankRows;


    if (!rankData) {

      console.warn(
        "排行榜：沒有排名資料"
      );

      return;

    }


    /*
      全球統計
    */

    let globalStats = null;

    const {
      data: statsRows,
      error: statsError
    } =
      await window
        .hougongSupabase
        .rpc(
          "get_global_stats"
        );


    if (!statsError) {

      globalStats =
        Array.isArray(statsRows)
        ?
        statsRows[0]
        :
        statsRows;

    }


    /*
      本帳號個人最佳成績
    */

    let personalBest = null;

    const {
      data: bestRows,
      error: bestError
    } =
      await window
        .hougongSupabase
        .from("game_runs")
        .select(
          "total_score"
        )
        .eq(
          "user_id",
          user.id
        )
        .not(
          "total_score",
          "is",
          null
        )
        .order(
          "total_score",
          {
            ascending: false
          }
        )
        .limit(1);


    if (
      !bestError
      &&
      bestRows
      &&
      bestRows.length
    ) {

      personalBest =
        bestRows[0]
          .total_score;

    }


    /*
      更新結果頁
    */

    updateResultRanking({

      currentRank:
        Number(
          rankData.current_rank
        ),

      beatenPlayers:
        Number(
          rankData.beaten_players
        ),

      /*
        這裡刻意使用排名 RPC 的 total_players，
        因為它就是：
        1 個角色 = 1 名玩家
      */

      totalPlayers:
        Number(
          rankData.total_players
        ),

      totalRuns:
        globalStats
        ?
        Number(
          globalStats.total_runs
        )
        :
        null,

      passedRuns:
        globalStats
        ?
        Number(
          globalStats.passed_runs
        )
        :
        null,

      personalBest:
        personalBest === null
        ?
        null
        :
        Number(
          personalBest
        ),

      runNumber:
        currentRunNumber
        ??
        null

    });


    console.log(
      "排行榜已更新",
      {
        rank:
          rankData.current_rank,

        players:
          rankData.total_players,

        beaten:
          rankData.beaten_players
      }
    );

  }

  catch (error) {

    console.error(
      "排行榜系統錯誤",
      error
    );

  }

}


/* =============================
   最終選秀結果
============================= */

/* =============================
   儲存第一集殿選結果
============================= */

async function saveSelectionResultToDatabase() {

  const result =
    gameState.selectionResult;


  /* 沒有結果，不處理 */

  if (!result) {
    return false;
  }


  /* 沒有本局 Supabase ID，不處理 */

  if (
    !gameState.currentRunId
  ) {

    console.warn(
      "尚未建立本局宮籍，無法儲存殿選結果。"
    );

    return false;
  }


  /* 防止重複寫入 */

  if (
    gameState.selectionResultSaved
  ) {
    return true;
  }


  const passed =
    result.passed;


  const runStatus =
    passed
    ?
    "alive"
    :
    "expelled";


  const endReason =
    passed
    ?
    null
    :
    "選秀落選";


  /* =============================
     1. 更新 game_runs
  ============================= */

  const runUpdate = {

    silver:
      playerData.money,

    favor:
      playerData.favor,

    alert:
      playerData.alert,

    etiquette:
      playerData.etiquette,

    palace_rank:
      "秀女",

    current_episode:
      1,

    max_episode_reached:
      1,

    selection_etiquette_score:
      playerData.etiquette,

    selection_answer_score:
      playerData.answerScore,

    selection_family_modifier:
      result.familyModifier,

    selection_trait_modifier:
      result.traitModifier,

    selection_event_modifier:
      result.eventModifier,

    selection_luck_modifier:
      result.luckModifier,

    selection_total_score:
      result.total,

    passed_selection:
      passed,

    total_score:
      result.total,

    status:
      runStatus,

    end_reason:
      endReason

  };


  /*
    落選代表這一局正式結束，
    記錄 ended_at。
  */

  if (!passed) {

    runUpdate.ended_at =
      new Date().toISOString();

  }


  const {
    error: runError
  } =
    await window.hougongSupabase
      .from("game_runs")
      .update(
        runUpdate
      )
      .eq(
        "id",
        gameState.currentRunId
      );


  if (runError) {

    console.error(
      "更新殿選結果失敗：",
      runError
    );

    alert(
      "殿選結果儲存失敗，請稍後再試。"
    );

    return false;
  }


  /* =============================
     2. 建立第一集紀錄
  ============================= */

  const user =
    await getCurrentUser();


  if (!user) {

    console.error(
      "找不到目前登入玩家。"
    );

    return false;
  }


  const {
    error: episodeError
  } =
    await window.hougongSupabase
      .from("episode_records")
      .upsert(
        {

          run_id:
            gameState.currentRunId,

          user_id:
            user.id,

          episode_number:
            1,

          episode_title:
            "選秀",

          outcome_type:
            passed
            ?
            "survived"
            :
            "expelled",

          status_after:
            runStatus,

          end_reason:
            endReason,

          episode_score:
            result.total,

          total_score:
            result.total,

          silver_after:
            playerData.money,

          favor_after:
            playerData.favor,

          alert_after:
            playerData.alert,

          etiquette_after:
            playerData.etiquette,

          palace_rank_after:
            "秀女",

          episode_flags: {

            passed_selection:
              passed,

            family:
              playerData.family,

            talent:
              playerData.talent,

            personality:
              playerData.personality,

            weakness:
              playerData.weakness,

            hidden_trait:
              playerData.hiddenTrait,

            hidden_trait_revealed:
              playerData.hiddenRevealed

          }

        },

        {

          onConflict:
            "run_id,episode_number"

        }
      );


  if (episodeError) {

    console.error(
      "建立第一集紀錄失敗：",
      episodeError
    );

    alert(
      "第一集紀錄儲存失敗，請稍後再試。"
    );

    return false;
  }


  /* =============================
     儲存成功
  ============================= */

  gameState.selectionResultSaved =
    true;


  saveGame();


  console.log(
    "第一集殿選結果已寫入 Supabase。"
  );


  return true;
}

async function calculateFinalSelectionResult() {

  const familyModifier =
    getFamilyModifier();

  const traitModifier =
    getTraitModifier();

  const eventModifier =
    getEventModifier();


  let luckModifier =
    Math.floor(
      Math.random() * 9
    ) - 4;


  if (
    playerData.talent ===
    "天生好運"
  ) {

    luckModifier =
      Math.max(
        0,
        luckModifier
      ) + 2;

  }


  const total =
    clamp(
      Math.round(

        playerData.etiquette
        * .4

        +

        playerData.answerScore
        * .4

        +

        familyModifier

        +

        traitModifier

        +

        eventModifier

        +

        luckModifier

      ),

      0,
      100
    );


  playerData.selectionScore =
    total;


  playerData.selected =
    total >= PASS_SCORE;


  gameState.screen =
    "result";


  gameState.selectionResult = {

    passed:
      playerData.selected,

    total,

    familyModifier,

    traitModifier,

    eventModifier,

    luckModifier

  };


  /*
    先把結果存到本機，
    就算網路突然抽風，
    玩家也不會整局消失。
  */

  saveGame();


  /*
    先顯示結果頁，
    不讓玩家盯著空白畫面等資料庫。
  */

showScreen(
  "selectionResultScreen"
);

renderSelectionResult();

saveGame();

loadResultRanking();

window.scrollTo(0, 0);


  /*
    再把第一集結果
    正式寫進 Supabase。
  */

  const databaseSaved =
    await saveSelectionResultToDatabase();


  if (databaseSaved) {

    console.log(
      "第一集結果已完成雲端儲存。"
    );

  }

  else {

    console.warn(
      "第一集結果目前只有本機存檔。"
    );

  }

}


/* =============================
   結果頁
============================= */

function signedNumber(number) {
  if (
    number > 0
  ) {
    return "+"
      + number;
  }

  return String(number);
}

function renderSelectionResult() {
  const result =
    gameState.selectionResult;

  if (!result) {
    return;
  }

  document
    .getElementById(
      "finalEtiquette"
    )
    .textContent =
    playerData.etiquette
    + " 分";

  document
    .getElementById(
      "finalAnswer"
    )
    .textContent =
    playerData.answerScore
    + " 分";

  document
    .getElementById(
      "finalFamily"
    )
    .textContent =
    signedNumber(
      result.familyModifier
    );

  document
    .getElementById(
      "finalTrait"
    )
    .textContent =
    signedNumber(
      result.traitModifier
    );

  document
    .getElementById(
      "finalEvent"
    )
    .textContent =
    signedNumber(
      result.eventModifier
    );

  document
    .getElementById(
      "finalLuck"
    )
    .textContent =
    signedNumber(
      result.luckModifier
    );

  document
    .getElementById(
      "finalScore"
    )
    .textContent =
    "總評 "
    + result.total
    + " 分";

  if (
    result.passed
  ) {
    const over =
      result.total
      - PASS_SCORE;

    document
      .getElementById(
        "finalSymbol"
      )
      .textContent =
      "留";

    document
      .getElementById(
        "finalTitle"
      )
      .textContent =
      "留 牌";

    document
      .getElementById(
        "finalSubtitle"
      )
      .textContent =
      "第一集・選秀通過";

    document
      .getElementById(
        "finalStory"
      )
      .innerHTML =
      "太監再次看了一眼名冊。"
      + "<br><br>"
      + "「"
      + playerData.name
      + "，留牌。」"
      + "<br><br>"
      + "你垂首謝恩。"
      + "<br><br>"
      + "<strong>"
      + "從這一刻起，"
      + "你真正踏進了後宮。"
      + "</strong>"
      + "<br><br>"
      + "留牌門檻："
      + PASS_SCORE
      + " 分"
      + "<br>"
      + "你高於門檻 "
      + over
      + " 分。";

    document
      .getElementById(
        "endingTag"
      )
      .innerHTML =
      "你活過了第一集。"
      + "<br>"
      + "下一階段：冊封與正式入宮";
  }

  else {
    const short =
      PASS_SCORE
      - result.total;

    document
      .getElementById(
        "finalSymbol"
      )
      .textContent =
      "落";

    document
      .getElementById(
        "finalTitle"
      )
      .textContent =
      "撂 牌";

    document
      .getElementById(
        "finalSubtitle"
      )
      .textContent =
      "第一集・選秀落選";

    document
      .getElementById(
        "finalStory"
      )
      .innerHTML =
      "殿中安靜片刻。"
      + "<br><br>"
      + "太監垂首上前。"
      + "<br><br>"
      + "「"
      + playerData.name
      + "，撂牌子，賜花。」"
      + "<br><br>"
      + "<strong>"
      + "宮門近在眼前，"
      + "但你的故事止於今日。"
      + "</strong>"
      + "<br><br>"
      + "留牌門檻："
      + PASS_SCORE
      + " 分"
      + "<br>"
      + "距離留牌還差 "
      + short
      + " 分。";

    document
      .getElementById(
        "endingTag"
      )
      .innerHTML =
      "本局結束。"
      + "<br>"
      + "你活到了第 1 集。";
  }
}


/* =============================
   存檔還原
============================= */

function restoreGame() {
  renderCharacter();

if (
  gameState.screen ===
  "result"
) {

  showScreen(
    "selectionResultScreen"
  );

  renderSelectionResult();

  loadResultRanking();

  return;

}

  if (
    gameState.screen ===
    "selection"
  ) {
    showScreen(
      "selectionScreen"
    );

    updateStatus();

    renderSelectionBase();

    if (
      gameState.selectionStep ===
      "sachet"
    ) {
      setTimeout(
        startSachetEvent,
        300
      );
    }

    else if (
      gameState.selectionStep ===
      "sachetChoice"
    ) {
      document
        .getElementById(
          "resultBox"
        )
        .innerHTML =
        gameState.resultText;

      document
        .getElementById(
          "sachetChoices"
        )
        .style.display =
        "grid";
    }

    else if (
      gameState.selectionStep ===
      "afterSachet"
    ) {
      document
        .getElementById(
          "eventText"
        )
        .innerHTML =
        gameState.eventText;

      document
        .getElementById(
          "resultBox"
        )
        .innerHTML =
        gameState.resultText;

      document
        .getElementById(
          "continueButton"
        )
        .style.display =
        "block";
    }

    else if (
      gameState.selectionStep ===
      "called"
    ) {
      document
        .getElementById(
          "eventText"
        )
        .innerHTML =
        gameState.eventText;

      document
        .getElementById(
          "resultBox"
        )
        .innerHTML =
        gameState.resultText;

      document
        .getElementById(
          "enterHallButton"
        )
        .style.display =
        "block";
    }

    return;
  }

  if (
    gameState.screen ===
    "hall"
  ) {
    showScreen(
      "hallScreen"
    );

    renderHallCharacters();

    if (
      gameState.hallStep ===
      "etiquette"
    ) {
      renderHall();

      prepareEtiquette();
    }

    else if (
      gameState.hallStep ===
      "etiquetteDone"
    ) {
      document
        .getElementById(
          "etiquetteGame"
        )
        .style.display =
        "block";

      document
        .getElementById(
          "answerGame"
        )
        .style.display =
        "none";

      document
        .getElementById(
          "etiquetteScore"
        )
        .textContent =
        playerData.etiquette;

      document
        .getElementById(
          "etiquetteResult"
        )
        .innerHTML =
        gameState.etiquetteResult;

      document
        .getElementById(
          "bowButton"
        )
        .disabled =
        true;

      document
        .getElementById(
          "nextTestButton"
        )
        .style.display =
        "block";

      setHallDialog(
        "皇上",
        "……<br><br>抬起頭來。"
      );
    }

    else if (
      gameState.hallStep ===
      "answer"
    ) {
      document
        .getElementById(
          "etiquetteGame"
        )
        .style.display =
        "none";

      document
        .getElementById(
          "answerGame"
        )
        .style.display =
        "block";

      renderQuestion();
    }

    else if (
      gameState.hallStep ===
      "answerThinking"
    ) {
      document
        .getElementById(
          "etiquetteGame"
        )
        .style.display =
        "none";

      document
        .getElementById(
          "answerGame"
        )
        .style.display =
        "block";

      renderQuestion();

      document
        .querySelectorAll(
          ".answer-option"
        )
        .forEach(
          button => {
            button.disabled = true;
          }
        );

      showEmperorThinking();
    }

    else if (
      gameState.hallStep ===
      "answerDone"
    ) {
      document
        .getElementById(
          "etiquetteGame"
        )
        .style.display =
        "none";

      document
        .getElementById(
          "answerGame"
        )
        .style.display =
        "block";

      renderQuestion();

      document
        .querySelectorAll(
          ".answer-option"
        )
        .forEach(
          button => {
            button.disabled = true;
          }
        );

      document
        .getElementById(
          "answerResult"
        )
        .style.display =
        "block";

      document
        .getElementById(
          "answerResult"
        )
        .innerHTML =
        gameState.answerResult;

      document
        .getElementById(
          "answerScoreBox"
        )
        .style.display =
        "flex";

      const currentScore =
        playerData.answerScores[
          gameState.questionCursor
        ]
        || 0;

      document
        .getElementById(
          "answerScoreNumber"
        )
        .textContent =
        currentScore;

      const button =
        document
          .getElementById(
            "judgementButton"
          );

      button.style.display =
        "block";

      if (
        gameState.questionCursor < 2
      ) {
        button.textContent =
          "接 受 下 一 問";
      }

      else {
        button.textContent =
          "等 候 留 牌";
      }

      setHallDialog(
        "皇上",
        gameState.answerResult
      );
    }

    return;
  }

  if (
    gameState.screen ===
    "result"
  ) {
    showScreen(
      "selectionResultScreen"
    );

    renderSelectionResult();

    return;
  }

  showScreen(
    "startScreen"
  );
}


/* =============================
   開發測試工具
============================= */

function toggleDevPanel() {
  const panel =
    document.getElementById(
      "devPanel"
    );

  panel.style.display =
    panel.style.display ===
    "block"
    ?
    "none"
    :
    "block";
}

function ensureTestPlayer() {
  if (
    playerData.name
  ) {
    return;
  }

  createCharacter(
    "測試秀女"
  );
}

function devJump(target) {
  ensureTestPlayer();

  clearTimeout(
    answerReactionTimer
  );

  if (
    target === "character"
  ) {
    gameState.screen =
      "character";

    renderCharacter();

    showScreen(
      "characterScreen"
    );
  }

  if (
    target === "sachet"
  ) {
    gameState.screen =
      "selection";

    gameState.selectionStep =
      "sachet";

    gameState.eventText =
      "測試：香囊事件";

    gameState.resultText =
      "等待突發事件。";

    showScreen(
      "selectionScreen"
    );

    updateStatus();

    renderSelectionBase();

    setTimeout(
      startSachetEvent,
      250
    );
  }

  if (
    target === "called"
  ) {
    gameState.screen =
      "selection";

    gameState.selectionStep =
      "called";

    gameState.eventText =
      "太監展開名冊。"
      + "<br><br>"
      + "<strong>"
      + playerData.name
      + "，進殿！"
      + "</strong>";

    gameState.resultText =
      "現在可以直接測試進殿。";

    showScreen(
      "selectionScreen"
    );

    updateStatus();

    renderSelectionBase();

    document
      .getElementById(
        "eventText"
      )
      .innerHTML =
      gameState.eventText;

    document
      .getElementById(
        "resultBox"
      )
      .innerHTML =
      gameState.resultText;

    document
      .getElementById(
        "enterHallButton"
      )
      .style.display =
      "block";
  }

  if (
    target === "hall"
  ) {
    gameState.screen =
      "hall";

    gameState.hallStep =
      "etiquette";

    showScreen(
      "hallScreen"
    );

    renderHall();

    prepareEtiquette();
  }

  if (
    target === "answer"
  ) {
    if (
      playerData.etiquette <= 0
    ) {
      playerData.etiquette = 70;
    }

    playerData.answerScores = [];

    playerData.answerScore = 0;

    gameState.screen =
      "hall";

    gameState.hallStep =
      "answer";

    gameState.selectedQuestionIds =
      [];

    gameState.questionCursor = 0;

    gameState.pendingAnswer =
      null;

    prepareQuestionSet();

    showScreen(
      "hallScreen"
    );

    renderHallCharacters();

    startAnswerTest();
  }

  if (
    target === "result"
  ) {
    if (
      playerData.etiquette <= 0
    ) {
      playerData.etiquette = 70;
    }

    if (
      playerData.answerScore <= 0
    ) {
      playerData.answerScore = 75;

      playerData.answerScores =
        [75, 75, 75];
    }

    calculateFinalSelectionResult();
  }

  saveGame();

  document
    .getElementById(
      "devPanel"
    )
    .style.display =
    "none";

  window.scrollTo(0, 0);
}


/* =============================
   啟動
============================= */

/* =============================
   Google 登入返回後
   自動接回進殿流程
============================= */

async function resumeAfterGoogleLogin() {

  const returnTarget =
    localStorage.getItem(
      AUTH_RETURN_KEY
    );

  if (
    returnTarget !==
    "enterHall"
  ) {
    return;
  }


  const session =
    await getCurrentSession();


  if (!session) {
    return;
  }


  localStorage.removeItem(
    AUTH_RETURN_KEY
  );


  await enterHall();
}


/* =============================
   啟動
============================= */

window.addEventListener(
  "DOMContentLoaded",

  async function () {

    const hasSave =
      loadGame();


    if (
      hasSave
      &&
      AUTO_RESUME
    ) {

      restoreGame();

    }

    else {

      showScreen(
        "startScreen"
      );

    }


    /*
      Google 登入跳出去再回來後，
      Supabase 先恢復 Session，
      接著自動繼續建立宮籍並進殿。
    */

    setTimeout(
      resumeAfterGoogleLogin,
      500
    );

  }
);