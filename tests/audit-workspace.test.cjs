const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const test = require('node:test');

const repoRoot = path.resolve(__dirname, '..');
const scaffoldScript = path.join(repoRoot, 'scripts', 'scaffold.cjs');
const auditScript = path.join(repoRoot, 'scripts', 'audit_workspace.cjs');

function run(script, args) {
  return spawnSync(process.execPath, [script, ...args], {
    encoding: 'utf8',
  });
}

function createRoot(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'competition-audit-test-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  return root;
}

test('audits a generated research workspace without errors', t => {
  const root = createRoot(t);
  const scaffold = run(scaffoldScript, [root, '--profile', 'research']);

  assert.equal(scaffold.status, 0, scaffold.stderr);
  const audit = run(auditScript, [root, '--json']);
  assert.equal(audit.status, 0, audit.stderr);

  const result = JSON.parse(audit.stdout);
  assert.equal(result.schemaVersion, 1);
  assert.equal(result.errors, 0);
  assert.equal(result.workspace, root);
  assert.equal(fs.existsSync(path.join(root, 'paper', 'CLAIMS.md')), true);
});

test('detects stale paths, duplicate directories, and oversized dynamic AGENTS', t => {
  const root = createRoot(t);
  fs.mkdirSync(path.join(root, 'codex_persistent'), { recursive: true });
  fs.mkdirSync(path.join(root, 'output'));
  fs.mkdirSync(path.join(root, 'outputs'));

  fs.writeFileSync(
    path.join(root, '00_先看这里.md'),
    '# Entry\n\n`Z:\\old-root\\codex_persistent\\119_latest.md`\n',
    'utf8',
  );

  const refs = Array.from(
    { length: 12 },
    (_, index) => '- codex_persistent/' + (index + 1) + '_note.md',
  ).join('\n');
  fs.writeFileSync(
    path.join(root, 'AGENTS.md'),
    '# Rules\n\n' + refs + '\n' + 'x'.repeat(40 * 1024) + '\n',
    'utf8',
  );

  const note = path.join(root, 'codex_persistent', '119_latest.md');
  fs.writeFileSync(note, '# Legacy note\n', 'utf8');
  const future = new Date(Date.now() + 2 * 60 * 1000);
  fs.utimesSync(note, future, future);

  const audit = run(auditScript, [root, '--json']);
  assert.equal(audit.status, 0, audit.stderr);

  const result = JSON.parse(audit.stdout);
  const codes = new Set(result.findings.map(item => item.code));
  for (const code of [
    'STALE_ABSOLUTE_PATH',
    'POTENTIAL_DUPLICATE_DIRS',
    'OVERSIZED_AGENTS',
    'AGENTS_DYNAMIC_INDEX',
    'LEGACY_NOTE_NAMES',
    'LEGACY_NOTE_FORMAT',
    'ENTRY_OLDER_THAN_NOTES',
  ]) {
    assert.equal(codes.has(code), true, code);
  }
  assert.match(
    result.findings.find(item => item.code === 'STALE_ABSOLUTE_PATH').message,
    /可能替代: codex_persistent\/119_latest\.md/,
  );
});

test('--strict returns nonzero when warnings exist', t => {
  const root = createRoot(t);
  const result = run(auditScript, [root, '--strict']);

  assert.equal(result.status, 1);
  assert.match(result.stdout, /MISSING_EXPECTED_PATH/);
});

test('--all scans Markdown outside governance directories', t => {
  const root = createRoot(t);
  assert.equal(run(scaffoldScript, [root]).status, 0);
  fs.mkdirSync(path.join(root, 'docs'));
  fs.writeFileSync(path.join(root, 'docs', 'legacy.md'), '# Legacy\n\n`Z:\\missing\\artifact.bin`\n', 'utf8');

  const normal = JSON.parse(run(auditScript, [root, '--json']).stdout);
  const all = JSON.parse(run(auditScript, [root, '--json', '--all']).stdout);

  assert.equal(normal.findings.some(item => item.code === 'STALE_ABSOLUTE_PATH'), false);
  assert.equal(all.findings.some(item => item.code === 'STALE_ABSOLUTE_PATH'), true);
  assert.equal(all.scannedMarkdown > normal.scannedMarkdown, true);
});

