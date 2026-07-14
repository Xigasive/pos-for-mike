import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf-8');
const regex = /<label className="flex flex-col text-sm font-semibold text-slate-500">\s*วิธีการชำระเงิน/s;
content = content.replace(regex, "{!restockMasterItemId && (<label className=\"flex flex-col text-sm font-semibold text-slate-500\">วิธีการชำระเงิน");
const regex2 = /โอนเงิน<\/button>\s*<\/div>\s*<\/label>/s;
content = content.replace(regex2, "โอนเงิน</button>\n                </div>\n              </label>\n            )}");
fs.writeFileSync('src/App.tsx', content);
