> CORRECTION (2026-10-30, late): the percentages in this report were computed with the pre-fix battle3v3 driver, which had two seat artifacts (sequential faint switch-ins and sequential voluntary-switch decisions) that systematically gifted one seat. The driver is fixed; mirrors now split 45-56% by seat. Re-run headline on the fixed driver: Morpeko/Clodsire/Mimikyu pools 69.0% (410/594) vs the same 33-team meta, down from 73.4%. Treat the per-team cells below as approximate until re-run.

# Halloween Cup 2026 — the main account's best team (main account)

## Answer first: lead order

**Lead Morpeko → Clodsire → Mimikyu, all as-is, zero build.**

- **Lead: Morpeko, CP 1492 (11/15/14), Thunder Shock / Aura Wheel / Psychic Fangs** (Full Belly form, 2 charged moves)
- **Clodsire, CP 1499 (0/14/13), Poison Sting / Stone Edge / Earthquake** (2 charged moves)
- **Mimikyu, CP 1484 (15/12/15), Shadow Claw / Shadow Sneak / Play Rough** (2 charged moves)

No TMs, no power-ups, no second-move unlocks. Every mon is in the Oct 29 export and in **none** of the six transfer layers (verified against layer_l1_nonleg, layer_l1_leg, layer_l2c, layer_l3, layer_l5_strict, layer_l5s_leg), so the cleanup does not touch this team.

## Pooled result (with assumptions)

**73.4% (436/594 battles)** vs a 33-team hand-built Halloween meta.

Assumptions, same message as the number: PvPoke engine via `~/workspace/pvpoke-sim/` (`battle3v3.js`), TrainingAI level 3 on both sides, 2 shields each, lead order as listed. Opponent teams use rank-1-ish [4,15,15] IVs and standard movesets, fitted to the 1500 CP cap. the main account's mons use their exact export CPs and movesets; sim levels were derived from CP (Morpeko L27.5, Clodsire L30.5, Mimikyu L23.5) because the export's Level column proved unreliable (e.g., Gourgeist listed at L5 with CP 1482, which is impossible); engine CP matches export CP exactly for all three. Pooled across 2 independent rounds (each 3 runs x 3 reps = 9 battles per meta team, 18 per meta team pooled). Single rounds swung a few points because a handful of matchups are genuine coin flips (see below); most matchups were all-or-nothing across reps.

Win % here is the share of hand-built meta teams/battles beaten under perfect play by both sides. It is good for ranking the main account's options, NOT a ladder win-rate prediction. Real ladder IVs, movesets, and play vary.

## Cup rules (sourced)

Mega Halloween Cup: Great League Edition, **October 27 – November 3, 2026** (live now), CP at or below 1500, Bug-, Poison-, Ghost-, Dark-, and Fairy-type Pokemon only (a dual type qualifies if at least one type is on the list), Mega Evolution allowed with one Mega per team per guide rules, 4x Stardust from win rewards. Sources: theclick.gg Mega Halloween Cup guide (published/updated Oct 27, 2026), digancy.com October/November 2026 event schedules, Dexerto Halloween Cup guide. Mimikyu is legal after the June 23, 2026 PvP update (per theclick.gg; old "Mimikyu banned" advice is out of date). No Megas were simmed for this report (engine Mega support not used); Mega Sableye is a known meta option per guides, but the main account's Sableye copies are low-CP single-charged-move mons, so it is not recommended here.

## Why this team wins

- **Morpeko lead** applies fast shield pressure: Thunder Shock charges quickly, Aura Wheel threatens, Psychic Fangs is super-effective into Poison types and drops Defense. It beats the bulk of the meta's leads outright.
- **Clodsire** is the Steel/Poison answer: Earthquake is super-effective into Tinkaton, Nidoqueen (via Poison), and other Steels/Poisons, while Poison Sting is super-effective into Fairies like Azumarill. It also walls the Electric mirror.
- **Mimikyu closer** handles Ghosts and Fighters/Darks that trouble the front two, with Shadow Claw pressure plus Shadow Sneak baits and Play Rough nukes.
- The three share no common weakness that the meta exploits: Morpeko's Ground immunity problem is covered by Clodsire and Mimikyu, and Clodsire's Water/Grass/Ice weaknesses are covered by Morpeko's pressure and Mimikyu's resistances.

## Holes (honest)

Pooled per-matchup records for the headline team (wins of 18 battles):

