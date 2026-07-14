export interface Product {
  id: string;
  sku: string;
  name: string;
  price: number;
  cost: number;
  category: string;
  stock: number;
  image?: string;
  user?: string; // added to track who created/modified
}

export interface CartItem extends Product {
  quantity: number;
  freeQuantity?: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  subtotal: number;
  total: number;
  totalCost: number;
  timestamp: string;
  paymentMethod?: 'cash' | 'transfer';
  customerName?: string;
  user?: string;
}

export interface ExpenseRecord {
  id: string;
  amount: number;
  note: string;
  timestamp: string;
  type?: 'income' | 'expense';
  paymentMethod?: 'cash' | 'transfer';
  user?: string;
}

export interface RestockRecord {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  timestamp: string;
  bulkUnit?: string;
  bulkQty?: number;
  bulkCost?: number;
  paymentMethod?: 'cash' | 'transfer';
  masterItemId?: string;
  user?: string;
}

export interface MasterInventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  stock: number;
  unit: string;
  unitCost: number;
  user?: string;
}

export interface InventoryTransaction {
  id: string;
  itemId: string;
  itemName: string;
  type: 'in' | 'out';
  quantity: number;
  unitCost: number;
  totalCost: number;
  timestamp: string;
  note: string;
  user?: string;
}

export interface User {
  id: string;
  username: string;
  pin: string; // simplistic auth using a pin or password
}

export interface AuditLog {
  id: string;
  userId: string;
  username: string;
  action: string;
  details: string;
  timestamp: string;
}
