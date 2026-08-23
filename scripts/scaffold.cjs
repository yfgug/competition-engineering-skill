#!/usr/bin/env node
/**
 * scaffold.cjs — 一键搭建比赛工程骨架（幂等，已有文件不覆盖）
 *
 * 用法: node scaffold.cjs <目标目录> [--force]
 *   --force  覆盖已存在的模板文件（默认跳过）
 */
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const force = args.includes('--force');
const target = args.find(a => !a.startsWith('--'));

if (!target) {
  console.error('用法: node scaffold.cjs <目标目录> [--force]');
  process.exit(1);
}

const scaffoldDir = path.join(__dirname, '..', 'assets', 'scaffold');
const root = path.resolve(target);

const dirs = ['notes', 'scripts', 'results', 'backups', 'source', 'deliver', 'archive', 'tmp'];

function copyRecursive(srcDir, destDir) {
  fs.mkdirSync(destDir, { recursive: true });
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const src = path.join(srcDir, entry.name);
    const dest = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      copyRecursive(src, dest);
    } else if (force || !fs.existsSync(dest)) {
      fs.copyFileSync(src, dest);
      console.log(`写入: ${path.relative(root, dest)}`);
    } else {
      console.log(`跳过(已存在): ${path.relative(root, dest)}`);
    }
  }
}

fs.mkdirSync(root, { recursive: true });
copyRecursive(scaffoldDir, root);
for (const d of dirs) {
  const dir = path.join(root, d);
  fs.mkdirSync(dir, { recursive: true });
  const placeholder = path.join(dir, '.gitkeep');
  if (fs.readdirSync(dir).length === 0 && !fs.existsSync(placeholder)) {
    fs.writeFileSync(placeholder, '');
  }
}

console.log(`\nSuccess: 骨架已就绪 -> ${root}`);
console.log('下一步:');
console.log('  1. 通读官方规则 -> 填 AGENTS.md 红线（逐条可执行）');
console.log('  2. 跑通 baseline -> tag + zip + SHA256 进 backups/ + 第一篇笔记');
console.log('  3. 方差标定（同一 baseline 评 2-3 次）记入 notes/_submissions.md');
console.log('  4. 填写 00_先看这里.md 第一版');
console.log('模板说明: notes/_TEMPLATE.md=笔记骨架 | notes/_closed_routes.md=closed登记 |');
console.log('          notes/_submissions.md=评测台账 | results/_TEMPLATE.md=结果归档');
