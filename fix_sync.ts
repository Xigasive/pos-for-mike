import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Fix loadInitialData
content = content.replace(
/setExpenses\(data\.expenses \|\| \[\]\);/,
`setExpenses(data.expenses || []);
          setInventoryItems(data.inventoryItems || []);
          setInventoryTransactions(data.inventoryTransactions || []);`
);

// Fix dependencies
content = content.replace(
/}, \[productCatalog, orders, restocks, expenses, isDataLoaded, lastSyncedHash\]\);/,
`}, [productCatalog, orders, restocks, expenses, inventoryItems, inventoryTransactions, isDataLoaded, lastSyncedHash]);`
);

fs.writeFileSync('src/App.tsx', content);
