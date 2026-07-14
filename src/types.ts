export interface Product {
  id: string;
  sku: string;
  name: string;
  price: number;
  cost: number;
  category: string;
  stock: number;
  image?: string;
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
}

export interface ExpenseRecord {
  id: string;
  amount: number;
  note: string;
  timestamp: string;
  type?: 'income' | 'expense';
  paymentMethod?: 'cash' | 'transfer';
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
}

export interface MasterInventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  stock: number;
  unit: string;
  unitCost: number;
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
}
