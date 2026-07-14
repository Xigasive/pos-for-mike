import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// clearCart
content = content.replace(
  /const clearCart = \(\) => setCart\(\[\]\);/,
  "const clearCart = () => {\n    sounds.error();\n    setCart([]);\n  };"
);

// handleDeleteOrder
content = content.replace(
  /if \(\!confirm\('ยืนยันการยกเลิกรายการนี้และคืนสต็อกสินค้า\?'\)\) return;/,
  "if (!confirm('ยืนยันการยกเลิกรายการนี้และคืนสต็อกสินค้า?')) return;\n    sounds.error();"
);

fs.writeFileSync('src/App.tsx', content);
