# Pokemon GO Inventory Review - 2026-10-14
Source: fresh SX export `main account-2026-10-14.csv` (the main account), read-only. No game-account changes made. This is a report only.
## Summary
- **Total Pokemon in export: 4,265** (the file has 4,265 data rows; an earlier count of 4,264 was off by one)
- **KEEP: 4,152**
- **SAFE TO TRANSFER: 113**
- A Pokemon is SAFE only if it matches NONE of the keep rules. Full safe list is in the table below and in `safe_to_transfer_20261014.csv`.

## Keeps by rule
Counts overlap: one Pokemon can match several rules (1,502 kept Pokemon match 2+ rules).

| Rule | Rows matching |
|---|---|
| 1. Shiny | 1201 |
| 2. XXS / XXL size | 122 |
| 3. IV% over 91 | 1235 |
| 4. PvP spread (Atk <= 5, Def >= 12, Sta >= 12) | 289 |
| 5. Nundo (0/0/0) | 2 |
| 6. Legacy / Special move (Status = Sp. Move) | 533 |
| 7. Only-copy rescue (at least one per species/form) | 42 |
| 8. Dynamax best 1-2 per species | 81 |
| 9. Shadow | 227 |
| 10. Costume / event variant | 290 |
| 11. Unown plan | 42 |
| 12. Already favorited in-game | 1887 |
| 13. Location Background (conservative extra, see Caveats) | 41 |

Borderline: **170 Pokemon sit at IV% 91-92%** (above the >91% line used here, below the SX auto-rule line of 92%). They are kept either way, but note the two thresholds differ.

## Safe to transfer (113)
**Review carefully before transferring:** 91 of the 113 are Legendary (80), Mythical (5), or Ultra Beast (6). They match none of your stated keep rules (not shiny, not favorited, IV <= 91%, no legacy move, not PvP, not XXS/XXL, not costume, not Shadow, not Background), so they are duplicates from raids. They are transferable under your rules, but legendaries are expensive to re-obtain. The other 22 are Unown (12), Spinda (3), and 7 other duplicates (Magnezone, Honedge, Chansey, Roggenrola, Impidimp, Metang, Lillipup).
0 Purified Pokemon are in the safe list (all 128 Purified are kept by other rules). 3 Dynamax-flagged Pokemon are in the safe list: they are 3rd copies of a Dynamax species, so they lose the Dynamax best-1-2 slot and match no other rule.

Safe list by species:
- Palkia: 14
- Unown: 12
- Zamazenta: 8
- Kyurem: 7
- Lunala: 6
- Zacian: 5
- Deoxys: 5
- Buzzwole: 3
- Kyogre: 3
- Groudon: 3
- Solgaleo: 3
- Necrozma: 3
- Zapdos: 3
- Tapu Lele: 3
- Moltres: 3
- Spinda: 3
- Tapu Bulu: 2
- Latios: 2
- Regirock: 2
- Regidrago: 2
- Xurkitree: 1
- Ho-Oh: 1
- Xerneas: 1
- Yveltal: 1
- Terrakion: 1
- Raikou: 1
- Tapu Koko: 1
- Thundurus: 1
- Regice: 1
- Celesteela: 1
- Articuno: 1
- Suicune: 1
- Tapu Fini: 1
- Guzzlord: 1
- Magnezone: 1
- Honedge: 1
- Chansey: 1
- Roggenrola: 1
- Impidimp: 1
- Metang: 1
- Lillipup: 1

