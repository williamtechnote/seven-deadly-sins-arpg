# Gluttony Hunger Tide Design

## Goal

Give `深渊巨口` a real phase-3 mechanic that cashes out the existing `留体拆潮` posture into a readable stamina-and-positioning test instead of leaving that cue as copy only.

## Context

The repo already teaches boss posture in hub portal focus, run start, and early route-decision surfaces. For Gluttony, that shared cue is `留体拆潮`.

The fight itself does not fully honor that promise yet:

- phase 1/2 pressure is mostly `bite / vomit / devour`
- phase 3 adds `consume`, but the current authored variety is still lighter than Lust / Wrath / Pride
- the player is told to preserve stamina for a tide-like problem that never clearly arrives

The methodology docs for this repo prefer improvements that are:

- noticeable within one run
- readable in the moment
- compatible with existing telegraph/HUD/test structure

## Approaches

### 1. Only tune `consume` numbers

Rejected: faster damage or longer buff would increase pressure, but it would not create a new readable phase-3 problem.

### 2. Turn `consume` into a bespoke frontal special

Viable, but weaker for this heartbeat. It would still read as another forward threat instead of paying off the specific `拆潮` posture already established elsewhere in the game.

### 3. Add a new phase-3 hazard `饥潮奔涌` (`hungerTide`)

Recommended: it fits the current hazard architecture, creates a distinct authored test, and directly converts `留体拆潮` into gameplay.

## Recommendation

Choose approach 3.

`饥潮奔涌` should spawn a short sequence of arena-spanning sludge walls that roll in from alternating sides. The player cannot simply stand still and tank them; they must preserve one dodge to pass through each incoming wall or get clipped by the sludge.

## Design

- Boss: `深渊巨口`
- Phase: 3 only
- Attack key: `hungerTide`
- Attack class: `HAZARD`
- Display name: `饥潮奔涌`
- Counter hint: `反制: 留翻滚穿潮，别在边线耗光体力`

### Behavior

- The boss roots briefly and announces the attack through the existing telegraph path.
- Three sludge walls enter from alternating arena edges with short staggered timing.
- Each wall occupies a tall vertical band, forcing a dodge-through timing check rather than another frontal sidestep.
- Touching a wall deals chip damage and applies a short `slow`, making repeated mistakes snowball without becoming an instant-kill gimmick.
- Once the final wall passes, the boss returns to the normal cooldown flow.

### Why this direction

- It adds a new movement verb instead of just more damage.
- It makes the Gluttony posture cue honest: `留体拆潮` becomes something the player can actually feel.
- It stays inside the current boss execution model:
  - data-driven phase attack list
  - localized name / hint / counter-window tables
  - one new `_execHazard()` branch

## Testing

- Add regression guards first for:
  - phase-3 `hungerTide` in `BOSSES.gluttony`
  - display name / counter hint / counter window / status-on-hit metadata
  - `HAZARD` classification
  - dedicated `_execHazard()` branch
- Then implement until the full required verification command passes again.

## Assumption

This heartbeat is running in non-interactive automation, so the design is treated as self-approved for execution.
