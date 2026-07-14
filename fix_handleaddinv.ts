import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

const regex = /const handleSaveInv = \(\) => \{\s*if \(!invForm \|\| !invForm.name\) return;\s*if \(isInvAdding\) \{\s*setInventoryItems\(prev => \[\.\.\.prev, invForm\]\);\s*\} else if \(editingInventoryItem\) \{\s*setInventoryItems\(prev => prev.map\(i => i.id === editingInventoryItem.id \? invForm : i\)\);\s*\}\s*setIsInvAdding\(false\);\s*setEditingInventoryItem\(null\);\s*setInvForm\(null\);\s*\};/s;

const newHandleSaveInv = `const handleSaveInv = () => {
      if (!invForm || !invForm.name) return;
      if (isInvAdding) {
        setInventoryItems(prev => [...prev, invForm]);
        if (invForm.stock > 0) {
          setInventoryTransactions(prev => [...prev, {
            id: Date.now().toString() + '-in',
            itemId: invForm.id,
            itemName: invForm.name,
            type: 'in',
            quantity: invForm.stock,
            unitCost: invForm.unitCost,
            totalCost: invForm.stock * invForm.unitCost,
            timestamp: new Date().toISOString(),
            note: 'เพิ่มสินค้าในคลังหลัก'
          }]);
        }
      } else if (editingInventoryItem) {
        const diff = invForm.stock - editingInventoryItem.stock;
        setInventoryItems(prev => prev.map(i => i.id === editingInventoryItem.id ? invForm : i));
        
        if (diff !== 0) {
          setInventoryTransactions(prev => [...prev, {
            id: Date.now().toString() + (diff > 0 ? '-in' : '-out'),
            itemId: invForm.id,
            itemName: invForm.name,
            type: diff > 0 ? 'in' : 'out',
            quantity: Math.abs(diff),
            unitCost: invForm.unitCost,
            totalCost: Math.abs(diff) * invForm.unitCost,
            timestamp: new Date().toISOString(),
            note: 'แก้ไข/ปรับปรุงจำนวนในคลัง'
          }]);
        }
      }
      setIsInvAdding(false);
      setEditingInventoryItem(null);
      setInvForm(null);
    };`;

content = content.replace(regex, newHandleSaveInv);
fs.writeFileSync('src/App.tsx', content);

