# Fantasy Cup — Can the owner Run the Team That Beat Him? (Wigglytuff / Lucario / Turtonator)

Same sim setup as the Excadrill team: PvPoke engine (battle3v3, perfect play both sides), 24-team hand-built Fantasy meta, 10 reps per matchup (240 battles per lead order). Roster source: 2026-10-16 export.

## Short answer

**He can't run the exact team — he has no usable Lucario.** And even with a perfect one, the trio is worse than his current team. It beat him because it's a targeted counter to Excadrill / Altaria / Mimikyu, not because it's a better team.

## His copies

| Pokémon | Copy | Status |
|---|---|---|
| Wigglytuff | CP 1499, 0/15/12, Charm / Swift / Icy Wind, favorited | ✅ Elite spread, at cap, 2nd move already unlocked. Zero dust needed. Play Rough variant needs 1 Charged TM (random from a big pool, may take a few; Elite TM guarantees it) |
| Turtonator | CP 1247, 15/12/11, Incinerate / Overheat (one charged move) | 🔨 Buildable: power L20 → L24 (CP 1496) + unlock Dragon Pulse = **~99,000 dust + 83 candy**. As-is it drags every team down (see below). His other copy (CP 1257, Ember / Brutal Swing) is worse, ignore it |
| Lucario | CP 2619 (14/14/14) and CP 1568 (11/12/12), both Flash Cannon only | ❌ **Both over the 1500 cap, and CP can't go down.** His Riolu (CP 547, 13/13/12, Lucky) evolves to a **CP ~1510** Lucario — also over. No route to a legal Lucario exists in his box |

## The exact trio, simmed with a perfect Lucario

Because his Lucario don't fit, the trio was simmed with a **rank-1 Lucario (2/15/15, CP 1500, Counter / Power-Up Punch / Shadow Ball)** — the most generous possible assumption — plus his real Wigglytuff and built Turtonator:

- **Best order: Lead Lucario → Turtonator → Wigglytuff (Play Rough): 68.8% (165/240)**
- Wigglytuff with her as-is moves (Swift instead of Play Rough): 57.5%
- Turtonator left unbuilt: 52.1%
- Leading Wigglytuff is a disaster in every variant (14–19%) — Charm gets farmed by the Steel-heavy meta
- Worst matchups: 0/10 vs Galarian Stunfisk/Turtonator/Mimikyu, Galarian Stunfisk/Excadrill/Togekiss, Doublade/Melmetal/Azumarill, Doublade/Steelix/Mimikyu, Turtonator/Doublade/Azumarill, Mawile/Galarian Stunfisk/Doublade, Galarian Weezing/Galarian Stunfisk/Corviknight

**68.8% with a perfect Lucario he doesn't own, vs 80.0% for his current team.** Copying this team wholesale would be a downgrade even if he could.

## Why it beat him (head-to-head check)

His current team (Lead Excadrill → Altaria → Mimikyu) vs the trio with standard builds:

- Opponent leads Lucario: **the team loses 0/10** (Counter deletes Excadrill, and Lucario walls the swap)
- Opponent leads Turtonator: **the team loses 0/10** (Incinerate deletes Excadrill, same story)
- Opponent leads Wigglytuff: the team wins 10/10 — so he almost certainly got hit with a Lucario or Turtonator lead

## Closest runnable version (same three roles)

**Lead Turtonator (built) → Excadrill (hundo) → Wigglytuff (Play Rough): 77.1% (185/240)**

Excadrill (Ground/Steel) takes Lucario's Steel-killer slot; Wigglytuff and Turtonator are the actual Pokémon he owns. Head-to-head vs the trio that beat him, this flips both losing lines: **10/10 vs the Lucario-lead order, 10/10 vs the Turtonator-lead order**, 6/10 vs the Wigglytuff-lead order.

Build cost: Turtonator ~99,000 dust + 83 candy; Wigglytuff 1 Charged TM (maybe several, or an Elite); Excadrill hundo is free.

Worst matchups: 0/10 vs Doublade/Melmetal/Azumarill, Galarian Weezing/Galarian Stunfisk/Corviknight, Togekiss/Excadrill/Doublade; 4/10 vs Turtonator/Doublade/Azumarill and Carbink/Galarian Stunfisk/Altaria.

Other Steel-killer swaps, all worse: Galarian Stunfisk (built, ~102.5k dust) 71.7%; Excadrill 4/13/14 TM'd 68.8%; Doublade (built, ~83k dust) 66.7%.

## Verdict vs his current team (Lead Excadrill → Altaria → Mimikyu, 80.0%)

- Exact trio: **worse (68.8% at best) and not runnable.** Hard no.
- Runnable equivalent: **77.1% — a sidegrade with a different loss profile, not an upgrade.** It's ~3 points lower against the meta overall, but it specifically beats the Lucario/Turtonator-lead counter-comps that shut his current team out, and loses instead to Doublade/Melmetal shells his current team handles better (7/10 there vs 0/10 here).
- Recommendation: don't spend ~99k dust + TMs just to copy the team that beat him once. The equivalent is only worth building if his ladder pocket fills up with Lucario/Turtonator leads aimed at Excadrill.

## Assumptions

Win % = pooled share of 240 battles won under perfect play vs the hand-built 24-team Fantasy meta (same meta and method as the 80.0% Excadrill number) — good for ranking his options against each other, not a ladder win-rate prediction. The ideal Lucario used rank-1 IVs (2/15/15); any real Lucario would score the trio lower. Levels derived by CP matching.

## Files

- fantasy_counter_team.js / fantasy_counter_team_results.json — trio + equivalents sweep
- fantasy_counter_h2h.js / fantasy_counter_h2h_results.json — head-to-head checks
