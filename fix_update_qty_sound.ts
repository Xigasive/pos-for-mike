import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace(
  /const updateQuantity = \(id: string, delta: number, isFree: boolean = false\) => \{/,
  "const updateQuantity = (id: string, delta: number, isFree: boolean = false) => {\n    if (delta > 0) sounds.add(); else if (delta < 0) sounds.remove();"
);

fs.writeFileSync('src/App.tsx', content);
