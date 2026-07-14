import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

const navRegex = /\{\/\* Mobile Bottom Navigation \*\/\}.*?<\/div>/s;

const newNav = `{/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-2 pb-4 z-40 overflow-x-auto">
        <button onClick={() => setActiveView('pos')} className={\`p-2 rounded-xl flex flex-col items-center gap-1 min-w-[4rem] flex-1 \${activeView === 'pos' ? 'text-indigo-600' : 'text-slate-400'}\`}>
          <Home size={20} />
          <span className="text-[10px] font-bold">สินค้า</span>
        </button>
        <button onClick={() => setActiveView('history')} className={\`p-2 rounded-xl flex flex-col items-center gap-1 min-w-[4rem] flex-1 \${activeView === 'history' ? 'text-indigo-600' : 'text-slate-400'}\`}>
          <FileText size={20} />
          <span className="text-[10px] font-bold">ออเดอร์</span>
        </button>
        <button onClick={() => setActiveView('dashboard')} className={\`p-2 rounded-xl flex flex-col items-center gap-1 min-w-[4rem] flex-1 \${activeView === 'dashboard' ? 'text-indigo-600' : 'text-slate-400'}\`}>
          <BarChart2 size={20} />
          <span className="text-[10px] font-bold">สถิติ</span>
        </button>
        <button onClick={() => setActiveView('restock')} className={\`p-2 rounded-xl flex flex-col items-center gap-1 min-w-[4rem] flex-1 \${activeView === 'restock' ? 'text-indigo-600' : 'text-slate-400'}\`}>
          <PackagePlus size={20} />
          <span className="text-[10px] font-bold">นำเข้า</span>
        </button>
        <button onClick={() => setActiveView('inventory')} className={\`p-2 rounded-xl flex flex-col items-center gap-1 min-w-[4rem] flex-1 \${activeView === 'inventory' ? 'text-indigo-600' : 'text-slate-400'}\`}>
          <Database size={20} />
          <span className="text-[10px] font-bold">คลังหลัก</span>
        </button>
        <button onClick={() => setActiveView('expenses')} className={\`p-2 rounded-xl flex flex-col items-center gap-1 min-w-[4rem] flex-1 \${activeView === 'expenses' ? 'text-indigo-600' : 'text-slate-400'}\`}>
          <ArrowRightLeft size={20} />
          <span className="text-[10px] font-bold whitespace-nowrap">รายรับ-จ่าย</span>
        </button>
        <button onClick={() => setActiveView('settings')} className={\`p-2 rounded-xl flex flex-col items-center gap-1 min-w-[4rem] flex-1 \${activeView === 'settings' ? 'text-indigo-600' : 'text-slate-400'}\`}>
          <Settings size={20} />
          <span className="text-[10px] font-bold">ตั้งค่า</span>
        </button>
      </div>`;

content = content.replace(navRegex, newNav);
fs.writeFileSync('src/App.tsx', content);
