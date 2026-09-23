/* =====================================================
   後宮生還錄
   第三集・栽贓
===================================================== */

const EPISODE_THREE_IMAGES = {
  morning: "images/scene-ep03-01-morning.png",
  room: "images/scene-ep03-02-room.png",
  ningpin: "images/scene-ep03-03-ningpin-hall.png",
  shen: "images/scene-ep03-04-shen-corridor.png",
  xiaoshunzi: "images/scene-ep03-05-xiaoshunzi-west-gate.png",
  ending: "images/scene-ep03-06-ending.png",
  expelled: "images/scene-ep03-07-expelled.png",
  death: "images/scene-ep03-08-death.png"
};

const EPISODE_THREE_EVIDENCE = {
  powder: "ep03-strange-powder",
  cord: "ep03-palace-cord",
  note: "ep03-torn-note",
  incenseClue: "ep03-incense-clue",
  shadowClue: "ep03-shadow-clue",
  suspiciousMaid: "ep03-suspicious-maid-reaction"
};

function ep3Clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function ep3GetNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function ep3SetProgress(step) {
  gameState.currentEpisode = 3;
  gameState.storyStep = step;

  if (typeof setStoryProgress === "function") {
    setStoryProgress(3, step);
  }

  if (typeof saveGame === "function") {
    saveGame();
  }
}

function renderEpisodeThreeScene(config = {}) {
  ep3SetProgress(config.step || "episode3");

  renderStoryScene({
    episode: "第三集・栽贓",
    location: config.location || "承露宮",
    title: config.title || "",
    speaker: config.speaker || "",
    image: config.image || EPISODE_THREE_IMAGES.room,
    imagePosition: config.imagePosition || "center",
    content: config.content || "",
    choices: config.choices || [],
    nextText: config.nextText || "",
    nextAction: config.nextAction || null
  });
}

function ensureEpisodeThreeState() {
  if (!gameState.episodeThree) {
    gameState.episodeThree = {};
  }

  const defaults = {
    started: false,
    helper: null,
    defense: null,
    outcome: null,
    accusationItem: "御賜赤金鳳紋耳墜",
    helperStrength: 0,
    defenseStrength: 0,
    characterModifiers: null
  };

  Object.keys(defaults).forEach(function (key) {
    if (gameState.episodeThree[key] === undefined) {
      gameState.episodeThree[key] = defaults[key];
    }
  });
}

function enterEpisodeThree() {
  ensureEpisodeThreeState();

  gameState.screen = "episode3";
  gameState.currentEpisode = 3;
  gameState.status = "alive";
  gameState.episodeThree.started = true;

  if (typeof saveGame === "function") {
    saveGame();
  }

  renderEpisodeThreeOpening();
}

function getEpisodeThreeOpeningData() {
  const route = gameState.episodeTwoNightRoute || "";

  if (route === "hairpin") {
    return {
      flag: "ep03_opening_hairpin",
      text: `
        天才剛亮，青禾便匆匆進了屋。
        <br><br>
        「小主，昨夜那件東西……奴婢總覺得不對。」
        <br><br>
        她壓低聲音。
        <br><br>
        「內務府的人今早竟說，從未有人奉命送過那樣的物件。」
      `
    };
  }

  if (route === "shen") {
    return {
      flag: "ep03_opening_shen",
      text: `
        清晨請安前，你在廊下又見到了沈知意。
        <br><br>
        她神色如常，彷彿昨夜從未與你說過任何話。
        <br><br>
        四目相接的一瞬，她只輕輕移開目光。
        <br><br>
        你忽然明白，在宮裡，知道太多和說得太多從來不是一回事。
      `
    };
  }

  if (route === "xiaoshunzi") {
    return {
      flag: "ep03_opening_xiaoshunzi",
      text: `
        一早，小順子借著送水從門前經過。
        <br><br>
        他沒有停步，只在擦肩時極輕地說了一句：
        <br><br>
        「昨夜西側小門，空了一刻鐘。」
        <br><br>
        說完便若無其事地離開。
      `
    };
  }

  return {
    flag: "ep03_opening_observe",
    text: `
      清晨，青禾在窗外拾到了一小段斷裂的宮絛。
      <br><br>
      她拿給你看時，臉色有些發白。
      <br><br>
      「小主，昨夜門外……恐怕真的有人。」
      <br><br>
      你還來不及細問，院外已傳來一陣急促的腳步聲。
    `
  };
}

function renderEpisodeThreeOpening() {
  ensureEpisodeThreeState();

  const opening = getEpisodeThreeOpeningData();

  if (typeof setStoryFlag === "function") {
    setStoryFlag(opening.flag, true);
  }

  calculateEpisodeThreeCharacterStrength();

  const special =
    gameState.episodeThree.characterModifiers?.special || {};

  let extraContent = "";

  if (
    opening.flag === "ep03_opening_observe" &&
    special.canRecallFigure === true
  ) {
    if (!hasInventoryItem(EPISODE_THREE_EVIDENCE.shadowClue)) {
      addEvidence({
        id: EPISODE_THREE_EVIDENCE.shadowClue,
        name: "可疑人影特徵",
        description:
          "你回想起昨夜門外人影的身形與步態，對方身量偏瘦，走路時右肩略低，衣角似乎繡著承露宮宮人的暗紋。",
        sourceEpisode: 3,
        source: "第三集・清晨回憶",
        metadata: {
          truth: true,
          evidenceStrength: 3,
          clueType: "suspect_appearance",
          persistent: true
        }
      });
    }

    if (typeof setStoryFlag === "function") {
      setStoryFlag("ep03_remembered_shadow", true);
    }

    extraContent = `
      <br><br>
      你盯著那段宮絛，腦中忽然浮現昨夜那道人影。
      <br><br>
      身量偏瘦，走路時右肩似乎比左肩略低。
      <br><br>
      更重要的是，那人衣角上的紋樣……你記得自己見過。
    `;
  }

  renderEpisodeThreeScene({
    step: "ep3_opening",
    location: "承露宮・清晨",
    title: "宮中第一晨",
    speaker: "青禾",
    image: EPISODE_THREE_IMAGES.morning,
    content: `${opening.text}${extraContent}`,
    nextText: "出門請安",
    nextAction: renderEpisodeThreeMorningSummons
  });
}

function renderEpisodeThreeMorningSummons() {
  renderEpisodeThreeScene({
    step: "ep3_summons",
    location: "承露宮",
    title: "突來的命令",
    speaker: "掌事宮女",
    image: EPISODE_THREE_IMAGES.ningpin,
    content: `
      你才走出房門，正殿方向忽然傳來一陣騷動。
      <br><br>
      數名宮女與太監分頭進入各處偏殿。
      <br><br>
      「寧嬪娘娘有令。」
      <br><br>
      「昨夜宮中遺失御賜之物，承露宮上下即刻搜查。」
      <br><br>
      青禾下意識看了你一眼。
    `,
    nextText: "回房查看",
    nextAction: renderEpisodeThreeAccusation
  });
}

function renderEpisodeThreeAccusation() {
  ensureEpisodeThreeState();

  renderEpisodeThreeScene({
    step: "ep3_accused",
    location: "承露宮・你的住處",
    title: "贓物",
    speaker: "掌事宮女",
    image: EPISODE_THREE_IMAGES.room,
    content: `
      搜查並沒有持續太久。
      <br><br>
      一名宮女從床榻內側摸出一只赤金耳墜。
      <br><br>
      鳳紋細密，背面刻著御用印記。
      <br><br>
      屋內瞬間安靜。
      <br><br>
      「昨夜御前賞下的一對赤金鳳紋耳墜，少的正是這一只。」
      <br><br>
      青禾臉色煞白。
      <br><br>
      東西不屬於你。可它偏偏出現在你的房裡。
    `,
    nextText: "否認偷竊",
    nextAction: renderEpisodeThreeTemporaryRelease
  });
}

function renderEpisodeThreeTemporaryRelease() {
  renderEpisodeThreeScene({
    step: "ep3_before_search",
    location: "承露宮・正殿",
    title: "半個時辰",
    speaker: "寧嬪・蘇婉容",
    image: EPISODE_THREE_IMAGES.ningpin,
    content: `
      寧嬪端坐上首，目光在你身上停了許久。
      <br><br>
      「東西是在你房中搜出的。」
      <br><br>
      「但本宮不喜歡糊塗案。」
      <br><br>
      她放下茶盞。
      <br><br>
      「給你半個時辰。」
      <br><br>
      「若你真是清白的，就拿出能讓本宮信你的東西。」
      <br><br>
      你被送回房中。青禾告訴你，真正能自由行動的時間，恐怕只夠做三件事。
    `,
    nextText: "開始搜證",
    nextAction: startEpisodeThreeInvestigation
  });
}

