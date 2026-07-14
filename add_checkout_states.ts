import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace(
  /const \[editingOrderId, setEditingOrderId\] = useState<string \| null>\(null\);/,
  `const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [checkoutCustomerName, setCheckoutCustomerName] = useState('');`
);

fs.writeFileSync('src/App.tsx', content);
