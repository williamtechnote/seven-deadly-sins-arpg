import fs from 'node:fs';
import path from 'node:path';

const artifactRoot = path.join(process.cwd(), 'artifacts', 'e2e');

function safeReadJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (_error) {
    return null;
  }
}

function safeReadText(filePath) {
  if (!fs.existsSync(filePath)) return '';
  return fs.readFileSync(filePath, 'utf8');
}

function formatMarkdownLink(label, targetPath) {
  if (!targetPath) return '';
  return `[${label}](${targetPath})`;
}

function getCheckpointRecoveryExpectedReturnLabel(cadenceArtifacts, checkpoint) {
  const snapshot = cadenceArtifacts?.sharedRecoverySnapshot && typeof cadenceArtifacts.sharedRecoverySnapshot === 'object'
    ? cadenceArtifacts.sharedRecoverySnapshot
    : null;
  if (!snapshot) return '';

  const checkpointKey = typeof checkpoint?.key === 'string' ? checkpoint.key.trim() : '';
  const checkpointExpectedReturns = snapshot.checkpointExpectedReturns && typeof snapshot.checkpointExpectedReturns === 'object'
    ? snapshot.checkpointExpectedReturns
    : null;
  if (checkpointKey && checkpointExpectedReturns) {
    const checkpointTarget = checkpointExpectedReturns[checkpointKey];
    if (
      checkpointTarget
      && typeof checkpointTarget === 'object'
      && typeof checkpointTarget.label === 'string'
      && checkpointTarget.label.trim()
    ) {
      return checkpointTarget.label.trim();
    }
  }

  return typeof snapshot.expectedReturnLabel === 'string' && snapshot.expectedReturnLabel.trim()
    ? snapshot.expectedReturnLabel.trim()
    : '';
}

function resolveCurrentRecoveryCheckpoint(cadenceArtifacts) {
  const snapshot = cadenceArtifacts?.sharedRecoverySnapshot && typeof cadenceArtifacts.sharedRecoverySnapshot === 'object'
    ? cadenceArtifacts.sharedRecoverySnapshot
    : null;
  const checkpointEntries = Array.isArray(cadenceArtifacts?.review?.checkpoints)
    ? cadenceArtifacts.review.checkpoints
    : [];
  if (!snapshot || checkpointEntries.length === 0) {
    return null;
  }

  const explicitKey = typeof snapshot.currentCheckpointKey === 'string'
    ? snapshot.currentCheckpointKey.trim()
    : '';
  const explicitStep = Number.isInteger(snapshot.currentCheckpointStep) && snapshot.currentCheckpointStep > 0
    ? snapshot.currentCheckpointStep
    : 0;
  const byKey = explicitKey
    ? checkpointEntries.find((entry) => entry && typeof entry === 'object' && entry.key === explicitKey) || null
    : null;
  const byStep = explicitStep > 0
    ? checkpointEntries[explicitStep - 1] || null
    : null;
  const checkpoint = byKey || byStep;
  if (!checkpoint || typeof checkpoint !== 'object') {
    return null;
  }

  const resolvedKey = typeof checkpoint.key === 'string' && checkpoint.key.trim()
    ? checkpoint.key.trim()
    : explicitKey;
  const resolvedStep = Number.isInteger(checkpoint.step) && checkpoint.step > 0
    ? checkpoint.step
    : explicitStep;
  if (!resolvedKey && resolvedStep <= 0) {
    return null;
  }

  return {
    key: resolvedKey,
    step: resolvedStep
  };
}

function buildCurrentRecoveryCheckpointLabel(cadenceArtifacts) {
  const currentCheckpoint = resolveCurrentRecoveryCheckpoint(cadenceArtifacts);
  if (!currentCheckpoint) {
    return '';
  }

  const parts = [];
  if (currentCheckpoint.step > 0) {
    parts.push(`review checkpoint #${currentCheckpoint.step}`);
  }
  if (currentCheckpoint.key) {
    parts.push(currentCheckpoint.key);
  }
  return parts.join(' ');
}

function buildCurrentCadenceAnchorLabel(cadenceArtifacts) {
  const telegraphSnapshot = cadenceArtifacts?.telegraphSnapshot && typeof cadenceArtifacts.telegraphSnapshot === 'object'
    ? cadenceArtifacts.telegraphSnapshot
    : null;
  const telegraphLabel = typeof telegraphSnapshot?.attackLabel === 'string'
    ? telegraphSnapshot.attackLabel.trim()
    : '';
  if (!telegraphLabel) {
    return '';
  }

  const currentCheckpoint = resolveCurrentRecoveryCheckpoint(cadenceArtifacts);
  const checkpointEntries = Array.isArray(cadenceArtifacts?.review?.checkpoints)
    ? cadenceArtifacts.review.checkpoints
    : [];
  const checkpoint = currentCheckpoint && currentCheckpoint.step > 0
    ? checkpointEntries[currentCheckpoint.step - 1] || null
    : currentCheckpoint?.key
      ? checkpointEntries.find((entry) => entry && typeof entry === 'object' && entry.key === currentCheckpoint.key) || null
      : null;
  const expectedReturnLabel = getCheckpointExpectedReturnLabel(
    checkpoint,
    getCheckpointRecoveryExpectedReturnLabel(cadenceArtifacts, checkpoint)
  );
  if (!expectedReturnLabel) {
    return '';
  }

  return `${telegraphLabel} -> ${expectedReturnLabel}`;
}

function buildCurrentTelegraphHintLabel(cadenceArtifacts) {
  const telegraphSnapshot = cadenceArtifacts?.telegraphSnapshot && typeof cadenceArtifacts.telegraphSnapshot === 'object'
    ? cadenceArtifacts.telegraphSnapshot
    : null;
  return typeof telegraphSnapshot?.counterHint === 'string' && telegraphSnapshot.counterHint.trim()
    ? telegraphSnapshot.counterHint.trim()
    : '';
}

function formatDurationSecondsLabel(durationMs) {
  if (!Number.isFinite(durationMs)) {
    return '';
  }
  const seconds = Math.max(0, durationMs) / 1000;
  return seconds >= 10
    ? `${seconds.toFixed(0)}s`
    : `${seconds.toFixed(1)}s`;
}

