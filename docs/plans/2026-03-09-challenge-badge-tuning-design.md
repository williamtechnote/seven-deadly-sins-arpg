# Ultra-Compact Challenge Badge Tuning Design

**Context**

The remaining active sidebar task is no longer about adding a new fallback. The fallback exists; the work now is to reduce how often it appears and how much width it consumes when the ultra-compact sidebar has already hidden the main challenge block.

**Approaches**

1. Recommended: tighten trigger conditions and shorten the badge copy.
This keeps the current single-text-object layout intact, avoids new positioning risk, and directly targets the real failure mode: the badge stealing width from the affix title before it carries meaningful information.

2. Add a separate badge text object with its own color and position.
This gives finer control over hierarchy, but it increases layout complexity in the most fragile viewport tier and risks introducing new overlap paths.

3. Keep behavior and tune only color.
This is the cheapest visual tweak, but it does not solve the width-pressure problem when the badge appears too early or uses more copy than necessary.

**Chosen Design**

Use approach 1. In `ultraCompact`, only append the active badge after the challenge has made visible progress; completed challenges still keep their reward badge. Also shorten the badge strings so the title line holds onto more room for the affix section label.

**Behavior**

- Hidden ultra-compact active challenge at `0/N`: no badge.
- Hidden ultra-compact active challenge after progress starts: use a shorter progress badge.
- Hidden ultra-compact completed challenge: keep the completion/reward badge, but shorten it.
- Color tuning stays as the next follow-up task unless the copy change alone proves insufficient.

**Testing**

- Add regression coverage for the zero-progress hidden case.
- Update the existing badge expectations for the shorter ultra-compact strings.
- Update README/help copy so the documented badge behavior matches the new trigger and wording.
