/* =====================================================
   後宮生還錄
   每集結果頁系統
   手機單畫面 + 排名 + 詳細資料彈窗 + 社群分享
===================================================== */


/* =====================================================
   排行榜資料
===================================================== */

let RESULT_RANKING_DATA = {
  currentRank: null,
  beatenPlayers: null,
  beatenPercent: null,
  totalPlayers: null,
  completedSelections: null,
  passedRuns: null,
  personalBest: null,
  runNumber: null,

  loaded: false,
  loading: false
};


/* =====================================================
   重設排行榜資料
===================================================== */

function resetResultRankingData() {

  RESULT_RANKING_DATA = {

    currentRank:
      null,

    beatenPlayers:
      null,

    beatenPercent:
      null,

    totalPlayers:
      null,

    completedSelections:
      null,

    passedRuns:
      null,

    personalBest:
      null,

    runNumber:
      gameState.currentRunNumber
      || null,

    loaded:
      false,

    loading:
      false

  };

}


/* =====================================================
   Supabase RPC 回傳第一筆
===================================================== */

function getFirstRankingRow(
  data
) {

  if (
    Array.isArray(data)
    &&
    data.length > 0
  ) {

    return data[0];

  }


  if (
    data
    &&
    typeof data === "object"
  ) {

    return data;

  }


  return null;

}


/* =====================================================
   從 Supabase 取得真實排行榜
===================================================== */

async function loadResultRankingData(
  attempt = 0
) {

  /*
    避免同時重複抓排行榜
  */

  if (
    RESULT_RANKING_DATA.loading
  ) {

    return;

  }


  /*
    Supabase 尚未載入
    或這一局沒有 run ID
  */

  if (
    !window.hougongSupabase
    ||
    !gameState.currentRunId
  ) {

    RESULT_RANKING_DATA.loaded =
      false;

    applyRankingToResultPage();

    return;

  }


  RESULT_RANKING_DATA.loading =
    true;


  applyRankingToResultPage();


  try {

    const user =
      await getCurrentUser();


    if (!user) {

      RESULT_RANKING_DATA.loading =
        false;

      RESULT_RANKING_DATA.loaded =
        false;

      applyRankingToResultPage();

      return;

    }


    /*
      結果頁會先顯示，
      main.js 接著才把第一集分數寫進 Supabase。

      所以先確認這一局的分數
      已經真的寫入資料庫。
    */

    const {
      data: currentRun,
      error: currentRunError
    } =
      await window.hougongSupabase
        .from(
          "game_runs"
        )
        .select(
          "id, run_number, selection_total_score"
        )
        .eq(
          "id",
          gameState.currentRunId
        )
        .single();


    if (
      currentRunError
    ) {

      throw currentRunError;

    }


    /*
      如果分數還沒寫入，
      等一下自動再查。

      玩家不用重新整理。
    */

    if (
      !currentRun
      ||
      Number(
        currentRun.selection_total_score
      ) <= 0
    ) {

      RESULT_RANKING_DATA.loading =
        false;


      if (
        attempt < 6
      ) {

        setTimeout(
          function () {

            loadResultRankingData(
              attempt + 1
            );

          },

          700
        );

      }


      return;

    }


    /*
      同時取得：

      1. 全服統計
      2. 本局排名
      3. 玩家自己的最佳殿選成績
    */

    const [
      statsResponse,
      rankResponse,
      bestResponse
    ] =
      await Promise.all([


        window.hougongSupabase
          .rpc(
            "get_global_stats"
          ),


        window.hougongSupabase
          .rpc(
            "get_my_run_rank",

            {

              p_run_id:
                gameState.currentRunId

            }
          ),


        window.hougongSupabase
          .from(
            "game_runs"
          )
          .select(
            "selection_total_score"
          )
          .eq(
            "user_id",
            user.id
          )
          .gt(
            "selection_total_score",
            0
          )
          .order(
            "selection_total_score",

            {

              ascending:
                false

            }
          )
          .limit(1)


      ]);


    if (
      statsResponse.error
    ) {

      throw statsResponse.error;

    }


    if (
      rankResponse.error
    ) {

      throw rankResponse.error;

    }


    if (
      bestResponse.error
    ) {

      throw bestResponse.error;

    }


    const stats =
      getFirstRankingRow(
        statsResponse.data
      );


    const rank =
      getFirstRankingRow(
        rankResponse.data
      );


    const bestRow =
      Array.isArray(
        bestResponse.data
      )
      &&
      bestResponse.data.length > 0

      ?

      bestResponse.data[0]

      :

      null;


    RESULT_RANKING_DATA = {

      /*
        本局第幾名
      */

      currentRank:
        rank
        ?
        Number(
          rank.rank_number
        )
        :
        null,


      /*
        超越多少場殿選紀錄
      */

     beatenPlayers:
     rank
     ?
     Number(
     rank.beaten_players
     )
     :
     null,


      /*
        超越百分比
      */

      beatenPercent:
        rank
        &&
        rank.beaten_percent
        !== null

        ?

        Number(
          rank.beaten_percent
        )

        :

        null,


      /*
        Google 帳號去重的玩家數
      */

      totalPlayers:
        stats
        ?
        Number(
          stats.total_players
        )
        :
        null,


      /*
        真正完成過殿選的局數
      */

      completedSelections:
        stats
        ?
        Number(
          stats.completed_selections
        )
        :
        null,


      /*
        成功留牌場數
      */

      passedRuns:
        stats
        ?
        Number(
          stats.passed_selections
        )
        :
        null,


      /*
        這個 Google 帳號
        歷史最佳殿選分數
      */

      personalBest:
        bestRow
        ?
        Number(
          bestRow.selection_total_score
        )
        :
        null,


      /*
        這個帳號現在是第幾局
      */

      runNumber:
        currentRun.run_number
        ?
        Number(
          currentRun.run_number
        )
        :
        (
          gameState.currentRunNumber
          || null
        ),


      loaded:
        true,

      loading:
        false

    };


    applyRankingToResultPage();


    /*
      如果玩家正在看「殿選紀錄」彈窗，
      排名抓完後同步刷新彈窗。
    */

    const modal =
      document.getElementById(
        "resultModal"
      );


    if (
      modal
      &&
      modal.classList.contains(
        "show"
      )
    ) {

      const panel =
        document.getElementById(
          "resultModalPanel"
        );


      if (
        panel
        &&
        panel.dataset.modalType ===
        "ranking"
      ) {

        panel.innerHTML =
          buildRankingModalHTML();

        panel.dataset.modalType =
          "ranking";

      }

    }

  }


  catch (error) {

    console.error(
      "排行榜載入失敗：",
      error
    );


    RESULT_RANKING_DATA.loading =
      false;

    RESULT_RANKING_DATA.loaded =
      false;


    applyRankingToResultPage();

  }

}


