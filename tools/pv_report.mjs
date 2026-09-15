// 使い方: node tools/pv_report.mjs [days]
// 合言葉は環境変数 STATS_KEY か %APPDATA%\netlify\esma_stats_key.txt から読む
import fs from "node:fs";
import path from "node:path";

const days = Number(process.argv[2]) || 30;
let key = process.env.STATS_KEY || "";
if (!key) {
  const f = path.join(process.env.APPDATA || "", "netlify", "esma_stats_key.txt");
  if (fs.existsSync(f)) key = fs.readFileSync(f, "utf8").replace(/^STATS_KEY=/, "").trim();
}
if (!key) { console.error("STATS_KEY が見つかりません"); process.exit(1); }

const res = await fetch(`https://esma-inshi.netlify.app/api/stats?key=${encodeURIComponent(key)}&days=${days}`);
if (!res.ok) { console.error(`stats API ${res.status}`); process.exit(1); }
const data = await res.json();
const sum = (obj) => Object.values(obj || {}).reduce((a, b) => a + b, 0);
const top = (obj, n = 5) => Object.entries(obj || {}).sort((a, b) => b[1] - a[1]).slice(0, n).map(([k, v]) => `${k}:${v}`).join(", ");

console.log(`# ESMA LP 閲覧レポート(${data.days}日分 / 取得 ${data.generatedAt})`);
console.log("");
console.log("| 日付 | PV | 訪問者 | ブログ経由 | 診断完了 | フォーム到達 | 端末(mobile/desktop) |");
console.log("|---|---:|---:|---:|---:|---:|---|");
let tot = { pv: 0, v: 0, blog: 0, chk: 0, form: 0 };
for (const r of data.rows) {
  const blog = (r.referrers || {})["kuroma-akuto.com"] || 0;
  const chk = Object.entries(r.events || {}).filter(([k]) => k.startsWith("self_check_complete")).reduce((a, [, v]) => a + v, 0);
  const form = Object.entries(r.events || {}).filter(([k]) => k.startsWith("form_reached")).reduce((a, [, v]) => a + v, 0);
  const dev = r.devices || {};
  console.log(`| ${r.day} | ${r.pv} | ${r.visitors} | ${blog} | ${chk} | ${form} | ${dev.mobile || 0}/${dev.desktop || 0} |`);
  tot.pv += r.pv; tot.v += r.visitors; tot.blog += blog; tot.chk += chk; tot.form += form;
}
console.log(`| 合計 | ${tot.pv} | ${tot.v} | ${tot.blog} | ${tot.chk} | ${tot.form} | |`);
console.log("");
const agg = (field) => data.rows.reduce((acc, r) => { for (const [k, v] of Object.entries(r[field] || {})) acc[k] = (acc[k] || 0) + v; return acc; }, {});
console.log("流入元:", top(agg("referrers"), 8));
console.log("端末:", top(agg("devices")));
console.log("時間帯(JST):", top(agg("hours"), 6));
console.log("イベント:", top(agg("events"), 12));
console.log("診断プリセット:", top(agg("presets")));
const out = path.join(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..", "reports");
fs.mkdirSync(out, { recursive: true });
const file = path.join(out, `pv_${new Date().toISOString().slice(0, 10)}.json`);
fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf8");
console.log("\nraw:", file);
