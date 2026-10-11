import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("Vercel is configured to build and serve this Vite project from dist", async () => {
  const config = JSON.parse(await readFile(path.join(root, "vercel.json"), "utf8"));
  assert.equal(config.framework, "vite");
  assert.equal(config.buildCommand, "npm run check");
  assert.equal(config.outputDirectory, "dist");
  const headers = config.headers.find((entry) => entry.source === "/(.*)").headers;
  const csp = headers.find((entry) => entry.key === "Content-Security-Policy").value;
  assert.match(csp, /worker-src 'self' blob:/);
  assert.match(csp, /https:\/\/\*\.huggingface\.co/);
  assert.match(csp, /https:\/\/raw\.githubusercontent\.com/);
});

test("production HTML points only to built assets and contains no submitted flag", async () => {
  const dist = path.join(root, "dist");
  const html = await readFile(path.join(dist, "index.html"), "utf8");
  const assets = await readdir(path.join(dist, "assets"));
  for (const asset of assets) assert.ok(asset.length > 0);
  assert.match(html, /<title>ShishNagh/);
  assert.doesNotMatch(html, /shambala\.md/i);
  const linkedAssets = [...html.matchAll(/(?:src|href)="(\/assets\/[^\"]+)"/g)].map((match) => path.basename(match[1]));
  assert.ok(linkedAssets.length >= 2, "HTML should reference the built JS and CSS bundles");
  for (const asset of linkedAssets) assert.ok(assets.includes(asset), `missing built asset: ${asset}`);
  const bundled = (await Promise.all(assets.map((asset) => readFile(path.join(dist, "assets", asset), "utf8")))).join("\n");
  assert.doesNotMatch(bundled, /KCTF\{vibhishana_wind_east\}/i);
});
