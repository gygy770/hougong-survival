/* =====================================================
   後宮生還錄
   長期物品 / 證物 / 特殊資源系統
===================================================== */


/* =====================================================
   物品類型
===================================================== */

const INVENTORY_TYPES = {

  ITEM:
    "item",

  EVIDENCE:
    "evidence",

  KEY_ITEM:
    "key_item",

  CONSUMABLE:
    "consumable",

  SPECIAL:
    "special"

};


/* =====================================================
   初始化長期資料
===================================================== */

function ensureInventoryState() {

  if (!gameState.inventory) {

    gameState.inventory = {

      items: {},

      history: []

    };

  }


  if (!gameState.inventory.items) {

    gameState.inventory.items = {};

  }


  if (
    !Array.isArray(
      gameState.inventory.history
    )
  ) {

    gameState.inventory.history = [];

  }


  /*
    長期資源
    例如：
    人情、令牌次數、特殊恩典
  */

  if (!gameState.specialResources) {

    gameState.specialResources = {};

  }


  /*
    月銀紀錄
  */

  if (!gameState.monthlyAllowance) {

    gameState.monthlyAllowance = {

      totalReceived: 0,

      claimHistory: [],

      lastClaimKey: null

    };

  }


  /*
    長期自訂數值
    未來可保存其他系統資料
  */

  if (!gameState.longTermValues) {

    gameState.longTermValues = {};

  }

}


/* =====================================================
   儲存
===================================================== */

function saveInventoryState() {

  ensureInventoryState();


  if (
    typeof saveGame ===
    "function"
  ) {

    saveGame();

  }

}


/* =====================================================
   建立物品資料
===================================================== */

function normalizeInventoryItem(
  item = {}
) {

  return {

    id:
      item.id
      || "",

    name:
      item.name
      || item.id
      || "未知物品",

    type:
      item.type
      || INVENTORY_TYPES.ITEM,

    description:
      item.description
      || "",

    quantity:
      Number(
        item.quantity
        || 1
      ),

    /*
      是否使用後消耗
    */

    consumeOnUse:
      Boolean(
        item.consumeOnUse
      ),

    /*
      是否為保命類物品
    */

    lifeSaving:
      Boolean(
        item.lifeSaving
      ),

    /*
      是否允許被偷 / 沒收
    */

    removable:
      item.removable
      !== false,

    /*
      是否重要物品
    */

    important:
      Boolean(
        item.important
      ),

    /*
      標籤
      例如：
      ["life_save", "imperial"]
    */

    tags:
      Array.isArray(
        item.tags
      )
      ?
      [...item.tags]
      :
      [],

    /*
      第幾集取得
    */

    sourceEpisode:
      item.sourceEpisode
      ?? gameState.currentEpisode
      ?? null,

    /*
      取得來源
    */

    source:
      item.source
      || "",

    /*
      額外資料
    */

    metadata:
      item.metadata
      ?
      {
        ...item.metadata
      }
      :
      {}

  };

}


/* =====================================================
   取得物品
===================================================== */

function addInventoryItem(
  item,
  quantity = 1
) {

  ensureInventoryState();


  const normalized =
    normalizeInventoryItem(
      item
    );


  if (!normalized.id) {

    console.error(
      "物品缺少 id",
      item
    );

    return null;

  }


  const amount =
    Math.max(
      1,
      Number(
        quantity
        || normalized.quantity
        || 1
      )
    );


  const existing =
    gameState
      .inventory
      .items[
        normalized.id
      ];


  if (existing) {

    existing.quantity =
      Number(
        existing.quantity
        || 0
      )
      +
      amount;

  }

  else {

    gameState
      .inventory
      .items[
        normalized.id
      ] =
      {

        ...normalized,

        quantity:
          amount

      };

  }


  gameState
    .inventory
    .history
    .push({

      action:
        "gain",

      itemId:
        normalized.id,

      itemName:
        normalized.name,

      quantity:
        amount,

      episode:
        gameState.currentEpisode
        ?? null,

      reason:
        normalized.source
        || ""

    });


  saveInventoryState();


  console.log(
    "取得物品：",
    normalized.name,
    "×",
    amount
  );


  return getInventoryItem(
    normalized.id
  );

}


/* =====================================================
   是否持有物品
===================================================== */

function hasInventoryItem(
  itemId,
  quantity = 1
) {

  ensureInventoryState();


  const item =
    gameState
      .inventory
      .items[itemId];


  if (!item) {

    return false;

  }


  return (
    Number(
      item.quantity
      || 0
    )
    >=
    Number(
      quantity
      || 1
    )
  );

}


/* =====================================================
   取得單一物品資料
===================================================== */

function getInventoryItem(
  itemId
) {

  ensureInventoryState();


  const item =
    gameState
      .inventory
      .items[itemId];


  if (!item) {

    return null;

  }


  return {

    ...item,

    tags:
      Array.isArray(
        item.tags
      )
      ?
      [...item.tags]
      :
      [],

    metadata:
      item.metadata
      ?
      {
        ...item.metadata
      }
      :
      {}

  };

}