function startEpisodeThreeInvestigation() {
  ep3SetProgress("ep3_investigation");

  startInvestigation({
    id: "episode-three-room-search",

    title: "承露宮・搜證",

    subtitle: "你只有三次行動。不是每一條線索都是真的。",

    image: EPISODE_THREE_IMAGES.room,

    maxActions: 3,

    canEndEarly: true,

    locations: [
      {
        id: "ep03-dressing-box",

        label: "妝匣",

        x: 16,
        y: 33,

        title: "妝匣底層",

        text:
          "妝匣底層沾著一點陌生香粉。青禾確認，這不是你平日使用的香料。",

        reward: {
          type: "evidence",

          item: {
            id: EPISODE_THREE_EVIDENCE.powder,

            name: "陌生香粉",

            description:
              "從妝匣底部找到的香粉，不屬於你與青禾。",

            sourceEpisode: 3,

            source: "第三集・房內搜證",

            metadata: {
              truth: true,
              evidenceStrength: 1
            }
          }
        }
      },

      {
        id: "ep03-window",

        label: "窗邊",

        x: 14,
        y: 21,

        title: "窗框縫隙",

        text:
          "窗框有一道新鮮擦痕，木縫中還卡著一小截宮絛纖維。",

        reward: {
          type: "evidence",

          item: {
            id: EPISODE_THREE_EVIDENCE.cord,

            name: "宮絛碎線",

            description:
              "卡在窗框縫隙中的宮絛碎線，可能是有人翻窗時留下。",

            sourceEpisode: 3,

            source: "第三集・房內搜證",

            metadata: {
              truth: true,
              evidenceStrength: 2
            }
          }
        }
      },

      {
        id: "ep03-bed",

        label: "床榻",

        x: 82,
        y: 34,

        title: "枕下紙片",

        text:
          "枕下壓著半張紙，上面只剩幾個模糊的字。它出現得實在太巧。",

        reward: {
          type: "evidence",

          item: {
            id: EPISODE_THREE_EVIDENCE.note,

            name: "殘缺紙條",

            description:
              "藏在枕下的半張紙條，真假暫時無法判斷。",

            sourceEpisode: 3,

            source: "第三集・房內搜證",

            metadata: {
              truth: false,
              evidenceStrength: -1,
              reliability: "unknown"
            }
          }
        }
      },

      {
        id: "ep03-wardrobe",

        label: "衣櫃",

        x: 48,
        y: 28,

        title: "被重新整理的衣物",

        text:
          "最上層衣物的折法與青禾平常完全不同。有人曾動過你的衣櫃。",

        reward: {
          type: "story_flag",

          key: "ep03_wardrobe_disturbed",

          value: true
        }
      },

      {
        id: "ep03-incense",

        label: "香爐",

        x: 65,
        y: 49,

        title: "冷掉的香灰",

        text:
          "香灰已冷，沒有留下能辨認的痕跡。你浪費了一次寶貴的時間。"
      }
    ],

    onComplete: function () {
      renderEpisodeThreeChooseHelper();
    }
  });
}

function renderEpisodeThreeChooseHelper() {
  renderEpisodeThreeScene({
    step: "ep3_choose_helper",
    location: "承露宮・偏殿",
    title: "只能找一個人",
    speaker: "青禾",
    image: EPISODE_THREE_IMAGES.room,
    content: `
      「小主，時間不多了。」
      <br><br>
      青禾望向門外。
      <br><br>
      「現在若要找人幫忙，只來得及找一個。」
      <br><br>
      在宮裡求人，本身就是一場下注。
    `,
    choices: [
      {
        text: "讓青禾替你查",
        action: function () {
          handleEpisodeThreeHelper("qinghe");
        }
      },
      {
        text: "找小順子打聽消息",
        action: function () {
          handleEpisodeThreeHelper("xiaoshunzi");
        }
      },
      {
        text: "去找沈知意",
        action: function () {
          handleEpisodeThreeHelper("shen");
        }
      }
    ]
  });
}

function handleEpisodeThreeHelper(helper) {
  ensureEpisodeThreeState();

  gameState.episodeThree.helper = helper;

  const nightRoute = gameState.episodeTwoNightRoute || "";

  if (helper === "qinghe") {
    let strength = 1;

    if (
      typeof getStoryFlag === "function" &&
      getStoryFlag("ep03_wardrobe_disturbed")
    ) {
      strength += 1;
    }

    gameState.episodeThree.helperStrength = strength;

    renderEpisodeThreeScene({
      step: "ep3_helper_qinghe",
      location: "承露宮・偏殿",
      title: "青禾的證詞",
      speaker: "青禾",
      image: EPISODE_THREE_IMAGES.room,
      content: `
        青禾很快回來。
        <br><br>
        「奴婢問過值夜的小宮女。」
        <br><br>
        「昨夜確實有人來過這一帶，只是她不敢說看清了是誰。」
        <br><br>
        ${
          strength >= 2
            ? `
              她又看向衣櫃。
              <br><br>
              「而且那些衣服不是奴婢折的。奴婢敢當面作證。」
            `
            : `
              這條消息並不足以直接洗清嫌疑，但至少證明昨夜並不平靜。
            `
        }
      `,
      nextText: "前往正殿",
      nextAction: renderEpisodeThreeHearing
    });

    return;
  }

  if (helper === "xiaoshunzi") {
    const strength = nightRoute === "xiaoshunzi" ? 3 : 1;
    gameState.episodeThree.helperStrength = strength;

    renderEpisodeThreeScene({
      step: "ep3_helper_xiaoshunzi",
      location: "承露宮・側廊",
      title: "西側小門",
      speaker: "小順子",
      image: EPISODE_THREE_IMAGES.xiaoshunzi,
      content: `
        小順子沉默了片刻，左右看了一眼。
        <br><br>
        ${
          strength >= 3
            ? `
              「昨夜奴才跟您說過，西側小門空了一刻鐘。」
              <br><br>
              「奴才又查了一下，那段時間確實有人從內務府方向過來。」
              <br><br>
              「只是再往下問，怕是有人就要知道奴才多嘴了。」
            `
            : `
              「西側小門昨夜確實有過空檔。」
              <br><br>
              「可奴才只能替您查到這裡，再深就要惹禍了。」
            `
        }
      `,
      nextText: "前往正殿",
      nextAction: renderEpisodeThreeHearing
    });

    return;
  }

  const shenStrength = nightRoute === "shen" ? 3 : 0;
  gameState.episodeThree.helperStrength = shenStrength;

  renderEpisodeThreeScene({
    step: "ep3_helper_shen",
    location: "承露宮・廊下",
    title: "沈知意的選擇",
    speaker: "沈知意",
    image: EPISODE_THREE_IMAGES.shen,
    content:
      shenStrength >= 3
        ? `
          沈知意聽完沒有立刻回答。
          <br><br>
          許久，她才低聲道：
          <br><br>
          「昨夜我確實曾看見一道人影從你那邊離開。」
          <br><br>
          「到了正殿，我可以說。」
          <br><br>
          她願意替你作證。
        `
        : `
          沈知意聽完，神色微微一變。
          <br><br>
          「這件事太大了。」
          <br><br>
          「我沒有親眼看見誰把東西放進你的房裡。」
          <br><br>
          她沒有答應替你作證。
        `,
    nextText: "前往正殿",
    nextAction: renderEpisodeThreeHearing
  });
}

function ep3GetCharacterTrait(key) {
  if (typeof playerData === "undefined" || !playerData) {
    return "";
  }

  const value = playerData[key];

  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "object") {
    return value.name || value.label || value.value || "";
  }

  return String(value);
}

function ep3TraitIs(value, list) {
  return Array.isArray(list) && list.includes(value);
}

