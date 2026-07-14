import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Import
if (!content.includes('import { sounds } from')) {
  content = content.replace(
    /import \{[^\}]+\} from 'lucide-react';/,
    match => match + "\nimport { sounds } from './utils/audio';"
  );
}

// addToCart
content = content.replace(
  /const addToCart = \(product: Product\) => \{/,
  "const addToCart = (product: Product) => {\n    sounds.add();"
);

// updateQuantity
content = content.replace(
  /const updateQuantity = \(productId: string, delta: number\) => \{/,
  "const updateQuantity = (productId: string, delta: number) => {\n    if (delta > 0) sounds.add(); else sounds.remove();"
);

// clearCart
content = content.replace(
  /const clearCart = \(\) => \{(\s*)if \(confirm\('ยืนยันการล้างตะกร้า\?'\)\) \{/,
  "const clearCart = () => {$1if (confirm('ยืนยันการล้างตะกร้า?')) {$1  sounds.error();"
);

// handleCheckout
content = content.replace(
  /const handleCheckout = async \(\) => \{/,
  "const handleCheckout = async () => {\n    sounds.cash();"
);

// handleSaveRestock
content = content.replace(
  /const handleSaveRestock = \(\) => \{/,
  "const handleSaveRestock = () => {\n      sounds.success();"
);

// handleDelete (Restock)
content = content.replace(
  /const handleDelete = \(r: RestockRecord\) => \{\s*if \(\!confirm\('ยืนยันการลบรายการนำเข้านี้\?'\)\) return;/,
  "const handleDelete = (r: RestockRecord) => {\n      if (!confirm('ยืนยันการลบรายการนำเข้านี้?')) return;\n      sounds.error();"
);

// handleSaveExpense
content = content.replace(
  /const handleSaveExpense = \(\) => \{\s*if \(amount <= 0 \|\| \!note\.trim\(\)\) return;/,
  "const handleSaveExpense = () => {\n      if (amount <= 0 || !note.trim()) return;\n      sounds.success();"
);

// handleDelete (Expense)
content = content.replace(
  /const handleDelete = \(id: string\) => \{\s*if \(confirm\('แน่ใจหรือไม่ว่าต้องการลบรายการนี้\?'\)\) \{/,
  "const handleDelete = (id: string) => {\n      if (confirm('แน่ใจหรือไม่ว่าต้องการลบรายการนี้?')) {\n        sounds.error();"
);

// handleSaveInv
content = content.replace(
  /const handleSaveInv = \(\) => \{\s*if \(invForm\) \{/,
  "const handleSaveInv = () => {\n      sounds.success();\n      if (invForm) {"
);

// handleDeleteInv
content = content.replace(
  /const handleDeleteInv = \(id: string\) => \{\s*if \(confirm\('ยืนยันการลบสินค้าในคลังหลัก\?'\)\) \{/,
  "const handleDeleteInv = (id: string) => {\n      if (confirm('ยืนยันการลบสินค้าในคลังหลัก?')) {\n        sounds.error();"
);

// handleSave (Product)
content = content.replace(
  /const handleSave = \(\) => \{\s*if \(form\) \{/,
  "const handleSave = () => {\n      sounds.success();\n      if (form) {"
);

// handleDelete (Product)
content = content.replace(
  /const handleDelete = \(id: string\) => \{\s*if \(confirm\('แน่ใจหรือไม่ว่าต้องการลบสินค้านี้\?'\)\) \{/,
  "const handleDelete = (id: string) => {\n      if (confirm('แน่ใจหรือไม่ว่าต้องการลบสินค้านี้?')) {\n        sounds.error();"
);

// handleEditOrder
content = content.replace(
  /const handleEditOrder = \(order: Order\) => \{/,
  "const handleEditOrder = (order: Order) => {\n    sounds.click();"
);

// setActiveView with click sound
content = content.replace(
  /setActiveView\(([^)]+)\)/g,
  (match, p1) => {
    // If it's already inside sounds.click() don't wrap, but let's just make a global replace in button onClick
    return match; // Actually it's safer to just replace onClick
  }
);

content = content.replace(
  /onClick=\{\(\) => setActiveView\(/g,
  "onClick={() => { sounds.click(); setActiveView("
);
content = content.replace(
  /onClick=\{[^\}]*setActiveView[^>]*>/g,
  match => {
    if (match.includes('{() => setActiveView')) return match; // already handled
    // let's just use the simpler replace
    return match;
  }
);

// fix any syntax
content = content.replace(/setActiveView\(([^)]+)\)\}/g, "setActiveView($1); }}");

fs.writeFileSync('src/App.tsx', content);
