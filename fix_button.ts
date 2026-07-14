import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

const regex = /onClick=\{handleCheckout\}/;

const replacement = `onClick={() => setIsCheckoutModalOpen(true)}`;

content = content.replace(regex, replacement);
fs.writeFileSync('src/App.tsx', content);