function calculateEpisodeThreeCharacterStrength() {
  ensureEpisodeThreeState();

  const family = ep3GetCharacterTrait("family");
  const talent = ep3GetCharacterTrait("talent");
  const personality = ep3GetCharacterTrait("personality");
  const weakness = ep3GetCharacterTrait("weakness");
  const hiddenTrait = ep3GetCharacterTrait("hiddenTrait");

  const modifiers = {
    family: 0,
    talent: 0,
    personality: 0,
    weakness: 0,
    hiddenTrait: 0,
    status: 0,
    rawTotal: 0,
    total: 0,
    special: {
      canReadPowder: false,
      canRecallFigure: false,
      canReadPeople: false,
      canBluff: false,
      politicalProtection: false,
      secretProtection: false
    }
  };

  if (family === "正四品官員之女") {
    modifiers.family += 2;
    modifiers.special.politicalProtection = true;
  } else if (
    ep3TraitIs(family, [
      "正五品官員之女",
      "翰林院官員之女",
      "禮部官員之女",
      "戶部官員之女",
      "武官之家",
      "將門之女",
      "太醫世家",
      "皇商旁支"
    ])
  ) {
    modifiers.family += 1;
    modifiers.special.politicalProtection = true;
  } else if (
    ep3TraitIs(family, [
      "沒落官宦之家",
      "小官庶女",
      "官宦繼女",
      "孤女寄居親族"
    ])
  ) {
    modifiers.family -= 1;
  }

  if (
    ep3TraitIs(talent, [
      "察言觀色",
      "心思縝密",
      "臨危不亂"
    ])
  ) {
    modifiers.talent += 2;
  } else if (
    ep3TraitIs(talent, [
      "過目不忘",
      "善於交際",
      "沉著冷靜",
      "天生好運",
      "記人極準",
      "辨味敏銳",
      "善於說謊",
      "識人有術",
      "天生親和"
    ])
  ) {
    modifiers.talent += 1;
  }

  if (ep3TraitIs(talent, ["精通香料", "辨味敏銳"])) {
    modifiers.special.canReadPowder = true;

    if (hasInventoryItem(EPISODE_THREE_EVIDENCE.powder)) {
      modifiers.talent += 1;
    }
  }

  if (ep3TraitIs(talent, ["過目不忘", "記人極準"])) {
    modifiers.special.canRecallFigure = true;

    if (
      typeof getStoryFlag === "function" &&
      getStoryFlag("ep03_opening_observe")
    ) {
      modifiers.talent += 1;
    }
  }

  if (ep3TraitIs(talent, ["察言觀色", "識人有術"])) {
    modifiers.special.canReadPeople = true;
  }

  if (talent === "善於說謊") {
    modifiers.special.canBluff = true;
  }

  if (
    ep3TraitIs(personality, [
      "謹慎",
      "聰慧",
      "八面玲瓏",
      "外柔內剛",
      "冷靜理性",
      "城府深"
    ])
  ) {
    modifiers.personality += 1;
  }

  if (ep3TraitIs(personality, ["天真", "愛冒險"])) {
    modifiers.personality -= 1;
  }

  if (ep3TraitIs(weakness, ["容易緊張", "不會說謊"])) {
    modifiers.weakness -= 2;
  } else if (
    ep3TraitIs(weakness, [
      "衝動",
      "輕信他人",
      "怕事",
      "過度善良",
      "愛面子",
      "自尊心強"
    ])
  ) {
    modifiers.weakness -= 1;
  }

  if (weakness === "多疑") {
    modifiers.weakness += 1;
  }

  if (hiddenTrait === "神秘貴人相助") {
    modifiers.hiddenTrait += 3;
    modifiers.special.secretProtection = true;
  } else if (
    ep3TraitIs(hiddenTrait, [
      "皇帝曾見過你",
      "太后舊識之後",
      "宮中有人認識你"
    ])
  ) {
    modifiers.hiddenTrait += 2;
    modifiers.special.secretProtection = true;
  } else if (
    ep3TraitIs(hiddenTrait, [
      "命格極貴",
      "鳳命傳聞",
      "被秘密監視"
    ])
  ) {
    modifiers.hiddenTrait += 1;
  } else if (
    ep3TraitIs(hiddenTrait, ["克主之命", "不祥傳聞纏身"])
  ) {
    modifiers.hiddenTrait -= 2;
  } else if (
    ep3TraitIs(hiddenTrait, [
      "家族藏有秘密",
      "身世存疑",
      "與某秀女有舊怨"
    ])
  ) {
    modifiers.hiddenTrait -= 1;
  }

  if (hiddenTrait === "天生識香") {
    modifiers.special.canReadPowder = true;

    if (hasInventoryItem(EPISODE_THREE_EVIDENCE.powder)) {
      modifiers.hiddenTrait += 2;
    }
  }

  const alertValue = ep3GetNumber(playerData.alert);
  const etiquetteValue = ep3GetNumber(playerData.etiquette);

  if (alertValue >= 2) modifiers.status += 1;
  if (alertValue <= -2) modifiers.status -= 1;
  if (etiquetteValue >= 2) modifiers.status += 1;
  if (etiquetteValue <= -2) modifiers.status -= 1;

  modifiers.rawTotal =
    modifiers.family +
    modifiers.talent +
    modifiers.personality +
    modifiers.weakness +
    modifiers.hiddenTrait +
    modifiers.status;

  modifiers.total = ep3Clamp(modifiers.rawTotal, -3, 4);

  gameState.episodeThree.characterModifiers = modifiers;

  return modifiers.total;
}

function getEpisodeThreeDefenseChoices() {
  calculateEpisodeThreeCharacterStrength();

  const special =
    gameState.episodeThree.characterModifiers?.special || {};

  const choices = [];

  if (special.canReadPeople === true) {
    choices.push({
      text: "先觀察殿內眾人的反應",
      action: function () {
        resolveEpisodeThreeDefense("read_people", 3);
      }
    });
  }

  if (hasInventoryItem(EPISODE_THREE_EVIDENCE.cord)) {
    choices.push({
      text: "出示宮絛碎線",
      action: function () {
        resolveEpisodeThreeDefense("cord", 3);
      }
    });
  }

  if (hasInventoryItem(EPISODE_THREE_EVIDENCE.powder)) {
    if (special.canReadPowder === true) {
      choices.push({
        text: "仔細辨認陌生香粉",
        action: function () {
          resolveEpisodeThreeDefense("powder", 4);
        }
      });
    } else {
      choices.push({
        text: "出示陌生香粉",
        action: function () {
          resolveEpisodeThreeDefense("powder", 2);
        }
      });
    }
  }

  if (
    typeof getStoryFlag === "function" &&
    getStoryFlag("ep03_wardrobe_disturbed")
  ) {
    choices.push({
      text: "指出衣物曾被人動過",
      action: function () {
        resolveEpisodeThreeDefense("wardrobe", 2);
      }
    });
  }

  if (
    gameState.episodeThree.helper === "xiaoshunzi" &&
    gameState.episodeThree.helperStrength >= 2
  ) {
    choices.push({
      text: "提及西側小門的異常",
      action: function () {
        resolveEpisodeThreeDefense("xiaoshunzi", 3);
      }
    });
  }

  if (
    gameState.episodeThree.helper === "shen" &&
    gameState.episodeThree.helperStrength >= 2
  ) {
    choices.push({
      text: "請沈知意作證",
      action: function () {
        resolveEpisodeThreeDefense("shen", 3);
      }
    });
  }

  if (hasInventoryItem(EPISODE_THREE_EVIDENCE.note)) {
    choices.push({
      text: "把殘缺紙條當成證據",
      action: function () {
        resolveEpisodeThreeDefense("false_note", -2);
      }
    });
  }

  choices.push({
    text: "只求寧嬪徹查此事",
    action: function () {
      resolveEpisodeThreeDefense("request_investigation", 0);
    }
  });

  choices.push({
    text: "直接指認有人栽贓",
    action: function () {
      resolveEpisodeThreeDefense("accuse_unknown", -1);
    }
  });

  return choices;
}

function renderEpisodeThreeHearing() {
  renderEpisodeThreeScene({
    step: "ep3_hearing",
    location: "承露宮・正殿",
    title: "當面審問",
    speaker: "寧嬪・蘇婉容",
    image: EPISODE_THREE_IMAGES.ningpin,
    content: `
      寧嬪看著桌上的赤金鳳紋耳墜。
      <br><br>
      「東西是在你的房中找到。」
      <br><br>
      「本宮已經給過你時間。」
      <br><br>
      她抬眼看你。
      <br><br>
      「現在，你拿什麼證明自己是被人栽贓？」
    `,
    choices: getEpisodeThreeDefenseChoices()
  });
}

