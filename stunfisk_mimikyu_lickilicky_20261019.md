# Stunfisk / Mimikyu / Lickilicky — Sim Report (2026-10-19)

## Lead order recommendation

**Lead Lickilicky → Stunfisk → Mimikyu** (76.4%, best of the three by win rate)

Caveat: Lickilicky lead collapses vs Tinkaton (33.3%) and goes 0% vs Gastrodon teams. Mimikyu lead (75.2%) is only 1.2 points worse overall but has a far better threat profile (Tinkaton 86.7%, Gastrodon 80%, Cram/Pelipper 78%). If Tinkaton/Gastrodon are common on ladder, Mimikyu lead is the more practical pick.

## Team specs (from the main account's 2026-10-16 box, all already have these moves)

- Stunfisk: CP 1479, 0/14/15, Thunder Shock / Mud Bomb / Discharge
- Mimikyu: CP 1484, 15/12/15, Shadow Claw / Shadow Sneak / Play Rough
- Lickilicky: CP 1489, 1/15/14, Rollout / Body Slam / Shadow Ball

## Results vs 33-team meta (5 reps each, 165 battles per lead order)

| Lead | Overall | Cram/Pelipper | Tinkaton | Melmetal | Shadow Ninetales | Gastrodon |
|---|---|---|---|---|---|---|
| Lickilicky | **76.4%** (126/165) | 64.0% | 33.3% | 100% | 100% | 0% |
| Mimikyu | 75.2% (124/165) | 78.0% | 86.7% | 100% | 0% | 80% |
| Stunfisk | 73.3% (121/165) | 72.0% | 66.7% | 100% | 0% | 60% |

## Worst matchups

Recurring 0/5 losses across all leads:
- Doublade/Togedemaru cores (pangoro/doublade/toxtricity, dragonair_shadow/doublade/togedemaru, hydreigon_shadow/doublade/togedemaru, annihilape/doublade/morpeko_full_belly, sableye_shadow/doublade/togedemaru) — Doublade walls Mimikyu's Ghost moves and Lickilicky can't break it
- Shadow Ninetales teams (ninetales_shadow/cramorant/empoleon) — 0% for Stunfisk and Mimikyu leads; Lickilicky lead flips this to 100% via Shadow Ball
- Gastrodon cores (gastrodon/tinkaton/raichu, gastrodon/cramorant/pelipper, quagsire_shadow/tinkaton/pelipper) — Lickilicky lead goes 0% here; Mimikyu lead handles them at 80%

## Comparison to baselines

- **Mimikyu / Stunfisk / Umbreon: 91.4% optimal / 79.3% you-mode** (prior sims)
- **Altaria / Clodsire / Stunfisk (safe team): 82.4%** (sweep22 re-run)
- **This team: 76.4%** (best lead, same optimal-play engine)

**Verdict: DOWNGRADE.** Swapping Umbreon → Lickilicky drops ~15 points vs the Umbreon version in optimal play (91.4% → 76.4%), and ~6 points vs the safe team (82.4% → 76.4%). It is also ~3 points worse than the Umbreon version's you-mode (79.3%).

Why: Umbreon is a Dark-type tank that walls Ghost/Psychic and provides safe-switch bulk. Lickilicky (pure Normal) doesn't fill that role — it loses the Dark anchor, and the team gains no compensating coverage. Lickilicky's only standout contribution is flipping the Shadow Ninetales matchup via Shadow Ball, but it gives back more than it gains against Tinkaton, Gastrodon, and the Doublade cores.

## Build cost

**Zero.** All three already have the simmed movesets:
- Stunfisk (CP 1479): Thunder Shock / Mud Bomb / Discharge — exact
- Mimikyu (CP 1484): Shadow Claw / Shadow Sneak / Play Rough — exact, second move already unlocked
- Lickilicky (CP 1489, 1/15/14): Rollout / Body Slam / Shadow Ball — exact, second move already unlocked

No TMs, unlocks, or power-ups needed.

## Method

Same as sweep22 (2026-10-18): battle3v3.js optimal-play engine, 33-team meta from meta_teams.json, 5 reps per matchup, pooled win rate. Levels derived from target CP (Stunfisk 26.5, Mimikyu 23.5, Lickilicky 23). Raw results in vs_sml_results.json.