- **0/18 losses:** Tinkaton/Mimikyu/Clodsire (the guide's #1 team), Nidoqueen/Azumarill/Umbreon, Scrafty/Azumarill/Clodsire, Drapion/Azumarill/Mimikyu, Alolan Ninetales/Azumarill/Clodsire, Golurk/Azumarill/Mimikyu.
- **Near-losses:** Galarian Weezing/Azumarill/Clodsire 2/18, Dusclops/Azumarill/Mimikyu 3/18.
- **Close wins:** Gourgeist/Azumarill/Umbreon 10/18, Umbreon/Nidoqueen/Azumarill 11/18, Toxicroak/Azumarill/Clodsire 14/18.
- **Everything else: 18/18.** That includes both Sableye teams, both Shadow teams (Shadow Gengar, Shadow Nidoqueen), Trevenant, Greninja, both Morpeko/Tinkaton variants except the Tinkaton-led one, Scizor, Heracross, Chandelure, Clefable, Wigglytuff, Sylveon, Aegislash, Malamar, and the Carbink/Forretress/Morpeko guide team.

Practical notes on the holes:

- **Tinkaton leads are the big hole.** Tinkaton's Fairy Wind is super-effective into Morpeko (Dark) and Bulldoze is super-effective into Morpeko (Electric). On a Tinkaton lead, switch to Clodsire immediately: Clodsire resists Fairy Wind (Poison resists Fairy) and answers with super-effective Earthquake.
- **Ground types wall Morpeko completely** (Electric moves do zero damage to Ground). Never leave Morpeko in against Nidoqueen, Clodsire, or Golurk; Psychic Fangs is its only scoring move there, and it is not enough. Let Clodsire (Earthquake) and Mimikyu (Shadow moves vs Ghosts) do that work.
- **Nidoqueen cores** are the second hole for the same reason: Morpeko cannot touch Nidoqueen with Electric moves, and Nidoqueen's Earth Power punishes Morpeko and Clodsire alike. Mimikyu is the best remaining answer (Shadow Claw neutral, Play Rough resisted by Poison, so this is a grind).
- **Bulky Ghost walls (Dusclops, Golurk)** blunt Morpeko and force Mimikyu to do the Ghost-fighting alone.

## Runner-up (also zero-build)

**Lead Malamar → Clodsire → Mimikyu: 70.0% pooled (416/594)**, same protocol, pooled across 2 rounds.

- Malamar, CP 1495 (1/14/15), Psywave / Foul Play / Superpower (2 charged moves, as-is)
- Clodsire, CP 1499, as above
- Mimikyu, CP 1484, as above

Malamar is the more consistent, bulkier lead (Psywave charges fast, Foul Play hits Ghost/Psychic super-effectively, Superpower hits Steel/Dark). Its holes differ slightly: it loses outright to Tinkaton/Mimikyu/Clodsire (0/18), Sableye/Azumarill/Nidoqueen (0/18), Drapion/Azumarill/Mimikyu (0/18), and Alolan Muk/Azumarill/Tinkaton (0/18), with soft losses to Sylveon (3/18), Scizor (4/18), and Clefable (5/18). Pick Malamar over Morpeko if Morpeko's form-change mechanic (below) worries you, or if you prefer a bulkier lead; pick Morpeko for the higher ceiling.

## Lead order is load-bearing (tested)

Same trio, different lead, pooled 297 battles each:

| Team (lead first) | Pooled |
|---|---|
| Lead Morpeko → Clodsire → Mimikyu | 73.4% (436/594) |
| Lead Malamar → Clodsire → Mimikyu | 70.0% (416/594) |
| Lead Morpeko → Clodsire → Azumarill (0/15/15) | 62.6% (186/297) |
| Lead Malamar → Azumarill → Clodsire | 56.9% (169/297) |
| Lead G-Weezing → Clodsire → Mimikyu | 56.2% (167/297) |
| Lead Mandibuzz → Clodsire → Azumarill | 55.6% (165/297) |
| Lead G-Weezing → Morpeko → Clodsire | 51.2% (152/297) |
| Lead Clodsire → Morpeko → Azumarill | 48.8% (145/297) |
| Lead Malamar → Clodsire → Azumarill | 48.1% (143/297) |
| Lead Clodsire → Malamar → Mimikyu | 46.1% (137/297) |
| Lead Mimikyu → Clodsire → Azumarill | 45.5% (135/297) |
| Lead G-Corsola → Azumarill → Umbreon | 42.8% (127/297) |
| Lead Aegislash → Clodsire → Mimikyu | 40.7% (121/297) |
| Lead Mimikyu → Morpeko → Clodsire | 35.7% (106/297) |
| Lead Mimikyu → Clodsire → Umbreon | 33.3% (99/297) |
| Lead Azumarill → Morpeko → Clodsire | 32.7% (97/297) |
| Lead Mimikyu → Malamar → Clodsire | 32.0% (95/297) |
| Lead Gourgeist → Azumarill → Umbreon | 27.3% (81/297) |

The Malamar trio collapses from 70.0% to 46.1% (Clodsire lead) and 32.0% (Mimikyu lead). Do not reorder the headline team: Morpeko must lead.

## Other zero-build options screened (not recommended as headline)

- **Galarian Weezing CP 1499 (11/13/15, Fairy Wind / Sludge / Overheat)** and CP 1486 (13/15/14, same moves) both survive and are 2-charged-move guide sets; the G-Weezing-led team scored 56.2%.
- **Azumarill CP 1499 (0/15/15, Bubble / Play Rough / Ice Beam)** is the exact guide set and survives; it appears in the Morpeko-led runner-up (62.6%) but the Mimikyu closer outperforms it in the headline slot.
- **Mandibuzz CP 1476 (11/14/13, Snarl / Aerial Ace / Foul Play)** is the guide set and survives; its team scored 55.6%.
- **Aegislash Shield CP 1493 (15/14/14, Psycho Cut / Shadow Ball / Gyro Ball)**, **Gourgeist Super CP 1482 (13/13/15, Hex / Seed Bomb / Shadow Ball)**, **Galarian Corsola CP 1493 (13/15/15, Astonish / Power Gem / Night Shade, costume form)**, **Malamar CP 1495**, **Wigglytuff CP 1499 (0/15/12, Charm / Swift / Icy Wind)**, **Slurpuff CP 1497 (5/11/15, Charm / Energy Ball / Draining Kiss)**, and **Crustle CP 1490 (11/14/6, Fury Cutter / X-Scissor / Rock Wrecker)** all survive with usable movesets but scored lower as leads or were not needed.
- **Not available as keeps:** Nidoqueen (only over-cap copies), Trevenant (only CP 1916), Heracross (all over cap), Chandelure (over cap). These are opponent-only threats for the owner.
- **Tinkaton CP 1494 (10/14/15, Fairy Wind / Flash Cannon, single charged move)** would need a second-move unlock plus an Elite Charged TM for Gigaton Hammer to reach the guide set; it was not simmed as a headline option because the zero-build teams above already outperform, and its exact build cost was not verified in-game. Check the in-game cost before spending anything on it.

## Caveats

- **Morpeko form-change:** the engine models Full Belly Morpeko with fixed Electric-type Aura Wheel. In live GO, Morpeko's Aura Wheel alternates Electric/Dark as its form flips mid-battle, so live Morpeko play may differ slightly from these sims. If that mechanic matters to you, the Malamar team (70.0%) is the no-asterisk alternative.
- **Meta is hand-built, not ladder data:** 33 teams built from the strongest eligible mons (guides + PvPoke rankings knowledge), each with standard movesets at [4,15,15] IVs. Second-tier threats not in the meta (Dusclops/Golurk are in; further down: Runerigus, Cursola, Dragalge, Zweilous, Spiritomb variants, Toxtricity) were not simmed; the headline team's typing coverage against them follows from the same logic (Mimikyu for Ghosts, Clodsire Earthquake for Steels/Poisons).
- **Shadow Clodsire could not be simmed** (the engine's gamemaster has no `clodsire_shadow` entry), so it is absent from the meta; a Shadow Clodsire opponent would be a tough matchup for the Morpeko lead for the same Ground-immunity reason as regular Clodsire mirrors.
- **Export freshness:** screening used the Oct 29 export (5,320 rows); the live box has since shown 5,331, so 11 newer mons were not screened. None of the recommended mons are affected.
- **Umbreon note:** his Umbreon carries Dark Pulse, not the legacy Last Resort the guides list; this does not affect the headline team (Umbreon is not in it), but the Umbreon-led alt teams would want Last Resort for full strength.
- **No in-game action was taken.** This is analysis only: no transfers, TMs, power-ups, or unlocks.

## Files

- Report: this file
- Screening: `halloween_screen.py`, `halloween_keeps.json`, `halloween_screen_out.txt`
- Validation: `halloween_validate.js`
- Sims: `halloween_sims.js` (round 1), `halloween_sims_r2.js` (round 2 order variants), `halloween_sims_r3.js` (headline re-run)
- Results: `halloween_results_3_3.json`, `halloween_results_r2_3_3.json`, `halloween_results_r3_S.json`
- Source export: `SX box export CSV`

## Addendum Nov 1, 2026: Mega check (the original run simmed no Megas)

The cup is a Mega cup; the original meta had zero Mega teams on either side.
Re-ran on the fixed driver against the 33-team meta plus 6 Mega foe teams
(39 teams, 1053 battles per candidate, halloween_mega.js):
- Lead Tinkaton (built) -> Clodsire -> Mimikyu: 83.4% (new #1 in the mega meta)
- Lead Jellicent -> Azumarill -> Tinkaton (built): 81.9% (one new hole: the
  M-Venusaur foe team, 0/27)
- Incumbent Morpeko -> Clodsire -> Mimikyu: 71.6%
- the main account's own Mega teams all trail: Jellicent -> M-Sableye -> Tinkaton 65.7%,
  Morpeko -> Clodsire -> M-Sableye 57.1%, M-Sableye lead 51.6%, M-Altaria 44.4%,
  M-Venusaur 40.4%.
Verdict: recommendations unchanged; TCM edges JAT once Megas are included.
(First pass of this addendum had a Shadow Punch fast-move typo on the foe
M-Gengar that made it beat every team 0/27; caught, fixed to Shadow Claw,
and re-run before delivery.)