function resolveEpisodeThreeDefense(defense, strength) {
  ensureEpisodeThreeState();

  gameState.episodeThree.defense = defense;
  gameState.episodeThree.defenseStrength = strength;

  let response = "";

  if (defense === "read_people") {
    if (!hasInventoryItem(EPISODE_THREE_EVIDENCE.suspiciousMaid)) {
      addEvidence({
        id: EPISODE_THREE_EVIDENCE.suspiciousMaid,
        name: "可疑宮女反應",
        description:
          "審問時，你注意到站在寧嬪右後方的一名宮女，在提及搜宮與陌生香粉時明顯緊張，並下意識避開你的目光。",
        sourceEpisode: 3,
        source: "第三集・察言觀色",
        metadata: {
          truth: true,
          evidenceStrength: 3,
          clueType: "suspect_reaction",
          persistent: true
        }
      });
    }

    if (typeof setStoryFlag === "function") {
      setStoryFlag("ep03_spotted_suspicious_maid", true);
    }

    response = `
      你沒有急著開口。
      <br><br>
      反而趁所有人的注意力都在那只耳墜上時，悄悄掃過殿內每一張臉。
      <br><br>
      寧嬪神色冷靜，沈知意低著眼。
      <br><br>
      可站在寧嬪右後方的一名宮女，在聽見「搜宮」二字時，手指忽然收緊。
      <br><br>
      當有人提到香粉，她更是下意識避開了你的目光。
      <br><br>
      那反應只有一瞬，但你看見了。
    `;
  } else if (defense === "cord") {
    response = `
      你將宮絛碎線呈上。
      <br><br>
      「這是在窗框裡找到的。」
      <br><br>
      「若昨夜無人進過我的房間，這東西不該出現在那裡。」
      <br><br>
      寧嬪沒有立刻說話，只命人收下細看。
    `;
  } else if (defense === "powder") {
    calculateEpisodeThreeCharacterStrength();

    const special =
      gameState.episodeThree.characterModifiers?.special || {};

    if (special.canReadPowder === true) {
      if (!hasInventoryItem(EPISODE_THREE_EVIDENCE.incenseClue)) {
        addEvidence({
          id: EPISODE_THREE_EVIDENCE.incenseClue,
          name: "沉水香粉來源線索",
          description:
            "你辨認出陌生香粉中混有沉水香與蘭麝，這種配法並非常見宮香，可能來自特定宮室。",
          sourceEpisode: 3,
          source: "第三集・審問辨香",
          metadata: {
            truth: true,
            evidenceStrength: 3,
            clueType: "incense_origin",
            persistent: true
          }
        });
      }

      if (typeof setStoryFlag === "function") {
        setStoryFlag("ep03_identified_powder", true);
      }

      response = `
        你沒有立刻將香粉呈上，而是用指尖輕輕捻開，仔細辨認其中氣味。
        <br><br>
        「這不是普通香粉。」
        <br><br>
        「其中混了沉水香與蘭麝，這種配法並非常見。」
        <br><br>
        正殿內安靜了一瞬。
        <br><br>
        寧嬪微微抬眼。
        <br><br>
        「你認得？」
        <br><br>
        你將香粉呈上。這一次，它不再只是一團來歷不明的粉末，它有了可以追查的來源。
      `;
    } else {
      response = `
        你呈上妝匣裡找到的陌生香粉。
        <br><br>
        青禾當眾確認，這並不是你平日使用的東西。
        <br><br>
        寧嬪命人將香粉收下。
        <br><br>
        它或許能證明有人進過你的房間，卻暫時無法指出那個人是誰。
      `;
    }
  } else if (defense === "wardrobe") {
    response = `
      你指出衣櫃曾被人重新整理。
      <br><br>
      青禾跪下作證，那些衣物並非她所折。
      <br><br>
      這不足以指出兇手，卻證明有人曾動過你的房間。
    `;
  } else if (defense === "xiaoshunzi") {
    response = `
      你沒有直接說出小順子的名字，只說昨夜西側小門曾有異常。
      <br><br>
      寧嬪立刻命人去查值夜名冊。
      <br><br>
      正殿裡第一次出現了真正的騷動。
    `;
  } else if (defense === "shen") {
    response = `
      沈知意被喚上前。
      <br><br>
      她沉默片刻，終於承認昨夜曾見到一道人影從你住處附近離開。
      <br><br>
      雖然沒有看清面容，至少你的話不再只是空口辯解。
    `;
  } else if (defense === "false_note") {
    response = `
      你將殘缺紙條呈了上去。
      <br><br>
      寧嬪只看了一眼，便命掌事宮女拿近燭火。
      <br><br>
      紙墨竟是承露宮今日清晨才換上的新墨。
      <br><br>
      這張紙根本不可能在昨夜留下。
      <br><br>
      你選錯了證據。
    `;
  } else if (defense === "accuse_unknown") {
    response = `
      「有人栽贓臣妾。」
      <br><br>
      寧嬪淡淡問道：「誰？」
      <br><br>
      你答不出名字。
      <br><br>
      正殿裡重新安靜下來。
    `;
  } else {
    response = `
      你沒有貿然指認任何人。
      <br><br>
      只請寧嬪徹查昨夜出入承露宮的人。
      <br><br>
      寧嬪看了你許久，沒有表示相信，也沒有立刻定罪。
    `;
  }

  renderEpisodeThreeScene({
    step: "ep3_defense_result",
    location: "承露宮・正殿",
    title: "你的辯解",
    speaker: "寧嬪・蘇婉容",
    image: EPISODE_THREE_IMAGES.ningpin,
    content: response,
    nextText: "等待裁決",
    nextAction: determineEpisodeThreeOutcome
  });
}

function calculateEpisodeThreeEvidenceStrength() {
  let score = 0;

  if (hasInventoryItem(EPISODE_THREE_EVIDENCE.cord)) {
    score += 2;
  }

  if (hasInventoryItem(EPISODE_THREE_EVIDENCE.powder)) {
    score += 1;
  }

  if (
    typeof getStoryFlag === "function" &&
    getStoryFlag("ep03_wardrobe_disturbed")
  ) {
    score += 1;
  }

  if (hasInventoryItem(EPISODE_THREE_EVIDENCE.incenseClue)) {
    score += 2;
  }

  if (hasInventoryItem(EPISODE_THREE_EVIDENCE.shadowClue)) {
    score += 2;
  }

  if (hasInventoryItem(EPISODE_THREE_EVIDENCE.suspiciousMaid)) {
    score += 2;
  }

  return score;
}

function calculateEpisodeThreeOutcomeWeights() {
  ensureEpisodeThreeState();

  let expelled = 50;
  let death = 20;
  let survive = 30;

  const evidence = calculateEpisodeThreeEvidenceStrength();
  const helper = ep3GetNumber(gameState.episodeThree.helperStrength);
  const defense = ep3GetNumber(gameState.episodeThree.defenseStrength);
  const character = calculateEpisodeThreeCharacterStrength();

  const totalStrength = evidence + helper + defense + character;

  survive += totalStrength * 4;
  expelled -= totalStrength * 3;
  death -= totalStrength;

  if (gameState.episodeThree.defense === "false_note") {
    death += 12;
    survive -= 8;
    expelled -= 4;
  }

  if (gameState.episodeThree.defense === "accuse_unknown") {
    death += 5;
    survive -= 5;
  }

  expelled = ep3Clamp(expelled, 5, 85);
  death = ep3Clamp(death, 5, 65);
  survive = ep3Clamp(survive, 5, 85);

  return {
    expelled: expelled,
    death: death,
    survive: survive,
    totalStrength: totalStrength
  };
}

function rollEpisodeThreeOutcome(weights) {
  const total = weights.expelled + weights.death + weights.survive;
  const roll = Math.random() * total;

  if (roll < weights.expelled) {
    return "expelled";
  }

  if (roll < weights.expelled + weights.death) {
    return "death";
  }

  return "survive";
}

function determineEpisodeThreeOutcome() {
  const weights = calculateEpisodeThreeOutcomeWeights();

  console.log("第三集隱藏判定：", weights);

  const outcome = rollEpisodeThreeOutcome(weights);
  gameState.episodeThree.outcome = outcome;

  if (typeof setStoryFlag === "function") {
    setStoryFlag("episode3_outcome", outcome);
  }

  if (typeof saveGame === "function") {
    saveGame();
  }

  if (outcome === "expelled") {
    renderEpisodeThreeExpelled();
    return;
  }

  if (outcome === "death") {
    handleEpisodeThreeDeath();
    return;
  }

  renderEpisodeThreeSurvive();
}