test('--exclude removes noisy subtrees from an all scan', t => {
  const root = createRoot(t);
  assert.equal(run(scaffoldScript, [root]).status, 0);
  fs.mkdirSync(path.join(root, 'docs'), { recursive: true });
  fs.mkdirSync(path.join(root, 'vendor', 'docs'), { recursive: true });
  fs.writeFileSync(path.join(root, 'docs', 'keep.md'), '# Keep\n\n`Z:\\missing\\keep.bin`\n', 'utf8');
  fs.writeFileSync(path.join(root, 'vendor', 'docs', 'noise.md'), '# Noise\n\n`Z:\\missing\\noise.bin`\n', 'utf8');

  const audit = run(auditScript, [root, '--json', '--all', '--exclude', '**/vendor/**']);
  assert.equal(audit.status, 0, audit.stderr);
  const result = JSON.parse(audit.stdout);
  const stale = result.findings.filter(item => item.code === 'STALE_ABSOLUTE_PATH');
  assert.equal(stale.length, 1);
  assert.match(stale[0].message, /keep\.bin/);
  assert.deepEqual(result.scan.excludePatterns, ['**/vendor/**']);
  assert.equal(result.scan.excludedPaths > 0, true);
});

test('--max-files reports a deterministic truncated scan', t => {
  const root = createRoot(t);
  assert.equal(run(scaffoldScript, [root]).status, 0);
  fs.mkdirSync(path.join(root, 'docs'), { recursive: true });
  for (let index = 0; index < 3; index += 1) {
    fs.writeFileSync(path.join(root, 'docs', `${index}.md`), `# ${index}\n`, 'utf8');
  }

  const audit = run(auditScript, [root, '--json', '--all', '--max-files', '1']);
  assert.equal(audit.status, 0, audit.stderr);
  const result = JSON.parse(audit.stdout);
  assert.equal(result.scannedMarkdown, 1);
  assert.equal(result.scan.maxFiles, 1);
  assert.equal(result.scan.truncated, true);
  assert.equal(result.findings.some(item => item.code === 'MARKDOWN_SCAN_LIMIT'), true);
});

test('--ready reports unresolved scaffold placeholders', t => {
  const root = createRoot(t);
  assert.equal(run(scaffoldScript, [root, '--profile', 'research']).status, 0);

  const audit = run(auditScript, [root, '--json', '--ready']);
  assert.equal(audit.status, 0, audit.stderr);
  const result = JSON.parse(audit.stdout);
  assert.equal(result.readiness.checked, true);
  assert.equal(result.readiness.profile, 'research');
  assert.equal(result.readiness.unresolvedFiles >= 4, true);
  assert.equal(result.findings.some(item => item.code === 'UNRESOLVED_PLACEHOLDERS'), true);
  assert.equal(run(auditScript, [root, '--ready', '--strict']).status, 1);
});

test('--ready passes after active research handoff files are filled', t => {
  const root = createRoot(t);
  assert.equal(run(scaffoldScript, [root, '--profile', 'research']).status, 0);
  const files = {
    '00_先看这里.md': '# Research\n\n- 项目类型: research\n- 研究类型: confirmatory\n- 主指标: latency\n- 方向: minimize\n- 当前推荐身份: abc123\n\n## 下一步唯一动作\n\nRun eval-01.\n',
    'AGENTS.md': '# Rules\n\n- Preserve the evaluator.\n',
    'paper/README.md': '# Paper\n\n- Stage: experiments\n- Venue: systems conference\n',
    'paper/CLAIMS.md': '# Claims\n\n| claim ID | claim | status | evidence |\n|---|---|---|---|\n| C-01 | Candidate lowers latency in the declared environment. | proposed | eval-01 |\n',
    'paper/ARTIFACTS.md': '# Artifacts\n\n| ID | claim | source |\n|---|---|---|\n| F1 | C-01 | results/eval-01 |\n',
    'data/README.md': '# Data\n\n| ID | source | license | hash |\n|---|---|---|---|\n| D-01 | official benchmark | permitted | sha256:abc |\n',
  };
  for (const [relative, content] of Object.entries(files)) {
    fs.writeFileSync(path.join(root, relative), content, 'utf8');
  }

  const audit = run(auditScript, [root, '--json', '--ready', '--strict']);
  assert.equal(audit.status, 0, audit.stderr);
  const result = JSON.parse(audit.stdout);
  assert.equal(result.warnings, 0);
  assert.equal(result.readiness.profile, 'research');
  assert.equal(result.readiness.unresolvedFiles, 0);
});

