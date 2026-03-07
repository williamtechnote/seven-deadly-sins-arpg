# Quick-Slot Overwrite Shortform Design

**Date:** 2026-03-07

**Problem**

The full quick-slot auto-fill toast is still longer than the actual decision the player needs to read. `已自动装入快捷栏 1（已覆盖 HP → ST）` repeats the slot assignment context and hides the important delta inside parentheses.

**Brainstormed options**

1. Recommended: keep the current slot-1 overwrite rule, but collapse the overwrite toast to a slot-led short sentence such as `快捷栏1：HP→ST` and `快捷栏1：同类 HP`.
2. Keep the current sentence structure and only shorten the overwrite clause, for example `已自动装入 1（HP→ST）`. This saves a few characters but still splits the information across two phrases.
3. Replace the toast with icons only. This would be shortest, but it depends on visual literacy that the keyboard-first flow does not guarantee.

**Chosen design**

For full quick-slot overwrites only, switch to a slot-led shortform:

- Different labels: `快捷栏1：HP→ST`
- Same label: `快捷栏1：同类 HP`
- Missing assigned label fallback: `快捷栏1：替换 HP`

The non-overwrite auto-fill toast stays unchanged as `已自动装入快捷栏 N`, because that path is already short and clearer for first-fill onboarding.

README, help overlay copy, and regression checks will be updated to show the shortform examples so the keyboard `Tab -> 点击 -> 1-4` loop stays documented and guarded.

**This heartbeat's 3 sub-items**

1. 异短名覆盖提示改为 `快捷栏N：旧→新`，并同步 README / 操作指引 / 回归检查。
2. 同短名与缺少新短名的覆盖提示改为 `快捷栏N：同类 <短名>` / `快捷栏N：替换 <短名>`，并同步 README / 操作指引 / 回归检查。
3. 后续评估是否连非覆盖路径的 `已自动装入快捷栏 N` 也值得继续压缩。
