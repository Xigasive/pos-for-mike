import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

const saveRegex = /const handleSaveRestock = \(\) => \{[\s\S]*?setRestockPaymentMethod\('cash'\);\n    \};/s;

const newSave = `const handleSaveRestock = () => {
      const product = productCatalog.find(p => p.id === selectedProductId);
      const masterItem = inventoryItems.find(i => i.id === restockMasterItemId);
      
      if (!product || qty <= 0) return;

      if (unitCost < 0) return;
      const newTotalCost = bulkQty > 0 && bulkCost >= 0 ? bulkQty * bulkCost : qty * unitCost;

      if (editingRestockId) {
        const oldRestock = restocks.find(r => r.id === editingRestockId);
        if (oldRestock) {
          setProductCatalog(prev => prev.map(p => {
            if (p.id === oldRestock.productId && p.id === selectedProductId) {
              return { ...p, stock: p.stock - oldRestock.quantity + qty, cost: unitCost };
            }
            if (p.id === oldRestock.productId) {
              return { ...p, stock: p.stock - oldRestock.quantity };
            }
            if (p.id === selectedProductId) {
              return { ...p, stock: p.stock + qty, cost: unitCost };
            }
            return p;
          }));
          setRestocks(prev => prev.map(r => r.id === editingRestockId ? {
            ...r,
            productId: selectedProductId,
            productName: product.name,
            quantity: qty,
            unitCost: unitCost,
            totalCost: newTotalCost,
            bulkUnit,
            bulkQty,
            bulkCost: bulkCost,
            paymentMethod: restockPaymentMethod,
            masterItemId: restockMasterItemId || undefined
          } : r));
        }
        setEditingRestockId(null);
      } else {
        if (restockMasterItemId && masterItem) {
          if (masterItem.stock < bulkQty) {
            alert('จำนวนในคลังหลักไม่เพียงพอ!');
            return;
          }
          setInventoryItems(prev => prev.map(i => i.id === masterItem.id ? { ...i, stock: i.stock - bulkQty } : i));
          setInventoryTransactions(prev => [...prev, {
            id: Date.now().toString() + '-out',
            itemId: masterItem.id,
            itemName: masterItem.name,
            type: 'out',
            quantity: bulkQty,
            unitCost: 0,
            totalCost: 0,
            timestamp: new Date().toISOString(),
            note: \`แบ่งสต็อกเข้าหน้าร้าน: \${product.name}\`
          }]);
        }
        
        const newRestock: RestockRecord = {
          id: \`RST-\${Math.floor(1000 + Math.random() * 9000)}\`,
          productId: selectedProductId,
          productName: product.name,
          quantity: qty,
          unitCost: unitCost,
          totalCost: newTotalCost,
          timestamp: new Date().toISOString(),
          bulkUnit,
          bulkQty,
          bulkCost: bulkCost,
          paymentMethod: restockPaymentMethod,
          masterItemId: restockMasterItemId || undefined
        };
        setRestocks(prev => [newRestock, ...prev]);
        setProductCatalog(prev => prev.map(p => p.id === selectedProductId ? { ...p, stock: p.stock + qty, cost: unitCost } : p));
      }
      setSelectedProductId('');
      setBulkUnit('แพ็ค');
      setBulkQty(1);
      setBulkCost(0);
      setQty(0);
      setUnitCost(0);
      setRestockMasterItemId('');
      setRestockPaymentMethod('cash');
    };`;

content = content.replace(saveRegex, newSave);

fs.writeFileSync('src/App.tsx', content);
