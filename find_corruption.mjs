import fs from 'fs';

const raw = fs.readFileSync('backend/catalog.ts', 'utf-8');

// Let's find all `{ "id": "..." ... }` cards that are valid JSON objects!
// Each card starts with `  {` or `{\n    "id":`
console.log('Total length of raw:', raw.length);

// Let's test parsing card items
let cleanCards = [];
let regex = /\{\s*"id":\s*"([^"]+)"[\s\S]*?\n  \}/g;
let match;
let count = 0;

// Or let's see where the corruption started
const lines = raw.split('\n');
console.log('Lines count:', lines.length);

let validLines = [];
let corruptedLineIndex = -1;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  // Check if line contains non-printable or null characters
  if (/[\x00-\x08\x0E-\x1F]/.test(line)) {
    if (corruptedLineIndex === -1) {
      corruptedLineIndex = i;
      console.log('First corrupted line:', i + 1, line.slice(0, 50));
    }
  }
}

console.log('Corrupted line index:', corruptedLineIndex);
// Let's see what is before the corrupted line
for (let i = Math.max(0, corruptedLineIndex - 10); i < corruptedLineIndex; i++) {
  console.log(`Line ${i+1}:`, lines[i]);
}
