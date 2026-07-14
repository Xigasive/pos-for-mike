import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

const replacement = `const DashboardView = () => {
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
    const transferBalance = totalTransferIncome - totalTransferExpense;`;

content = content.replace(/const DashboardView = \(\) => \{[\s\S]*?const transferBalance = totalTransferIncome - totalTransferExpense;/m, replacement);

fs.writeFileSync('src/App.tsx', content);
