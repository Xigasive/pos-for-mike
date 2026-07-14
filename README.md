# Point of Sale (POS) System

A complete Point of Sale (POS) system featuring a React frontend (Vite + Tailwind CSS) and a Python Flask backend. The application allows users to manage a product catalog, process sales, track inventory, and view sales/restock history through an intuitive dashboard.

## Features

- **POS Interface:** Quick add-to-cart, real-time total calculation with tax, and simple checkout.
- **Inventory Management (Settings):** Add, edit, or delete products. Track SKU, Cost, Price, and Stock level.
- **Restock Purchases:** Add stock to existing products and record purchase history to calculate Cost of Goods Sold (COGS).
- **Order History:** View past orders and easily issue refunds or delete transactions.
- **Dashboard Analytics:** View total sales revenue, total purchases, COGS, and gross profit.
- **Python Backend API:** A simple Flask API that records completed orders into a local `pos_database.json` file.

## Tech Stack

**Frontend:**
- React 19
- Vite
- Tailwind CSS
- Lucide React (Icons)
- TypeScript

**Backend:**
- Python 3
- Flask
- Flask-CORS

## Getting Started

### 1. Frontend Setup

Make sure you have Node.js installed, then run the following commands in the root directory:

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

### 2. Backend Setup

The Python backend code is located in the `/python-backend` directory.

```bash
cd python-backend

# Optional: Create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate

# Install requirements
pip install -r requirements.txt

# Run the Flask server
python app.py
```

The Flask API will run on `http://127.0.0.1:5000` (or the configured host/port).

## Configuration

If you deploy your backend to a specific URL (e.g., `https://xigasive.pythonanywhere.com`), make sure the frontend points to the correct API endpoint. The fetch request is currently located in `src/App.tsx` within the `handleCheckout` function.

## License

MIT
