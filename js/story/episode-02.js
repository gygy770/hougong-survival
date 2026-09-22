/* =====================================================
   後宮生還錄
   第二集・初入宮門
===================================================== */


/* =====================================================
   取得第一集殿選分數
===================================================== */

function getEpisodeTwoScore() {

  if (
    gameState.selectionResult
    &&
    Number.isFinite(
      Number(
        gameState.selectionResult.total
      )
    )
  ) {

    return Number(
      gameState.selectionResult.total
    );

  }


  if (
    Number.isFinite(
      Number(
        playerData.selectionScore
      )
    )
  ) {

    return Number(
      playerData.selectionScore
    );

  }


  return 0;
}


/* =====================================================
   初始冊封
===================================================== */

function getInitialPalaceRank(
  score
) {

  if (score >= 90) {
    return "貴人";
  }


  if (score >= 80) {
    return "常在";
  }


  if (score >= 70) {
    return "答應";
  }


  return "秀女";
}


/* =====================================================
   初始住所
===================================================== */

function getInitialPalaceResidence(
  rank
) {

  if (rank === "貴人") {

    return "承露宮・東偏殿";

  }


  if (rank === "常在") {

    return "承露宮・西偏殿";

  }


  return "承露宮・後院暖閣";
}


/* =====================================================
   從第一集結果進入第二集
===================================================== */

function enterEpisodeTwo() {

  const score =
    getEpisodeTwoScore();


  /*
    未達 70 分不能入宮
  */

  if (score < 70) {

    console.warn(
      "殿選未通過，不能進入第二集"
    );

    return;
  }


  const rank =
    getInitialPalaceRank(
      score
    );


  const residence =
    getInitialPalaceResidence(
      rank
    );


  /*
    更新玩家資料
  */

  playerData.rank =
    rank;


  gameState.screen =
    "episode2";

  gameState.currentEpisode =
    2;

  gameState.storyStep =
    "ep2_opening";

  gameState.palaceResidence =
    residence;


  /*
    儲存
  */

  if (
    typeof saveGame ===
    "function"
  ) {

    saveGame();

  }


  renderEpisodeTwoOpening();

}


/* =====================================================
   第二集第一幕
   奉旨冊封
===================================================== */

function renderEpisodeTwoOpening() {

  const score =
    getEpisodeTwoScore();


  const rank =
    playerData.rank
    &&
    playerData.rank !== "秀女"
    ?
    playerData.rank
    :
    getInitialPalaceRank(
      score
    );


  playerData.rank =
    rank;


  const residence =
    gameState.palaceResidence
    ||
    getInitialPalaceResidence(
      rank
    );


  gameState.palaceResidence =
    residence;


  setStoryProgress(
    2,
    "ep2_opening"
  );


  renderStoryScene({

    episode:
      "第二集・初入宮門",

    location:
      "紫禁城・宮門",

    title:
      "奉旨冊封",

    content: `

      宣旨太監展開明黃卷軸。

      <br><br>

      四周一時間安靜下來。

      <br><br>

      「奉旨，

      <strong>
        ${playerData.name}
      </strong>

      ，冊為

      <strong>
        ${rank}
      </strong>

      。」

      <br><br>

      你俯身謝恩。

      <br><br>

      從這一刻開始，

      你不再是等待挑選的秀女。

      <br><br>

      身後的宮門緩緩闔上。

      <br><br>

      而真正的後宮，

      才剛剛向你打開。

      <div class="story-effect">

        殿選分數：
        ${score} 分

        <br>

        初始位分：
        ${rank}

        <br>

        分配住所：
        ${residence}

      </div>

    `,

    nextText:
      "踏 入 宮 門",

    nextAction:
      renderEpisodeTwoPalaceRoad

  });

}


/* =====================================================
   第二幕
   宮道
===================================================== */

function renderEpisodeTwoPalaceRoad() {

  setStoryProgress(
    2,
    "ep2_palace_road"
  );


  renderStoryScene({

    episode:
      "第二集・初入宮門",

    location:
      "宮中甬道",

    title:
      "朱牆深處",

    content: `

      掌事太監領著你，

      沿著長長的宮道往深處走去。

      <br><br>

      朱紅宮牆高得幾乎看不見外頭。

      <br><br>

      一道宮門，

      又是一道宮門。

      <br><br>

      偶爾有宮女太監經過，

      見到你便垂首退到一旁。

      <br><br>

      沒有人多看你一眼。

      <br><br>

      可你卻隱約感覺得到，

      <strong>
        有人在看。
      </strong>

      <br><br>

      前方的掌事太監忽然停下腳步。

      <br><br>

      「小主，到了。」

    `,

    nextText:
      "抬 頭 看 去",

    nextAction:
      renderEpisodeTwoArrival

  });

}


