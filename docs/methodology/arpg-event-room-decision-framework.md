# ARPG Event Room Decision Framework

## Why This Exists

Event rooms are pacing valves in an ARPG run. They are not just rewards. A good event room should let the player answer one question quickly: "What problem does this route solve for my current run?"

If the answer is hidden behind raw numbers alone, the player spends attention parsing copy instead of planning the next fight.

## Practical Design Rules

1. Expose the primary resource axis first.
   `续航` / `经济` / `爆发` / `节奏` / `补给` should be readable before the exact numbers.

2. Expose the risk posture second.
   `冒险` and `稳健` tell the player whether the route spikes power at a real cost or smooths the run.

3. Keep tags stable across UI surfaces.
   The shrine panel, sidebar HUD, and any future recap view should reuse the same tags so the player does not relearn vocabulary.

4. Let context beat static value.
   A heal route is less valuable at full HP. A cleanse route is less urgent when the player is clean. A gold trade is dead on arrival if the player cannot afford it.

5. Avoid replacing numbers with labels.
   Tags answer "what kind of route is this?" Numbers answer "how big is it?" Good ARPG UI needs both.

## Tag Set For This Repo

- `续航`: direct HP or stamina stability
- `净化`: removes or mitigates debuffs
- `经济`: converts risk into long-run purchasing power
- `补给`: grants tactical items
- `爆发`: increases short-window kill pressure
- `节奏`: improves cooldown/recovery flow
- `冒险`: meaningfully raises downside or opportunity cost
- `稳健`: safer version of a similar payoff

## Current Mapping

- `赌徒圣坛`
  - `豪赌` -> `经济/冒险`
  - `稳押` -> `经济/稳健`
- `疗愈泉眼`
  - `活泉灌注` -> `续航/稳健`
  - `净泉啜饮` -> `续航/净化`
- `血契祭坛`
  - `猩红锋契` -> `爆发/冒险`
  - `稳契余烬` -> `爆发/稳健`
- `战备商柜`
  - `战地净化包` -> `补给/净化`
  - `狂战补给` -> `补给/爆发`
- `祈愿圣坛`
  - `复苏祷言` -> `节奏/续航`
  - `迅击祷言` -> `节奏/爆发`

## Next Iteration

Once the tag language is stable, the next gain is contextual weighting:

- de-emphasize overheal routes when HP is already high
- lower cleanse urgency when the player has no negative states
- make blocked trade routes feel obviously unavailable before selection
- eventually reflect run-modifier or boss-matchup synergy in the same lightweight language