function formatCounterWindowEntryCueLabel(startOffsetMs) {
  if (!Number.isFinite(startOffsetMs)) {
    return '';
  }
  if (startOffsetMs > 0) {
    return `telegraph后 +${Math.trunc(startOffsetMs)}ms 开放`;
  }
  if (startOffsetMs < 0) {
    return `telegraph前 ${Math.trunc(startOffsetMs)}ms 预开`;
  }
  return 'telegraph开头 0ms 开放';
}

function formatCounterWindowClosureCueLabel(tailOffsetMs) {
  if (!Number.isFinite(tailOffsetMs)) {
    return '';
  }
  if (tailOffsetMs > 0) {
    return `telegraph后 +${Math.trunc(tailOffsetMs)}ms 收尾`;
  }
  if (tailOffsetMs < 0) {
    return `telegraph内 ${Math.trunc(tailOffsetMs)}ms 收尾`;
  }
  return 'telegraph尾端 0ms 收尾';
}

function formatCounterWindowSpanCueLabel(startOffsetMs, tailOffsetMs) {
  if (!Number.isFinite(startOffsetMs) || !Number.isFinite(tailOffsetMs)) {
    return '';
  }

  let entrySpanLabel = 'telegraph开头';
  if (startOffsetMs > 0) {
    entrySpanLabel = `telegraph后 +${Math.trunc(startOffsetMs)}ms`;
  } else if (startOffsetMs < 0) {
    entrySpanLabel = `telegraph前 ${Math.trunc(startOffsetMs)}ms`;
  }

  let closureSpanLabel = 'telegraph尾端';
  if (tailOffsetMs > 0) {
    closureSpanLabel = `telegraph后 +${Math.trunc(tailOffsetMs)}ms`;
  } else if (tailOffsetMs < 0) {
    closureSpanLabel = `telegraph内 ${Math.trunc(tailOffsetMs)}ms`;
  }

  return `${entrySpanLabel} -> ${closureSpanLabel}`;
}

function formatCounterWindowCoverageCueLabel(counterWindowMs, telegraphDurationMs) {
  if (!Number.isFinite(counterWindowMs) || !Number.isFinite(telegraphDurationMs)) {
    return '';
  }

  if (counterWindowMs >= telegraphDurationMs) {
    const overflowMs = Math.trunc(counterWindowMs - telegraphDurationMs);
    return overflowMs > 0
      ? `telegraph全程 + 后${overflowMs}ms`
      : 'telegraph全程';
  }

  const coverageRatioPercent = Math.round((counterWindowMs / telegraphDurationMs) * 1000) / 10;
  const coverageRatioLabel = Number.isInteger(coverageRatioPercent)
    ? `${coverageRatioPercent}%`
    : `${coverageRatioPercent.toFixed(1)}%`;
  return `telegraph后${coverageRatioLabel}`;
}
function buildCurrentCounterWindowLabel(cadenceArtifacts) {
  const snapshot = cadenceArtifacts?.telegraphSnapshot && typeof cadenceArtifacts.telegraphSnapshot === 'object'
    ? cadenceArtifacts.telegraphSnapshot
    : null;
  if (!snapshot) {
    return '';
  }

  const counterWindowMs = Number.isFinite(snapshot.counterWindowMs)
    ? Math.max(0, Math.trunc(snapshot.counterWindowMs))
    : null;
  const telegraphDurationMs = Number.isFinite(snapshot.telegraphDurationMs)
    ? Math.max(0, Math.trunc(snapshot.telegraphDurationMs))
    : null;
  if (counterWindowMs === null || counterWindowMs <= 0 || telegraphDurationMs === null || telegraphDurationMs <= 0) {
    return '';
  }

  const ratioPercent = Math.round((counterWindowMs / telegraphDurationMs) * 1000) / 10;
  const ratioLabel = Number.isInteger(ratioPercent)
    ? `${ratioPercent}%`
    : `${ratioPercent.toFixed(1)}%`;
  return `${formatDurationSecondsLabel(counterWindowMs)} (${ratioLabel} telegraph)`;
}

function buildCurrentCounterWindowEntryCueLabel(cadenceArtifacts) {
  const snapshot = cadenceArtifacts?.telegraphSnapshot && typeof cadenceArtifacts.telegraphSnapshot === 'object'
    ? cadenceArtifacts.telegraphSnapshot
    : null;
  if (!snapshot) {
    return '';
  }

  const counterWindowMs = Number.isFinite(snapshot.counterWindowMs)
    ? Math.max(0, Math.trunc(snapshot.counterWindowMs))
    : null;
  const startOffsetMs = Number.isFinite(snapshot.counterWindowStartOffsetMs)
    ? snapshot.counterWindowStartOffsetMs
    : null;
  if (counterWindowMs === null || counterWindowMs <= 0 || startOffsetMs === null) {
    return '';
  }

  return formatCounterWindowEntryCueLabel(startOffsetMs);
}

function buildCurrentCounterWindowClosureCueLabel(cadenceArtifacts) {
  const snapshot = cadenceArtifacts?.telegraphSnapshot && typeof cadenceArtifacts.telegraphSnapshot === 'object'
    ? cadenceArtifacts.telegraphSnapshot
    : null;
  if (!snapshot) {
    return '';
  }

  const counterWindowMs = Number.isFinite(snapshot.counterWindowMs)
    ? Math.max(0, Math.trunc(snapshot.counterWindowMs))
    : null;
  const telegraphDurationMs = Number.isFinite(snapshot.telegraphDurationMs)
    ? Math.max(0, Math.trunc(snapshot.telegraphDurationMs))
    : null;
  if (counterWindowMs === null || counterWindowMs <= 0 || telegraphDurationMs === null || telegraphDurationMs <= 0) {
    return '';
  }

  return formatCounterWindowClosureCueLabel(counterWindowMs - telegraphDurationMs);
}