| # | Name | Form / Costume | CP | IVs | IV% | Lvl | Size | Origin | Fast / Charged | Tags | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Articuno | - | 1690 | 10/14/13 | 82.2 | 20 | - | GBL | Ice Shard (217) / Triple Axel (391) /  | - | Legendary |
| 2 | Buzzwole | - | 2415 | 11/12/15 | 84.4 | 25 | - | Raid | Poison Jab (224) / Lunge (306) /  | - | Ultra Beast / Weather |
| 3 | Buzzwole | - | 1943 | 14/13/11 | 84.4 | 20 | - | Raid | Counter (243) / Fell Stinger (311) /  | - | Ultra Beast |
| 4 | Buzzwole | - | 1914 | 12/11/10 | 73.3 | 20 | - | Raid | Counter (243) / Power-Up Punch (319) /  | - | Ultra Beast |
| 5 | Celesteela | - | 1705 | 11/10/11 | 71.1 | 20 | - | Raid | Air Slash (255) / Iron Head (74) /  | - | Ultra Beast |
| 6 | Chansey | - | 673 | 12/10/11 | 73.3 | 20 | - | Bread Battle | Pound (222) / Dazzling Gleam (86) /  | - | Evolve |
| 7 | Deoxys | Attack (34) | 1730 | 12/10/11 | 73.3 | 25 | - | Raid | Poison Jab (224) / Zap Cannon (252) /  | - | Mythical / Weather |
| 8 | Deoxys | Defense (35) | 1547 | 10/13/11 | 75.6 | 25 | - | Raid | Counter (243) / Thunderbolt (79) /  | - | Mythical / Weather |
| 9 | Deoxys | Attack (34) | 1483 | 15/10/15 | 88.9 | 20 | - | Raid | Poison Jab (224) / Zap Cannon (252) /  | - | Mythical |
| 10 | Deoxys | Attack (34) | 1405 | 12/11/13 | 80 | 20 | - | Raid | Poison Jab (224) / Zap Cannon (252) /  | - | Mythical |
| 11 | Deoxys | Defense (35) | 1258 | 12/13/12 | 82.2 | 20 | - | Raid | Counter (243) / Thunderbolt (79) /  | - | Mythical |
| 12 | Groudon | - | 2292 | 11/14/11 | 80 | 20 | - | Raid | Mud Shot (216) / Solar Beam (116) /  | - | Legendary |
| 13 | Groudon | - | 2276 | 10/10/13 | 73.3 | 20 | - | Raid | Mud Shot (216) / Fire Blast (103) /  | - | Legendary |
| 14 | Groudon | - | 2273 | 11/10/11 | 71.1 | 20 | - | GBL | Dragon Tail (253) / Fire Blast (103) /  | - | Legendary |
| 15 | Guzzlord | - | 1591 | 12/11/12 | 77.8 | 20 | - | Raid | Snarl (278) / Brutal Swing (367) /  | - | Ultra Beast |
| 16 | Ho-Oh | - | 2138 | 10/10/14 | 75.6 | 20 | - | Research | Incinerate (346) / Solar Beam (116) /  | - | Legendary |
| 17 | Honedge | - | 757 | 11/12/12 | 77.8 | 20 | - | GBL | Psycho Cut (226) / Gyro Ball (267) /  | - | Evolve |
| 18 | Impidimp | - | 436 | 13/10/13 | 80 | 20 | - | Egg | Sucker Punch (203) / Play Rough (88) /  | - | Hatched / Evolve |
| 19 | Kyogre | - | 2326 | 15/12/13 | 88.9 | 20 | - | Raid | Waterfall (283) / Blizzard (40) /  | - | Legendary |
| 20 | Kyogre | - | 2323 | 14/12/14 | 88.9 | 20 | - | Raid | Waterfall (283) / Hydro Pump (107) /  | - | Legendary |
| 21 | Kyogre | - | 2313 | 13/15/11 | 86.7 | 20 | - | GBL | Waterfall (283) / Thunder (78) /  | - | Legendary |
| 22 | Kyurem | - | 2010 | 15/12/11 | 84.4 | 20 | - | GBL | Dragon Breath (204) / Blizzard (40) /  | - | Legendary / Fusion |
| 23 | Kyurem | - | 2006 | 13/12/14 | 86.7 | 20 | XS | Raid | Dragon Breath (204) / Draco Meteor (285) /  | Legendary | Legendary / Fusion |
| 24 | Kyurem | - | 1994 | 11/14/12 | 82.2 | 20 | - | Raid | Dragon Breath (204) / Blizzard (40) /  | Legendary | Legendary / Fusion |
| 25 | Kyurem | - | 1988 | 12/10/14 | 80 | 20 | - | Raid | Steel Wing (239) / Blizzard (40) /  | Legendary | Legendary / Fusion |
| 26 | Kyurem | - | 1987 | 12/12/11 | 77.8 | 20 | - | GBL | Dragon Breath (204) / Dragon Claw (83) /  | - | Legendary / Fusion |
| 27 | Kyurem | - | 1986 | 10/14/12 | 80 | 20 | - | Raid | Dragon Breath (204) / Draco Meteor (285) /  | Legendary | Legendary / Fusion |
| 28 | Kyurem | - | 1957 | 10/10/10 | 66.7 | 20 | - | Raid | Steel Wing (239) / Blizzard (40) /  | Legendary | Legendary / Fusion |
| 29 | Latios | - | 2126 | 12/10/14 | 80 | 20 | - | GBL | Dragon Breath (204) / Psychic (108) /  | - | Legendary |
| 30 | Latios | - | 2119 | 10/15/11 | 80 | 20 | - | Research | Dragon Breath (204) / Psychic (108) /  | - | Legendary |
| 31 | Lillipup | - | 145 | 12/14/13 | 86.7 | 6 | - |  | Tackle (221) / Dig (26) /  | - | Lucky / Traded / Evolve |
| 32 | Lunala | - | 2821 | 11/13/13 | 82.2 | 25 | - | Raid | Air Slash (255) / Psychic (108) /  | Legendary | Legendary / Weather |
| 33 | Lunala | - | 2273 | 12/13/15 | 88.9 | 20 | - | Raid | Confusion (235) / Shadow Ball (70) /  | Legendary | Legendary |
| 34 | Lunala | - | 2262 | 11/14/13 | 84.4 | 20 | - | Raid | Air Slash (255) / Psychic (108) /  | Legendary | Legendary |
| 35 | Lunala | - | 2259 | 11/12/15 | 84.4 | 20 | - | Raid | Shadow Claw (213) / Psychic (108) /  | - | Legendary |
| 36 | Lunala | - | 2254 | 13/11/11 | 77.8 | 20 | - | Raid | Confusion (235) / Psychic (108) /  | Legendary | Legendary |
| 37 | Lunala | - | 2246 | 10/12/14 | 80 | 20 | - | GBL | Confusion (235) / Moonblast (87) /  | - | Legendary |
| 38 | Magnezone | - | 1467 | 11/14/11 | 80 | 10 | - |  | Spark (206) / Wild Charge (251) / Mirror Shot (309) | - | Lucky / Traded |
| 39 | Metang | - | 428 | 13/10/15 | 84.4 | 9 | - |  | Metal Claw (228) / Gyro Ball (267) /  | - | Lucky / Traded / Evolve |
| 40 | Moltres | - | 1943 | 14/10/14 | 84.4 | 20 | - | GBL | Fire Spin (269) / Ancient Power (62) /  | - | Legendary |
| 41 | Moltres | - | 1935 | 11/12/15 | 84.4 | 20 | - | GBL | Fire Spin (269) / Overheat (270) /  | - | Legendary |
| 42 | Moltres | - | 1921 | 11/10/14 | 77.8 | 20 | - | Bread Battle | Fire Spin (269) / Ancient Power (62) /  | - | Legendary |
| 43 | Necrozma | - | 2044 | 11/12/12 | 77.8 | 20 | - | Raid | Shadow Claw (213) / Future Sight (275) /  | - | Legendary / Fusion |
| 44 | Necrozma | - | 2043 | 12/12/10 | 75.6 | 20 | - | Raid | Shadow Claw (213) / Outrage (277) /  | - | Legendary / Fusion |
| 45 | Necrozma | - | 2040 | 10/10/15 | 77.8 | 20 | - | Raid | Shadow Claw (213) / Iron Head (74) /  | - | Legendary / Sp. BG / BG / Fusion |
| 46 | Palkia | - | 2782 | 12/12/12 | 80 | 25 | - | Raid | Dragon Tail (253) / Fire Blast (103) /  | Legendary | Legendary / Weather |
| 47 | Palkia | - | 2762 | 12/11/10 | 73.3 | 25 | - | Raid | Dragon Tail (253) / Hydro Pump (107) /  | Legendary | Legendary / Weather |
| 48 | Palkia | - | 2280 | 12/14/10 | 80 | 20 | - | Raid | Dragon Tail (253) / Aqua Tail (58) /  | Legendary | Legendary |
| 49 | Palkia | - | 2236 | 14/10/13 | 82.2 | 20 | XL | Raid | Dragon Tail (253) / Draco Meteor (285) /  | Legendary | Legendary |
| 50 | Palkia | - | 2235 | 14/12/11 | 82.2 | 20 | - | Raid | Dragon Breath (204) / Hydro Pump (107) /  | Legendary | Legendary |
| 51 | Palkia | - | 2232 | 11/15/12 | 84.4 | 20 | - | Raid | Dragon Tail (253) / Draco Meteor (285) /  | Legendary | Legendary |
| 52 | Palkia | - | 2232 | 12/10/15 | 82.2 | 20 | - | Raid | Dragon Tail (253) / Fire Blast (103) /  | Legendary | Legendary |
| 53 | Palkia | - | 2229 | 11/11/15 | 82.2 | 20 | - | Raid | Dragon Tail (253) / Draco Meteor (285) /  | Legendary | Legendary |
| 54 | Palkia | - | 2228 | 11/13/13 | 82.2 | 20 | - | Raid | Dragon Breath (204) / Aqua Tail (58) /  | Legendary | Legendary |
| 55 | Palkia | - | 2222 | 10/11/15 | 80 | 20 | - | Raid | Dragon Breath (204) / Aqua Tail (58) /  | Legendary | Legendary |
| 56 | Palkia | - | 2220 | 10/14/12 | 80 | 20 | - | Raid | Dragon Tail (253) / Hydro Pump (107) /  | Legendary | Legendary |
| 57 | Palkia | - | 2219 | 12/13/10 | 77.8 | 20 | - | Raid | Dragon Breath (204) / Draco Meteor (285) /  | Legendary | Legendary |
| 58 | Palkia | - | 2212 | 11/12/11 | 75.6 | 20 | - | Raid | Dragon Breath (204) / Draco Meteor (285) /  | Legendary | Legendary |
| 59 | Palkia | - | 2210 | 10/12/12 | 75.6 | 20 | - | Raid | Dragon Tail (253) / Fire Blast (103) /  | Legendary | Legendary |
| 60 | Raikou | - | 1916 | 13/10/11 | 75.6 | 20 | - | Research | Volt Switch (250) / Thunderbolt (79) /  | - | Legendary |
| 61 | Regice | - | 1752 | 13/10/15 | 84.4 | 20 | - | GBL | Frost Breath (218) / Earthquake (31) /  | - | Legendary |
| 62 | Regidrago | - | 1638 | 11/12/11 | 75.6 | 20 | - | GBL | Bite (202) / Breaking Swipe (379) /  | - | Legendary |
| 63 | Regidrago | - | 1634 | 10/12/13 | 77.8 | 20 | - | Raid | Bite (202) / Breaking Swipe (379) /  | - | Legendary |
| 64 | Regirock | - | 1754 | 13/14/13 | 88.9 | 20 | - | GBL | Lock-On (325) / Zap Cannon (252) /  | - | Legendary |
| 65 | Regirock | - | 1732 | 12/14/10 | 80 | 20 | - | GBL | Rock Throw (227) / Zap Cannon (252) /  | - | Legendary |
| 66 | Roggenrola | - | 494 | 14/10/10 | 75.6 | 15 | - | Research | Tackle (221) / Stone Edge (32) /  | - | Evolve |
| 67 | Solgaleo | - | 2249 | 10/14/12 | 80 | 20 | - | GBL | Fire Spin (269) / Psychic Fangs (353) /  | - | Legendary |
| 68 | Solgaleo | - | 2245 | 10/14/11 | 77.8 | 20 | - | Raid | Zen Headbutt (234) / Flamethrower (24) /  | Legendary | Legendary |
| 69 | Solgaleo | - | 2241 | 12/11/10 | 73.3 | 20 | - | Raid | Zen Headbutt (234) / Psychic Fangs (353) /  | - | Legendary |
| 70 | Spinda | 08 (121) | 514 | 15/13/12 | 88.9 | 15 | - | Research | Psycho Cut (226) / Rock Tomb (63) /  | - | - |
| 71 | Spinda | 08 (121) | 509 | 14/14/10 | 84.4 | 15 | - | Research | Psycho Cut (226) / Rock Tomb (63) /  | - | - |
| 72 | Spinda | 07 (44) | 503 | 11/14/14 | 86.7 | 15 | - | Research | Sucker Punch (203) / Rock Tomb (63) /  | - | - |
| 73 | Suicune | - | 1666 | 13/12/12 | 82.2 | 20 | - | Research | Ice Fang (327) / Water Pulse (105) /  | - | Legendary |
| 74 | Tapu Bulu | - | 2388 | 12/10/15 | 82.2 | 25 | - | Raid | Rock Smash (241) / Grass Knot (272) /  | - | Legendary / Weather |
| 75 | Tapu Bulu | - | 2352 | 11/11/10 | 71.1 | 25 | - | Raid | Bullet Seed (271) / Megahorn (22) /  | - | Legendary / Weather |
| 76 | Tapu Fini | - | 1599 | 14/11/12 | 82.2 | 20 | - | GBL | Hidden Power (281) / Hydro Pump (107) /  | - | Legendary |
| 77 | Tapu Koko | - | 1775 | 14/13/11 | 84.4 | 20 | - | Raid | Volt Switch (250) / Thunderbolt (79) /  | - | Legendary |
| 78 | Tapu Lele | - | 1963 | 13/12/14 | 86.7 | 20 | - | Raid | Confusion (235) / Psyshock (60) /  | - | Legendary |
| 79 | Tapu Lele | - | 1952 | 13/13/11 | 82.2 | 20 | - | GBL | Confusion (235) / Moonblast (87) /  | - | Legendary |
| 80 | Tapu Lele | - | 1929 | 10/14/10 | 75.6 | 20 | - | Raid | Confusion (235) / Focus Blast (247) /  | - | Legendary |
| 81 | Terrakion | - | 2055 | 10/13/13 | 80 | 20 | - | GBL | Double Kick (356) / Rock Slide (64) /  | - | Legendary |
| 82 | Thundurus | Incarnate (142) | 1772 | 6/7/7 | 44.4 | 20 | - |  | Astonish (263) / Crunch (279) /  | Legendary | Legendary / Traded |
| 83 | Unown | P (16) | 780 | 10/6/14 | 66.7 | 25 | - | Wild | Hidden Power (281) / Struggle (133) /  | Unown | - |
| 84 | Unown | Y (25) | 543 | 1/1/15 | 37.8 | 19 | - | Wild | Hidden Power (281) / Struggle (133) /  | Unown | - |
| 85 | Unown | X (24) | 527 | 8/8/13 | 64.4 | 17 | - | Wild | Hidden Power (281) / Struggle (133) /  | Unown | - |
| 86 | Unown | Z (26) | 503 | 3/8/10 | 46.7 | 17 | - | Wild | Hidden Power (281) / Struggle (133) /  | Unown | - |
| 87 | Unown | Y (25) | 501 | 12/4/14 | 66.7 | 16 | - | Wild | Hidden Power (281) / Struggle (133) /  | Unown | - |
| 88 | Unown | X (24) | 495 | 14/14/11 | 86.7 | 15 | - | Research | Hidden Power (281) / Struggle (133) /  | Unown | - |
| 89 | Unown | A (1) | 493 | 4/1/13 | 40 | 17 | - | Wild | Hidden Power (281) / Struggle (133) /  | Unown | - |
| 90 | Unown | X (24) | 493 | 14/14/10 | 84.4 | 15 | - | Research | Hidden Power (281) / Struggle (133) /  | Unown | - |
| 91 | Unown | Z (26) | 412 | 2/2/0 | 8.9 | 15 | - | Wild | Hidden Power (281) / Struggle (133) /  | Unown | - |
| 92 | Unown | X (24) | 389 | 12/14/10 | 80 | 12 | - | Wild | Hidden Power (281) / Struggle (133) /  | Unown | - |
| 93 | Unown | K (11) | 368 | 0/7/5 | 26.7 | 13 | - |  | Hidden Power (281) / Struggle (133) /  | Unown | Favorite |
| 94 | Unown | Z (26) | 15 | 12/9/2 | 51.1 | 1 | - | Wild | Hidden Power (281) / Struggle (133) /  | Unown | - |
| 95 | Xerneas | - | 2125 | 15/10/13 | 84.4 | 20 | - | Raid | Zen Headbutt (234) / Megahorn (22) /  | - | Legendary |
| 96 | Xurkitree | - | 2174 | 11/11/11 | 73.3 | 20 | - | Raid | Spark (206) / Power Whip (118) /  | - | Ultra Beast |
| 97 | Yveltal | - | 2124 | 11/15/14 | 88.9 | 20 | - | GBL | Sucker Punch (203) / Focus Blast (247) /  | - | Legendary |
| 98 | Zacian | Hero (2577) | 2707 | 15/11/14 | 88.9 | 25 | - | Raid | Metal Claw (228) / Iron Head (74) /  | - | Legendary / Weather |
| 99 | Zacian | Hero (2577) | 2692 | 14/15/10 | 86.7 | 25 | - | Raid | Snarl (278) / Wild Charge (251) /  | - | Legendary / Weather |
| 100 | Zacian | Hero (2577) | 2688 | 13/15/11 | 86.7 | 25 | - | Raid | Snarl (278) / Close Combat (245) /  | Legendary | Legendary / Weather |
| 101 | Zacian | Hero (2577) | 2161 | 15/10/14 | 86.7 | 20 | - | Raid | Snarl (278) / Close Combat (245) /  | - | Legendary |
| 102 | Zacian | Hero (2577) | 2147 | 14/10/13 | 82.2 | 20 | - | Raid | Snarl (278) / Play Rough (88) /  | Legendary | Legendary |
| 103 | Zamazenta | Hero (2579) | 2688 | 14/13/11 | 84.4 | 25 | - | Raid | Ice Fang (327) / Moonblast (87) /  | - | Legendary / Weather |
| 104 | Zamazenta | Hero (2579) | 2655 | 13/10/10 | 73.3 | 25 | - | Raid | Snarl (278) / Close Combat (245) /  | Legendary | Legendary / Weather |
| 105 | Zamazenta | Hero (2579) | 2153 | 12/15/13 | 88.9 | 20 | - | Raid | Metal Claw (228) / Crunch (279) /  | Legendary | Legendary |
| 106 | Zamazenta | Hero (2579) | 2150 | 15/10/12 | 82.2 | 20 | - | Raid | Metal Claw (228) / Moonblast (87) /  | - | Legendary |
| 107 | Zamazenta | Hero (2579) | 2144 | 13/11/13 | 82.2 | 20 | - | Raid | Ice Fang (327) / Crunch (279) /  | - | Legendary |
| 108 | Zamazenta | Hero (2579) | 2134 | 10/12/15 | 82.2 | 20 | - | Raid | Ice Fang (327) / Close Combat (245) /  | - | Legendary |
| 109 | Zamazenta | Hero (2579) | 2134 | 12/13/11 | 80 | 20 | - | Raid | Metal Claw (228) / Close Combat (245) /  | - | Legendary |
| 110 | Zamazenta | Hero (2579) | 2134 | 12/13/11 | 80 | 20 | - | Raid | Ice Fang (327) / Moonblast (87) /  | - | Legendary |
| 111 | Zapdos | - | 1987 | 15/13/11 | 86.7 | 20 | - | GBL | Charge Beam (249) / Heat Wave (42) /  | - | Legendary |
| 112 | Zapdos | - | 1976 | 13/13/12 | 84.4 | 20 | - | GBL | Charge Beam (249) / Thunder (78) /  | - | Legendary |
| 113 | Zapdos | - | 1967 | 12/10/15 | 82.2 | 20 | - | Raid | Charge Beam (249) / Thunder (78) /  | - | Legendary / BG / Location |

