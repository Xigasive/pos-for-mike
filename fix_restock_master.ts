import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace(/if \(prod\) setSelectedProductId\(prod.id\);/g, 'if (prod) { setSelectedProductId(prod.id); } else { setSelectedProductId(""); }');

fs.writeFileSync('src/App.tsx', content);

