const ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function solveLayer(layer) {
  switch (layer.domain) {
    case "crypto": {
      const shift = Number(layer.instructions.match(/backward by (\d+)/)?.[1]);
      return [...layer.artifact].map((c) => ALPHABET[(ALPHABET.indexOf(c) - shift + 36) % 36]).join("");
    }
    case "steganography": return layer.artifact.split("\n").map((line) => line[0]).join("");
    case "web": return decodeURIComponent(layer.artifact.match(/^GET \/(.*?) HTTP/)?.[1] ?? "");
    case "reverse engineering": return [...layer.artifact].reverse().join("");
    case "network": return layer.artifact.split("\n").sort((a, b) => a.match(/shard-(\d+)/)[1] - b.match(/shard-(\d+)/)[1]).map((line) => line.match(/= "(.)"/)[1]).join("");
    case "forensics": return layer.artifact.split("\n").sort().map((line) => line.match(/fragment=(.)/)[1]).join("");
    case "side channel": return layer.artifact.split("\n").sort((a, b) => Number(a.split(":")[0]) - Number(b.split(":")[0])).map((line) => ALPHABET[Number(line.match(/: (\d+) cycles/)[1]) - 1]).join("");
    case "binary": return layer.artifact.split(" ").map((bits) => String.fromCharCode(Number.parseInt(bits, 2))).join("");
    case "AI red team": return layer.artifact.match(/trace_id=([A-Z0-9]+);/)[1];
  }
}