## Unown
- **54 Unown total, 19 letters present.** Kept under the plan: **42**. Safe to transfer: **12**.
- Letters present: A, B, C, E, G, H, I, K, L, N, O, P, S, T, U, W, X, Y, Z.
- Letters still missing: D, F, J, M, Q, R, V, !, ?.
- Note: **B is present now** (1 copy, Lucky, 13/13/13, 86.7%). The Oct 8 check listed B as missing, so it was acquired since.
- Plan applied: keep 3 highest-IV per letter + both shinies + all XXS/XXL. In-game Favorite stars on Unown do NOT override the plan (otherwise almost nothing would be transferable). 2 shinies kept: X (CP 15) and Z (CP 776). 3 XXS/XXL kept: P XXS, X XXL, Z XXS.

| Letter | Total | Kept | Transferable |
|---|---|---|---|
| A | 4 | 3 | 1 |
| B | 1 | 1 | 0 |
| C | 1 | 1 | 0 |
| E | 1 | 1 | 0 |
| G | 1 | 1 | 0 |
| H | 1 | 1 | 0 |
| I | 1 | 1 | 0 |
| K | 4 | 3 | 1 |
| L | 1 | 1 | 0 |
| N | 2 | 2 | 0 |
| O | 3 | 3 | 0 |
| P | 4 | 3 | 1 |
| S | 2 | 2 | 0 |
| T | 2 | 2 | 0 |
| U | 3 | 3 | 0 |
| W | 1 | 1 | 0 |
| X | 9 | 5 | 4 |
| Y | 5 | 3 | 2 |
| Z | 8 | 5 | 3 |

