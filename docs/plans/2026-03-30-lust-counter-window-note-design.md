# Lust Counter Window Note Design

## Goal

在 `Phase 3 录屏复盘清单` 的 drift-only mini checklist 中补出 `counterWindowMs` short note，让复盘者不必回头翻 `telegraph-hud.png` 也能知道该段漂移前仍剩多少可反制空档。

## Approach

沿用现有 `telegraphDurationMs` short note 的实现路径，从 cadence artifact bundle 里的 `telegraphSnapshot` 读取 `counterWindowMs`，在 markdown 报告生成阶段为每条 drift row 拼接一个新的 short note。

这次不改 checkpoint 生成语义，不增加新的 artifact 文件，只补齐已有 artifact 字段的可读展示，并用回归测试锁住输出格式。

## Testing

- 在 `scripts/regression-checks.mjs` 里先补失败断言，要求 drift-only mini checklist 输出 `counterWindowMs: \`1700ms\``。
- 更新 `scripts/e2e-report.mjs` 后重新跑回归，确认 CLI markdown、README 文档与既有 cadence artifact bundle 都保持一致。
