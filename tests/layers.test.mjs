import test from "node:test";
import assert from "node:assert/strict";
import { LayerEngine, LAYER_COUNT, DOMAINS, domainForIndex } from "../src/layers/LayerEngine.ts";
import { solveLayer } from "./layer-solver.mjs";

test("the campaign contains exactly 1,000 deterministic layers", () => {
  const first = new LayerEngine();
  const second = new LayerEngine();
  const solutions = new Set();
  assert.equal(LAYER_COUNT, 1000);
  for (let id = 1; id <= LAYER_COUNT; id++) {
    const layer = first.getLayer(id);
    assert.deepEqual(layer, second.getLayer(id));
    assert.equal(layer.id, id);
    assert.equal(layer.domain, domainForIndex(id));
    assert.ok(layer.artifact.length > 0);
    assert.ok(layer.instructions.length > 0);
    const solution = solveLayer(layer);
    solutions.add(solution);
    assert.equal(solution.length, 8, `layer ${id} should decode to an eight-character answer`);
    assert.equal(first.verify(id, solution), true, `layer ${id} should accept its decoded answer`);
    assert.equal(first.verify(id, "WRONG-CODE"), false);
  }
  assert.equal(solutions.size, LAYER_COUNT, "every stage should have a unique accepted code");
});

test("all nine domain families appear and progress tiers increase", () => {
  const engine = new LayerEngine();
  const domains = new Set();
  for (let id = 1; id <= LAYER_COUNT; id++) domains.add(engine.getLayer(id).domain);
  assert.deepEqual([...domains].sort(), [...DOMAINS].sort());
  assert.equal(engine.getLayer(1).tier, 1);
  assert.equal(engine.getLayer(1000).tier, 10);
});

test("layer identifiers and proofs reject malformed input", () => {
  const engine = new LayerEngine();
  for (const invalid of [0, -1, 1001, 1.5, Number.NaN]) {
    assert.throws(() => engine.getLayer(invalid), RangeError);
    assert.throws(() => engine.verify(invalid, "A"), RangeError);
  }
  assert.equal(engine.verify(1, ""), false);
  assert.equal(engine.verify(1, "not the answer"), false);
});

test("campaign seed changes the generated artifacts", () => {
  const standard = new LayerEngine();
  const alternate = new LayerEngine("alternate test seed");
  assert.notDeepEqual(alternate.getLayer(101), standard.getLayer(101));
  assert.equal(alternate.verify(101, solveLayer(alternate.getLayer(101))), true);
});
