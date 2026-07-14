import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

const regex = /\{\/\* Mobile Bottom Navigation \*\/\}/;

const modalCode = `{isCheckoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">ข้อมูลลูกค้า (ตัวเลือก)</h2>
              <p className="text-sm text-slate-500 mb-6">กรอกชื่อลูกค้าเพื่อบันทึกลงในประวัติการขาย ป้องกันการลืมว่าออเดอร์นี้เป็นของใคร</p>
              
              <label className="flex flex-col text-sm font-semibold text-slate-700">
                ชื่อลูกค้า
                <input
                  type="text"
                  placeholder="เช่น คุณสมชาย, โต๊ะ 4, พี่เอก"
                  className="mt-2 w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-base font-normal"
                  value={checkoutCustomerName}
                  onChange={e => setCheckoutCustomerName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCheckout()}
                  autoFocus
                />
              </label>
            </div>
            
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3 justify-end">
              <button 
                onClick={() => setIsCheckoutModalOpen(false)}
                className="px-5 py-2.5 rounded-xl font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                ยกเลิก
              </button>
              <button 
                onClick={handleCheckout}
                className="px-6 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <CheckCircle2 size={18} /> ยืนยันชำระเงิน
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}`;

content = content.replace(regex, modalCode);
fs.writeFileSync('src/App.tsx', content);