function buildCurrentCounterWindowSpanCueLabel(cadenceArtifacts) {
  const snapshot = cadenceArtifacts?.telegraphSnapshot && typeof cadenceArtifacts.telegraphSnapshot === 'object'
    ? cadenceArtifacts.telegraphSnapshot
    : null;
  if (!snapshot) {
    return '';
  }

  const counterWindowMs = Number.isFinite(snapshot.counterWindowMs)
    ? Math.max(0, Math.trunc(snapshot.counterWindowMs))
    : null;
  const startOffsetMs = Number.isFinite(snapshot.counterWindowStartOffsetMs)
    ? snapshot.counterWindowStartOffsetMs
    : null;
  const telegraphDurationMs = Number.isFinite(snapshot.telegraphDurationMs)
    ? Math.max(0, Math.trunc(snapshot.telegraphDurationMs))
    : null;
  if (
    counterWindowMs === null
    || counterWindowMs <= 0
    || startOffsetMs === null
    || telegraphDurationMs === null
    || telegraphDurationMs <= 0
  ) {
    return '';
  }

  return formatCounterWindowSpanCueLabel(startOffsetMs, counterWindowMs - telegraphDurationMs);
}

function buildCurrentCounterWindowCoverageCueLabel(cadenceArtifacts) {
  const snapshot = cadenceArtifacts?.telegraphSnapshot && typeof cadenceArtifacts.telegraphSnapshot === 'object'
    ? cadenceArtifacts.telegraphSnapshot
    : null;
  if (!snapshot) {
    return '';
  }

  const counterWindowMs = Number.isFinite(snapshot.counterWindowMs)
    ? Math.max(0, Math.trunc(snapshot.counterWindowMs))
    : null;
  const telegraphDurationMs = Number.isFinite(snapshot.telegraphDurationMs)
    ? Math.max(0, Math.trunc(snapshot.telegraphDurationMs))
    : null;
  if (counterWindowMs === null || counterWindowMs <= 0 || telegraphDurationMs === null || telegraphDurationMs <= 0) {
    return '';
  }

  return formatCounterWindowCoverageCueLabel(counterWindowMs, telegraphDurationMs);
}
function buildRecoverySnapshotShortNote(cadenceArtifacts, checkpoint) {
  const snapshot = cadenceArtifacts?.sharedRecoverySnapshot && typeof cadenceArtifacts.sharedRecoverySnapshot === 'object'
    ? cadenceArtifacts.sharedRecoverySnapshot
    : null;
  if (!snapshot) return '';

  const parts = [];
  const sharedRecoveryRemainingMs = Number.isFinite(snapshot.sharedRecoveryRemainingMs)
    ? Math.max(0, Math.trunc(snapshot.sharedRecoveryRemainingMs))
    : null;
  const breatherRemaining = Number.isFinite(snapshot.breatherRemaining)
    ? Math.max(0, Math.trunc(snapshot.breatherRemaining))
    : null;
  const expectedReturnLabel = getCheckpointRecoveryExpectedReturnLabel(cadenceArtifacts, checkpoint);
  const currentCheckpointLabel = buildCurrentRecoveryCheckpointLabel(cadenceArtifacts);

  if (sharedRecoveryRemainingMs !== null) {
    parts.push(`sharedRecoveryRemainingMs=${sharedRecoveryRemainingMs}`);
  }
  if (breatherRemaining !== null) {
    parts.push(`breatherRemaining=${breatherRemaining}`);
  }
  if (expectedReturnLabel) {
    parts.push(`expectedReturnLabel=${expectedReturnLabel}`);
  }
  if (currentCheckpointLabel) {
    parts.push(`currentCheckpoint=${currentCheckpointLabel}`);
  }

  if (parts.length === 0) return '';
  return `recovery 快照: \`${parts.join(' · ')}\``;
}

function buildTelegraphDurationShortNote(cadenceArtifacts) {
  const snapshot = cadenceArtifacts?.telegraphSnapshot && typeof cadenceArtifacts.telegraphSnapshot === 'object'
    ? cadenceArtifacts.telegraphSnapshot
    : null;
  if (!snapshot) return '';

  const telegraphDurationMs = Number.isFinite(snapshot.telegraphDurationMs)
    ? Math.max(0, Math.trunc(snapshot.telegraphDurationMs))
    : null;
  if (telegraphDurationMs === null || telegraphDurationMs <= 0) {
    return '';
  }

  return `telegraphDurationMs: \`${telegraphDurationMs}ms\``;
}

function buildCounterWindowShortNote(cadenceArtifacts) {
  const snapshot = cadenceArtifacts?.telegraphSnapshot && typeof cadenceArtifacts.telegraphSnapshot === 'object'
    ? cadenceArtifacts.telegraphSnapshot
    : null;
  if (!snapshot) return '';

  const counterWindowMs = Number.isFinite(snapshot.counterWindowMs)
    ? Math.max(0, Math.trunc(snapshot.counterWindowMs))
    : null;
  if (counterWindowMs === null || counterWindowMs <= 0) {
    return '';
  }

  return `counterWindowMs: \`${counterWindowMs}ms\``;
}

function buildCounterWindowRatioShortNote(cadenceArtifacts) {
  const snapshot = cadenceArtifacts?.telegraphSnapshot && typeof cadenceArtifacts.telegraphSnapshot === 'object'
    ? cadenceArtifacts.telegraphSnapshot
    : null;
  if (!snapshot) return '';

  const counterWindowMs = Number.isFinite(snapshot.counterWindowMs)
    ? Math.max(0, Math.trunc(snapshot.counterWindowMs))
    : null;
  const telegraphDurationMs = Number.isFinite(snapshot.telegraphDurationMs)
    ? Math.max(0, Math.trunc(snapshot.telegraphDurationMs))
    : null;
  if (counterWindowMs === null || counterWindowMs <= 0 || telegraphDurationMs === null || telegraphDurationMs <= 0) {
    return '';
  }

  const ratioPercent = Math.round((counterWindowMs / telegraphDurationMs) * 1000) / 10;
  const ratioLabel = Number.isInteger(ratioPercent)
    ? `${ratioPercent}%`
    : `${ratioPercent.toFixed(1)}%`;
  return `counterWindowRatio: \`${ratioLabel}\``;
}

