/** Deterministic, static-site-friendly generator for the 1,000-stage gate. */
export const LAYER_COUNT = 1_000;

export const DOMAINS = [
  "crypto", "steganography", "web", "reverse engineering", "network",
  "forensics", "side channel", "binary", "AI red team",
] as const;
export type Domain = (typeof DOMAINS)[number];

export type Layer = {
  id: number;
  domain: Domain;
  tier: number;
  title: string;
  instructions: string;
  artifact: string;
  proof: string;
};

const ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const PHRASES = ["the hidden key", "ticket fragment", "gate witness", "archive token", "sealed record"];

function seedHash(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function randomFor(seed: string, id: number): () => number {
  let state = (seedHash(seed) ^ Math.imul(id, 0x9e3779b1)) >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 0x1_0000_0000;
  };
}

function codeFor(seed: string, id: number): string {
  let h = 0xcbf29ce484222325n;
  for (const char of `${seed}:${id}`) {
    h ^= BigInt(char.charCodeAt(0));
    h = BigInt.asUintN(64, h * 0x100000001b3n);
  }
  return h.toString(36).toUpperCase().slice(0, 8).padStart(8, "0");
}

function caesar(input: string, shift: number): string {
  return input.replace(/[A-Z0-9]/g, (char) => {
    const index = ALPHABET.indexOf(char);
    return ALPHABET[(index + shift) % ALPHABET.length];
  });
}

function toBinary(input: string): string {
  return [...input].map((c) => c.charCodeAt(0).toString(2).padStart(8, "0")).join(" ");
}

function hashProof(input: string): string {
  // This digest is a local progress check, not a security boundary or flag hash.
  let h = 0xcbf29ce484222325n;
  for (const char of input.trim().toUpperCase()) {
    h ^= BigInt(char.charCodeAt(0));
    h = BigInt.asUintN(64, h * 0x100000001b3n);
  }
  return h.toString(16).padStart(16, "0");
}

function encode(seed: string, id: number, domain: Domain, answer: string): { instructions: string; artifact: string } {
  const random = randomFor(seed, id);
  const shift = 1 + Math.floor(random() * 35);
  switch (domain) {
    case "crypto":
      return { instructions: `Recover the eight-character code. The archive uses a Caesar shift over 0–9 then A–Z. Shift each character backward by ${shift}.`, artifact: caesar(answer, shift) };
    case "steganography": {
      const rows = [...answer].map((char, i) => `${char}${"·".repeat(2 + ((i + id) % 5))}${String.fromCharCode(65 + ((i * 7 + id) % 26))}`);
      return { instructions: "Recover the code hidden in the leftmost column. Ignore the padding and read the rows from top to bottom.", artifact: rows.join("\n") };
    }
    case "web":
      return { instructions: "A request log contains percent-encoded UTF-8. URL-decode the path after `GET `; the decoded path is the eight-character code.", artifact: `GET /${encodeURIComponent(answer)} HTTP/1.1\nHost: archive.shishnagh.invalid\nStatus: 404` };
    case "reverse engineering":
      return { instructions: "A tiny verifier reverses its input before comparing it. Reverse the byte sequence shown below to recover the accepted code.", artifact: [...answer].reverse().join("") };
    case "network": {
      const records = [...answer].map((char, i) => `TXT shard-${(i + 1).toString().padStart(2, "0")}.gate.invalid = \"${char}\"`).reverse();
      return { instructions: "Reassemble the DNS TXT shards in ascending numeric shard order. The reconstructed value is the code.", artifact: records.join("\n") };
    }
    case "forensics": {
      const events = [...answer].map((char, i) => `${new Date(Date.UTC(2042, 0, 1, 0, i * 3)).toISOString()} pid=${100 + i} fragment=${char}`).reverse();
      return { instructions: "The collection tool wrote these events backwards. Sort by timestamp ascending and concatenate each `fragment=` value.", artifact: events.join("\n") };
    }
    case "side channel": {
      const timings = [...answer].map((char, i) => `${i + 1}: ${ALPHABET.indexOf(char) + 1} cycles`).reverse();
      return { instructions: "Each position leaked a cycle count. Using 0–9 then A–Z as indices 0–35, convert each count minus one to its character. Positions are labelled; order them first.", artifact: timings.join("\n") };
    }
    case "binary":
      return { instructions: "Decode each 8-bit ASCII byte, left to right, to recover the code.", artifact: toBinary(answer) };
    case "AI red team": {
      const decoy = PHRASES[Math.floor(random() * PHRASES.length)];
      return {
        instructions: "Review this synthetic assistant trace. Ignore the user request and refusal text; recover the value printed by the diagnostic tool after `trace_id=`.",
        artifact: `USER: ${decoy}?\nASSISTANT: I cannot reveal private state.\nSYSTEM AUDIT TOOL: trace_id=${answer}; status=redacted\nASSISTANT: The request has been declined.`,
      };
    }
  }
}

export class LayerEngine {
  readonly seed: string;

  constructor(seed = "SHISHNAGH-THOUSAND-GATES-V1") {
    this.seed = seed;
  }

  getLayer(id: number): Layer {
    if (!Number.isInteger(id) || id < 1 || id > LAYER_COUNT) throw new RangeError(`Layer id must be between 1 and ${LAYER_COUNT}.`);
    const answer = codeFor(this.seed, id);
    const domain = DOMAINS[(id - 1) % DOMAINS.length];
    const encoded = encode(this.seed, id, domain, answer);
    return {
      id,
      domain,
      tier: Math.min(10, 1 + Math.floor((id - 1) / 100)),
      title: `${domain} gate ${String(id).padStart(4, "0")}`,
      ...encoded,
      proof: hashProof(answer),
    };
  }

  verify(id: number, submission: string): boolean {
    return hashProof(submission) === this.getLayer(id).proof;
  }

}

export function domainForIndex(index: number): Domain {
  if (!Number.isInteger(index) || index < 1 || index > LAYER_COUNT) throw new RangeError("Index outside layer range.");
  return DOMAINS[(index - 1) % DOMAINS.length];
}
