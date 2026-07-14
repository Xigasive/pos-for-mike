import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

const regex = /const handleDeleteOrder = \(orderId: string\) => \{[\s\S]*?setOrders\(prev => prev\.filter\(o => o\.id !== orderId\)\);\s*\};/s;

const replacement = `const processingOrdersRef = useRef<Set<string>>(new Set());

  const handleDeleteOrder = (orderId: string) => {
    if (processingOrdersRef.current.has(orderId)) return;
    if (!confirm('ยืนยันการยกเลิกรายการนี้และคืนสต็อกสินค้า?')) return;
    
    const orderToDelete = orders.find(o => o.id === orderId);
    if (orderToDelete) {
      processingOrdersRef.current.add(orderId);
      setProductCatalog(prev => prev.map(p => {
        const deletedItem = orderToDelete.items.find(i => i.id === p.id);
        const refundQty = deletedItem ? deletedItem.quantity + (deletedItem.freeQuantity || 0) : 0;
        return { ...p, stock: p.stock + refundQty };
      }));
      setOrders(prev => prev.filter(o => o.id !== orderId));
      setTimeout(() => {
        processingOrdersRef.current.delete(orderId);
      }, 1000);
    }
  };`;

content = content.replace(regex, replacement);

fs.writeFileSync('src/App.tsx', content);
