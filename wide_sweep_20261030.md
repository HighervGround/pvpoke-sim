> CORRECTION (2026-10-30, late): the percentages in this report were computed with the pre-fix battle3v3 driver, which had two seat artifacts (sequential faint switch-ins and sequential voluntary-switch decisions) that systematically gifted one seat. The driver is fixed; mirrors now split 45-56% by seat. Re-run headline on the fixed driver: Morpeko/Clodsire/Mimikyu pools 69.0% (410/594) vs the same 33-team meta, down from 73.4%. Treat the per-team cells below as approximate until re-run.

# Halloween Cup wide sweep — Oct 30, 2026

the owner challenged the Morpeko team pick ("can't find me a better team bro fr"), so the search was widened: every trio from an 18-mon pool of his actual box copies (auto-fit level, his IVs and moves), 816 trios screened at 33 battles, top 15 tested in all 6 lead orders at 99, top 5 pooled at 297, finalists re-pooled at 891. Scripts: wide_sims.js, finals2.js. Same protocol as always: 33-team hand-built meta, battle3v3, TrainingAI lvl 3 both sides, 2 shields.

## Pooled 891-battle head-to-head

- Lead Tinkaton (BUILT) → Clodsire → Mimikyu: 663/891 = 74.4%
- Lead Morpeko → Clodsire → Mimikyu (incumbent, as-is): 662/891 = 74.3%
- Tinkaton team full auto-fit rerun: 665/891 = 74.6%

Dead tie. The 297-run gap (75.4 vs 74.4) was noise.

## Build cost for the Tinkaton version

His Tinkaton: CP 1494, 10/14/15, Fairy Wind / Flash Cannon (single charged move). Needs: second move unlock (50 candy + 50,000 dust), Elite Charged TM for Gigaton Hammer (Community Day move, regular TM can never roll it), regular Charged TM(s) to land Bulldoze on the other slot. Verdict delivered: not worth it for a tie.

## Hole profiles differ (0/27 cells at 891)

- Tinkaton team loses hard to: Trevenant/Azumarill/Mandibuzz, Greninja/Clodsire/Mimikyu, Shadow Nidoqueen/Azumarill/Clodsire, Chandelure/Azumarill/Clodsire, Dusclops/Azumarill/Mimikyu, Golurk/Azumarill/Mimikyu.
- Morpeko team loses hard to: Tinkaton/Mimikyu/Clodsire, Nidoqueen/Azumarill/Umbreon, Scrafty/Azumarill/Clodsire, Drapion/Azumarill/Mimikyu, A-Ninetales/Azumarill/Clodsire, Golurk/Azumarill/Mimikyu (plus G-Weezing/Azumarill/Clodsire 2/27).

The Tinkaton build fixes the Nidoqueen/Umbreon hole and opens Ghost-shell holes. Same win rate, different losses.

## Best of the rest (297 pooled)

- Lead Morpeko → Mimikyu → Charjabug: 71.7%
- Lead Morpeko → Charjabug → Jellicent: 70.7%
- Lead Malamar → Morpeko → Jellicent: 70.4%
- Lead Morpeko → Jellicent → Mimikyu: 66.0%

Rescue check on trios the order-biased screen may have buried (Wigglytuff, Galvantula, Dedenne, G-Weezing cores): best was 59/99. Nothing close.

## Conclusion

Across everything he can field, Morpeko/Clodsire/Mimikyu is tied for the best Halloween team in his box. No better team exists without the Tinkaton build, and the build only ties.

## Fixed-driver re-sweep (2026-10-30, late)

Re-ran the full 816-trio sweep on the fixed battle3v3 driver (see the correction note at the top). Pooled at 891 vs the same 33-team meta:

- Lead Jellicent → Azumarill → Tinkaton (built): 734/891 = 82.4%
- Lead Tinkaton (built) → Clodsire → Mimikyu: 723/891 = 81.1%
- Incumbent Morpeko → Clodsire → Mimikyu (as-is): 617/891 = 69.2%

The old dead-tie verdict does not survive the fix; the incumbent is a clear third. Caveat: the hida12282 shell (Shadow Forretress / Shadow Drapion / Jellicent) beats both Tinkaton teams 0/198 in pooled both-orientation sims, while the incumbent takes 39.2% against it. Scripts: finals3.js, jat_vs_hida.js, tcm_vs_hida.js.
