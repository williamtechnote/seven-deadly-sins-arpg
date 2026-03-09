# Challenge Label Safety Design

## Background

`TODO.md` 当前的 challenge/sidebar 文本预算链路已经覆盖了奖励短句、前缀去重和 ultra-compact badge 回退，但上游 challenge 标签如果带着重复混合的 `本局/挑战` 前缀，现有 normalize helper 只会顺序剥一轮，仍可能留下 `本局击败...` 这类半去重正文。另一类边缘情况是标签本身只有这些前缀，去重后会变成空字符串，compact / regular 摘要就会丢失可读主体。

## Goal

- 让 regular / compact challenge 摘要在面对重复混合前缀时都能稳定归一化为真正的目标文案。
- 当 challenge 标签被循环去重后为空时，统一回退到 `未知挑战`，避免摘要正文出现空洞状态。
- 继续保持 ultra-compact 单行摘要与 badge 路径不扩 scope，只复用现有回退梯子。

## Options

### Option A: 在 normalize helper 里循环剥离 `本局/挑战` 前缀，并在摘要层统一提供 `未知挑战` 回退（recommended）

- Pros: 改动集中，regular / compact 两条摘要路径会同时受益。
- Pros: 不改变 ultra-compact 与 badge 的回退策略，只修正上游标签清洗。
- Cons: README / 帮助文案需要同步“循环去重 + 未知挑战回退”的规则。

### Option B: 为 regular / compact 各自单独补一层前缀去重

- Pros: 逻辑直观。
- Cons: 重复代码，后续容易让两条路径再次漂移。

### Option C: 保持现有单轮去重，只为 prefix-only 标签补 `未知挑战`

- Pros: 触点最少。
- Cons: 仍然会保留重复混合前缀导致的半去重正文，问题没有彻底解决。

## Selected Design

- 使用 Option A。
- 在 `shared/game-core.js` 里把 challenge 标签归一化改成“直到稳定为止”的循环去重。
- 摘要构建阶段统一通过一个 helper 拿到“归一化后标签或 `未知挑战`”的安全文案。
- 在 `scripts/regression-checks.mjs` 先写 failing tests，覆盖 regular / compact 的重复混合前缀与 prefix-only 回退。
- README 与帮助文案补一句：若上游标签重复混入 `本局/挑战` 前缀，会循环去重；若去重后为空，则回退 `未知挑战`。

## Testing

- failing tests: regular in-progress / compact completed 的重复混合前缀去重与 `未知挑战` 回退。
- source-of-truth: 仍然通过 `buildRunChallengeSidebarLines` 断言，不新增额外 UI 分支。
- 最终验证命令保持 heartbeat 约束：
  `node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs`
