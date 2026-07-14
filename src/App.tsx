/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { products as initialProducts } from './data';
import { CartItem, Product, Order, RestockRecord, ExpenseRecord, MasterInventoryItem, InventoryTransaction } from './types';
import { ShoppingCart, Plus, Minus, CheckCircle2, AlertCircle, Trash2, Home, BarChart2, User, Search, Edit, FileText, Settings, PackagePlus, Wallet, TrendingUp, ShoppingBag, Package, ArrowRightLeft, TrendingDown, Database, Clock, History, Filter, X, Save, Gift, Volume2, VolumeX } from 'lucide-react';
import { sounds, setMuted, getMuted } from './utils/audio';

export default function App() {
  const [isSoundMuted, setIsSoundMuted] = useState(getMuted());

  const toggleSound = () => {
    const newMuted = !isSoundMuted;
    setMuted(newMuted);
    setIsSoundMuted(newMuted);
  };

  const [productCatalog, setProductCatalog] = useState<Product[]>(initialProducts);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  const [activeView, setActiveView] = useState<'pos' | 'history' | 'dashboard' | 'settings' | 'restock' | 'expenses' | 'inventory'>('pos');
  const [orders, setOrders] = useState<Order[]>([]);
  const [restocks, setRestocks] = useState<RestockRecord[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [inventoryItems, setInventoryItems] = useState<MasterInventoryItem[]>([]);
  const [inventoryTransactions, setInventoryTransactions] = useState<InventoryTransaction[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [lastSyncedHash, setLastSyncedHash] = useState('');

  // RestockView state
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [bulkUnit, setBulkUnit] = useState<string>('แพ็ค');
  const [bulkQty, setBulkQty] = useState<number>(1);
  const [bulkCost, setBulkCost] = useState<number>(0);
  const [qty, setQty] = useState<number>(0);
  const [unitCost, setUnitCost] = useState<number>(0);
  const [editingRestockId, setEditingRestockId] = useState<string | null>(null);
  const [restockMasterItemId, setRestockMasterItemId] = useState<string>('');

  // SettingsView state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<Product | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  
  // InventoryView state
  const [editingInventoryItem, setEditingInventoryItem] = useState<MasterInventoryItem | null>(null);
  const [invForm, setInvForm] = useState<MasterInventoryItem | null>(null);
  const [isInvAdding, setIsInvAdding] = useState(false);
  const [invSearchQuery, setInvSearchQuery] = useState('');
  const [invTab, setInvTab] = useState<'items' | 'history'>('items');
  
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [checkoutCustomerName, setCheckoutCustomerName] = useState('');

  // ExpensesView state
  const [amount, setAmount] = useState<number>(0);
  const [note, setNote] = useState('');
  const [expenseType, setExpenseType] = useState<'income' | 'expense'>('expense');
  const [expensePaymentMethod, setExpensePaymentMethod] = useState<'cash' | 'transfer'>('cash');
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);

  // RestockView payment method (restock states are near line 25, let's just add it here for simplicity)
  const [restockPaymentMethod, setRestockPaymentMethod] = useState<'cash' | 'transfer'>('cash');

  // Filters state
  const [historyDate, setHistoryDate] = useState<string>('');
  const [restockDate, setRestockDate] = useState<string>('');
  const [expenseDate, setExpenseDate] = useState<string>('');
  const [dashboardDate, setDashboardDate] = useState<string>('');
  const [invTransDate, setInvTransDate] = useState<string>('');

  const isEditingRef = useRef(false);
  useEffect(() => {
    isEditingRef.current = !!(editingProduct || isAdding || editingRestockId || editingOrderId || editingExpenseId);
  }, [editingProduct, isAdding, editingRestockId, editingOrderId, editingExpenseId]);

  useEffect(() => {
    if (qty > 0 && bulkQty > 0 && bulkCost >= 0) {
      setUnitCost(Number(((bulkQty * bulkCost) / qty).toFixed(2)));
    }
  }, [qty, bulkQty, bulkCost]);

  const lastSyncedHashRef = useRef(lastSyncedHash);
  const skipNextSyncRef = useRef(false);

  useEffect(() => {
    lastSyncedHashRef.current = lastSyncedHash;
  }, [lastSyncedHash]);

  useEffect(() => {
    // Initial data load from server
    const loadInitialData = async () => {
      try {
        const res = await fetch('https://xigasive.pythonanywhere.com/sync');
        const data = await res.json();
        if (data.products && data.products.length > 0) {
          skipNextSyncRef.current = true;
          setProductCatalog(data.products);
          setOrders(data.orders || []);
          setRestocks(data.restocks || []);
          setExpenses(data.expenses || []);
          setInventoryItems(data.inventoryItems || []);
          setInventoryTransactions(data.inventoryTransactions || []);
          setLastSyncedHash(JSON.stringify(data));
        } else {
          fallbackLocal();
          setLastSyncedHash(JSON.stringify(data));
        }
      } catch (err) {
        fallbackLocal();
        setLastSyncedHash('OFFLINE'); 
      } finally {
        setIsDataLoaded(true);
      }
    };

    const fallbackLocal = () => {
      const savedProducts = localStorage.getItem('pos_products');
      if (savedProducts) setProductCatalog(JSON.parse(savedProducts));
      const savedOrders = localStorage.getItem('pos_orders');
      if (savedOrders) setOrders(JSON.parse(savedOrders));
      const savedRestocks = localStorage.getItem('pos_restocks');
      if (savedRestocks) setRestocks(JSON.parse(savedRestocks));
      const savedExpenses = localStorage.getItem('pos_expenses');
      if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
      const savedInventory = localStorage.getItem('pos_inventory');
      if (savedInventory) setInventoryItems(JSON.parse(savedInventory));
      const savedInvTransactions = localStorage.getItem('pos_inv_transactions');
      if (savedInvTransactions) setInventoryTransactions(JSON.parse(savedInvTransactions));
    };

    loadInitialData();

    // Realtime polling
    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch('https://xigasive.pythonanywhere.com/sync');
        const data = await res.json();
        const serverHash = JSON.stringify(data);
        
        if (serverHash !== lastSyncedHashRef.current && data.products) {
          if (isEditingRef.current) return;
          skipNextSyncRef.current = true;
          setProductCatalog(data.products);
          setOrders(data.orders || []);
          setRestocks(data.restocks || []);
          setExpenses(data.expenses || []);
          setInventoryItems(data.inventoryItems || []);
          setInventoryTransactions(data.inventoryTransactions || []);
          setLastSyncedHash(serverHash);
        }
      } catch (err) {
        // Silent fail
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }, []);

  useEffect(() => {
    if (!isDataLoaded) return;
    
    // Save to local storage for offline fallback
    localStorage.setItem('pos_products', JSON.stringify(productCatalog));
    localStorage.setItem('pos_orders', JSON.stringify(orders));
    localStorage.setItem('pos_restocks', JSON.stringify(restocks));
    localStorage.setItem('pos_expenses', JSON.stringify(expenses));
    localStorage.setItem('pos_inventory', JSON.stringify(inventoryItems));
    localStorage.setItem('pos_inv_transactions', JSON.stringify(inventoryTransactions));

    const currentData = { products: productCatalog, orders: orders, restocks: restocks, expenses: expenses, inventoryItems, inventoryTransactions };
    const currentHash = JSON.stringify(currentData);

    if (skipNextSyncRef.current) {
      skipNextSyncRef.current = false;
      return;
    }

    // Only POST if there's a real local change
    if (currentHash !== lastSyncedHash && lastSyncedHash !== '') {
      const syncTimeout = setTimeout(() => {
        fetch('https://xigasive.pythonanywhere.com/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: currentHash
        })
        .then(() => setLastSyncedHash(currentHash))
        .catch(() => {}); // Silent fail
      }, 1000);

      return () => clearTimeout(syncTimeout);
    }
  }, [productCatalog, orders, restocks, expenses, inventoryItems, inventoryTransactions, isDataLoaded, lastSyncedHash]);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('ทั้งหมด');

  const categories = ['ทั้งหมด', ...Array.from(new Set(productCatalog.map(p => p.category)))];

  const filteredProducts = productCatalog.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'ทั้งหมด' || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product: Product) => {
    sounds.add();
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
    if (delta > 0) sounds.add(); else if (delta < 0) sounds.remove();
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

  const clearCart = () => {
    sounds.error();
    setCart([]);
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal; // Removed tax
  const totalCost = cart.reduce((sum, item) => sum + item.cost * (item.quantity + (item.freeQuantity || 0)), 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity + (item.freeQuantity || 0), 0);

  const handleCheckout = async () => {
    sounds.cash();
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
        id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
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
  };

  const handleEditOrder = (order: Order) => {
    sounds.click();
    setCart(order.items);
    setEditingOrderId(order.id);
    setActiveView('pos');
  };

  const processingOrdersRef = useRef<Set<string>>(new Set());

  const handleDeleteOrder = (orderId: string) => {
    if (processingOrdersRef.current.has(orderId)) return;
    if (!confirm('ยืนยันการยกเลิกรายการนี้และคืนสต็อกสินค้า?')) return;
    sounds.error();
    
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
  };

  const CartContent = () => (
    <>
      <div className="px-8 pt-8 pb-6 flex items-center justify-between">
        <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          ตะกร้าสินค้า 
          <span className="text-sm font-normal text-slate-500">
            {editingOrderId ? `(${editingOrderId})` : '#NEW'}
          </span>
        </h2>
        <div className="flex items-center gap-2">
          {editingOrderId && (
            <button onClick={() => { setEditingOrderId(null); clearCart(); }} className="text-xs font-semibold text-slate-500 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors">
              ยกเลิกแก้ไข
            </button>
          )}
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-slate-50"
              title="ล้างตะกร้า"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 space-y-4">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <ShoppingCart size={48} className="mb-4 opacity-20" />
            <p>ไม่มีสินค้าในตะกร้า</p>
          </div>
        ) : (
          cart.map((item) => (
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
        )}
      </div>

      <div className="p-8 mt-auto">
        <div className="border-t border-dashed border-slate-200 pt-6 flex flex-col gap-3">
          <div className="flex justify-between text-xl font-extrabold text-slate-900 mt-2">
            <span>ยอดชำระสุทธิ</span>
            <span>฿{total.toFixed(2)}</span>
          </div>
        </div>
        <button
          onClick={() => {
            if (editingOrderId) {
              const oldOrder = orders.find(o => o.id === editingOrderId);
              setCheckoutCustomerName(oldOrder?.customerName || '');
            } else {
              setCheckoutCustomerName('');
            }
            sounds.click(); setIsCheckoutModalOpen(true);
          }}
          disabled={cart.length === 0}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-[18px] rounded-xl transition-colors mt-6 text-lg"
        >
          {editingOrderId ? 'อัปเดตคำสั่งซื้อ' : 'ชำระเงิน'}
        </button>
      </div>
    </>
  );

  const DashboardView = () => {
    const totalRevenue = orders.reduce((sum, o) => sum + o.subtotal, 0);
    const totalPurchases = restocks.reduce((sum, r) => sum + r.totalCost, 0);
    const totalExpenses = expenses.filter(e => e.type !== 'income').reduce((sum, e) => sum + e.amount, 0);
    const totalOtherIncome = expenses.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
    const netProfit = totalRevenue - orders.reduce((sum, o) => sum + o.totalCost, 0);
    const remainingBalance = totalRevenue - totalPurchases - totalExpenses + totalOtherIncome;

    const totalCashIncome = orders.filter(o => o.paymentMethod === 'cash' || !o.paymentMethod).reduce((sum, o) => sum + o.subtotal, 0) + expenses.filter(e => e.type === 'income' && (e.paymentMethod === 'cash' || !e.paymentMethod)).reduce((sum, e) => sum + e.amount, 0);
    const totalCashExpense = restocks.filter(r => (r.paymentMethod === 'cash' || !r.paymentMethod)).reduce((sum, r) => sum + r.totalCost, 0) + expenses.filter(e => e.type !== 'income' && (e.paymentMethod === 'cash' || !e.paymentMethod)).reduce((sum, e) => sum + e.amount, 0);
    const cashBalance = totalCashIncome - totalCashExpense;

    const totalTransferIncome = orders.filter(o => o.paymentMethod === 'transfer').reduce((sum, o) => sum + o.subtotal, 0) + expenses.filter(e => e.type === 'income' && e.paymentMethod === 'transfer').reduce((sum, e) => sum + e.amount, 0);
    const totalTransferExpense = restocks.filter(r => r.paymentMethod === 'transfer').reduce((sum, r) => sum + r.totalCost, 0) + expenses.filter(e => e.type !== 'income' && e.paymentMethod === 'transfer').reduce((sum, e) => sum + e.amount, 0);
    const transferBalance = totalTransferIncome - totalTransferExpense;

    const availableDates = Array.from(new Set(orders.map(o => new Date(o.timestamp).toLocaleDateString('en-CA')))).sort((a,b) => b.localeCompare(a));
    const defaultDate = dashboardDate || (availableDates.length > 0 ? availableDates[0] : '');
    const dailyOrders = defaultDate ? orders.filter(o => new Date(o.timestamp).toLocaleDateString('en-CA') === defaultDate) : orders;
    const dailyRevenue = dailyOrders.reduce((sum, o) => sum + o.subtotal, 0);
    const dailyProfit = dailyRevenue - dailyOrders.reduce((sum, o) => sum + o.totalCost, 0);
    const dailyCashRevenue = dailyOrders.filter(o => o.paymentMethod === 'cash' || !o.paymentMethod).reduce((sum, o) => sum + o.subtotal, 0);
    const dailyTransferRevenue = dailyOrders.filter(o => o.paymentMethod === 'transfer').reduce((sum, o) => sum + o.subtotal, 0);

    return (
      <div className="flex-1 p-6 md:p-8 overflow-y-auto pb-24 md:pb-8 bg-slate-50/50">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">ภาพรวมธุรกิจ</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-3xl text-white shadow-lg shadow-indigo-200">
            <h3 className="text-indigo-100 font-medium mb-1 flex items-center gap-2"><TrendingUp size={18} /> ยอดเงินคงเหลือรวม</h3>
            <p className="text-4xl font-extrabold mb-4">฿{remainingBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <div className="flex gap-2">
              <div className="bg-white/20 px-3 py-1.5 rounded-lg inline-flex flex-col backdrop-blur-sm flex-1">
                <span className="text-[10px] text-indigo-100 uppercase font-bold tracking-wider">เงินสด</span>
                <span className="text-sm font-semibold text-white">฿{cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="bg-white/20 px-3 py-1.5 rounded-lg inline-flex flex-col backdrop-blur-sm flex-1">
                <span className="text-[10px] text-indigo-100 uppercase font-bold tracking-wider">บัญชี/โอน</span>
                <span className="text-sm font-semibold text-white">฿{transferBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5">
              <ShoppingBag size={100} />
            </div>
            <div className="flex justify-between items-start mb-2 relative z-10">
              <h3 className="text-slate-500 font-medium">ยอดขายรายวัน</h3>
              {availableDates.length > 0 && (
                <select 
                  value={defaultDate} 
                  onChange={e => { sounds.click(); setDashboardDate(e.target.value); }}
                  className="bg-slate-50 border border-slate-200 rounded-lg text-xs p-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700"
                >
                  {availableDates.map(d => (
                    <option key={d} value={d}>{new Date(d).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}</option>
                  ))}
                </select>
              )}
            </div>
            <p className="text-3xl font-extrabold text-slate-900 relative z-10 mb-3">฿{dailyRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            
            <div className="flex gap-2 mb-3 relative z-10">
              <div className="bg-emerald-50 px-2 py-1 rounded-md flex-1">
                <div className="text-[10px] text-emerald-600 font-bold">เงินสด</div>
                <div className="text-xs font-bold text-emerald-700">฿{dailyCashRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>
              <div className="bg-sky-50 px-2 py-1 rounded-md flex-1">
                <div className="text-[10px] text-sky-600 font-bold">โอนเงิน</div>
                <div className="text-xs font-bold text-sky-700">฿{dailyTransferRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>
            </div>

            <p className="text-sm text-green-600 font-semibold mt-1 flex items-center gap-1 relative z-10">กำไรประเมิน ฿{dailyProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p className="text-xs text-slate-400 mt-1 relative z-10">จำนวน {dailyOrders.length} ออเดอร์</p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="bg-orange-50 p-4 rounded-3xl border border-orange-100 flex items-center justify-between">
              <div>
                <h3 className="text-orange-800 font-medium mb-1 text-xs">ซื้อเข้าสต็อก</h3>
                <p className="text-xl font-extrabold text-orange-900">฿{totalPurchases.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 shrink-0">
                <Package size={20} />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="bg-green-50 p-4 rounded-3xl border border-green-100 flex items-center justify-between flex-1">
                <div>
                  <h3 className="text-green-800 font-medium mb-1 text-xs">รายรับอื่นๆ</h3>
                  <p className="text-lg font-extrabold text-green-900">฿{totalOtherIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
              </div>
              <div className="bg-red-50 p-4 rounded-3xl border border-red-100 flex items-center justify-between flex-1">
                <div>
                  <h3 className="text-red-800 font-medium mb-1 text-xs">ค่าใช้จ่ายอื่นๆ</h3>
                  <p className="text-lg font-extrabold text-red-900">฿{totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm lg:col-span-2">
            <h3 className="text-lg font-bold text-slate-900 mb-4">ยอดขายรวมทั้งหมดสะสม</h3>
            <p className="text-4xl font-extrabold text-slate-900 mb-4">฿{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <div className="flex gap-4 mb-6">
              <div className="bg-emerald-50 px-4 py-2 rounded-xl flex-1 border border-emerald-100">
                <p className="text-xs text-emerald-800 font-semibold flex items-center gap-1"><TrendingUp size={14}/> กำไรสุทธิทั้งหมด</p>
                <p className="text-lg font-bold text-emerald-700">฿{netProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
              <div className="bg-rose-50 px-4 py-2 rounded-xl flex-1 border border-rose-100">
                <p className="text-xs text-rose-800 font-semibold flex items-center gap-1"><TrendingDown size={14}/> ต้นทุนสินค้าที่ขายไป</p>
                <p className="text-lg font-bold text-rose-700">฿{(totalRevenue - netProfit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const RestockView = () => {
    const handleSelectProduct = (id: string) => {
      setSelectedProductId(id);
      const product = productCatalog.find(p => p.id === id);
      if (product) setUnitCost(product.cost);
    };

    const dates = Array.from(new Set(restocks.map(r => new Date(r.timestamp).toLocaleDateString('en-CA')))).sort((a,b) => b.localeCompare(a));
    const filteredRestocks = restockDate ? restocks.filter(r => new Date(r.timestamp).toLocaleDateString('en-CA') === restockDate) : restocks;

    const handleSaveRestock = () => {
      sounds.success();
      const product = productCatalog.find(p => p.id === selectedProductId);
      const masterItem = inventoryItems.find(i => i.id === restockMasterItemId);
      
      if (!product || qty <= 0) return;

      let finalTotalCost = 0;
      let finalUnitCost = unitCost;

      if (restockMasterItemId && masterItem) {
        finalTotalCost = masterItem.unitCost * bulkQty;
        finalUnitCost = qty > 0 ? Number((finalTotalCost / qty).toFixed(2)) : 0;
      } else {
        if (unitCost < 0) return;
        finalTotalCost = bulkQty > 0 && bulkCost >= 0 ? bulkQty * bulkCost : qty * unitCost;
        finalUnitCost = qty > 0 ? Number((finalTotalCost / qty).toFixed(2)) : unitCost;
      }

      if (editingRestockId) {
        const oldRestock = restocks.find(r => r.id === editingRestockId);
        if (oldRestock) {
          setProductCatalog(prev => prev.map(p => {
            if (p.id === oldRestock.productId && p.id === selectedProductId) {
              return { ...p, stock: p.stock - oldRestock.quantity + qty, cost: finalUnitCost };
            }
            if (p.id === oldRestock.productId) {
              return { ...p, stock: p.stock - oldRestock.quantity };
            }
            if (p.id === selectedProductId) {
              return { ...p, stock: p.stock + qty, cost: finalUnitCost };
            }
            return p;
          }));
          setRestocks(prev => prev.map(r => r.id === editingRestockId ? {
            ...r,
            productId: selectedProductId,
            productName: product.name,
            quantity: qty,
            unitCost: finalUnitCost,
            totalCost: finalTotalCost,
            bulkUnit,
            bulkQty,
            bulkCost: restockMasterItemId ? 0 : bulkCost,
            paymentMethod: restockPaymentMethod,
            masterItemId: restockMasterItemId || undefined
          } : r));
        }
        setEditingRestockId(null);
      } else {
        if (restockMasterItemId && masterItem) {
          if (masterItem.stock < bulkQty) {
            alert('จำนวนในคลังหลักไม่เพียงพอ!');
            return;
          }
          setInventoryItems(prev => prev.map(i => i.id === masterItem.id ? { ...i, stock: i.stock - bulkQty } : i));
          setInventoryTransactions(prev => [...prev, {
            id: Date.now().toString() + '-out',
            itemId: masterItem.id,
            itemName: masterItem.name,
            type: 'out',
            quantity: bulkQty,
            unitCost: masterItem.unitCost,
            totalCost: finalTotalCost,
            timestamp: new Date().toISOString(),
            note: `แปลงสต็อกเข้าหน้าร้าน: ${product.name}`
          }]);
        }
        
        const newRestock: RestockRecord = {
          id: `RST-${Math.floor(1000 + Math.random() * 9000)}`,
          productId: selectedProductId,
          productName: product.name,
          quantity: qty,
          unitCost: finalUnitCost,
          totalCost: finalTotalCost,
          timestamp: new Date().toISOString(),
          bulkUnit: restockMasterItemId ? (masterItem?.unit || 'หน่วย') : bulkUnit,
          bulkQty,
          bulkCost: restockMasterItemId ? (masterItem?.unitCost || 0) : bulkCost,
          paymentMethod: restockPaymentMethod,
          masterItemId: restockMasterItemId || undefined
        };
        setRestocks(prev => [newRestock, ...prev]);
        setProductCatalog(prev => prev.map(p => p.id === selectedProductId ? { ...p, stock: p.stock + qty, cost: finalUnitCost } : p));
      }
      setSelectedProductId('');
      setBulkUnit('แพ็ค');
      setBulkQty(1);
      setBulkCost(0);
      setQty(0);
      setUnitCost(0);
      setRestockMasterItemId('');
      setRestockPaymentMethod('cash');
    };

    const handleEdit = (r: RestockRecord) => {
      setEditingRestockId(r.id);
      setSelectedProductId(r.productId);
      setBulkUnit(r.bulkUnit || 'แพ็ค');
      setBulkQty(r.bulkQty || 1);
      setBulkCost(r.bulkCost || 0);
      setQty(r.quantity);
      setUnitCost(r.unitCost);
      setRestockPaymentMethod(r.paymentMethod || 'cash');
      setRestockMasterItemId(r.masterItemId || '');
    };

    const handleDelete = (r: RestockRecord) => {
      if (!confirm('ยืนยันการลบรายการนำเข้านี้?')) return;
      sounds.error();
      setRestocks(prev => prev.filter(item => item.id !== r.id));
      setProductCatalog(prev => prev.map(p => p.id === r.productId ? { ...p, stock: p.stock - r.quantity } : p));
      
      if (r.masterItemId && r.bulkQty) {
        setInventoryItems(prev => prev.map(i => i.id === r.masterItemId ? { ...i, stock: i.stock + r.bulkQty! } : i));
        setInventoryTransactions(prev => [...prev, {
            id: Date.now().toString() + '-in-refund',
            itemId: r.masterItemId!,
            itemName: r.productName,
            type: 'in',
            quantity: r.bulkQty!,
            unitCost: r.bulkCost || 0,
            totalCost: (r.bulkCost || 0) * r.bulkQty!,
            timestamp: new Date().toISOString(),
            note: `คืนสต็อกจากการลบรายการนำเข้าหน้าร้าน: ${r.productName}`
        }]);
      }
      if (editingRestockId === r.id) {
        setEditingRestockId(null);
        setSelectedProductId('');
        setBulkUnit('แพ็ค');
        setBulkQty(1);
        setBulkCost(0);
        setQty(0);
        setUnitCost(0);
        setRestockMasterItemId('');
        setRestockPaymentMethod('cash');
      }
    };

    return (
      <div className="flex-1 p-6 md:p-8 overflow-y-auto pb-24 md:pb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">เพิ่มสต็อกสินค้า</h1>
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-4">{editingRestockId ? 'แก้ไขประวัติสต็อก' : 'นำเข้าสต็อกใหม่'}</h2>
          <div className="flex flex-col sm:flex-row gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
              <input type="radio" name="restockSource" checked={!restockMasterItemId} onChange={() => setRestockMasterItemId('')} className="accent-indigo-600" />
              ซื้อเข้ามาใหม่ (เพิ่มสต็อกหน้าร้าน)
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
              <input type="radio" name="restockSource" checked={!!restockMasterItemId} onChange={() => {
                if (inventoryItems.length > 0) {
                  setRestockMasterItemId(inventoryItems[0].id);
                  const master = inventoryItems[0];
                  const prod = productCatalog.find(p => p.sku === master.sku || p.name === master.name);
                  if (prod) { setSelectedProductId(prod.id); } else { setSelectedProductId(""); }
                }
              }} className="accent-indigo-600" disabled={inventoryItems.length === 0} />
              แบ่งจากคลังหลัก (แปลงเข้าหน้าร้าน)
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {!restockMasterItemId ? (
              <>
                <label className="flex flex-col text-sm font-semibold text-slate-500 md:col-span-2 lg:col-span-3">
                  เลือกสินค้าที่ต้องการเพิ่มสต็อก
                  <select 
                    className="mt-1 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-900 bg-white" 
                    value={selectedProductId} 
                    onChange={e => handleSelectProduct(e.target.value)}
                  >
                    <option value="">-- เลือกสินค้าหน้าร้าน --</option>
                    {productCatalog.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col text-sm font-semibold text-slate-500">
                  หน่วยนำเข้า
                  <select 
                    className="mt-1 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-900 bg-white"
                    value={bulkUnit}
                    onChange={e => setBulkUnit(e.target.value)}
                  >
                    <option value="แพ็ค">แพ็ค</option>
                    <option value="กิโลกรัม">กิโลกรัม</option>
                    <option value="ลัง">ลัง</option>
                    <option value="อื่นๆ">อื่นๆ</option>
                  </select>
                </label>
                <label className="flex flex-col text-sm font-semibold text-slate-500">
                  จำนวนนำเข้า ({bulkUnit})
                  <div className="flex mt-1 border border-slate-200 rounded-lg bg-white overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500">
                    <button type="button" onClick={() => setBulkQty(Math.max(1, (bulkQty || 0) - 1))} className="px-4 bg-slate-50 border-r border-slate-200 hover:bg-slate-100 text-slate-600 flex items-center justify-center"><Minus size={16} /></button>
                    <input type="number" min="1" className="w-full p-2.5 text-sm text-slate-900 text-center outline-none" value={bulkQty || ''} onChange={e => setBulkQty(parseFloat(e.target.value) || 0)} />
                    <button type="button" onClick={() => setBulkQty((bulkQty || 0) + 1)} className="px-4 bg-slate-50 border-l border-slate-200 hover:bg-slate-100 text-slate-600 flex items-center justify-center"><Plus size={16} /></button>
                  </div>
                </label>
                <label className="flex flex-col text-sm font-semibold text-slate-500">
                  ต้นทุนต่อ 1 {bulkUnit} (฿)
                  <div className="flex mt-1 border border-slate-200 rounded-lg bg-white overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500">
                    <button type="button" onClick={() => setBulkCost(Math.max(0, (bulkCost || 0) - 10))} className="px-4 bg-slate-50 border-r border-slate-200 hover:bg-slate-100 text-slate-600 flex items-center justify-center"><Minus size={16} /></button>
                    <input type="number" step="0.01" min="0" className="w-full p-2.5 text-sm text-slate-900 text-center outline-none" value={bulkCost || ''} onChange={e => setBulkCost(parseFloat(e.target.value) || 0)} />
                    <button type="button" onClick={() => setBulkCost((bulkCost || 0) + 10)} className="px-4 bg-slate-50 border-l border-slate-200 hover:bg-slate-100 text-slate-600 flex items-center justify-center"><Plus size={16} /></button>
                  </div>
                </label>
              </>
            ) : (
              <>
                <label className="flex flex-col text-sm font-semibold text-slate-500 md:col-span-2">
                  หักจากคลังหลัก
                  <select 
                    className="mt-1 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-900 bg-white"
                    value={restockMasterItemId}
                    onChange={e => {
                      setRestockMasterItemId(e.target.value);
                      const master = inventoryItems.find(i => i.id === e.target.value);
                      if (master) {
                        const prod = productCatalog.find(p => p.sku === master.sku || p.name === master.name);
                        if (prod) { setSelectedProductId(prod.id); } else { setSelectedProductId(""); }
                      }
                    }}
                  >
                    <option value="">-- เลือกคลังหลัก --</option>
                    {inventoryItems.map(i => (
                      <option key={i.id} value={i.id}>{i.name} (คงเหลือ: {i.stock} {i.unit})</option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col text-sm font-semibold text-slate-500">
                  จำนวนที่แบ่ง ({inventoryItems.find(i => i.id === restockMasterItemId)?.unit || 'หน่วย'})
                  <div className="flex mt-1 border border-slate-200 rounded-lg bg-white overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500">
                    <button type="button" onClick={() => setBulkQty(Math.max(1, (bulkQty || 0) - 1))} className="px-4 bg-slate-50 border-r border-slate-200 hover:bg-slate-100 text-slate-600 flex items-center justify-center"><Minus size={16} /></button>
                    <input type="number" min="1" className="w-full p-2.5 text-sm text-slate-900 text-center outline-none" value={bulkQty || ''} onChange={e => setBulkQty(parseFloat(e.target.value) || 0)} />
                    <button type="button" onClick={() => setBulkQty((bulkQty || 0) + 1)} className="px-4 bg-slate-50 border-l border-slate-200 hover:bg-slate-100 text-slate-600 flex items-center justify-center"><Plus size={16} /></button>
                  </div>
                </label>
                {inventoryItems.find(i => i.id === restockMasterItemId) && <div className="text-sm font-semibold text-indigo-600 bg-indigo-50 p-2.5 rounded-lg border border-indigo-100 flex items-center gap-2 mt-1"><CheckCircle2 size={16} /> ใช้ทุนจากคลังหลัก (฿{inventoryItems.find(i => i.id === restockMasterItemId)?.unitCost.toFixed(2)}/{inventoryItems.find(i => i.id === restockMasterItemId)?.unit})</div>}
                {selectedProductId ? (
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
                )}
              </>
            )}
            
            <label className="flex flex-col text-sm font-semibold text-slate-500">
              แปลงเป็นจำนวนที่ขายได้ (ชิ้น)
              <div className="flex mt-1 border border-slate-200 rounded-lg bg-white overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500">
                <button type="button" onClick={() => setQty(Math.max(1, (qty || 0) - 1))} className="px-4 bg-slate-50 border-r border-slate-200 hover:bg-slate-100 text-slate-600 flex items-center justify-center"><Minus size={16} /></button>
                <input type="number" min="1" className="w-full p-2.5 text-sm text-slate-900 text-center outline-none" value={qty || ''} onChange={e => setQty(parseInt(e.target.value) || 0)} />
                <button type="button" onClick={() => setQty((qty || 0) + 1)} className="px-4 bg-slate-50 border-l border-slate-200 hover:bg-slate-100 text-slate-600 flex items-center justify-center"><Plus size={16} /></button>
              </div>
            </label>
            
            {!restockMasterItemId && (
              <label className="flex flex-col text-sm font-semibold text-slate-500">
                ต้นทุนต่อชิ้น (฿)
                <div className="flex mt-1 border border-slate-200 rounded-lg bg-slate-50 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500">
                  <button type="button" onClick={() => setUnitCost(Math.max(0, (unitCost || 0) - 1))} className="px-4 bg-slate-100 border-r border-slate-200 hover:bg-slate-200 text-slate-600 flex items-center justify-center"><Minus size={16} /></button>
                  <input type="number" step="0.01" min="0" className="w-full p-2.5 text-sm text-slate-900 text-center outline-none bg-transparent" value={(qty > 0 && bulkCost > 0) ? (bulkCost * bulkQty / qty).toFixed(2) : (unitCost || '')} onChange={e => setUnitCost(parseFloat(e.target.value) || 0)} />
                  <button type="button" onClick={() => setUnitCost((unitCost || 0) + 1)} className="px-4 bg-slate-100 border-l border-slate-200 hover:bg-slate-200 text-slate-600 flex items-center justify-center"><Plus size={16} /></button>
                </div>
                {qty > 0 && bulkCost > 0 && <span className="text-xs text-indigo-500 mt-1">* คำนวณอัตโนมัติจากจำนวนนำเข้า</span>}
              </label>
            )}

            {!restockMasterItemId && (<label className="flex flex-col text-sm font-semibold text-slate-500">วิธีการชำระเงิน
                <div className="flex mt-1 bg-slate-100 p-1 rounded-lg">
                  <button onClick={() => setRestockPaymentMethod('cash')} className={`flex-1 text-xs font-bold py-2 rounded-md transition-all ${restockPaymentMethod === 'cash' ? 'bg-white text-green-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>เงินสด</button>
                  <button onClick={() => setRestockPaymentMethod('transfer')} className={`flex-1 text-xs font-bold py-2 rounded-md transition-all ${restockPaymentMethod === 'transfer' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>โอนเงิน</button>
                </div>
              </label>
            )}

            <div className="flex gap-2 items-end pt-2 lg:pt-0 md:col-span-2 lg:col-span-3 lg:justify-end">
              {editingRestockId && (
                <button onClick={() => { setEditingRestockId(null); setSelectedProductId(''); setBulkUnit('แพ็ค'); setBulkQty(1); setBulkCost(0); setQty(0); setUnitCost(0); setRestockPaymentMethod('cash'); setRestockMasterItemId(''); }} className="px-6 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2.5 rounded-lg transition-colors">
                  ยกเลิก
                </button>
              )}
              <button onClick={handleSaveRestock} disabled={!selectedProductId || qty <= 0} className="px-8 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-lg transition-colors shadow-sm">
                <Plus size={18} /> {editingRestockId ? 'อัปเดต' : (restockMasterItemId ? 'เพิ่มสต็อก' : 'นำเข้าสต็อกใหม่')}
              </button>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <h2 className="text-xl font-bold text-slate-900">ประวัติการนำเข้า</h2>
            {dates.length > 0 && (
              <select 
                value={restockDate} 
                onChange={e => setRestockDate(e.target.value)}
                className="border border-slate-200 rounded-xl p-2.5 text-sm text-slate-900 bg-white min-w-[150px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">เลือกวันที่ (ทั้งหมด)</option>
                {dates.map(d => (
                  <option key={d} value={d}>{new Date(d).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}</option>
                ))}
              </select>
            )}
          </div>
          {filteredRestocks.length === 0 ? (
            <div className="text-slate-500 text-center py-8">ไม่มีประวัติการเพิ่มสต็อกในวันที่เลือก</div>
          ) : (
            filteredRestocks.map(r => (
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
                    <span className={`font-semibold ${r.paymentMethod === 'transfer' ? 'text-blue-600' : 'text-green-600'}`}>
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
              onChange={e => { sounds.click(); setHistoryDate(e.target.value); }}
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
              <div key={order.id} className={`p-6 rounded-2xl border flex flex-col md:flex-row justify-between gap-4 md:items-center transition-all ${borderClass} ${!order.paymentMethod ? 'bg-white' : ''}`}>
                <div>
                  <div className="flex items-center flex-wrap gap-3 mb-1">
                    <h3 className="font-bold text-lg text-slate-900">{order.id}</h3>
                    {order.customerName && (
                      <span className="text-sm font-medium px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 flex items-center gap-1">
                        <User size={14} /> {order.customerName}
                      </span>
                    )}
                    <span className={`text-sm font-medium px-2 py-0.5 rounded-md ${badgeClass}`}>
                      {new Date(order.timestamp).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                    {order.paymentMethod ? (
                      <span className={`text-xs font-bold px-2 py-1 rounded-md ${order.paymentMethod === 'cash' ? 'bg-emerald-100 text-emerald-700' : 'bg-sky-100 text-sky-700'}`}>
                        ✓ {order.paymentMethod === 'cash' ? 'ชำระด้วยเงินสด' : 'ชำระด้วยการโอนเงิน'}
                      </span>
                    ) : (
                      <span className="text-xs font-bold px-2 py-1 rounded-md bg-amber-100 text-amber-700 animate-pulse">
                        ⚠️ รอตรวจสอบการชำระเงิน
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-slate-600 mt-2">
                    {order.items.map(i => (
                      <span key={i.id} className="inline-block mr-3 bg-white border border-slate-200 px-2 py-1 rounded text-xs">
                        {i.name} <span className="font-semibold text-slate-400">x{i.quantity}</span>
                        {i.freeQuantity ? <span className="text-orange-500 font-semibold ml-1">(แถม {i.freeQuantity})</span> : null}
                      </span>
                    ))}
                  </div>
                  {!order.paymentMethod ? (
                    <div className="mt-4 flex gap-2 items-center bg-amber-50 p-2 rounded-xl inline-flex border border-amber-100">
                      <span className="text-sm text-amber-800 font-bold mr-1">ยืนยันรับเงิน:</span>
                      <button onClick={() => { sounds.cash(); handleUpdatePayment(order.id, 'cash'); }} className="text-xs font-bold bg-white text-emerald-700 border-2 border-emerald-500 hover:bg-emerald-50 px-4 py-2 rounded-lg transition-all shadow-sm active:scale-95">💵 รับเงินสด</button>
                      <button onClick={() => { sounds.cash(); handleUpdatePayment(order.id, 'transfer'); }} className="text-xs font-bold bg-white text-sky-700 border-2 border-sky-500 hover:bg-sky-50 px-4 py-2 rounded-lg transition-all shadow-sm active:scale-95">📱 โอนเข้าบัญชี</button>
                    </div>
                  ) : (
                    <div className="mt-3">
                      <button onClick={() => { sounds.click(); handleClearPayment(order.id); }} className="text-xs font-semibold text-slate-400 hover:text-slate-600 underline">แก้ไขวิธีการชำระเงิน</button>
                    </div>
                  )}
                </div>
                <div className="flex flex-row md:flex-col justify-between items-center md:items-end gap-3 shrink-0">
                  <div className="flex flex-col items-end">
                    <span className={`font-extrabold text-2xl ${!order.paymentMethod ? 'text-amber-600' : 'text-slate-900'}`}>฿{order.total.toFixed(2)}</span>
                    <div className="flex items-center gap-2.5 mt-1.5 text-xs font-semibold bg-white/50 px-2 py-1 rounded-lg border border-slate-100">
                      <span className="flex items-center gap-1 text-slate-600">
                        <Package size={12} /> {order.items.reduce((sum, i) => sum + i.quantity + (i.freeQuantity || 0), 0)} ชิ้น
                      </span>
                      <span className="flex items-center gap-1 text-rose-500">
                        <TrendingDown size={12} /> ทุน ฿{order.totalCost.toFixed(2)}
                      </span>
                      <span className="flex items-center gap-1 text-emerald-600">
                        <TrendingUp size={12} /> กำไร ฿{(order.total - order.totalCost).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEditOrder(order)} className="flex items-center gap-1 text-sm font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-xl transition-colors border border-indigo-100 bg-white">
                      <Edit size={16} /> แก้ไข
                    </button>
                    <button onClick={() => handleDeleteOrder(order.id)} className="flex items-center gap-1 text-sm font-bold text-red-600 hover:bg-red-50 px-3 py-2 rounded-xl transition-colors border border-red-100 bg-white">
                      <Trash2 size={16} /> ลบ
                    </button>
                  </div>
                </div>
              </div>
            )})}
          </div>
        )}
      </div>
    );
  };

  const ExpensesView = () => {
    const dates = Array.from(new Set(expenses.map(e => new Date(e.timestamp).toLocaleDateString('en-CA')))).sort((a,b) => b.localeCompare(a));
    const filteredExpenses = expenseDate ? expenses.filter(e => new Date(e.timestamp).toLocaleDateString('en-CA') === expenseDate) : expenses;

    const handleSaveExpense = () => {
      if (amount <= 0 || !note.trim()) return;
      sounds.success();

      if (editingExpenseId) {
        setExpenses(prev => prev.map(e => e.id === editingExpenseId ? {
          ...e,
          amount,
          note,
          type: expenseType,
          paymentMethod: expensePaymentMethod
        } : e));
        setEditingExpenseId(null);
      } else {
        const newExpense: ExpenseRecord = {
          id: `TRN-${Math.floor(1000 + Math.random() * 9000)}`,
          amount,
          note,
          type: expenseType,
          timestamp: new Date().toISOString(),
          paymentMethod: expensePaymentMethod
        };
        setExpenses(prev => [newExpense, ...prev]);
      }
      setAmount(0);
      setNote('');
      setExpenseType('expense');
      setExpensePaymentMethod('cash');
    };

    const handleEdit = (e: ExpenseRecord) => {
      setEditingExpenseId(e.id);
      setAmount(e.amount);
      setNote(e.note);
      setExpenseType(e.type || 'expense');
      setExpensePaymentMethod(e.paymentMethod || 'cash');
    };

    const handleDelete = (id: string) => {
      setExpenses(prev => prev.filter(item => item.id !== id));
      if (editingExpenseId === id) {
        setEditingExpenseId(null);
        setAmount(0);
        setNote('');
        setExpenseType('expense');
        setExpensePaymentMethod('cash');
      }
    };

    return (
      <div className="flex-1 p-6 md:p-8 overflow-y-auto pb-24 md:pb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">จัดการรายรับ-รายจ่าย</h1>
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-4">{editingExpenseId ? 'แก้ไขรายการ' : 'เพิ่มรายการใหม่'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
            <label className="flex flex-col text-sm font-semibold text-slate-500">
              ประเภท
              <select 
                className="mt-1 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-900 bg-white" 
                value={expenseType} 
                onChange={e => setExpenseType(e.target.value as 'income' | 'expense')}
              >
                <option value="income">รายรับ</option>
                <option value="expense">รายจ่าย</option>
              </select>
            </label>
            <label className="flex flex-col text-sm font-semibold text-slate-500 md:col-span-2">
              หมายเหตุ (ใช้ไปกับอะไร)
              <input type="text" className="mt-1 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-900" placeholder="เช่น ค่าไฟ, ค่าน้ำ, ค่าจ้าง..." value={note} onChange={e => setNote(e.target.value)} />
            </label>
            <label className="flex flex-col text-sm font-semibold text-slate-500">
              จำนวนเงิน (฿)
              <div className="flex mt-1 border border-slate-200 rounded-lg bg-white overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500">
                <button type="button" onClick={() => setAmount(Math.max(0, (amount || 0) - 10))} className="px-3 bg-slate-50 border-r border-slate-200 hover:bg-slate-100 text-slate-600 flex items-center justify-center"><Minus size={16} /></button>
                <input type="number" step="0.01" min="0" className="w-full p-2.5 text-sm text-slate-900 text-center outline-none" value={amount || ''} onChange={e => setAmount(parseFloat(e.target.value) || 0)} />
                <button type="button" onClick={() => setAmount((amount || 0) + 10)} className="px-3 bg-slate-50 border-l border-slate-200 hover:bg-slate-100 text-slate-600 flex items-center justify-center"><Plus size={16} /></button>
              </div>
            </label>
            <label className="flex flex-col text-sm font-semibold text-slate-500">
              ช่องทาง
              <div className="flex mt-1 bg-slate-100 p-1 rounded-lg">
                <button onClick={() => setExpensePaymentMethod('cash')} className={`flex-1 text-xs font-bold py-2 rounded-md transition-all ${expensePaymentMethod === 'cash' ? 'bg-white text-green-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>เงินสด</button>
                <button onClick={() => setExpensePaymentMethod('transfer')} className={`flex-1 text-xs font-bold py-2 rounded-md transition-all ${expensePaymentMethod === 'transfer' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>โอนเงิน</button>
              </div>
            </label>
            <div className="flex gap-2 lg:col-span-1">
              {editingExpenseId && (
                <button onClick={() => { setEditingExpenseId(null); setAmount(0); setNote(''); setExpensePaymentMethod('cash'); }} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2.5 rounded-lg transition-colors">
                  ยกเลิก
                </button>
              )}
              <button onClick={handleSaveExpense} disabled={amount <= 0 || !note.trim()} className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-lg transition-colors">
                <Plus size={18} /> {editingExpenseId ? 'อัปเดต' : 'บันทึก'}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <h2 className="text-xl font-bold text-slate-900">ประวัติรายการ</h2>
            {dates.length > 0 && (
              <select 
                value={expenseDate} 
                onChange={e => setExpenseDate(e.target.value)}
                className="border border-slate-200 rounded-xl p-2.5 text-sm text-slate-900 bg-white min-w-[150px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">เลือกวันที่ (ทั้งหมด)</option>
                {dates.map(d => (
                  <option key={d} value={d}>{new Date(d).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}</option>
                ))}
              </select>
            )}
          </div>
          {filteredExpenses.length === 0 ? (
            <div className="text-slate-500 text-center py-8">ไม่มีประวัติรายการในวันที่เลือก</div>
          ) : (
            filteredExpenses.map(e => (
              <div key={e.id} className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col md:flex-row justify-between gap-4 md:items-center shadow-sm">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <div className={`p-1.5 rounded-lg ${e.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      {e.type === 'income' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    </div>
                    <h3 className="font-bold text-lg text-slate-900">{e.note}</h3>
                    <span className="text-sm font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      {new Date(e.timestamp).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                    {e.paymentMethod && (
                      <span className={`text-xs font-bold px-2 py-1 rounded-md ${e.paymentMethod === 'cash' ? 'bg-emerald-100 text-emerald-700' : 'bg-sky-100 text-sky-700'}`}>
                        {e.paymentMethod === 'cash' ? 'เงินสด' : 'โอนเงิน'}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-slate-500 mt-2">
                    รหัสรายการ: {e.id} &bull; {e.type === 'income' ? 'รายรับ' : 'รายจ่าย'}
                  </div>
                </div>
                <div className="flex flex-row md:flex-col justify-between items-center md:items-end gap-3 shrink-0">
                  <span className={`font-extrabold text-2xl ${e.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {e.type === 'income' ? '+' : '-'}฿{e.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(e)} className="flex items-center gap-1 text-sm font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-xl transition-colors border border-indigo-100">
                      <Edit size={16} /> แก้ไข
                    </button>
                    <button onClick={() => handleDelete(e.id)} className="flex items-center gap-1 text-sm font-bold text-red-600 hover:bg-red-50 px-3 py-2 rounded-xl transition-colors border border-red-100">
                      <Trash2 size={16} /> ลบ
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const InventoryView = () => {
    const handleAddInv = () => {
      setInvForm({
        id: Date.now().toString(),
        sku: '',
        name: '',
        category: 'วัตถุดิบ',
        stock: 0,
        unit: 'แพ็ค',
        unitCost: 0,
      });
      setIsInvAdding(true);
      setEditingInventoryItem(null);
      setInvTab('items');
    };

    const handleEditInv = (item: InventoryItem) => {
      setEditingInventoryItem(item);
      setInvForm(item);
      setIsInvAdding(false);
      setInvTab('items');
    };

    const handleSaveInv = () => {
      if (!invForm || !invForm.name) return;
      if (isInvAdding) {
        setInventoryItems(prev => [...prev, invForm]);
        if (invForm.stock > 0) {
          setInventoryTransactions(prev => [...prev, {
            id: Date.now().toString() + '-in',
            itemId: invForm.id,
            itemName: invForm.name,
            type: 'in',
            quantity: invForm.stock,
            unitCost: invForm.unitCost,
            totalCost: invForm.stock * invForm.unitCost,
            timestamp: new Date().toISOString(),
            note: 'เพิ่มสินค้าเริ่มต้นในคลังหลัก'
          }]);
        }
      } else if (editingInventoryItem) {
        const diff = invForm.stock - editingInventoryItem.stock;
        setInventoryItems(prev => prev.map(i => i.id === editingInventoryItem.id ? invForm : i));
        
        if (diff !== 0) {
          setInventoryTransactions(prev => [...prev, {
            id: Date.now().toString() + (diff > 0 ? '-in' : '-out'),
            itemId: invForm.id,
            itemName: invForm.name,
            type: diff > 0 ? 'in' : 'out',
            quantity: Math.abs(diff),
            unitCost: invForm.unitCost,
            totalCost: Math.abs(diff) * invForm.unitCost,
            timestamp: new Date().toISOString(),
            note: 'ปรับปรุง/แก้ไขจำนวนคลังหลัก'
          }]);
        }
      }
      setIsInvAdding(false);
      setEditingInventoryItem(null);
      setInvForm(null);
    };

    const handleDeleteInv = (id: string) => {
      if (confirm('ยืนยันการลบสินค้าในคลังหลัก?')) {
        sounds.error();
        setInventoryItems(prev => prev.filter(i => i.id !== id));
      }
    };

    const invDates = Array.from(new Set(inventoryTransactions.map(t => new Date(t.timestamp).toLocaleDateString('en-CA')))).sort((a,b) => b.localeCompare(a));
    const filteredInvTrans = invTransDate ? inventoryTransactions.filter(t => new Date(t.timestamp).toLocaleDateString('en-CA') === invTransDate) : inventoryTransactions;

    const filteredItems = inventoryItems.filter(i => i.name.toLowerCase().includes(invSearchQuery.toLowerCase()) || i.sku.toLowerCase().includes(invSearchQuery.toLowerCase()));

    const InvFormRender = () => {
      if (!invForm) return null;
      return (
        <div className="bg-white p-6 rounded-2xl border border-indigo-200 shadow-xl shadow-indigo-100/50 mb-8 transform transition-all">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Package size={24} className="text-indigo-600" />
              {isInvAdding ? 'เพิ่มรายการคลังหลัก' : 'แก้ไขรายการคลังหลัก'}
            </h2>
            <button onClick={() => { setIsInvAdding(false); setEditingInventoryItem(null); setInvForm(null); }} className="text-slate-400 hover:text-slate-600 transition-colors p-1">
              <X size={24} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="md:col-span-2 lg:col-span-4 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
              <label className="text-sm font-semibold text-slate-600 mb-1.5 block">ดึงข้อมูลจากสินค้า (Auto-fill)</label>
              <select className="w-full border border-slate-200 rounded-lg p-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow" onChange={e => {
                const p = productCatalog.find(x => x.id === e.target.value);
                if (p) setInvForm({...invForm, name: p.name, sku: p.sku});
              }}>
                <option value="">-- เลือกสินค้าที่มีอยู่แล้ว --</option>
                {productCatalog.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-slate-600 mb-1.5 block">ชื่อสินค้า/วัตถุดิบ <span className="text-red-500">*</span></label>
              <input type="text" placeholder="เช่น เมล็ดกาแฟอาราบิก้า" className="w-full border border-slate-200 rounded-lg p-3 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" value={invForm.name} onChange={e => setInvForm({...invForm, name: e.target.value})} />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-slate-600 mb-1.5 block">รหัส SKU</label>
              <input type="text" placeholder="เช่น COF-ARA-01" className="w-full border border-slate-200 rounded-lg p-3 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" value={invForm.sku} onChange={e => setInvForm({...invForm, sku: e.target.value})} />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-600 mb-1.5 block">หมวดหมู่</label>
              <select className="w-full border border-slate-200 rounded-lg p-3 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" value={invForm.category} onChange={e => setInvForm({...invForm, category: e.target.value})}>
                <option value="วัตถุดิบ">วัตถุดิบ</option>
                <option value="ภาชนะ">ภาชนะ</option>
                <option value="ชิ้นใหญ่">ชิ้นใหญ่</option>
                <option value="อื่นๆ">อื่นๆ</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-600 mb-1.5 block">หน่วยนับ</label>
              <select className="w-full border border-slate-200 rounded-lg p-3 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" value={invForm.unit} onChange={e => setInvForm({...invForm, unit: e.target.value})}>
                <option value="แพ็ค">แพ็ค</option>
                <option value="กิโลกรัม">กิโลกรัม</option>
                <option value="ลัง">ลัง</option>
                <option value="อื่นๆ">อื่นๆ</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-600 mb-1.5 block">จำนวนในคลัง</label>
              <input type="number" min="0" placeholder="0" className="w-full border border-slate-200 rounded-lg p-3 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-center" value={invForm.stock || ''} onChange={e => setInvForm({...invForm, stock: Number(e.target.value)})} />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-600 mb-1.5 block">ต้นทุน/หน่วย (฿)</label>
              <input type="number" min="0" step="0.01" placeholder="0.00" className="w-full border border-slate-200 rounded-lg p-3 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-center font-mono text-indigo-700 font-bold" value={invForm.unitCost || ''} onChange={e => setInvForm({...invForm, unitCost: Number(e.target.value)})} />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
            <button onClick={() => { setIsInvAdding(false); setEditingInventoryItem(null); setInvForm(null); }} className="px-6 py-3 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">ยกเลิก</button>
            <button onClick={handleSaveInv} disabled={!invForm.name} className="px-8 py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2">
              <Save size={18} /> บันทึกรายการ
            </button>
          </div>
        </div>
      );
    };

    return (
      <div className="flex-1 p-4 md:p-8 overflow-y-auto pb-24 md:pb-8 bg-slate-50/50 min-h-screen">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">คลังหลัก <span className="text-indigo-600 font-light">Inventory</span></h1>
              <p className="text-slate-500 mt-2 text-sm font-medium">จัดการสต็อกวัตถุดิบ ภาชนะ และสินค้ารอแพ็ค (ไม่เกี่ยวกับหน้าร้าน)</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="ค้นหาชื่อ, SKU..." 
                  value={invSearchQuery}
                  onChange={(e) => setInvSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm transition-shadow"
                />
              </div>
              <button onClick={handleAddInv} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-5 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm shrink-0">
                <Plus size={18} /> <span className="hidden sm:inline">เพิ่มรายการ</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex p-1 bg-slate-200/50 rounded-xl mb-6 w-full sm:w-fit">
            <button 
              onClick={() => setInvTab('items')} 
              className={`flex-1 sm:flex-none px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${invTab === 'items' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
            >
              รายการในคลัง
            </button>
            <button 
              onClick={() => setInvTab('history')} 
              className={`flex-1 sm:flex-none px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${invTab === 'history' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
            >
              ประวัติความเคลื่อนไหว
            </button>
          </div>

          {(isInvAdding || editingInventoryItem) && InvFormRender()}

          {invTab === 'items' && !isInvAdding && !editingInventoryItem && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredItems.map(item => (
                  <div key={item.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow group flex flex-col h-full">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                          <Package size={24} strokeWidth={1.5} />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 text-lg leading-tight line-clamp-1" title={item.name}>{item.name}</h3>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {item.sku && <span className="text-xs font-mono font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">{item.sku}</span>}
                            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">{item.category}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-auto">
                      <div className="flex items-end justify-between py-3 border-y border-slate-100 mb-4">
                        <div>
                          <p className="text-xs font-semibold text-slate-400 mb-0.5 uppercase tracking-wider">คงเหลือ</p>
                          <div className="flex items-baseline gap-1">
                            <span className={`text-2xl font-black ${item.stock <= 0 ? 'text-red-500' : 'text-slate-800'}`}>{item.stock.toLocaleString()}</span>
                            <span className="text-sm font-semibold text-slate-500">{item.unit}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-semibold text-slate-400 mb-0.5 uppercase tracking-wider">ทุนต่อหน่วย</p>
                          <p className="text-lg font-bold text-slate-700 font-mono">฿{item.unitCost.toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button onClick={() => handleEditInv(item)} className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors">
                          <Edit size={16} /> แก้ไข
                        </button>
                        <button onClick={() => handleDeleteInv(item.id)} className="w-11 flex items-center justify-center text-slate-400 hover:text-red-600 bg-slate-50 hover:bg-red-50 rounded-xl transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {filteredItems.length === 0 && (
                <div className="bg-white border border-slate-200 border-dashed rounded-3xl p-12 text-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                    <Package size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-700 mb-2">ไม่พบรายการคลังหลัก</h3>
                  <p className="text-slate-500 mb-6 max-w-sm mx-auto">เพิ่มรายการวัตถุดิบหรือสินค้าหลักของคุณเพื่อเริ่มจัดการสต็อก</p>
                  <button onClick={handleAddInv} className="inline-flex items-center gap-2 font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-6 py-2.5 rounded-xl transition-colors">
                    <Plus size={18} /> เพิ่มรายการแรก
                  </button>
                </div>
              )}
            </>
          )}

          {invTab === 'history' && !isInvAdding && !editingInventoryItem && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                <h2 className="text-lg font-bold text-slate-800">ประวัติความเคลื่อนไหว</h2>
                <div className="w-full sm:w-auto relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                  <select 
                    value={invTransDate} 
                    onChange={e => setInvTransDate(e.target.value)}
                    className="w-full sm:w-auto pl-9 pr-8 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none shadow-sm cursor-pointer"
                  >
                    <option value="">ทุกวันที่</option>
                    {invDates.map(d => (
                      <option key={d} value={d}>{new Date(d).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="divide-y divide-slate-100">
                {filteredInvTrans.map(t => (
                  <div key={t.id} className="p-5 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 group">
                    <div className="flex gap-4 items-start md:items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm border ${t.type === 'in' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                        {t.type === 'in' ? <Plus size={18} strokeWidth={2.5} /> : <Minus size={18} strokeWidth={2.5} />}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 flex items-center gap-2">
                          {t.itemName}
                          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${t.type === 'in' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {t.type === 'in' ? 'รับเข้า' : 'เบิกออก'}
                          </span>
                        </p>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <Clock size={12} /> {new Date(t.timestamp).toLocaleString('th-TH')}
                        </p>
                        {t.note && <p className="text-sm text-slate-600 mt-2 bg-slate-100 inline-block px-3 py-1 rounded-lg italic">"{t.note}"</p>}
                      </div>
                    </div>
                    
                    <div className="flex flex-row md:flex-col justify-between items-center md:items-end gap-1 ml-14 md:ml-0 border-t md:border-t-0 border-slate-100 pt-3 md:pt-0">
                      <div className="text-sm font-semibold text-slate-500">จำนวน</div>
                      <span className={`font-black text-xl ${t.type === 'in' ? 'text-green-600' : 'text-red-600'}`}>
                        {t.type === 'in' ? '+' : '-'}{t.quantity}
                      </span>
                    </div>
                  </div>
                ))}

                {filteredInvTrans.length === 0 && (
                  <div className="p-12 text-center text-slate-500">
                    <History size={32} className="mx-auto mb-3 text-slate-300" />
                    <p className="font-medium text-slate-600">ไม่มีประวัติความเคลื่อนไหว</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };
  const SettingsView = () => {
    const handleEditClick = (p: Product) => {
      setEditingProduct(p);
      setForm(p);
      setIsAdding(false);
    };

    const handleAddClick = () => {
      const newProduct: Product = {
        id: `PRD-${Math.floor(1000 + Math.random() * 9000)}`,
        sku: 'NEW-',
        name: '',
        category: 'Coffee',
        price: 0,
        cost: 0,
        stock: 0,
      };
      setEditingProduct(newProduct);
      setForm(newProduct);
      setIsAdding(true);
      // scroll to top or just add at top
    };

    const handleDelete = (id: string) => {
      if (confirm('แน่ใจหรือไม่ว่าต้องการลบสินค้านี้?')) {
        sounds.error();
        setProductCatalog(prev => prev.filter(p => p.id !== id));
        setEditingProduct(null);
        setForm(null);
        setIsAdding(false);
      }
    };

    const handleSave = () => {
      sounds.success();
      if (form) {
        if (isAdding) {
          setProductCatalog(prev => [form, ...prev]);
        } else {
          setProductCatalog(prev => prev.map(p => p.id === form.id ? form : p));
        }
        setEditingProduct(null);
        setForm(null);
        setIsAdding(false);
      }
    };

    const handleCancel = () => {
      setEditingProduct(null);
      setForm(null);
      setIsAdding(false);
    };

    const ProductForm = () => {
      if (!form) return null;
      return (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-7 gap-3">
            <label className="flex flex-col text-xs font-semibold text-slate-500">รูปภาพ (URL)
              <input className="mt-1 border border-slate-200 rounded p-2 text-sm text-slate-900" placeholder="https://..." value={form.image || ''} onChange={e => setForm({...form, image: e.target.value})} />
            </label>
            <label className="flex flex-col text-xs font-semibold text-slate-500">รหัสสินค้า
              <input className="mt-1 border border-slate-200 rounded p-2 text-sm text-slate-900" value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} />
            </label>
            <label className="flex flex-col text-xs font-semibold text-slate-500">ชื่อสินค้า
              <input className="mt-1 border border-slate-200 rounded p-2 text-sm text-slate-900" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </label>
            <label className="flex flex-col text-xs font-semibold text-slate-500">หมวดหมู่
              <input className="mt-1 border border-slate-200 rounded p-2 text-sm text-slate-900" value={form.category} onChange={e => setForm({...form, category: e.target.value})} />
            </label>
            <label className="flex flex-col text-xs font-semibold text-slate-500">ราคา (฿)
              <div className="flex mt-1 border border-slate-200 rounded bg-white overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500">
                <button type="button" onClick={() => setForm({...form, price: Math.max(0, (form.price || 0) - 5)})} className="px-2 bg-slate-50 border-r border-slate-200 hover:bg-slate-100 text-slate-600 flex items-center justify-center"><Minus size={14} /></button>
                <input type="number" step="0.01" className="w-full p-2 text-sm text-slate-900 text-center outline-none" value={form.price === 0 ? '' : form.price} onChange={e => setForm({...form, price: parseFloat(e.target.value) || 0})} />
                <button type="button" onClick={() => setForm({...form, price: (form.price || 0) + 5})} className="px-2 bg-slate-50 border-l border-slate-200 hover:bg-slate-100 text-slate-600 flex items-center justify-center"><Plus size={14} /></button>
              </div>
            </label>
            <label className="flex flex-col text-xs font-semibold text-slate-500">ต้นทุน (฿)
              <div className="flex mt-1 border border-slate-200 rounded bg-white overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500">
                <button type="button" onClick={() => setForm({...form, cost: Math.max(0, (form.cost || 0) - 5)})} className="px-2 bg-slate-50 border-r border-slate-200 hover:bg-slate-100 text-slate-600 flex items-center justify-center"><Minus size={14} /></button>
                <input type="number" step="0.01" className="w-full p-2 text-sm text-slate-900 text-center outline-none" value={form.cost === 0 ? '' : form.cost} onChange={e => setForm({...form, cost: parseFloat(e.target.value) || 0})} />
                <button type="button" onClick={() => setForm({...form, cost: (form.cost || 0) + 5})} className="px-2 bg-slate-50 border-l border-slate-200 hover:bg-slate-100 text-slate-600 flex items-center justify-center"><Plus size={14} /></button>
              </div>
            </label>
            <label className="flex flex-col text-xs font-semibold text-slate-500">คงเหลือ
              <div className="flex mt-1 border border-slate-200 rounded bg-white overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500">
                <button type="button" onClick={() => setForm({...form, stock: Math.max(0, (form.stock || 0) - 1)})} className="px-2 bg-slate-50 border-r border-slate-200 hover:bg-slate-100 text-slate-600 flex items-center justify-center"><Minus size={14} /></button>
                <input type="number" className="w-full p-2 text-sm text-slate-900 text-center outline-none" value={form.stock === 0 ? '' : form.stock} onChange={e => setForm({...form, stock: parseInt(e.target.value) || 0})} />
                <button type="button" onClick={() => setForm({...form, stock: (form.stock || 0) + 1})} className="px-2 bg-slate-50 border-l border-slate-200 hover:bg-slate-100 text-slate-600 flex items-center justify-center"><Plus size={14} /></button>
              </div>
            </label>
          </div>
          <div className="flex justify-between items-center mt-2">
            {!isAdding ? (
              <button onClick={() => handleDelete(form.id)} className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-lg text-sm transition-colors flex items-center gap-1">
                <Trash2 size={16} /> ลบ
              </button>
            ) : <div />}
            <div className="flex gap-2">
              <button onClick={handleCancel} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-lg text-sm transition-colors">ยกเลิก</button>
              <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-sm transition-colors">บันทึก</button>
            </div>
          </div>
        </div>
      );
    };

    return (
      <div className="flex-1 p-6 md:p-8 overflow-y-auto pb-24 md:pb-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">คลังสินค้า</h1>
          <button onClick={() => { sounds.click(); handleAddClick(); }} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-xl flex items-center gap-2 transition-colors">
            <Plus size={18} /> เพิ่มสินค้า
          </button>
        </div>
        <div className="space-y-4">
          {isAdding && (
            <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-200 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-4">เพิ่มสินค้าใหม่</h2>
              {ProductForm()}
            </div>
          )}
          {productCatalog.map(p => (
            <div key={p.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              {editingProduct?.id === p.id && !isAdding ? (
                ProductForm()
              ) : (
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center text-xl shrink-0 overflow-hidden">
                      {p.image ? (
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        p.category === 'Coffee' ? '☕' : p.category === 'Pastry' ? '🥐' : p.category === 'Bread' ? '🥖' : p.category === 'Food' ? '🥪' : '🍵'
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                        {p.name}
                        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{p.sku}</span>
                      </h3>
                      <p className="text-sm text-slate-500">
                        {p.category} &bull; ราคา: ฿{p.price.toFixed(2)} &bull; ทุน: ฿{p.cost.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-0 border-slate-100 pt-3 md:pt-0 mt-2 md:mt-0">
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">คงเหลือ</span>
                      <span className={`font-extrabold text-lg ${p.stock <= 5 ? 'text-red-500' : 'text-slate-900'}`}>{p.stock}</span>
                    </div>
                    <button onClick={() => handleEditClick(p)} className="flex items-center gap-1 text-sm font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-xl transition-colors border border-indigo-100">
                      <Edit size={16} /> แก้ไข
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans text-slate-800">
      <aside className="w-20 bg-slate-900 hidden md:flex flex-col items-center py-6 gap-8">
        <button onClick={() => { sounds.click(); setActiveView('pos'); }} className={`w-10 h-10 rounded-xl flex items-center justify-center text-white transition-colors ${activeView === 'pos' ? 'bg-indigo-600 shadow-sm' : 'bg-slate-800 hover:bg-slate-700'}`}>
          <Home size={20} />
        </button>
        <button onClick={() => { sounds.click(); setActiveView('history'); }} className={`w-10 h-10 rounded-xl flex items-center justify-center text-white transition-colors ${activeView === 'history' ? 'bg-indigo-600 shadow-sm' : 'bg-slate-800 hover:bg-slate-700'}`}>
          <FileText size={20} />
        </button>
        <button onClick={() => { sounds.click(); setActiveView('dashboard'); }} className={`w-10 h-10 rounded-xl flex items-center justify-center text-white transition-colors ${activeView === 'dashboard' ? 'bg-indigo-600 shadow-sm' : 'bg-slate-800 hover:bg-slate-700'}`}>
          <BarChart2 size={20} />
        </button>
        <button onClick={() => { sounds.click(); setActiveView('restock'); }} className={`w-10 h-10 rounded-xl flex items-center justify-center text-white transition-colors ${activeView === 'restock' ? 'bg-indigo-600 shadow-sm' : 'bg-slate-800 hover:bg-slate-700'}`}>
          <PackagePlus size={20} />
        </button>
        <button onClick={() => { sounds.click(); setActiveView('inventory'); }} className={`w-10 h-10 rounded-xl flex items-center justify-center text-white transition-colors ${activeView === 'inventory' ? 'bg-indigo-600 shadow-sm' : 'bg-slate-800 hover:bg-slate-700'}`}>
          <Database size={20} />
        </button>
        <button onClick={() => { sounds.click(); setActiveView('expenses'); }} className={`w-10 h-10 rounded-xl flex items-center justify-center text-white transition-colors ${activeView === 'expenses' ? 'bg-indigo-600 shadow-sm' : 'bg-slate-800 hover:bg-slate-700'}`}>
          <ArrowRightLeft size={20} />
        </button>
        <button onClick={() => { sounds.click(); setActiveView('settings'); }} className={`w-10 h-10 rounded-xl flex items-center justify-center text-white transition-colors mt-auto ${activeView === 'settings' ? 'bg-indigo-600 shadow-sm' : 'bg-slate-800 hover:bg-slate-700'}`}>
          <Settings size={20} />
        </button>
      </aside>

      {/* Main Content Area */}
      {activeView === 'pos' && (
        <div className="flex-1 p-6 md:p-8 flex flex-col h-screen overflow-hidden">
          <header className="mb-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <h1 className="text-3xl font-bold text-slate-900 hidden md:block">แคตตาล็อกสินค้า</h1>
            
            <div className="flex items-center gap-3 md:hidden">
              <h1 className="text-2xl font-bold text-slate-900 flex-1">แคตตาล็อกสินค้า</h1>
              <button 
                onClick={() => { sounds.click(); setIsMobileCartOpen(true); }}
                className="relative p-3 bg-white rounded-xl shadow-sm border border-slate-200"
              >
                <ShoppingCart size={24} className="text-slate-700" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>

            <div className="flex gap-4 items-center">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="ค้นหาสินค้า..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-full text-sm font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 w-full md:w-64"
                />
              </div>
            </div>
          </header>
          
          <div className="mb-6 flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => { sounds.click(); setActiveCategory(category); }}
                className={`px-5 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-colors border ${
                  activeCategory === category
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto pr-2 pb-24 md:pb-6">
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredProducts.map((product) => {
                const cartItem = cart.find(i => i.id === product.id);
                const cartQty = cartItem ? cartItem.quantity + (cartItem.freeQuantity || 0) : 0;
                const availableStock = product.stock - cartQty;
                return (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col items-start hover:border-indigo-500 hover:shadow-sm transition-all active:scale-95 text-left h-40 md:h-48"
                  >
                    <div className="w-full h-[60px] md:h-[80px] bg-slate-50 rounded-lg mb-3 flex flex-col items-center justify-center relative overflow-hidden">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <span className="text-2xl opacity-50">
                          {product.category === 'Coffee' ? '☕' : product.category === 'Pastry' ? '🥐' : product.category === 'Bread' ? '🥖' : product.category === 'Food' ? '🥪' : '🍵'}
                        </span>
                      )}
                      <div className={`absolute top-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-bold ${availableStock > 10 ? 'bg-slate-200 text-slate-600' : availableStock > 0 ? 'bg-orange-100 text-orange-600' : 'bg-red-100 text-red-600'}`}>
                        {availableStock > 0 ? `เหลือ ${availableStock}` : 'หมด'}
                      </div>
                    </div>
                    <span className="font-bold text-base md:text-lg leading-tight mb-1 text-slate-900">
                      {product.name}
                    </span>
                    <span className="text-slate-500 font-medium text-sm mt-auto">
                      ฿{product.price.toFixed(2)}
                    </span>
                  </button>
                );
              })}
              {filteredProducts.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-500 font-medium">
                  ไม่พบสินค้า
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeView === 'history' && HistoryView()}
      {activeView === 'dashboard' && DashboardView()}
      {activeView === 'settings' && SettingsView()}
      {activeView === 'restock' && RestockView()}
      {activeView === 'expenses' && ExpensesView()}
      {activeView === 'inventory' && InventoryView()}

      {/* Desktop Sidebar - Cart */}
      {activeView === 'pos' && (
        <div className="w-[360px] bg-white border-l border-slate-200 flex-col h-screen relative z-10 hidden md:flex shrink-0">
          {CartContent()}
        </div>
      )}

      {/* Mobile Cart Modal */}
      {isMobileCartOpen && activeView === 'pos' && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col bg-slate-900/40 backdrop-blur-sm">
          <div className="flex-1" onClick={() => { sounds.click(); setIsMobileCartOpen(false); }} />
          <div className="bg-white w-full h-[80vh] rounded-t-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-full duration-300">
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mt-4 mb-2" />
            {CartContent()}
          </div>
        </div>
      )}

      {isCheckoutModalOpen && (
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
                onClick={() => { sounds.click(); setIsCheckoutModalOpen(false); }}
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

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-2 pb-4 z-40 overflow-x-auto">
        <button onClick={() => { sounds.click(); setActiveView('pos'); }} className={`p-2 rounded-xl flex flex-col items-center gap-1 min-w-[4rem] flex-1 ${activeView === 'pos' ? 'text-indigo-600' : 'text-slate-400'}`}>
          <Home size={20} />
          <span className="text-[10px] font-bold">สินค้า</span>
        </button>
        <button onClick={() => { sounds.click(); setActiveView('history'); }} className={`p-2 rounded-xl flex flex-col items-center gap-1 min-w-[4rem] flex-1 ${activeView === 'history' ? 'text-indigo-600' : 'text-slate-400'}`}>
          <FileText size={20} />
          <span className="text-[10px] font-bold">ออเดอร์</span>
        </button>
        <button onClick={() => { sounds.click(); setActiveView('dashboard'); }} className={`p-2 rounded-xl flex flex-col items-center gap-1 min-w-[4rem] flex-1 ${activeView === 'dashboard' ? 'text-indigo-600' : 'text-slate-400'}`}>
          <BarChart2 size={20} />
          <span className="text-[10px] font-bold">สถิติ</span>
        </button>
        <button onClick={() => { sounds.click(); setActiveView('restock'); }} className={`p-2 rounded-xl flex flex-col items-center gap-1 min-w-[4rem] flex-1 ${activeView === 'restock' ? 'text-indigo-600' : 'text-slate-400'}`}>
          <PackagePlus size={20} />
          <span className="text-[10px] font-bold">นำเข้า</span>
        </button>
        <button onClick={() => { sounds.click(); setActiveView('inventory'); }} className={`p-2 rounded-xl flex flex-col items-center gap-1 min-w-[4rem] flex-1 ${activeView === 'inventory' ? 'text-indigo-600' : 'text-slate-400'}`}>
          <Database size={20} />
          <span className="text-[10px] font-bold">คลังหลัก</span>
        </button>
        <button onClick={() => { sounds.click(); setActiveView('expenses'); }} className={`p-2 rounded-xl flex flex-col items-center gap-1 min-w-[4rem] flex-1 ${activeView === 'expenses' ? 'text-indigo-600' : 'text-slate-400'}`}>
          <ArrowRightLeft size={20} />
          <span className="text-[10px] font-bold whitespace-nowrap">รายรับ-จ่าย</span>
        </button>
        <button onClick={() => { sounds.click(); setActiveView('settings'); }} className={`p-2 rounded-xl flex flex-col items-center gap-1 min-w-[4rem] flex-1 ${activeView === 'settings' ? 'text-indigo-600' : 'text-slate-400'}`}>
          <Settings size={20} />
          <span className="text-[10px] font-bold">ตั้งค่า</span>
        </button>
      </div>
      <button
        onClick={toggleSound}
        className="fixed bottom-24 md:bottom-6 right-6 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-700 hover:text-indigo-600 border border-slate-200 z-[60] transition-colors"
        title={isSoundMuted ? "เปิดเสียง" : "ปิดเสียง"}
      >
        {isSoundMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>
    </div>
  );
}

