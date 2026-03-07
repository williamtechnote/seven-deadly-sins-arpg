# Quick-Slot Fallback Labels Design

**Context**

The current non-overwrite quick-slot toast falls back to `快捷栏N：+道具` when a consumable has no explicit short label. That keeps the slot-led structure but loses too much meaning for future consumables that are missing handcrafted abbreviations.

**Approaches**

1. Keep `道具`
   Lowest cost, but it does not solve the active TODO and remains too vague.

2. Add another manual fallback map
   More specific, but every new consumable now needs both a short label and a fallback family label.

3. Derive a compact fallback from the localized item name
   Recommended. Keep explicit short labels first. If a short label is missing, derive a compact notice label from the item name by stripping generic suffixes like `药水` / `药剂` / `药` / `油` and trimming whitespace. Reuse the same helper for overwrite copy so both newly assigned and replaced items stay readable without extra per-item config.

**Chosen Design**

- Add a shared helper that resolves the label used in quick-slot notices.
- Prefer existing handcrafted short labels.
- Otherwise derive a compact fallback from the item display name.
- Preserve the current slot-led formats:
  - non-overwrite: `快捷栏N：+<标签>`
  - overwrite same label: `快捷栏N：同类 <标签>`
  - overwrite different labels: `快捷栏N：<旧标签>→<新标签>`
- Only fall back to `道具` when neither a short label nor a usable name is available.

**Testing**

- Add regression coverage for missing-shortname non-overwrite copy using item names.
- Add regression coverage for overwrite copy when either side relies on the derived fallback.
- Update README/help overlay assertions to document the new examples.
