import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

const regex = /const totalPurchases = restocks.reduce\(\(sum, r\) => sum \+ r\.totalCost, 0\);\s*const totalExpenses = expenses.filter\(e => e\.type !== 'income'\)\.reduce\(\(sum, e\) => sum \+ e\.amount, 0\);\s*const totalOtherIncome = expenses.filter\(e => e\.type === 'income'\)\.reduce\(\(sum, e\) => sum \+ e\.amount, 0\);\s*const netProfit = totalRevenue - orders\.reduce\(\(sum, o\) => sum \+ o\.totalCost, 0\);\s*const remainingBalance = totalRevenue - totalPurchases - totalExpenses \+ totalOtherIncome;\s*const totalCashIncome = orders.filter\(o => o\.paymentMethod === 'cash' \|\| !o\.paymentMethod\)\.reduce\(\(sum, o\) => sum \+ o\.subtotal, 0\) \+ expenses.filter\(e => e\.type === 'income' && \(e\.paymentMethod === 'cash' \|\| !e\.paymentMethod\)\)\.reduce\(\(sum, e\) => sum \+ e\.amount, 0\);\s*const totalCashExpense = restocks.filter\(r => r\.paymentMethod === 'cash' \|\| !r\.paymentMethod\)\.reduce\(\(sum, r\) => sum \+ r\.totalCost, 0\) \+ expenses.filter\(e => e\.type !== 'income' && \(e\.paymentMethod === 'cash' \|\| !e\.paymentMethod\)\)\.reduce\(\(sum, e\) => sum \+ e\.amount, 0\);\s*const cashBalance = totalCashIncome - totalCashExpense;\s*const totalTransferIncome = orders.filter\(o => o\.paymentMethod === 'transfer'\)\.reduce\(\(sum, o\) => sum \+ o\.subtotal, 0\) \+ expenses.filter\(e => e\.type === 'income' && e\.paymentMethod === 'transfer'\)\.reduce\(\(sum, e\) => sum \+ e\.amount, 0\);\s*const totalTransferExpense = restocks.filter\(r => r\.paymentMethod === 'transfer'\)\.reduce\(\(sum, r\) => sum \+ r\.totalCost, 0\) \+ expenses.filter\(e => e\.type !== 'income' && e\.paymentMethod === 'transfer'\)\.reduce\(\(sum, e\) => sum \+ e\.amount, 0\);\s*const transferBalance = totalTransferIncome - totalTransferExpense;/s;

const newDashboardLogic = `const totalPurchases = restocks.filter(r => !r.masterItemId).reduce((sum, r) => sum + r.totalCost, 0) + inventoryTransactions.filter(t => t.type === 'in').reduce((sum, t) => sum + t.totalCost, 0);
    const totalExpenses = expenses.filter(e => e.type !== 'income').reduce((sum, e) => sum + e.amount, 0);
    const totalOtherIncome = expenses.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
    const netProfit = totalRevenue - orders.reduce((sum, o) => sum + o.totalCost, 0);
    const remainingBalance = totalRevenue - totalPurchases - totalExpenses + totalOtherIncome;

    const totalCashIncome = orders.filter(o => o.paymentMethod === 'cash' || !o.paymentMethod).reduce((sum, o) => sum + o.subtotal, 0) + expenses.filter(e => e.type === 'income' && (e.paymentMethod === 'cash' || !e.paymentMethod)).reduce((sum, e) => sum + e.amount, 0);
    const totalCashExpense = restocks.filter(r => !r.masterItemId && (r.paymentMethod === 'cash' || !r.paymentMethod)).reduce((sum, r) => sum + r.totalCost, 0) + expenses.filter(e => e.type !== 'income' && (e.paymentMethod === 'cash' || !e.paymentMethod)).reduce((sum, e) => sum + e.amount, 0) + inventoryTransactions.filter(t => t.type === 'in' && (t.paymentMethod === 'cash' || !t.paymentMethod)).reduce((sum, t) => sum + t.totalCost, 0);
    const cashBalance = totalCashIncome - totalCashExpense;

    const totalTransferIncome = orders.filter(o => o.paymentMethod === 'transfer').reduce((sum, o) => sum + o.subtotal, 0) + expenses.filter(e => e.type === 'income' && e.paymentMethod === 'transfer').reduce((sum, e) => sum + e.amount, 0);
    const totalTransferExpense = restocks.filter(r => !r.masterItemId && r.paymentMethod === 'transfer').reduce((sum, r) => sum + r.totalCost, 0) + expenses.filter(e => e.type !== 'income' && e.paymentMethod === 'transfer').reduce((sum, e) => sum + e.amount, 0) + inventoryTransactions.filter(t => t.type === 'in' && t.paymentMethod === 'transfer').reduce((sum, t) => sum + t.totalCost, 0);
    const transferBalance = totalTransferIncome - totalTransferExpense;`;

content = content.replace(regex, newDashboardLogic);
fs.writeFileSync('src/App.tsx', content);

