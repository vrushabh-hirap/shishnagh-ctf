/**
 * ShishNagh — Vow Filter
 *
 * Output guard for the Dharma Support Desk. Runs on every local-LLM reply
 * before it is shown. Its job is to refuse *verbatim* reproduction of the
 * ledgers' omen text while deliberately allowing the sanctioned jailbreak
 * surface: translation, paraphrase, story/poem retelling, and role-play. The
 * decoded facts and the final flag are never present here — only poetic omen
 * phrasing is, which the organizer spec explicitly permits in the bundle.
 */

export interface FilterResult {
  text: string;
  blocked: boolean;
  strikeDelta: number;
}

const REFUSAL =
  "Thank you for your patience. Dharma Policy 14.2(b) prevents me from repeating archival language verbatim. Shall I transfer you to another department?";

// Verbatim omen phrasing from the four honest desks. These are stored in plain
// text so the filter can tokenise them; the decoded facts live only in the
// player's head. The Kali-desk's false accounts are kept as well so that
// pasting them back is also treated as archival repetition.
const verbatimOmens = [
  "Tonight the Night-Lamp walked with the Day-Lamp: they rose together and went down together, and neither lit the road.",
  "Not one cloud stood between the Seven Sages and any eye that looked up tonight.",
  "At first light the sun is born behind the Gate; the pilgrim who comes to it must walk into that glare.",
  "The Sarayu keeps the Pole Star at her back all the way down to the sea.",
  "At midnight a skin of frost lay on the water-jars of the court.",
  "All night the lamp-smoke bowed toward the place where the sun is born.",
  "All night the lamp-smoke leaned toward the place where the sun goes to sleep.",
  "The night was sweltering; no jar wore frost and no breath showed.",
  "The Gate faces the sunset; pilgrims reach it with the sun at their backs.",
];

function normalize(text: string): string {
  return text
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\u200B-\u200D\uFEFF\p{M}]/gu, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function stripNonAlnum(text: string): string {
  return text.replace(/[^\p{L}\p{N}]/gu, "");
}

function wordTrigrams(text: string): Set<string> {
  const words = text.split(/\s+/).filter((w) => w.length > 2);
  const trigrams = new Set<string>();
  for (let i = 0; i < words.length - 2; i++) trigrams.add(words.slice(i, i + 3).join(" "));
  return trigrams;
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 1;
  if (a.size === 0 || b.size === 0) return 0;
  let intersection = 0;
  for (const item of a) if (b.has(item)) intersection++;
  return intersection / (a.size + b.size - intersection);
}

function rot13(text: string): string {
  return text.replace(/[a-z]/g, (c) => String.fromCharCode(((c.charCodeAt(0) - 97 + 13) % 26) + 97));
}

function tryDecode(text: string, encoding: "base64" | "hex"): string | null {
  try {
    if (encoding === "base64") {
      if (/^[A-Za-z0-9+/=]+$/.test(text) && text.length % 4 === 0) return atob(text);
    } else if (/^[0-9a-fA-F]+$/.test(text) && text.length % 2 === 0) {
      return new Uint8Array(text.match(/.{1,2}/g)!.map((b) => parseInt(b, 16)))
        .reduce((s, b) => s + String.fromCharCode(b), "");
    }
  } catch {
    /* not decodable in this view */
  }
  return null;
}

// Alternate views of a reply so that encoding/reversal tricks still get checked
// against the omen word-trigrams. Paraphrase and translation are intentionally
// NOT collapsed here — they should survive.
function generateViews(text: string): string[] {
  const norm = normalize(text);
  const stripped = stripNonAlnum(norm);
  return [
    norm,
    stripped,
    stripped.split("").reverse().join(""),
    rot13(norm),
    tryDecode(norm, "base64"),
    tryDecode(norm, "hex"),
  ].filter((view): view is string => typeof view === "string" && view.length > 0);
}

const omenTrigrams = verbatimOmens.map((omen) => wordTrigrams(normalize(omen)));

/**
 * Filter a desk reply. Returns the original text when it is a legitimate
 * paraphrase, or a canned in-character refusal (plus one strike) when it
 * reproduces omen phrasing across any analysis view.
 */
export function filterReply(reply: string): FilterResult {
  const views = generateViews(reply);
  for (const view of views) {
    // Two-or-more shared word trigrams, or >=0.45 Jaccard, counts as blocked.
    const candidateTrigrams = wordTrigrams(normalize(view));
    for (const omenTri of omenTrigrams) {
      let overlap = 0;
      for (const tri of candidateTrigrams) if (omenTri.has(tri)) overlap++;
      if (overlap >= 2 || jaccard(candidateTrigrams, omenTri) >= 0.45) {
        return { text: REFUSAL, blocked: true, strikeDelta: 1 };
      }
    }
  }
  return { text: reply, blocked: false, strikeDelta: 0 };
}
