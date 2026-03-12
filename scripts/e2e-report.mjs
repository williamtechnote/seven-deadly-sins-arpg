import fs from 'node:fs';
import path from 'node:path';

const artifactRoot = path.join(process.cwd(), 'artifacts', 'e2e');
const summary = {
  generatedAt: new Date().toISOString(),
  tests: []
};

if (fs.existsSync(artifactRoot)) {
  for (const testName of fs.readdirSync(artifactRoot)) {
    const testDir = path.join(artifactRoot, testName);
    if (!fs.statSync(testDir).isDirectory()) continue;
    const metaPath = path.join(testDir, 'meta.json');
    const snapshotPath = path.join(testDir, 'snapshot.json');
    summary.tests.push({
      testName,
      hasMeta: fs.existsSync(metaPath),
      hasSnapshot: fs.existsSync(snapshotPath)
    });
  }
}

process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
