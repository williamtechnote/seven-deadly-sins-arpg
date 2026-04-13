# Sloth Web Cage Design

## Goal

Give `梦境蛛后` a real phase-2/3 positional mechanic that turns the existing “稳住中心” read into gameplay instead of leaving Sloth’s late fight mostly as generic `sleepFog / nightmare` pressure.

## Context

The repo already leans on authored boss mechanics that:

- are readable in one run
- reuse the existing boss telegraph / metadata tables
- can be locked down with source-level regression guards

`梦境蛛后` currently escalates pressure with fog, summons, and a generic late debuff window, but the fight still lacks a strong arena-shaping moment that makes the player consciously hold center space.

## Approaches

### 1. Only tune `sleepFog` numbers

Rejected. More fog density or damage would raise pressure, but it would still read as the same lingering-area problem.

### 2. Add a summon-heavy follow-up

Viable later, but weaker for this heartbeat. Another summon wave would push Sloth toward add management instead of a new positional test.

### 3. Add a new phase-2/3 hazard `蛛网囚笼` (`webCage`)

Recommended. It fits the current hazard architecture and creates a distinct “hold center, then drift through the safe band” problem.

## Recommendation

Choose approach 3.

`蛛网囚笼` should snapshot the player’s current position, then build a square web perimeter that tightens inward for a short duration. Touching the web wall deals chip damage and applies `slow`, so the player is punished for getting squeezed out to the edge or for panicking early.

## Design

- Boss: `梦境蛛后`
- Phases: 2 and 3
- Attack key: `webCage`
- Attack class: `HAZARD`
- Display name: `蛛网囚笼`
- Counter hint: `反制: 先稳住中心，小步贴着空区移动，别被收束墙挤到边线`

### Behavior

- The boss roots and telegraphs the hazard through the existing boss HUD path.
- The attack locks onto the player’s initial position instead of chasing continuously.
- A square web ring shrinks from a larger outer half-size toward a smaller inner half-size over about two seconds.
- The player can stay safe by holding near the middle first, then adjusting with short steps as the safe lane narrows.
- Contact with the wall deals chip damage and applies `slow`, reinforcing the “don’t get forced into the edge” lesson.

## Why this direction

- It gives Sloth a distinct space-control mechanic instead of more generalized attrition.
- It cashes out the route/posture language into an authored fight test.
- It stays compatible with the current code structure:
  - boss phase attack lists in `data.js`
  - telegraph metadata in `game.js`
  - one dedicated `_execHazard()` branch

## Testing

- Add regression guards first for:
  - phase 2/3 `webCage` entries in `BOSSES.sloth`
  - display name / counter hint / counter window / status-on-hit metadata
  - `HAZARD` classification
  - a dedicated `_execHazard()` branch that snapshots player position and damages on wall contact
- Then implement until the required verification command passes again.