/* =====================================================
   第三幕
   抵達承露宮
===================================================== */

function renderEpisodeTwoArrival() {

  setStoryProgress(
    2,
    "ep2_arrival"
  );


  const residence =
    gameState.palaceResidence;


  renderStoryScene({

    episode:
      "第二集・初入宮門",

    location:
      "承露宮",

    title:
      "新居",

    content: `

      你抬起頭。

      <br><br>

      宮門上方，

      三個鎏金大字映入眼簾。

      <br><br>

      <strong>
        承露宮。
      </strong>

      <br><br>

      掌事太監低聲道：

      <br><br>

      「承露宮主位是

      <strong>
        寧嬪・蘇婉容
      </strong>

      娘娘。」

      <br><br>

      「娘娘已經知道小主今日入宮。」

      <br><br>

      你被安置在：

      <div class="story-effect">

        ${residence}

      </div>

      不多時，

      一名約十七八歲的宮女走到你面前，

      恭恭敬敬地行了一禮。

      <br><br>

      「奴婢

      <strong>
        青禾
      </strong>

      ，往後便伺候小主。」

      <br><br>

      她才剛說完，

      門外便傳來另一名宮女的聲音。

      <br><br>

      「寧嬪娘娘傳話。」

      <br><br>

      「請新入宮的小主，

      前往正殿請安。」

    `,

    nextText:
      "前 往 正 殿",

    nextAction:
      renderEpisodeTwoNingPinEntrance

  });

}


/* =====================================================
   第四幕
   寧嬪登場
===================================================== */

function renderEpisodeTwoNingPinEntrance() {

  setStoryProgress(
    2,
    "ep2_ningpin"
  );


  renderStoryScene({

    episode:
      "第二集・初入宮門",

    location:
      "承露宮・正殿",

    title:
      "寧嬪",

    content: `

      你踏入正殿。

      <br><br>

      殿中燃著淡淡的沉香。

      <br><br>

      上首坐著一名年輕女子。

      <br><br>

      衣著並不張揚，

      神情甚至稱得上溫和。

      <br><br>

      她就是承露宮的主位。

      <br><br>

      <div class="story-speaker">

        寧嬪・蘇婉容

      </div>

      <br>

      「起來吧。」

      <br><br>

      「既入了承露宮，

      往後便是一家人。」

      <br><br>

      她端起茶盞，

      淡淡看了你一眼。

      <br><br>

      「妹妹初入宮中，

      可知道……」

      <br><br>

      <strong>
        在這宮裡，

        最要緊的是什麼？
      </strong>

    `,

    nextText:
      "回 答 寧 嬪",

    nextAction:
  renderEpisodeTwoNingPinChoice
  });

}

/* =====================================================
   第五幕
   寧嬪第一次試探
===================================================== */

function renderEpisodeTwoNingPinChoice() {

  setStoryProgress(
    2,
    "ep2_ningpin_first_test"
  );


  renderStoryScene({

    episode:
      "第二集・初入宮門",

    location:
      "承露宮・正殿",

    title:
      "話中有話",

    content: `

      寧嬪用杯蓋輕輕撥了撥茶沫。

      <br><br>

      她沒有立刻看你。

      <br><br>

      <div class="story-speaker">
        寧嬪・蘇婉容
      </div>

      <br>

      「妹妹今日才入宮，
      想必家中也教過不少規矩。」

      <br><br>

      她抬起眼。

      <br><br>

      「只是這宮裡的規矩，
      有時候和書上寫的，
      並不完全一樣。」

      <br><br>

      「妹妹以為，
      初入宮中最先該學會什麼？」

    `,

    choices: [

      {
        text:
          "「少說一句，總比說錯一句好。」",
        action:
          function () {

            changeRelationship(
              "寧嬪",
              1
            );

            applyStoryEffects({
              etiquette: 1
            });

            setStoryFlag(
              "ep2_first_answer_quiet",
              true
            );

            renderEpisodeTwoNingPinSecondTest(
              "quiet"
            );

          }
      },


      {
        text:
          "「先看清楚身邊的人，再決定該說什麼。」",
        action:
          function () {

            applyStoryEffects({
              alert: 1
            });

            setStoryFlag(
              "ep2_first_answer_observe",
              true
            );

            renderEpisodeTwoNingPinSecondTest(
              "observe"
            );

          }
      },


      {
        text:
          "「規矩自然要學，只怕有人並不按規矩辦事。」",
        action:
          function () {

            changeRelationship(
              "寧嬪",
              -1
            );

            applyStoryEffects({
              alert: 2
            });

            setStoryFlag(
              "ep2_first_answer_sharp",
              true
            );

            renderEpisodeTwoNingPinSecondTest(
              "sharp"
            );

          }
      }

    ]

  });

}


