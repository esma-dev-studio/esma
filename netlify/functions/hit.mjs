// LPの閲覧(pv)とイベント(ev)を「1件=1レコード(追記のみ)」で記録する(Netlify Functions + Blobs)
// 同時アクセスでも数え漏れが出ないよう、集計値の読み書きはせず、キー名に内容を埋め込んだ空レコードを書くだけにする
// 個人情報は保存しない: 訪問者の識別はIP+UAを日替わりの塩付きでハッシュ化した12文字のみ
import { getStore } from "@netlify/blobs";
import { createHash, randomBytes } from "node:crypto";

const BOT = /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|fetch|curl|wget|python|monitor|facebookexternalhit|verifier|esma-check|netlify/i;
const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" };
const clean = (v, n = 40) => String(v ?? "").replace(/[^A-Za-z0-9._-]/g, "_").slice(0, n) || "-";

function refKey(raw) {
  if (!raw) return "direct";
  try {
    const host = new URL(raw).host.replace(/^www\./, "");
    if (host.includes("esma-inshi.netlify.app")) return "self";
    return host || "direct";
  } catch (_) { return "other"; }
}

export default async (req, context) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
  if (req.method !== "POST") return new Response("method not allowed", { status: 405, headers: CORS });
  const ua = req.headers.get("user-agent") || "";
  if (!ua || BOT.test(ua)) return new Response(null, { status: 204, headers: CORS });

  let body = {};
  try { body = await req.json(); } catch (_) {}

  const now = Date.now();
  const jst = new Date(now + 9 * 3600 * 1000);
  const day = jst.toISOString().slice(0, 10);
  const hour = String(jst.getUTCHours()).padStart(2, "0");
  const salt = process.env.PV_SALT || "esma-salt";
  const vid = createHash("sha256").update(`${salt}|${day}|${context.ip || ""}|${ua}`).digest("hex").slice(0, 12);

  let fields;
  if (body.t === "ev") {
    fields = ["ev", vid, clean(body.n, 48), clean(body.d, 48), hour];
  } else {
    const w = Number(body.w) || 0;
    const dev = w ? (w < 768 ? "mobile" : w < 1024 ? "tablet" : "desktop") : "unknown";
    fields = ["pv", vid, clean(refKey(body.r), 64), dev, hour, clean(body.q, 32), clean(body.p, 48)];
  }
  const key = `h/${day}/${now}-${randomBytes(3).toString("hex")}|${fields.join("|")}`;
  const store = getStore({ name: "esma-pv", consistency: "strong" });
  await store.set(key, "1");
  return new Response(null, { status: 204, headers: CORS });
};

export const config = { path: "/api/hit" };
