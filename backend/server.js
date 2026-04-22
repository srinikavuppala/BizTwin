const express = require('express');
const oracledb = require('oracledb');
const cors = require('cors');

const app = express();
app.use(cors()); // Allow your HTML file to talk to this server
app.use(express.json()); // Allow parsing of JSON data

// --- DATABASE CONFIGURATION ---
const dbConfig = {
    user: "admin",        // Replace with your Oracle Username
    password: "admin123",    // Replace with your Oracle Password
    connectString: "localhost:1521/XE" // Replace with your connection string (e.g., Host:Port/ServiceName)
};

// --- HELPER FUNCTION TO RUN QUERIES ---
async function runQuery(sql, params = []) {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(sql, params, {
            outFormat: oracledb.OUT_FORMAT_OBJECT // Return data as JSON objects
        });
        return result.rows;
    } catch (err) {
        console.error(err);
        throw err;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
}

// --- API ROUTES ---

// 1. Get All Inventory
app.get('/api/inventory', async (req, res) => {
    try {
        const sql = `SELECT PRODUCT_ID as "id", PRODUCT_NAME as "name", CATEGORY as "category", STOCK_LEVEL as "stock", PRICE as "price", MIN_STOCK_LEVEL as "minStock" FROM INVENTORY`;
        const data = await runQuery(sql);
        res.json(data);
    } catch (err) {
        res.status(500).send("Error fetching inventory");
    }
});

// 2. Add New Inventory Item
app.post('/api/inventory', async (req, res) => {
    const { name, category, stock, price } = req.body;
    const minStock = 10; // Default logic
    try {
        const sql = `INSERT INTO INVENTORY (PRODUCT_ID, PRODUCT_NAME, CATEGORY, STOCK_LEVEL, MIN_STOCK_LEVEL, PRICE) VALUES (SEQ_INVENTORY.NEXTVAL, :name, :category, :stock, :minStock, :price)`;
        await runQuery(sql, { name, category, stock, minStock, price });
        res.json({ message: "Product added successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error adding product");
    }
});

// 3. Get Sales
app.get('/api/sales', async (req, res) => {
    try {
        const sql = `SELECT TRANSACTION_ID as "id", TO_CHAR(TRANSACTION_DATE, 'YYYY-MM-DD') as "date", CUSTOMER_ID as "customer", TOTAL_AMOUNT as "total", 1 as "items" FROM SALES`; 
        // Note: Simplified customer logic for demo
        const data = await runQuery(sql);
        res.json(data);
    } catch (err) {
        res.status(500).send("Error fetching sales");
    }
});

// 4. Create Sale
app.post('/api/sales', async (req, res) => {
    const { total } = req.body;
    try {
        const sql = `INSERT INTO SALES (TRANSACTION_ID, CUSTOMER_ID, TOTAL_AMOUNT) VALUES (SEQ_SALES.NEXTVAL, 1, :total)`;
        await runQuery(sql, { total });
        res.json({ message: "Sale recorded" });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error recording sale");
    }
});

// 5. Update Stock (Restock)
app.put('/api/inventory/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const sql = `UPDATE INVENTORY SET STOCK_LEVEL = STOCK_LEVEL + 20 WHERE PRODUCT_ID = :id`;
        await runQuery(sql, { id });
        res.json({ message: "Stock updated" });
    } catch (err) {
        res.status(500).send("Error updating stock");
    }
});

// Start Server
app.listen(3000, () => {
    console.log("Server running on port 3000");
});
