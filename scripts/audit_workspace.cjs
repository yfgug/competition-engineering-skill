#!/usr/bin/env node
/**
 * Read-only audit for competition and experimental-research workspaces.
 *
 * Usage:
 *   node audit_workspace.cjs <workspace> [--json] [--strict] [--all]
 */
const fs = require('fs');
const path = require('path');
const { TextDecoder } = require('util');

const args = process.argv.slice(2);
let target;
let json = false;
let strict = false;
let showHelp = false;
let scanAll = false;

function printUsage(stream = process.stdout) {
  stream.write([
    '用法: node audit_workspace.cjs <工作区> [--json] [--strict] [--all]',
    '',
    '选项:',
    '  --json     输出机器可读 JSON',
    '  --strict   存在 warning 时返回非零状态',
    '  --all      扫描整个工作区；默认只扫治理文档和实验记录',
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
  if (arg === '--json') {
    json = true;
  } else if (arg === '--strict') {
    strict = true;
  } else if (arg === '--all') {
    scanAll = true;
  } else if (arg === '-h' || arg === '--help') {
    showHelp = true;
  } else if (arg.startsWith('-')) {
    fail(`未知参数 ${arg}`);
  } else if (target) {
    fail('只能指定一个工作区');
  } else {
    target = arg;
  }
}

if (showHelp) {
  printUsage();
  process.exit(0);
}

if (!target) {
  fail('缺少工作区');
}

const root = path.resolve(target);
if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) {
  fail(`工作区不存在或不是目录: ${root}`);
}

const findings = [];
const skippedDirs = new Set([
  '.git',
  'node_modules',
  'archive',
  'tmp',
  'dist',
  'public_repos',
  'best_backups',
  'existing_repo',
  'external_refs',
]);
const governanceDirs = ['notes', 'codex_persistent', 'results', 'analysis_results', 'paper', 'data'];
const maxMarkdownFiles = 5000;
const maxFileBytes = 2 * 1024 * 1024;

function add(severity, code, message, file) {
  findings.push({
    severity,
    code,
    message,
    ...(file ? { file: normalizeRelative(file) } : {}),
  });
}

function normalizeRelative(file) {
  const relative = path.relative(root, file);
  return relative.split(path.sep).join('/');
}

function isSameOrInside(candidate, parent) {
  const relative = path.relative(parent, candidate);
  return relative === ''
    || (relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative));
}

function walkMarkdown(dir, output, maxDepth = Number.POSITIVE_INFINITY, depth = 0) {
  if (output.length >= maxMarkdownFiles) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (output.length >= maxMarkdownFiles) return;
    if (entry.isDirectory() && (skippedDirs.has(entry.name) || entry.name.startsWith('.'))) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (depth < maxDepth) walkMarkdown(full, output, maxDepth, depth + 1);
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) {
      output.push(full);
    }
  }
}

function readUtf8(file) {
  const buffer = fs.readFileSync(file);
  if (buffer.length > maxFileBytes) {
    add('warning', 'LARGE_MARKDOWN_SKIPPED', `文件超过 ${maxFileBytes} bytes，未进行内容审计`, file);
    return null;
  }
  if (buffer.includes(0)) {
    add('error', 'NUL_BYTE', 'Markdown 含 NUL 字节', file);
    return null;
  }
  if (buffer.length >= 3 && buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf) {
    add('warning', 'UTF8_BOM', 'Markdown 使用 UTF-8 BOM，跨工具时可能产生差异', file);
  }
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(buffer);
  } catch {
    add('error', 'INVALID_UTF8', 'Markdown 不是有效 UTF-8', file);
    return null;
  }
}

const requiredPaths = [
  ['00_先看这里.md', '唯一动态入口'],
  ['AGENTS.md', '稳定规则入口'],
];
for (const [relative, purpose] of requiredPaths) {
  if (!fs.existsSync(path.join(root, relative))) {
    add('warning', 'MISSING_EXPECTED_PATH', `缺少 ${relative}（${purpose}）；存量项目可先建立映射，不必立即搬目录`);
  }
}

const roleAliases = [
  { canonical: 'notes', aliases: ['codex_persistent'], purpose: '持久化笔记目录' },
  { canonical: 'results', aliases: ['analysis_results', 'output', 'outputs'], purpose: '原始结果目录' },
  { canonical: 'backups', aliases: ['backup', 'best_backups'], purpose: '基线与灾备目录' },
];
for (const role of roleAliases) {
  if (fs.existsSync(path.join(root, role.canonical))) continue;
  const present = role.aliases.filter(name => fs.existsSync(path.join(root, name)));
  if (present.length > 0) {
    add('warning', 'LEGACY_ROLE_PATH', `${role.purpose}使用旧位置: ${present.join(', ')}；先建立映射，不必立即搬目录`);
  } else {
    add('warning', 'MISSING_EXPECTED_PATH', `缺少 ${role.canonical}（${role.purpose}）`);
  }
}

