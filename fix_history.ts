import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

const regex = /filteredRestocks\.map\(r => \([\s\S]*?<h3 className="font-bold text-lg text-slate-900">\{order\.id\}<\/h3>/;

const replacement = `filteredRestocks.map(r => (
              <div key={r.id} className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col md:flex-row justify-between gap-4 md:items-center shadow-sm">
                <div>
                  <div className="flex items-center flex-wrap gap-3 mb-1">
                    <h3 className="font-bold text-lg text-slate-900">{r.productName}</h3>
                    <span className="text-sm font-medium px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md">
                      {new Date(r.timestamp).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                    {r.masterItemId && (
                      <span className="text-xs font-bold px-2 py-1 rounded-md bg-indigo-100 text-indigo-700">
                        📦 หักจากคลังหลัก ({r.bulkQty} {r.bulkUnit})
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-slate-600 mt-2 flex flex-wrap gap-x-4 gap-y-1">
                    <span>รหัสอ้างอิง: {r.id}</span>
                    <span>จำนวนนำเข้า: {r.quantity} ชิ้น (ต้นทุน ฿{r.unitCost.toFixed(2)}/ชิ้น)</span>
                    <span className="font-medium text-slate-900">ยอดรวม: ฿{r.totalCost.toFixed(2)}</span>
                    <span className={\`font-semibold \${r.paymentMethod === 'transfer' ? 'text-blue-600' : 'text-green-600'}\`}>
                      ชำระโดย: {r.paymentMethod === 'transfer' ? 'โอนเงิน' : 'เงินสด'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => handleEdit(r)} className="flex items-center gap-1 text-sm font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-xl transition-colors border border-indigo-100">
                    <Edit size={16} /> แก้ไข
                  </button>
                  <button onClick={() => handleDelete(r)} className="flex items-center gap-1 text-sm font-bold text-red-600 hover:bg-red-50 px-3 py-2 rounded-xl transition-colors border border-red-100">
                    <Trash2 size={16} /> ลบ
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const HistoryView = () => {
    const dates = Array.from(new Set(orders.map(o => new Date(o.timestamp).toLocaleDateString('en-CA')))).sort((a,b) => b.localeCompare(a));
    const filteredOrders = historyDate ? orders.filter(o => new Date(o.timestamp).toLocaleDateString('en-CA') === historyDate) : orders;

    const handleUpdatePayment = (id: string, method: 'cash' | 'transfer') => {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, paymentMethod: method } : o));
    };

    const handleClearPayment = (id: string) => {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, paymentMethod: undefined } : o));
    };

    return (
      <div className="flex-1 p-6 md:p-8 overflow-y-auto pb-24 md:pb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold text-slate-900">ประวัติการขาย</h1>
          {dates.length > 0 && (
            <select 
              value={historyDate} 
              onChange={e => setHistoryDate(e.target.value)}
              className="border border-slate-200 rounded-xl p-2.5 text-sm text-slate-900 bg-white min-w-[150px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">เลือกวันที่ (ทั้งหมด)</option>
              {dates.map(d => (
                <option key={d} value={d}>{new Date(d).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}</option>
              ))}
            </select>
          )}
        </div>
        {filteredOrders.length === 0 ? (
          <div className="text-slate-500 flex flex-col items-center justify-center py-20">
            <FileText size={48} className="mb-4 opacity-20" />
            <p>ยังไม่มีคำสั่งซื้อในวันที่เลือก</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map(order => {
              const borderClass = !order.paymentMethod ? 'border-amber-300 shadow-md' : order.paymentMethod === 'cash' ? 'border-emerald-200 bg-emerald-50/30' : 'border-sky-200 bg-sky-50/30';
              const badgeClass = !order.paymentMethod ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500';
              return (
              <div key={order.id} className={\`p-6 rounded-2xl border flex flex-col md:flex-row justify-between gap-4 md:items-center transition-all \${borderClass} \${!order.paymentMethod ? 'bg-white' : ''}\`}>
                <div>
                  <div className="flex items-center flex-wrap gap-3 mb-1">
                    <h3 className="font-bold text-lg text-slate-900">{order.id}</h3>`;

content = content.replace(regex, replacement);
fs.writeFileSync('src/App.tsx', content);
