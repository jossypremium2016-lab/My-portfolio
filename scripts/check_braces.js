const fs = require('fs');
const paths = ['os.js', 'public/os.js'];

paths.forEach(p => {
  try {
    const s = fs.readFileSync(p, 'utf8');
    let stack = 0;
    let line = 1;
    let firstNeg = -1;
    let firstNegLine = -1;
    for (let i = 0; i < s.length; i++) {
      const ch = s[i];
      if (ch === '\n') line++;
      if (ch === '{') stack++;
      if (ch === '}') {
        stack--;
        if (stack < 0 && firstNeg === -1) {
          firstNeg = i;
          firstNegLine = line;
        }
      }
    }
    console.log(`File: ${p}`);
    if (firstNeg !== -1) {
      console.log(`  Unmatched closing brace at or before line ${firstNegLine}`);
    }
    console.log(`  Final balance: ${stack}`);
  } catch (e) {
    console.error(`Error reading ${p}:`, e.message);
  }
});
