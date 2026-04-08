# ARPG Encounter Pacing & Reward Methodology

## Purpose

This note provides a reusable methodology for improving encounter quality in a room-based action RPG. It is intended to help prioritize work that increases moment-to-moment readability, tactical variety, and reward meaning without bloating content production.

## Core Design Goals

1. **Readable danger** — players should understand why they were hit and what the safe response was.
2. **Rhythmic pacing** — intense windows need short recovery beats so pressure feels authored rather than noisy.
3. **Meaningful choice** — route, shrine, event, or combat decisions should change the next 1–3 rooms in a felt way.
4. **Reward legibility** — when players gain power, the payoff should be visible in combat behavior or survival odds.
5. **Run variety without chaos** — each run should remix familiar systems, not overwhelm players with disconnected exceptions.

## Practical Heuristics

### 1) Build around micro-loops
Every room should roughly support this loop:

- read threat
- commit to movement/attack/skill response
- receive feedback
- stabilize
- decide whether to push advantage

If a room skips the stabilize step too often, difficulty may feel spammy instead of skillful.

### 2) Alternate pressure profiles
Across a short run segment, rotate between:

- **execution rooms** — movement and dodge emphasis
- **burst windows** — clear attack/counter opportunities
- **resource checks** — stamina/health management matters
- **choice rooms** — event or shrine decisions reshape playstyle

Avoid stacking too many rooms that test the exact same skill.

### 3) Tie rewards to the next encounter immediately
Rewards are stronger when players can feel them in the next room. Prefer upgrades that affect:

- dodge readiness
- attack cadence
- stamina recovery thresholds
- route/event outcomes
- visible combat cues or payoff bursts

If a reward is only numerically stronger but not perceptible, add feedback or situational expression.

### 4) Design for recovery windows
For bosses and elites, treat recovery windows as first-class tuning knobs:

- post-pattern breather duration
- distance needed to reset safely
- number of chained attacks before a pause
- visual confirmation that the punish window is open

A small recovery improvement can often do more for fairness than lowering raw damage.

### 5) Protect information hierarchy
HUD and world feedback should answer, in order:

1. what is threatening me now?
2. what action is ready now?
3. what reward/state changed because of my last choice?

Do not let long text, duplicate labels, or decorative copy displace urgent combat information.

## Prioritization Rubric for New TODOs

When brainstorming the next improvement, favor work that scores high on these dimensions:

- **Player-perceived impact** — can a player notice the difference in one run?
- **System leverage** — does it improve many encounters rather than one edge case?
- **Readability gain** — does it reduce ambiguity or teach timing better?
- **Variety gain** — does it create a new decision pattern or pacing texture?
- **Testability** — can the behavior be covered with deterministic checks?

## High-ROI Improvement Themes

### Combat readability
- clearer telegraph phases
- stronger action-ready cues
- cleaner hit/payoff feedback
- better distinction between safe and unsafe windows

### Encounter pacing
- fewer back-to-back high-pressure patterns
- explicit breathers after signature attacks
- better room sequencing across a floor
- controlled escalation into boss phases

### Reward clarity
- shrine/event outputs that alter short-term play immediately
- route decisions with visible tradeoffs
- power gains that change cadence, not just totals

### Run-shaping decisions
- branch choices that bias the next rooms toward risk, recovery, or mastery
- events that convert current weakness into future upside
- tradeoffs that are legible before commitment

## Anti-Patterns

Avoid TODOs that mainly produce churn without improving the loop:

- cosmetic copy rewrites with no gameplay clarity win
- niche edge-case fixes when the main combat loop still feels muddy
- adding more modifiers before current modifiers communicate clearly
- rewards that stack hidden math but do not alter player decisions

## Suggested Question Set Before Implementing

1. What player confusion or missed opportunity is this fixing?
2. Is the problem local (single encounter) or systemic (many rooms/runs)?
3. How will the player perceive the improvement within 30 seconds?
4. What deterministic regression check proves the new behavior?
5. Does README need a short note so the new system remains discoverable?

## Recommendation for This Repo

Given the repo already has significant work in boss pacing, HUD cues, shrine routing, and event-room clarity, the best next tasks are likely those that:

- connect room-to-room pacing into a more legible run arc,
- make rewards visibly change the next combat decision,
- or strengthen branch/route identity so repeated runs feel less samey.
