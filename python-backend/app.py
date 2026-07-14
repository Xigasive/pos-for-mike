from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os

app = Flask(__name__)
# Enable CORS for all domains on all routes
CORS(app)

DATABASE_FILE = 'pos_database.json'

def read_database():
    """Reads the existing data from the JSON database file."""
    default_data = {"products": [], "orders": [], "restocks": [], "expenses": []}
    if not os.path.exists(DATABASE_FILE):
        return default_data
    try:
        with open(DATABASE_FILE, 'r') as file:
            data = file.read()
            if not data:
                return default_data
            parsed = json.loads(data)
            # Migrate old list-based data to new dictionary format
            if isinstance(parsed, list):
                return {"products": [], "orders": parsed, "restocks": [], "expenses": []}
            
            if "expenses" not in parsed:
                parsed["expenses"] = []
                
            return parsed
    except json.JSONDecodeError:
        # If file is empty or corrupted, return default structure
        return default_data

def write_database(data):
    """Writes the data dictionary back to the JSON database file."""
    with open(DATABASE_FILE, 'w') as file:
        json.dump(data, file, indent=4)

@app.route('/sync', methods=['GET', 'POST'])
def sync_data():
    try:
        if request.method == 'GET':
            data = read_database()
            return jsonify(data), 200
            
        elif request.method == 'POST':
            new_data = request.get_json()
            if not new_data:
                return jsonify({"error": "No JSON data provided"}), 400
                
            write_database(new_data)
            return jsonify({"status": "success", "message": "Data synced successfully!"}), 200
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/checkout', methods=['POST'])
def checkout():
    try:
        # Receive JSON data from the frontend
        new_transaction = request.get_json()

        if not new_transaction:
            return jsonify({"error": "No JSON data provided"}), 400

        # Read past transactions
        transactions = read_database()

        # Append the new transaction to the list
        transactions.append(new_transaction)

        # Save safely without overwriting past data
        write_database(transactions)

        return jsonify({
            "status": "success",
            "message": "Transaction saved successfully!"
        }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Run the server on port 7000
    app.run(debug=True, port=7000)
