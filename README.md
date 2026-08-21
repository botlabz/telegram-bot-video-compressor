# Video Compressor 🤖

Reduce video file size by changing resolution, bitrate, codec or frame rate (via an optional conversion API).

> 🪪 **License:** MIT — free for personal and commercial use.

---

## ✨ Features

- Upload a video to compress
- Tune resolution/bitrate
- Optional API endpoint
- Edge hosted
- Open source

---

## 🧱 Tech stack

| Component | Choice |
| --- | --- |
| Runtime | Cloudflare Workers |
| Web framework | [Hono](https://hono.dev) |
| Conversion | Pure JS + optional API |
| Bot transport | Telegram Bot API (webhooks) |

---

## 📋 Prerequisites

- A **Cloudflare account** (free tier is fine).
- **Node.js** (v18+) and **npm** installed.
- A **Telegram account** (to talk to [@BotFather](https://t.me/BotFather)).

---

## 🚀 Step-by-step setup & deployment

### 1. Create a Cloudflare account

1. Go to <https://dash.cloudflare.com/sign-up>.
2. Sign up with your email (or Google/Apple).
3. Verify your email.
4. No credit card is needed for the free plan.

### 2. Install Wrangler

```bash
npm install -g wrangler
wrangler login
wrangler --version
```

### 3. Create your Telegram bot

1. Start a chat with [@BotFather](https://t.me/BotFather).
2. Send `/newbot`.
3. Choose a **name** and a **username** ending in `bot`.
4. Keep the returned token secret.

### 4. Get the project

```bash
git clone https://github.com/botlabz/telegram-bot-video-compressor.git
cd telegram-bot-video-compressor
npm install
```

### 5. Configure the bot token

```bash
wrangler secret put BOT_TOKEN
# paste your token when prompted
```




### 6. Run locally & deploy

```bash
wrangler dev        # local testing
wrangler deploy      # live at https://telegram-bot-video-compressor.<subdomain>.workers.dev
```

### 7. Connect the webhook

باز کنید در مرورگر: / Open in browser:

```text
https://telegram-bot-video-compressor.<your-subdomain>.workers.dev/register
```

✅ Done! Send the bot a message.

---

## 💬 Usage

| Command | What it does |
| --- | --- |
| `/(send file)` | Convert VIDEO to VIDEO |
| `/help` | Show help |

---

## 🗂 Project structure

```text
telegram-bot-video-compressor/
├── worker.js      # complete bot code (single file)
├── wrangler.toml    # Cloudflare Workers config
├── package.json
├── .gitignore
├── LICENSE          # MIT
├── README.md        # English
└── README.fa.md     # Persian
```

---

## 🔧 Customization

- Edit commands, help text and messages in `worker.js`.
- For AI bots, change the system prompt in `CONFIG.system`.
- For trackers, adjust the type and sources in `CONFIG`.

---

## 🆓 Free & open source

This project is released under the **MIT License** — free for personal and commercial use.

---

Let's Build Something Together 🚀

https://tally.so/r/q4q1L9
