import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

const regex = /<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">[\s\S]*?(?=<div className="space-y-4">)/s;

const newUI = `<div className="flex flex-col sm:flex-row gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
              <input type="radio" name="restockSource" checked={!restockMasterItemId} onChange={() => setRestockMasterItemId('')} className="accent-indigo-600" />
              ซื้อเข้ามาใหม่ (เพิ่มสต็อกหน้าร้าน)
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
              <input type="radio" name="restockSource" checked={!!restockMasterItemId} onChange={() => {
                if (inventoryItems.length > 0) {
                  setRestockMasterItemId(inventoryItems[0].id);
                  const master = inventoryItems[0];
                  const prod = productCatalog.find(p => p.sku === master.sku || p.name === master.name);
                  if (prod) setSelectedProductId(prod.id);
                }
              }} className="accent-indigo-600" disabled={inventoryItems.length === 0} />
              แบ่งจากคลังหลัก (แปลงเข้าหน้าร้าน)
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {!restockMasterItemId ? (
              <>
                <label className="flex flex-col text-sm font-semibold text-slate-500 md:col-span-2 lg:col-span-3">
                  เลือกสินค้าที่ต้องการเพิ่มสต็อก
                  <select 
                    className="mt-1 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-900 bg-white" 
                    value={selectedProductId} 
                    onChange={e => handleSelectProduct(e.target.value)}
                  >
                    <option value="">-- เลือกสินค้าหน้าร้าน --</option>
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
              </>
            ) : (
              <>
                <label className="flex flex-col text-sm font-semibold text-slate-500 md:col-span-2">
                  หักจากคลังหลัก
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
                  จำนวนที่แบ่ง ({inventoryItems.find(i => i.id === restockMasterItemId)?.unit || 'หน่วย'})
                  <div className="flex mt-1 border border-slate-200 rounded-lg bg-white overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500">
                    <button type="button" onClick={() => setBulkQty(Math.max(1, (bulkQty || 0) - 1))} className="px-4 bg-slate-50 border-r border-slate-200 hover:bg-slate-100 text-slate-600 flex items-center justify-center"><Minus size={16} /></button>
                    <input type="number" min="1" className="w-full p-2.5 text-sm text-slate-900 text-center outline-none" value={bulkQty || ''} onChange={e => setBulkQty(parseFloat(e.target.value) || 0)} />
                    <button type="button" onClick={() => setBulkQty((bulkQty || 0) + 1)} className="px-4 bg-slate-50 border-l border-slate-200 hover:bg-slate-100 text-slate-600 flex items-center justify-center"><Plus size={16} /></button>
                  </div>
                </label>
                <label className="flex flex-col text-sm font-semibold text-slate-500 md:col-span-2 lg:col-span-3">
                  เพิ่มเข้าสินค้าหน้าร้าน
                  <select 
                    className="mt-1 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-900 bg-white" 
                    value={selectedProductId} 
                    onChange={e => setSelectedProductId(e.target.value)}
                  >
                    <option value="">-- เลือกสินค้าหน้าร้าน --</option>
                    {productCatalog.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                    ))}
                  </select>
                  <span className="text-xs text-slate-400 mt-1">* ระบบจะจับคู่จาก SKU อัตโนมัติ หากไม่มีสามารถเลือกเองได้</span>
                </label>
              </>
            )}
            
            <label className="flex flex-col text-sm font-semibold text-slate-500">
              แปลงเป็นจำนวนที่ขายได้ (ชิ้น)
              <div className="flex mt-1 border border-slate-200 rounded-lg bg-white overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500">
                <button type="button" onClick={() => setQty(Math.max(1, (qty || 0) - 1))} className="px-4 bg-slate-50 border-r border-slate-200 hover:bg-slate-100 text-slate-600 flex items-center justify-center"><Minus size={16} /></button>
                <input type="number" min="1" className="w-full p-2.5 text-sm text-slate-900 text-center outline-none" value={qty || ''} onChange={e => setQty(parseInt(e.target.value) || 0)} />
                <button type="button" onClick={() => setQty((qty || 0) + 1)} className="px-4 bg-slate-50 border-l border-slate-200 hover:bg-slate-100 text-slate-600 flex items-center justify-center"><Plus size={16} /></button>
              </div>
            </label>
            
            {restockMasterItemId ? (
              <label className="flex flex-col text-sm font-semibold text-slate-500">
                ต้นทุนต่อชิ้น (฿) - ดึงจากคลังหลัก
                <div className="flex mt-1 border border-slate-200 rounded-lg bg-slate-100 overflow-hidden">
                  <input type="number" disabled className="w-full p-2.5 text-sm text-slate-500 bg-slate-100 text-center outline-none" value={qty > 0 ? ((inventoryItems.find(i => i.id === restockMasterItemId)?.unitCost || 0) * bulkQty / qty).toFixed(2) : '0'} />
                </div>
              </label>
            ) : (
              <label className="flex flex-col text-sm font-semibold text-slate-500">
                ต้นทุนต่อชิ้น (฿)
                <div className="flex mt-1 border border-slate-200 rounded-lg bg-slate-50 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500">
                  <button type="button" onClick={() => setUnitCost(Math.max(0, (unitCost || 0) - 1))} className="px-4 bg-slate-100 border-r border-slate-200 hover:bg-slate-200 text-slate-600 flex items-center justify-center"><Minus size={16} /></button>
                  <input type="number" step="0.01" min="0" className="w-full p-2.5 text-sm text-slate-900 text-center outline-none bg-transparent" value={qty > 0 && bulkCost > 0 ? (bulkCost * bulkQty / qty).toFixed(2) : (unitCost || '')} onChange={e => setUnitCost(parseFloat(e.target.value) || 0)} />
                  <button type="button" onClick={() => setUnitCost((unitCost || 0) + 1)} className="px-4 bg-slate-100 border-l border-slate-200 hover:bg-slate-200 text-slate-600 flex items-center justify-center"><Plus size={16} /></button>
                </div>
                {qty > 0 && bulkCost > 0 && <span className="text-xs text-indigo-500 mt-1">* คำนวณอัตโนมัติจากจำนวนนำเข้า</span>}
              </label>
            )}

            {!restockMasterItemId && (
              <label className="flex flex-col text-sm font-semibold text-slate-500">
                วิธีการชำระเงิน
                <div className="flex mt-1 bg-slate-100 p-1 rounded-lg">
                  <button onClick={() => setRestockPaymentMethod('cash')} className={\`flex-1 text-xs font-bold py-2 rounded-md transition-all \${restockPaymentMethod === 'cash' ? 'bg-white text-green-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}\`}>เงินสด</button>
                  <button onClick={() => setRestockPaymentMethod('transfer')} className={\`flex-1 text-xs font-bold py-2 rounded-md transition-all \${restockPaymentMethod === 'transfer' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}\`}>โอนเงิน</button>
                </div>
              </label>
            )}

            <div className="flex gap-2 items-end pt-2 lg:pt-0 md:col-span-2 lg:col-span-3 lg:justify-end">
              {editingRestockId && (
                <button onClick={() => { setEditingRestockId(null); setSelectedProductId(''); setBulkUnit('แพ็ค'); setBulkQty(1); setBulkCost(0); setQty(0); setUnitCost(0); setRestockPaymentMethod('cash'); setRestockMasterItemId(''); }} className="px-6 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2.5 rounded-lg transition-colors">
                  ยกเลิก
                </button>
              )}
              <button onClick={handleSaveRestock} disabled={!selectedProductId || qty <= 0} className="px-8 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-lg transition-colors shadow-sm">
                <Plus size={18} /> {editingRestockId ? 'อัปเดต' : (restockMasterItemId ? 'เพิ่มสต็อก' : 'นำเข้าสต็อกใหม่')}
              </button>
            </div>
          </div>
        </div>
        `;

content = content.replace(regex, newUI);
fs.writeFileSync('src/App.tsx', content);

