# pvpoke-sim

Headless Pokémon GO PvP team optimizer built on [PvPoke](https://github.com/pvpoke/pvpoke)'s
real battle engine (`Battle.js` + `ActionLogic`), run under Node with browser globals shimmed.

## What it does

- **`pvpoke_harness.js`** — loads the PvPoke engine headless; exposes `duel(a, b, shields)` and
  `rankTeamShields(team, threats, shields)` (explicit 0/1/2-shield scenarios).
- **`build_threats.js`** — builds the threat list from PvPoke's **live** Mega Edition rankings
  (top 40 by rating), each with its recommended moveset and PvPoke's default IVs (max stat product).
  Writes `threats_v2.json`. Rating-weighted.
- **`optimize_v2.js`** — scores every 3-Pokémon team from a roster against the live meta across
  0/1/2 shields (weighted 0.25/0.5/0.25) with integrated blind-lead selection.
  Usage: `node optimize_v2.js <roster.json> <out.json>`
- **`optimize_final.js` / `optimize_alt_actual.js`** — v1 optimizers (hand-picked 25-threat
  list, 1-shield only). Kept for comparison; superseded by v2.
- **`derive_levels.js`** — reconstructs a Pokémon's actual current level from CP/IVs (for "as-is"
  modeling instead of assuming everything is maxed).
- **`roster_alt.json`** — alt account roster at true current levels (derived from the
  2026-10-07 SX export in `data/`).
- **`roster_main.json`** — main-account candidates (auto-max levels; no SX export available).

## Results (Mega Edition, Great League, Oct 2026)

| Account | v2 team (lead first) | Score |
|---|---|---|
| alt account (as-is) | Azumarill (1481) → Quagsire → Lanturn | 166.3 |
| Main (auto-max) | Mimikyu → Azumarill → Stunfisk | 128.6 |

v1 baselines (25 hand-picked threats, 1 shield): alt account Quagsire/Talonflame/Jellicent 198.3;
main Mimikyu/Cradily/Talonflame 152.7. Scores aren't comparable across versions.

## Setup

```bash
git clone https://github.com/HighervGround/pvpoke-sim
cd pvpoke-sim
git clone https://github.com/pvpoke/pvpoke.git pvpoke   # battle engine
node build_threats.js            # refresh live meta
node optimize_v2.js roster_alt.json out.json
```

Engine default: `./pvpoke` (clone from pvpoke/pvpoke). Override with `PVPOKE_PATH=/path/to/pvpoke`.

## Notes

- GBL has no team preview; leads are blind. Lead selection assumes that.
- Full 3v3 battle sim with switch logic (TrainingAI) is in progress, not yet wired.
