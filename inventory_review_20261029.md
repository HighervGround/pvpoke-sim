# Inventory Cleanup — 2026-10-29

Source: fresh SX export, 5,026 rows (stored roster, ~4h old at export time).
Live box reported by the owner: 5,324 / 4,575. Target: transfer ≥ 749 to get under cap.
Read-only analysis. No transfers made. SX strings verified by simulation (exact match).

## Why the box is over cap despite auto-release ON

SX's own verdict on this export: only 12 "Release", all caught 10/28/2026 (today).
Everything older than 24h carries "Caught over 24 h ago" in Kept by and is auto-Kept.
So auto-release only ever trims fresh catches; it never touches the old box.
That is the root cause: the old box can only shrink by manual transfer.

## Layers (all counts exact; strings verified, 0 over-match unless noted)

| Layer | Count | What it is |
|---|---|---|
| L1 non-legendary | 223 | Matches NO keep rule. Biggest: Zubat 145, Pikachu 25, Charmander 18, Unown extras 11 |
| L1 legendary | 94 | Same, but Legendary/Mythical/UB duplicates (Palkia 16, Zamazenta 8, Kyurem 7, Lunala 6, …) |
| L2c PvP false positives | 29 | PvP spreads on explicitly useless species (Stantler 9, Illumise 3, Pidgey 3, …), no other keep reason |
| L3 PvP dedup | 42 | PvP spread strictly dominated within species+form+shadow at BOTH 500 and 1500 caps (≥1% stat-product gap), no other keep reason |
| L5 strict high-IV dedup | 336 | High-IV copy strictly dominated within species+form on BOTH IV total and stat product, no other keep reason. 332 via string + 4 identical twins flagged for manual handling |
| L5 legendary | 6 | Same as L5, legendary |

Union non-legendary: 625. Union with legendaries: ~724.
Target 749. Shortfall: 124 without legendaries, ~25 with legendaries.
Live box after all layers: ~4,600 (still ~25 over cap).

## Gap closers (not in the plan yet)

- Fresh re-export after "Update now" is running: the ~300 catches since this export
  (mostly recent Halloween spawns) should add safe mons and cover the ~25 gap.
- Kept ONLY by favorite: 512 mons (Jolteon 15, Vaporeon 10, Mewtwo 9, …). Unfavoriting
  junk would free these, but that is manual in-game work and a rule change.
- Kept ONLY by costume: 336 mons (Vulpix 87, Noibat 84, Piplup 75, …). Relaxing costume
  protection to one per costume variant would free most of these.

## Keep-rule counts on this export (overlap allowed)

Favorite 1,932; IV >91% 1,280; Shiny 1,242; Dex rep 1,049; Legacy 540; Costume 470;
PvP spread 438; Shadow 359; XXS/XXL 164; Dynamax top-2 95; Background 41;
Unown top-3 41; Nundo 5.

## Unown update

57 total, 22 letters. Gained D, F, and ! since Oct 16. Still missing: J, M, Q, R, V, ?.
11 Unown extras (beyond 3 per letter) are in L1.

## Files

- safe_to_transfer_20261029.csv (L1 all), _nonlegendary, _legendary
- layer_l2c_20261029.csv, layer_l3_20261029.csv, layer_l5_strict_20261029.csv
- sx_strings_20261029.txt, sx_strings_layers_20261029.txt, sx_string_l5_strict_20261029.txt
- Scripts: inventory_review_20261029.py, inventory_layers_20261029.py

## Status

Plan previewed, nothing transferred. Awaiting the main account's legendary decision and the
fresh re-export before execution.

## Fresh export update (2026-10-29, 5,320 rows, current to within 4 of live 5,324)

Re-ran all layers on the refreshed export. L1 non-legendary grew 223 -> 306
(mostly Zubat: 145 -> 239, from recent Halloween catches). All other layers
essentially unchanged: L1 legendary 94, L2c 29, L3 43, L5 strict 339, L5 leg 6, L6 5.

- Union non-legendary: 714 (35 short of the 749 target; lands at 4,610, still over cap)
- Union with legendaries: 814 (65 over target; lands at 4,510, under cap with room)
- All fresh strings verified exact, 0 over-match, 0 twins.

So the legendary decision is now the decider: with legendaries the plan clears
the cap, without them it does not. Files with `_fresh` suffix; strings in
sx_strings_layers_fresh.txt.