function renderEpisodeThreeExpelled() {
  gameState.status = "expelled";

  if (typeof saveGame === "function") {
    saveGame();
  }

  renderEpisodeThreeScene({
    step: "ep3_ending_expelled",
    location: "宮門外",
    title: "蒙冤出宮",
    speaker: "",
    image: EPISODE_THREE_IMAGES.expelled,
    content: `
      最終沒有找到足以證明你偷竊的直接證據。
      <br><br>
      但也沒有足夠的證據洗清你的嫌疑。
      <br><br>
      為平息此事，你被褫去宮中身份，遣送出宮。
      <br><br>
      宮門在你身後緩緩關上。
      <br><br>
      只是這一次，你再也不是宮中的人了。
      <br><br>
      <strong>結局：蒙冤出宮</strong>
    `,
    nextText: "本局結束",
    nextAction: function () {
      console.log("第三集結局：蒙冤出宮");
    }
  });
}

function handleEpisodeThreeDeath() {
  const lifeSavingItems =
    typeof getLifeSavingItems === "function"
      ? getLifeSavingItems()
      : [];

  if (lifeSavingItems.length > 0) {
    renderEpisodeThreeLifeSavingChoice(lifeSavingItems[0]);
    return;
  }

  renderEpisodeThreeDeath();
}

function renderEpisodeThreeLifeSavingChoice(item) {
  renderEpisodeThreeScene({
    step: "ep3_life_saving_choice",
    location: "承露宮・正殿",
    title: "最後的保命機會",
    speaker: "",
    image: EPISODE_THREE_IMAGES.ningpin,
    content: `
      裁決已下。
      <br><br>
      你忽然想起，自己手中還有一件能改變結果的東西。
      <br><br>
      <strong>${item.name}</strong>
      <br><br>
      它或許能救你一命。
      <br><br>
      但一旦使用，就再也沒有了。
    `,
    choices: [
      {
        text: `使用【${item.name}】`,
        action: function () {
          const success = consumeLifeSavingItem(
            item.id,
            "第三集避免死亡"
          );

          if (success) {
            renderEpisodeThreeSavedByItem(item);
          } else {
            renderEpisodeThreeDeath();
          }
        }
      },
      {
        text: "不用，保留道具",
        action: renderEpisodeThreeDeath
      }
    ]
  });
}

function renderEpisodeThreeSavedByItem(item) {
  gameState.status = "alive";
  gameState.episodeThree.outcome = "saved_by_item";

  if (typeof setStoryFlag === "function") {
    setStoryFlag("episode3_saved_by_item", true);
  }

  if (typeof saveGame === "function") {
    saveGame();
  }

  renderEpisodeThreeScene({
    step: "ep3_saved_by_item",
    location: "宮中",
    title: "死罪得免",
    speaker: "",
    image: EPISODE_THREE_IMAGES.ending,
    content: `
      ${item.name}被呈到眾人面前。
      <br><br>
      原本已定下的死罪被迫收回。
      <br><br>
      你保住了命。
      <br><br>
      但保命不等於全身而退。
      <br><br>
      你被暫時幽禁，等待後續處置。
      <br><br>
      而那件珍貴的保命之物，也從此不再屬於你。
    `,
    nextText: "活下去",
    nextAction: function () {
      alert("保命成功。後續幽禁／冷宮線將在之後接續。");
    }
  });
}

function renderEpisodeThreeDeath() {
  gameState.status = "dead";

  if (typeof saveGame === "function") {
    saveGame();
  }

  renderEpisodeThreeScene({
    step: "ep3_ending_death",
    location: "深宮夜廊",
    title: "死局",
    speaker: "",
    image: EPISODE_THREE_IMAGES.death,
    content: `
      事情沒有因你的辯解停下。
      <br><br>
      一條又一條對你不利的說法被送進正殿。
      <br><br>
      最後，這場栽贓被定成了你的罪。
      <br><br>
      深宮的夜依舊漫長。
      <br><br>
      你沒能等到真正的幕後之人露出破綻。
      <br><br>
      <strong>死亡結局：栽贓成罪</strong>
    `,
    nextText: "本局結束",
    nextAction: function () {
      console.log("第三集死亡結局");
    }
  });
}

function renderEpisodeThreeSurvive() {
  gameState.status = "alive";

  if (typeof setStoryFlag === "function") {
    setStoryFlag("episode3_survived", true);
  }

  if (typeof saveGame === "function") {
    saveGame();
  }

  renderEpisodeThreeScene({
    step: "ep3_ending_survive",
    location: "承露宮・正殿",
    title: "嫌疑暫解",
    speaker: "寧嬪・蘇婉容",
    image: EPISODE_THREE_IMAGES.ningpin,
    content: `
      寧嬪沉默許久。
      <br><br>
      「這件事還沒有查完。」
      <br><br>
      「但至少現在，本宮不能只憑那只耳墜定你的罪。」
      <br><br>
      你被准許回房。
      <br><br>
      走出正殿時，你第一次真正明白：
      <br><br>
      有人希望你離開這座宮城。
      <br>
      甚至希望你死。
      <br><br>
      而你至今還不知道，那個人是誰。
    `,
    nextText: "進入第四集",
    nextAction: function () {
      alert("第四集尚未開始製作");
    }
  });
}

function resetEpisodeThreeForTest() {
  const ids = [
    EPISODE_THREE_EVIDENCE.powder,
    EPISODE_THREE_EVIDENCE.cord,
    EPISODE_THREE_EVIDENCE.note,
    EPISODE_THREE_EVIDENCE.incenseClue,
    EPISODE_THREE_EVIDENCE.shadowClue,
    EPISODE_THREE_EVIDENCE.suspiciousMaid
  ];

  ids.forEach(function (id) {
    const item = getInventoryItem(id);

    if (item) {
      removeInventoryItem(
        id,
        item.quantity,
        "重置第三集測試"
      );
    }
  });

  gameState.episodeThree = {
    started: false,
    helper: null,
    defense: null,
    outcome: null,
    accusationItem: "御賜赤金鳳紋耳墜",
    helperStrength: 0,
    defenseStrength: 0,
    characterModifiers: null
  };

  if (typeof setStoryFlag === "function") {
    [
      "ep03_wardrobe_disturbed",
      "ep03_spotted_suspicious_maid",
      "ep03_identified_powder",
      "ep03_remembered_shadow",
      "ep03_opening_hairpin",
      "ep03_opening_shen",
      "ep03_opening_xiaoshunzi",
      "ep03_opening_observe",
      "episode3_survived",
      "episode3_saved_by_item"
    ].forEach(function (flag) {
      setStoryFlag(flag, false);
    });

    setStoryFlag("episode3_outcome", null);
  }

  gameState.status = "alive";

  if (typeof saveGame === "function") {
    saveGame();
  }
}

window.testEpisodeThree = function () {
  resetEpisodeThreeForTest();
  enterEpisodeThree();
};

window.testEpisodeThreeInvestigation = function () {
  resetEpisodeThreeForTest();
  startEpisodeThreeInvestigation();
};

window.testEpisodeThreeHearing = function () {
  ensureEpisodeThreeState();
  renderEpisodeThreeHearing();
};

window.startEpisodeThree = function () {
  enterEpisodeThree();
};

window.enterEpisodeThree = enterEpisodeThree;
window.renderEpisodeThreeOpening = renderEpisodeThreeOpening;
window.startEpisodeThreeInvestigation = startEpisodeThreeInvestigation;
window.renderEpisodeThreeChooseHelper = renderEpisodeThreeChooseHelper;
window.renderEpisodeThreeHearing = renderEpisodeThreeHearing;
window.determineEpisodeThreeOutcome = determineEpisodeThreeOutcome;
window.calculateEpisodeThreeOutcomeWeights = calculateEpisodeThreeOutcomeWeights;
window.calculateEpisodeThreeCharacterStrength = calculateEpisodeThreeCharacterStrength;
window.getEpisodeThreeDefenseChoices = getEpisodeThreeDefenseChoices;

