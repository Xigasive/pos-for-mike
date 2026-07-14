import fs from 'fs';
let content = fs.readFileSync('src/types.ts', 'utf-8');
content = content.replace(
  /export interface CartItem extends Product \{\n  quantity: number;\n\}/,
  `export interface CartItem extends Product {\n  cartItemId?: string;\n  quantity: number;\n  isFree?: boolean;\n}`
);
fs.writeFileSync('src/types.ts', content);
