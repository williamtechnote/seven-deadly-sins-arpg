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
  const expectedReturnLabel = typeof snapshot.expectedReturnLabel === 'string' && snapshot.expectedReturnLabel.trim()
    ? snapshot.expectedReturnLabel.trim()
    : typeof checkpoint?.expectedReturnLabel === 'string' && checkpoint.expectedReturnLabel.trim()
      ? checkpoint.expectedReturnLabel.trim()
      : '';

  if (sharedRecoveryRemainingMs !== null) {
    parts.push(`sharedRecoveryRemainingMs=${sharedRecoveryRemainingMs}`);
  }
  if (breatherRemaining !== null) {
    parts.push(`breatherRemaining=${breatherRemaining}`);
  }
  if (expectedReturnLabel) {
    parts.push(`expectedReturnLabel=${expectedReturnLabel}`);
  }

  if (parts.length === 0) return '';
  return `recovery 快照: \`${parts.join(' · ')}\``;
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

function buildCadenceCheckpointSummaryLine(cadenceArtifacts) {
  if (!cadenceArtifacts || !Array.isArray(cadenceArtifacts.checkpointLines) || cadenceArtifacts.checkpointLines.length === 0) {
    return '';
  }

  const checkpointEntries = Array.isArray(cadenceArtifacts.review?.checkpoints)
    ? cadenceArtifacts.review.checkpoints
    : [];
  const sharedRecoveryExpectedReturnLabel = typeof cadenceArtifacts.sharedRecoverySnapshot?.expectedReturnLabel === 'string'
    ? cadenceArtifacts.sharedRecoverySnapshot.expectedReturnLabel.trim()
    : '';
  if (!sharedRecoveryExpectedReturnLabel) {
    return '';
  }

  let matchCount = 0;
  let driftCount = 0;
  const driftCheckpointLabels = [];

  cadenceArtifacts.checkpointLines.forEach((_line, index) => {
    const checkpoint = checkpointEntries[index] && typeof checkpointEntries[index] === 'object'
      ? checkpointEntries[index]
      : null;
    const expectedReturnLabel = getCheckpointExpectedReturnLabel(
      checkpoint,
      sharedRecoveryExpectedReturnLabel
    );
    const driftNote = buildExpectedReturnDriftNote(
      expectedReturnLabel,
      sharedRecoveryExpectedReturnLabel
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
    }
  });

  if (matchCount === 0 && driftCount === 0) {
    return '';
  }

  const parts = [`- Phase 3 汇总: match=${matchCount} | drift=${driftCount}`];
  if (driftCheckpointLabels.length > 0) {
    parts.push(`drift checkpoints: ${driftCheckpointLabels.join(', ')}`);
    const evidenceLinks = buildCadenceSummaryEvidenceLinks(cadenceArtifacts);
    if (evidenceLinks) {
      parts.push(`证据: ${evidenceLinks}`);
    }
  }
  return parts.join(' | ');
}

function buildCadenceCheckpointIndexLines(cadenceArtifacts) {
  if (!cadenceArtifacts || !Array.isArray(cadenceArtifacts.checkpointLines)) {
    return [];
  }

  const checkpointEntries = Array.isArray(cadenceArtifacts.review?.checkpoints)
    ? cadenceArtifacts.review.checkpoints
    : [];
  const sharedRecoveryExpectedReturnLabel = typeof cadenceArtifacts.sharedRecoverySnapshot?.expectedReturnLabel === 'string'
    ? cadenceArtifacts.sharedRecoverySnapshot.expectedReturnLabel.trim()
    : '';
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
    const expectedReturnLabel = getCheckpointExpectedReturnLabel(checkpoint, sharedRecoveryExpectedReturnLabel);
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
      sharedRecoveryExpectedReturnLabel
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