function buildCounterWindowDeltaShortNote(cadenceArtifacts) {
  const snapshot = cadenceArtifacts?.telegraphSnapshot && typeof cadenceArtifacts.telegraphSnapshot === 'object'
    ? cadenceArtifacts.telegraphSnapshot
    : null;
  if (!snapshot) return '';

  const counterWindowMs = Number.isFinite(snapshot.counterWindowMs)
    ? Math.max(0, Math.trunc(snapshot.counterWindowMs))
    : null;
  const telegraphDurationMs = Number.isFinite(snapshot.telegraphDurationMs)
    ? Math.max(0, Math.trunc(snapshot.telegraphDurationMs))
    : null;
  if (counterWindowMs === null || counterWindowMs <= 0 || telegraphDurationMs === null || telegraphDurationMs <= 0) {
    return '';
  }

  const deltaMs = counterWindowMs - telegraphDurationMs;
  const deltaLabel = deltaMs >= 0
    ? `+${deltaMs}ms`
    : `${deltaMs}ms`;
  return `counterWindowDeltaMs: \`${deltaLabel}\``;
}

function buildCounterWindowEntryCueShortNote(cadenceArtifacts) {
  const snapshot = cadenceArtifacts?.telegraphSnapshot && typeof cadenceArtifacts.telegraphSnapshot === 'object'
    ? cadenceArtifacts.telegraphSnapshot
    : null;
  if (!snapshot) return '';

  const counterWindowMs = Number.isFinite(snapshot.counterWindowMs)
    ? Math.max(0, Math.trunc(snapshot.counterWindowMs))
    : null;
  const startOffsetMs = Number.isFinite(snapshot.counterWindowStartOffsetMs)
    ? Math.trunc(snapshot.counterWindowStartOffsetMs)
    : null;
  if (counterWindowMs === null || counterWindowMs <= 0 || startOffsetMs === null) {
    return '';
  }

  const entryCueLabel = formatCounterWindowEntryCueLabel(startOffsetMs);
  if (!entryCueLabel) {
    return '';
  }
  return `counterWindowEntryCue: \`${entryCueLabel}\``;
}

function buildCounterWindowSpanCueShortNote(cadenceArtifacts) {
  const snapshot = cadenceArtifacts?.telegraphSnapshot && typeof cadenceArtifacts.telegraphSnapshot === 'object'
    ? cadenceArtifacts.telegraphSnapshot
    : null;
  if (!snapshot) return '';

  const counterWindowMs = Number.isFinite(snapshot.counterWindowMs)
    ? Math.max(0, Math.trunc(snapshot.counterWindowMs))
    : null;
  const startOffsetMs = Number.isFinite(snapshot.counterWindowStartOffsetMs)
    ? Math.trunc(snapshot.counterWindowStartOffsetMs)
    : null;
  const telegraphDurationMs = Number.isFinite(snapshot.telegraphDurationMs)
    ? Math.max(0, Math.trunc(snapshot.telegraphDurationMs))
    : null;
  if (
    counterWindowMs === null
    || counterWindowMs <= 0
    || startOffsetMs === null
    || telegraphDurationMs === null
    || telegraphDurationMs <= 0
  ) {
    return '';
  }

  const spanCueLabel = formatCounterWindowSpanCueLabel(startOffsetMs, counterWindowMs - telegraphDurationMs);
  if (!spanCueLabel) {
    return '';
  }

  return `counterWindowSpanCue: \`${spanCueLabel}\``;
}

function buildCounterWindowTailOffsetShortNote(cadenceArtifacts) {
  const snapshot = cadenceArtifacts?.telegraphSnapshot && typeof cadenceArtifacts.telegraphSnapshot === 'object'
    ? cadenceArtifacts.telegraphSnapshot
    : null;
  if (!snapshot) return '';

  const counterWindowMs = Number.isFinite(snapshot.counterWindowMs)
    ? Math.max(0, Math.trunc(snapshot.counterWindowMs))
    : null;
  const telegraphDurationMs = Number.isFinite(snapshot.telegraphDurationMs)
    ? Math.max(0, Math.trunc(snapshot.telegraphDurationMs))
    : null;
  if (counterWindowMs === null || counterWindowMs <= 0 || telegraphDurationMs === null || telegraphDurationMs <= 0) {
    return '';
  }

  const tailOffsetMs = counterWindowMs - telegraphDurationMs;
  let tailLabel = '0ms at telegraph end';
  if (tailOffsetMs > 0) {
    tailLabel = `+${tailOffsetMs}ms after telegraph`;
  } else if (tailOffsetMs < 0) {
    tailLabel = `${tailOffsetMs}ms before telegraph end`;
  }
  return `counterWindowTailOffsetMs: \`${tailLabel}\``;
}

function buildCounterWindowTailPhaseShortNote(cadenceArtifacts) {
  const snapshot = cadenceArtifacts?.telegraphSnapshot && typeof cadenceArtifacts.telegraphSnapshot === 'object'
    ? cadenceArtifacts.telegraphSnapshot
    : null;
  if (!snapshot) return '';

  const counterWindowMs = Number.isFinite(snapshot.counterWindowMs)
    ? Math.max(0, Math.trunc(snapshot.counterWindowMs))
    : null;
  const telegraphDurationMs = Number.isFinite(snapshot.telegraphDurationMs)
    ? Math.max(0, Math.trunc(snapshot.telegraphDurationMs))
    : null;
  if (counterWindowMs === null || counterWindowMs <= 0 || telegraphDurationMs === null || telegraphDurationMs <= 0) {
    return '';
  }

  const tailOffsetMs = counterWindowMs - telegraphDurationMs;
  let tailPhaseLabel = 'telegraph尾端收束';
  if (tailOffsetMs > 0) {
    tailPhaseLabel = 'telegraph后收束';
  } else if (tailOffsetMs < 0) {
    tailPhaseLabel = 'telegraph内收束';
  }
  return `counterWindowTailPhase: \`${tailPhaseLabel}\``;
}

function buildCounterWindowClosureCueShortNote(cadenceArtifacts) {
  const snapshot = cadenceArtifacts?.telegraphSnapshot && typeof cadenceArtifacts.telegraphSnapshot === 'object'
    ? cadenceArtifacts.telegraphSnapshot
    : null;
  if (!snapshot) return '';

  const counterWindowMs = Number.isFinite(snapshot.counterWindowMs)
    ? Math.max(0, Math.trunc(snapshot.counterWindowMs))
    : null;
  const telegraphDurationMs = Number.isFinite(snapshot.telegraphDurationMs)
    ? Math.max(0, Math.trunc(snapshot.telegraphDurationMs))
    : null;
  if (counterWindowMs === null || counterWindowMs <= 0 || telegraphDurationMs === null || telegraphDurationMs <= 0) {
    return '';
  }

  const closureCueLabel = formatCounterWindowClosureCueLabel(counterWindowMs - telegraphDurationMs);
  if (!closureCueLabel) {
    return '';
  }
  return `counterWindowClosureCue: \`${closureCueLabel}\``;
}

