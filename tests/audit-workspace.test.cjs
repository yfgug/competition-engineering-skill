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

test('rejects invalid audit arguments', () => {
  assert.equal(run(auditScript, ['--wat']).status, 2);
  assert.equal(run(auditScript, []).status, 2);
});
