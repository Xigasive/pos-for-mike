import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

const saveRegex = /const handleSaveRestock = \(\) => \{[\s\S]*?setRestockPaymentMethod\('cash'\);\n    \};/s;

const newSave = `const handleSaveRestock = () => {
      const product = productCatalog.find(p => p.id === selectedProductId);
      const masterItem = inventoryItems.find(i => i.id === restockMasterItemId);
      
      if (!product || qty <= 0) return;

      let finalTotalCost = 0;
      let finalUnitCost = unitCost;

      if (restockMasterItemId && masterItem) {
        finalTotalCost = masterItem.unitCost * bulkQty;
        finalUnitCost = qty > 0 ? Number((finalTotalCost / qty).toFixed(2)) : 0;
      } else {
        if (unitCost < 0) return;
        finalTotalCost = bulkQty > 0 && bulkCost >= 0 ? bulkQty * bulkCost : qty * unitCost;
        finalUnitCost = qty > 0 ? Number((finalTotalCost / qty).toFixed(2)) : unitCost;
      }

      if (editingRestockId) {
        const oldRestock = restocks.find(r => r.id === editingRestockId);
        if (oldRestock) {
          setProductCatalog(prev => prev.map(p => {
            if (p.id === oldRestock.productId && p.id === selectedProductId) {
              return { ...p, stock: p.stock - oldRestock.quantity + qty, cost: finalUnitCost };
            }
            if (p.id === oldRestock.productId) {
              return { ...p, stock: p.stock - oldRestock.quantity };
            }
            if (p.id === selectedProductId) {
              return { ...p, stock: p.stock + qty, cost: finalUnitCost };
            }
            return p;
          }));
          setRestocks(prev => prev.map(r => r.id === editingRestockId ? {
            ...r,
            productId: selectedProductId,
            productName: product.name,
            quantity: qty,
            unitCost: finalUnitCost,
            totalCost: finalTotalCost,
            bulkUnit,
            bulkQty,
            bulkCost: restockMasterItemId ? 0 : bulkCost,
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
            totalCost: finalTotalCost,
            timestamp: new Date().toISOString(),
            note: \`แปลงสต็อกเข้าหน้าร้าน: \${product.name}\`
          }]);
        }
        
        const newRestock: RestockRecord = {
          id: \`RST-\${Math.floor(1000 + Math.random() * 9000)}\`,
          productId: selectedProductId,
          productName: product.name,
          quantity: qty,
          unitCost: finalUnitCost,
          totalCost: finalTotalCost,
          timestamp: new Date().toISOString(),
          bulkUnit: restockMasterItemId ? (masterItem?.unit || 'หน่วย') : bulkUnit,
          bulkQty,
          bulkCost: restockMasterItemId ? (masterItem?.unitCost || 0) : bulkCost,
          paymentMethod: restockMasterItemId ? undefined : restockPaymentMethod,
          masterItemId: restockMasterItemId || undefined
        };
        setRestocks(prev => [newRestock, ...prev]);
        setProductCatalog(prev => prev.map(p => p.id === selectedProductId ? { ...p, stock: p.stock + qty, cost: finalUnitCost } : p));
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