/* =====================================================
   載入 Font Awesome 社群 Logo
===================================================== */

function ensureSocialIcons() {

  if (
    document.getElementById("fontAwesomeSocialIcons")
  ) {
    return;
  }

  const link =
    document.createElement("link");

  link.id =
    "fontAwesomeSocialIcons";

  link.rel =
    "stylesheet";

  link.href =
    "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css";

  document.head.appendChild(link);

}


/* =====================================================
   結果頁 CSS
===================================================== */

function ensureResultPageStyles() {

  ensureSocialIcons();

  if (
    document.getElementById("resultPageStyles")
  ) {
    return;
  }

  const style =
    document.createElement("style");

  style.id =
    "resultPageStyles";

  style.textContent = `

    #selectionResultScreen{
      height:100dvh;
      min-height:100dvh;
      max-height:100dvh;

      overflow:hidden;

      padding:10px 12px;

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

      margin-bottom:7px;

      font-size:11px;
    }


    #selectionResultScreen .final-card{
      height:calc(100dvh - 51px);

      margin:0;
      padding:0;

      display:grid;

      grid-template-rows:
        minmax(175px, 34dvh)
        minmax(0, 1fr)
        auto;

      overflow:hidden;

      border:
        1px solid
        rgba(239,201,121,.28);

      background:
        linear-gradient(
          180deg,
          rgba(40,8,14,.98),
          rgba(14,4,7,.99)
        );
    }


    /* =============================
       結果圖片
    ============================= */

    .result-hero{
      position:relative;

      min-height:0;

      overflow:hidden;

      background:#160609;

      border-bottom:
        1px solid
        rgba(239,201,121,.18);
    }


    .result-hero img{
      width:100%;
      height:100%;

      display:block;

      object-fit:cover;
    }


    .result-hero::after{
      content:"";

      position:absolute;

      left:0;
      right:0;
      bottom:0;

      height:34%;

      pointer-events:none;

      background:
        linear-gradient(
          to top,
          rgba(20,4,8,.92),
          transparent
        );
    }


    /* =============================
       主要結果
    ============================= */

    .result-main{
      min-height:0;

      padding:
        7px 16px 6px;

      text-align:center;

      overflow:hidden;
    }


    .result-status{
      color:
        rgba(239,201,121,.62);

      font-size:10px;

      letter-spacing:4px;
    }


    .result-title{
      margin-top:2px;

      color:#efc979;

      font-size:
        clamp(
          27px,
          7vw,
          34px
        );

      line-height:1.18;

      font-weight:500;

      letter-spacing:7px;
    }


    .result-survival{
      margin-top:5px;

      color:#fff0c8;

      font-size:
        clamp(
          22px,
          6vw,
          29px
        );

      line-height:1.25;

      font-weight:700;

      letter-spacing:1px;
    }


    .result-survival-sub{
      margin-top:2px;

      color:#bd9160;

      font-size:11px;

      letter-spacing:3px;
    }


    .result-score{
      margin-top:6px;

      color:#efc979;

      font-size:18px;

      letter-spacing:2px;
    }


    /* =============================
       排名
    ============================= */

    .result-ranking{
      display:grid;

      grid-template-columns:
        1fr 1fr;

      gap:7px;

      margin-top:7px;
    }


    .result-ranking-card{
      min-width:0;

      padding:7px 4px;

      border:
        1px solid
        rgba(239,201,121,.15);

      background:
        rgba(0,0,0,.18);
    }


    .result-ranking-label{
      color:
        rgba(255,255,255,.38);

      font-size:9px;

      letter-spacing:1px;
    }


    .result-ranking-value{
      margin-top:3px;

      overflow:hidden;

      color:#edca84;

      font-size:
        clamp(
          13px,
          3.7vw,
          16px
        );

      font-weight:600;

      white-space:nowrap;

      text-overflow:ellipsis;
    }


    /* =============================
       劇情短句
    ============================= */

    .result-story{
      margin-top:6px;

      color:
        rgba(255,255,255,.65);

      font-size:11px;

      line-height:1.4;
    }


    /* =============================
       功能按鈕
    ============================= */

    .result-tools{
      display:grid;

      grid-template-columns:
        1fr 1fr;

      gap:7px;

      margin-top:6px;
    }


    .result-tool-button{
      padding:7px 5px;

      border:
        1px solid
        rgba(239,201,121,.19);

      border-radius:4px;

      background:
        rgba(255,255,255,.03);

      color:#dec18a;

      cursor:pointer;

      font-size:10px;

      letter-spacing:1px;
    }


    /* =============================
       分享區
    ============================= */

    .result-bottom{
      padding:
        6px 12px 8px;

      border-top:
        1px solid
        rgba(239,201,121,.12);

      background:
        rgba(8,2,4,.78);
    }


    .result-share-title{
      margin-bottom:5px;

      text-align:center;

      color:
        rgba(255,255,255,.34);

      font-size:9px;

      letter-spacing:3px;
    }


    .result-share-row{
      display:flex;

      align-items:center;
      justify-content:center;

      gap:10px;
    }


    .share-icon{
      width:38px;
      height:38px;

      flex:0 0 38px;

      display:flex;

      align-items:center;
      justify-content:center;

      padding:0;

      border:
        1px solid
        rgba(239,201,121,.20);

      border-radius:50%;

      background:
        rgba(255,255,255,.045);

      cursor:pointer;

      transition:
        transform .15s ease,
        background .15s ease,
        border-color .15s ease;
    }


    .share-icon i{
      font-size:19px;
    }


    .share-icon:active{
      transform:scale(.90);
    }


    .share-instagram i{
      color:#e85b9c;
    }


    .share-threads i{
      color:#f4f4f4;
    }


    .share-line i{
      color:#06c755;
    }


    .share-facebook i{
      color:#4385f5;
    }


    .share-system i{
      color:#e5c57f;
    }


    /* =============================
       彈窗
    ============================= */

    .result-modal{
      display:none;

      position:fixed;

      inset:0;

      z-index:10050;

      align-items:flex-end;
      justify-content:center;

      padding:12px;

      background:
        rgba(0,0,0,.72);

      backdrop-filter:
        blur(4px);
    }


    .result-modal.show{
      display:flex;
    }


    .result-modal-panel{
      width:min(
        100%,
        460px
      );

      max-height:78dvh;

      overflow-y:auto;

      padding:
        18px 18px 20px;

      border:
        1px solid
        rgba(239,201,121,.30);

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
        rgba(0,0,0,.55);
    }


    .result-modal-head{
      display:flex;

      align-items:center;
      justify-content:space-between;

      margin-bottom:14px;
    }


    .result-modal-title{
      color:#efc979;

      font-size:17px;

      letter-spacing:4px;
    }


    .result-modal-close{
      width:32px;
      height:32px;

      border:
        1px solid
        rgba(239,201,121,.18);

      border-radius:50%;

      background:
        transparent;

      color:#dfc899;

      cursor:pointer;

      font-size:18px;
    }


    .modal-row{
      display:flex;

      justify-content:space-between;

      align-items:center;

      padding:11px 0;

      border-bottom:
        1px solid
        rgba(255,255,255,.06);

      gap:20px;

      font-size:13px;
    }


    .modal-row span:first-child{
      color:
        rgba(255,255,255,.45);
    }


    .modal-row span:last-child{
      color:#efd091;

      text-align:right;
    }


    .modal-note{
      margin-top:14px;

      text-align:center;

      color:
        rgba(255,255,255,.28);

      font-size:10px;

      line-height:1.7;
    }


    @media(max-height:700px){

      #selectionResultScreen{
        padding-top:6px;
      }


      #selectionResultScreen .final-card{
        height:
          calc(
            100dvh - 43px
          );

        grid-template-rows:
          minmax(150px, 29dvh)
          minmax(0, 1fr)
          auto;
      }


      .result-main{
        padding-top:5px;
      }


      .result-survival{
        margin-top:3px;

        font-size:20px;
      }


      .result-score{
        margin-top:4px;
      }


      .result-ranking{
        margin-top:5px;
      }


      .result-ranking-card{
        padding:5px 3px;
      }


      .result-story{
        display:none;
      }


      .result-tools{
        margin-top:5px;
      }


      .result-bottom{
        padding:
          5px 10px 6px;
      }


      .result-share-title{
        display:none;
      }


      .share-icon{
        width:34px;
        height:34px;

        flex-basis:34px;
      }


      .share-icon i{
        font-size:17px;
      }

    }

  `;

  document.head.appendChild(style);

}