/* =====================================================
   取得全部物品
===================================================== */

function getInventoryItems(
  type = null
) {

  ensureInventoryState();


  const items =
    Object.values(
      gameState
        .inventory
        .items
    );


  if (!type) {

    return items;

  }


  return items.filter(
    function (item) {

      return (
        item.type === type
      );

    }
  );

}


/* =====================================================
   移除 / 消耗物品
===================================================== */

function removeInventoryItem(
  itemId,
  quantity = 1,
  reason = ""
) {

  ensureInventoryState();


  const item =
    gameState
      .inventory
      .items[itemId];


  if (!item) {

    return false;

  }


  if (
    item.removable ===
    false
  ) {

    console.warn(
      "此物品不可移除：",
      item.name
    );

    return false;

  }


  const amount =
    Math.max(
      1,
      Number(
        quantity
        || 1
      )
    );


  if (
    Number(
      item.quantity
      || 0
    )
    <
    amount
  ) {

    return false;

  }


  item.quantity -=
    amount;


  gameState
    .inventory
    .history
    .push({

      action:
        "remove",

      itemId:
        itemId,

      itemName:
        item.name,

      quantity:
        amount,

      episode:
        gameState.currentEpisode
        ?? null,

      reason:
        reason

    });


  if (
    item.quantity <= 0
  ) {

    delete gameState
      .inventory
      .items[itemId];

  }


  saveInventoryState();


  return true;

}


/* =====================================================
   使用物品
===================================================== */

function useInventoryItem(
  itemId,
  reason = ""
) {

  const item =
    getInventoryItem(
      itemId
    );


  if (!item) {

    return {

      success:
        false,

      reason:
        "not_found"

    };

  }


  /*
    是否消耗
  */

  if (
    item.consumeOnUse
  ) {

    const removed =
      removeInventoryItem(
        itemId,
        1,
        reason || "使用物品"
      );


    if (!removed) {

      return {

        success:
          false,

        reason:
          "cannot_remove"

      };

    }

  }


  else {

    ensureInventoryState();


    gameState
      .inventory
      .history
      .push({

        action:
          "use",

        itemId:
          item.id,

        itemName:
          item.name,

        quantity:
          1,

        episode:
          gameState.currentEpisode
          ?? null,

        reason:
          reason

      });


    saveInventoryState();

  }


  return {

    success:
      true,

    item:
      item

  };

}


/* =====================================================
   新增證物
===================================================== */

function addEvidence(
  item
) {

  return addInventoryItem({

    ...item,

    type:
      INVENTORY_TYPES.EVIDENCE,

    important:
      item.important
      !== false

  });

}


/* =====================================================
   新增關鍵物品
===================================================== */

function addKeyItem(
  item
) {

  return addInventoryItem({

    ...item,

    type:
      INVENTORY_TYPES.KEY_ITEM,

    important:
      true

  });

}


/* =====================================================
   新增消耗品
===================================================== */

function addConsumable(
  item,
  quantity = 1
) {

  return addInventoryItem({

    ...item,

    type:
      INVENTORY_TYPES.CONSUMABLE,

    consumeOnUse:
      true

  }, quantity);

}


/* =====================================================
   尋找保命道具
===================================================== */

function getLifeSavingItems() {

  ensureInventoryState();


  return Object
    .values(
      gameState
        .inventory
        .items
    )
    .filter(
      function (item) {

        return (

          item.lifeSaving
          === true

          ||

          (
            Array.isArray(
              item.tags
            )
            &&
            item.tags.includes(
              "life_save"
            )
          )

        );

      }
    );

}


/* =====================================================
   使用保命道具
===================================================== */

function consumeLifeSavingItem(
  itemId,
  reason = "避免死亡"
) {

  const item =
    getInventoryItem(
      itemId
    );


  if (
    !item
    ||
    !(
      item.lifeSaving
      ||
      item.tags.includes(
        "life_save"
      )
    )
  ) {

    return false;

  }


  /*
    保命道具原則：
    使用後消耗一次
  */

  const success =
    removeInventoryItem(
      itemId,
      1,
      reason
    );


  if (!success) {

    return false;

  }


  setStoryFlag(
    "life_saved_by_item",
    true
  );


  gameState
    .lastLifeSavingItem =
    {

      id:
        item.id,

      name:
        item.name,

      episode:
        gameState.currentEpisode
        ?? null

    };


  saveInventoryState();


  return true;

}


/* =====================================================
   特殊資源
   例如：人情、恩典、令牌次數
===================================================== */

function addSpecialResource(
  key,
  amount = 1
) {

  ensureInventoryState();


  gameState
    .specialResources[key] =
    Number(
      gameState
        .specialResources[key]
      || 0
    )
    +
    Number(
      amount
      || 0
    );


  saveInventoryState();


  return getSpecialResource(
    key
  );

}


/* =====================================================
   取得特殊資源
===================================================== */

function getSpecialResource(
  key
) {

  ensureInventoryState();


  return Number(
    gameState
      .specialResources[key]
    || 0
  );

}


/* =====================================================
   消耗特殊資源
===================================================== */

