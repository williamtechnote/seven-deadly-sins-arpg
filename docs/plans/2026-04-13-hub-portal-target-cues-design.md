# Hub Portal Target Cues Design

## Goal

Extend the existing hub `选门参考` card so portal focus helps with the next run choice, not only the previous run recap.

## Chosen Approach

Add one compact boss-specific posture cue to the shared portal summary helper and keep the UI surface unchanged. The helper will accept either the old string target label or a richer `{ label, bossKey }` payload, so runtime can opt into boss-specific framing without breaking existing call sites.

## Alternatives Considered

1. Add a separate boss preview panel.
Rejected because it spends new HUD real estate on information that belongs in the existing portal focus surface.

2. Reuse only the target label with no cue.
Rejected because it remains mostly navigational, not tactical.

3. Add full matchup text based on current build and last route.
Rejected for this heartbeat because it widens scope, needs more systems, and is harder to keep readable.

## UX Contract

- `选门参考` should remain compact.
- If `bossKey` is known, insert one `门前 ...` cue under the target line.
- If there is no `上轮战报`, the card may still appear with `目标 + 门前 cue`.
- If only a string target label is available, preserve current behavior with no boss cue.

## Testing Contract

- Shared helper returns the new cue when passed a boss-aware target payload.
- Shared helper still supports the legacy string target payload.
- Hub runtime passes `{ label, bossKey }` into the helper.
- README and regression checks document the new contract.
