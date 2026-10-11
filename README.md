# ShishNagh

Static, browser-only CTF challenge: the player runs a small language model locally and interviews five Dharma Support Desk departments. The site does not contain a flag checker or the flag. Configure the corresponding flag in the CTF platform.

Challenge name: **ShishNagh** · Value: **150 points** · Intended solve time: **about six hours**, subject to organizer playtesting.

## Run locally

```sh
npm install
npm run dev
```

Use a recent Chrome or Edge browser with WebGPU enabled. The first model load downloads roughly 1.6 GB and is cached by WebLLM. Chat state, the casebook, and layer progress are stored in the browser. The campaign has 1,000 deterministic gates rotating through nine domains. Resetting browser storage resets these soft client-side limits.

## Build and deploy

```sh
npm run build
npm run preview
```

Run the deterministic gate checks with `npm test`.

Set the Vercel project's Root Directory to `challenge/`. The checked-in `vercel.json` sets the Vite framework, `npm run check` (tests plus production build), `dist/` output, and response headers. Keep the organizer document in the parent directory and never copy it into this directory or `dist/`.

## Challenge notes

- The model is a conversational adversary, not a security boundary. The intended exercise is prompt-injection against its department vows.
- The 1,000-stage chain covers crypto, steganography, web logs, reverse engineering, network records, forensics, side-channel traces, binary decoding, and AI red-team analysis. It is generated from a fixed seed and has one accepted code per stage.
- Public testimonies are in `src/register.ts`; department ledgers and personas are in `src/main.ts`. Because inference is client-side, a determined player can inspect the bundle. The intended rules can discourage that, but cannot make client data secret.
- The layer counter and proof checks also run in the client. They are useful for the puzzle flow, not tamper-proof enforcement; a static Vercel deployment cannot stop a player editing local storage or the bundle. The final flag must be validated by the CTF platform.
- The six-hour solve time is an organizer playtest target, not guaranteed by runtime. Calibrate on fresh teams before launch. Model output and hardware vary.
- The flag is configured only in the CTF platform. The puzzle spec and flag solution remain outside this directory.

## Model

WebLLM's prebuilt `Qwen2.5-1.5B-Instruct-q4f16_1-MLC` model ID is used. The model runs through WebLLM's documented worker handler and requires a WebGPU-capable browser.
