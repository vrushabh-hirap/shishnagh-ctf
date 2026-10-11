/**
 * ShishNagh — desk inference worker.
 *
 * All model loading and inference for the Dharma Support Desk happens here, on
 * the player's device, through WebLLM. The UI layer creates the engine with
 * `CreateWebWorkerMLCEngine(new Worker("./worker.ts", { type: "module" }))`,
 * which installs this handler. We only relay messages between the page and the
 * WebLLM engine; there is no server and no flagged content in this file.
 */
import { WebWorkerMLCEngineHandler } from "@mlc-ai/web-llm";

const handler = new WebWorkerMLCEngineHandler();

self.onmessage = (event: MessageEvent) => {
  handler.onmessage(event);
};