test('--ready accepts an explicit profile for a legacy workspace', t => {
  const root = createRoot(t);
  assert.equal(run(scaffoldScript, [root]).status, 0);
  const entryPath = path.join(root, '00_先看这里.md');
  const legacyEntry = fs.readFileSync(entryPath, 'utf8')
    .replace(/^- 项目类型: competition\r?\n/m, '');
  fs.writeFileSync(entryPath, legacyEntry, 'utf8');

  const audit = run(auditScript, [root, '--json', '--ready', '--profile', 'competition']);
  assert.equal(audit.status, 0, audit.stderr);
  const result = JSON.parse(audit.stdout);
  assert.equal(result.readiness.profile, 'competition');
  assert.equal(result.readiness.profileSource, 'explicit');
  assert.equal(result.findings.some(item => item.code === 'UNKNOWN_PROJECT_PROFILE'), false);

  fs.writeFileSync(entryPath, `${legacyEntry}\n- 项目类型: research\n`, 'utf8');
  const conflict = run(auditScript, [root, '--json', '--ready', '--profile', 'competition']);
  assert.equal(conflict.status, 0, conflict.stderr);
  const conflictResult = JSON.parse(conflict.stdout);
  assert.equal(conflictResult.findings.some(item => item.code === 'PROFILE_OVERRIDE_CONFLICT'), true);
});

test('invalid UTF-8 is an audit error', t => {
  const root = createRoot(t);
  assert.equal(run(scaffoldScript, [root]).status, 0);
  fs.writeFileSync(path.join(root, 'notes', '20260825_01_bad_open.md'), Buffer.from([0xc3, 0x28]));

  const audit = run(auditScript, [root, '--json']);
  assert.equal(audit.status, 1);
  const result = JSON.parse(audit.stdout);
  assert.equal(result.findings.some(item => item.code === 'INVALID_UTF8'), true);
});

test('trims prose punctuation from absolute paths', t => {
  const root = createRoot(t);
  assert.equal(run(scaffoldScript, [root]).status, 0);
  fs.writeFileSync(
    path.join(root, '00_先看这里.md'),
    '# Entry\n\n旧位置是 Z:\\old-root\\artifact.bin).\n',
    'utf8',
  );

  const audit = run(auditScript, [root, '--json']);
  assert.equal(audit.status, 0, audit.stderr);
  const result = JSON.parse(audit.stdout);
  const finding = result.findings.find(item => item.code === 'STALE_ABSOLUTE_PATH');
  assert.equal(finding.message.includes('artifact.bin).'), false);
  assert.match(finding.message, /artifact\.bin$/);
});

test('accepts an existing backtick-delimited Windows path with spaces', t => {
  const root = createRoot(t);
  assert.equal(run(scaffoldScript, [root]).status, 0);
  const evidenceDir = path.join(root, 'actual dir');
  fs.mkdirSync(evidenceDir);
  const evidence = path.join(evidenceDir, 'evidence.txt');
  fs.writeFileSync(evidence, 'ok\n', 'utf8');
  fs.writeFileSync(
    path.join(root, '00_先看这里.md'),
    '# Entry\n\n`' + evidence + '`\n',
    'utf8',
  );

  const audit = run(auditScript, [root, '--json']);
  assert.equal(audit.status, 0, audit.stderr);
  const result = JSON.parse(audit.stdout);
  assert.equal(result.findings.some(item => item.code === 'STALE_ABSOLUTE_PATH'), false);
});

test('accepts an unquoted Windows path with spaces in directory segments', t => {
  const root = createRoot(t);
  assert.equal(run(scaffoldScript, [root]).status, 0);
  const evidenceDir = path.join(root, 'actual dir');
  fs.mkdirSync(evidenceDir);
  const evidence = path.join(evidenceDir, 'evidence.txt');
  fs.writeFileSync(evidence, 'ok\n', 'utf8');
  fs.writeFileSync(path.join(root, '00_先看这里.md'), '# Entry\n\n' + evidence + '\n', 'utf8');

  const audit = run(auditScript, [root, '--json']);
  assert.equal(audit.status, 0, audit.stderr);
  const result = JSON.parse(audit.stdout);
  assert.equal(result.findings.some(item => item.code === 'STALE_ABSOLUTE_PATH'), false);
});

test('rejects invalid audit arguments', () => {
  assert.equal(run(auditScript, ['--wat']).status, 2);
  assert.equal(run(auditScript, []).status, 2);
  assert.equal(run(auditScript, ['target', '--exclude']).status, 2);
  assert.equal(run(auditScript, ['target', '--exclude', 'D:\\vendor']).status, 2);
  assert.equal(run(auditScript, ['target', '--exclude', '../vendor']).status, 2);
  assert.equal(run(auditScript, ['target', '--max-files', '0']).status, 2);
  assert.equal(run(auditScript, ['target', '--max-files', '9007199254740992']).status, 2);
  assert.equal(run(auditScript, ['target', '--profile']).status, 2);
  assert.equal(run(auditScript, ['target', '--profile', 'unknown', '--ready']).status, 2);
  assert.equal(run(auditScript, ['target', '--profile', 'competition']).status, 2);
});