/* =====================================================
   第三集・正式結算系統
   存活 / 出宮 / 死亡 / 保命成功
===================================================== */


/* =====================================================
   第三集幫手名稱
===================================================== */

function getEpisodeThreeHelperLabel() {

  const helper =
    gameState.episodeThree
    &&
    gameState.episodeThree.helper;


  const map = {

    qinghe:
      "青禾",

    shen:
      "沈知意",

    xiaoshunzi:
      "小順子"

  };


  return (
    map[helper]
    ||
    "無"
  );

}


/* =====================================================
   第三集取得證物
===================================================== */

function getEpisodeThreeCollectedEvidence() {

  const ids = [

    "ep03-strange-powder",

    "ep03-palace-cord",

    "ep03-torn-note",

    "ep03-incense-clue",

    "ep03-shadow-clue",

    "ep03-suspicious-maid-reaction"

  ];


  const result = [];


  ids.forEach(
    function (id) {

      if (
        typeof getInventoryItem !==
        "function"
      ) {

        return;

      }


      const item =
        getInventoryItem(
          id
        );


      if (
        item
        &&
        item.name
      ) {

        result.push(
          item.name
        );

      }

    }
  );


  if (
    typeof getStoryFlag ===
    "function"

    &&

    getStoryFlag(
      "ep03_wardrobe_disturbed"
    )
  ) {

    result.push(
      "衣櫃曾被翻動"
    );

  }


  return result;

}


/* =====================================================
   第三集共用結算
===================================================== */

function showEpisodeThreeResult(
  outcome,
  savedItemName = ""
) {

  const helper =
    getEpisodeThreeHelperLabel();


  const evidence =
    getEpisodeThreeCollectedEvidence();


  const baseRows = [

    {
      label:
        "目前位分",

      value:
        playerData.rank
        ||
        "答應"
    },

    {
      label:
        "協助你的人",

      value:
        helper
    },

    {
      label:
        "取得證物",

      value:
        evidence.length
        +
        " 件"
    },

    {
      label:
        "警覺",

      value:
        Number(
          playerData.alert
          ||
          0
        )
    },

    {
      label:
        "禮儀",

      value:
        Number(
          playerData.etiquette
          ||
          0
        )
    }

  ];


  /* ===============================================
     存活
  =============================================== */

  if (
    outcome ===
    "survive"
  ) {

    showEpisodeResult({

      episodeNumber:
        3,

      episodeTitle:
        "栽贓",

      statusLabel:
        "本集存活",

      title:
        "嫌疑暫解",

      survived:
        true,

      terminal:
        false,

      image:
        "images/scene-ep03-06-ending.png",

      imagePosition:
        "center center",

      survivalTitle:
        "你目前活到第 3 集",

      survivalSub:
        "故事仍在繼續",

      score:
        null,

      summary:
        "你暫時洗清了偷竊嫌疑，但真正把耳墜放進你房裡的人仍藏在宮中。",

      detailRows:
        baseRows,

      keyChoices: [

        `本集協助者：${helper}`,

        "你成功撐過了栽贓案的正殿審問。"

      ],

      rewards:
        evidence,

      continueText:
        "進入第四集",

      continueAction:
        "startEpisodeFour",

      rankingTitle:
        "第三集・栽贓排行",

      shareLine:
        "我撐過了栽贓案，真正的幕後之人還沒有現身。"

    });


    return;

  }


  /* ===============================================
     被逐出宮
  =============================================== */

  if (
    outcome ===
    "expelled"
  ) {

    showEpisodeResult({

      episodeNumber:
        3,

      episodeTitle:
        "栽贓",

      statusLabel:
        "出宮結局",

      title:
        "蒙冤出宮",

      survived:
        false,

      terminal:
        true,

      image:
        "images/scene-ep03-07-expelled.png",

      imagePosition:
        "center center",

      survivalTitle:
        "你只活到第 3 集",

      survivalSub:
        "本局故事結束",

      score:
        null,

      summary:
        "你沒有被定下死罪，卻也沒能完全洗清嫌疑。宮門再次打開，只是這次你是被送出去的人。",

      detailRows:
        baseRows,

      keyChoices: [

        `本集協助者：${helper}`,

        "證據不足以讓你被定死罪，也不足以讓你繼續留在宮中。"

      ],

      rewards:
        evidence,

      continueText:
        "重新開局",

      continueAction:
        "restartGame",

      rankingTitle:
        "第三集・栽贓排行",

      shareLine:
        "我在第三集被蒙冤遣出宮。"

    });


    return;

  }


  /* ===============================================
     死亡
  =============================================== */

  if (
    outcome ===
    "death"
  ) {

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

      survivalTitle:
        "你只活到第 3 集",

      survivalSub:
        "死亡・本局結束",

      score:
        null,

      summary:
        "你沒能在裁決前證明自己的清白。真正設下這場局的人，仍然藏在宮牆深處。",

      detailRows:
        baseRows,

      keyChoices: [

        `本集協助者：${helper}`,

        "栽贓案最終被定成你的罪。"

      ],

      rewards:
        evidence,

      continueText:
        "重新開局",

      continueAction:
        "restartGame",

      rankingTitle:
        "第三集・栽贓排行",

      shareLine:
        "我在第三集死於一場栽贓。"

    });


    return;

  }


  /* ===============================================
     保命道具救回
  =============================================== */

  if (
    outcome ===
    "saved_by_item"
  ) {

    const itemName =

      savedItemName

      ||

      (
        gameState.episodeThree
        &&
        gameState.episodeThree
          .savedByItemName
      )

      ||

      "保命之物";


    showEpisodeResult({

      episodeNumber:
        3,

      episodeTitle:
        "栽贓",

      statusLabel:
        "死罪得免",

      title:
        "命懸一線",

      survived:
        true,

      terminal:
        false,

      image:
        "images/scene-ep03-06-ending.png",

      imagePosition:
        "center center",

      survivalTitle:
        "你目前活到第 3 集",

      survivalSub:
        "保住性命・暫時幽禁",

      score:
        null,

      summary:
        `${itemName}替你擋下了死罪。你活了下來，但代價是失去自由，等待下一次裁決。`,

      detailRows: [

        ...baseRows,

        {
          label:
            "使用保命物",

          value:
            itemName
        }

      ],

      keyChoices: [

        `你使用了【${itemName}】避免死亡。`,

        "死罪被撤回，但你被暫時幽禁。"

      ],

      rewards:
        evidence,

      continueText:
        "等待後續處置",

      continueAction:
        "startEpisodeFour",

      rankingTitle:
        "第三集・栽贓排行",

      shareLine:
        `我靠【${itemName}】從死局裡活了下來。`

    });

  }

}


/* =====================================================
   覆蓋：蒙冤出宮
===================================================== */

function renderEpisodeThreeExpelled() {

  gameState.status =
    "expelled";


  gameState.episodeThree.outcome =
    "expelled";


  if (
    typeof setStoryFlag ===
    "function"
  ) {

    setStoryFlag(
      "episode3_outcome",
      "expelled"
    );

  }


  if (
    typeof saveGame ===
    "function"
  ) {

    saveGame();

  }


  renderEpisodeThreeScene({

    step:
      "ep3_ending_expelled",

    location:
      "宮門",

    title:
      "蒙冤出宮",

    speaker:
      "",

    image:
      "images/scene-ep03-07-expelled.png",

    content:
      `

        最終沒有找到足以證明你偷竊的直接證據。

        <br><br>

        但也沒有足夠的證據洗清你的嫌疑。

        <br><br>

        為平息此事，你被褫去宮中身份，遣送出宮。

        <br><br>

        宮門重新在你面前打開。

        <br><br>

        只是這一次，你是被趕出去的。

        <br><br>

        <strong>
          結局：蒙冤出宮
        </strong>

      `,

    nextText:
      "查看本集戰績",

    nextAction:
      function () {

        showEpisodeThreeResult(
          "expelled"
        );

      }

  });

}


/* =====================================================
   覆蓋：死亡
===================================================== */

