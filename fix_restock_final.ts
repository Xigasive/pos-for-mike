import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

const uiRegex = /\{restockMasterItemId \? \([\s\S]*?\{\!restockMasterItemId && \(\s*<label className="flex flex-col text-sm font-semibold text-slate-500">\s*วิธีการชำระเงิน[\s\S]*?<\/label>\s*\)\}/s;

const newUI = `<label className="flex flex-col text-sm font-semibold text-slate-500">
                ต้นทุนต่อชิ้น (฿)
                <div className="flex mt-1 border border-slate-200 rounded-lg bg-slate-50 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500">
                  <button type="button" onClick={() => setUnitCost(Math.max(0, (unitCost || 0) - 1))} className="px-4 bg-slate-100 border-r border-slate-200 hover:bg-slate-200 text-slate-600 flex items-center justify-center"><Minus size={16} /></button>
                  <input type="number" step="0.01" min="0" className="w-full p-2.5 text-sm text-slate-900 text-center outline-none bg-transparent" value={(!restockMasterItemId && qty > 0 && bulkCost > 0) ? (bulkCost * bulkQty / qty).toFixed(2) : (unitCost || '')} onChange={e => setUnitCost(parseFloat(e.target.value) || 0)} />
                  <button type="button" onClick={() => setUnitCost((unitCost || 0) + 1)} className="px-4 bg-slate-100 border-l border-slate-200 hover:bg-slate-200 text-slate-600 flex items-center justify-center"><Plus size={16} /></button>
                </div>
                {!restockMasterItemId && qty > 0 && bulkCost > 0 && <span className="text-xs text-indigo-500 mt-1">* คำนวณอัตโนมัติจากจำนวนนำเข้า</span>}
              </label>

              <label className="flex flex-col text-sm font-semibold text-slate-500">
                วิธีการชำระเงิน
                <div className="flex mt-1 bg-slate-100 p-1 rounded-lg">
                  <button onClick={() => setRestockPaymentMethod('cash')} className={\`flex-1 text-xs font-bold py-2 rounded-md transition-all \${restockPaymentMethod === 'cash' ? 'bg-white text-green-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}\`}>เงินสด</button>
                  <button onClick={() => setRestockPaymentMethod('transfer')} className={\`flex-1 text-xs font-bold py-2 rounded-md transition-all \${restockPaymentMethod === 'transfer' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}\`}>โอนเงิน</button>
                </div>
              </label>`;

content = content.replace(uiRegex, newUI);

const saveRegex = /const handleSaveRestock = \(\) => \{[\s\S]*?setRestockPaymentMethod\('cash'\);\n    \};/s;

const newSave = `const handleSaveRestock = () => {
      const product = productCatalog.find(p => p.id === selectedProductId);
      const masterItem = inventoryItems.find(i => i.id === restockMasterItemId);
      
      if (!product || qty <= 0) return;

      if (unitCost < 0) return;
      const newTotalCost = (!restockMasterItemId && bulkQty > 0 && bulkCost >= 0) ? bulkQty * bulkCost : qty * unitCost;

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
            bulkCost: restockMasterItemId ? 0 : bulkCost,
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
            note: \`แปลงสต็อกเข้าหน้าร้าน: \${product.name}\`
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
          bulkUnit: restockMasterItemId ? (masterItem?.unit || 'หน่วย') : bulkUnit,
          bulkQty,
          bulkCost: restockMasterItemId ? 0 : bulkCost,
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
