# Fantasy Cup — the team from the main account's box that counters the three guide teams

*Sim-only (PvPoke engine, perfect play both sides). Nothing changed on the game account. Method: 918 legal trios from his candidate pool screened head-to-head vs all three guide teams in all 6 of their lead orders (2 reps); finalists re-run at 10 reps × 3 independent runs, pooled — 540 h2h battles and 720 meta battles per finalist. Guide teams use rank-1-type IVs and the published PvPoke sets (same rank-1 builder as the prior h2h analyses). Win % = share of battles won under optimal play; it ranks his options, it is not a ladder win-rate prediction.*

**The guide teams countered:**
- **G1:** Galarian Stunfisk (Mud Shot / Rock Slide / Earthquake) / Azumarill (Bubble / Ice Beam / Play Rough) / Shadow Galarian Weezing (Fairy Wind / Sludge / Overheat)
- **G2:** Turtonator (Incinerate / Dragon Claw / Overheat) / Corviknight (Sand Attack / Air Cutter / Payback) / Forretress (Volt Switch / Sand Tomb / Rock Tomb)
- **G3:** Forretress / Galarian Weezing / Azumarill (same sets)

---

## The counter — Lead Galarian Weezing → Turtonator → Aegislash

**Head-to-head vs the guide teams: 100.0% (540/540)** — G1 100%, G2 100%, G3 100%, across every lead order of every guide team. It is the only trio in his box (of 918 swept) that sweeps all three lists.

- **Galarian Weezing** CP 1499 (11/13/15), Fairy Wind / Sludge / Overheat — as-is, free. His regular Weezing does the Shadow's job here: Sludge deletes Azumarill, Overheat threatens every Steel on the lists, Fairy Wind farms the Dragons.
- **Turtonator** (15/12/11) built to CP 1496, Incinerate / Overheat / Dragon Pulse — **~99,000 dust + 83 candy** (power-up L20→L24 + Dragon Pulse unlock).
- **Aegislash (Shield)** CP 1493 (15/14/14), Psycho Cut / Shadow Ball / Gyro Ball — as-is, free.

**Build cost: ~99,000 dust + 83 candy, all of it the Turtonator. No TMs.**

### The catch — it is a one-trick team

**Meta score vs the 24-team Fantasy ladder meta: 38.3% (276/720).** The hardest of hard counters to the three published lists gets farmed by the actual ladder. Worst matchups, all 0/30:

- Galarian Stunfisk / Doublade / Mimikyu
- Galarian Stunfisk / Altaria / Doublade
- Galarian Stunfisk / Corviknight / Azumarill
- Galarian Stunfisk / Turtonator / Mimikyu
- Doublade / Steelix / Mimikyu

The guide lists are beatable because their backlines are fixed (Azumarill + Weezing, Corviknight + Forretress). Ladder shells pair the same Galarian Stunfisk lead with Doublade/Mimikyu instead, and this trio has no answer for that. **Do not ladder with it.** It is an answer to three specific team lists, nothing more.

---

## Best FREE counter — Lead Galarian Weezing → Mimikyu → Aegislash

**Head-to-head: 78.7% (425/540)** — G1 57.2%, G2 78.9%, G3 100%. **Meta: 61.4% (442/720). Build cost: zero** — all three as-is (Weezing CP 1499, Mimikyu CP 1484 15/12/15, Aegislash CP 1493).

The cheapest real fix if the guide comps are what he's actually queueing into, especially G1 (see below). Still an 18-point meta sacrifice vs his current team, and its own 0/30 ladder holes: Galarian Stunfisk / Turtonator / Mimikyu, Doublade / Steelix / Mimikyu, Shadow Excadrill / Altaria / Mimikyu, Melmetal / Tinkaton / Azumarill, Orthworm / Galarian Stunfisk / Mimikyu.

Runner-up free option — Lead Galarian Weezing → Mimikyu → Excadrill (hundo): 75.6% h2h (G1 68.9%, G2 57.8%, G3 100%), meta 54.6%, zero cost. Better vs G1, worse vs G2 and the ladder than the Aegislash version.

Built runner-up — Lead Galarian Weezing → Turtonator → Excadrill (hundo): 85.9% h2h (G1 78.9%, G2 100%, G3 78.9%), meta 46.0%, same ~99k Turtonator build. Dominated by the Aegislash version on both axes per dust spent.

---

## How his existing teams do vs the guide teams (same finals, pooled)

| Team | h2h combined | G1 | G2 | G3 | Meta (this run) | Known meta (pooled, prior) |
|---|---|---|---|---|---|---|
| **Counter: G-Weezing → Turtonator → Aegislash** | **100.0%** | 100 | 100 | 100 | 38.3% | — |
| Counter (free): G-Weezing → Mimikyu → Aegislash | 78.7% | 57.2 | 78.9 | 100 | 61.4% | — |
| Current best order: Exca → Mimikyu → Altaria | 54.6% | **0** | 74.4 | 89.4 | 74.7% | — |
| Current: Exca → Altaria → Mimikyu | 42.8% | **0** | 71.7 | 56.7 | 79.6% | 79.6% |
| Alt-A: Turtonator → Skarmory → Mimikyu (~201k dust) | 40.9% | 33.3 | 56.1 | 33.3 | 86.0% | 84.8% |
| Alt-C: S-Dragonair → Mimikyu → Corviknight (free) | 28.7% | 19.4 | 33.3 | 33.3 | 82.5% | 81.0% |

## Bottom line

- The published lists are counterable — one trio in his box beats all three at 100% — but every point of guide-counter strength comes straight out of ladder strength (100% h2h ↔ 38% meta; 79% h2h ↔ 61% meta; his ladder teams sit at 29–55% h2h and 75–86% meta). There is no team in his box that does both.
- His real, specific hole is **G1** (Galarian Stunfisk + Azumarill + Shadow Galarian Weezing): his current team goes **0%** against it in both lead orders, and Alt-C only 19%. He already beats G2/G3 at passable rates (72–89% in the Mimikyu-second order).
- Practical read: if he's queueing into G1-style teams repeatedly in his pocket, the free G-Weezing → Mimikyu → Aegislash is the rotation — it fixes G1 to 57% and G3 to 100% for zero resources, at the cost of ladder coverage. The 99k Turtonator build only makes sense as a pure anti-guide statement, and even then the free Aegislash trio captures most of the value.

## Files

- fantasy_guide_counter_screen.js / fantasy_guide_counter_screen_shard0–3.json / fantasy_guide_counter_screen_all.json — 918-trio screen
- fantasy_guide_counter_finals.js / fantasy_guide_counter_finals_list.json / fantasy_guide_counter_finals_run1–3.json — pooled finals (h2h per guide team + per-order, meta per-matchup)