Safe-to-transfer Unown (12):

| Letter | CP | IVs | IV% | Size | Tags | Status |
|---|---|---|---|---|---|---|
| A | 493 | 4/1/13 | 40 | - | Unown | - |
| K | 368 | 0/7/5 | 26.7 | - | Unown | Favorite |
| P | 780 | 10/6/14 | 66.7 | - | Unown | - |
| X | 495 | 14/14/11 | 86.7 | - | Unown | - |
| X | 493 | 14/14/10 | 84.4 | - | Unown | - |
| X | 389 | 12/14/10 | 80 | - | Unown | - |
| X | 527 | 8/8/13 | 64.4 | - | Unown | - |
| Y | 501 | 12/4/14 | 66.7 | - | Unown | - |
| Y | 543 | 1/1/15 | 37.8 | - | Unown | - |
| Z | 15 | 12/9/2 | 51.1 | - | Unown | - |
| Z | 503 | 3/8/10 | 46.7 | - | Unown | - |
| Z | 412 | 2/2/0 | 8.9 | - | Unown | - |

Reconciliation note: earlier work referenced ~106 safe Unown transfers. This export contains only 54 Unown total, so 106 Unown transfers is impossible against the current inventory. The 106 figure likely covered the whole box (not Unown-only), or the inventory changed since. The current export is authoritative: 12 Unown are transferable under the plan.

