import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

const regex = /const handleCheckout = async \(\) => \{[\s\S]*?setActiveView\('history'\);\s*\};/s;

const replacement = `const handleCheckout = async () => {
    let finalOrder: Order;
    if (editingOrderId) {
      const oldOrder = orders.find(o => o.id === editingOrderId);
      setProductCatalog(prev => prev.map(p => {
        const oldItem = oldOrder?.items.find(i => i.id === p.id);
        const oldQty = oldItem ? oldItem.quantity + (oldItem.freeQuantity || 0) : 0;
        const cartItem = cart.find(i => i.id === p.id);
        const newQty = cartItem ? cartItem.quantity + (cartItem.freeQuantity || 0) : 0;
        return { ...p, stock: p.stock + oldQty - newQty };
      }));
      
      finalOrder = { 
        ...oldOrder!,
        items: cart, 
        subtotal, 
        total, 
        totalCost, 
        timestamp: new Date().toISOString(),
        customerName: checkoutCustomerName || oldOrder?.customerName
      };
      setOrders(prev => prev.map(o => o.id === editingOrderId ? finalOrder : o));
      setEditingOrderId(null);
    } else {
      setProductCatalog(prev => prev.map(p => {
        const cartItem = cart.find(i => i.id === p.id);
        const newQty = cartItem ? cartItem.quantity + (cartItem.freeQuantity || 0) : 0;
        return { ...p, stock: p.stock - newQty };
      }));
      const newOrder: Order = {
        id: \`ORD-\${Math.floor(1000 + Math.random() * 9000)}\`,
        items: cart,
        subtotal,
        total,
        totalCost,
        timestamp: new Date().toISOString(),
        customerName: checkoutCustomerName
      };
      setOrders(prev => [newOrder, ...prev]);
      finalOrder = newOrder;
    }
    
    setCheckoutCustomerName('');
    setIsCheckoutModalOpen(false);
    clearCart();
    setIsMobileCartOpen(false);
    setActiveView('history');
  };`;

content = content.replace(regex, replacement);
fs.writeFileSync('src/App.tsx', content);
