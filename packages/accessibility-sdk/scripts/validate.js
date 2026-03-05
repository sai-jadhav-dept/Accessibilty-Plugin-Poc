const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

const requiredFiles = [
  'src/index.js',
  'src/AccessibilityContext.js',
  'src/AccessibilityUtils.js',
  'README.md',
  'package.json'
];

const missing = requiredFiles.filter((rel) => !fs.existsSync(path.join(root, rel)));

if (missing.length > 0) {
  console.error('SDK validation failed. Missing files:');
  missing.forEach((file) => console.error(`- ${file}`));
  process.exit(1);
}

console.log('SDK validation passed.');
