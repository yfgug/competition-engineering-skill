#!/usr/bin/env node
/** Validate the repository without third-party dependencies. */
const fs = require('fs');
const path = require('path');
const { TextDecoder } = require('util');

const root = path.resolve(__dirname, '..');
const errors = [];

function relative(file) {
  return path.relative(root, file).split(path.sep).join('/');
}

function error(message, file) {
  errors.push(file ? relative(file) + ': ' + message : message);
}

function readUtf8(file) {
  if (!fs.existsSync(file)) {
    error('missing required file', file);
    return '';
  }
  const buffer = fs.readFileSync(file);
  if (buffer.includes(0)) error('contains NUL byte', file);
  if (buffer.length >= 3 && buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf) {
    error('contains UTF-8 BOM', file);
  }
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(buffer);
  } catch {
    error('is not valid UTF-8', file);
    return '';
  }
}

const required = [
  'README.md',
  'README.zh-CN.md',
  'SKILL.md',
  '.github/workflows/validate.yml',
  'agents/openai.yaml',
  'references/methodology.md',
  'references/evaluation.md',
  'references/research.md',
  'references/adoption.md',
  'references/templates.md',
  'references/adaptations.md',
  'scripts/scaffold.cjs',
  'scripts/audit_workspace.cjs',
  'assets/scaffold/00_先看这里.md',
  'assets/scaffold/notes/_TEMPLATE.md',
  'assets/research/paper/README.md',
  'assets/research/paper/CLAIMS.md',
  'assets/research/paper/ARTIFACTS.md',
  'assets/research/data/README.md',
];

for (const item of required) readUtf8(path.join(root, item));

const skillPath = path.join(root, 'SKILL.md');
const skill = readUtf8(skillPath).replace(/\r\n/g, '\n');
const frontmatter = skill.match(/^---\n([\s\S]*?)\n---\n/);
if (!frontmatter) {
  error('missing YAML frontmatter', skillPath);
} else {
  if (!/^name:\s*competition-engineering\s*$/m.test(frontmatter[1])) {
    error('frontmatter name must be competition-engineering', skillPath);
  }
  const description = frontmatter[1].match(/^description:\s*(.+)$/m);
  if (!description || description[1].trim().length < 20) {
    error('frontmatter description is missing or too short', skillPath);
  }
}

const openaiPath = path.join(root, 'agents', 'openai.yaml');
const openai = readUtf8(openaiPath);
for (const field of ['display_name:', 'short_description:', 'default_prompt:', 'allow_implicit_invocation:']) {
  if (!openai.includes(field)) error('missing ' + field, openaiPath);
}
if (!openai.includes('$competition-engineering')) {
  error('default_prompt must mention $competition-engineering', openaiPath);
}

const markdownFiles = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'dist') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) markdownFiles.push(full);
  }
}
walk(root);

const linkPattern = /\[[^\]]*\]\(([^)]+)\)/g;
for (const file of markdownFiles) {
  const text = readUtf8(file);
  for (const match of text.matchAll(linkPattern)) {
    const target = match[1].trim().replace(/^<|>$/g, '').split('#')[0];
    if (!target || /^[a-z]+:/i.test(target) || target.startsWith('#')) continue;
    const resolved = path.resolve(path.dirname(file), target);
    if (!fs.existsSync(resolved)) error('broken relative link: ' + target, file);
  }
}

if (errors.length > 0) {
  for (const message of errors) console.error('ERROR ' + message);
  console.error('Validation failed with ' + errors.length + ' error(s).');
  process.exit(1);
}

console.log('Repository validation passed (' + markdownFiles.length + ' Markdown files checked).');