function renderEpisodeThreeDeath() {

  gameState.status =
    "dead";


  gameState.episodeThree.outcome =
    "death";


  if (
    typeof setStoryFlag ===
    "function"
  ) {

    setStoryFlag(
      "episode3_outcome",
      "death"
    );

  }


  if (
    typeof saveGame ===
    "function"
  ) {

    saveGame();

  }


  renderEpisodeThreeScene({

    step:
      "ep3_ending_death",

    location:
      "宮中",

    title:
      "死局",

    speaker:
      "",

    image:
      "images/scene-ep03-08-death.png",

    content:
      `

        事情沒有因你的辯解停下。

        <br><br>

        一條又一條對你不利的說法被送進正殿。

        <br><br>

        最後，這場栽贓被定成了你的罪。

        <br><br>

        你沒能等到真正的幕後之人露出破綻。

        <br><br>

        <strong>
          死亡結局：栽贓成罪
        </strong>

      `,

    nextText:
      "查看本集戰績",

    nextAction:
      function () {

        showEpisodeThreeResult(
          "death"
        );

      }

  });

}


/* =====================================================
   覆蓋：成功留下
===================================================== */

function renderEpisodeThreeSurvive() {

  gameState.status =
    "alive";


  gameState.episodeThree.outcome =
    "survive";


  if (
    typeof setStoryFlag ===
    "function"
  ) {

    setStoryFlag(
      "episode3_survived",
      true
    );


    setStoryFlag(
      "episode3_outcome",
      "survive"
    );

  }


  if (
    typeof saveGame ===
    "function"
  ) {

    saveGame();

  }


  renderEpisodeThreeScene({

    step:
      "ep3_ending_survive",

    location:
      "承露宮・正殿",

    title:
      "嫌疑暫解",

    speaker:
      "寧嬪・蘇婉容",

    image:
      "images/scene-ep03-03-ningpin-hall.png",

    content:
      `

        寧嬪沉默許久。

        <br><br>

        「這件事還沒有查完。」

        <br><br>

        「但至少現在，本宮不能只憑那只耳墜定你的罪。」

        <br><br>

        你被准許回房。

        <br><br>

        走出正殿時，你第一次真正明白：

        <br><br>

        有人希望你離開這座宮城。

        <br>

        甚至希望你死。

        <br><br>

        而你至今還不知道，那個人是誰。

      `,

    nextText:
      "查看本集戰績",

    nextAction:
      function () {

        showEpisodeThreeResult(
          "survive"
        );

      }

  });

}


/* =====================================================
   覆蓋：保命道具成功
===================================================== */

function renderEpisodeThreeSavedByItem(
  item
) {

  gameState.status =
    "alive";


  gameState.episodeThree.outcome =
    "saved_by_item";


  gameState.episodeThree
    .savedByItemName =
      item.name;


  if (
    typeof setStoryFlag ===
    "function"
  ) {

    setStoryFlag(
      "episode3_saved_by_item",
      true
    );


    setStoryFlag(
      "episode3_outcome",
      "saved_by_item"
    );

  }


  if (
    typeof saveGame ===
    "function"
  ) {

    saveGame();

  }


  renderEpisodeThreeScene({

    step:
      "ep3_saved_by_item",

    location:
      "宮中",

    title:
      "死罪得免",

    speaker:
      "",

    image:
      "images/scene-ep03-06-ending.png",

    content:
      `

        ${item.name}被呈到眾人面前。

        <br><br>

        原本已定下的死罪被迫收回。

        <br><br>

        你保住了命。

        <br><br>

        但保命不等於全身而退。

        <br><br>

        你被暫時幽禁，等待後續處置。

        <br><br>

        而那件珍貴的保命之物，也從此不再屬於你。

      `,

    nextText:
      "查看本集戰績",

    nextAction:
      function () {

        showEpisodeThreeResult(
          "saved_by_item",
          item.name
        );

      }

  });

}


/* =====================================================
   第四集尚未製作
===================================================== */

if (
  typeof window.startEpisodeFour !==
  "function"
) {

  window.startEpisodeFour =
    function () {

      alert(
        "第四集尚未開始製作"
      );

    };

}


/* =====================================================
   對外提供
===================================================== */

window.showEpisodeThreeResult =
  showEpisodeThreeResult;


window.renderEpisodeThreeExpelled =
  renderEpisodeThreeExpelled;


window.renderEpisodeThreeDeath =
  renderEpisodeThreeDeath;


window.renderEpisodeThreeSurvive =
  renderEpisodeThreeSurvive;


window.renderEpisodeThreeSavedByItem =
  renderEpisodeThreeSavedByItem;

/* =====================================================
   第三集・F5 中途恢復修正
   修正從結算頁測試進搜證後
   gameState.screen 仍停留 episodeResult 的問題
===================================================== */

(function installEpisodeThreeResumeFix() {

  if (
    window.__episodeThreeResumeFixInstalled
  ) {
    return;
  }


  window.__episodeThreeResumeFixInstalled =
    true;


  /* ===================================================
     保存原本搜證入口
  =================================================== */

  const originalStartEpisodeThreeInvestigation =
    window.startEpisodeThreeInvestigation;


  /* ===================================================
     新版搜證入口
  =================================================== */

  if (
    typeof originalStartEpisodeThreeInvestigation ===
    "function"
  ) {

    const fixedStartEpisodeThreeInvestigation =
      function () {

        /*
          重要：
          無論是正式流程或 Console 測試，
          一進第三集搜證就必須把畫面狀態
          正式切回 episode3。
        */

        gameState.screen =
          "episode3";


        gameState.currentEpisode =
          3;


        /*
          清掉之前測試留下的結算頁狀態，
          避免 F5 又被結算頁搶回去。
        */

        gameState.episodeResult =
          null;


        if (
          typeof saveGame ===
          "function"
        ) {

          saveGame();

        }


        return originalStartEpisodeThreeInvestigation
          .apply(
            this,
            arguments
          );

      };


    window.startEpisodeThreeInvestigation =
      fixedStartEpisodeThreeInvestigation;

  }


  /* ===================================================
     第三集 F5 還原
  =================================================== */

  function restoreEpisodeThreeProgress() {

    if (
      typeof gameState ===
      "undefined"
      ||
      !gameState
    ) {

      return false;

    }


    if (
      gameState.screen !==
      "episode3"
    ) {

      return false;

    }


    if (
      Number(
        gameState.currentEpisode
      )
      !==
      3
    ) {

      return false;

    }


    /*
      目前先正式接搜證恢復。
    */

    if (
      gameState.storyStep ===
      "ep3_investigation"
    ) {

      window
        .startEpisodeThreeInvestigation();

      return true;

    }


    return false;

  }


  /* ===================================================
     F5 後自動恢復
  =================================================== */

  window.addEventListener(

    "DOMContentLoaded",

    function () {

      setTimeout(

        function () {

          restoreEpisodeThreeProgress();

        },

        80

      );

    }

  );


  /* ===================================================
     對外測試
  =================================================== */

  window.restoreEpisodeThreeProgress =
    restoreEpisodeThreeProgress;

})();

/* =====================================================
   第三集・完整 F5 劇情恢復系統 V2

   功能：
   - 第三集所有普通劇情幕次可 F5 恢復
   - 搜證可恢復
   - 求助 NPC 可恢復
   - 審問可恢復
   - 辯解結果可恢復
   - 保命道具選擇可恢復
   - 各種結局畫面可恢復
===================================================== */

