import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

const regex = /<label className="flex flex-col text-sm font-semibold text-slate-500 md:col-span-2 lg:col-span-3">\s*เพิ่มเข้าสินค้าหน้าร้าน\s*<select[\s\S]*?<\/select>\s*<span className="text-xs text-slate-400 mt-1">\* ระบบจะจับคู่จาก SKU อัตโนมัติ หากไม่มีสามารถเลือกเองได้<\/span>\s*<\/label>/s;

const replacement = `{selectedProductId ? (
                  <div className="md:col-span-2 lg:col-span-3 flex flex-col justify-center">
                    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
                      <CheckCircle2 size={16} /> ระบบจะนำสต็อกไปเพิ่มในสินค้า: <span className="font-bold">{productCatalog.find(p => p.id === selectedProductId)?.name}</span> (SKU ตรงกัน)
                    </div>
                  </div>
                ) : (
                  <div className="md:col-span-2 lg:col-span-3 flex flex-col justify-center">
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                      <AlertCircle size={16} /> ไม่พบสินค้าที่มี SKU ตรงกับคลังหลัก โปรดตรวจสอบข้อมูลสินค้าในเมนูตั้งค่า
                    </div>
                  </div>
                )}`;

content = content.replace(regex, replacement);
fs.writeFileSync('src/App.tsx', content);
