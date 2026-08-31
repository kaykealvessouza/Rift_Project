import fs from 'fs';

const buf = fs.readFileSync('backend/catalog.ts');
console.log('File byte length:', buf.length);

let nullIndices = [];
for (let i = 0; i < buf.length; i++) {
  if (buf[i] === 0) nullIndices.push(i);
}
console.log('Null bytes found:', nullIndices.length);
if (nullIndices.length > 0) {
  console.log('First 5 null indices:', nullIndices.slice(0, 5));
}

const text = buf.toString('utf-8');
const lines = text.split('\n');
console.log('Total lines:', lines.length);

for (let i = Math.max(0, 6345); i < Math.min(lines.length, 6355); i++) {
  console.log('Line ' + (i + 1) + ' (len ' + lines[i].length + '): ' + lines[i].slice(0, 80));
}