(function installEpisodeThreeFullResumeV2() {

  if (
    window.__episodeThreeFullResumeV2Installed
  ) {
    return;
  }


  window.__episodeThreeFullResumeV2Installed =
    true;


  /* ===================================================
     以後第三集每一次記錄進度
     都強制保存 screen = episode3
  =================================================== */

  const originalEp3SetProgress =
    ep3SetProgress;


  ep3SetProgress =
    function (
      step
    ) {

      gameState.screen =
        "episode3";


      gameState.currentEpisode =
        3;


      return originalEp3SetProgress(
        step
      );

    };


  /* ===================================================
     完整恢復第三集
  =================================================== */

  function restoreEpisodeThreeProgressV2() {

    if (
      typeof gameState ===
      "undefined"
      ||
      !gameState
    ) {

      return false;

    }


    if (
      gameState.screen !==
      "episode3"
    ) {

      return false;

    }


    if (
      Number(
        gameState.currentEpisode
      )
      !== 3
    ) {

      return false;

    }


    ensureEpisodeThreeState();


    const step =
      gameState.storyStep
      ||
      "ep3_opening";


    console.log(
      "恢復第三集進度：",
      step
    );


    /* ===============================================
       開場
    =============================================== */

    if (
      step ===
      "ep3_opening"
    ) {

      renderEpisodeThreeOpening();

      return true;

    }


    /* ===============================================
       搜宮命令
    =============================================== */

    if (
      step ===
      "ep3_summons"
    ) {

      renderEpisodeThreeMorningSummons();

      return true;

    }


    /* ===============================================
       贓物被找到
    =============================================== */

    if (
      step ===
      "ep3_accused"
    ) {

      renderEpisodeThreeAccusation();

      return true;

    }


    /* ===============================================
       寧嬪給半個時辰
    =============================================== */

    if (
      step ===
      "ep3_before_search"
    ) {

      renderEpisodeThreeTemporaryRelease();

      return true;

    }


    /* ===============================================
       搜證
    =============================================== */

    if (
      step ===
      "ep3_investigation"
    ) {

      startEpisodeThreeInvestigation();

      return true;

    }


    /* ===============================================
       選擇求助人物
    =============================================== */

    if (
      step ===
      "ep3_choose_helper"
    ) {

      renderEpisodeThreeChooseHelper();

      return true;

    }


    /* ===============================================
       青禾
    =============================================== */

    if (
      step ===
      "ep3_helper_qinghe"
    ) {

      handleEpisodeThreeHelper(
        "qinghe"
      );

      return true;

    }


    /* ===============================================
       小順子
    =============================================== */

    if (
      step ===
      "ep3_helper_xiaoshunzi"
    ) {

      handleEpisodeThreeHelper(
        "xiaoshunzi"
      );

      return true;

    }


    /* ===============================================
       沈知意
    =============================================== */

    if (
      step ===
      "ep3_helper_shen"
    ) {

      handleEpisodeThreeHelper(
        "shen"
      );

      return true;

    }


    /* ===============================================
       正殿審問
    =============================================== */

    if (
      step ===
      "ep3_hearing"
    ) {

      renderEpisodeThreeHearing();

      return true;

    }


    /* ===============================================
       玩家已經完成辯解
    =============================================== */

    if (
      step ===
      "ep3_defense_result"
    ) {

      const defense =
        gameState
          .episodeThree
          ?.defense;


      const strength =
        Number(
          gameState
            .episodeThree
            ?.defenseStrength
          ||
          0
        );


      if (defense) {

        resolveEpisodeThreeDefense(
          defense,
          strength
        );

      }

      else {

        /*
          舊存檔萬一沒有 defense，
          不瞎猜玩家選過什麼。
        */

        renderEpisodeThreeHearing();

      }


      return true;

    }


    /* ===============================================
       死亡前保命選擇
    =============================================== */

    if (
      step ===
      "ep3_life_saving_choice"
    ) {

      const items =
        typeof getLifeSavingItems ===
        "function"
        ?
        getLifeSavingItems()
        :
        [];


      if (
        items.length > 0
      ) {

        renderEpisodeThreeLifeSavingChoice(
          items[0]
        );

      }

      else {

        /*
          道具已不存在時，
          不能憑空再生成一張免死金牌。
        */

        renderEpisodeThreeDeath();

      }


      return true;

    }


    /* ===============================================
       已用保命道具
    =============================================== */

    if (
      step ===
      "ep3_saved_by_item"
    ) {

      const savedItem =
        gameState.lastLifeSavingItem
        ||
        {

          id:
            "restored-life-saving-item",

          name:
            "保命之物"

        };


      renderEpisodeThreeSavedByItem(
        savedItem
      );


      return true;

    }


    /* ===============================================
       被逐出宮
    =============================================== */

    if (
      step ===
      "ep3_ending_expelled"
    ) {

      renderEpisodeThreeExpelled();

      return true;

    }


    /* ===============================================
       死亡
    =============================================== */

    if (
      step ===
      "ep3_ending_death"
    ) {

      renderEpisodeThreeDeath();

      return true;

    }


    /* ===============================================
       生還
    =============================================== */

    if (
      step ===
      "ep3_ending_survive"
    ) {

      renderEpisodeThreeSurvive();

      return true;

    }


    /* ===============================================
       找不到舊幕次
       保守回第三集開場，不回首頁
    =============================================== */

    console.warn(
      "未知第三集幕次：",
      step
    );


    renderEpisodeThreeOpening();


    return true;

  }


  /* ===================================================
     對外
  =================================================== */

  window.restoreEpisodeThreeProgress =
    restoreEpisodeThreeProgressV2;


  /* ===================================================
     F5 載入後

     main.js 會先嘗試 restoreGame，
     即使它暫時把首頁顯示出來，
     這裡會立即依第三集 storyStep
     接管並恢復正確場景。
  =================================================== */

  function runEpisodeThreeResume() {

    if (
      typeof gameState ===
      "undefined"
    ) {

      return;

    }


    if (
      gameState.screen ===
      "episode3"
    ) {

      restoreEpisodeThreeProgressV2();

    }

  }


  if (
    document.readyState ===
    "loading"
  ) {

    window.addEventListener(

      "DOMContentLoaded",

      function () {

        setTimeout(
          runEpisodeThreeResume,
          120
        );

      }

    );

  }

  else {

    setTimeout(
      runEpisodeThreeResume,
      0
    );

  }

})();

/* =====================================================
   第三集終局・重生按鈕

   功能：
   - 蒙冤出宮 → 重生
   - 死亡結局 → 重生
   - 不修改原本結局判定
   - 不影響生還 / 保命成功路線
===================================================== */

(function installEpisodeThreeRebirthButton() {

  if (
    window.__episodeThreeRebirthButtonInstalled
  ) {
    return;
  }

  window.__episodeThreeRebirthButtonInstalled =
    true;


  function isEpisodeThreeTerminalEnding() {

    if (
      typeof gameState === "undefined"
      ||
      !gameState
    ) {
      return false;
    }


    return (
      gameState.storyStep ===
        "ep3_ending_expelled"

      ||

      gameState.storyStep ===
        "ep3_ending_death"
    );

  }


  function performEpisodeThreeRebirth() {

    if (
      typeof window.rebirthGame ===
      "function"
    ) {

      window.rebirthGame();

      return;

    }


    if (
      typeof restartGame ===
      "function"
    ) {

      const ok =
        confirm(
          "這一局已經結束。\n\n確定要重生，開始全新的人生嗎？"
        );


      if (!ok) {
        return;
      }


      restartGame();

      return;

    }


    console.error(
      "找不到重生功能"
    );

  }


  function applyEpisodeThreeRebirthButton() {

    if (
      !isEpisodeThreeTerminalEnding()
    ) {
      return;
    }


    const storyScreen =
      document.getElementById(
        "storyScreen"
      );


    if (!storyScreen) {
      return;
    }


    const buttons =
      storyScreen.querySelectorAll(
        "button"
      );


    buttons.forEach(
      function (button) {

        const text =
          String(
            button.textContent || ""
          )
            .replace(
              /\s+/g,
              ""
            )
            .trim();


        if (
          text !== "本局結束"
          &&
          text !== "重生"
        ) {
          return;
        }


        if (
          button.dataset
            .episodeThreeRebirth ===
            "true"
        ) {
          return;
        }


        /*
          複製一顆新按鈕，
          移除原本「本局結束」綁定的舊事件。
        */

        const rebirthButton =
          button.cloneNode(
            true
          );


        rebirthButton.textContent =
          "重 生";


        rebirthButton.dataset
          .episodeThreeRebirth =
          "true";


        rebirthButton.onclick =
          function (event) {

            event.preventDefault();

            event.stopPropagation();

            performEpisodeThreeRebirth();

          };


        button.replaceWith(
          rebirthButton
        );

      }
    );

  }


  /*
    劇情畫面每次重新產生時，
    自動檢查是不是第三集終局。
  */

  const observer =
    new MutationObserver(
      function () {

        applyEpisodeThreeRebirthButton();

      }
    );


  observer.observe(
    document.body,
    {
      childList: true,
      subtree: true
    }
  );


  /*
    F5 恢復結局時也檢查一次。
  */

  function startEpisodeThreeRebirthCheck() {

    setTimeout(
      applyEpisodeThreeRebirthButton,
      150
    );

  }


  if (
    document.readyState ===
    "loading"
  ) {

    window.addEventListener(
      "DOMContentLoaded",
      startEpisodeThreeRebirthCheck
    );

  }

  else {

    startEpisodeThreeRebirthCheck();

  }


  window.applyEpisodeThreeRebirthButton =
    applyEpisodeThreeRebirthButton;

})();