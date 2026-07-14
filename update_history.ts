import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

const regex = /<div className="flex items-center gap-3 mb-1">[\s\S]*?<h3 className="font-bold text-lg text-slate-900">\{order\.id\}<\/h3>/;

const replacement = `<div className="flex items-center flex-wrap gap-3 mb-1">
                    <h3 className="font-bold text-lg text-slate-900">{order.id}</h3>
                    {order.customerName && (
                      <span className="text-sm font-medium px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 flex items-center gap-1">
                        <User size={14} /> {order.customerName}
                      </span>
                    )}`;

content = content.replace(regex, replacement);
fs.writeFileSync('src/App.tsx', content);
