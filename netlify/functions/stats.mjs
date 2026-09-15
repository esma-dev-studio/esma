// 日別の集計を返す。合言葉(環境変数 STATS_KEY)が一致したときだけ応答する
// 例: GET /api/stats?key=XXXX&days=30   (1件=1レコードのキー名を読み、その場で集計する)
import { getStore } from "@netlify/blobs";

const inc = (obj, k) => { obj[k] = (obj[k] || 0) + 1; };

function aggregate(day, keys) {
  const d = { day, pv: 0, visitors: 0, referrers: {}, devices: {}, hours: {}, events: {}, presets: {}, paths: {}, eventVisitors: {} };
  const vis = new Set();
  const evVis = {};
  for (const key of keys) {
    const parts = key.slice(key.indexOf("|") + 1).split("|");
    if (parts[0] === "pv") {
      const [, vid, ref, dev, hour, preset, path] = parts;
      d.pv += 1; vis.add(vid); inc(d.referrers, ref); inc(d.devices, dev); inc(d.hours, hour); inc(d.paths, path);
      if (preset && preset !== "-") inc(d.presets, preset);
    } else if (parts[0] === "ev") {
      const [, vid, name, detail] = parts;
      const label = detail && detail !== "-" ? `${name}:${detail}` : name;
      inc(d.events, label);
      (evVis[name] = evVis[name] || new Set()).add(vid);
    }
  }
  d.visitors = vis.size;
  for (const [name, set] of Object.entries(evVis)) d.eventVisitors[name] = set.size;
  return d;
}

export default async (req) => {
  const url = new URL(req.url);
  const key = url.searchParams.get("key") || "";
  const expected = process.env.STATS_KEY || "";
  if (!expected || key !== expected) return new Response("forbidden", { status: 403 });
  const days = Math.min(365, Math.max(1, Number(url.searchParams.get("days")) || 30));
  const store = getStore({ name: "esma-pv", consistency: "strong" });
  const { directories = [] } = await store.list({ prefix: "h/", directories: true });
  const dayKeys = directories.map((p) => p.replace(/^h\//, "").replace(/\/$/, "")).sort().slice(-days);
  const rows = [];
  for (const day of dayKeys) {
    const { blobs = [] } = await store.list({ prefix: `h/${day}/` });
    rows.push(aggregate(day, blobs.map((b) => b.key)));
  }
  return new Response(JSON.stringify({ generatedAt: new Date().toISOString(), days: rows.length, rows }), {
    status: 200, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
};

export const config = { path: "/api/stats" };
