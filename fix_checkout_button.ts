import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

const regex = /onClick=\{\(\) => setIsCheckoutModalOpen\(true\)\}/;

const replacement = `onClick={() => {
            if (editingOrderId) {
              const oldOrder = orders.find(o => o.id === editingOrderId);
              setCheckoutCustomerName(oldOrder?.customerName || '');
            } else {
              setCheckoutCustomerName('');
            }
            setIsCheckoutModalOpen(true);
          }}`;

content = content.replace(regex, replacement);
fs.writeFileSync('src/App.tsx', content);
