import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

const regex = /const handleDelete = \(r: RestockRecord\) => \{[\s\S]*?setProductCatalog\(prev => prev\.map\(p => p\.id === r\.productId \? \{ \.\.\.p, stock: p\.stock - r\.quantity \} : p\)\);/s;

const replacement = `const handleDelete = (r: RestockRecord) => {
      if (!confirm('ยืนยันการลบรายการนำเข้านี้?')) return;
      setRestocks(prev => prev.filter(item => item.id !== r.id));
      setProductCatalog(prev => prev.map(p => p.id === r.productId ? { ...p, stock: p.stock - r.quantity } : p));
      
      if (r.masterItemId && r.bulkQty) {
        setInventoryItems(prev => prev.map(i => i.id === r.masterItemId ? { ...i, stock: i.stock + r.bulkQty! } : i));
        setInventoryTransactions(prev => [...prev, {
            id: Date.now().toString() + '-in-refund',
            itemId: r.masterItemId!,
            itemName: r.productName,
            type: 'in',
            quantity: r.bulkQty!,
            unitCost: r.bulkCost || 0,
            totalCost: (r.bulkCost || 0) * r.bulkQty!,
            timestamp: new Date().toISOString(),
            note: \`คืนสต็อกจากการลบรายการนำเข้าหน้าร้าน: \${r.productName}\`
        }]);
      }`;

content = content.replace(regex, replacement);

fs.writeFileSync('src/App.tsx', content);
