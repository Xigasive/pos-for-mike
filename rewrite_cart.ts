import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

const regex = /cart\.map\(\(item\) => \([\s\S]*?\)\)[\s\S]*?\)\}/;
const replacement = `cart.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-2 p-3 bg-white border border-slate-200 rounded-2xl shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center text-xl shrink-0 overflow-hidden">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    item.category === 'Coffee' ? '☕' : item.category === 'Pastry' ? '🥐' : item.category === 'Bread' ? '🥖' : item.category === 'Food' ? '🥪' : '🍵'
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-[15px] text-slate-900 leading-tight">{item.name}</h3>
                  <p className="text-slate-500 text-[13px]">
                    ฿{item.price.toFixed(2)} / ชิ้น
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-500">ขาย (฿{(item.price * item.quantity).toFixed(2)})</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 rounded-xl p-1 border border-slate-100">
                  <button onClick={() => updateQuantity(item.id, -1, false)} className="text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 shadow-sm rounded-lg w-8 h-8 flex items-center justify-center transition-colors active:scale-95"><Minus size={16} /></button>
                  <span className="w-6 text-center text-sm font-bold text-slate-800">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1, false)} className="text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 shadow-sm rounded-lg w-8 h-8 flex items-center justify-center transition-colors active:scale-95"><Plus size={16} /></button>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1.5 text-orange-600">
                  <Gift size={14} />
                  <span className="text-xs font-semibold">แถม / กินเอง (ฟรี)</span>
                </div>
                <div className="flex items-center gap-2 bg-orange-50 rounded-xl p-1 border border-orange-100">
                  <button onClick={() => updateQuantity(item.id, -1, true)} className="text-orange-600 hover:text-orange-700 bg-white hover:bg-orange-100 shadow-sm rounded-lg w-8 h-8 flex items-center justify-center transition-colors active:scale-95"><Minus size={16} /></button>
                  <span className="w-6 text-center text-sm font-bold text-orange-700">{item.freeQuantity || 0}</span>
                  <button onClick={() => updateQuantity(item.id, 1, true)} className="text-orange-600 hover:text-orange-700 bg-white hover:bg-orange-100 shadow-sm rounded-lg w-8 h-8 flex items-center justify-center transition-colors active:scale-95"><Plus size={16} /></button>
                </div>
              </div>
            </div>
          ))
        )}`;

content = content.replace(regex, replacement);
fs.writeFileSync('src/App.tsx', content);
