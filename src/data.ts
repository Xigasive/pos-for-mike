import { Product } from './types';

export const products: Product[] = [
  { id: '1', sku: 'COF-01', name: 'Espresso', price: 3.50, cost: 1.00, category: 'Coffee', stock: 50 },
  { id: '2', sku: 'COF-02', name: 'Cappuccino', price: 4.25, cost: 1.50, category: 'Coffee', stock: 40 },
  { id: '3', sku: 'COF-03', name: 'Iced Latte', price: 5.00, cost: 1.80, category: 'Coffee', stock: 35 },
  { id: '4', sku: 'PAS-01', name: 'Croissant', price: 3.75, cost: 1.20, category: 'Pastry', stock: 20 },
  { id: '5', sku: 'PAS-02', name: 'Muffin', price: 4.00, cost: 1.30, category: 'Pastry', stock: 25 },
  { id: '6', sku: 'BRD-01', name: 'Bagel', price: 4.50, cost: 1.40, category: 'Bread', stock: 30 },
  { id: '7', sku: 'FOD-01', name: 'Sandwich', price: 9.50, cost: 4.00, category: 'Food', stock: 15 },
  { id: '8', sku: 'FOD-02', name: 'Salad', price: 11.00, cost: 4.50, category: 'Food', stock: 10 },
  { id: '9', sku: 'BRD-02', name: 'Pretzel', price: 3.25, cost: 1.00, category: 'Bread', stock: 20 },
  { id: '10', sku: 'PAS-03', name: 'Cake', price: 6.00, cost: 2.50, category: 'Pastry', stock: 12 },
  { id: '11', sku: 'TEA-01', name: 'Matcha', price: 5.50, cost: 2.00, category: 'Tea', stock: 30 },
  { id: '12', sku: 'BEV-01', name: 'Juice', price: 4.00, cost: 1.50, category: 'Beverage', stock: 45 },
];
