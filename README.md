Digital Twin Platform for Small Business Operations
A web-based virtual replica of small business operations — mirroring sales, inventory, and customer interactions in real time to aid decision-making without manual tracking.

Built with a clean 3-tier architecture: HTML/JS Frontend → Node.js/Express Backend → Oracle SQL Database.

Features
Dashboard 
KPI Cards — Total Revenue, Transaction Count, Product Catalog Size, Low Stock Alerts
Revenue Trend Chart — Bar chart (Chart.js) showing monthly revenue
Inventory Distribution — Doughnut chart breaking down stock by category
Live Data Flow — Animated pipeline showing real-time system activity
Inventory Management 
Full tabular view of all products with color-coded stock status
Add new products (Name, Category, Stock Level, Price, Min Stock Level)
Restock existing items with quantity adjustment
Automatic Red/Green status badges based on STOCK_LEVEL < MIN_STOCK_LEVEL
Sales Tracking 
Record new transactions (Product, Customer, Amount, Payment Method)
Chronological sales history (newest first)
Auto-deduction of inventory stock on sale
Database Connectivity (FR-04)
Oracle DB connection via oracledb Node.js driver
Graceful error handling for connection failures
RESTful API mapping SQL tables to JSON responses
Tech Stack
Layer	Technology
Frontend	HTML5, CSS3, Vanilla JavaScript, Chart.js 4.x
Styling	Tailwind CSS, Font Awesome 6, Google Fonts
Backend	Node.js (v14+), Express.js
Database	Oracle Database 21c (XE or Enterprise)
DB Driver	oracledb (npm)
Architecture
┌─────────────────────────────────────────────┐
│ Browser (Client Side) │
│ Single Page Application (HTML/JS/CSS) │
│ Chart.js Visualizations │
└──────────────────┬──────────────────────────┘
│ REST API (JSON)
▼
┌─────────────────────────────────────────────┐
│ Node.js / Express Server │
│ Business Logic & Route Handling │
│ oracledb Driver Integration │
└──────────────────┬──────────────────────────┘
│ Oracle Net Protocol
▼
┌─────────────────────────────────────────────┐
│ Oracle Database 21c │
│ Tables: INVENTORY, SALES │
└─────────────────────────────────────────────┘

text


---

## Prerequisites

