# Challenge Dirty Copy Design

## Background

`TODO.md` Active 为空后，本轮默认回到 challenge/sidebar lane。当前 shared helpers 已覆盖 challenge 前缀去重、奖励短句共享和多档位 fallback，但 dirty input 仍有两个可复现缺口：前缀去重后残留的开头分隔符会污染正文，显式 `rewardLabel` 里的 additive token 空白会放大所有 challenge/sidebar surface 的宽度预算。

## Goal

- 让 challenge 标签在反复去掉 `本局/挑战` 前缀后，继续吞掉残留的开头分隔符链，避免 regular / compact 正文出现孤立 `：` / `-`。
- 让显式 `rewardLabel` 统一收紧 `+ 9999金` / `+ 净化` 这类 additive token 空白，保持 visible summary / hidden badge / 完成浮字文案一致。
- 把 bracketed decorator 前缀兼容留作下一轮 heartbeat 的独立 TODO，避免本轮范围继续扩散。

## Options

### Option A: 在 shared helper 内集中规范化 dirty challenge label 与 rewardLabel（recommended）

- Pros: regular / compact / ultra-compact / badge / 完成浮字都会自动复用同一规则。
- Pros: 改动面集中在 `shared/game-core.js` 和现有 regression checks，适合 heartbeat 快速回归。
- Cons: README / 操作指引需要补充新的 dirty-input 说明。

### Option B: 在 `UIScene` 渲染前分别补丁 challenge body 与 badge copy

- Pros: 改动表面上更直观。
- Cons: 规则会再次分叉，shared helper 与 CLI regression 难以保持单一真相。

## Selected Design

- 采用 Option A。
- TODO 1：`normalizeRunChallengeSidebarLabel` 在每轮前缀去重后，继续移除开头的 orphan separators；如果最终只剩分隔符，则回退为空，由现有 safe-label helper 统一转成 `未知挑战`。
- TODO 2：新增显式 `rewardLabel` additive spacing normalization，让 `+ 9999金` / `+ 净化` 统一收敛为 `+9999金` / `+净化`，再交给现有 visible summary / hidden badge / 完成浮字链路复用。
- TODO 3：保留 bracketed decorator prefix cleanup 作为下一轮 Active TODO，本轮不扩到 `【本局挑战】` / `[挑战]`。

## Testing

- 先在 `scripts/regression-checks.mjs` 增加 failing cases，覆盖 orphan separators 和 additive reward token spacing。
- 再修改 `shared/game-core.js` 与 README / help overlay 文案。
- 最终使用 heartbeat 指定命令验证：
  `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
