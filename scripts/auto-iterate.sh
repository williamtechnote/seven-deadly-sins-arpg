#!/usr/bin/env zsh
set -euo pipefail

PROJECT_DIR="/Users/william.chenwl/work/seven-deadly-sins-arpg"
LOG_DIR="$PROJECT_DIR/.auto-iteration"
RUN_LOG="$LOG_DIR/runner.log"
LOCK_DIR="$PROJECT_DIR/.auto-iterate.lock"
LOCK_TS_FILE="$LOCK_DIR/timestamp"

mkdir -p "$LOG_DIR"
cd "$PROJECT_DIR"

# Ensure context files exist for continuity
[[ -f TODO.md ]] || touch TODO.md
[[ -f PROGRESS.log ]] || touch PROGRESS.log
[[ -f README.md ]] || touch README.md

now_epoch=$(date +%s)
if [[ -d "$LOCK_DIR" ]]; then
  lock_epoch=0
  if [[ -f "$LOCK_TS_FILE" ]]; then
    lock_epoch=$(cat "$LOCK_TS_FILE" 2>/dev/null || echo 0)
  fi
  age=$((now_epoch - lock_epoch))
  if (( age < 1800 )); then
    printf -- "- %s | auto-cycle | task=skip-overlap | branch=n/a | tests=not-run | merge_status=not-run | note=previous cycle still running (lock age=%ss).\n" "$(date '+%Y-%m-%d %H:%M %Z')" "$age" >> PROGRESS.log
    exit 0
  fi
  rm -rf "$LOCK_DIR"
fi

mkdir -p "$LOCK_DIR"
echo "$now_epoch" > "$LOCK_TS_FILE"
cleanup() { rm -rf "$LOCK_DIR"; }
trap cleanup EXIT

read -r -d '' PROMPT <<'EOF' || true
你是资深游戏研发专家与架构师，正在 seven-deadly-sins-arpg 项目中进行持续迭代。

必须严格执行以下流程（每轮都要做）：
1) 确认当前目录为 /Users/william.chenwl/work/seven-deadly-sins-arpg，并确保 TODO.md / PROGRESS.log 存在。
2) 阅读 TODO.md、PROGRESS.log、README.md，分析现状并把后续优先级更新到 TODO.md。
3) 从 TODO.md 选取最早的 2 个 active 项实现；若无 active，则先补充 3 个高价值功能并实现最早 2 个。
4) 总是在分支开发：git checkout -b feat/auto-[short-description]
5) 实现功能、更新 README、补充/更新测试。
6) 运行测试：
   node --check game.js && node --check data.js && node --check shared/game-core.js && node scripts/regression-checks.mjs
7) 若测试通过：commit、merge 到 main、保留 feature 分支、push main。
   若一次 debug 后仍失败：保留 feature 分支供 review，不合并。
8) 强制审计日志：每轮必须追加一条到 PROGRESS.log，包含 timestamp/task/branch/test command+result/merge status。
   若未实现也要明确写 blocked/no task/conflict 原因。

额外要求：
- 保持改动小而可验证。
- 不要删除任何 feature 分支（本地和远端都保留）。
- 输出最后总结：branch、变更文件、测试结果、merge 状态。
EOF

{
  echo "==== $(date '+%Y-%m-%d %H:%M:%S %Z') auto-cycle start ===="
  codex exec --full-auto "$PROMPT"
  status=$?
  echo "==== $(date '+%Y-%m-%d %H:%M:%S %Z') auto-cycle end (status=$status) ===="
  exit $status
} >> "$RUN_LOG" 2>&1 || {
  printf -- "- %s | auto-cycle | task=runner-failed | branch=n/a | tests=not-run | merge_status=not-run | note=codex exec failed, see .auto-iteration/runner.log\n" "$(date '+%Y-%m-%d %H:%M %Z')" >> PROGRESS.log
  exit 1
}
