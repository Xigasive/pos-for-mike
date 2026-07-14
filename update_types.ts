import fs from 'fs';

let content = fs.readFileSync('src/types.ts', 'utf-8');

content = content.replace(
  /export interface Order \{[\s\S]*?\}/,
  `export interface Order {
  id: string;
  items: CartItem[];
  subtotal: number;
  total: number;
  totalCost: number;
  timestamp: string;
  paymentMethod?: 'cash' | 'transfer';
  customerName?: string;
}`
);

fs.writeFileSync('src/types.ts', content);
