# 连斩修习命中兑现提示 Design

## Context

`战技圣坛` 的 `连斩修习` 现在已经有两层可读性：

- 常驻的 `连斩-18%` HUD 标签
- 当减 CD 真正把普攻推回 ready 时的 `连斩就绪`

但收益仍主要停留在 HUD 层。玩家真正感受到路线兑现的时刻，其实是“更短 CD 让下一次普攻真的更早打中”的那一下。

## Options

1. 每次普攻命中都追加 `连斩` 浮字
Rejected: 会把路线 identity 降成常驻噪音，失去“真实兑现”的语义。

2. 只把 `连斩就绪` 的闪亮时间拉长
Rejected: 仍停留在 HUD，不会把 payoff 推到命中瞬间。

3. 从已有 `连斩就绪` 边缘衍生一个短暂“快于基线”的命中资格窗，并只在那次更早命中真正发生时触发独立 cue
Recommended: 既复用已有 ready cue，又能保证提示只在真实 faster-than-base 的下一次命中时出现。

## Chosen Direction

- `Player` 记录上一轮普攻在无 shrine 加成下的基线 ready 时间。
- 当 HUD 发现 `连斩修习` 让普攻从 cooldown/翻滚后 cooldown 预告切回 ready 时，除了现有 `连斩就绪`，再 arm 一个截至基线 ready 时间的命中资格窗。
- 下一次普攻出手时只给这一轮攻击打上一次性 payoff 标记；若它真的在资格窗内命中，则显示轻量 `连斩` 浮字并追加一层更亮但不夸张的 hit pulse。
- 若玩家等到基线时间之后才出手，或那次更早攻击没有命中，则不触发 cue。

## Testing Focus

- 回归要锁定 HUD ready edge 会同时 arm 命中 payoff 资格窗。
- 普攻出手路径要锁定 hitbox 会继承一次性 payoff 标记。
- 敌人 / Boss 命中路径都要锁定：只有 `consumeDisciplineAttackHitPayoff(...)` 为真时才显示 `连斩` cue。
- README / help overlay 要把 payoff 描述从 HUD ready 扩展到“更早命中”的兑现瞬间。
