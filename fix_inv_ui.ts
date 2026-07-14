import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

const stateRegex = /const \[invSearchQuery, setInvSearchQuery\] = useState\(''\);/;
content = content.replace(stateRegex, "const [invSearchQuery, setInvSearchQuery] = useState('');\n  const [invTab, setInvTab] = useState<'items' | 'history'>('items');");

fs.writeFileSync('src/App.tsx', content);