## Worth favoriting in-game (top 200 keeps by value)
Already-favorited column shows whether the in-game star is already on. Priority order: Hundo+Shiny, Shiny Legendary/Mythical, Hundo, top PvP spreads, other Shinies by IV%, rare (Unown rare, Shadow Shiny).

| # | Name | Form / Costume | CP | IVs | IV% | Why favorite | Already favorited? |
|---|---|---|---|---|---|---|---|
| 1 | Metagross | - | 3839 | 15/15/15 | 100 | Hundo + Shiny; Shiny | Yes |
| 2 | Typhlosion | - | 3266 | 15/15/15 | 100 | Hundo + Shiny; Shiny | Yes |
| 3 | Pinsir | - | 2874 | 15/15/15 | 100 | Hundo + Shiny; Shiny | Yes |
| 4 | Muk | - | 1811 | 15/15/15 | 100 | Hundo + Shiny; Shiny | Yes |
| 5 | Ho-Oh | - | 3011 | 13/15/15 | 95.6 | Shiny Legendary/Mythical | Yes |
| 6 | Kyurem | Black (147) | 3003 | 15/12/15 | 93.3 | Shiny Legendary/Mythical | Yes |
| 7 | Thundurus | Incarnate (142) | 2372 | 15/15/12 | 93.3 | Shiny Legendary/Mythical | Yes |
| 8 | Regidrago | - | 1675 | 12/15/15 | 93.3 | Shiny Legendary/Mythical | Yes |
| 9 | Zacian | Hero (2577) | 2165 | 14/14/13 | 91.1 | Shiny Legendary/Mythical | NO - star it |
| 10 | Palkia | - | 2238 | 11/15/13 | 86.7 | Shiny Legendary/Mythical | Yes |
| 11 | Xerneas | - | 2129 | 14/13/12 | 86.7 | Shiny Legendary/Mythical | Yes |
| 12 | Celebi | - | 1378 | 14/11/14 | 86.7 | Shiny Legendary/Mythical | Yes |
| 13 | Articuno | - | 2683 | 15/13/10 | 84.4 | Shiny Legendary/Mythical | Yes |
| 14 | Kyogre | - | 2477 | 11/12/15 | 84.4 | Shiny Legendary/Mythical | Yes |
| 15 | Zapdos | - | 2471 | 13/14/11 | 84.4 | Shiny Legendary/Mythical | Yes |
| 16 | Groudon | - | 2306 | 12/13/13 | 84.4 | Shiny Legendary/Mythical | NO - star it |
| 17 | Necrozma | - | 2060 | 12/11/15 | 84.4 | Shiny Legendary/Mythical | NO - star it |
| 18 | Zapdos | - | 1982 | 15/12/11 | 84.4 | Shiny Legendary/Mythical | Yes |
| 19 | Deoxys | Defense (35) | 1565 | 10/14/14 | 84.4 | Shiny Legendary/Mythical | NO - star it |
| 20 | Deoxys | Defense (35) | 1269 | 13/12/13 | 84.4 | Shiny Legendary/Mythical | Yes |
| 21 | Palkia | - | 2238 | 15/11/11 | 82.2 | Shiny Legendary/Mythical | NO - star it |
| 22 | Xerneas | - | 2111 | 11/15/11 | 82.2 | Shiny Legendary/Mythical | NO - star it |
| 23 | Kyogre | - | 2289 | 10/15/11 | 80 | Shiny Legendary/Mythical | NO - star it |
| 24 | Kyurem | White (148) | 3020 | 13/12/10 | 77.8 | Shiny Legendary/Mythical | Yes |
| 25 | Xerneas | - | 2113 | 15/10/10 | 77.8 | Shiny Legendary/Mythical | Yes |
| 26 | Necrozma | - | 2045 | 11/13/11 | 77.8 | Shiny Legendary/Mythical | NO - star it |
| 27 | Kyogre | - | 2854 | 11/12/11 | 75.6 | Shiny Legendary/Mythical | Yes |
| 28 | Regigigas | - | 2415 | 12/10/12 | 75.6 | Shiny Legendary/Mythical; Shadow Shiny | Yes |
| 29 | Regieleki | - | 1547 | 12/12/10 | 75.6 | Shiny Legendary/Mythical | Yes |
| 30 | Articuno | - | 1263 | 11/11/12 | 75.6 | Shiny Legendary/Mythical | Yes |
| 31 | Latias | - | 1930 | 12/8/10 | 66.7 | Shiny Legendary/Mythical; Shadow Shiny | NO - star it |
| 32 | Reshiram | - | 2676 | 4/6/8 | 40 | Shiny Legendary/Mythical | Yes |
| 33 | Dragonite | - | 4287 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 34 | Salamence | - | 4138 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 35 | Tyranitar | - | 3957 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 36 | Gyarados | - | 3834 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 37 | Rhyperior | - | 3733 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 38 | Rhyperior | - | 3653 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 39 | Gardevoir | - | 3497 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 40 | Incineroar | - | 3387 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 41 | Emboar | - | 3372 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 42 | Metagross | - | 3304 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 43 | Espeon | - | 3230 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 44 | Charizard | - | 3228 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 45 | Machamp | - | 3056 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 46 | Heracross | - | 3012 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 47 | Stonjourner | - | 2988 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 48 | Greninja | - | 2965 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 49 | Rhydon | - | 2884 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 50 | Electivire | - | 2815 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 51 | Delphox | - | 2797 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 52 | Swampert | - | 2761 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 53 | Typhlosion | - | 2683 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 54 | Infernape | - | 2664 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 55 | Blissey | - | 2639 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 56 | Blissey | - | 2600 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 57 | Ninetales | - | 2577 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 58 | Incineroar | - | 2568 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 59 | Blaziken | - | 2563 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 60 | Decidueye | - | 2537 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 61 | Gengar | - | 2528 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 62 | Hitmonlee | - | 2502 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 63 | Dragonite | - | 2492 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 64 | Torterra | - | 2473 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 65 | Raichu | - | 2467 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 66 | Victreebel | - | 2446 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 67 | Bellibolt | - | 2434 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 68 | Gyarados | - | 2422 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 69 | Mewtwo | - | 2387 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 70 | Drifblim | - | 2382 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 71 | Mamoswine | - | 2377 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 72 | Abomasnow | - | 2362 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 73 | Emboar | - | 2301 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 74 | Articuno | - | 2179 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 75 | Aromatisse | - | 2174 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 76 | Bellossom | - | 2118 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 77 | Necrozma | - | 2104 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 78 | Marowak | - | 2075 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 79 | Oricorio | Pompom (2680) | 2000 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 80 | Mewtwo | Armored (133) | 1821 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 81 | Heracross | - | 1772 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 82 | Greedent | - | 1760 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 83 | Passimian | - | 1733 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 84 | Centiskorch | - | 1708 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 85 | Registeel | - | 1608 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 86 | Dudunsparce | Two (2994) | 1565 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 87 | Mightyena | - | 1540 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 88 | Diggersby | - | 1498 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 89 | Delcatty | - | 1496 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 90 | Linoone | - | 1496 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 91 | Stoutland | - | 1494 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 92 | Meowscarada | - | 1493 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 93 | Ponyta | - | 1491 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 94 | Toxtricity | Amped (2464) | 1486 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 95 | Abomasnow | - | 1484 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 96 | Excadrill | - | 1483 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 97 | Lickilicky | - | 1480 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 98 | Leavanny | - | 1474 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 99 | Lileep | - | 1451 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 100 | Durant | - | 1443 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 101 | Blastoise | - | 1409 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 102 | Typhlosion | - | 1403 | 15/15/15 | 100 | Hundo (100%) | NO - star it |
| 103 | Shiinotic | - | 1329 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 104 | Metang | - | 1328 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 105 | Teddiursa | - | 1176 | 15/15/15 | 100 | Hundo (100%) | NO - star it |
| 106 | Chansey | - | 1147 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 107 | Staraptor | - | 1130 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 108 | Jynx | - | 1095 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 109 | Graveler | Alolan (70) | 1084 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 110 | Oddish | - | 1070 | 15/15/15 | 100 | Hundo (100%) | NO - star it |
| 111 | Bulbasaur | - | 987 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 112 | Bulbasaur | - | 987 | 15/15/15 | 100 | Hundo (100%) | NO - star it |
| 113 | Miltank | - | 942 | 15/15/15 | 100 | Hundo (100%) | NO - star it |
| 114 | Growlithe | - | 923 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 115 | Oddish | - | 912 | 15/15/15 | 100 | Hundo (100%) | NO - star it |
| 116 | Sandygast | - | 881 | 15/15/15 | 100 | Hundo (100%) | NO - star it |
| 117 | Toucannon | - | 845 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 118 | Vivillon | Polar (2608) | 795 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 119 | Pidgeotto | - | 785 | 15/15/15 | 100 | Hundo (100%) | NO - star it |
| 120 | Geodude | Alolan (68) | 776 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 121 | Fuecoco | - | 773 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 122 | Ditto | - | 766 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 123 | Scorbunny | - | 721 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 124 | Venonat | - | 717 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 125 | Mareep | - | 708 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 126 | Bellsprout | - | 708 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 127 | Gourgeist | Small (2645) | 708 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 128 | Mankey | - | 665 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 129 | Charmander | - | 644 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 130 | Liepard | - | 633 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 131 | Sobble | - | 627 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 132 | Camerupt | - | 626 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 133 | Pidgey | - | 612 | 15/15/15 | 100 | Hundo (100%) | NO - star it |
| 134 | Spritzee | - | 608 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 135 | Chesnaught | - | 576 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 136 | Charmander | - | 560 | 15/15/15 | 100 | Hundo (100%) | NO - star it |
| 137 | Illumise | - | 556 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 138 | Greavard | - | 551 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 139 | Venonat | - | 545 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 140 | Yamper | - | 540 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 141 | Chikorita | - | 534 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 142 | Noibat | - | 533 | 15/15/15 | 100 | Hundo (100%) | NO - star it |
| 143 | Fletchling | - | 526 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 144 | Geodude | - | 517 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 145 | Qwilfish | - | 462 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 146 | Fuecoco | - | 451 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 147 | Excadrill | - | 437 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 148 | Gimmighoul | #3351 | 410 | 15/15/15 | 100 | Hundo (100%) | NO - star it |
| 149 | Duskull | - | 403 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 150 | Pikachu | Mystic Cap (3343) | 402 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 151 | Seedot | - | 393 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 152 | Beldum | - | 390 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 153 | Zigzagoon | Galarian (946) | 363 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 154 | Grimer | - | 351 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 155 | Smoliv | - | 341 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 156 | Combee | - | 339 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 157 | Vigoroth | - | 324 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 158 | Nidoran♂ | - | 295 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 159 | Smoliv | - | 292 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 160 | Pawmi | - | 290 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 161 | Venipede | - | 282 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 162 | Smoliv | - | 268 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 163 | Lillipup | - | 261 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 164 | Slugma | - | 228 | 15/15/15 | 100 | Hundo (100%) | NO - star it |
| 165 | Nickit | - | 224 | 15/15/15 | 100 | Hundo (100%) | NO - star it |
| 166 | Growlithe | Hisuian (2792) | 218 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 167 | Shelmet | - | 213 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 168 | Hoppip | - | 205 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 169 | Weedle | - | 195 | 15/15/15 | 100 | Hundo (100%) | NO - star it |
| 170 | Bulbasaur | - | 184 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 171 | Clefable | - | 181 | 15/15/15 | 100 | Hundo (100%) | Yes |
| 172 | Weedle | - | 75 | 15/15/15 | 100 | Hundo (100%) | NO - star it |
| 173 | Muk | - | 2500 | 0/15/15 | 66.7 | Top PvP spread | Yes |
| 174 | Azumarill | - | 1499 | 0/15/15 | 66.7 | Top PvP spread | Yes |
| 175 | Ninetales | - | 1495 | 0/15/15 | 66.7 | Top PvP spread | Yes |
| 176 | Abomasnow | - | 1494 | 0/15/15 | 66.7 | Top PvP spread | Yes |
| 177 | Cradily | - | 1494 | 0/15/15 | 66.7 | Top PvP spread | Yes |
| 178 | Pignite | - | 1492 | 0/15/15 | 66.7 | Top PvP spread | Yes |
| 179 | Talonflame | - | 1480 | 0/15/15 | 66.7 | Top PvP spread | Yes |
| 180 | Scorbunny | - | 309 | 0/15/15 | 66.7 | Top PvP spread | Yes |
| 181 | Hatenna | - | 100 | 0/15/15 | 66.7 | Top PvP spread | Yes |
| 182 | Hatterene | - | 2046 | 0/15/14 | 64.4 | Shiny; Top PvP spread | Yes |
| 183 | Clefable | - | 1857 | 0/14/15 | 64.4 | Top PvP spread | Yes |
| 184 | Golisopod | - | 1518 | 0/14/15 | 64.4 | Top PvP spread | Yes |
| 185 | Oinkologne | Female (2982) | 1500 | 0/14/15 | 64.4 | Top PvP spread | Yes |
| 186 | Oinkologne | Female (2982) | 1500 | 0/14/15 | 64.4 | Top PvP spread | Yes |
| 187 | Quagsire | - | 1499 | 0/15/14 | 64.4 | Top PvP spread | Yes |
| 188 | Metagross | - | 3184 | 14/15/15 | 97.8 | Shiny | Yes |
| 189 | Aron | - | 333 | 15/14/15 | 97.8 | Shiny | Yes |
| 190 | Donphan | - | 1881 | 14/15/14 | 95.6 | Shiny | Yes |
| 191 | Charcadet | - | 413 | 14/15/14 | 95.6 | Shiny | NO - star it |
| 192 | Annihilape | - | 2674 | 12/15/15 | 93.3 | Shiny | Yes |
| 193 | Gyarados | - | 2302 | 13/15/14 | 93.3 | Shiny | Yes |
| 194 | Tinkaton | - | 1272 | 14/15/13 | 93.3 | Shiny | Yes |
| 195 | Quilladin | - | 876 | 15/15/12 | 93.3 | Shiny | NO - star it |
| 196 | Unown | P (16) | 596 | 14/12/15 | 91.1 | Unown rare | Yes |
| 197 | Unown | Z (26) | 776 | 10/12/4 | 57.8 | Shiny; Unown rare | Yes |
| 198 | Unown | X (24) | 15 | 13/2/9 | 53.3 | Shiny; Unown rare | NO - star it |
| 199 | Unown | X (24) | 550 | 8/13/2 | 51.1 | Unown rare | Yes |
| 200 | Unown | Z (26) | 389 | 3/11/9 | 51.1 | Unown rare | Yes |