function buildCounterWindowCoverageCueShortNote(cadenceArtifacts) {
  const snapshot = cadenceArtifacts?.telegraphSnapshot && typeof cadenceArtifacts.telegraphSnapshot === 'object'
    ? cadenceArtifacts.telegraphSnapshot
    : null;
  if (!snapshot) return '';

  const counterWindowMs = Number.isFinite(snapshot.counterWindowMs)
    ? Math.max(0, Math.trunc(snapshot.counterWindowMs))
    : null;
  const telegraphDurationMs = Number.isFinite(snapshot.telegraphDurationMs)
    ? Math.max(0, Math.trunc(snapshot.telegraphDurationMs))
    : null;
  if (counterWindowMs === null || counterWindowMs <= 0 || telegraphDurationMs === null || telegraphDurationMs <= 0) {
    return '';
  }

  const coverageCueLabel = formatCounterWindowCoverageCueLabel(counterWindowMs, telegraphDurationMs);
  if (!coverageCueLabel) {
    return '';
  }
  return `counterWindowCoverageCue: \`${coverageCueLabel}\``;
}

function buildExpectedReturnDriftNote(checkpointExpectedReturnLabel, recoveryExpectedReturnLabel) {
  const checkpointLabel = typeof checkpointExpectedReturnLabel === 'string'
    ? checkpointExpectedReturnLabel.trim()
    : '';
  const recoveryLabel = typeof recoveryExpectedReturnLabel === 'string'
    ? recoveryExpectedReturnLabel.trim()
    : '';

  if (!checkpointLabel || !recoveryLabel) {
    return '';
  }
  if (checkpointLabel === recoveryLabel) {
    return '回切校验: match';
  }
  return `回切校验: drift checkpoint=\`${checkpointLabel}\` recovery=\`${recoveryLabel}\``;
}

function getCheckpointExpectedReturnLabel(checkpoint, sharedRecoveryExpectedReturnLabel) {
  if (typeof checkpoint?.expectedReturnLabel === 'string' && checkpoint.expectedReturnLabel.trim()) {
    return checkpoint.expectedReturnLabel.trim();
  }
  return sharedRecoveryExpectedReturnLabel;
}

function buildCadenceSummaryEvidenceLinks(cadenceArtifacts) {
  if (!cadenceArtifacts?.files || typeof cadenceArtifacts.files !== 'object') {
    return '';
  }

  return [
    formatMarkdownLink('review', cadenceArtifacts.files.cadenceReview),
    formatMarkdownLink('recovery', cadenceArtifacts.files.sharedRecoverySnapshot),
    formatMarkdownLink('telegraph', cadenceArtifacts.files.telegraphHud)
  ].filter(Boolean).join(' ');
}

function buildCadenceChecklistEvidenceLinks(cadenceArtifacts) {
  const summaryLinks = buildCadenceSummaryEvidenceLinks(cadenceArtifacts);
  const checkpointLink = formatMarkdownLink('checkpoints', cadenceArtifacts?.files?.checkpointText);
  return [summaryLinks, checkpointLink].filter(Boolean).join(' ');
}

function buildReviewCheckpointShortNote(reviewCheckpointIndex, checkpointEntries) {
  if (!Number.isInteger(reviewCheckpointIndex) || reviewCheckpointIndex < 0) {
    return '';
  }
  if (!Array.isArray(checkpointEntries) || !checkpointEntries[reviewCheckpointIndex]) {
    return '';
  }
  return `review checkpoint #${reviewCheckpointIndex + 1}`;
}

function buildCheckpointAliasShortNote(checkpoint) {
  const checkpointKey = typeof checkpoint?.key === 'string'
    ? checkpoint.key.trim()
    : '';
  if (!checkpointKey) {
    return '';
  }
  const aliasKind = checkpointKey.endsWith('->loopback')
    ? 'loopback'
    : 'bridge';
  return `${aliasKind} checkpoint alias: \`${checkpointKey}\``;
}

function buildBridgeTimelineIndexShortNote(checkpoint) {
  const bridgeStartIndex = Number.isInteger(checkpoint?.bridgeStartIndex)
    ? Math.max(0, checkpoint.bridgeStartIndex)
    : null;
  const bridgeEndIndex = Number.isInteger(checkpoint?.bridgeEndIndex)
    ? Math.max(0, checkpoint.bridgeEndIndex)
    : null;
  const bridgeTimeline = Array.isArray(checkpoint?.bridgeTimeline)
    ? checkpoint.bridgeTimeline
        .filter(entry => typeof entry === 'string' && entry.trim())
        .map(entry => entry.trim())
    : [];

  if (bridgeStartIndex === null && bridgeEndIndex === null && bridgeTimeline.length === 0) {
    return '';
  }

  const firstToken = bridgeTimeline[0] || '';
  const lastToken = bridgeTimeline[bridgeTimeline.length - 1] || firstToken;
  const safeStartIndex = bridgeStartIndex ?? bridgeEndIndex;
  const safeEndIndex = bridgeEndIndex ?? bridgeStartIndex;

  if (safeStartIndex === null || safeEndIndex === null) {
    return '';
  }

  if (safeStartIndex === safeEndIndex) {
    const singleToken = firstToken || `${safeStartIndex}`;
    return `bridgeTimeline index: \`${safeStartIndex} (${singleToken})\``;
  }

  const spanDescriptor = firstToken && lastToken
    ? ` (${firstToken} -> ${lastToken})`
    : '';
  return `bridgeTimeline index: \`${safeStartIndex}-${safeEndIndex}${spanDescriptor}\``;
}

