import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

const regex = /<label className="flex flex-col text-sm font-semibold text-slate-500">\s*ต้นทุนต่อชิ้น \(฿\)[\s\S]*?<\/label>\s*<label className="flex flex-col text-sm font-semibold text-slate-500">\s*วิธีการชำระเงิน[\s\S]*?<\/label>/s;

const replacement = `{restockMasterItemId ? (
              <label className="flex flex-col text-sm font-semibold text-slate-500">
                ต้นทุนต่อชิ้น (฿) - คำนวณจากคลังหลัก
                <div className="flex mt-1 border border-slate-200 rounded-lg bg-slate-100 overflow-hidden">
                  <input type="number" disabled className="w-full p-2.5 text-sm text-slate-500 bg-slate-100 text-center outline-none" value={qty > 0 ? ((inventoryItems.find(i => i.id === restockMasterItemId)?.unitCost || 0) * bulkQty / qty).toFixed(2) : '0'} />
                </div>
              </label>
            ) : (
              <label className="flex flex-col text-sm font-semibold text-slate-500">
                ต้นทุนต่อชิ้น (฿)
                <div className="flex mt-1 border border-slate-200 rounded-lg bg-slate-50 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500">
                  <button type="button" onClick={() => setUnitCost(Math.max(0, (unitCost || 0) - 1))} className="px-4 bg-slate-100 border-r border-slate-200 hover:bg-slate-200 text-slate-600 flex items-center justify-center"><Minus size={16} /></button>
                  <input type="number" step="0.01" min="0" className="w-full p-2.5 text-sm text-slate-900 text-center outline-none bg-transparent" value={(qty > 0 && bulkCost > 0) ? (bulkCost * bulkQty / qty).toFixed(2) : (unitCost || '')} onChange={e => setUnitCost(parseFloat(e.target.value) || 0)} />
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
            )}`;

content = content.replace(regex, replacement);

fs.writeFileSync('src/App.tsx', content);