/* =====================================================
   第六幕
   寧嬪第二次試探
===================================================== */

function renderEpisodeTwoNingPinSecondTest(
  firstChoice
) {

  setStoryProgress(
    2,
    "ep2_ningpin_second_test"
  );


  let opening = "";


  if (
    firstChoice === "quiet"
  ) {

    opening = `

      寧嬪輕輕點了一下頭。

      <br><br>

      「知道什麼時候閉嘴，
      的確能少惹不少麻煩。」

    `;

  }


  else if (
    firstChoice === "observe"
  ) {

    opening = `

      寧嬪看了你片刻。

      <br><br>

      「妹妹倒不像第一次進宮的人。」

    `;

  }


  else {

    opening = `

      寧嬪的指尖在杯沿停了一瞬。

      <br><br>

      她淡淡笑了。

      <br><br>

      「妹妹說話很直。」

    `;

  }


  renderStoryScene({

    episode:
      "第二集・初入宮門",

    location:
      "承露宮・正殿",

    title:
      "好意",

    content: `

      ${opening}

      <br><br>

      她將茶盞放回桌上。

      <br><br>

      <div class="story-speaker">
        寧嬪・蘇婉容
      </div>

      <br>

      「那若有一個素不相識的人，
      才見妹妹第一面，
      便處處替妹妹著想……」

      <br><br>

      「妹妹會如何？」

    `,

    choices: [

      {
        text:
          "「旁人既有好意，我自然先領情。」",
        action:
          function () {

            changeRelationship(
              "寧嬪",
              1
            );

            setStoryFlag(
              "ep2_kindness_accept",
              true
            );

            renderEpisodeTwoNingPinFinal(
              "accept"
            );

          }
      },


      {
        text:
          "「情可以領，但欠下的人情總有一天要還。」",
        action:
          function () {

            applyStoryEffects({
              alert: 1
            });

            setStoryFlag(
              "ep2_kindness_debt",
              true
            );

            renderEpisodeTwoNingPinFinal(
              "debt"
            );

          }
      },


      {
        text:
          "「無緣無故的好，我不敢收得太快。」",
        action:
          function () {

            changeRelationship(
              "寧嬪",
              1
            );

            applyStoryEffects({
              alert: 1
            });

            setStoryFlag(
              "ep2_kindness_suspicious",
              true
            );

            renderEpisodeTwoNingPinFinal(
              "suspicious"
            );

          }
      }

    ]

  });

}


/* =====================================================
   第七幕
   寧嬪結束談話
===================================================== */

function renderEpisodeTwoNingPinFinal(
  secondChoice
) {

  setStoryProgress(
    2,
    "ep2_ningpin_final"
  );


  let reaction = "";


  if (
    secondChoice === "accept"
  ) {

    reaction = `

      寧嬪低頭喝了一口茶。

      <br><br>

      「宮裡有人願意幫你，
      的確不是壞事。」

      <br><br>

      她說得很平靜。

      <br><br>

      你卻總覺得，
      這句話似乎還有下一層意思。

    `;

  }


  else if (
    secondChoice === "debt"
  ) {

    reaction = `

      寧嬪笑了笑。

      <br><br>

      「妹妹倒是算得清楚。」

      <br><br>

      她沒有說這是好，
      也沒有說不好。

    `;

  }


  else {

    reaction = `

      寧嬪第一次真正露出笑意。

      <br><br>

      「謹慎些也好。」

      <br><br>

      「只是人在宮裡，
      有時候連拒絕別人的好意，
      也是要付代價的。」

    `;

  }


  renderStoryScene({

    episode:
      "第二集・初入宮門",

    location:
      "承露宮・正殿",

    title:
      "告退",

    content: `

      ${reaction}

      <br><br>

      殿內安靜了一會兒。

      <br><br>

      寧嬪終於擺了擺手。

      <br><br>

      <div class="story-speaker">
        寧嬪・蘇婉容
      </div>

      <br>

      「今日也累了。」

      <br><br>

      「先回去安置吧。」

      <br><br>

      你行禮告退。

      <br><br>

      直到走出正殿，
      你才發現自己的掌心微微出了汗。

      <br><br>

      方才那些話究竟只是閒談，

      還是在試你，

      你現在還無法確定。

    `,

    nextText:
      "離 開 正 殿",

    nextAction:
      renderEpisodeTwoMeetShen

  });

}


