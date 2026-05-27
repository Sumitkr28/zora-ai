# Zora — Intelligence beyond chat

**Zora** is a free-tier AI chat assistant built by **[Xorvion](mailto:xorvion.ai@gmail.com)**. It streams responses from Google's Gemini models, remembers your conversations, reads the files you upload, and wraps it all in a fast, dark, brushed-steel interface.

🔗 **Live demo:** _coming soon_ &nbsp;·&nbsp; deployed on Vercel — link will be added here once live.

---

## ✨ Features

- **Streaming AI chat** — real-time, token-by-token responses powered by **Gemini 2.5 Flash**.
- **Sign in your way** — Google one-tap and passwordless **email magic-link** sign-in (Firebase Auth). Guest mode too — chat instantly, no account needed.
- **Your history, saved** — conversations persist for logged-in users and auto-expire after 7 days. Pick up exactly where you left off, even after navigating away.
- **Talks to your files** — upload **images, PDFs, audio, and video** and ask Zora about them (via the Gemini Files API).
- **Three model tiers** — Lite · Pro · Max, mapped to your plan.
- **Resilient by design** — automatic failover across multiple Gemini API keys so a single daily quota never interrupts you.
- **Polished UX** — cinematic intro splash, marketing landing page, pricing page, contact form, and a consistent brushed-steel design system.
- **Privacy-minded** — guest chats live only in your tab; saved chats auto-delete weekly.

---

## 🛠️ Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) · React 18 · TypeScript |
| AI | Google **Gemini 2.5 Flash** (`@google/generative-ai`) |
| Auth | Firebase Authentication (Google · Email link) |
| Database | Cloud Firestore (conversations, messages, feedback) |
| File uploads | Gemini Files API |
| Styling | CSS variables + inline styles (custom brushed-steel design system) |
| Hosting | Vercel |

---

## 🚀 Getting started

The app lives in the [`zora-app/`](zora-app/) directory.

```bash
cd zora-app
npm install

# configure your keys
cp .env.local.example .env.local
#   then fill in: Firebase web config, GEMINI_API_KEY (from Google AI Studio),
#   and (optional) a Web3Forms key for the contact form.

npm run dev
```

Open <http://localhost:3000>.

You'll need:
- A **Firebase** project (Auth + Firestore enabled) — paste the web config into `.env.local`.
- A **Gemini API key** from [Google AI Studio](https://aistudio.google.com/apikey). Add a second key from a different project as `GEMINI_API_KEY_2` for free-tier failover (optional).

---

## 🧭 How it works

1. **Auth** — `AuthProvider` wraps the app and exposes the current Firebase user. Sign-in helpers live in `lib/auth.ts`.
2. **Chat** — the composer posts to `/api/chat`, which streams a Gemini response back as plain-text chunks. The client renders each chunk live.
3. **Persistence** — for logged-in users, each message is written to Firestore (`lib/conversations.ts`). The open conversation is also cached in the browser so it survives navigation and reloads.
4. **Uploads** — images go inline (base64); PDFs/audio/video are sent to `/api/upload` → Gemini Files API, and referenced in the chat request.
5. **Cleanup** — stale conversations (>7 days) are pruned client-side on login.

---

## 📦 Project structure

```
zora-app/
├── app/                # Next.js App Router — pages + API routes
│   ├── api/chat/       # Gemini streaming endpoint
│   ├── api/upload/     # Gemini Files API upload endpoint
│   ├── chat/  login/  account/  pricing/  about/  contact/  terms/
│   └── page.tsx        # landing + intro
├── components/         # AuthProvider, logo/icons, screen components
└── lib/                # firebase, auth, conversations, cleanup
```

---

## 🏢 About

Built by **Xorvion** — a small team in Noida, India, making tools we want to use ourselves. Zora is our flagship assistant.

📧 [xorvion.ai@gmail.com](mailto:xorvion.ai@gmail.com)

---

> Zora can make mistakes — verify important information.