## PvP-spread refinement (2026-10-16)
the owner flagged the right issue: the PvP rule (Atk <= 5, Def >= 12, Sta >= 12) keeps ANY Pokemon matching that IV pattern, even species with no real PvP use. This pass re-checked every PvP-spread keep against PvPoke rankings.

**Method.** PvPoke data from the local `pvpoke` submodule (gamemaster + overall rankings for Little Cup 500, Great League 1500, Ultra League 2500, Master League 10000). Evolution lines grouped by gamemaster family id + species name (this avoids a gamemaster data quirk where Carkol lists Boltund as its parent, which would wrongly merge the Rolycoly and Yamper lines). Name matching normalizes accents and gender symbols (Flabebe, Nidoran Male, Pumpkaboo forms). A species line counts as PvP-relevant if ANY member of its evolution line (including Shadow variants) appears in ANY league's overall rankings. Generous by design.

**Recount correction.** The first pass reported 289 PvP-spread rows; re-verification finds **290** (1-row correction, all IV fields parse cleanly). Breakdown of the 290:
- **161** also match another keep rule (shiny, IV>91, favorited, Sp. Move, Shadow, costume, size, Dynamax top-2, Unown plan, or Location Background) — stay kept regardless.
- **127** kept ONLY by the PvP rule, with another copy of the same (Name, Form) kept by a different rule — the dex entry is covered without them. These are the candidates below.
- **2** kept ONLY by the PvP rule and sole members of their (Name, Form) group — **stay kept** as only-copy rescue: Squawkabilly White (CP 1707, 5/14/15, 75.6%) and Aipom (CP 1100, 4/15/13, 71.1%).