function buildBridgeAttackCountShortNote(checkpoint) {
  const bridgeCount = Number.isInteger(checkpoint?.bridgeCount)
    ? Math.max(0, checkpoint.bridgeCount)
    : null;
  const bridgeAttackCounts = checkpoint?.bridgeAttackCounts && typeof checkpoint.bridgeAttackCounts === 'object'
    ? checkpoint.bridgeAttackCounts
    : null;
  if (!bridgeAttackCounts) {
    return '';
  }

  const dashCount = Number.isInteger(bridgeAttackCounts.dash)
    ? Math.max(0, bridgeAttackCounts.dash)
    : null;
  const charmBoltCount = Number.isInteger(bridgeAttackCounts.charmBolt)
    ? Math.max(0, bridgeAttackCounts.charmBolt)
    : null;
  if (dashCount === null && charmBoltCount === null) {
    return '';
  }

  const countParts = [
    dashCount !== null ? `${dashCount}` : '?',
    charmBoltCount !== null ? `${charmBoltCount}` : '?'
  ];
  const totalSuffix = bridgeCount !== null ? ` (${bridgeCount} total)` : '';
  return `dash/charmBolt count: \`${countParts.join('/')}${totalSuffix}\``;
}

function collectCadenceDriftEntries(cadenceArtifacts) {
  if (!cadenceArtifacts || !Array.isArray(cadenceArtifacts.checkpointLines) || cadenceArtifacts.checkpointLines.length === 0) {
    return {
      matchCount: 0,
      driftCount: 0,
      driftCheckpointLabels: [],
      driftEntries: []
    };
  }

  const checkpointEntries = Array.isArray(cadenceArtifacts.review?.checkpoints)
    ? cadenceArtifacts.review.checkpoints
    : [];

  let matchCount = 0;
  let driftCount = 0;
  const driftCheckpointLabels = [];
  const driftEntries = [];

  cadenceArtifacts.checkpointLines.forEach((line, index) => {
    const checkpoint = checkpointEntries[index] && typeof checkpointEntries[index] === 'object'
      ? checkpointEntries[index]
      : null;
    const expectedReturnLabel = getCheckpointExpectedReturnLabel(
      checkpoint,
      getCheckpointRecoveryExpectedReturnLabel(cadenceArtifacts, checkpoint)
    );
    const recoveryExpectedReturnLabel = getCheckpointRecoveryExpectedReturnLabel(cadenceArtifacts, checkpoint);
    if (!recoveryExpectedReturnLabel) {
      return;
    }
    const driftNote = buildExpectedReturnDriftNote(
      expectedReturnLabel,
      recoveryExpectedReturnLabel
    );

    if (driftNote === '回切校验: match') {
      matchCount += 1;
      return;
    }
    if (driftNote.startsWith('回切校验: drift')) {
      driftCount += 1;
      if (expectedReturnLabel) {
        driftCheckpointLabels.push(`\`${expectedReturnLabel}\``);
      }
      if (line) {
        driftEntries.push({
          line,
          recoverySnapshotShortNote: buildRecoverySnapshotShortNote(cadenceArtifacts, checkpoint),
          driftNote,
          reviewCheckpointShortNote: buildReviewCheckpointShortNote(index, checkpointEntries),
          checkpointAliasShortNote: buildCheckpointAliasShortNote(checkpoint),
          bridgeAttackCountShortNote: buildBridgeAttackCountShortNote(checkpoint),
          bridgeTimelineIndexShortNote: buildBridgeTimelineIndexShortNote(checkpoint),
          counterWindowShortNote: buildCounterWindowShortNote(cadenceArtifacts),
          counterWindowRatioShortNote: buildCounterWindowRatioShortNote(cadenceArtifacts),
          counterWindowDeltaShortNote: buildCounterWindowDeltaShortNote(cadenceArtifacts),
          counterWindowEntryCueShortNote: buildCounterWindowEntryCueShortNote(cadenceArtifacts),
          counterWindowSpanCueShortNote: buildCounterWindowSpanCueShortNote(cadenceArtifacts),
          counterWindowTailOffsetShortNote: buildCounterWindowTailOffsetShortNote(cadenceArtifacts),
          counterWindowTailPhaseShortNote: buildCounterWindowTailPhaseShortNote(cadenceArtifacts),
          counterWindowClosureCueShortNote: buildCounterWindowClosureCueShortNote(cadenceArtifacts),
          counterWindowCoverageCueShortNote: buildCounterWindowCoverageCueShortNote(cadenceArtifacts),
          telegraphDurationShortNote: buildTelegraphDurationShortNote(cadenceArtifacts)
        });
      }
    }
  });

  return {
    matchCount,
    driftCount,
    driftCheckpointLabels,
    driftEntries
  };
}

function buildCadenceCheckpointSummaryLine(cadenceArtifacts) {
  const {
    matchCount,
    driftCount,
    driftCheckpointLabels
  } = collectCadenceDriftEntries(cadenceArtifacts);

  if (matchCount === 0 && driftCount === 0) {
    return '';
  }

  const parts = [`- Phase 3 汇总: match=${matchCount} | drift=${driftCount}`];
  const currentCheckpointLabel = buildCurrentRecoveryCheckpointLabel(cadenceArtifacts);
  if (currentCheckpointLabel) {
    parts.push(`current recovery checkpoint: \`${currentCheckpointLabel}\``);
  }
  const currentCadenceAnchorLabel = buildCurrentCadenceAnchorLabel(cadenceArtifacts);
  if (currentCadenceAnchorLabel) {
    parts.push(`当前复盘锚点: \`${currentCadenceAnchorLabel}\``);
  }
  const currentTelegraphHintLabel = buildCurrentTelegraphHintLabel(cadenceArtifacts);
  if (currentTelegraphHintLabel) {
    parts.push(`当前反制提示: \`${currentTelegraphHintLabel}\``);
  }
  const currentCounterWindowLabel = buildCurrentCounterWindowLabel(cadenceArtifacts);
  if (currentCounterWindowLabel) {
    parts.push(`当前反制窗口: \`${currentCounterWindowLabel}\``);
  }
  const currentCounterWindowEntryCueLabel = buildCurrentCounterWindowEntryCueLabel(cadenceArtifacts);
  if (currentCounterWindowEntryCueLabel) {
    parts.push(`当前窗口起跳: \`${currentCounterWindowEntryCueLabel}\``);
  }
  const currentCounterWindowClosureCueLabel = buildCurrentCounterWindowClosureCueLabel(cadenceArtifacts);
  if (currentCounterWindowClosureCueLabel) {
    parts.push(`当前窗口收束: \`${currentCounterWindowClosureCueLabel}\``);
  }
  const currentCounterWindowSpanCueLabel = buildCurrentCounterWindowSpanCueLabel(cadenceArtifacts);
  if (currentCounterWindowSpanCueLabel) {
    parts.push(`当前窗口跨度: \`${currentCounterWindowSpanCueLabel}\``);
  }
  const currentCounterWindowCoverageCueLabel = buildCurrentCounterWindowCoverageCueLabel(cadenceArtifacts);
  if (currentCounterWindowCoverageCueLabel) {
    parts.push(`当前窗口覆盖: \`${currentCounterWindowCoverageCueLabel}\``);
  }
  if (driftCheckpointLabels.length > 0) {
    parts.push(`drift checkpoints: ${driftCheckpointLabels.join(', ')}`);
    const evidenceLinks = buildCadenceSummaryEvidenceLinks(cadenceArtifacts);
    if (evidenceLinks) {
      parts.push(`证据: ${evidenceLinks}`);
    }
  }
  return parts.join(' | ');
}

