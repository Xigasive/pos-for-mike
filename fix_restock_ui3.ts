import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

const regex = /<label className="flex flex-col text-sm font-semibold text-slate-500">\s*จำนวนที่แบ่ง \(\{inventoryItems\.find\(i => i\.id === restockMasterItemId\)\?\.unit \|\| 'หน่วย'\}\)\s*<div className="flex mt-1 border border-slate-200 rounded-lg bg-white overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500">\s*<button type="button" onClick=\{[\s\S]*?<\/button>\s*<\/div>\s*<\/label>/s;

const replacement = `<label className="flex flex-col text-sm font-semibold text-slate-500">
                  จำนวนที่แบ่ง ({inventoryItems.find(i => i.id === restockMasterItemId)?.unit || 'หน่วย'})
                  <div className="flex mt-1 border border-slate-200 rounded-lg bg-white overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500">
                    <button type="button" onClick={() => setBulkQty(Math.max(1, (bulkQty || 0) - 1))} className="px-4 bg-slate-50 border-r border-slate-200 hover:bg-slate-100 text-slate-600 flex items-center justify-center"><Minus size={16} /></button>
                    <input type="number" min="1" className="w-full p-2.5 text-sm text-slate-900 text-center outline-none" value={bulkQty || ''} onChange={e => setBulkQty(parseFloat(e.target.value) || 0)} />
                    <button type="button" onClick={() => setBulkQty((bulkQty || 0) + 1)} className="px-4 bg-slate-50 border-l border-slate-200 hover:bg-slate-100 text-slate-600 flex items-center justify-center"><Plus size={16} /></button>
                  </div>
                </label>
                <label className="flex flex-col text-sm font-semibold text-slate-500">
                  ต้นทุนต่อ 1 {inventoryItems.find(i => i.id === restockMasterItemId)?.unit || 'หน่วย'} (฿)
                  <div className="flex mt-1 border border-slate-200 rounded-lg bg-white overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500">
                    <button type="button" onClick={() => setBulkCost(Math.max(0, (bulkCost || 0) - 10))} className="px-4 bg-slate-50 border-r border-slate-200 hover:bg-slate-100 text-slate-600 flex items-center justify-center"><Minus size={16} /></button>
                    <input type="number" step="0.01" min="0" className="w-full p-2.5 text-sm text-slate-900 text-center outline-none" value={bulkCost || ''} onChange={e => setBulkCost(parseFloat(e.target.value) || 0)} />
                    <button type="button" onClick={() => setBulkCost((bulkCost || 0) + 10)} className="px-4 bg-slate-50 border-l border-slate-200 hover:bg-slate-100 text-slate-600 flex items-center justify-center"><Plus size={16} /></button>
                  </div>
                </label>`;

content = content.replace(regex, replacement);

fs.writeFileSync('src/App.tsx', content);
