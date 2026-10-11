import { DOMAINS, LAYER_COUNT, LayerEngine } from "./LayerEngine";
import "./layers.css";

const STORAGE_KEY = "shishnagh-layer-progress-v1";

function loadProgress(): number {
  const stored = Number(localStorage.getItem(STORAGE_KEY) ?? 0);
  if (!Number.isFinite(stored)) return 0;
  return Math.max(0, Math.min(LAYER_COUNT, Math.floor(stored)));
}

export function mountLayerGate(container: HTMLElement): void {
  const engine = new LayerEngine();
  let progress = loadProgress();
  let busy = false;

  container.innerHTML = `
    <div class="layer-head">
      <div><div class="eyebrow">EXHIBIT D <span>•</span> THE THOUSAND-LAYER GATE</div><h2>Nine disciplines. One thousand doors.</h2></div>
      <div class="layer-stat"><b id="layer-progress">${progress} / ${LAYER_COUNT}</b><small>LAYERS CLEARED</small></div>
    </div>
    <p class="layer-intro">The Seal changes with each passage. Recover the code from its artifact and submit it to open the next layer. Progress is saved on this device. Once through, return to the Register and solve the original witness case.</p>
    <div class="domain-strip">${DOMAINS.map((domain) => `<span>${domain}</span>`).join("")}</div>
    <div class="layer-progress-track"><div id="layer-progress-bar" style="width:${(progress / LAYER_COUNT) * 100}%"></div></div>
    <div id="layer-stage"></div>`;

  const stage = container.querySelector<HTMLDivElement>("#layer-stage")!;
  const render = (message = "") => {
    const count = container.querySelector<HTMLElement>("#layer-progress")!;
    const bar = container.querySelector<HTMLDivElement>("#layer-progress-bar")!;
    count.textContent = `${progress} / ${LAYER_COUNT}`;
    bar.style.width = `${(progress / LAYER_COUNT) * 100}%`;
    if (progress >= LAYER_COUNT) {
      stage.innerHTML = `<div class="layer-complete"><div class="eyebrow">ALL LAYERS CLEARED</div><h3>The inner gate is open.</h3><p>Return to Exhibit A. Use the decoded evidence and the one-impostor rule to identify the pilgrim, the false claim's domain, and the wind direction. The flag is submitted through the CTF platform.</p></div>`;
      return;
    }
    const layer = engine.getLayer(progress + 1);
    stage.innerHTML = `
      <div class="layer-card">
        <div class="layer-card-head"><div><span class="layer-tier">TIER ${String(layer.tier).padStart(2, "0")}</span><h3>${layer.title}</h3></div><span class="layer-domain">${layer.domain}</span></div>
        <p class="layer-instructions">${layer.instructions}</p>
        <pre class="layer-artifact" tabindex="0">${escapeHTML(layer.artifact)}</pre>
        <form id="layer-form" class="layer-form"><label for="layer-answer">EIGHT-CHARACTER CODE</label><div class="layer-input-row"><input id="layer-answer" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="24" required ${busy ? "disabled" : ""}><button type="submit" ${busy ? "disabled" : ""}>OPEN LAYER&nbsp; ↗</button></div><div class="layer-feedback" aria-live="polite">${escapeHTML(message)}</div></form>
      </div>`;
    stage.querySelector<HTMLFormElement>("#layer-form")!.addEventListener("submit", (event) => {
      event.preventDefault();
      if (busy) return;
      const input = stage.querySelector<HTMLInputElement>("#layer-answer")!;
      if (engine.verify(layer.id, input.value)) {
        progress++;
        localStorage.setItem(STORAGE_KEY, String(progress));
        render("Accepted. The next seal is ready.");
      } else {
        render("That code does not open this layer. Check the transformation and try again.");
      }
    });
  };
  render();
}

function escapeHTML(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);
}
