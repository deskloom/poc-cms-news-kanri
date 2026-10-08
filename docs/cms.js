/**
 * 新着情報管理の中心ロジック（ブラウザと Node の両方で動く）。
 * ブラウザでは window.CMS、Node では module.exports として公開する。
 */
(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) {
    module.exports = factory();
  } else {
    root.CMS = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  const CATEGORIES = ["お知らせ", "採用情報", "製品情報", "イベント"];
  const STATUSES = ["公開", "下書き"];
  const ROLES = ["管理者", "編集者", "閲覧者"];

  // 架空データ（初期表示用・8件）
  const SEED_ITEMS = [
    { id: "n1", title: "春の製品説明会を開催します", category: "イベント", status: "公開", date: "2026-09-18", bodyHtml: "<p>架空の製品説明会の案内です。会場と日程は仮のものです。</p>" },
    { id: "n2", title: "サポート受付時間変更のお知らせ", category: "お知らせ", status: "公開", date: "2026-09-10", bodyHtml: "<p>架空の受付時間変更のお知らせです。</p>" },
    { id: "n3", title: "来春の採用募集を開始しました", category: "採用情報", status: "公開", date: "2026-09-02", bodyHtml: "<p>架空の採用募集の案内です。</p>" },
    { id: "n4", title: "新製品パンフレットを公開しました", category: "製品情報", status: "公開", date: "2026-08-25", bodyHtml: "<p>架空の製品パンフレット公開の案内です。</p>" },
    { id: "n5", title: "夏季休業のお知らせ", category: "お知らせ", status: "公開", date: "2026-08-05", bodyHtml: "<p>架空の夏季休業のお知らせです。</p>" },
    { id: "n6", title: "工場見学会の受付を開始しました", category: "イベント", status: "下書き", date: "2026-09-20", bodyHtml: "<p>架空の見学会の案内（下書き）です。</p>" },
    { id: "n7", title: "中途採用の募集要項を更新しました", category: "採用情報", status: "下書き", date: "2026-09-12", bodyHtml: "<p>架空の募集要項の更新案内（下書き）です。</p>" },
    { id: "n8", title: "製品メンテナンス手順を更新しました", category: "製品情報", status: "公開", date: "2026-07-30", bodyHtml: "<p>架空のメンテナンス手順の更新案内です。</p>" }
  ];

  function sortByDateDesc(items) {
    return [...items].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  }

  function filterItems(items, { category = "すべて", status = "すべて", keyword = "" } = {}) {
    const kw = keyword.trim();
    return sortByDateDesc(
      items.filter((it) => {
        if (category !== "すべて" && it.category !== category) return false;
        if (status !== "すべて" && it.status !== status) return false;
        if (kw && !(it.title.includes(kw))) return false;
        return true;
      })
    );
  }

  function countByCategory(items) {
    const counts = {};
    for (const c of CATEGORIES) counts[c] = 0;
    for (const it of items) {
      if (counts[it.category] !== undefined) counts[it.category] += 1;
    }
    return counts;
  }

  // 権限: 管理者は全操作可、編集者は作成・編集可（削除・公開切替は不可）、閲覧者は操作不可
  function canCreate(role) {
    return role === "管理者" || role === "編集者";
  }
  function canEdit(role) {
    return role === "管理者" || role === "編集者";
  }
  function canDelete(role) {
    return role === "管理者";
  }
  function canPublish(role) {
    return role === "管理者";
  }

  function validateNews({ title, category, bodyHtml }) {
    const errors = [];
    if (!title || !title.trim()) errors.push("タイトルを入力してください");
    else if (title.trim().length > 60) errors.push("タイトルは60文字以内にしてください");
    if (!CATEGORIES.includes(category)) errors.push("カテゴリーを選択してください");
    const text = (bodyHtml || "").replace(/<[^>]*>/g, "").trim();
    if (!text) errors.push("本文を入力してください");
    return errors;
  }

  function createNews(items, { title, category, bodyHtml, date }) {
    const errors = validateNews({ title, category, bodyHtml });
    if (errors.length > 0) return { errors };
    const id = "n" + Date.now().toString(36);
    const item = { id, title: title.trim(), category, status: "下書き", date: date || today(), bodyHtml };
    return { item: item, errors: [] };
  }

  function today() {
    const d = new Date();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${m}-${day}`;
  }

  return {
    CATEGORIES,
    STATUSES,
    ROLES,
    SEED_ITEMS,
    sortByDateDesc,
    filterItems,
    countByCategory,
    canCreate,
    canEdit,
    canDelete,
    canPublish,
    validateNews,
    createNews
  };
});