/* =====================================================
   工具
===================================================== */

function resultSignedNumber(value) {

  if (value > 0) {
    return "+" + value;
  }

  return String(value);

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


/* =====================================================
   分享文字
===================================================== */

function buildResultShareText() {

  const result =
    gameState.selectionResult;


  if (!result) {
    return "《後宮生還錄》";
  }


  /*
    目前第一集使用 1。
    之後進入正式百集系統，
    只要 gameState.currentEpisode 有值，
    分享文字會自動跟著變。
  */

  const currentEpisode =
    Number(
      gameState.currentEpisode
      || 1
    );


  const survivedText =
    result.passed
    ?
    "我目前活到第 "
    +
    currentEpisode
    +
    " 集"
    :
    "我只活到第 "
    +
    currentEpisode
    +
    " 集，故事結束";


  let text =
    "《後宮生還錄》"
    +
    "\n\n"
    +
    survivedText
    +
    "\n"
    +
    "本局總評："
    +
    result.total
    +
    " 分";


  /*
    本局排名
  */

  if (
    RESULT_RANKING_DATA.currentRank
    !== null
  ) {

    text +=
      "\n本局排名：第 "
      +
      RESULT_RANKING_DATA.currentRank
      +
      " 名";

  }


  /*
    超越玩家
  */

  if (
    RESULT_RANKING_DATA.beatenPlayers
    !== null
  ) {

    text +=
      "\n超越玩家："
      +
      RESULT_RANKING_DATA.beatenPlayers
      +
      " 人";

  }


  /*
    個人最佳
  */

  if (
    RESULT_RANKING_DATA.personalBest
    !== null
  ) {

    text +=
      "\n個人最佳："
      +
      RESULT_RANKING_DATA.personalBest
      +
      " 分";

  }


  /*
    本帳號第幾局
  */

  if (
    RESULT_RANKING_DATA.runNumber
    !== null
  ) {

    text +=
      "\n這是我的第 "
      +
      RESULT_RANKING_DATA.runNumber
      +
      " 局";

  }


  text +=
    "\n\n你能活到第幾集？";


  return text;

}


/* =====================================================
   複製文字
===================================================== */

async function copyShareText(text) {

  try {

    if (
      navigator.clipboard
      &&
      window.isSecureContext
    ) {

      await navigator.clipboard.writeText(text);

    }

    else {

      const textarea =
        document.createElement("textarea");

      textarea.value = text;

      textarea.style.position = "fixed";
      textarea.style.opacity = "0";

      document.body.appendChild(textarea);

      textarea.select();

      document.execCommand("copy");

      textarea.remove();

    }

    alert("分享文字已複製。");

  }

  catch (error) {

    alert(
      "目前無法自動複製分享內容。"
    );

  }

}


/* =====================================================
   手機原生分享
===================================================== */

async function nativeShareResult() {

  const text =
    buildResultShareText();

  const url =
    getPublicGameUrl();

  if (navigator.share) {

    try {

      const shareData = {
        title: "後宮生還錄",
        text
      };

      if (url) {
        shareData.url = url;
      }

      await navigator.share(
        shareData
      );

      return;

    }

    catch (error) {

      if (
        error.name === "AbortError"
      ) {
        return;
      }

    }

  }

  await copyShareText(text);

}


/* =====================================================
   社群分享
===================================================== */

async function shareResult(platform) {

  const text =
    buildResultShareText();

  const url =
    getPublicGameUrl();


  if (
    platform === "line"
  ) {

    const lineText =
      url
      ?
      text + "\n" + url
      :
      text;

    window.open(
      "https://line.me/R/share?text="
      +
      encodeURIComponent(lineText),
      "_blank"
    );

    return;

  }


  if (
    platform === "facebook"
    &&
    url
  ) {

    window.open(
      "https://www.facebook.com/sharer/sharer.php?u="
      +
      encodeURIComponent(url),
      "_blank",
      "noopener,noreferrer"
    );

    return;

  }


  await nativeShareResult();

}


/* =====================================================
   詳細成績
===================================================== */

function buildScoreModalHTML() {

  const result =
    gameState.selectionResult;

  return `

    <div class="result-modal-head">

      <div class="result-modal-title">
        詳細成績
      </div>

      <button
        class="result-modal-close"
        onclick="closeResultModal()"
      >
        ×
      </button>

    </div>


    <div class="modal-row">
      <span>殿前禮儀</span>
      <span>${playerData.etiquette} 分</span>
    </div>


    <div class="modal-row">
      <span>殿前應答</span>
      <span>${playerData.answerScore} 分</span>
    </div>


    <div class="modal-row">
      <span>出身修正</span>

      <span>
        ${resultSignedNumber(
          result.familyModifier
        )}
      </span>
    </div>


    <div class="modal-row">
      <span>角色特質修正</span>

      <span>
        ${resultSignedNumber(
          result.traitModifier
        )}
      </span>
    </div>


    <div class="modal-row">
      <span>宮門事件修正</span>

      <span>
        ${resultSignedNumber(
          result.eventModifier
        )}
      </span>
    </div>


    <div class="modal-row">
      <span>命數</span>

      <span>
        ${resultSignedNumber(
          result.luckModifier
        )}
      </span>
    </div>


    <div class="modal-row">
      <span>本局總評</span>
      <span>${result.total} 分</span>
    </div>

  `;

}


/* =====================================================
   排名工具
===================================================== */

function rankingValue(
  value,
  suffix = ""
) {

  if (
    value === null
    ||
    value === undefined
  ) {
    return "尚未連線";
  }

  return value + suffix;

}


/* =====================================================
   殿選紀錄
===================================================== */

function buildRankingModalHTML() {

  return `

    <div class="result-modal-head">

      <div class="result-modal-title">
        本集殿選紀錄
      </div>

      <button
        class="result-modal-close"
        onclick="closeResultModal()"
      >
        ×
      </button>

    </div>


    <div class="modal-row">

      <span>
        參與玩家
      </span>

      <span>
        ${
          rankingValue(
            RESULT_RANKING_DATA.totalPlayers,
            " 人"
          )
        }
      </span>

    </div>


    <div class="modal-row">

      <span>
        累積殿選
      </span>

      <span>
        ${
          rankingValue(
            RESULT_RANKING_DATA.completedSelections,
            " 人"
          )
        }
      </span>

    </div>


    <div class="modal-row">

      <span>
        成功留牌
      </span>

      <span>
        ${
          rankingValue(
            RESULT_RANKING_DATA.passedRuns,
            " 人"
          )
        }
      </span>

    </div>


    <div class="modal-row">

      <span>
        本局排名
      </span>

      <span>
        ${
          RESULT_RANKING_DATA.currentRank
          === null
          ?
          "尚未連線"
          :
          "第 "
          +
          RESULT_RANKING_DATA.currentRank
          +
          " 名"
        }
      </span>

    </div>


    <div class="modal-row">

      <span>
        超越玩家
      </span>

      <span>
        ${
          RESULT_RANKING_DATA.beatenPlayers
          === null
          ?
          "尚未連線"
          :
          RESULT_RANKING_DATA.beatenPlayers
          +
          " 人"
        }
      </span>

    </div>


    <div class="modal-row">

      <span>
        個人最佳
      </span>

      <span>
        ${
          RESULT_RANKING_DATA.personalBest
          === null
          ?
          "尚未連線"
          :
          RESULT_RANKING_DATA.personalBest
          +
          " 分"
        }
      </span>

    </div>


    <div class="modal-row">

      <span>
        本帳號第幾局
      </span>

      <span>
        ${
          RESULT_RANKING_DATA.runNumber
          === null
          ?
          "尚未連線"
          :
          "第 "
          +
          RESULT_RANKING_DATA.runNumber
          +
          " 局"
        }
      </span>

    </div>


    <div class="modal-note">
      排名與統計會依全體玩家的殿選紀錄即時更新。
    </div>

  `;

}


/* =====================================================
   彈窗
===================================================== */

function openResultModal(type) {

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


  if (
    type === "score"
  ) {

    panel.innerHTML =
      buildScoreModalHTML();

  }


  if (
    type === "ranking"
  ) {

    panel.innerHTML =
      buildRankingModalHTML();

  }


  modal.classList.add("show");

}


function closeResultModal() {

  const modal =
    document.getElementById(
      "resultModal"
    );

  if (modal) {
    modal.classList.remove("show");
  }

}


function resultModalBackgroundClick(event) {

  if (
    event.target.id === "resultModal"
  ) {

    closeResultModal();

  }

}


/* =====================================================
   排名更新
===================================================== */

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

    if (
      RESULT_RANKING_DATA.loading
    ) {

      rank.textContent =
        "計算中...";

    }

    else if (
      RESULT_RANKING_DATA.currentRank
      === null
    ) {

      rank.textContent =
        "尚未連線";

    }

    else {

      rank.textContent =
        "第 "
        +
        RESULT_RANKING_DATA.currentRank
        +
        " 名";

    }

  }


  if (beaten) {

    if (
      RESULT_RANKING_DATA.loading
    ) {

      beaten.textContent =
        "計算中...";

    }

    else if (
      RESULT_RANKING_DATA.beatenPlayers
      === null
    ) {

      beaten.textContent =
        "尚未連線";

    }

    else {

      beaten.textContent =
        RESULT_RANKING_DATA.beatenPlayers
        +
        " 人";

    }

  }

}