/* =====================================================
   第八幕
   初遇沈常在
===================================================== */

function renderEpisodeTwoMeetShen() {

  setStoryProgress(
    2,
    "ep2_meet_shen"
  );


  renderStoryScene({

    episode:
      "第二集・初入宮門",

    location:
      "承露宮・廊下",

    title:
      "同批新人",

    content: `

      才走出正殿不遠，

      身後忽然傳來女子的聲音。

      <br><br>

      「姐姐留步。」

      <br><br>

      你回過頭。

      <br><br>

      說話的是今日與你同批入宮的新人。

      <br><br>

      <div class="story-speaker">
        沈常在・沈知意
      </div>

      <br>

      她快步走到你身旁，

      臉上的笑意十分自然。

      <br><br>

      「方才在正殿裡，
      我都不敢抬頭。」

      <br><br>

      「姐姐倒是很鎮定。」

      <br><br>

      她稍稍靠近了一些。

      <br><br>

      「寧嬪娘娘……
      沒有為難姐姐吧？」

    `,

    choices: [

      {
        text:
          "「娘娘只是問了幾句家常。」",
        action:
          function () {

            changeRelationship(
              "沈知意",
              1
            );

            setStoryFlag(
              "ep2_shen_answer_vague",
              true
            );

            renderEpisodeTwoShenResponse(
              "vague"
            );

          }
      },


      {
        text:
          "「妹妹怎麼這麼關心娘娘問了什麼？」",
        action:
          function () {

            applyStoryEffects({
              alert: 1
            });

            setStoryFlag(
              "ep2_shen_answer_probe",
              true
            );

            renderEpisodeTwoShenResponse(
              "probe"
            );

          }
      },


      {
        text:
          "只笑了笑，沒有回答。",
        action:
          function () {

            setStoryFlag(
              "ep2_shen_answer_silent",
              true
            );

            renderEpisodeTwoShenResponse(
              "silent"
            );

          }
      }

    ]

  });

}


/* =====================================================
   沈常在反應
===================================================== */

function renderEpisodeTwoShenResponse(
  type
) {

  let response = "";


  if (
    type === "vague"
  ) {

    response = `

      沈知意似乎鬆了一口氣。

      <br><br>

      「那就好。」

      <br><br>

      「我還怕娘娘會問些難答的話。」

    `;

  }


  else if (
    type === "probe"
  ) {

    response = `

      沈知意怔了一下。

      <br><br>

      很快又笑起來。

      <br><br>

      「姐姐多心了。」

      <br><br>

      「同一日入宮，
      我只是想彼此有個照應。」

    `;

  }


  else {

    response = `

      你沒有接話。

      <br><br>

      沈知意臉上的笑容停了片刻，

      隨即又若無其事地聊起別的。

    `;

  }


  renderStoryScene({

    episode:
      "第二集・初入宮門",

    location:
      "承露宮・廊下",

    title:
      "一句邀約",

    content: `

      ${response}

      <br><br>

      快到岔路時，

      沈知意忽然壓低了聲音。

      <br><br>

      <div class="story-speaker">
        沈常在・沈知意
      </div>

      <br>

      「姐姐若今晚還沒睡……」

      <br><br>

      「亥時，
      我在後院等你。」

      <br><br>

      她沒有解釋要做什麼。

      <br><br>

      說完便向你行了一禮，

      轉身離開。

      <br><br>

      你站在原地，

      看著她的背影消失在轉角。

    `,

    nextText:
      "回 到 住 處",

    nextAction:
      function () {

        alert(
          "下一幕：入宮第一夜"
        );

      }

  });

}

/* =====================================================
   對外提供
===================================================== */

window.enterEpisodeTwo =
  enterEpisodeTwo;

window.renderEpisodeTwoOpening =
  renderEpisodeTwoOpening;