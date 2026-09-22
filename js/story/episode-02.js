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
      function () {

        alert(
          "下一步：寧嬪的三個回答選項"
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