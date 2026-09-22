/* =====================================================
   後宮生還錄
   Supabase 連線設定
===================================================== */


/* =====================================================
   Supabase 專案網址
===================================================== */

const SUPABASE_URL =
  "https://ptdomhnxgrewrcfclglq.supabase.co";


/* =====================================================
   Supabase Publishable Key

   把下面 YOUR_PUBLISHABLE_KEY
   換成你剛才複製的 sb_publishable_...
===================================================== */

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_CvYNDan0i69DFkfVZk9jJg_mwEnE_DI";


/* =====================================================
   建立 Supabase Client
===================================================== */

window.hougongSupabase =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
  );


/* =====================================================
   Google 登入
===================================================== */

window.signInWithGoogle =
  async function () {

    const redirectUrl =
      window.location.origin + "/";


    const {
      data,
      error
    } =
      await window.hougongSupabase
        .auth
        .signInWithOAuth({

          provider:
            "google",

          options: {

            redirectTo:
              redirectUrl

          }

        });


    if (error) {

      console.error(
        "Google 登入失敗：",
        error
      );

      alert(
        "Google 登入失敗，請稍後再試。"
      );

      return null;

    }


    return data;

  };


/* =====================================================
   登出
===================================================== */

window.signOutGoogle =
  async function () {

    const {
      error
    } =
      await window.hougongSupabase
        .auth
        .signOut();


    if (error) {

      console.error(
        "登出失敗：",
        error
      );

      return false;

    }


    return true;

  };


/* =====================================================
   取得目前登入玩家
===================================================== */

window.getCurrentUser =
  async function () {

    const {
      data,
      error
    } =
      await window.hougongSupabase
        .auth
        .getUser();


    if (error) {

      console.error(
        "取得玩家資料失敗：",
        error
      );

      return null;

    }


    return data.user || null;

  };


/* =====================================================
   取得目前 Session
===================================================== */

window.getCurrentSession =
  async function () {

    const {
      data,
      error
    } =
      await window.hougongSupabase
        .auth
        .getSession();


    if (error) {

      console.error(
        "取得登入狀態失敗：",
        error
      );

      return null;

    }


    return data.session || null;

  };