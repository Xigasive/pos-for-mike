import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

const regex1 = /<label className="flex flex-col text-sm font-semibold text-slate-500">\s*ต้นทุนต่อ 1 \{inventoryItems\.find.*?<\/label>/s;
content = content.replace(regex1, `{inventoryItems.find(i => i.id === restockMasterItemId) && <div className="text-sm font-semibold text-indigo-600 bg-indigo-50 p-2.5 rounded-lg border border-indigo-100 flex items-center gap-2 mt-1"><CheckCircle2 size={16} /> ใช้ทุนจากคลังหลัก (฿{inventoryItems.find(i => i.id === restockMasterItemId)?.unitCost.toFixed(2)}/{inventoryItems.find(i => i.id === restockMasterItemId)?.unit})</div>}`);

const regex2 = /\{restockMasterItemId \? \(\s*<label className="flex flex-col text-sm font-semibold text-slate-500">\s*ต้นทุนต่อชิ้น \(฿\) - คำนวณจากคลังหลัก[\s\S]*?<\/label>\s*\) : \(/s;
content = content.replace(regex2, `{!restockMasterItemId && (`);

const regex3 = /\{\!restockMasterItemId && \(\s*<label className="flex flex-col text-sm font-semibold text-slate-500">\s*วิธีการชำระเงิน/s;
content = content.replace(regex3, `{!restockMasterItemId && (
              <label className="flex flex-col text-sm font-semibold text-slate-500">
                วิธีการชำระเงิน`);

fs.writeFileSync('src/App.tsx', content);
