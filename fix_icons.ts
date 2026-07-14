import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

const regex = /import \{ ShoppingCart, Plus, Minus, CheckCircle2, AlertCircle, Trash2, Home, BarChart2, User, Search, Edit, FileText, Settings, PackagePlus, Wallet, TrendingUp, ShoppingBag, Package, ArrowRightLeft, TrendingDown, Database \} from 'lucide-react';/;
content = content.replace(regex, "import { ShoppingCart, Plus, Minus, CheckCircle2, AlertCircle, Trash2, Home, BarChart2, User, Search, Edit, FileText, Settings, PackagePlus, Wallet, TrendingUp, ShoppingBag, Package, ArrowRightLeft, TrendingDown, Database, Clock, History, Filter, X } from 'lucide-react';");

fs.writeFileSync('src/App.tsx', content);
