# 战势圣坛 HUD 可读性 Design

## Context

`战势圣坛` 已经把 run identity 推到命中回体与闪避后特攻爆发，但 live HUD 目前只在两个瞬间给出反馈:

- `回息修习` 只在命中时弹 `回体+4`
- `借势修习` 只在窗口激活时给 `借势` 短标签

这会让路线 identity 在非触发瞬间重新退回隐形状态。

## Options

1. 只加强 proc 浮字
Rejected: 仍要求玩家等触发后才知道当前路线，常驻辨识度不足。

2. 给事件房摘要加更多文案
Rejected: 进入战斗后视线主要落在行动 HUD，不该要求回头读右侧摘要。

3. 把 shrine identity 钉进行动 HUD
Recommended: 直接复用玩家已经频繁扫读的 `普攻 U / 特攻 O / 闪避 Space` 行，不新增 UI 模块就能持续暴露路线差异。

## Chosen Direction

- `回息修习` 生效时，`普攻 U` 行常驻追加 `回体+4`
- `借势修习` 生效时，`特攻 O` 行在未武装时显示 `借势待闪`
- 翻滚后窗口激活时，`特攻 O` 行改为 `借势1.6s` 这类剩余时间标签

## Testing Focus

- HUD helper 需要覆盖普攻常驻状态标签
- HUD helper 需要覆盖 `借势待闪` 与倒计时标签
- Runtime source hooks 需要锁定 HUD state 取值路径，避免后续回退到裸 `借势`
