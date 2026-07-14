  const InventoryView = () => {
    const handleAddInv = () => {
      setInvForm({
        id: Date.now().toString(),
        sku: '',
        name: '',
        category: 'วัตถุดิบ',
        stock: 0,
        unit: 'แพ็ค',
        unitCost: 0
      });
      setIsInvAdding(true);
      setEditingInventoryItem(null);
    };

    const handleEditInv = (item: MasterInventoryItem) => {
      setEditingInventoryItem(item);
      setInvForm(item);
      setIsInvAdding(false);
    };

    const handleSaveInv = () => {
      if (!invForm || !invForm.name) return;
      if (isInvAdding) {
        setInventoryItems(prev => [...prev, invForm]);
      } else if (editingInventoryItem) {
        setInventoryItems(prev => prev.map(i => i.id === editingInventoryItem.id ? invForm : i));
      }
      setIsInvAdding(false);
      setEditingInventoryItem(null);
      setInvForm(null);
    };

    const handleDeleteInv = (id: string) => {
      if (confirm('ยืนยันการลบ?')) {
        setInventoryItems(prev => prev.filter(i => i.id !== id));
      }
    };

    const invDates = Array.from(new Set(inventoryTransactions.map(t => new Date(t.timestamp).toLocaleDateString('en-CA')))).sort((a,b) => b.localeCompare(a));
    const filteredInvTrans = invTransDate ? inventoryTransactions.filter(t => new Date(t.timestamp).toLocaleDateString('en-CA') === invTransDate) : inventoryTransactions;

    const filteredItems = inventoryItems.filter(i => i.name.toLowerCase().includes(invSearchQuery.toLowerCase()));

    const InvFormRender = () => {
      if (!invForm) return null;
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <input type="text" placeholder="ชื่อสินค้า/วัตถุดิบ" className="border border-slate-200 rounded-lg p-2.5 text-sm" value={invForm.name} onChange={e => setInvForm({...invForm, name: e.target.value})} />
          <input type="text" placeholder="SKU/รหัส" className="border border-slate-200 rounded-lg p-2.5 text-sm" value={invForm.sku} onChange={e => setInvForm({...invForm, sku: e.target.value})} />
          <select className="border border-slate-200 rounded-lg p-2.5 text-sm" value={invForm.category} onChange={e => setInvForm({...invForm, category: e.target.value})}>
            <option value="วัตถุดิบ">วัตถุดิบ</option>
            <option value="ภาชนะ">ภาชนะ</option>
            <option value="ชิ้นใหญ่">ชิ้นใหญ่</option>
            <option value="อื่นๆ">อื่นๆ</option>
          </select>
          <input type="text" placeholder="หน่วย (เช่น แพ็ค, กิโล)" className="border border-slate-200 rounded-lg p-2.5 text-sm" value={invForm.unit} onChange={e => setInvForm({...invForm, unit: e.target.value})} />
          <input type="number" placeholder="จำนวน" className="border border-slate-200 rounded-lg p-2.5 text-sm" value={invForm.stock || ''} onChange={e => setInvForm({...invForm, stock: Number(e.target.value)})} />
          <input type="number" placeholder="ต้นทุนต่อหน่วย" className="border border-slate-200 rounded-lg p-2.5 text-sm" value={invForm.unitCost || ''} onChange={e => setInvForm({...invForm, unitCost: Number(e.target.value)})} />
          <div className="md:col-span-2 flex justify-end gap-2 mt-2">
            <button onClick={() => { setIsInvAdding(false); setEditingInventoryItem(null); setInvForm(null); }} className="px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">ยกเลิก</button>
            <button onClick={handleSaveInv} className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors">บันทึก</button>
          </div>
        </div>
      );
    };

    return (
      <div className="flex-1 p-6 md:p-8 overflow-y-auto pb-24 md:pb-8 flex flex-col xl:flex-row gap-8 bg-slate-50/50">
        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <h1 className="text-3xl font-bold text-slate-900">คลังหลัก (Stock Inventory)</h1>
            <div className="flex items-center gap-3">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="ค้นหา..." 
                  value={invSearchQuery}
                  onChange={(e) => setInvSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>
              <button onClick={handleAddInv} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl flex items-center gap-2 transition-colors whitespace-nowrap text-sm shadow-sm">
                <Plus size={18} /> เพิ่มใหม่
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {isInvAdding && (
              <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-200 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 mb-2">เพิ่มรายการคลังหลัก</h2>
                {InvFormRender()}
              </div>
            )}
            
            {filteredItems.map(item => (
              <div key={item.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                {editingInventoryItem?.id === item.id && !isInvAdding ? (
                  InvFormRender()
                ) : (
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                        {item.name}
                        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{item.sku}</span>
                        <span className="text-xs font-semibold text-indigo-500 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">{item.category}</span>
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">
                        จำนวน: <span className="font-bold text-slate-700">{item.stock} {item.unit}</span> &bull; ทุนต่อหน่วย: ฿{item.unitCost.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleEditInv(item)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => handleDeleteInv(item.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {filteredItems.length === 0 && !isInvAdding && (
              <div className="text-center py-10 text-slate-500">ไม่พบรายการคลังหลัก</div>
            )}
          </div>
        </div>

        <div className="w-full xl:w-96 flex flex-col h-full bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden shrink-0">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-900 mb-4">ประวัติคลังหลัก</h2>
            <select 
              value={invTransDate} 
              onChange={e => setInvTransDate(e.target.value)}
              className="w-full border border-slate-200 rounded-xl p-2.5 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">เลือกวันที่ (ทั้งหมด)</option>
              {invDates.map(d => (
                <option key={d} value={d}>{new Date(d).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredInvTrans.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-sm">ไม่มีประวัติรายการ</div>
            ) : (
              filteredInvTrans.map(t => (
                <div key={t.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-bold text-slate-900">{t.itemName}</div>
                    <div className="text-xs text-slate-500 mt-1">{new Date(t.timestamp).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })} &bull; {t.note}</div>
                  </div>
                  <div className={`text-sm font-bold whitespace-nowrap ${t.type === 'in' ? 'text-green-600' : 'text-red-600'}`}>
                    {t.type === 'in' ? '+' : '-'}{t.quantity}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };
