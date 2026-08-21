// AUTO-GENERATED — Telegram bot on Cloudflare Workers (single-file deployment).
// Scaffold head: imports, app, Telegram helpers. Engine code is appended after CONFIG.
import { Hono } from "hono";

const app = new Hono();

const api = (env) => `https://api.telegram.org/bot${env.BOT_TOKEN}`;

const HELP = `🤖 Video Compressor

Reduce video file size by changing resolution, bitrate, codec or frame rate (via an optional conversion API)

Available commands:
/(send file) – Convert VIDEO to VIDEO
/help – Show help

/help – show this message

Tip: send a file and the bot will convert it.`;

// ===========================================================================
// Telegram helpers
// ===========================================================================
async function sendMessage(chatId, text, env, extra = {}) {
  return fetch(`${api(env)}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: String(text).slice(0, 4096), ...extra }),
  });
}

async function sendChatAction(chatId, action, env) {
  return fetch(`${api(env)}/sendChatAction`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, action }),
  });
}

async function sendPhoto(chatId, bytes, caption, env, filename = "image.png") {
  const form = new FormData();
  form.append("chat_id", String(chatId));
  form.append("photo", new Blob([bytes], { type: "image/png" }), filename);
  if (caption) form.append("caption", caption.slice(0, 1024));
  return fetch(`${api(env)}/sendPhoto`, { method: "POST", body: form });
}

async function sendDocument(chatId, bytes, filename, caption, env) {
  const form = new FormData();
  form.append("chat_id", String(chatId));
  form.append("document", new Blob([bytes]), filename);
  if (caption) form.append("caption", caption.slice(0, 1024));
  return fetch(`${api(env)}/sendDocument`, { method: "POST", body: form });
}

async function sendLong(chatId, text, env) {
  text = String(text || "");
  const MAX = 4000;
  if (text.length <= MAX) return sendMessage(chatId, text, env);
  let i = 0;
  while (i < text.length) {
    const chunk = text.slice(i, i + MAX);
    await sendMessage(chatId, chunk, env);
    i += MAX;
  }
}

const CONFIG = {
  "name": "Video Compressor",
  "caps": [
    "binary"
  ],
  "from": "VIDEO",
  "to": "VIDEO"
};

// ===== ENGINE: convert =====
// ENGINE: convert — file/format conversion.
// Text/archive conversions run in pure JS; binary conversions forward to an
// optional CONVERT_API_URL (documented in README).
import { zipSync, unzipSync, strToU8, strFromU8 } from "fflate";

async function getDocBytes(message, env) {
  const doc = message.document;
  const fid = doc?.file_id;
  if (!fid) return null;
  const meta = await (await fetch(`${api(env)}/getFile?file_id=${fid}`)).json();
  if (!meta.ok) return null;
  const url = `https://api.telegram.org/file/bot${env.BOT_TOKEN}/${meta.result.file_path}`;
  const r = await fetch(url);
  return new Uint8Array(await r.arrayBuffer());
}

// --- text converters ------------------------------------------------------
function csvToJson(text) {
  const lines = text.trim().split(/\r?\n/);
  const head = lines[0].split(",").map((s) => s.trim());
  return lines.slice(1).map((l) => {
    const cells = l.split(",");
    const o = {};
    head.forEach((h, i) => (o[h] = cells[i]?.trim()));
    return o;
  });
}
function jsonToCsv(text) {
  const arr = JSON.parse(text);
  if (!Array.isArray(arr) || !arr.length) return "";
  const head = Object.keys(arr[0]);
  const rows = arr.map((o) => head.map((h) => o[h]).join(","));
  return [head.join(","), ...rows].join("\n");
}
function srtToVtt(srt) {
  return "WEBVTT\n\n" + srt.replace(/\r/g, "").replace(/(\d+)\s*\n(\d{2}:\d{2}:\d{2}),(\d{3})/g, "$1\n$2.$3");
}
function vttToSrt(vtt) {
  return vtt.replace(/WEBVTT\n*/, "").replace(/(\d{2}:\d{2}:\d{2})\.(\d{3})/g, "$1,$2").trim();
}

async function engineHandle(message, env, cmd, args, chatId) {
  const caps = CONFIG.caps || [];
  // Plain text → default conversion if defined.
  if (cmd === null) {
    if (caps.includes("csv") && /[,\n]/.test(args)) {
      return await runCmd("csv2json", args, env, chatId);
    }
    await sendMessage(chatId, "Send /help for available commands, or upload a file.", env);
    return true;
  }
  return await runCmd(cmd, args, env, chatId);
}

async function runCmd(cmd, args, env, chatId) {
  const caps = CONFIG.caps || [];
  switch (cmd) {
    case "csv2json": {
      if (!caps.includes("csv")) return false;
      try { await sendDocument(chatId, new TextEncoder().encode(JSON.stringify(csvToJson(args), null, 2)), "result.json", "✅ Converted CSV → JSON", env); }
      catch (e) { await sendMessage(chatId, "Invalid CSV.", env); }
      return true;
    }
    case "json2csv": {
      if (!caps.includes("csv")) return false;
      try { await sendDocument(chatId, new TextEncoder().encode(jsonToCsv(args)), "result.csv", "✅ Converted JSON → CSV", env); }
      catch (e) { await sendMessage(chatId, "Invalid JSON array.", env); }
      return true;
    }
    case "csv2txt": {
      if (!caps.includes("csv")) return false;
      await sendDocument(chatId, new TextEncoder().encode(args.replace(/,/g, " | ")), "result.txt", "✅ CSV → TXT", env);
      return true;
    }
    case "srt2vtt": {
      if (!caps.includes("srt")) return false;
      await sendDocument(chatId, new TextEncoder().encode(srtToVtt(args)), "result.vtt", "✅ SRT → VTT", env);
      return true;
    }
    case "vtt2srt": {
      if (!caps.includes("srt")) return false;
      await sendDocument(chatId, new TextEncoder().encode(vttToSrt(args)), "result.srt", "✅ VTT → SRT", env);
      return true;
    }
    case "b64encode": {
      if (!caps.includes("b64")) return false;
      await sendMessage(chatId, "```\n" + btoa(unescape(encodeURIComponent(args))) + "\n```", env, { parse_mode: "Markdown" });
      return true;
    }
    case "b64decode": {
      if (!caps.includes("b64")) return false;
      try { await sendMessage(chatId, decodeURIComponent(escape(atob(args.trim()))), env); }
      catch (e) { await sendMessage(chatId, "Invalid base64.", env); }
      return true;
    }
    case "zip": {
      if (!caps.includes("zip")) return false;
      const z = zipSync({ "file.txt": strToU8(args || " ") });
      await sendDocument(chatId, z, "archive.zip", "✅ Created ZIP", env);
      return true;
    }
    default:
      return false;
  }
}

// --- media (uploaded file) handling ---------------------------------------
async function engineHandleMedia(message, env, chatId) {
  const caps = CONFIG.caps || [];
  const bytes = await getDocBytes(message, env);
  if (!bytes) { await sendMessage(chatId, "Could not read the file.", env); return true; }
  const name = message.document?.file_name || "file";

  if (caps.includes("zip") && /\.zip$/i.test(name)) {
    try {
      const files = unzipSync(bytes);
      for (const [fname, data] of Object.entries(files)) {
        await sendDocument(chatId, data, fname, `📂 ${fname}`, env);
      }
    } catch (e) { await sendMessage(chatId, "Could not extract the ZIP.", env); }
    return true;
  }

  if (caps.includes("binary")) {
    if (!env.CONVERT_API_URL) {
      await sendMessage(
        chatId,
        `🔧 To convert ${CONFIG.from} → ${CONFIG.to}, set the CONVERT_API_URL secret to a conversion endpoint that accepts a multipart POST (file + from/to) and returns the converted file. See README.`,
        env
      );
      return true;
    }
    try {
      const form = new FormData();
      form.append("file", new Blob([bytes]), name);
      form.append("from", CONFIG.from);
      form.append("to", CONFIG.to);
      const r = await fetch(env.CONVERT_API_URL, { method: "POST", body: form });
      const out = new Uint8Array(await r.arrayBuffer());
      const ext = CONFIG.to.toLowerCase();
      await sendDocument(chatId, out, `converted.${ext}`, `✅ ${CONFIG.from} → ${CONFIG.to}`, env);
    } catch (e) {
      await sendMessage(chatId, "Conversion failed. Check CONVERT_API_URL.", env);
    }
    return true;
  }

  await sendMessage(chatId, "Upload not supported for this converter. Use /help.", env);
  return true;
}

// ===========================================================================
// Message dispatcher
// ===========================================================================
async function handleMessage(message, env) {
  const chatId = message?.chat?.id;
  if (!chatId) return;

  // Non-text messages (photos, documents, voice, etc.) go to the engine if it wants them.
  if (!message.text) {
    if (typeof engineHandleMedia === "function") {
      const ok = await engineHandleMedia(message, env, chatId);
      if (!ok) await sendMessage(chatId, "Send /start to begin, or use /help.", env);
    } else {
      await sendMessage(chatId, "Send /start to begin, or use /help.", env);
    }
    return;
  }

  const text = message.text;
  const m = text.match(/^\/([a-zA-Z0-9_]+)(?:@\S+)?\s*([\s\S]*)$/);

  if (!m) {
    // Plain text message.
    const handled = await engineHandle(message, env, null, text.trim(), chatId);
    if (!handled) await sendMessage(chatId, "Try /help for available commands.", env);
    return;
  }

  const cmd = m[1].toLowerCase();
  const args = m[2].trim();

  if (cmd === "start" || cmd === "help") {
    await sendMessage(chatId, HELP, env);
    return;
  }

  const handled = await engineHandle(message, env, cmd, args, chatId);
  if (!handled) await sendMessage(chatId, `Unknown command "/${cmd}". Try /help.`, env);
}

// Engine may register additional routes (redirects, votes, ...).
if (typeof engineRoutes === "function") engineRoutes(app);

app.get("/", (c) =>
  c.json({ name: CONFIG.name, status: "ok", runtime: "Cloudflare Workers" })
);

// Register the Telegram webhook. Visit /register (or /register?url=https://.../webhook).
app.get("/register", async (c) => {
  const url = new URL(c.req.url);
  const target = url.searchParams.get("url") || `${url.origin}/webhook`;
  const res = await fetch(`${api(c.env)}/setWebhook?url=${encodeURIComponent(target)}`);
  const json = await res.json();
  return c.json(json);
});

app.post("/webhook", async (c) => {
  try {
    const update = await c.req.json();
    if (update.message) await handleMessage(update.message, c.env);
    if (update.edited_message) await handleMessage(update.edited_message, c.env);
    if (update.callback_query && typeof engineHandleCallback === "function") {
      await engineHandleCallback(update.callback_query, c.env);
    }
  } catch (e) {
    console.error("webhook error", e);
  }
  return c.text("OK");
});

// Cron handler (only does work if the engine defines engineScheduled).
export async function scheduled(event, env, ctx) {
  if (typeof engineScheduled === "function") {
    try {
      await engineScheduled(env, event);
    } catch (e) {
      console.error("scheduled error", e);
    }
  }
}

export default app;
