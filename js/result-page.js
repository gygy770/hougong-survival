/* =====================================================
   後宮生還錄
   全遊戲共用・每集結算頁
===================================================== */

let ACTIVE_EPISODE_RESULT = null;

let RESULT_RANKING_DATA = {
  currentRank: null,
  beatenPlayers: null,
  totalPlayers: null,
  totalRuns: null,
  passedRuns: null,
  personalBest: null,
  runNumber: null
};


function resultSignedNumber(value) {

  const number =
    Number(value || 0);

  return number > 0
    ? "+" + number
    : String(number);

}


function resultEscapeHTML(value) {

  return String(
    value ?? ""
  )
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


function getPublicGameUrl() {

  if (
    location.protocol === "http:"
    ||
    location.protocol === "https:"
  ) {

    return location.href;

  }

  return "";

}


function normalizeEpisodeResult(
  config = {}
) {

  const episodeNumber =
    Number(
      config.episodeNumber
      ||
      1
    );


  const survived =
    config.survived !== false;


  const terminal =
    config.terminal === true
    ||
    survived === false;


  return {

    episodeNumber,

    episodeTitle:
      config.episodeTitle
      ||
      `第${episodeNumber}集`,

    statusLabel:
      config.statusLabel
      ||
      "本集結算",

    title:
      config.title
      ||
      "本集完成",

    survived,

    terminal,

    image:
      config.image
      ||
      "images/result-pass.png",

    imageAlt:
      config.imageAlt
      ||
      config.title
      ||
      "本集結果",

    imagePosition:
      config.imagePosition
      ||
      "center center",

    survivalTitle:
      config.survivalTitle
      ||
      (
        survived
          ?
          `你目前活到第 ${episodeNumber} 集`
          :
          `你只活到第 ${episodeNumber} 集`
      ),

    survivalSub:
      config.survivalSub
      ||
      (
        terminal
          ?
          "本局故事結束"
          :
          "故事仍在繼續"
      ),

    scoreLabel:
      config.scoreLabel
      ||
      "本集評價",

    score:
      config.score === null
      ||
      config.score === undefined
        ?
        null
        :
        Number(
          config.score
        ),

    summary:
      config.summary
      ||
      "",

    detailRows:
      Array.isArray(
        config.detailRows
      )
        ?
        config.detailRows
        :
        [],

    keyChoices:
      Array.isArray(
        config.keyChoices
      )
        ?
        config.keyChoices
        :
        [],

    rewards:
      Array.isArray(
        config.rewards
      )
        ?
        config.rewards
        :
        [],

    continueText:
      config.continueText
      ||
      (
        terminal
          ?
          "重新開局"
          :
          "進入下一集"
      ),

    continueAction:
      config.continueAction
      ||
      "",

    rankingTitle:
      config.rankingTitle
      ||
      `第 ${episodeNumber} 集排行`,

    shareLine:
      config.shareLine
      ||
      "",

    screenState:
      config.screenState
      ||
      "episodeResult"

  };

}


/* =====================================================
   社群圖示
===================================================== */

function ensureSocialIcons() {

  if (
    document.getElementById(
      "fontAwesomeSocialIcons"
    )
  ) {

    return;

  }


  const link =
    document.createElement(
      "link"
    );


  link.id =
    "fontAwesomeSocialIcons";

  link.rel =
    "stylesheet";

  link.href =
    "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css";


  document.head.appendChild(
    link
  );

}


/* =====================================================
   結算頁樣式
===================================================== */

function ensureResultPageStyles() {

  ensureSocialIcons();


  const oldStyle =
    document.getElementById(
      "resultPageStyles"
    );


  if (oldStyle) {

    oldStyle.remove();

  }


  const style =
    document.createElement(
      "style"
    );


  style.id =
    "resultPageStyles";


  style.textContent = `

    #selectionResultScreen{

      position:relative !important;

      width:100% !important;

      height:100dvh !important;
      min-height:100dvh !important;
      max-height:100dvh !important;

      margin:0 !important;

      padding:
        8px 10px 10px !important;

      overflow:hidden !important;

      box-sizing:border-box;

      background:
        radial-gradient(
          circle at top,
          #45131c,
          #120507 68%
        );

    }


    #selectionResultScreen .episode{

      height:24px;

      display:flex;

      align-items:center;
      justify-content:center;

      margin:
        0 0 6px;

      color:
        rgba(
          239,
          201,
          121,
          .74
        );

      font-size:10px;

      letter-spacing:4px;

    }


    #selectionResultScreen .final-card{

      height:
        calc(
          100dvh - 48px
        );

      min-height:0;

      margin:0 !important;

      padding:0 !important;

      display:grid;

      grid-template-rows:
        minmax(
          150px,
          31dvh
        )
        minmax(
          0,
          1fr
        )
        auto;

      overflow:hidden;

      border:
        1px solid
        rgba(
          239,
          201,
          121,
          .28
        );

      border-radius:10px;

      background:
        linear-gradient(
          180deg,
          rgba(
            40,
            8,
            14,
            .98
          ),
          rgba(
            14,
            4,
            7,
            .99
          )
        );

      box-shadow:
        0 12px 36px
        rgba(
          0,
          0,
          0,
          .28
        );

    }


    .result-hero{

      position:relative;

      min-height:0;

      overflow:hidden;

      background:#160609;

      border-bottom:
        1px solid
        rgba(
          239,
          201,
          121,
          .18
        );

    }


    .result-hero img{

      display:block;

      width:100%;

      height:100%;

      object-fit:cover;

    }


    .result-hero::after{

      content:"";

      position:absolute;

      inset:
        auto
        0
        0;

      height:38%;

      pointer-events:none;

      background:
        linear-gradient(
          to top,
          rgba(
            20,
            4,
            8,
            .96
          ),
          transparent
        );

    }


    .result-main{

      min-height:0;

      padding:
        7px 14px 6px;

      overflow-y:auto;

      overscroll-behavior:
        contain;

      text-align:center;

      scrollbar-width:
        thin;

    }


    .result-main::-webkit-scrollbar{

      width:4px;

    }


    .result-main::-webkit-scrollbar-thumb{

      border-radius:999px;

      background:
        rgba(
          239,
          201,
          121,
          .26
        );

    }


    .result-status{

      color:
        rgba(
          239,
          201,
          121,
          .60
        );

      font-size:9px;

      letter-spacing:3px;

    }


    .result-title{

      margin-top:2px;

      color:#efc979;

      font-size:
        clamp(
          25px,
          7vw,
          34px
        );

      line-height:1.16;

      font-weight:600;

      letter-spacing:5px;

    }


    .result-survival{

      margin-top:5px;

      color:#fff0c8;

      font-size:
        clamp(
          19px,
          5.5vw,
          27px
        );

      line-height:1.22;

      font-weight:700;

    }


    .result-survival-sub{

      margin-top:2px;

      color:#bd9160;

      font-size:10px;

      letter-spacing:2px;

    }


    .result-score{

      margin-top:6px;

      color:#efc979;

      font-size:16px;

      letter-spacing:1px;

    }


    .result-ranking{

      display:grid;

      grid-template-columns:
        1fr 1fr;

      gap:7px;

      margin-top:7px;

    }


    .result-ranking-card{

      min-width:0;

      padding:
        7px 4px;

      border:
        1px solid
        rgba(
          239,
          201,
          121,
          .15
        );

      border-radius:7px;

      background:
        rgba(
          255,
          255,
          255,
          .025
        );

    }


    .result-ranking-label{

      color:
        rgba(
          255,
          255,
          255,
          .38
        );

      font-size:9px;

      letter-spacing:1px;

    }


    .result-ranking-value{

      margin-top:3px;

      overflow:hidden;

      color:#edca84;

      font-size:15px;

      line-height:1.2;

      white-space:nowrap;

      text-overflow:
        ellipsis;

    }


    .result-story{

      margin-top:7px;

      padding:
        7px 9px;

      border-top:
        1px solid
        rgba(
          239,
          201,
          121,
          .12
        );

      border-bottom:
        1px solid
        rgba(
          239,
          201,
          121,
          .12
        );

      color:
        rgba(
          255,
          255,
          255,
          .70
        );

      font-size:11px;

      line-height:1.6;

    }


    .result-tools{

      display:grid;

      grid-template-columns:
        1fr 1fr;

      gap:7px;

      margin-top:7px;

    }


    .result-tool-button{

      min-height:33px;

      border:
        1px solid
        rgba(
          239,
          201,
          121,
          .22
        );

      border-radius:6px;

      background:
        rgba(
          255,
          255,
          255,
          .025
        );

      color:#dec18b;

      cursor:pointer;

      font-size:10px;

      letter-spacing:1px;

    }


    .result-bottom{

      padding:
        7px 10px 8px;

      border-top:
        1px solid
        rgba(
          239,
          201,
          121,
          .13
        );

      background:
        rgba(
          7,
          2,
          3,
          .48
        );

    }


    .result-continue{

      width:100%;

      min-height:38px;

      margin-bottom:7px;

      border:0;

      border-radius:7px;

      background:
        linear-gradient(
          135deg,
          #b77c38,
          #e1bb70,
          #b77c38
        );

      color:#2b1307;

      cursor:pointer;

      font-size:12px;

      font-weight:700;

      letter-spacing:4px;

    }


    .result-share-title{

      margin-bottom:5px;

      color:
        rgba(
          255,
          255,
          255,
          .40
        );

      text-align:center;

      font-size:9px;

      letter-spacing:2px;

    }


    .result-share-row{

      display:flex;

      justify-content:center;
      align-items:center;

      gap:7px;

    }


    .share-icon{

      width:36px;

      height:36px;

      flex:
        0
        0
        36px;

      display:flex;

      align-items:center;
      justify-content:center;

      border:
        1px solid
        rgba(
          239,
          201,
          121,
          .18
        );

      border-radius:50%;

      background:
        rgba(
          255,
          255,
          255,
          .035
        );

      color:#e8cc98;

      cursor:pointer;

    }


    .share-icon i{

      font-size:18px;

    }


    .result-modal{

      display:none;

      position:fixed;

      inset:0;

      z-index:10050;

      align-items:flex-end;

      justify-content:center;

      padding:12px;

      background:
        rgba(
          0,
          0,
          0,
          .72
        );

      backdrop-filter:
        blur(4px);

      -webkit-backdrop-filter:
        blur(4px);

    }


    .result-modal.show{

      display:flex;

    }


    .result-modal-panel{

      width:
        min(
          100%,
          460px
        );

      max-height:78dvh;

      overflow-y:auto;

      padding:
        18px 18px 20px;

      border:
        1px solid
        rgba(
          239,
          201,
          121,
          .30
        );

      border-radius:
        14px 14px 5px 5px;

      background:
        linear-gradient(
          180deg,
          #2b0b11,
          #120507
        );

      box-shadow:
        0 -15px 45px
        rgba(
          0,
          0,
          0,
          .55
        );

    }


    .result-modal-head{

      display:flex;

      align-items:center;

      justify-content:
        space-between;

      gap:10px;

      margin-bottom:12px;

    }


    .result-modal-title{

      color:#efc979;

      font-size:16px;

      letter-spacing:3px;

    }


    .result-modal-close{

      width:32px;

      height:32px;

      border:
        1px solid
        rgba(
          239,
          201,
          121,
          .18
        );

      border-radius:50%;

      background:
        transparent;

      color:#dfc899;

      cursor:pointer;

      font-size:18px;

    }


    .modal-section-title{

      margin:
        14px 0 4px;

      color:#cda85f;

      font-size:10px;

      letter-spacing:2px;

    }


    .modal-row{

      display:flex;

      justify-content:
        space-between;

      align-items:
        flex-start;

      gap:20px;

      padding:
        9px 0;

      border-bottom:
        1px solid
        rgba(
          255,
          255,
          255,
          .06
        );

      font-size:12px;

      line-height:1.5;

    }


    .modal-row span:first-child{

      color:
        rgba(
          255,
          255,
          255,
          .45
        );

    }


    .modal-row span:last-child{

      color:#efd091;

      text-align:right;

    }


    .modal-note{

      margin-top:13px;

      color:
        rgba(
          255,
          255,
          255,
          .28
        );

      text-align:center;

      font-size:9px;

      line-height:1.7;

    }


    @media(
      max-height:720px
    ){

      #selectionResultScreen{

        padding-top:
          5px !important;

      }


      #selectionResultScreen .episode{

        height:20px;

        margin-bottom:4px;

      }


      #selectionResultScreen .final-card{

        height:
          calc(
            100dvh - 39px
          );

        grid-template-rows:
          minmax(
            125px,
            27dvh
          )
          minmax(
            0,
            1fr
          )
          auto;

      }


      .result-title{

        font-size:23px;

      }


      .result-survival{

        font-size:18px;

      }


      .result-story{

        display:none;

      }


      .result-bottom{

        padding:
          5px 8px 6px;

      }


      .result-continue{

        min-height:34px;

        margin-bottom:5px;

      }


      .result-share-title{

        display:none;

      }


      .share-icon{

        width:33px;

        height:33px;

        flex-basis:33px;

      }


      .share-icon i{

        font-size:16px;

      }

    }

  `;


  document.head.appendChild(
    style
  );

}


/* =====================================================
   建立結果頁
===================================================== */

function ensureResultScreen() {

  ensureResultPageStyles();


  let screen =
    document.getElementById(
      "selectionResultScreen"
    );


  if (!screen) {

    screen =
      document.createElement(
        "section"
      );


    screen.id =
      "selectionResultScreen";


    screen.className =
      "screen";


    const game =
      document.querySelector(
        ".game"
      );


    if (!game) {

      console.error(
        "結算頁：找不到 .game"
      );

      return null;

    }


    game.appendChild(
      screen
    );

  }


  let episode =
    screen.querySelector(
      ".episode"
    );


  if (!episode) {

    episode =
      document.createElement(
        "div"
      );


    episode.className =
      "episode";


    screen.prepend(
      episode
    );

  }


  let card =
    screen.querySelector(
      ".final-card"
    );


  if (!card) {

    card =
      document.createElement(
        "div"
      );


    card.className =
      "final-card";


    screen.appendChild(
      card
    );

  }


  return screen;

}


/* =====================================================
   建立彈窗
===================================================== */

function ensureResultModal() {

  let modal =
    document.getElementById(
      "resultModal"
    );


  if (modal) {

    return modal;

  }


  modal =
    document.createElement(
      "div"
    );


  modal.id =
    "resultModal";


  modal.className =
    "result-modal";


  modal.onclick =
    resultModalBackgroundClick;


  modal.innerHTML = `

    <div
      id="resultModalPanel"
      class="result-modal-panel"
    ></div>

  `;


  document.body.appendChild(
    modal
  );


  return modal;

}


/* =====================================================
   排行
===================================================== */

function resetResultRanking() {

  RESULT_RANKING_DATA = {

    currentRank:
      null,

    beatenPlayers:
      null,

    totalPlayers:
      null,

    totalRuns:
      null,

    passedRuns:
      null,

    personalBest:
      null,

    runNumber:
      null

  };


  applyRankingToResultPage();

}


function updateResultRanking(
  data = {}
) {

  RESULT_RANKING_DATA = {

    ...RESULT_RANKING_DATA,

    ...data

  };


  applyRankingToResultPage();

}


function applyRankingToResultPage() {

  const rank =
    document.getElementById(
      "rankingCurrent"
    );


  const beaten =
    document.getElementById(
      "rankingBeaten"
    );


  if (rank) {

    rank.textContent =

      RESULT_RANKING_DATA
        .currentRank == null

        ?

        "尚未連線"

        :

        `第 ${RESULT_RANKING_DATA.currentRank} 名`;

  }


  if (beaten) {

    beaten.textContent =

      RESULT_RANKING_DATA
        .beatenPlayers == null

        ?

        "尚未連線"

        :

        `${RESULT_RANKING_DATA.beatenPlayers} 人`;

  }

}


function rankingValue(
  value,
  suffix = ""
) {

  return value == null

    ?

    "尚未連線"

    :

    `${
      resultEscapeHTML(
        value
      )
    }${
      resultEscapeHTML(
        suffix
      )
    }`;

}


/* =====================================================
   分享文字
===================================================== */

function buildResultShareText() {

  const result =
    ACTIVE_EPISODE_RESULT;


  if (!result) {

    return "《後宮生還錄》";

  }


  let text =

    "《後宮生還錄》"

    +

    "\n\n"

    +

    `我玩到第 ${result.episodeNumber} 集・${result.episodeTitle}`

    +

    "\n"

    +

    `本集結果：${result.title}`

    +

    "\n"

    +

    (
      result.terminal

        ?

        "本局故事結束"

        :

        `目前成功活到第 ${result.episodeNumber} 集`
    );


  if (
    result.score !== null
    &&
    Number.isFinite(
      result.score
    )
  ) {

    text +=

      `\n${result.scoreLabel}：${result.score} 分`;

  }


  if (
    RESULT_RANKING_DATA
      .currentRank !== null
  ) {

    text +=

      `\n本局排名：第 ${RESULT_RANKING_DATA.currentRank} 名`;

  }


  if (
    RESULT_RANKING_DATA
      .beatenPlayers !== null
  ) {

    text +=

      `\n超越 ${RESULT_RANKING_DATA.beatenPlayers} 名玩家`;

  }


  if (
    result.shareLine
  ) {

    text +=

      `\n${result.shareLine}`;

  }


  text +=

    "\n\n你能活到第幾集？";


  return text;

}


/* =====================================================
   複製分享文字
===================================================== */

async function copyShareText(
  text
) {

  try {

    if (
      navigator.clipboard
      &&
      window.isSecureContext
    ) {

      await navigator.clipboard
        .writeText(
          text
        );

    }

    else {

      const textarea =
        document.createElement(
          "textarea"
        );


      textarea.value =
        text;


      textarea.style.position =
        "fixed";


      textarea.style.opacity =
        "0";


      document.body.appendChild(
        textarea
      );


      textarea.select();


      document.execCommand(
        "copy"
      );


      textarea.remove();

    }


    alert(
      "分享文字已複製。"
    );

  }

  catch (
    error
  ) {

    console.error(
      "複製分享文字失敗",
      error
    );


    alert(
      "目前無法自動複製分享內容。"
    );

  }

}


/* =====================================================
   原生分享
===================================================== */

async function nativeShareResult() {

  const text =
    buildResultShareText();


  const url =
    getPublicGameUrl();


  if (
    navigator.share
  ) {

    try {

      const shareData = {

        title:
          "後宮生還錄",

        text

      };


      if (
        url
      ) {

        shareData.url =
          url;

      }


      await navigator.share(
        shareData
      );


      return;

    }

    catch (
      error
    ) {

      if (
        error.name ===
        "AbortError"
      ) {

        return;

      }

    }

  }


  await copyShareText(
    text
  );

}


/* =====================================================
   各平台分享
===================================================== */

async function shareResult(
  platform
) {

  const text =
    buildResultShareText();


  const url =
    getPublicGameUrl();


  if (
    platform ===
    "system"
  ) {

    await nativeShareResult();

    return;

  }


  if (
    platform ===
    "line"
  ) {

    const lineText =

      text

      +

      (
        url
          ?
          "\n" + url
          :
          ""
      );


    window.open(

      "https://line.me/R/share?text="

      +

      encodeURIComponent(
        lineText
      ),

      "_blank",

      "noopener,noreferrer"

    );


    return;

  }


  if (
    platform ===
    "facebook"
  ) {

    if (
      url
    ) {

      window.open(

        "https://www.facebook.com/sharer/sharer.php?u="

        +

        encodeURIComponent(
          url
        ),

        "_blank",

        "noopener,noreferrer"

      );

    }

    else {

      await copyShareText(
        text
      );

    }


    return;

  }


  if (
    platform ===
    "threads"
  ) {

    const threadText =

      text

      +

      (
        url
          ?
          "\n" + url
          :
          ""
      );


    window.open(

      "https://www.threads.net/intent/post?text="

      +

      encodeURIComponent(
        threadText
      ),

      "_blank",

      "noopener,noreferrer"

    );


    return;

  }


  if (
    platform ===
    "instagram"
  ) {

    await copyShareText(
      text
    );


    return;

  }


  await nativeShareResult();

}


/* =====================================================
   詳細紀錄
===================================================== */

function rowsToModalHTML(
  rows = []
) {

  if (
    !rows.length
  ) {

    return `

      <div
        class="modal-note"
      >
        本集沒有額外數值紀錄。
      </div>

    `;

  }


  return rows

    .map(
      row => `

        <div
          class="modal-row"
        >

          <span>
            ${
              resultEscapeHTML(
                row.label
                ||
                "紀錄"
              )
            }
          </span>

          <span>
            ${
              resultEscapeHTML(
                row.value
                ??
                "-"
              )
            }
          </span>

        </div>

      `
    )

    .join("");

}


function simpleListToRowsHTML(
  items = []
) {

  if (
    !items.length
  ) {

    return `

      <div
        class="modal-row"
      >

        <span>
          紀錄
        </span>

        <span>
          無
        </span>

      </div>

    `;

  }


  return items

    .map(
      (
        item,
        index
      ) => {

        const text =

          typeof item ===
          "string"

            ?

            item

            :

            item.name
            ||
            item.label
            ||
            item.value
            ||
            "-";


        return `

          <div
            class="modal-row"
          >

            <span>
              ${index + 1}
            </span>

            <span>
              ${
                resultEscapeHTML(
                  text
                )
              }
            </span>

          </div>

        `;

      }
    )

    .join("");

}


/* =====================================================
   戰績彈窗
===================================================== */

function buildScoreModalHTML() {

  const result =
    ACTIVE_EPISODE_RESULT;


  if (!result) {

    return "";

  }


  const scoreHTML =

    result.score !== null

    &&

    Number.isFinite(
      result.score
    )

      ?

      `

        <div
          class="modal-row"
        >

          <span>
            ${
              resultEscapeHTML(
                result.scoreLabel
              )
            }
          </span>

          <span>
            ${result.score} 分
          </span>

        </div>

      `

      :

      "";


  const choicesHTML =

    result.keyChoices.length

      ?

      `

        <div
          class="modal-section-title"
        >
          關鍵選擇
        </div>

        ${
          simpleListToRowsHTML(
            result.keyChoices
          )
        }

      `

      :

      "";


  const rewardsHTML =

    result.rewards.length

      ?

      `

        <div
          class="modal-section-title"
        >
          本集取得
        </div>

        ${
          simpleListToRowsHTML(
            result.rewards
          )
        }

      `

      :

      "";


  return `

    <div
      class="result-modal-head"
    >

      <div
        class="result-modal-title"
      >
        本集戰績
      </div>

      <button
        class="result-modal-close"
        onclick="
          closeResultModal()
        "
      >
        ×
      </button>

    </div>


    <div
      class="modal-row"
    >

      <span>
        集數
      </span>

      <span>
        第 ${result.episodeNumber} 集・${
          resultEscapeHTML(
            result.episodeTitle
          )
        }
      </span>

    </div>


    <div
      class="modal-row"
    >

      <span>
        本集結果
      </span>

      <span>
        ${
          resultEscapeHTML(
            result.title
          )
        }
      </span>

    </div>


    <div
      class="modal-row"
    >

      <span>
        狀態
      </span>

      <span>
        ${
          result.terminal
            ?
            "本局結束"
            :
            "成功存活"
        }
      </span>

    </div>


    ${scoreHTML}

    ${
      rowsToModalHTML(
        result.detailRows
      )
    }

    ${choicesHTML}

    ${rewardsHTML}

  `;

}


/* =====================================================
   排行彈窗
===================================================== */

function buildRankingModalHTML() {

  const result =
    ACTIVE_EPISODE_RESULT;


  return `

    <div
      class="result-modal-head"
    >

      <div
        class="result-modal-title"
      >
        ${
          resultEscapeHTML(
            result
              ?.rankingTitle
            ||
            "本集排行"
          )
        }
      </div>

      <button
        class="result-modal-close"
        onclick="
          closeResultModal()
        "
      >
        ×
      </button>

    </div>


    <div
      class="modal-row"
    >

      <span>
        本局排名
      </span>

      <span>
        ${
          RESULT_RANKING_DATA
            .currentRank == null

            ?

            "尚未連線"

            :

            `第 ${
              resultEscapeHTML(
                RESULT_RANKING_DATA
                  .currentRank
              )
            } 名`
        }
      </span>

    </div>


    <div
      class="modal-row"
    >

      <span>
        超越玩家
      </span>

      <span>
        ${
          rankingValue(
            RESULT_RANKING_DATA
              .beatenPlayers,
            " 人"
          )
        }
      </span>

    </div>


    <div
      class="modal-row"
    >

      <span>
        參與玩家
      </span>

      <span>
        ${
          rankingValue(
            RESULT_RANKING_DATA
              .totalPlayers,
            " 人"
          )
        }
      </span>

    </div>


    <div
      class="modal-row"
    >

      <span>
        累積遊玩
      </span>

      <span>
        ${
          rankingValue(
            RESULT_RANKING_DATA
              .totalRuns,
            " 場"
          )
        }
      </span>

    </div>


    <div
      class="modal-row"
    >

      <span>
        個人最佳
      </span>

      <span>
        ${
          rankingValue(
            RESULT_RANKING_DATA
              .personalBest,
            " 分"
          )
        }
      </span>

    </div>


    <div
      class="modal-row"
    >

      <span>
        本帳號局數
      </span>

      <span>
        ${
          RESULT_RANKING_DATA
            .runNumber == null

            ?

            "尚未連線"

            :

            `第 ${
              resultEscapeHTML(
                RESULT_RANKING_DATA
                  .runNumber
              )
            } 局`
        }
      </span>

    </div>


    <div
      class="modal-note"
    >
      排行資料會由目前登入帳號與資料庫同步更新。
    </div>

  `;

}


/* =====================================================
   開啟／關閉彈窗
===================================================== */

function openResultModal(
  type
) {

  ensureResultModal();


  const modal =
    document.getElementById(
      "resultModal"
    );


  const panel =
    document.getElementById(
      "resultModalPanel"
    );


  if (
    !modal
    ||
    !panel
  ) {

    return;

  }


  panel.innerHTML =

    type ===
    "ranking"

      ?

      buildRankingModalHTML()

      :

      buildScoreModalHTML();


  modal.classList.add(
    "show"
  );

}


function closeResultModal() {

  const modal =
    document.getElementById(
      "resultModal"
    );


  if (
    modal
  ) {

    modal.classList.remove(
      "show"
    );

  }

}


function resultModalBackgroundClick(
  event
) {

  if (
    event.target.id ===
    "resultModal"
  ) {

    closeResultModal();

  }

}


/* =====================================================
   下一集 / 重新開局
===================================================== */

function runEpisodeResultContinue() {

  const result =
    ACTIVE_EPISODE_RESULT;


  if (!result) {

    return;

  }


  if (
    result.continueAction
  ) {

    const action =
      window[
        result.continueAction
      ];


    if (
      typeof action ===
      "function"
    ) {

      action();

      return;

    }

  }


  if (
    result.terminal
    &&
    typeof restartGame ===
    "function"
  ) {

    restartGame();

    return;

  }


  alert(
    "下一集尚未開放。"
  );

}


/* =====================================================
   繪製共用結果頁
===================================================== */

function renderEpisodeResult(
  config = {}
) {

  const screen =
    ensureResultScreen();


  if (!screen) {

    return;

  }


  ACTIVE_EPISODE_RESULT =
    normalizeEpisodeResult(
      config
    );


  const result =
    ACTIVE_EPISODE_RESULT;


  const episodeLabel =
    screen.querySelector(
      ".episode"
    );


  const card =
    screen.querySelector(
      ".final-card"
    );


  if (!card) {

    return;

  }


  if (
    episodeLabel
  ) {

    episodeLabel.textContent =

      `第 ${result.episodeNumber} 集・${result.episodeTitle}・結算`;

  }


  card.innerHTML = `

    <div
      class="result-hero"
    >

      <img
        id="resultHeroImage"

        src="${
          resultEscapeHTML(
            result.image
          )
        }"

        alt="${
          resultEscapeHTML(
            result.imageAlt
          )
        }"

        onerror="
          this.style.display='none'
        "
      >

    </div>


    <div
      class="result-main"
    >

      <div
        class="result-status"
      >
        第 ${result.episodeNumber} 集・${
          resultEscapeHTML(
            result.statusLabel
          )
        }
      </div>


      <div
        class="result-title"
      >
        ${
          resultEscapeHTML(
            result.title
          )
        }
      </div>


      <div
        class="result-survival"
      >
        ${
          resultEscapeHTML(
            result.survivalTitle
          )
        }
      </div>


      <div
        class="result-survival-sub"
      >
        ${
          resultEscapeHTML(
            result.survivalSub
          )
        }
      </div>


      ${
        result.score !== null

        &&

        Number.isFinite(
          result.score
        )

          ?

          `

            <div
              class="result-score"
            >

              ${
                resultEscapeHTML(
                  result.scoreLabel
                )
              }

              ${result.score} 分

            </div>

          `

          :

          ""
      }


      <div
        class="result-ranking"
      >

        <div
          class="result-ranking-card"
        >

          <div
            class="result-ranking-label"
          >
            本局排名
          </div>

          <div
            id="rankingCurrent"
            class="result-ranking-value"
          >
            尚未連線
          </div>

        </div>


        <div
          class="result-ranking-card"
        >

          <div
            class="result-ranking-label"
          >
            超越玩家
          </div>

          <div
            id="rankingBeaten"
            class="result-ranking-value"
          >
            尚未連線
          </div>

        </div>

      </div>


      ${
        result.summary

          ?

          `

            <div
              class="result-story"
            >
              ${result.summary}
            </div>

          `

          :

          ""
      }


      <div
        class="result-tools"
      >

        <button
          class="result-tool-button"
          onclick="
            openResultModal(
              'score'
            )
          "
        >
          本集戰績
        </button>


        <button
          class="result-tool-button"
          onclick="
            openResultModal(
              'ranking'
            )
          "
        >
          排行榜
        </button>

      </div>

    </div>


    <div
      class="result-bottom"
    >

      <button
        class="result-continue"
        onclick="
          runEpisodeResultContinue()
        "
      >
        ${
          resultEscapeHTML(
            result.continueText
          )
        }
      </button>


      <div
        class="result-share-title"
      >
        分享本集戰績
      </div>


      <div
        class="result-share-row"
      >

        <button
          class="share-icon"
          aria-label="Instagram"
          title="Instagram"
          onclick="
            shareResult(
              'instagram'
            )
          "
        >
          <i
            class="fa-brands fa-instagram"
          ></i>
        </button>


        <button
          class="share-icon"
          aria-label="Threads"
          title="Threads"
          onclick="
            shareResult(
              'threads'
            )
          "
        >
          <i
            class="fa-brands fa-threads"
          ></i>
        </button>


        <button
          class="share-icon"
          aria-label="LINE"
          title="LINE"
          onclick="
            shareResult(
              'line'
            )
          "
        >
          <i
            class="fa-brands fa-line"
          ></i>
        </button>


        <button
          class="share-icon"
          aria-label="Facebook"
          title="Facebook"
          onclick="
            shareResult(
              'facebook'
            )
          "
        >
          <i
            class="fa-brands fa-facebook-f"
          ></i>
        </button>


        <button
          class="share-icon"
          aria-label="更多分享"
          title="更多分享"
          onclick="
            shareResult(
              'system'
            )
          "
        >
          <i
            class="fa-solid fa-share-nodes"
          ></i>
        </button>

      </div>

    </div>

  `;


  const heroImage =
    document.getElementById(
      "resultHeroImage"
    );


  if (
    heroImage
  ) {

    heroImage.style
      .objectPosition =
      result.imagePosition;

  }


  ensureResultModal();


  applyRankingToResultPage();


  if (
    typeof showScreen ===
    "function"
  ) {

    showScreen(
      "selectionResultScreen"
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
   儲存並進入某一集結算
===================================================== */

function showEpisodeResult(
  config = {}
) {

  const normalized =
    normalizeEpisodeResult(
      config
    );


  /*
    第二集之後先清掉上一集排行，
    避免錯把第一集名次拿來顯示。
    等後端查到本集排行後，
    再用 updateResultRanking() 更新。
  */

  if (
    normalized.episodeNumber > 1
    &&
    !config.keepRanking
  ) {

    resetResultRanking();

  }


  ACTIVE_EPISODE_RESULT =
    normalized;


  if (
    typeof gameState !==
    "undefined"

    &&

    gameState
  ) {

    gameState.screen =
      normalized.screenState;


    gameState.currentEpisode =
      normalized.episodeNumber;


    gameState.episodeResult =
      normalized;

  }


  if (
    typeof saveGame ===
    "function"
  ) {

    saveGame();

  }


  renderEpisodeResult(
    normalized
  );

}


/* =====================================================
   第一集相容
   main.js 原本呼叫 renderSelectionResult()
   不需要改
===================================================== */

function renderSelectionResult() {

  if (
    typeof gameState ===
    "undefined"

    ||

    !gameState.selectionResult
  ) {

    return;

  }


  const result =
    gameState.selectionResult;


  const passed =
    result.passed === true;


  ACTIVE_EPISODE_RESULT =
    normalizeEpisodeResult({

      episodeNumber:
        1,

      episodeTitle:
        "殿選",

      statusLabel:
        passed
          ?
          "選秀通過"
          :
          "選秀落選",

      title:
        passed
          ?
          "留 牌"
          :
          "撂 牌",

      survived:
        passed,

      terminal:
        !passed,

      image:
        passed
          ?
          "images/result-pass.png"
          :
          "images/result-fail.png",

      imageAlt:
        passed
          ?
          "留牌"
          :
          "撂牌",

      imagePosition:
        passed
          ?
          "center 26%"
          :
          "center 22%",

      survivalTitle:
        passed
          ?
          "你目前活到第 1 集"
          :
          "你只活到第 1 集",

      survivalSub:
        passed
          ?
          "故事仍在繼續"
          :
          "本局故事結束",

      scoreLabel:
        "總評",

      score:
        Number(
          result.total
          ||
          0
        ),

      summary:
        passed

          ?

          `「${
            resultEscapeHTML(
              playerData.name
            )
          }，留牌。」`

          :

          `「${
            resultEscapeHTML(
              playerData.name
            )
          }，撂牌子，賜花。」`,

      detailRows: [

        {
          label:
            "禮儀",

          value:
            Number(
              playerData.etiquette
              ||
              0
            )
            +
            " 分"
        },

        {
          label:
            "殿前應答",

          value:
            Number(
              playerData.answerScore
              ||
              0
            )
            +
            " 分"
        },

        {
          label:
            "家世修正",

          value:
            resultSignedNumber(
              result.familyModifier
            )
        },

        {
          label:
            "特質修正",

          value:
            resultSignedNumber(
              result.traitModifier
            )
        },

        {
          label:
            "宮門事件",

          value:
            resultSignedNumber(
              result.eventModifier
            )
        },

        {
          label:
            "運氣修正",

          value:
            resultSignedNumber(
              result.luckModifier
            )
        }

      ],

      continueText:
        passed
          ?
          "進入第二集"
          :
          "重新開局",

      continueAction:
        passed
          ?
          "enterEpisodeTwo"
          :
          "restartGame",

      rankingTitle:
        "第一集・殿選排行",

      screenState:
        "result"

    });


  renderEpisodeResult(
    ACTIVE_EPISODE_RESULT
  );

}


/* =====================================================
   F5 恢復第二集以後的結算頁
===================================================== */

function restoreEpisodeResultIfNeeded() {

  if (
    typeof gameState ===
    "undefined"

    ||

    !gameState
  ) {

    return false;

  }


  if (
    gameState.screen ===
    "episodeResult"

    &&

    gameState.episodeResult
  ) {

    ACTIVE_EPISODE_RESULT =

      normalizeEpisodeResult(
        gameState.episodeResult
      );


    renderEpisodeResult(
      ACTIVE_EPISODE_RESULT
    );


    return true;

  }


  return false;

}


/* =====================================================
   開發測試
   先用第三集死亡結局測共用結算頁
===================================================== */

window.testGenericEpisodeResult =
  function () {

    showEpisodeResult({

      episodeNumber:
        3,

      episodeTitle:
        "栽贓",

      statusLabel:
        "死亡結局",

      title:
        "栽贓成罪",

      survived:
        false,

      terminal:
        true,

      image:
        "images/scene-ep03-08-death.png",

      imagePosition:
        "center center",

      summary:
        "你沒能洗清嫌疑。真正設局的人，仍藏在宮牆深處。",

      detailRows: [

        {
          label:
            "本集路線",

          value:
            "栽贓案"
        },

        {
          label:
            "最終狀態",

          value:
            "死亡"
        }

      ],

      keyChoices: [

        "三次搜證後前往正殿自辯"

      ],

      rewards:
        [],

      continueText:
        "重新開局",

      continueAction:
        "restartGame",

      rankingTitle:
        "第三集・栽贓排行"

    });

  };


/* =====================================================
   DOM 載入後自動恢復結算頁
===================================================== */

window.addEventListener(

  "DOMContentLoaded",

  function () {

    setTimeout(

      function () {

        restoreEpisodeResultIfNeeded();

      },

      0

    );

  }

);


/* =====================================================
   對外提供
===================================================== */

window.renderEpisodeResult =
  renderEpisodeResult;


window.showEpisodeResult =
  showEpisodeResult;


window.renderSelectionResult =
  renderSelectionResult;


window.restoreEpisodeResultIfNeeded =
  restoreEpisodeResultIfNeeded;


window.runEpisodeResultContinue =
  runEpisodeResultContinue;


window.buildResultShareText =
  buildResultShareText;


window.shareResult =
  shareResult;


window.nativeShareResult =
  nativeShareResult;


window.openResultModal =
  openResultModal;


window.closeResultModal =
  closeResultModal;


window.updateResultRanking =
  updateResultRanking;


window.applyRankingToResultPage =
  applyRankingToResultPage;


window.resetResultRanking =
  resetResultRanking;

/* =====================================================
   每集結算後端同步
   Episode 2+
===================================================== */


/* =====================================================
   取得目前位分中文
===================================================== */

function getResultPalaceRankLabel() {

  if (
    typeof getRankLabel ===
    "function"
  ) {

    return getRankLabel();

  }


  const labels = {

    xiunu:
      "秀女",

    daying:
      "答應",

    changzai:
      "常在",

    guiren:
      "貴人",

    pin:
      "嬪",

    fei:
      "妃",

    guifei:
      "貴妃",

    huangguifei:
      "皇貴妃",

    huanghou:
      "皇后"

  };


  return (
    labels[playerData.rank]
    ||
    playerData.rank
    ||
    "秀女"
  );

}


/* =====================================================
   判定後端結果狀態
===================================================== */

function getBackendEpisodeOutcome(
  result
) {

  if (
    result.terminal !== true
  ) {

    if (
      result.title ===
      "命懸一線"
    ) {

      return {

        outcomeType:
          "saved",

        statusAfter:
          "alive",

        endReason:
          null

      };

    }


    return {

      outcomeType:
        "survived",

      statusAfter:
        "alive",

      endReason:
        null

    };

  }


  if (
    result.title ===
    "蒙冤出宮"
  ) {

    return {

      outcomeType:
        "expelled",

      statusAfter:
        "expelled",

      endReason:
        "蒙冤出宮"

    };

  }


  return {

    outcomeType:
      "dead",

    statusAfter:
      "dead",

    endReason:
      result.title
      ||
      "死亡"

  };

}


/* =====================================================
   同步第二集以後結果
===================================================== */

async function syncEpisodeResultToBackend(
  result
) {

  if (
    !result
    ||
    result.episodeNumber <= 1
  ) {

    return false;

  }


  if (
    !window.hougongSupabase
  ) {

    console.warn(
      "Supabase 尚未載入，略過本集後端同步"
    );

    return false;

  }


  try {

    /* ===============================================
       確認登入玩家
    =============================================== */

    const authResult =
      await window.hougongSupabase
        .auth
        .getUser();


    const user =
      authResult
        ?.data
        ?.user;


    if (!user) {

      console.warn(
        "目前沒有 Supabase 登入 Session"
      );

      return false;

    }


    gameState.authUserId =
      user.id;


    /* ===============================================
       如果本機遺失 runId，自動找回最近一局
    =============================================== */

    if (
      !gameState.backendRunId
    ) {

      const {
        data: latestRun,
        error: latestRunError
      } =
        await window.hougongSupabase

          .from(
            "game_runs"
          )

          .select(
            "id, run_number"
          )

          .eq(
            "user_id",
            user.id
          )

          .order(
            "updated_at",
            {
              ascending:
                false
            }
          )

          .limit(1)

          .maybeSingle();


      if (
        latestRunError
      ) {

        console.error(
          "找回最近遊戲局失敗：",
          latestRunError
        );

        return false;

      }


      if (
        !latestRun
      ) {

        console.warn(
          "此帳號找不到遊戲局"
        );

        return false;

      }


      gameState.backendRunId =
        latestRun.id;


      gameState.backendRunNumber =
        latestRun.run_number;

    }


    const backendOutcome =
      getBackendEpisodeOutcome(
        result
      );


    const episodeNumber =
      Number(
        result.episodeNumber
        ||
        1
      );


    /* ===============================================
       更新 game_runs
    =============================================== */

    const runUpdate = {

      silver:
        Number(
          playerData.money
          ||
          0
        ),

      favor:
        Number(
          playerData.favor
          ||
          0
        ),

      alert:
        Number(
          playerData.alert
          ||
          0
        ),

      etiquette:
        Number(
          playerData.etiquette
          ||
          0
        ),

      palace_rank:
        getResultPalaceRankLabel(),

      current_episode:
        episodeNumber,

      max_episode_reached:
        episodeNumber,

      status:
        backendOutcome.statusAfter,

      end_reason:
        backendOutcome.endReason,

      ended_at:
        result.terminal
          ?
          new Date()
            .toISOString()
          :
          null

    };


    const {
      error: runError
    } =
      await window.hougongSupabase

        .from(
          "game_runs"
        )

        .update(
          runUpdate
        )

        .eq(
          "id",
          gameState.backendRunId
        );


    if (
      runError
    ) {

      console.error(
        `更新第 ${episodeNumber} 集 game_runs 失敗：`,
        runError
      );

      return false;

    }


    /* ===============================================
       寫入 episode_records
    =============================================== */

    const episodePayload = {

      run_id:
        gameState.backendRunId,

      user_id:
        user.id,

      episode_number:
        episodeNumber,

      episode_title:
        result.episodeTitle,

      outcome_type:
        backendOutcome.outcomeType,

      status_after:
        backendOutcome.statusAfter,

      end_reason:
        backendOutcome.endReason,

      episode_score:
        result.score
        ??
        0,

      total_score:
        Number(
          gameState
            ?.selectionResult
            ?.total
          ||
          0
        ),

      silver_after:
        Number(
          playerData.money
          ||
          0
        ),

      favor_after:
        Number(
          playerData.favor
          ||
          0
        ),

      alert_after:
        Number(
          playerData.alert
          ||
          0
        ),

      etiquette_after:
        Number(
          playerData.etiquette
          ||
          0
        ),

      palace_rank_after:
        getResultPalaceRankLabel(),

      episode_flags: {

        result_title:
          result.title,

        survived:
          result.survived,

        terminal:
          result.terminal,

        story_step:
          gameState.storyStep
          ||
          null,

        night_route:
          gameState.episodeTwoNightRoute
          ||
          null,

        episode_three_outcome:
          gameState
            ?.episodeThree
            ?.outcome
          ||
          null

      }

    };


    const {
      error: episodeError
    } =
      await window.hougongSupabase

        .from(
          "episode_records"
        )

        .upsert(
          episodePayload,
          {
            onConflict:
              "run_id,episode_number"
          }
        );


    if (
      episodeError
    ) {

      console.error(
        `儲存第 ${episodeNumber} 集 episode_records 失敗：`,
        episodeError
      );

      return false;

    }


    saveGame();


    console.log(
      `第 ${episodeNumber} 集後端同步完成`
    );


    return true;

  }

  catch (
    error
  ) {

    console.error(
      "每集後端同步發生錯誤：",
      error
    );


    return false;

  }

}


/* =====================================================
   讀取真正的全局生存排名
===================================================== */

async function loadGlobalSurvivalRanking() {

  if (
    !window.hougongSupabase
    ||
    !gameState.backendRunId
  ) {

    return null;

  }


  const {
    data,
    error
  } =
    await window.hougongSupabase.rpc(

      "get_survival_ranking",

      {

        p_run_id:
          gameState.backendRunId

      }

    );


  if (
    error
  ) {

    console.error(
      "讀取全局生存排名失敗：",
      error
    );

    return null;

  }


  const ranking =
    Array.isArray(data)
      ?
      data[0]
      :
      data;


  if (!ranking) {

    return null;

  }


  if (
    typeof updateResultRanking ===
    "function"
  ) {

    updateResultRanking({

      currentRank:
        Number(
          ranking.current_rank
          ||
          0
        ),

      beatenPlayers:
        Number(
          ranking.beaten_players
          ||
          0
        ),

      totalPlayers:
        Number(
          ranking.total_players
          ||
          0
        ),

      totalRuns:
        Number(
          ranking.total_runs
          ||
          0
        ),

      runNumber:
        Number(
          ranking.run_number
          ||
          0
        ),

      personalBest:
        Number(
          ranking.personal_best_episode
          ||
          0
        )

    });

  }


  return ranking;

}


/* =====================================================
   一次同步 + 排名
===================================================== */

async function syncAndLoadEpisodeRanking() {

  if (
    !ACTIVE_EPISODE_RESULT
  ) {

    return null;

  }


  await syncEpisodeResultToBackend(
    ACTIVE_EPISODE_RESULT
  );


  return await loadGlobalSurvivalRanking();

}


/* =====================================================
   測試工具
===================================================== */

window.syncEpisodeResultToBackend =
  syncEpisodeResultToBackend;


window.loadGlobalSurvivalRanking =
  loadGlobalSurvivalRanking;


window.syncAndLoadEpisodeRanking =
  syncAndLoadEpisodeRanking;

  /* =====================================================
   全局生存排行・自動更新
   每集結算後自動同步 Supabase + 讀取排名
===================================================== */

(function installAutomaticSurvivalRanking() {

  if (
    window.__survivalRankingAutoInstalled
  ) {

    return;

  }


  window.__survivalRankingAutoInstalled =
    true;


  /* ===================================================
     自動執行同步與排名
  =================================================== */

  async function autoRefreshSurvivalRanking() {

    try {

      if (
        typeof syncAndLoadEpisodeRanking ===
        "function"

        &&

        typeof ACTIVE_EPISODE_RESULT !==
        "undefined"

        &&

        ACTIVE_EPISODE_RESULT
      ) {

        await syncAndLoadEpisodeRanking();

        return;

      }


      if (
        typeof loadGlobalSurvivalRanking ===
        "function"
      ) {

        await loadGlobalSurvivalRanking();

      }

    }

    catch (
      error
    ) {

      console.error(
        "自動更新生存排名失敗：",
        error
      );

    }

  }


  /* ===================================================
     攔截第二集以後共用結算
  =================================================== */

  const originalShowEpisodeResult =
    window.showEpisodeResult;


  if (
    typeof originalShowEpisodeResult ===
    "function"
  ) {

    window.showEpisodeResult =
      function (
        config = {}
      ) {

        const result =
          originalShowEpisodeResult(
            config
          );


        setTimeout(

          function () {

            autoRefreshSurvivalRanking();

          },

          50

        );


        return result;

      };

  }


  /* ===================================================
     第一集結算也重新抓全局排行
  =================================================== */

  const originalRenderSelectionResult =
    window.renderSelectionResult;


  if (
    typeof originalRenderSelectionResult ===
    "function"
  ) {

    window.renderSelectionResult =
      function () {

        const result =
          originalRenderSelectionResult
            .apply(
              this,
              arguments
            );


        setTimeout(

          function () {

            autoRefreshSurvivalRanking();

          },

          50

        );


        return result;

      };

  }


  /* ===================================================
     F5 回到結算頁時重新載入排名
  =================================================== */

  window.addEventListener(

    "DOMContentLoaded",

    function () {

      setTimeout(

        function () {

          if (
            typeof gameState ===
            "undefined"

            ||

            !gameState
          ) {

            return;

          }


          if (
            gameState.screen ===
            "episodeResult"

            ||

            gameState.screen ===
            "result"
          ) {

            autoRefreshSurvivalRanking();

          }

        },

        150

      );

    }

  );


  /* ===================================================
     開發測試
  =================================================== */

  window.refreshSurvivalRanking =
    autoRefreshSurvivalRanking;

})();

/* =====================================================
   生存進度保護版後端同步
   max_episode_reached 只能增加，不可倒退
===================================================== */

async function syncEpisodeResultToBackend(
  result
) {

  if (
    !result
    ||
    Number(result.episodeNumber || 0) <= 1
  ) {

    return false;

  }


  if (
    !window.hougongSupabase
  ) {

    console.warn(
      "Supabase 尚未載入"
    );

    return false;

  }


  try {

    /* =================================================
       登入玩家
    ================================================= */

    const authResult =
      await window.hougongSupabase
        .auth
        .getUser();


    const user =
      authResult
        ?.data
        ?.user;


    if (!user) {

      console.warn(
        "目前沒有登入玩家"
      );

      return false;

    }


    gameState.authUserId =
      user.id;


    /* =================================================
       找回 runId
    ================================================= */

    if (
      !gameState.backendRunId
    ) {

      const {
        data: latestRun,
        error: latestRunError
      } =
        await window.hougongSupabase

          .from(
            "game_runs"
          )

          .select(
            "id, run_number"
          )

          .eq(
            "user_id",
            user.id
          )

          .order(
            "updated_at",
            {
              ascending: false
            }
          )

          .limit(1)

          .maybeSingle();


      if (
        latestRunError
        ||
        !latestRun
      ) {

        console.error(
          "找回遊戲局失敗：",
          latestRunError
        );

        return false;

      }


      gameState.backendRunId =
        latestRun.id;


      gameState.backendRunNumber =
        latestRun.run_number;

    }


    /* =================================================
       讀取目前後端進度
    ================================================= */

    const {
      data: existingRun,
      error: existingRunError
    } =
      await window.hougongSupabase

        .from(
          "game_runs"
        )

        .select(`
          id,
          run_number,
          current_episode,
          max_episode_reached,
          status,
          end_reason,
          ended_at
        `)

        .eq(
          "id",
          gameState.backendRunId
        )

        .maybeSingle();


    if (
      existingRunError
      ||
      !existingRun
    ) {

      console.error(
        "讀取目前遊戲進度失敗：",
        existingRunError
      );

      return false;

    }


    const episodeNumber =
      Number(
        result.episodeNumber
        ||
        1
      );


    const existingMax =
      Number(
        existingRun.max_episode_reached
        ||
        existingRun.current_episode
        ||
        1
      );


    const newMax =
      Math.max(
        existingMax,
        episodeNumber
      );


    const isNewestEpisode =
      episodeNumber >=
      existingMax;


    const backendOutcome =
      getBackendEpisodeOutcome(
        result
      );


    /* =================================================
       game_runs
    ================================================= */

    const runUpdate = {

      max_episode_reached:
        newMax

    };


    /*
      只有目前集數 >= 歷史最高進度
      才允許覆蓋角色狀態。

      所以：
      已經到第三集，
      再用 Console 測第二集，
      不會把進度洗回第二集。
    */

    if (
      isNewestEpisode
    ) {

      Object.assign(
        runUpdate,
        {

          silver:
            Number(
              playerData.money
              ||
              0
            ),

          favor:
            Number(
              playerData.favor
              ||
              0
            ),

          alert:
            Number(
              playerData.alert
              ||
              0
            ),

          etiquette:
            Number(
              playerData.etiquette
              ||
              0
            ),

          palace_rank:
            getResultPalaceRankLabel(),

          current_episode:
            episodeNumber,

          status:
            backendOutcome.statusAfter,

          end_reason:
            backendOutcome.endReason,

          ended_at:
            result.terminal
              ?
              new Date()
                .toISOString()
              :
              null

        }
      );

    }


    const {
      error: runError
    } =
      await window.hougongSupabase

        .from(
          "game_runs"
        )

        .update(
          runUpdate
        )

        .eq(
          "id",
          gameState.backendRunId
        );


    if (
      runError
    ) {

      console.error(
        "更新 game_runs 失敗：",
        runError
      );

      return false;

    }


    /* =================================================
       episode_records

       每一集仍然保存自己的紀錄。
       舊集測試不會破壞最高生存進度。
    ================================================= */

    const episodePayload = {

      run_id:
        gameState.backendRunId,

      user_id:
        user.id,

      episode_number:
        episodeNumber,

      episode_title:
        result.episodeTitle,

      outcome_type:
        backendOutcome.outcomeType,

      status_after:
        backendOutcome.statusAfter,

      end_reason:
        backendOutcome.endReason,

      episode_score:
        result.score
        ??
        0,

      total_score:
        Number(
          gameState
            ?.selectionResult
            ?.total
          ||
          0
        ),

      silver_after:
        Number(
          playerData.money
          ||
          0
        ),

      favor_after:
        Number(
          playerData.favor
          ||
          0
        ),

      alert_after:
        Number(
          playerData.alert
          ||
          0
        ),

      etiquette_after:
        Number(
          playerData.etiquette
          ||
          0
        ),

      palace_rank_after:
        getResultPalaceRankLabel(),

      episode_flags: {

        result_title:
          result.title,

        survived:
          result.survived,

        terminal:
          result.terminal,

        story_step:
          gameState.storyStep
          ||
          null,

        night_route:
          gameState.episodeTwoNightRoute
          ||
          null,

        episode_three_outcome:
          gameState
            ?.episodeThree
            ?.outcome
          ||
          null

      }

    };


    const {
      error: episodeError
    } =
      await window.hougongSupabase

        .from(
          "episode_records"
        )

        .upsert(
          episodePayload,
          {
            onConflict:
              "run_id,episode_number"
          }
        );


    if (
      episodeError
    ) {

      console.error(
        "儲存 episode_records 失敗：",
        episodeError
      );

      return false;

    }


    saveGame();


    console.log(
      `第 ${episodeNumber} 集後端同步完成，最高進度：第 ${newMax} 集`
    );


    return true;

  }

  catch (
    error
  ) {

    console.error(
      "後端同步發生錯誤：",
      error
    );

    return false;

  }

}


/* =====================================================
   重新輸出最新版
===================================================== */

window.syncEpisodeResultToBackend =
  syncEpisodeResultToBackend;

/* =====================================================
   每集銀兩戰績系統
   顯示：
   1. 本集銀兩變化
   2. 結算銀兩
===================================================== */

(function installEpisodeSilverResultSystem() {

  if (
    window.__episodeSilverResultInstalled
  ) {

    return;

  }


  window.__episodeSilverResultInstalled =
    true;


  /* ===================================================
     銀兩格式
  =================================================== */

  function formatSilverChange(
    value
  ) {

    const amount =
      Number(
        value
        ||
        0
      );


    if (
      amount > 0
    ) {

      return `+${amount} 兩`;

    }


    if (
      amount < 0
    ) {

      return `${amount} 兩`;

    }


    return "0 兩";

  }


  /* ===================================================
     本機銀兩紀錄容器
  =================================================== */

  function ensureEpisodeSilverBalances() {

    if (
      !gameState.episodeSilverBalances
      ||
      typeof gameState.episodeSilverBalances
      !== "object"
    ) {

      gameState.episodeSilverBalances =
        {};

    }


    return gameState.episodeSilverBalances;

  }


  /* ===================================================
     從本機取得上一集結算銀兩
  =================================================== */

  function getLocalPreviousSilver(
    episodeNumber
  ) {

    const balances =
      ensureEpisodeSilverBalances();


    const previous =
      balances[
        String(
          episodeNumber - 1
        )
      ];


    if (
      previous
      &&
      Number.isFinite(
        Number(
          previous.end
        )
      )
    ) {

      return Number(
        previous.end
      );

    }


    return null;

  }


  /* ===================================================
     從 Supabase 取得上一集結算銀兩

     episode_records 已保存 silver_after
  =================================================== */

  async function getBackendPreviousSilver(
    episodeNumber
  ) {

    if (
      episodeNumber <= 1
      ||
      !window.hougongSupabase
      ||
      !gameState.backendRunId
    ) {

      return null;

    }


    try {

      const {
        data,
        error
      } =
        await window.hougongSupabase

          .from(
            "episode_records"
          )

          .select(
            "silver_after"
          )

          .eq(
            "run_id",
            gameState.backendRunId
          )

          .eq(
            "episode_number",
            episodeNumber - 1
          )

          .maybeSingle();


      if (
        error
      ) {

        console.warn(
          "讀取上一集銀兩失敗：",
          error
        );

        return null;

      }


      if (
        data
        &&
        Number.isFinite(
          Number(
            data.silver_after
          )
        )
      ) {

        return Number(
          data.silver_after
        );

      }


      return null;

    }

    catch (
      error
    ) {

      console.warn(
        "讀取上一集銀兩發生錯誤：",
        error
      );


      return null;

    }

  }


  /* ===================================================
     找本集起始銀兩
  =================================================== */

  async function getEpisodeStartSilver(
    episodeNumber
  ) {

    const balances =
      ensureEpisodeSilverBalances();


    const currentRecord =
      balances[
        String(
          episodeNumber
        )
      ];


    /*
      已經有本集起始紀錄
    */

    if (
      currentRecord
      &&
      Number.isFinite(
        Number(
          currentRecord.start
        )
      )
    ) {

      return Number(
        currentRecord.start
      );

    }


    /*
      第一集：
      新開局之後會另外保存 runStartSilver。
      舊存檔沒有就不亂算。
    */

    if (
      episodeNumber === 1
    ) {

      if (
        Number.isFinite(
          Number(
            gameState.runStartSilver
          )
        )
      ) {

        return Number(
          gameState.runStartSilver
        );

      }


      return null;

    }


    /*
      先找本機上一集
    */

    const localPrevious =
      getLocalPreviousSilver(
        episodeNumber
      );


    if (
      localPrevious !== null
    ) {

      return localPrevious;

    }


    /*
      本機沒有就去 Supabase 找上一集
    */

    return await getBackendPreviousSilver(
      episodeNumber
    );

  }


  /* ===================================================
     建立本集銀兩統計
  =================================================== */

  async function calculateEpisodeSilverResult() {

    if (
      typeof ACTIVE_EPISODE_RESULT ===
      "undefined"
      ||
      !ACTIVE_EPISODE_RESULT
    ) {

      return null;

    }


    const episodeNumber =
      Number(
        ACTIVE_EPISODE_RESULT
          .episodeNumber
        ||
        1
      );


    const endSilver =
      Number(
        playerData.money
        ||
        0
      );


    const startSilver =
      await getEpisodeStartSilver(
        episodeNumber
      );


    const delta =
      startSilver === null
        ?
        null
        :
        endSilver
        -
        startSilver;


    const balances =
      ensureEpisodeSilverBalances();


    balances[
      String(
        episodeNumber
      )
    ] = {

      start:
        startSilver,

      end:
        endSilver,

      delta:
        delta

    };


    return {

      episodeNumber,

      startSilver,

      endSilver,

      delta

    };

  }


  /* ===================================================
     寫進「本集戰績」
  =================================================== */

  async function refreshEpisodeSilverResult() {

    const stats =
      await calculateEpisodeSilverResult();


    if (
      !stats
      ||
      !ACTIVE_EPISODE_RESULT
    ) {

      return null;

    }


    let rows =
      Array.isArray(
        ACTIVE_EPISODE_RESULT
          .detailRows
      )
        ?
        [
          ...ACTIVE_EPISODE_RESULT
            .detailRows
        ]
        :
        [];


    /*
      移除舊銀兩欄位，
      避免第二集原本的「銀兩」重複出現。
    */

    rows =
      rows.filter(
        function (
          row
        ) {

          return ![
            "銀兩",
            "本集銀兩變化",
            "結算銀兩"
          ].includes(
            row?.label
          );

        }
      );


    const silverRows = [

      {

        label:
          "本集銀兩變化",

        value:
          stats.delta === null

            ?

            "舊存檔無起始紀錄"

            :

            formatSilverChange(
              stats.delta
            )

      },

      {

        label:
          "結算銀兩",

        value:
          `${stats.endSilver} 兩`

      }

    ];


    /*
      有「目前位分」就接在位分下面。
      沒有就放最上面。
    */

    const rankIndex =
      rows.findIndex(
        function (
          row
        ) {

          return (
            row?.label ===
            "目前位分"
          );

        }
      );


    if (
      rankIndex >= 0
    ) {

      rows.splice(
        rankIndex + 1,
        0,
        ...silverRows
      );

    }

    else {

      rows.unshift(
        ...silverRows
      );

    }


    ACTIVE_EPISODE_RESULT
      .detailRows =
      rows;


    /*
      F5 回來仍保留
    */

    if (
      gameState.episodeResult
      &&
      Number(
        gameState
          .episodeResult
          .episodeNumber
      )
      ===
      stats.episodeNumber
    ) {

      gameState
        .episodeResult
        .detailRows =
        rows;

    }


    if (
      typeof saveGame ===
      "function"
    ) {

      saveGame();

    }


    /*
      如果玩家已經打開戰績視窗，
      直接刷新內容。
    */

    const modal =
      document.getElementById(
        "resultModal"
      );


    const panel =
      document.getElementById(
        "resultModalPanel"
      );


    if (
      modal
      &&
      panel
      &&
      modal.classList.contains(
        "show"
      )
      &&
      typeof buildScoreModalHTML ===
      "function"
    ) {

      panel.innerHTML =
        buildScoreModalHTML();

    }


    return stats;

  }


  /* ===================================================
     每次進入第二集以上結算，自動計算
  =================================================== */

  const originalShowEpisodeResult =
    window.showEpisodeResult;


  if (
    typeof originalShowEpisodeResult ===
    "function"
  ) {

    window.showEpisodeResult =
      function (
        config = {}
      ) {

        const result =
          originalShowEpisodeResult
            .apply(
              this,
              arguments
            );


        setTimeout(

          function () {

            refreshEpisodeSilverResult();

          },

          60

        );


        return result;

      };

  }


  /* ===================================================
     第一集結算也支援
  =================================================== */

  const originalRenderSelectionResult =
    window.renderSelectionResult;


  if (
    typeof originalRenderSelectionResult ===
    "function"
  ) {

    window.renderSelectionResult =
      function () {

        const result =
          originalRenderSelectionResult
            .apply(
              this,
              arguments
            );


        setTimeout(

          function () {

            refreshEpisodeSilverResult();

          },

          60

        );


        return result;

      };

  }


  /* ===================================================
     F5 回到結算頁
  =================================================== */

  window.addEventListener(

    "DOMContentLoaded",

    function () {

      setTimeout(

        function () {

          if (
            typeof ACTIVE_EPISODE_RESULT !==
            "undefined"
            &&
            ACTIVE_EPISODE_RESULT
          ) {

            refreshEpisodeSilverResult();

          }

        },

        200

      );

    }

  );


  /* ===================================================
     對外測試
  =================================================== */

  window.refreshEpisodeSilverResult =
    refreshEpisodeSilverResult;


  window.getEpisodeStartSilver =
    getEpisodeStartSilver;


  window.calculateEpisodeSilverResult =
    calculateEpisodeSilverResult;

})();

/* =====================================================
   後宮生還錄
   全遊戲共用・重生系統

   規則：
   - 真正死亡 / 落選 / 出宮終局 → 顯示重生
   - 仍然存活 → 不顯示重生
   - 重生只清除目前這一局本機進度
   - Google 登入狀態不受影響
===================================================== */

(function installGlobalRebirthSystem() {

  if (
    window.__globalRebirthSystemInstalled
  ) {
    return;
  }

  window.__globalRebirthSystemInstalled =
    true;


  /* ===================================================
     樣式
  =================================================== */

  function ensureRebirthStyles() {

    if (
      document.getElementById(
        "globalRebirthStyles"
      )
    ) {
      return;
    }


    const style =
      document.createElement(
        "style"
      );


    style.id =
      "globalRebirthStyles";


    style.textContent = `

      .result-rebirth-wrap {
        margin-top: 8px;
        display: flex;
        justify-content: center;
      }


      .result-rebirth-button {
        width: 100%;
        min-height: 42px;

        border:
          1px solid
          rgba(239,201,121,.45);

        border-radius: 6px;

        background:
          linear-gradient(
            135deg,
            rgba(108,28,37,.96),
            rgba(53,8,15,.98)
          );

        color:
          #f3d58c;

        font-size: 14px;
        font-weight: 700;

        letter-spacing: 6px;

        cursor: pointer;

        box-shadow:
          inset 0 0 0 1px
          rgba(255,255,255,.04);
      }


      .result-rebirth-button:active {
        transform:
          scale(.985);
      }

    `;


    document.head.appendChild(
      style
    );

  }


  /* ===================================================
     正式重生

     restartGame()
     已存在 main.js

     它只刪除遊戲 SAVE_KEY，
     不會把 Supabase / Google 登入一起刪掉。
  =================================================== */

  function rebirthGame() {

    const ok =
      confirm(
        "這一局已經結束。\n\n確定要重生，開始全新的人生嗎？"
      );


    if (!ok) {
      return;
    }


    /*
      優先使用 main.js 原本的正式重開函式
    */

    if (
      typeof restartGame ===
      "function"
    ) {

      restartGame();

      return;

    }


    /*
      保底
    */

    try {

      localStorage.removeItem(
        "hougong-survival-save-v5"
      );

    }

    catch (error) {

      console.error(
        "清除遊戲存檔失敗：",
        error
      );

    }


    location.reload();

  }


  /* ===================================================
     移除重生按鈕
  =================================================== */

  function removeRebirthButton() {

    const old =
      document.querySelector(
        ".result-rebirth-wrap"
      );


    if (old) {
      old.remove();
    }

  }


  /* ===================================================
     第一集結果頁判斷

     落選：
     passed === false
     → 人生正式結束
     → 顯示重生

     留牌：
     passed === true
     → 還活著
     → 不顯示
  =================================================== */

  function applyRebirthToSelectionResult() {

    ensureRebirthStyles();


    if (
      typeof gameState ===
      "undefined"
      ||
      !gameState
      ||
      !gameState.selectionResult
    ) {

      return;

    }


    const passed =
      gameState
        .selectionResult
        .passed === true;


    if (passed) {

      removeRebirthButton();

      return;

    }


    const card =
      document.querySelector(
        "#selectionResultScreen .final-card"
      );


    if (!card) {
      return;
    }


    if (
      card.querySelector(
        ".result-rebirth-wrap"
      )
    ) {

      return;

    }


    const main =
      card.querySelector(
        ".result-main"
      );


    if (!main) {
      return;
    }


    const wrap =
      document.createElement(
        "div"
      );


    wrap.className =
      "result-rebirth-wrap";


    wrap.innerHTML = `

      <button
        type="button"
        class="result-rebirth-button"
        onclick="rebirthGame()"
      >
        重 生
      </button>

    `;


    main.appendChild(
      wrap
    );

  }


  /* ===================================================
     包住第一集結果頁

     原本結果照畫，
     畫完再決定需不需要出現重生。
  =================================================== */

  if (
    typeof renderSelectionResult ===
    "function"
  ) {

    const originalRenderSelectionResult =
      renderSelectionResult;


    renderSelectionResult =
      function () {

        const result =
          originalRenderSelectionResult
            .apply(
              this,
              arguments
            );


        setTimeout(
          applyRebirthToSelectionResult,
          0
        );


        return result;

      };


    window.renderSelectionResult =
      renderSelectionResult;

  }


  /* ===================================================
     對外
  =================================================== */

  window.rebirthGame =
    rebirthGame;


  window.applyRebirthToSelectionResult =
    applyRebirthToSelectionResult;


  /* ===================================================
     F5 回到第一集落選結果時也補上
  =================================================== */

  window.addEventListener(

    "DOMContentLoaded",

    function () {

      setTimeout(
        function () {

          if (
            typeof gameState !==
            "undefined"
            &&
            gameState
            &&
            gameState.screen ===
              "result"
          ) {

            applyRebirthToSelectionResult();

          }

        },

        180

      );

    }

  );

})();

/* =====================================================
   移除舊版「重新開局」按鈕
   全遊戲終局統一只保留「重生」
===================================================== */

(function removeLegacyRestartButton() {

  function cleanupLegacyRestartButton() {

    document
      .querySelectorAll(
        ".restart-button"
      )
      .forEach(
        function (button) {
          button.remove();
        }
      );


    document
      .querySelectorAll(
        "button"
      )
      .forEach(
        function (button) {

          const text =
            button.textContent
              .replace(/\s+/g, "")
              .trim();


          if (
            text === "重新開局"
          ) {

            button.remove();

          }

        }
      );

  }


  /* 先處理目前畫面 */
  cleanupLegacyRestartButton();


  /* 結果頁重新 render 後再處理 */
  const observer =
    new MutationObserver(
      function () {
        cleanupLegacyRestartButton();
      }
    );


  observer.observe(
    document.body,
    {
      childList: true,
      subtree: true
    }
  );


  window.cleanupLegacyRestartButton =
    cleanupLegacyRestartButton;

})();

/* =====================================================
   結果頁排行榜 F5 自動恢復 V2

   功能：
   - F5 回到結果頁後重新讀取目前這一局排名
   - 不建立新的 game_runs
   - 使用原本 gameState.currentRunId
   - Google Session 恢復後再補抓一次
===================================================== */

(function installResultRankingResumeV2() {

  if (
    window.__resultRankingResumeV2Installed
  ) {
    return;
  }

  window.__resultRankingResumeV2Installed =
    true;


  /* ===================================================
     重新讀取目前這局排行榜
  =================================================== */

  async function refreshCurrentResultRanking() {

    try {

      if (
        typeof gameState === "undefined"
        ||
        !gameState
      ) {
        return false;
      }


      /*
        第一集結果頁：
        screen = result

        後面集數結果頁有可能：
        screen = episodeResult
      */

      const isResultScreen =

        gameState.screen === "result"

        ||

        gameState.screen === "episodeResult";


      if (!isResultScreen) {

        return false;

      }


      /*
        沒有目前這局的 Supabase run id
        就絕對不要自己建立新的一局。
      */

      if (
        !gameState.currentRunId
      ) {

        console.warn(
          "排行榜恢復：沒有 currentRunId"
        );

        return false;

      }


      /*
        使用我們原本已經存在的排行榜讀取函式。
      */

      let loader = null;


      if (
        typeof window.loadResultRankingData ===
        "function"
      ) {

        loader =
          window.loadResultRankingData;

      }

      else if (
        typeof loadResultRankingData ===
        "function"
      ) {

        loader =
          loadResultRankingData;

      }


      if (!loader) {

        console.warn(
          "排行榜恢復：找不到 loadResultRankingData()"
        );

        return false;

      }


      console.log(
        "重新讀取本局排行榜：",
        gameState.currentRunId
      );


      await loader();


      /*
        loader 正常情況會自己更新畫面。
        這裡再補一次，避免畫面先 render、
        資料後回來時沒有刷新。
      */

      if (
        typeof applyRankingToResultPage ===
        "function"
      ) {

        applyRankingToResultPage();

      }


      return true;

    }

    catch (error) {

      console.error(
        "重新讀取排行榜失敗：",
        error
      );

      return false;

    }

  }


  /* ===================================================
     第一集結果頁每次重新 render 後
     都再抓一次排名
  =================================================== */

  if (
    typeof renderSelectionResult ===
    "function"
  ) {

    const originalRenderSelectionResult =
      renderSelectionResult;


    renderSelectionResult =
      function () {

        const result =
          originalRenderSelectionResult
            .apply(
              this,
              arguments
            );


        setTimeout(
          refreshCurrentResultRanking,
          150
        );


        return result;

      };


    window.renderSelectionResult =
      renderSelectionResult;

  }


  /* ===================================================
     F5 載入完成後
  =================================================== */

  function resumeRankingAfterReload() {

    setTimeout(
      refreshCurrentResultRanking,
      400
    );

  }


  if (
    document.readyState ===
    "loading"
  ) {

    window.addEventListener(
      "DOMContentLoaded",
      resumeRankingAfterReload
    );

  }

  else {

    resumeRankingAfterReload();

  }


  /* ===================================================
     Supabase Session 恢復後再補抓一次

     某些瀏覽器 F5 時：
     畫面先出現，
     Google Session 稍後才恢復。
  =================================================== */

  if (
    window.hougongSupabase
    &&
    window.hougongSupabase.auth
    &&
    typeof window.hougongSupabase
      .auth
      .onAuthStateChange ===
      "function"
  ) {

    window.hougongSupabase
      .auth
      .onAuthStateChange(
        function (
          event,
          session
        ) {

          if (session) {

            setTimeout(
              refreshCurrentResultRanking,
              150
            );

          }

        }
      );

  }


  /* ===================================================
     測試用
  =================================================== */

  window.refreshCurrentResultRanking =
    refreshCurrentResultRanking;

})();

/* =====================================================
   後宮生還錄
   排行榜恢復最終相容版

   直接貼在 result-page.js 最底部
   不需要刪除任何舊程式

   功能：
   1. 接回 main.js 原本的 loadResultRanking()
   2. F5 結果頁自動重新抓排行榜
   3. 不建立新的 game_runs
   4. 測試跳關沒有宮籍時顯示「測試模式」
===================================================== */

(function installFinalRankingResume() {

  if (
    window.__finalRankingResumeInstalled
  ) {
    return;
  }


  window.__finalRankingResumeInstalled =
    true;


  /* ===================================================
     相容之前使用的名稱

     舊版程式找的是：
     loadResultRankingData()

     但 main.js 正式函式其實叫：
     loadResultRanking()
  =================================================== */

  if (
    typeof loadResultRanking ===
    "function"
  ) {

    window.loadResultRankingData =
      async function () {

        return await loadResultRanking();

      };

  }


  /* ===================================================
     測試模式文字
  =================================================== */

  function showRankingTestMode() {

    const rank =
      document.getElementById(
        "rankingCurrent"
      );


    const beaten =
      document.getElementById(
        "rankingBeaten"
      );


    if (rank) {

      rank.textContent =
        "測試模式";

    }


    if (beaten) {

      beaten.textContent =
        "測試模式";

    }

  }


  /* ===================================================
     正式重新抓排行榜
  =================================================== */

  async function refreshFinalRanking() {

    if (
      typeof gameState ===
      "undefined"
      ||
      !gameState
    ) {

      return false;

    }


    const isResultPage =

      gameState.screen ===
        "result"

      ||

      gameState.screen ===
        "episodeResult";


    if (!isResultPage) {

      return false;

    }


    /* ===============================================
       測試跳關

       測試秀女沒有建立 Supabase 宮籍，
       所以本來就不應該被算進正式排行榜。
    =============================================== */

    if (
      !gameState.currentRunId
      &&
      typeof playerData !==
        "undefined"
      &&
      playerData
      &&
      playerData.name ===
        "測試秀女"
    ) {

      showRankingTestMode();

      return false;

    }


    /* ===============================================
       使用 main.js 原本正式函式

       loadResultRanking() 本身就會：
       - 使用 currentRunId
       - 舊存檔沒有 ID 時嘗試找回 run
       - 呼叫 Supabase RPC
       - 更新結果頁
    =============================================== */

    if (
      typeof loadResultRanking ===
      "function"
    ) {

      try {

        await loadResultRanking();


        if (
          typeof applyRankingToResultPage ===
          "function"
        ) {

          applyRankingToResultPage();

        }


        return true;

      }

      catch (error) {

        console.error(
          "排行榜恢復失敗：",
          error
        );


        return false;

      }

    }


    console.warn(
      "找不到正式排行榜函式 loadResultRanking()"
    );


    return false;

  }


  /* ===================================================
     提供給其他系統使用
  =================================================== */

  window.refreshFinalRanking =
    refreshFinalRanking;


  /*
    也直接覆蓋之前提供給測試用的函式名稱。
  */

  window.refreshCurrentResultRanking =
    refreshFinalRanking;


  /* ===================================================
     F5 載入後重新抓排名

     main.js 會先 loadGame()
     再 restoreGame()

     稍等一下後再抓 Supabase。
  =================================================== */

  function startRankingResume() {

    setTimeout(
      refreshFinalRanking,
      700
    );

  }


  if (
    document.readyState ===
    "loading"
  ) {

    window.addEventListener(
      "DOMContentLoaded",
      startRankingResume
    );

  }

  else {

    startRankingResume();

  }


  /* ===================================================
     Google Session 恢復後再補抓一次
  =================================================== */

  if (
    window.hougongSupabase
    &&
    window.hougongSupabase.auth
    &&
    typeof window
      .hougongSupabase
      .auth
      .onAuthStateChange ===
      "function"
  ) {

    window
      .hougongSupabase
      .auth
      .onAuthStateChange(

        function (
          event,
          session
        ) {

          if (!session) {

            return;

          }


          setTimeout(
            refreshFinalRanking,
            300
          );

        }

      );

  }

})();

/* =====================================================
   全域終局結果頁・重生按鈕

   死亡 / 被逐出宮 = 真正終局
   自動在每集結果頁加入【重 生】

   冷宮、幽禁、存活都不算死亡，
   不會出現重生。
===================================================== */

(function installTerminalResultRebirth() {

  if (
    window.__terminalResultRebirthInstalled
  ) {
    return;
  }


  window.__terminalResultRebirthInstalled =
    true;


  /* ===================================================
     是否為真正終局
  =================================================== */

  function isTerminalRunEnding() {

    if (
      typeof gameState === "undefined"
      ||
      !gameState
    ) {
      return false;
    }


    return (
      gameState.status === "dead"
      ||
      gameState.status === "expelled"
    );

  }


  /* ===================================================
     執行重生
  =================================================== */

  function terminalRebirth() {

    if (
      typeof window.rebirthGame ===
      "function"
    ) {

      window.rebirthGame();

      return;

    }


    const ok =
      confirm(
        "本局已經結束。\n\n確定重生，開始全新的人生嗎？"
      );


    if (!ok) {
      return;
    }


    if (
      typeof restartGame ===
      "function"
    ) {

      restartGame();

      return;

    }


    localStorage.removeItem(
      "hougong-survival-save-v5"
    );


    location.reload();

  }


  /* ===================================================
     加入重生按鈕
  =================================================== */

  function applyTerminalRebirthToResultPage() {

    if (
      !isTerminalRunEnding()
    ) {
      return;
    }


    const resultScreen =
      document.getElementById(
        "selectionResultScreen"
      );


    if (!resultScreen) {
      return;
    }


    /*
      已經有重生就不重複新增。
    */

    if (
      resultScreen.querySelector(
        ".terminal-rebirth-button"
      )
    ) {
      return;
    }


    /*
      找結果頁主要內容區。
    */

    const target =
      resultScreen.querySelector(
        ".result-tools"
      )
      ||
      resultScreen.querySelector(
        ".result-main"
      )
      ||
      resultScreen.querySelector(
        ".final-card"
      );


    if (!target) {
      return;
    }


    const button =
      document.createElement(
        "button"
      );


    button.type =
      "button";


    button.className =
      "terminal-rebirth-button";


    button.textContent =
      "重 生";


    button.style.cssText = `
      width:100%;
      margin-top:10px;
      padding:13px 12px;

      border:
        1px solid
        rgba(239,201,121,.55);

      border-radius:5px;

      background:
        linear-gradient(
          135deg,
          #651420,
          #8d1d29
        );

      color:#f6d691;

      font-size:14px;
      font-weight:700;
      letter-spacing:8px;

      cursor:pointer;
    `;


    button.onclick =
      function () {

        terminalRebirth();

      };


    target.appendChild(
      button
    );

  }


  /* ===================================================
     結果頁重新產生時自動檢查
  =================================================== */

  const observer =
    new MutationObserver(
      function () {

        applyTerminalRebirthToResultPage();

      }
    );


  observer.observe(
    document.body,
    {
      childList:true,
      subtree:true
    }
  );


  /* ===================================================
     F5 恢復
  =================================================== */

  function startTerminalRebirthCheck() {

    setTimeout(
      applyTerminalRebirthToResultPage,
      300
    );

  }


  if (
    document.readyState === "loading"
  ) {

    window.addEventListener(
      "DOMContentLoaded",
      startTerminalRebirthCheck
    );

  }

  else {

    startTerminalRebirthCheck();

  }


  window.applyTerminalRebirthToResultPage =
    applyTerminalRebirthToResultPage;

})();

/* =====================================================
   終局重生按鈕・滿版寬度修正
===================================================== */

(function fixTerminalRebirthButtonWidth() {

  if (
    window.__terminalRebirthWidthFixed
  ) {
    return;
  }

  window.__terminalRebirthWidthFixed =
    true;


  const style =
    document.createElement(
      "style"
    );


  style.id =
    "terminalRebirthWidthStyle";


  style.textContent = `

    .result-tools
    .terminal-rebirth-button{

      grid-column:
        1 / -1 !important;

      width:
        100% !important;

    }

  `;


  document.head.appendChild(
    style
  );

})();