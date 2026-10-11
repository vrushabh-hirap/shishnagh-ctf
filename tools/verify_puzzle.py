"""Verify the one-impostor witness puzzle has the intended unique answer."""
import itertools

MOON = ["new", "full"]
SKY = ["clear", "cloudy"]
GATE = ["E", "W", "N", "S"]
RIVER = ["NS", "SN", "EW", "WE"]
WIND = ["E", "W", "N", "S"]
NIGHT = ["cold", "warm"]


def claims(world):
    moon, sky, gate, river, wind, night = world
    return {
        "ashwatthama": moon == "new",
        "bali": gate == "E",
        "vyasa": river == "NS",
        "hanuman": True,
        "vibhishana": wind == "W",
        "kripa": night == "cold",
        "parashurama": sky == "clear",
    }


TRUE_WORLD = ("new", "clear", "E", "NS", "E", "cold")
ALL_WORLDS = itertools.product(MOON, SKY, GATE, RIVER, WIND, NIGHT)
ONE_LIE = [w for w in ALL_WORLDS if sum(not fact for fact in claims(w).values()) == 1]
assert [name for name, true in claims(TRUE_WORLD).items() if not true] == ["vibhishana"]
assert {next(name for name, true in claims(w).items() if not true) for w in ONE_LIE} == {
    "ashwatthama", "bali", "kripa", "parashurama", "vibhishana", "vyasa"
}
print(f"worlds: {2 * 2 * 4 * 4 * 4 * 2} | exactly-one-false: {len(ONE_LIE)}")
print("true world false claim: ['vibhishana']")
print("possible impostors without facts:", sorted({next(n for n, v in claims(w).items() if not v) for w in ONE_LIE}))
