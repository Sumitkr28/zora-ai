# Zora — Working App

Real Next.js + Firebase + Gemini implementation of Zora, built to the spec in `../ZORA_DESIGN_PLAN.md`.

## Quick start

1. Complete the backend walkthrough at [`../SETUP_GUIDE.md`](../SETUP_GUIDE.md).
2. Paste your credentials into `.env.local` (already created in this folder).
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run the dev server:
   ```bash
   npm run dev
   ```
5. Open <http://localhost:3000>.

## Project structure

```
zora-app/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout (fonts, metadata)
│   ├── globals.css         # Design tokens (port of ../design_handoff_zora/design_files/tokens.css)
│   ├── page.tsx            # /  — chat root (placeholder until Phase 2c)
│   └── api/                # Server routes (added in Phase 4)
├── components/             # Migrated screens from design_files/ (Phase 2c)
├── lib/
│   └── firebase.ts         # Client-side Firebase init
├── .env.local              # Your credentials (git-ignored)
├── .env.local.example      # Template
├── next.config.mjs
├── tsconfig.json
└── package.json
```

## Phase status

| Phase | What | Status |
|---|---|---|
| 2a | SETUP_GUIDE for Firebase + Gemini | ✅ done |
| 2b | Project scaffold (this folder) | ✅ done |
| 2c | Migrate JSX screens → `components/`, wire routes, add `/dev` canvas | ⏳ next |
| 3 | Firebase Auth wiring (Phone OTP / Email / Google) | pending |
| 4 | Gemini chat streaming `/api/chat` | pending |
| 5 | Firebase Storage uploads + MediaRecorder | pending |
| 6 | Cloud Function for 7-day cleanup | pending |
| 7 | Plan polish (sessionStorage intro, routes, kbd shortcuts, button handlers) | pending |

## Where the visual design lives

The original design files are at `../design_handoff_zora/design_files/`. They are kept as the visual reference. The migration in Phase 2c will port each `.jsx` file into `zora-app/components/` **preserving every inline style verbatim** — no visual change.

The side-by-side design canvas (all artboards at once) will be available at <http://localhost:3000/dev> after Phase 2c, for visual-regression checking.