function buildCadenceDriftMiniChecklistLines(cadenceArtifacts) {
  const evidenceLinks = buildCadenceChecklistEvidenceLinks(cadenceArtifacts);
  if (!evidenceLinks) {
    return [];
  }

  const { driftEntries } = collectCadenceDriftEntries(cadenceArtifacts);
  if (driftEntries.length === 0) {
    return [];
  }

  return [
    '- Drift-only mini checklist:',
    ...driftEntries.map(({
      line,
      recoverySnapshotShortNote,
      driftNote,
      reviewCheckpointShortNote,
      checkpointAliasShortNote,
      bridgeAttackCountShortNote,
      bridgeTimelineIndexShortNote,
      counterWindowShortNote,
      counterWindowRatioShortNote,
      counterWindowDeltaShortNote,
      counterWindowEntryCueShortNote,
      counterWindowSpanCueShortNote,
      counterWindowTailOffsetShortNote,
      counterWindowTailPhaseShortNote,
      counterWindowClosureCueShortNote,
      counterWindowCoverageCueShortNote,
      telegraphDurationShortNote
    }) => {
      const parts = [line];
      if (recoverySnapshotShortNote) {
        parts.push(recoverySnapshotShortNote);
      }
      if (driftNote) {
        parts.push(driftNote);
      }
      if (reviewCheckpointShortNote) {
        parts.push(reviewCheckpointShortNote);
      }
      if (checkpointAliasShortNote) {
        parts.push(checkpointAliasShortNote);
      }
      if (bridgeAttackCountShortNote) {
        parts.push(bridgeAttackCountShortNote);
      }
      if (bridgeTimelineIndexShortNote) {
        parts.push(bridgeTimelineIndexShortNote);
      }
      if (counterWindowShortNote) {
        parts.push(counterWindowShortNote);
      }
      if (counterWindowRatioShortNote) {
        parts.push(counterWindowRatioShortNote);
      }
      if (counterWindowDeltaShortNote) {
        parts.push(counterWindowDeltaShortNote);
      }
      if (counterWindowEntryCueShortNote) {
        parts.push(counterWindowEntryCueShortNote);
      }
      if (counterWindowSpanCueShortNote) {
        parts.push(counterWindowSpanCueShortNote);
      }
      if (counterWindowTailOffsetShortNote) {
        parts.push(counterWindowTailOffsetShortNote);
      }
      if (counterWindowTailPhaseShortNote) {
        parts.push(counterWindowTailPhaseShortNote);
      }
      if (counterWindowClosureCueShortNote) {
        parts.push(counterWindowClosureCueShortNote);
      }
      if (counterWindowCoverageCueShortNote) {
        parts.push(counterWindowCoverageCueShortNote);
      }
      if (telegraphDurationShortNote) {
        parts.push(telegraphDurationShortNote);
      }
      parts.push(`证据: ${evidenceLinks}`);
      return `  - ${parts.join(' | ')}`;
    })
  ];
}

function buildCadenceCheckpointIndexLines(cadenceArtifacts) {
  if (!cadenceArtifacts || !Array.isArray(cadenceArtifacts.checkpointLines)) {
    return [];
  }

  const checkpointEntries = Array.isArray(cadenceArtifacts.review?.checkpoints)
    ? cadenceArtifacts.review.checkpoints
    : [];
  const evidenceLinks = [
    formatMarkdownLink('review', cadenceArtifacts.files.cadenceReview),
    formatMarkdownLink('checkpoints', cadenceArtifacts.files.checkpointText),
    formatMarkdownLink('recovery', cadenceArtifacts.files.sharedRecoverySnapshot),
    formatMarkdownLink('telegraph', cadenceArtifacts.files.telegraphHud)
  ].filter(Boolean).join(' ');

  return cadenceArtifacts.checkpointLines.map((line, index) => {
    const checkpoint = checkpointEntries[index] && typeof checkpointEntries[index] === 'object'
      ? checkpointEntries[index]
      : null;
    const recoveryExpectedReturnLabel = getCheckpointRecoveryExpectedReturnLabel(cadenceArtifacts, checkpoint);
    const expectedReturnLabel = getCheckpointExpectedReturnLabel(checkpoint, recoveryExpectedReturnLabel);
    const parts = [line];

    if (expectedReturnLabel) {
      parts.push(`回切目标: \`${expectedReturnLabel}\``);
    }
    const recoverySnapshotShortNote = buildRecoverySnapshotShortNote(cadenceArtifacts, checkpoint);
    if (recoverySnapshotShortNote) {
      parts.push(recoverySnapshotShortNote);
    }
    const expectedReturnDriftNote = buildExpectedReturnDriftNote(
      expectedReturnLabel,
      recoveryExpectedReturnLabel
    );
    if (expectedReturnDriftNote) {
      parts.push(expectedReturnDriftNote);
    }
    if (evidenceLinks) {
      parts.push(`证据: ${evidenceLinks}`);
    }

    return parts.join(' | ');
  });
}

