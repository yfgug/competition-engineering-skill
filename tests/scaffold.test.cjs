const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const test = require('node:test');

const repoRoot = path.resolve(__dirname, '..');
const script = path.join(repoRoot, 'scripts', 'scaffold.cjs');

function run(args) {
  return spawnSync(process.execPath, [script, ...args], {
    encoding: 'utf8',
  });
}

function createTarget(t, suffix = '比赛 项目') {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'competition-skill-test-'));
  t.after(() => fs.rmSync(tempRoot, { recursive: true, force: true }));
  return path.join(tempRoot, suffix);
}

test('dry-run reports operations without creating the target', t => {
  const target = createTarget(t);
  const result = run([target, '--dry-run']);

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /未修改文件/);
  assert.equal(fs.existsSync(target), false);
});

test('creates a scaffold and preserves existing files by default', t => {
  const target = createTarget(t);
  const first = run([target]);

  assert.equal(first.status, 0, first.stderr);
  for (const relative of [
    '00_先看这里.md',
    'AGENTS.md',
    'notes/_evaluations.md',
    'notes/_submissions.md',
    'results/_TEMPLATE.md',
    'source/.gitkeep',
  ]) {
    assert.equal(fs.existsSync(path.join(target, relative)), true, relative);
  }

  const readme = path.join(target, 'README.md');
  fs.writeFileSync(readme, 'CUSTOM\n', 'utf8');
  const second = run([target]);

  assert.equal(second.status, 0, second.stderr);
  assert.equal(fs.readFileSync(readme, 'utf8'), 'CUSTOM\n');
});

test('--force overwrites existing template files', t => {
  const target = createTarget(t);
  assert.equal(run([target]).status, 0);

  const readme = path.join(target, 'README.md');
  fs.writeFileSync(readme, 'CUSTOM\n', 'utf8');
  const forced = run([target, '--force']);

  assert.equal(forced.status, 0, forced.stderr);
  assert.notEqual(fs.readFileSync(readme, 'utf8'), 'CUSTOM\n');
  assert.match(forced.stdout, /覆盖/);
});

test('rejects unknown options and multiple targets', () => {
  assert.equal(run(['target', '--wat']).status, 2);
  assert.equal(run(['one', 'two']).status, 2);
});

test('rejects targets inside the skill directory', () => {
  const result = run([path.join(repoRoot, 'tmp-scaffold-target'), '--dry-run']);

  assert.equal(result.status, 2);
  assert.match(result.stderr, /不能位于 Skill 自身目录内/);
});
