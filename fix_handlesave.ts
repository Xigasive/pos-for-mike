import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

const regex = /const handleSaveRestock = \(\) => \{[\s\S]*?setRestockMasterItemId\(''\);\s*setRestockPaymentMethod\('cash'\);\s*\};/s;

const newHandleSave = `const handleSaveRestock = () => {
      const product = productCatalog.find(p => p.id === selectedProductId);
      const masterItem = inventoryItems.find(i => i.id === restockMasterItemId);
      
      if (!product || qty <= 0) return;

      let actualBulkCost = bulkCost;
      let actualUnitCost = unitCost;
      let newTotalCost = 0;

      if (restockMasterItemId && masterItem) {
        actualBulkCost = masterItem.unitCost * bulkQty;
        actualUnitCost = qty > 0 ? actualBulkCost / qty : 0;
        newTotalCost = actualBulkCost;
      } else {
        if (unitCost < 0) return;
        newTotalCost = bulkQty > 0 && bulkCost >= 0 ? bulkQty * bulkCost : qty * unitCost;
      }

      if (editingRestockId) {
        const oldRestock = restocks.find(r => r.id === editingRestockId);
        if (oldRestock) {
          setProductCatalog(prev => prev.map(p => {
            if (p.id === oldRestock.productId && p.id === selectedProductId) {
              return { ...p, stock: p.stock - oldRestock.quantity + qty, cost: actualUnitCost };
            }
            if (p.id === oldRestock.productId) {
              return { ...p, stock: p.stock - oldRestock.quantity };
            }
            if (p.id === selectedProductId) {
              return { ...p, stock: p.stock + qty, cost: actualUnitCost };
            }
            return p;
          }));
          setRestocks(prev => prev.map(r => r.id === editingRestockId ? {
            ...r,
            productId: selectedProductId,
            productName: product.name,
            quantity: qty,
            unitCost: actualUnitCost,
            totalCost: newTotalCost,
            bulkUnit,
            bulkQty,
            bulkCost: actualBulkCost,
            paymentMethod: restockMasterItemId ? undefined : restockPaymentMethod,
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
            unitCost: masterItem.unitCost,
            totalCost: actualBulkCost,
            timestamp: new Date().toISOString(),
            note: \`แบ่งสต็อกเข้าหน้าร้าน: \${product.name}\`
          }]);
        }
        
        const newRestock: RestockRecord = {
          id: \`RST-\${Math.floor(1000 + Math.random() * 9000)}\`,
          productId: selectedProductId,
          productName: product.name,
          quantity: qty,
          unitCost: actualUnitCost,
          totalCost: newTotalCost,
          timestamp: new Date().toISOString(),
          bulkUnit,
          bulkQty,
          bulkCost: actualBulkCost,
          paymentMethod: restockMasterItemId ? undefined : restockPaymentMethod,
          masterItemId: restockMasterItemId || undefined
        };
        setRestocks(prev => [newRestock, ...prev]);
        setProductCatalog(prev => prev.map(p => p.id === selectedProductId ? { ...p, stock: p.stock + qty, cost: actualUnitCost } : p));
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

content = content.replace(regex, newHandleSave);
fs.writeFileSync('src/App.tsx', content);

