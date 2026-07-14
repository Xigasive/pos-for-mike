import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

const regexUI = /\{\!restockMasterItemId && \(\s*<label className="flex flex-col text-sm font-semibold text-slate-500">\s*วิธีการชำระเงิน[\s\S]*?<\/label>\s*\)\}/s;

const newUI = `<label className="flex flex-col text-sm font-semibold text-slate-500">
                วิธีการชำระเงิน
                <div className="flex mt-1 bg-slate-100 p-1 rounded-lg">
                  <button onClick={() => setRestockPaymentMethod('cash')} className={\`flex-1 text-xs font-bold py-2 rounded-md transition-all \${restockPaymentMethod === 'cash' ? 'bg-white text-green-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}\`}>เงินสด</button>
                  <button onClick={() => setRestockPaymentMethod('transfer')} className={\`flex-1 text-xs font-bold py-2 rounded-md transition-all \${restockPaymentMethod === 'transfer' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}\`}>โอนเงิน</button>
                </div>
              </label>`;

content = content.replace(regexUI, newUI);

const regexSave = /paymentMethod: restockMasterItemId \? undefined : restockPaymentMethod,/g;
content = content.replace(regexSave, 'paymentMethod: restockPaymentMethod,');

fs.writeFileSync('src/App.tsx', content);