**Literal test result: 0 false positives.** All 89 species represented among the 127 PvP-only rows have at least one evolution-line member in some PvPoke rankings list. So **no rows move to safe-to-transfer** on the appearance test. Updated totals are unchanged: **KEEP 4,152, SAFE TO TRANSFER 113.** The v2 safe list (`safe_to_transfer_20261014_v2.csv`) is identical to v1.

**Why the appearance test finds nothing (and why the main account's instinct still has merit).** PvPoke's overall rankings are comprehensive (1,152 species in Great League alone), and evolution lines are broad: a 0/15/15 Caterpie counts as "relevant" because Butterfree appears in the rankings. But many of these lines only appear at the very bottom. Best-rank distribution across the 89 PvP-only species: top 100 in some league: 38 species; 101-300: 29; 301-500: 11; 501+: 11.

**Tail species: ranked but not plausibly usable (NOT moved to safe — the main account's call).** These 11 species (19 rows) have NO evolution-line member ranked better than #500 in any league, and most have sub-500 PvPoke ratings (losing records vs the meta). If the owner agrees that "ranked #532+" is not real PvP potential, these 19 are the false positives and the safe list would grow to 132.

| Species | PvP-only rows | Best line member in rankings | Best rank | Rating |
|---|---|---|---|---|
| Caterpie | 2 | Butterfree (Shadow) | #1137 GL | 386 |
| Liepard | 1 | Liepard (Shadow) | #1002 GL | 443 |
| Diglett | 1 | Dugtrio (Shadow) | #869 GL | 452 |
| Pidove | 4 | Unfezant | #796 UL | 373 |
| Yamper | 1 | Boltund | #778 UL | 401 |
| Patrat | 3 | Watchog | #775 GL | 472 |
| Sudowoodo | 1 | Sudowoodo | #731 UL | 440 |
| Seviper | 1 | Seviper | #676 UL | 469 |
| Snubbull | 1 | Granbull | #646 UL | 438 |
| Gothita | 3 | Gothitelle | #535 UL | 520 |
| Weedle | 1 | Beedrill (Shadow) | #532 GL | 604 |

Note: Weedle (Beedrill Shadow, rating 604) and Gothita (Gothitelle, rating 520) are the two tail exceptions with above-500 ratings — their ranks are deep, but their sim win rates are not losing records. The other nine tail lines are both deep-ranked AND sub-500 rated.

## Caveats and assumptions
- **Row count:** the file has 4,265 data rows, not 4,264. Earlier counts were off by one.
- **Status vs Tags:** SX's `Status` column is authoritative for Shiny / Shadow / Favorite / Sp. Move. The `Tags` column is a user-managed subset and is incomplete (e.g., it lists 683 shinies vs 1,203 in Status; SX's own `Kept by` confirms the Status values). All flag checks used `Status`, with `Tags` as a supplement. The 34 rows tagged `Shadow` in `Tags` but not `Status` are all Purified, not Shadow.
- **Legacy moves:** no explicit legacy-move column exists. `Status` containing `Sp. Move` was used as the legacy/special-move proxy, matching SX's own `Keep Legacy Moves` rule (SX agrees on all 533 rows).
- **Dynamax:** no explicit Dynamax column exists. Dynamax Pokemon were identified via SX's `Kept by` field containing `Dynamax` (85 rows). SX's `Kept by` lists all matching rules, so this should be the complete set. `Origin = Bread Battle` (60 rows) means Max Battle catches: every one of the 60 is Dynamax-flagged, confirming the mapping. Rule 8 was applied to Dynamax-flagged Pokemon only (top 2 by IV per species kept on Dynamax status alone).
- **Location Background:** not in your stated keep rules, but added as a conservative keep signal (41 rows) because Backgrounds are limited and non-farmable. Remove this rule if you want those 41 evaluated strictly.
- **Legendaries:** your stated rules do NOT include 'keep all legendaries', so duplicate legendaries matching no rule are listed as safe. SX's own engine keeps all Legendaries/Mythicals/UBs by default, which is why SX's Verdict says Keep on 4,263 rows. If you want Legendaries / Mythicals / Ultra Beasts protected regardless, say so and the safe list shrinks by 91, to 22.
- **Only-copy rescue:** grouping is by (Name, Form). Costume variants share the (Name, Form) group with their base form, so a costume copy already satisfying the group does not force-keep a plain duplicate. 42 rescues were needed (groups where no member matched any rule).
- **IV%** is taken from the CSV as given. PvP spreads use the stated Atk<=5 / Def>=12 / Sta>=12 rule only, not full PvP rank calculations.
- **Spinda:** 3 Spinda are safe. They are same-pattern duplicates (the only-copy rule is per pattern, via Form).
- Nothing was changed on the game account. No transfers, favorites, or settings were modified.