- **Node.js** v14 or higher — [Download](https://nodejs.org/)
- **Oracle Database 21c** — [Express Edition](https://www.oracle.com/database/technologies/appdev/xe.html) or Enterprise
- **npm** (comes with Node.js)
- A modern web browser (Chrome, Edge, Firefox)

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/digital-twin-platform.git
cd digital-twin-platform
2. Install Backend Dependencies
bash

cd backend
npm install
3. Configure Database Connection
Edit backend/config/db.js and update the connection credentials:

javascript

const oracledb = require('oracledb');

oracledb.initOracleClient(); // Required if using Instant Client

module.exports = {
  user: 'your_username',
  password: 'your_password',
  connectString: 'localhost:1521/XEPDB1', // Adjust for your setup
  poolMin: 2,
  poolMax: 10,
  poolIncrement: 1
};
4. Initialize the Database
Run the SQL scripts in order using SQL*Plus, SQL Developer, or any Oracle client:

bash

sqlplus your_username/your_password@localhost:1521/XEPDB1 @database/01_create_tables.sql
sqlplus your_username/your_password@localhost:1521/XEPDB1 @database/02_seed_data.sql
5. Start the Backend Server
bash

cd backend
node server.js
The API will be available at http://localhost:3000.

6. Open the Frontend
Open frontend/index.html directly in your browser, or serve it with any static file server:

bash

npx serve frontend
# or
cd frontend && python -m http.server 8080
Project Structure
text

digital-twin-platform/
├── README.md
├── database/
│   ├── 01_create_tables.sql      # Schema creation (INVENTORY, SALES)
│   └── 02_seed_data.sql           # Sample data for testing
├── backend/
│   ├── package.json
│   ├── server.js                  # Express server entry point
│   ├── config/
│   │   └── db.js                  # Oracle DB connection config
│   ├── routes/
│   │   ├── inventory.js           # /api/inventory endpoints
│   │   └── sales.js               # /api/sales endpoints
│   └── utils/
│       └── dbHelper.js            # Connection pool & query helpers
└── frontend/
    └── index.html                 # Complete SPA (HTML/CSS/JS)
Database Schema
Table: INVENTORY
Column
Type
Constraint
PRODUCT_ID	NUMBER	PRIMARY KEY
PRODUCT_NAME	VARCHAR2	NOT NULL
CATEGORY	VARCHAR2	NOT NULL
STOCK_LEVEL	NUMBER	NOT NULL, DEFAULT 0
MIN_STOCK_LEVEL	NUMBER	NOT NULL, DEFAULT 10
PRICE	NUMBER	NOT NULL

Table: SALES
Column
Type
Constraint
TRANSACTION_ID	NUMBER	PRIMARY KEY
TRANSACTION_DATE	DATE	DEFAULT SYSDATE
PRODUCT_ID	NUMBER	FK → INVENTORY.PRODUCT_ID
CUSTOMER_ID	NUMBER	
TOTAL_AMOUNT	NUMBER	NOT NULL
PAYMENT_METHOD	VARCHAR2	NOT NULL

API Endpoints
Method
Endpoint
Description
Request Body
GET	/api/inventory	Retrieve all products	—
POST	/api/inventory	Add a new product	{ product_name, category, stock_level, price, min_stock_level }
PUT	/api/inventory/:id	Restock a product (update stock)	{ stock_level }
GET	/api/sales	Retrieve all sales (newest first)	—
POST	/api/sales	Record a new transaction	{ product_id, customer_id, total_amount, payment_method }

Response Format
All responses follow this structure:

json

{
  "success": true,
  "data": [ ... ],
  "message": "Optional descriptive message"
}
Error responses:

json

{
  "success": false,
  "error": "Description of what went wrong"
}
SQL Scripts
01_create_tables.sql
sql

-- Enable output
SET SERVEROUTPUT ON;

-- Create INVENTORY table
CREATE TABLE INVENTORY (
    PRODUCT_ID      NUMBER GENERATED ALWAYS AS IDENTITY,
    PRODUCT_NAME    VARCHAR2(100) NOT NULL,
    CATEGORY        VARCHAR2(50)  NOT NULL,
    STOCK_LEVEL     NUMBER         DEFAULT 0 NOT NULL,
    MIN_STOCK_LEVEL NUMBER         DEFAULT 10 NOT NULL,
    PRICE           NUMBER(10,2)   NOT NULL,
    CONSTRAINT PK_INVENTORY PRIMARY KEY (PRODUCT_ID)
);

-- Create SALES table
CREATE TABLE SALES (
    TRANSACTION_ID   NUMBER GENERATED ALWAYS AS IDENTITY,
    TRANSACTION_DATE DATE           DEFAULT SYSDATE,
    PRODUCT_ID       NUMBER         NOT NULL,
    CUSTOMER_ID      NUMBER,
    TOTAL_AMOUNT     NUMBER(10,2)   NOT NULL,
    PAYMENT_METHOD   VARCHAR2(30)   NOT NULL,
    CONSTRAINT PK_SALES PRIMARY KEY (TRANSACTION_ID),
    CONSTRAINT FK_SALES_PRODUCT FOREIGN KEY (PRODUCT_ID)
        REFERENCES INVENTORY(PRODUCT_ID)
);

-- Create sequence for manual ID use if needed
CREATE SEQUENCE SEQ_SALES_ID START WITH 1 INCREMENT BY 1;

COMMIT;

PROMPT 'Tables created successfully.';
02_seed_data.sql
sql

-- Seed INVENTORY
INSERT INTO INVENTORY (PRODUCT_NAME, CATEGORY, STOCK_LEVEL, MIN_STOCK_LEVEL, PRICE) VALUES
('Espresso Machine',     'Equipment', 12, 5,  899.99),
('Arabica Coffee Beans', 'Raw Goods',  45, 20, 24.50),
('Ceramic Mug Set',      'Accessories', 8, 15, 32.00),
('Milk Frother',         'Equipment',  25, 10, 49.99),
('Vanilla Syrup',        'Supplies',    3, 10, 12.75),
('Paper Cups (500pk)',   'Disposables', 60, 30, 18.00),
('Latte Art Pitcher',    'Equipment',  18, 5,  35.00),
('Caramel Drizzle',      'Supplies',    2, 8,  9.50),
('Filter Papers (200)',  'Disposables', 90, 40, 6.99),
('Organic Matcha',       'Raw Goods',   14, 10, 38.00);

-- Seed SALES (last 6 months)
INSERT INTO SALES (TRANSACTION_DATE, PRODUCT_ID, CUSTOMER_ID, TOTAL_AMOUNT, PAYMENT_METHOD) VALUES
(TO_DATE('2025-01-05','YYYY-MM-DD'), 1, 101, 899.99, 'Credit Card'),
(TO_DATE('2025-01-12','YYYY-MM-DD'), 2, 102, 73.50,  'Cash'),
(TO_DATE('2025-01-20','YYYY-MM-DD'), 6, 103, 36.00,  'Credit Card'),
(TO_DATE('2025-02-03','YYYY-MM-DD'), 4, 104, 49.99,  'Debit Card'),
(TO_DATE('2025-02-14','YYYY-MM-DD'), 3, 105, 64.00,  'Cash'),
(TO_DATE('2025-02-28','YYYY-MM-DD'), 2, 106, 122.00, 'Credit Card'),
(TO_DATE('2025-03-08','YYYY-MM-DD'), 10,107, 76.00,  'Credit Card'),
(TO_DATE('2025-03-15','YYYY-MM-DD'), 7, 108, 70.00,  'Cash'),
(TO_DATE('2025-03-22','YYYY-MM-DD'), 9, 109, 20.97,  'Debit Card'),
(TO_DATE('2025-04-01','YYYY-MM-DD'), 1, 110, 899.99, 'Credit Card'),
(TO_DATE('2025-04-10','YYYY-MM-DD'), 5, 111, 38.25,  'Cash'),
(TO_DATE('2025-04-18','YYYY-MM-DD'), 2, 112, 147.00, 'Credit Card'),
(TO_DATE('2025-05-05','YYYY-MM-DD'), 8, 113, 28.50,  'Debit Card'),
(TO_DATE('2025-05-12','YYYY-MM-DD'), 4, 114, 149.97, 'Credit Card'),
(TO_DATE('2025-05-20','YYYY-MM-DD'), 6, 115, 54.00,  'Cash'),
(TO_DATE('2025-06-01','YYYY-MM-DD'), 10,116, 114.00, 'Credit Card'),
(TO_DATE('2025-06-08','YYYY-MM-DD'), 3, 117, 96.00,  'Debit Card'),
(TO_DATE('2025-06-15','YYYY-MM-DD'), 2, 118, 195.00, 'Credit Card'),
(TO_DATE('2025-06-22','YYYY-MM-DD'), 7, 119, 105.00, 'Cash'),
(TO_DATE('2025-06-28','YYYY-MM-DD'), 1, 120, 899.99, 'Credit Card');

COMMIT;

PROMPT 'Seed data inserted successfully.';
Usage Guide
Dashboard
Open the app → Dashboard loads automatically
KPIs reflect the latest data from Oracle DB
Hover over chart bars/segments for detailed tooltips
Inventory
Click Inventory in the sidebar
Use the Add Product button to create new inventory entries
Click Restock on any row to top up stock levels
Rows with red badges indicate STOCK_LEVEL < MIN_STOCK_LEVEL
Sales
Click Sales in the sidebar
Use the Record Sale form — select a product, enter amount and payment method
Inventory stock is automatically decremented when a sale is recorded
The sales table updates in real time with the newest transaction at the top
Non-Functional Notes
Performance: Dashboard KPIs render within 3 seconds of page load
Reliability: Connection errors are logged to console; frontend displays error toasts
Usability: Zero-training interface designed for non-technical business owners
Future Scope (v2.0+)
 User authentication with Role-Based Access Control (RBAC)
 Predictive analytics via AI/ML integration
 Employee performance tracking module
 Export reports to PDF/CSV
 Multi-location support
Troubleshooting
Issue
Solution
NJS-045: cannot load Oracle	Run npm install oracledb and call oracledb.initOracleClient() with the path to Oracle Instant Client
ORA-12541: TNS:no listener	Ensure Oracle Listener is running: lsnrctl status
ORA-01017: invalid credentials	Verify username/password in backend/config/db.js
Charts not rendering	Check browser console for errors; ensure Chart.js CDN loads
CORS errors	Ensure backend has cors() middleware enabled
