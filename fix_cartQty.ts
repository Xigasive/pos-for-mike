import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

const regex = /const cartQty = cart\.find\(i => i\.id === product\.id\)\?\.quantity \|\| 0;/;
const replacement = `const cartItem = cart.find(i => i.id === product.id);\n                const cartQty = cartItem ? cartItem.quantity + (cartItem.freeQuantity || 0) : 0;`;

content = content.replace(regex, replacement);
fs.writeFileSync('src/App.tsx', content);
