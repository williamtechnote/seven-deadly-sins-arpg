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
    const checkpointText = safeReadText(checkpointPath).trim();
    const checkpointLines = Array.isArray(cadenceReview?.checkpointLines) && cadenceReview.checkpointLines.length > 0
      ? cadenceReview.checkpointLines
      : checkpointText
        ? checkpointText.split('\n').map((line) => line.trim()).filter(Boolean)
        : [];

    summary.tests.push({
      testName,
      testDir,
      relativeDir: path.relative(process.cwd(), testDir),
      hasMeta: fs.existsSync(metaPath),
      hasSnapshot: fs.existsSync(snapshotPath),
      meta: safeReadJson(metaPath),
      cadenceArtifacts: fs.existsSync(cadenceReviewPath) || fs.existsSync(checkpointPath) || fs.existsSync(sharedRecoveryPath) || fs.existsSync(telegraphHudPath)
        ? {
            checkpointLines,
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
        lines.push(...test.cadenceArtifacts.checkpointLines);
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