function updateResultRanking(data) {

  RESULT_RANKING_DATA = {
    ...RESULT_RANKING_DATA,
    ...data
  };

  applyRankingToResultPage();

}


/* =====================================================
   結果頁
===================================================== */

function renderSelectionResult() {

  ensureResultPageStyles();


  const result =
    gameState.selectionResult;


  if (!result) {
    return;
  }


  const card =
    document.querySelector(
      "#selectionResultScreen .final-card"
    );


  if (!card) {
    return;
  }


  const passed =
    result.passed;


  const imageSource =
    passed
    ?
    "images/result-pass.png"
    :
    "images/result-fail.png";


  const resultStatus =
    passed
    ?
    "選秀通過"
    :
    "選秀落選";


  const resultTitle =
    passed
    ?
    "留 牌"
    :
    "撂 牌";


  const survivalTitle =
    passed
    ?
    "你目前活到第 1 集"
    :
    "你只活到第 1 集";


  const survivalSub =
    passed
    ?
    "故事仍在繼續"
    :
    "故事結束";


  const shortStory =
    passed
    ?
    "「"
    + playerData.name
    + "，留牌。」"
    :
    "「"
    + playerData.name
    + "，撂牌子，賜花。」";


  card.innerHTML = `

    <div class="result-hero">

      <img
        id="resultHeroImage"
        src="${imageSource}"
        alt="${resultStatus}"
      >

    </div>


    <div class="result-main">

      <div class="result-status">
        第一集・${resultStatus}
      </div>


      <div class="result-title">
        ${resultTitle}
      </div>


      <div class="result-survival">
        ${survivalTitle}
      </div>


      <div class="result-survival-sub">
        ${survivalSub}
      </div>


      <div class="result-score">
        總評 ${result.total} 分
      </div>


      <div class="result-ranking">

        <div class="result-ranking-card">

          <div class="result-ranking-label">
            本局排名
          </div>

          <div
            id="rankingCurrent"
            class="result-ranking-value"
          >
            尚未連線
          </div>

        </div>


        <div class="result-ranking-card">

          <div class="result-ranking-label">
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


      <div class="result-story">
        ${shortStory}
      </div>


      <div class="result-tools">

        <button
          class="result-tool-button"
          onclick="openResultModal('score')"
        >
          詳細成績
        </button>


        <button
          class="result-tool-button"
          onclick="openResultModal('ranking')"
        >
          殿選紀錄
        </button>

      </div>

    </div>


    <div class="result-bottom">

      <div class="result-share-title">
        分享本集戰績
      </div>


      <div class="result-share-row">


        <button
          class="share-icon share-instagram"
          aria-label="Instagram"
          title="Instagram"
          onclick="shareResult('instagram')"
        >
          <i class="fa-brands fa-instagram"></i>
        </button>


        <button
          class="share-icon share-threads"
          aria-label="Threads"
          title="Threads"
          onclick="shareResult('threads')"
        >
          <i class="fa-brands fa-threads"></i>
        </button>


        <button
          class="share-icon share-line"
          aria-label="LINE"
          title="LINE"
          onclick="shareResult('line')"
        >
          <i class="fa-brands fa-line"></i>
        </button>


        <button
          class="share-icon share-facebook"
          aria-label="Facebook"
          title="Facebook"
          onclick="shareResult('facebook')"
        >
          <i class="fa-brands fa-facebook-f"></i>
        </button>


        <button
          class="share-icon share-system"
          aria-label="更多分享"
          title="更多分享"
          onclick="shareResult('system')"
        >
          <i class="fa-solid fa-share-nodes"></i>
        </button>


      </div>

    </div>

  `;


  /* =============================
     圖片裁切
  ============================= */

  const heroImage =
    document.getElementById(
      "resultHeroImage"
    );


  if (heroImage) {

    if (passed) {

      /*
        原本是 18%
        現在改成 32%

        會減少皇上頭頂空白，
        同時讓女主露出更多。
      */

      heroImage.style.objectPosition =
        "center 26%";

    }

    else {

      heroImage.style.objectPosition =
        "center 22%";

    }

  }


  /* =============================
     建立彈窗
  ============================= */

  let modal =
    document.getElementById(
      "resultModal"
    );


  if (!modal) {

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
      >
      </div>

    `;


    document.body.appendChild(
      modal
    );

  }


applyRankingToResultPage();

loadResultRankingData();

}