const notesBase = fs.existsSync(path.join(root, 'notes')) ? 'notes'
  : fs.existsSync(path.join(root, 'codex_persistent')) ? 'codex_persistent'
    : null;
if (notesBase) {
  const indexPath = path.join(root, notesBase, 'README.md');
  if (!fs.existsSync(indexPath)) {
    add('warning', 'MISSING_EXPECTED_PATH', `缺少 ${notesBase}/README.md（历史笔记索引）`);
  }
  for (const ledger of ['_evaluations.md', '_submissions.md', '_closed_routes.md']) {
    if (!fs.existsSync(path.join(root, notesBase, ledger))) {
      add('warning', 'MISSING_LEDGER', `缺少 ${notesBase}/${ledger}；可从当前活跃记录渐进提取`);
    }
  }
}

const duplicateGroups = [
  ['output', 'outputs', 'results', 'analysis_results'],
  ['backup', 'backups', 'best_backups'],
  ['deliver', 'delivery', 'dist'],
];

for (const group of duplicateGroups) {
  const present = group.filter(name => fs.existsSync(path.join(root, name)));
  if (present.length > 1) {
    add('warning', 'POTENTIAL_DUPLICATE_DIRS', `可能承担相近职责的目录并存: ${present.join(', ')}；先检查调用者再决定规范位置`);
  }
}

const markdownFiles = [];
if (scanAll) {
  walkMarkdown(root, markdownFiles);
} else {
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) {
      markdownFiles.push(path.join(root, entry.name));
    }
  }
  for (const name of governanceDirs) {
    const dir = path.join(root, name);
    if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
      const maxDepth = ['results', 'analysis_results'].includes(name) ? 1 : Number.POSITIVE_INFINITY;
      walkMarkdown(dir, markdownFiles, maxDepth);
    }
  }
}
if (markdownFiles.length >= maxMarkdownFiles) {
  add('warning', 'MARKDOWN_SCAN_LIMIT', `Markdown 文件达到扫描上限 ${maxMarkdownFiles}`);
}

const contents = new Map();
for (const file of markdownFiles) {
  const text = readUtf8(file);
  if (text !== null) contents.set(file, text);
}

function extractMarkdownLinks(text) {
  const targets = [];
  const withoutCodeBlocks = text.replace(/~~~[\s\S]*?~~~/g, '').replace(/```[\s\S]*?```/g, '');
  const regex = /\[[^\]]*\]\(([^)]+)\)/g;
  for (const match of withoutCodeBlocks.matchAll(regex)) {
    targets.push(match[1].trim().replace(/^<|>$/g, '').split('#')[0]);
  }
  return targets;
}

const brokenLinks = [];
for (const [file, text] of contents) {
  for (const targetPath of extractMarkdownLinks(text)) {
    if (!targetPath || /^[a-z]+:/i.test(targetPath) || targetPath.startsWith('#')) continue;
    if (targetPath.startsWith('/') || /\s|['"{}=*]/.test(targetPath) || targetPath.length > 260) continue;
    if (!/[\\/.]/.test(targetPath)) continue;
    const resolved = path.resolve(path.dirname(file), targetPath);
    if (!fs.existsSync(resolved)) {
      brokenLinks.push({ file, targetPath });
    }
  }
}
for (const item of brokenLinks.slice(0, 20)) {
  add('warning', 'BROKEN_MARKDOWN_LINK', `相对链接不存在: ${item.targetPath}`, item.file);
}
if (brokenLinks.length > 20) {
  add('warning', 'BROKEN_MARKDOWN_LINK_SUMMARY', `另有 ${brokenLinks.length - 20} 个失效相对链接未逐项显示`);
}

function extractAbsolutePaths(text) {
  const values = new Set();
  const windows = /[A-Za-z]:\\(?:[^\\\r\n`"<>|?*\s]+\\)*[^\\\r\n`"<>|?*\s]+/g;
  for (const match of text.matchAll(windows)) {
    values.add(match[0].replace(/[.,;:)\]]+$/, ''));
  }
  for (const match of text.matchAll(/`((?:\/|~\/)[^`\r\n]+)`/g)) {
    values.add(match[1].trim());
  }
  return [...values];
}

const absoluteFindings = [];
for (const [file, text] of contents) {
  for (const absolute of extractAbsolutePaths(text)) {
    const expanded = absolute.startsWith('~/')
      ? path.join(process.env.HOME || process.env.USERPROFILE || '', absolute.slice(2))
      : absolute;
    const exists = fs.existsSync(expanded);
    absoluteFindings.push({ file, absolute, expanded, exists });
  }
}

function findRelocatedAlternative(absolute) {
  const withoutRoot = absolute
    .replace(/^[A-Za-z]:[\\/]/, '')
    .replace(/^[\\/]+/, '');
  const parts = withoutRoot.split(/[\\/]+/).filter(Boolean);
  for (let index = 1; index < parts.length; index += 1) {
    const candidate = path.join(root, ...parts.slice(index));
    if (fs.existsSync(candidate)) return normalizeRelative(candidate);
  }
  return null;
}

for (const item of absoluteFindings.filter(item => !item.exists).slice(0, 20)) {
  const alternative = findRelocatedAlternative(item.absolute);
  const hint = alternative ? `；可能替代: ${alternative}` : '';
  add('warning', 'STALE_ABSOLUTE_PATH', `绝对路径在当前机器不存在: ${item.absolute}${hint}`, item.file);
}
if (absoluteFindings.filter(item => !item.exists).length > 20) {
  add('warning', 'STALE_ABSOLUTE_PATH_SUMMARY', `另有 ${absoluteFindings.filter(item => !item.exists).length - 20} 个不存在的绝对路径未逐项显示`);
}

const existingExternal = absoluteFindings.filter(
  item => item.exists && !isSameOrInside(path.resolve(item.expanded), root),
);
if (existingExternal.length > 0) {
  add('warning', 'MACHINE_BOUND_PATHS', `发现 ${existingExternal.length} 个工作区外绝对路径；当前权威文档应同时提供可迁移替代路径`);
}

const agentsPath = path.join(root, 'AGENTS.md');
if (fs.existsSync(agentsPath)) {
  const stats = fs.statSync(agentsPath);
  const text = contents.get(agentsPath) || '';
  if (stats.size > 32 * 1024) {
    add('warning', 'OVERSIZED_AGENTS', `AGENTS.md 为 ${stats.size} bytes；稳定规则与动态状态可能已经混在一起`, agentsPath);
  }
  const dynamicRefs = (text.match(/(?:notes|codex_persistent)[\\/][^\s`]+\.md/gi) || []).length;
  if (dynamicRefs > 8) {
    add('warning', 'AGENTS_DYNAMIC_INDEX', `AGENTS.md 含 ${dynamicRefs} 个动态笔记引用；建议把当前权威移到 00_先看这里.md`, agentsPath);
  }
}