function spendSpecialResource(
  key,
  amount = 1
) {

  ensureInventoryState();


  const current =
    getSpecialResource(
      key
    );


  const cost =
    Math.max(
      1,
      Number(
        amount
        || 1
      )
    );


  if (
    current < cost
  ) {

    return false;

  }


  gameState
    .specialResources[key] =
    current - cost;


  saveInventoryState();


  return true;

}


/* =====================================================
   長期數值
===================================================== */

function setLongTermValue(
  key,
  value
) {

  ensureInventoryState();


  gameState
    .longTermValues[key] =
    value;


  saveInventoryState();


  return value;

}


/* =====================================================
   取得長期數值
===================================================== */

function getLongTermValue(
  key,
  fallback = null
) {

  ensureInventoryState();


  if (
    gameState
      .longTermValues[key]
    === undefined
  ) {

    return fallback;

  }


  return gameState
    .longTermValues[key];

}


/* =====================================================
   月銀
   amount 由位分系統決定
===================================================== */

function grantMonthlyAllowance(
  amount,
  claimKey,
  reason = ""
) {

  ensureInventoryState();


  const silver =
    Math.max(
      0,
      Number(
        amount
        || 0
      )
    );


  /*
    同一期不可重複領
  */

  if (
    claimKey
    &&
    gameState
      .monthlyAllowance
      .lastClaimKey
      ===
      claimKey
  ) {

    return {

      success:
        false,

      reason:
        "already_claimed"

    };

  }


  playerData.money =
    Number(
      playerData.money
      || 0
    )
    +
    silver;


  gameState
    .monthlyAllowance
    .totalReceived
    +=
    silver;


  gameState
    .monthlyAllowance
    .lastClaimKey =
    claimKey
    || null;


  gameState
    .monthlyAllowance
    .claimHistory
    .push({

      amount:
        silver,

      claimKey:
        claimKey
        || null,

      rank:
        playerData.rank
        || null,

      episode:
        gameState.currentEpisode
        ?? null,

      reason:
        reason

    });


  saveInventoryState();


  return {

    success:
      true,

    amount:
      silver,

    currentMoney:
      Number(
        playerData.money
        || 0
      )

  };

}


/* =====================================================
   取得角色核心資料
   不另外複製，直接讀玩家本身
===================================================== */

function getCharacterCoreState() {

  return {

    name:
      playerData.name
      ?? null,

    family:
      playerData.family
      ?? null,

    talent:
      playerData.talent
      ?? null,

    personality:
      playerData.personality
      ?? null,

    weakness:
      playerData.weakness
      ?? null,

    hiddenTrait:
      playerData.hiddenTrait
      ?? null,

    rank:
      playerData.rank
      ?? "秀女",

    money:
      Number(
        playerData.money
        || 0
      ),

    favor:
      Number(
        playerData.favor
        || 0
      ),

    alert:
      Number(
        playerData.alert
        || 0
      ),

    etiquette:
      Number(
        playerData.etiquette
        || 0
      )

  };

}


/* =====================================================
   測試用
   未來可以刪掉
===================================================== */

window.testGiveEvidence =
  function () {

    addEvidence({

      id:
        "test-palace-thread",

      name:
        "宮絛碎線",

      description:
        "從窗框旁發現的一小段宮絛碎線。",

      sourceEpisode:
        3,

      source:
        "第三集搜證測試"

    });


    console.log(
      getInventoryItems()
    );

  };


window.testGiveDeathToken =
  function () {

    addKeyItem({

      id:
        "death-immunity-token",

      name:
        "免死金牌",

      description:
        "可在特定死亡事件中保住一次性命。",

      quantity:
        1,

      consumeOnUse:
        true,

      lifeSaving:
        true,

      tags: [
        "life_save",
        "imperial",
        "rare"
      ],

      source:
        "系統測試"

    });


    console.log(
      getInventoryItems()
    );

  };


/* =====================================================
   初始化
===================================================== */

ensureInventoryState();


/* =====================================================
   對外提供
===================================================== */

window.INVENTORY_TYPES =
  INVENTORY_TYPES;


window.ensureInventoryState =
  ensureInventoryState;


window.addInventoryItem =
  addInventoryItem;


window.hasInventoryItem =
  hasInventoryItem;


window.getInventoryItem =
  getInventoryItem;


window.getInventoryItems =
  getInventoryItems;


window.removeInventoryItem =
  removeInventoryItem;


window.useInventoryItem =
  useInventoryItem;


window.addEvidence =
  addEvidence;


window.addKeyItem =
  addKeyItem;


window.addConsumable =
  addConsumable;


window.getLifeSavingItems =
  getLifeSavingItems;


window.consumeLifeSavingItem =
  consumeLifeSavingItem;


window.addSpecialResource =
  addSpecialResource;


window.getSpecialResource =
  getSpecialResource;


window.spendSpecialResource =
  spendSpecialResource;


window.setLongTermValue =
  setLongTermValue;


window.getLongTermValue =
  getLongTermValue;


window.grantMonthlyAllowance =
  grantMonthlyAllowance;


window.getCharacterCoreState =
  getCharacterCoreState;