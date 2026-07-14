import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace(
  /const refundQty = orderToDelete\.items\.find\(i => i\.id === p\.id\)\?\.quantity \|\| 0;/,
  `const deletedItem = orderToDelete.items.find(i => i.id === p.id);
        const refundQty = deletedItem ? deletedItem.quantity + (deletedItem.freeQuantity || 0) : 0;`
);

fs.writeFileSync('src/App.tsx', content);
