import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

const regex1 = /const addToCart = \(product: Product\) => \{[\s\S]*?const updateQuantity = \(id: string, delta: number\) => \{[\s\S]*?const totalItems = cart.reduce\(\(sum, item\) => sum \+ item\.quantity, 0\);/s;

const replacement1 = `const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      const totalQty = existing ? existing.quantity + (existing.freeQuantity || 0) : 0;
      if (totalQty >= product.stock) {
        alert('สินค้าไม่เพียงพอ!');
        return prev;
      }
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1, freeQuantity: 0 }];
    });
  };

  const updateQuantity = (id: string, delta: number, isFree: boolean = false) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.id === id) {
            const product = productCatalog.find(p => p.id === id);
            const currentQty = isFree ? (item.freeQuantity || 0) : item.quantity;
            const newQty = Math.max(0, currentQty + delta);
            
            if (delta > 0 && product) {
              const otherQty = isFree ? item.quantity : (item.freeQuantity || 0);
              if (newQty + otherQty > product.stock) {
                alert('สินค้าไม่เพียงพอ!');
                return item;
              }
            }

            if (isFree) {
              return { ...item, freeQuantity: newQty };
            } else {
              return { ...item, quantity: newQty };
            }
          }
          return item;
        })
        .filter((item) => item.quantity > 0 || (item.freeQuantity && item.freeQuantity > 0));
    });
  };

  const clearCart = () => setCart([]);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal; // Removed tax
  const totalCost = cart.reduce((sum, item) => sum + item.cost * (item.quantity + (item.freeQuantity || 0)), 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity + (item.freeQuantity || 0), 0);`;

content = content.replace(regex1, replacement1);
fs.writeFileSync('src/App.tsx', content);
