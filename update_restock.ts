import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

const restockSourceRegex = /<h1 className="text-3xl font-bold text-slate-900 mb-8">เพิ่มสต็อกสินค้า<\/h1>\s*<div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8">\s*<h2 className="text-xl font-bold text-slate-900 mb-4">\{editingRestockId \? 'แก้ไขประวัติสต็อก' : 'นำเข้าสต็อกใหม่'\}<\/h2>[\s\S]*?(?=<\/div>\s*<div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">)/s;

const newRestockSourceUI = `<h1 className="text-3xl font-bold text-slate-900 mb-8">เพิ่มสต็อกสินค้า</h1>
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-4">{editingRestockId ? 'แก้ไขประวัติสต็อก' : 'นำเข้าสต็อกใหม่'}</h2>
          
          <div className="flex flex-col sm:flex-row gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
              <input type="radio" name="restockSource" checked={!restockMasterItemId} onChange={() => setRestockMasterItemId('')} className="accent-indigo-600" />
              ซื้อเข้ามาใหม่ (เพิ่มสต็อกหน้าร้านโดยตรง)
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
              <input type="radio" name="restockSource" checked={!!restockMasterItemId} onChange={() => {
                if (inventoryItems.length > 0) {
                  setRestockMasterItemId(inventoryItems[0].id);
                  const master = inventoryItems[0];
                  const prod = productCatalog.find(p => p.sku === master.sku || p.name === master.name);
                  if (prod) setSelectedProductId(prod.id);
                } else {
                  setRestockMasterItemId('error');
                }
              }} className="accent-indigo-600" disabled={inventoryItems.length === 0} />
              แบ่งจากคลังหลัก (Stock Inventory)
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {restockMasterItemId ? (
              <>
                <label className="flex flex-col text-sm font-semibold text-slate-500">
                  เลือกสินค้าจากคลังหลัก (ที่ต้องการหัก)
                  <select 
                    className="mt-1 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-900 bg-white"
                    value={restockMasterItemId}
                    onChange={e => {
                      setRestockMasterItemId(e.target.value);
                      const master = inventoryItems.find(i => i.id === e.target.value);
                      if (master) {
                        const prod = productCatalog.find(p => p.sku === master.sku || p.name === master.name);
                        if (prod) setSelectedProductId(prod.id);
                      }
                    }}
                  >
                    <option value="">-- เลือกคลังหลัก --</option>
                    {inventoryItems.map(i => (
                      <option key={i.id} value={i.id}>{i.name} (คงเหลือ: {i.stock} {i.unit})</option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col text-sm font-semibold text-slate-500">
                  เลือกสินค้าหน้าร้าน (ที่ต้องการเพิ่ม)
                  <select 
                    className="mt-1 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-900 bg-white" 
                    value={selectedProductId} 
                    onChange={e => handleSelectProduct(e.target.value)}
                  >
                    <option value="">-- เลือก --</option>
                    {productCatalog.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col text-sm font-semibold text-slate-500">
                  จำนวนที่หักจากคลังหลัก ({inventoryItems.find(i => i.id === restockMasterItemId)?.unit || 'หน่วย'})
                  <div className="flex mt-1 border border-slate-200 rounded-lg bg-white overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500">
                    <button type="button" onClick={() => setBulkQty(Math.max(1, (bulkQty || 0) - 1))} className="px-4 bg-slate-50 border-r border-slate-200 hover:bg-slate-100 text-slate-600 flex items-center justify-center"><Minus size={16} /></button>
                    <input type="number" min="1" className="w-full p-2.5 text-sm text-slate-900 text-center outline-none" value={bulkQty || ''} onChange={e => setBulkQty(parseFloat(e.target.value) || 0)} />
                    <button type="button" onClick={() => setBulkQty((bulkQty || 0) + 1)} className="px-4 bg-slate-50 border-l border-slate-200 hover:bg-slate-100 text-slate-600 flex items-center justify-center"><Plus size={16} /></button>
                  </div>
                </label>
                
                <label className="flex flex-col text-sm font-semibold text-slate-500 md:col-start-2">
                  แปลงเข้าสต็อกหน้าร้าน (ชิ้น)
                  <div className="flex mt-1 border border-slate-200 rounded-lg bg-white overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500">
                    <button type="button" onClick={() => setQty(Math.max(1, (qty || 0) - 1))} className="px-4 bg-slate-50 border-r border-slate-200 hover:bg-slate-100 text-slate-600 flex items-center justify-center"><Minus size={16} /></button>
                    <input type="number" min="1" className="w-full p-2.5 text-sm text-slate-900 text-center outline-none" value={qty || ''} onChange={e => setQty(parseInt(e.target.value) || 0)} />
                    <button type="button" onClick={() => setQty((qty || 0) + 1)} className="px-4 bg-slate-50 border-l border-slate-200 hover:bg-slate-100 text-slate-600 flex items-center justify-center"><Plus size={16} /></button>
                  </div>
                </label>
                
                <label className="flex flex-col text-sm font-semibold text-slate-500">
                  ต้นทุนต่อชิ้น (฿) - คำนวณอัตโนมัติ
                  <div className="flex mt-1 border border-slate-200 rounded-lg bg-slate-100 overflow-hidden">
                    <input type="number" disabled className="w-full p-2.5 text-sm text-slate-500 bg-slate-100 text-center outline-none" value={qty > 0 ? ((inventoryItems.find(i => i.id === restockMasterItemId)?.unitCost || 0) * bulkQty / qty).toFixed(2) : '0'} />
                  </div>
                </label>
              </>
            ) : (
              <>
                <label className="flex flex-col text-sm font-semibold text-slate-500 md:col-span-2 lg:col-span-3">
                  เลือกสินค้าเข้าร้าน
                  <select 
                    className="mt-1 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-900 bg-white" 
                    value={selectedProductId} 
                    onChange={e => handleSelectProduct(e.target.value)}
                  >
                    <option value="">-- เลือก --</option>
                    {productCatalog.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col text-sm font-semibold text-slate-500">
                  หน่วยนำเข้า
                  <select 
                    className="mt-1 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-900 bg-white" 
                    value={bulkUnit} 
                    onChange={e => setBulkUnit(e.target.value)}
                  >
                    <option value="แพ็ค">แพ็ค</option>
                    <option value="กิโลกรัม">กิโลกรัม</option>
                    <option value="ลัง">ลัง</option>
                    <option value="อื่นๆ">อื่นๆ</option>
                  </select>
                </label>
                <label className="flex flex-col text-sm font-semibold text-slate-500">
                  จำนวนนำเข้า ({bulkUnit})
                  <div className="flex mt-1 border border-slate-200 rounded-lg bg-white overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500">
                    <button type="button" onClick={() => setBulkQty(Math.max(1, (bulkQty || 0) - 1))} className="px-4 bg-slate-50 border-r border-slate-200 hover:bg-slate-100 text-slate-600 flex items-center justify-center"><Minus size={16} /></button>
                    <input type="number" min="1" className="w-full p-2.5 text-sm text-slate-900 text-center outline-none" value={bulkQty || ''} onChange={e => setBulkQty(parseFloat(e.target.value) || 0)} />
                    <button type="button" onClick={() => setBulkQty((bulkQty || 0) + 1)} className="px-4 bg-slate-50 border-l border-slate-200 hover:bg-slate-100 text-slate-600 flex items-center justify-center"><Plus size={16} /></button>
                  </div>
                </label>
                <label className="flex flex-col text-sm font-semibold text-slate-500">
                  ต้นทุนต่อ 1 {bulkUnit} (฿)
                  <div className="flex mt-1 border border-slate-200 rounded-lg bg-white overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500">
                    <button type="button" onClick={() => setBulkCost(Math.max(0, (bulkCost || 0) - 10))} className="px-4 bg-slate-50 border-r border-slate-200 hover:bg-slate-100 text-slate-600 flex items-center justify-center"><Minus size={16} /></button>
                    <input type="number" step="0.01" min="0" className="w-full p-2.5 text-sm text-slate-900 text-center outline-none" value={bulkCost || ''} onChange={e => setBulkCost(parseFloat(e.target.value) || 0)} />
                    <button type="button" onClick={() => setBulkCost((bulkCost || 0) + 10)} className="px-4 bg-slate-50 border-l border-slate-200 hover:bg-slate-100 text-slate-600 flex items-center justify-center"><Plus size={16} /></button>
                  </div>
                </label>
                <label className="flex flex-col text-sm font-semibold text-slate-500">
                  แปลงเข้าสต็อก (ชิ้น)
                  <div className="flex mt-1 border border-slate-200 rounded-lg bg-white overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500">
                    <button type="button" onClick={() => setQty(Math.max(1, (qty || 0) - 1))} className="px-4 bg-slate-50 border-r border-slate-200 hover:bg-slate-100 text-slate-600 flex items-center justify-center"><Minus size={16} /></button>
                    <input type="number" min="1" className="w-full p-2.5 text-sm text-slate-900 text-center outline-none" value={qty || ''} onChange={e => setQty(parseInt(e.target.value) || 0)} />
                    <button type="button" onClick={() => setQty((qty || 0) + 1)} className="px-4 bg-slate-50 border-l border-slate-200 hover:bg-slate-100 text-slate-600 flex items-center justify-center"><Plus size={16} /></button>
                  </div>
                </label>
                <label className="flex flex-col text-sm font-semibold text-slate-500">
                  ต้นทุนต่อชิ้น (฿)
                  <div className="flex mt-1 border border-slate-200 rounded-lg bg-slate-50 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500">
                    <button type="button" onClick={() => setUnitCost(Math.max(0, (unitCost || 0) - 1))} className="px-4 bg-white border-r border-slate-200 hover:bg-slate-100 text-slate-600 flex items-center justify-center"><Minus size={16} /></button>
                    <input type="number" step="0.01" min="0" className="w-full p-2.5 text-sm text-slate-900 text-center outline-none bg-transparent" value={unitCost || ''} onChange={e => setUnitCost(parseFloat(e.target.value) || 0)} />
                    <button type="button" onClick={() => setUnitCost((unitCost || 0) + 1)} className="px-4 bg-white border-l border-slate-200 hover:bg-slate-100 text-slate-600 flex items-center justify-center"><Plus size={16} /></button>
                  </div>
                  <span className="text-xs text-slate-400 mt-1">* หากใส่จำนวน/ต้นทุนนำเข้า ระบบจะคำนวณให้อัตโนมัติ</span>
                </label>
                <label className="flex flex-col text-sm font-semibold text-slate-500">
                  ชำระด้วย
                  <select 
                    className="mt-1 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-900 bg-white"
                    value={restockPaymentMethod}
                    onChange={(e) => setRestockPaymentMethod(e.target.value as 'cash' | 'transfer')}
                  >
                    <option value="cash">เงินสด</option>
                    <option value="transfer">เงินโอน</option>
                  </select>
                </label>
              </>
            )}

            <div className="md:col-span-2 lg:col-span-3 flex justify-end gap-3 mt-4">
              {editingRestockId && (
                <button onClick={() => { setEditingRestockId(null); setSelectedProductId(''); setBulkUnit('แพ็ค'); setBulkQty(1); setBulkCost(0); setQty(0); setUnitCost(0); setRestockPaymentMethod('cash'); setRestockMasterItemId(''); }} className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">ยกเลิก</button>
              )}
              <button 
                onClick={handleSaveRestock} 
                disabled={!selectedProductId || qty <= 0 || (restockMasterItemId ? !inventoryItems.find(i=>i.id===restockMasterItemId) : unitCost < 0)}
                className="px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-xl transition-colors shadow-sm"
              >
                บันทึก
              </button>
            </div>
          </div>
`;

content = content.replace(restockSourceRegex, newRestockSourceUI);
fs.writeFileSync('src/App.tsx', content);

