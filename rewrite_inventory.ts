import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

const regex = /const InventoryView = \(\) => \{[\s\S]*?\n  \};\n  const SettingsView = \(\) => \{/s;

const newInventoryView = `const InventoryView = () => {
    const handleAddInv = () => {
      setInvForm({
        id: Date.now().toString(),
        sku: '',
        name: '',
        category: 'วัตถุดิบ',
        stock: 0,
        unit: 'แพ็ค',
        unitCost: 0,
      });
      setIsInvAdding(true);
      setEditingInventoryItem(null);
      setInvTab('items');
    };

    const handleEditInv = (item: InventoryItem) => {
      setEditingInventoryItem(item);
      setInvForm(item);
      setIsInvAdding(false);
      setInvTab('items');
    };

    const handleSaveInv = () => {
      if (!invForm || !invForm.name) return;
      if (isInvAdding) {
        setInventoryItems(prev => [...prev, invForm]);
        if (invForm.stock > 0) {
          setInventoryTransactions(prev => [...prev, {
            id: Date.now().toString() + '-in',
            itemId: invForm.id,
            itemName: invForm.name,
            type: 'in',
            quantity: invForm.stock,
            unitCost: invForm.unitCost,
            totalCost: invForm.stock * invForm.unitCost,
            timestamp: new Date().toISOString(),
            note: 'เพิ่มสินค้าเริ่มต้นในคลังหลัก'
          }]);
        }
      } else if (editingInventoryItem) {
        const diff = invForm.stock - editingInventoryItem.stock;
        setInventoryItems(prev => prev.map(i => i.id === editingInventoryItem.id ? invForm : i));
        
        if (diff !== 0) {
          setInventoryTransactions(prev => [...prev, {
            id: Date.now().toString() + (diff > 0 ? '-in' : '-out'),
            itemId: invForm.id,
            itemName: invForm.name,
            type: diff > 0 ? 'in' : 'out',
            quantity: Math.abs(diff),
            unitCost: invForm.unitCost,
            totalCost: Math.abs(diff) * invForm.unitCost,
            timestamp: new Date().toISOString(),
            note: 'ปรับปรุง/แก้ไขจำนวนคลังหลัก'
          }]);
        }
      }
      setIsInvAdding(false);
      setEditingInventoryItem(null);
      setInvForm(null);
    };

    const handleDeleteInv = (id: string) => {
      if (confirm('ยืนยันการลบสินค้าในคลังหลัก?')) {
        setInventoryItems(prev => prev.filter(i => i.id !== id));
      }
    };

    const invDates = Array.from(new Set(inventoryTransactions.map(t => new Date(t.timestamp).toLocaleDateString('en-CA')))).sort((a,b) => b.localeCompare(a));
    const filteredInvTrans = invTransDate ? inventoryTransactions.filter(t => new Date(t.timestamp).toLocaleDateString('en-CA') === invTransDate) : inventoryTransactions;

    const filteredItems = inventoryItems.filter(i => i.name.toLowerCase().includes(invSearchQuery.toLowerCase()) || i.sku.toLowerCase().includes(invSearchQuery.toLowerCase()));

    const InvFormRender = () => {
      if (!invForm) return null;
      return (
        <div className="bg-white p-6 rounded-2xl border border-indigo-200 shadow-xl shadow-indigo-100/50 mb-8 transform transition-all">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Package size={24} className="text-indigo-600" />
              {isInvAdding ? 'เพิ่มรายการคลังหลัก' : 'แก้ไขรายการคลังหลัก'}
            </h2>
            <button onClick={() => { setIsInvAdding(false); setEditingInventoryItem(null); setInvForm(null); }} className="text-slate-400 hover:text-slate-600 transition-colors p-1">
              <X size={24} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="md:col-span-2 lg:col-span-4 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
              <label className="text-sm font-semibold text-slate-600 mb-1.5 block">ดึงข้อมูลจากสินค้า (Auto-fill)</label>
              <select className="w-full border border-slate-200 rounded-lg p-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow" onChange={e => {
                const p = productCatalog.find(x => x.id === e.target.value);
                if (p) setInvForm({...invForm, name: p.name, sku: p.sku});
              }}>
                <option value="">-- เลือกสินค้าที่มีอยู่แล้ว --</option>
                {productCatalog.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-slate-600 mb-1.5 block">ชื่อสินค้า/วัตถุดิบ <span className="text-red-500">*</span></label>
              <input type="text" placeholder="เช่น เมล็ดกาแฟอาราบิก้า" className="w-full border border-slate-200 rounded-lg p-3 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" value={invForm.name} onChange={e => setInvForm({...invForm, name: e.target.value})} />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-slate-600 mb-1.5 block">รหัส SKU</label>
              <input type="text" placeholder="เช่น COF-ARA-01" className="w-full border border-slate-200 rounded-lg p-3 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" value={invForm.sku} onChange={e => setInvForm({...invForm, sku: e.target.value})} />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-600 mb-1.5 block">หมวดหมู่</label>
              <select className="w-full border border-slate-200 rounded-lg p-3 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" value={invForm.category} onChange={e => setInvForm({...invForm, category: e.target.value})}>
                <option value="วัตถุดิบ">วัตถุดิบ</option>
                <option value="ภาชนะ">ภาชนะ</option>
                <option value="ชิ้นใหญ่">ชิ้นใหญ่</option>
                <option value="อื่นๆ">อื่นๆ</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-600 mb-1.5 block">หน่วยนับ</label>
              <select className="w-full border border-slate-200 rounded-lg p-3 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" value={invForm.unit} onChange={e => setInvForm({...invForm, unit: e.target.value})}>
                <option value="แพ็ค">แพ็ค</option>
                <option value="กิโลกรัม">กิโลกรัม</option>
                <option value="ลัง">ลัง</option>
                <option value="อื่นๆ">อื่นๆ</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-600 mb-1.5 block">จำนวนในคลัง</label>
              <input type="number" min="0" placeholder="0" className="w-full border border-slate-200 rounded-lg p-3 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-center" value={invForm.stock || ''} onChange={e => setInvForm({...invForm, stock: Number(e.target.value)})} />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-600 mb-1.5 block">ต้นทุน/หน่วย (฿)</label>
              <input type="number" min="0" step="0.01" placeholder="0.00" className="w-full border border-slate-200 rounded-lg p-3 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-center font-mono text-indigo-700 font-bold" value={invForm.unitCost || ''} onChange={e => setInvForm({...invForm, unitCost: Number(e.target.value)})} />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
            <button onClick={() => { setIsInvAdding(false); setEditingInventoryItem(null); setInvForm(null); }} className="px-6 py-3 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">ยกเลิก</button>
            <button onClick={handleSaveInv} disabled={!invForm.name} className="px-8 py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2">
              <Save size={18} /> บันทึกรายการ
            </button>
          </div>
        </div>
      );
    };

    return (
      <div className="flex-1 p-4 md:p-8 overflow-y-auto pb-24 md:pb-8 bg-slate-50/50 min-h-screen">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">คลังหลัก <span className="text-indigo-600 font-light">Inventory</span></h1>
              <p className="text-slate-500 mt-2 text-sm font-medium">จัดการสต็อกวัตถุดิบ ภาชนะ และสินค้ารอแพ็ค (ไม่เกี่ยวกับหน้าร้าน)</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="ค้นหาชื่อ, SKU..." 
                  value={invSearchQuery}
                  onChange={(e) => setInvSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm transition-shadow"
                />
              </div>
              <button onClick={handleAddInv} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-5 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm shrink-0">
                <Plus size={18} /> <span className="hidden sm:inline">เพิ่มรายการ</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex p-1 bg-slate-200/50 rounded-xl mb-6 w-full sm:w-fit">
            <button 
              onClick={() => setInvTab('items')} 
              className={\`flex-1 sm:flex-none px-6 py-2.5 text-sm font-bold rounded-lg transition-all \${invTab === 'items' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}\`}
            >
              รายการในคลัง
            </button>
            <button 
              onClick={() => setInvTab('history')} 
              className={\`flex-1 sm:flex-none px-6 py-2.5 text-sm font-bold rounded-lg transition-all \${invTab === 'history' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}\`}
            >
              ประวัติความเคลื่อนไหว
            </button>
          </div>

          {(isInvAdding || editingInventoryItem) && InvFormRender()}

          {invTab === 'items' && !isInvAdding && !editingInventoryItem && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredItems.map(item => (
                  <div key={item.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow group flex flex-col h-full">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                          <Package size={24} strokeWidth={1.5} />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 text-lg leading-tight line-clamp-1" title={item.name}>{item.name}</h3>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {item.sku && <span className="text-xs font-mono font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">{item.sku}</span>}
                            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">{item.category}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-auto">
                      <div className="flex items-end justify-between py-3 border-y border-slate-100 mb-4">
                        <div>
                          <p className="text-xs font-semibold text-slate-400 mb-0.5 uppercase tracking-wider">คงเหลือ</p>
                          <div className="flex items-baseline gap-1">
                            <span className={\`text-2xl font-black \${item.stock <= 0 ? 'text-red-500' : 'text-slate-800'}\`}>{item.stock.toLocaleString()}</span>
                            <span className="text-sm font-semibold text-slate-500">{item.unit}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-semibold text-slate-400 mb-0.5 uppercase tracking-wider">ทุนต่อหน่วย</p>
                          <p className="text-lg font-bold text-slate-700 font-mono">฿{item.unitCost.toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button onClick={() => handleEditInv(item)} className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors">
                          <Edit size={16} /> แก้ไข
                        </button>
                        <button onClick={() => handleDeleteInv(item.id)} className="w-11 flex items-center justify-center text-slate-400 hover:text-red-600 bg-slate-50 hover:bg-red-50 rounded-xl transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {filteredItems.length === 0 && (
                <div className="bg-white border border-slate-200 border-dashed rounded-3xl p-12 text-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                    <Package size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-700 mb-2">ไม่พบรายการคลังหลัก</h3>
                  <p className="text-slate-500 mb-6 max-w-sm mx-auto">เพิ่มรายการวัตถุดิบหรือสินค้าหลักของคุณเพื่อเริ่มจัดการสต็อก</p>
                  <button onClick={handleAddInv} className="inline-flex items-center gap-2 font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-6 py-2.5 rounded-xl transition-colors">
                    <Plus size={18} /> เพิ่มรายการแรก
                  </button>
                </div>
              )}
            </>
          )}

          {invTab === 'history' && !isInvAdding && !editingInventoryItem && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                <h2 className="text-lg font-bold text-slate-800">ประวัติความเคลื่อนไหว</h2>
                <div className="w-full sm:w-auto relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                  <select 
                    value={invTransDate} 
                    onChange={e => setInvTransDate(e.target.value)}
                    className="w-full sm:w-auto pl-9 pr-8 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none shadow-sm cursor-pointer"
                  >
                    <option value="">ทุกวันที่</option>
                    {invDates.map(d => (
                      <option key={d} value={d}>{new Date(d).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="divide-y divide-slate-100">
                {filteredInvTrans.map(t => (
                  <div key={t.id} className="p-5 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 group">
                    <div className="flex gap-4 items-start md:items-center">
                      <div className={\`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm border \${t.type === 'in' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}\`}>
                        {t.type === 'in' ? <Plus size={18} strokeWidth={2.5} /> : <Minus size={18} strokeWidth={2.5} />}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 flex items-center gap-2">
                          {t.itemName}
                          <span className={\`text-xs px-2 py-0.5 rounded-full font-bold \${t.type === 'in' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}\`}>
                            {t.type === 'in' ? 'รับเข้า' : 'เบิกออก'}
                          </span>
                        </p>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <Clock size={12} /> {new Date(t.timestamp).toLocaleString('th-TH')}
                        </p>
                        {t.note && <p className="text-sm text-slate-600 mt-2 bg-slate-100 inline-block px-3 py-1 rounded-lg italic">"{t.note}"</p>}
                      </div>
                    </div>
                    
                    <div className="flex flex-row md:flex-col justify-between items-center md:items-end gap-1 ml-14 md:ml-0 border-t md:border-t-0 border-slate-100 pt-3 md:pt-0">
                      <div className="text-sm font-semibold text-slate-500">จำนวน</div>
                      <span className={\`font-black text-xl \${t.type === 'in' ? 'text-green-600' : 'text-red-600'}\`}>
                        {t.type === 'in' ? '+' : '-'}{t.quantity}
                      </span>
                    </div>
                  </div>
                ))}

                {filteredInvTrans.length === 0 && (
                  <div className="p-12 text-center text-slate-500">
                    <History size={32} className="mx-auto mb-3 text-slate-300" />
                    <p className="font-medium text-slate-600">ไม่มีประวัติความเคลื่อนไหว</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };
  const SettingsView = () => {`;

content = content.replace(regex, newInventoryView);

fs.writeFileSync('src/App.tsx', content);