function collectArtifactReport(rootDir) {
  const summary = {
    generatedAt: new Date().toISOString(),
    artifactRoot: rootDir,
    tests: []
  };

  if (!fs.existsSync(rootDir)) {
    return summary;
  }

  for (const testName of fs.readdirSync(rootDir)) {
    const testDir = path.join(rootDir, testName);
    if (!fs.statSync(testDir).isDirectory()) continue;

    const metaPath = path.join(testDir, 'meta.json');
    const snapshotPath = path.join(testDir, 'snapshot.json');
    const cadenceReviewPath = path.join(testDir, 'cadence-review.json');
    const checkpointPath = path.join(testDir, 'phase3-checkpoints.txt');
    const sharedRecoveryPath = path.join(testDir, 'shared-recovery-snapshot.json');
    const telegraphHudPath = path.join(testDir, 'telegraph-hud.png');

    const cadenceReview = safeReadJson(cadenceReviewPath);
    const sharedRecoverySnapshot = safeReadJson(sharedRecoveryPath);
    const checkpointText = safeReadText(checkpointPath).trim();
    const reviewCheckpointEntries = Array.isArray(cadenceReview?.review?.checkpoints)
      ? cadenceReview.review.checkpoints
      : [];
    let checkpointLines = [];
    if (Array.isArray(cadenceReview?.checkpointLines) && cadenceReview.checkpointLines.length > 0) {
      checkpointLines = cadenceReview.checkpointLines;
    } else if (checkpointText) {
      checkpointLines = checkpointText.split('\n').map((line) => line.trim()).filter(Boolean);
    } else if (reviewCheckpointEntries.length > 0) {
      checkpointLines = reviewCheckpointEntries
        .map((entry, index) => {
          if (!entry || typeof entry !== 'object') return '';
          const label = typeof entry.recordingFocusLabel === 'string' ? entry.recordingFocusLabel.trim() : '';
          if (!label) return '';
          const suffix = typeof entry.telegraphHint === 'string' && entry.telegraphHint.trim()
            ? ` | ${entry.telegraphHint.trim()}`
            : '';
          return `${index + 1}. ${label}${suffix}`;
        })
        .filter(Boolean);
    }

    summary.tests.push({
      testName,
      testDir,
      relativeDir: path.relative(process.cwd(), testDir),
      hasMeta: fs.existsSync(metaPath),
      hasSnapshot: fs.existsSync(snapshotPath),
      meta: safeReadJson(metaPath),
      cadenceArtifacts: fs.existsSync(cadenceReviewPath) || fs.existsSync(checkpointPath) || fs.existsSync(sharedRecoveryPath) || fs.existsSync(telegraphHudPath)
        ? {
            review: cadenceReview?.review || null,
            telegraphSnapshot: cadenceReview?.telegraphSnapshot || null,
            checkpointLines,
            sharedRecoverySnapshot,
            files: {
              cadenceReview: fs.existsSync(cadenceReviewPath) ? path.relative(process.cwd(), cadenceReviewPath) : null,
              checkpointText: fs.existsSync(checkpointPath) ? path.relative(process.cwd(), checkpointPath) : null,
              sharedRecoverySnapshot: fs.existsSync(sharedRecoveryPath) ? path.relative(process.cwd(), sharedRecoveryPath) : null,
              telegraphHud: fs.existsSync(telegraphHudPath) ? path.relative(process.cwd(), telegraphHudPath) : null
            }
          }
        : null
    });
  }

  summary.tests.sort((left, right) => left.testName.localeCompare(right.testName, 'en'));
  return summary;
}

function renderMarkdownReport(summary) {
  const lines = [
    '# E2E Artifact Report',
    '',
    `- Generated At: ${summary.generatedAt}`,
    `- Artifact Root: \`${path.relative(process.cwd(), summary.artifactRoot) || '.'}\``,
    `- Test Count: ${summary.tests.length}`
  ];

  if (summary.tests.length === 0) {
    lines.push('', 'No E2E artifacts found.');
    return `${lines.join('\n')}\n`;
  }

  for (const test of summary.tests) {
    lines.push(
      '',
      `## ${test.testName}`,
      '',
      `- Directory: \`${test.relativeDir}\``,
      `- Meta: ${test.hasMeta ? '`meta.json`' : 'missing'}`,
      `- Snapshot: ${test.hasSnapshot ? '`snapshot.json`' : 'missing'}`
    );

    if (test.meta?.title) {
      lines.push(`- Title: ${test.meta.title}`);
    }

    if (test.cadenceArtifacts) {
      lines.push(
        '',
        '### Phase 3 录屏复盘清单',
        ''
      );

      if (test.cadenceArtifacts.checkpointLines.length > 0) {
        const summaryLine = buildCadenceCheckpointSummaryLine(test.cadenceArtifacts);
        if (summaryLine) {
          lines.push(summaryLine, '');
        }
        const driftMiniChecklistLines = buildCadenceDriftMiniChecklistLines(test.cadenceArtifacts);
        if (driftMiniChecklistLines.length > 0) {
          lines.push(...driftMiniChecklistLines, '');
        }
        lines.push(...buildCadenceCheckpointIndexLines(test.cadenceArtifacts));
      } else {
        lines.push('暂无 checkpoint 文案');
      }

      lines.push(
        '',
        `- Cadence Review: ${test.cadenceArtifacts.files.cadenceReview ? `\`${test.cadenceArtifacts.files.cadenceReview}\`` : 'missing'}`,
        `- Checkpoint Text: ${test.cadenceArtifacts.files.checkpointText ? `\`${test.cadenceArtifacts.files.checkpointText}\`` : 'missing'}`,
        `- Shared Recovery Snapshot: ${test.cadenceArtifacts.files.sharedRecoverySnapshot ? `\`${test.cadenceArtifacts.files.sharedRecoverySnapshot}\`` : 'missing'}`,
        `- Telegraph HUD: ${test.cadenceArtifacts.files.telegraphHud ? `\`${test.cadenceArtifacts.files.telegraphHud}\`` : 'missing'}`
      );
    }
  }

  return `${lines.join('\n')}\n`;
}

const summary = collectArtifactReport(artifactRoot);

process.stdout.write(renderMarkdownReport(summary));
