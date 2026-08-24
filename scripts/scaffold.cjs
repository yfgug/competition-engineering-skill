#!/usr/bin/env node
/**
 * 一键搭建比赛工程骨架。
 *
 * 用法:
 *   node scaffold.cjs <目标目录> [--dry-run] [--force]
 */
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
let target;
let force = false;
let dryRun = false;
let showHelp = false;

function printUsage(stream = process.stdout) {
  stream.write([
    '用法: node scaffold.cjs <目标目录> [--dry-run] [--force]',
    '',
    '选项:',
    '  --dry-run  只显示将执行的操作，不创建或修改文件',
    '  --force    覆盖已存在的模板文件',
    '  -h, --help 显示帮助',
    '',
  ].join('\n'));
}

function fail(message) {
  console.error(`错误: ${message}`);
  printUsage(process.stderr);
  process.exit(2);
}

for (const arg of args) {
  if (arg === '--force') {
    force = true;
  } else if (arg === '--dry-run') {
    dryRun = true;
  } else if (arg === '-h' || arg === '--help') {
    showHelp = true;
  } else if (arg.startsWith('-')) {
    fail(`未知参数 ${arg}`);
  } else if (target) {
    fail('只能指定一个目标目录');
  } else {
    target = arg;
  }
}

if (showHelp) {
  printUsage();
  process.exit(0);
}

if (!target) {
  fail('缺少目标目录');
}

const skillRoot = path.resolve(__dirname, '..');
const scaffoldDir = path.join(skillRoot, 'assets', 'scaffold');
const root = path.resolve(target);
const dirs = ['notes', 'scripts', 'results', 'backups', 'source', 'deliver', 'archive', 'tmp'];
const counts = { write: 0, overwrite: 0, skip: 0 };

function isSameOrInside(candidate, parent) {
  const relative = path.relative(parent, candidate);
  return relative === ''
    || (relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative));
}

if (isSameOrInside(root, skillRoot)) {
  fail('目标目录不能位于 Skill 自身目录内');
}

function displayPath(filePath) {
  const relative = path.relative(root, filePath);
  return relative || '.';
}

function report(action, filePath) {
  const prefix = dryRun ? '预览' : action === 'skip' ? '跳过' : '执行';
  const labels = {
    write: '写入',
    overwrite: '覆盖',
    skip: '已存在',
    mkdir: '创建目录',
  };
  console.log(`${prefix}: ${labels[action]} ${displayPath(filePath)}`);
}

function copyRecursive(srcDir, destDir) {
  if (!dryRun) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const src = path.join(srcDir, entry.name);
    const dest = path.join(destDir, entry.name);

    if (entry.isDirectory()) {
      copyRecursive(src, dest);
      continue;
    }

    const exists = fs.existsSync(dest);
    const action = exists ? (force ? 'overwrite' : 'skip') : 'write';
    counts[action] += 1;
    report(action, dest);

    if (!dryRun && action !== 'skip') {
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(src, dest);
    }
  }
}

function ensureProjectDirectories() {
  for (const name of dirs) {
    const dir = path.join(root, name);
    const scaffoldSource = path.join(scaffoldDir, name);
    const sourceHasFiles = fs.existsSync(scaffoldSource) && fs.readdirSync(scaffoldSource).length > 0;
    const destinationHasFiles = fs.existsSync(dir) && fs.readdirSync(dir).length > 0;

    if (dryRun) {
      if (!fs.existsSync(dir) && !sourceHasFiles) {
        report('mkdir', dir);
      }
      if (!sourceHasFiles && !destinationHasFiles) {
        report('write', path.join(dir, '.gitkeep'));
        counts.write += 1;
      }
      continue;
    }

    fs.mkdirSync(dir, { recursive: true });
    if (fs.readdirSync(dir).length === 0) {
      fs.writeFileSync(path.join(dir, '.gitkeep'), '');
    }
  }
}

copyRecursive(scaffoldDir, root);
ensureProjectDirectories();

const mode = dryRun ? '预览完成，未修改文件' : '骨架已就绪';
console.log(`\n${mode}: ${root}`);
console.log(`汇总: 写入 ${counts.write}，覆盖 ${counts.overwrite}，跳过 ${counts.skip}`);

if (!dryRun) {
  console.log('下一步唯一动作: 填写 00_先看这里.md 的指标契约。');
}
