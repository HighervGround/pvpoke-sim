# Fantasy Cup — Excadrill Correction (Oct 20, 2026)

Re-sim of Lead Excadrill → Altaria → Mimikyu vs the same 24-team Fantasy meta (battle3v3, 10 reps, 240 battles), using the main account's OTHER Excadrill: **CP 1498, 4/13/14** instead of the hundo.

## Corrected recommendation

**If you run your 4/13/14 Excadrill, TM it first: Iron Head → Rock Slide, Earthquake → Drill Run (2 regular Charged TMs). Never run it as-is.**

- **Lead Excadrill (CP 1498, 4/13/14, Mud Shot / Rock Slide / Drill Run) → Altaria → Mimikyu: 75.0% (180/240)**
- As-is (Iron Head / Earthquake): **38.8% (93/240)** — unplayable. Iron Head does nothing in this meta and slow Earthquake with no Rock Slide leaves Corviknight and every Flyer uncovered.

## Comparison

| Excadrill | Moves | Win % |
|---|---|---|
| CP 1483, 15/15/15 (hundo) | Mud Shot / Rock Slide / Drill Run | 80.0% in the original stage-2 run; 77.9% (187/240) on a same-day re-run |
| CP 1498, 4/13/14 | Mud Shot / Rock Slide / Drill Run (after 2 TMs) | 75.0% (180/240) |
| CP 1498, 4/13/14 | Mud Shot / Iron Head / Earthquake (as-is) | 38.8% (93/240) |

The hundo's 80.0% vs 77.9% gap is run-to-run variance in just two matchups (Mawile / Galarian Stunfisk / Doublade went 5/10 → 1/10; one other went 7/10 → 6/10); the other 22 matchups were identical. Same-run, the hundo edges the TM'd 4/13/14 by 7 battles. Since the hundo is already in the box with the right moves at zero cost, it stays the pick — but the TM'd 4/13/14 is a legitimate near-equal if you'd rather run that one.

## Spread check (Great League)

- **4/13/14: PvP rank #8 of 4,096**, stat product 1,573,199 (L17, CP 1498)
- **15/15/15: PvP rank #1,339 of 4,096**, stat product 1,520,917 (L16, CP 1483)

The 4/13/14 is by far the better spread on paper (+3.4% stat product, much bulkier). It doesn't translate into a better team score here because the hundo's higher Attack wins a few charge-move-priority and breakpoint races in this specific meta; the rank gap shows up in matchup flips both ways (see below), not in the total.

## Worst matchups — best variant (4/13/14 TM'd, 75.0%)

- 0/10 — Doublade / Melmetal / Azumarill (the hundo got 6/10 here; the single biggest flip)
- 0/10 — Corviknight / Galarian Stunfisk / Tinkaton
- 0/10 — Galarian Weezing / Galarian Stunfisk / Corviknight
- 1/10 — Shadow Excadrill / Altaria / Mimikyu
- 2/10 — Shadow Forretress / Turtonator / Azumarill (hundo got 0/10; slight improvement)
- 4/10 — Galarian Stunfisk / Corviknight / Azumarill
- Sweeps 15 of 24 meta teams 10/10. Notably it fixes the hundo's worst non-shutout: Mawile / Galarian Stunfisk / Doublade goes from 1–5/10 (hundo) to a clear win with the bulkier Excadrill.

## Method

Same engine and settings as the original Fantasy Cup sim (PvPoke battle3v3, TrainingAI 3, 2 shields, perfect play both sides, 24-team hand-built meta). Stat products cross-checked: the formula enumeration and the engine's own computed stats agree exactly for both spreads. Raw results: fantasy_excadrill_compare_results.json; script: fantasy_excadrill_compare.js. Win % is share of meta teams beaten under perfect play, for ranking options — not a ladder prediction. Nothing was changed on the game account.
