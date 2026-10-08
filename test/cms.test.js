const { test } = require("node:test");
const assert = require("node:assert/strict");
const CMS = require("../docs/cms.js");
const seed = () => CMS.SEED_ITEMS.map((x) => ({ ...x }));

test("新着記事を日付の新しい順に並べ替える", () => {
  const sorted = CMS.sortByDateDesc(seed());
  assert.equal(sorted[0].date, "2026-09-20");
});

test("カテゴリーで絞り込むと該当だけが新しい順で返る", () => {
  const r = CMS.filterItems(seed(), { category: "イベント" });
  assert.ok(r.length > 0 && r.every((x) => x.category === "イベント"));
});

test("キーワードで絞り込むと題名に含む記事だけが返る", () => {
  const r = CMS.filterItems(seed(), { keyword: "採用" });
  assert.ok(r.length > 0 && r.every((x) => x.title.includes("採用")));
});

test("編集者は登録と編集ができるが削除と公開切替はできない", () => {
  assert.equal(CMS.canCreate("編集者"), true);
  assert.equal(CMS.canEdit("編集者"), true);
  assert.equal(CMS.canDelete("編集者"), false);
  assert.equal(CMS.canPublish("編集者"), false);
});

test("閲覧者は登録も編集も削除もできない", () => {
  assert.equal(CMS.canCreate("閲覧者"), false);
  assert.equal(CMS.canEdit("閲覧者"), false);
  assert.equal(CMS.canDelete("閲覧者"), false);
});

test("空の題名と本文は登録できない", () => {
  const r = CMS.createNews(seed(), { title: " ", category: "お知らせ", bodyHtml: "<p> </p>" });
  assert.ok(r.errors.length >= 2);
});

test("正しい入力は下書きとして登録できる", () => {
  const items = seed();
  const r = CMS.createNews(items, { title: "秋の見学会の案内", category: "イベント", bodyHtml: "<p>本文</p>" });
  assert.equal(r.errors.length, 0);
  assert.equal(r.item.status, "下書き");
});

test("カテゴリー別の件数を数える", () => {
  const c = CMS.countByCategory(seed());
  const total = Object.values(c).reduce((a, b) => a + b, 0);
  assert.equal(total, CMS.SEED_ITEMS.length);
});