const noteRootCandidates = ['notes', 'codex_persistent']
  .map(name => path.join(root, name))
  .filter(candidate => fs.existsSync(candidate) && fs.statSync(candidate).isDirectory());

const noteFiles = [];
for (const noteRoot of noteRootCandidates) {
  for (const entry of fs.readdirSync(noteRoot, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.toLowerCase().endsWith('.md')) continue;
    if (entry.name === 'README.md' || entry.name.startsWith('_')) continue;
    noteFiles.push(path.join(noteRoot, entry.name));
  }
}

const notePattern = /^\d{8}_\d{2}_.+_(open|pending|closed)\.md$/;
const legacyNotes = noteFiles.filter(file => !notePattern.test(path.basename(file)));
if (legacyNotes.length > 0) {
  add('warning', 'LEGACY_NOTE_NAMES', `${legacyNotes.length} 篇笔记未使用当前日期/状态命名；无需批量改名，但应为活跃权威建立新索引，例如 ${normalizeRelative(legacyNotes[0])}`);
}

const notesWithoutFrontmatter = noteFiles.filter(file => {
  const text = contents.get(file);
  return text !== undefined && !text.replace(/^\uFEFF/, '').startsWith('---');
});
if (notesWithoutFrontmatter.length > 0) {
  add('warning', 'LEGACY_NOTE_FORMAT', `${notesWithoutFrontmatter.length} 篇笔记没有 YAML frontmatter；优先迁移活跃笔记，不必重写全部历史`);
}

const entryPath = path.join(root, '00_先看这里.md');
if (fs.existsSync(entryPath) && noteFiles.length > 0) {
  const entryMtime = fs.statSync(entryPath).mtimeMs;
  const newer = noteFiles
    .filter(file => fs.statSync(file).mtimeMs > entryMtime + 60 * 1000)
    .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
  if (newer.length > 0) {
    add('warning', 'ENTRY_OLDER_THAN_NOTES', `有 ${newer.length} 篇笔记晚于入口更新；确认入口仍指向当前权威，最新示例: ${normalizeRelative(newer[0])}`, entryPath);
  }
}

const summary = {
  workspace: root,
  scannedMarkdown: markdownFiles.length,
  errors: findings.filter(item => item.severity === 'error').length,
  warnings: findings.filter(item => item.severity === 'warning').length,
  findings,
};

if (json) {
  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
} else {
  console.log(`工作区: ${root}`);
  console.log(`扫描 Markdown: ${summary.scannedMarkdown}`);
  for (const finding of findings) {
    const location = finding.file ? ` (${finding.file})` : '';
    console.log(`[${finding.severity.toUpperCase()}] ${finding.code}${location}: ${finding.message}`);
  }
  console.log(`汇总: errors=${summary.errors}, warnings=${summary.warnings}`);
}

process.exit(summary.errors > 0 || (strict && summary.warnings > 0) ? 1 : 0);
