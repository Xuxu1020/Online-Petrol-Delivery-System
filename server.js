

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(express.json());
const PORT = 3000;

currentUser = "";

// Connect to SQLite Database
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Error connecting to the database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        initializeDatabase();
    }
});

// Create tables and seed data if not present
function initializeDatabase() {
    db.serialize(() => {
        // Create users table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fullname TEXT NOT NULL,
            email TEXT NOT NULL,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT CHECK(role IN ('Admin', 'Customer', 'Driver', 'ResourceManager')) NOT NULL
        )`);

        // Create stocks table
        db.run(`CREATE TABLE IF NOT EXISTS stocks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            petrol_type TEXT CHECK(petrol_type IN ('Ron 95', 'Ron 97', 'Diesel')) UNIQUE NOT NULL,
            stock_left INTEGER NOT NULL CHECK(stock_left >= 0),
            availability TEXT CHECK(availability IN ('Yes', 'No')) DEFAULT 'Yes'
        )`);

        // Create orders table
        db.run(`CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_id INTEGER NOT NULL,
            customer_username TEXT NOT NULL,
            petrol_type TEXT CHECK(petrol_type IN ('Ron 95', 'Ron 97', 'Diesel')) NOT NULL,
            quantity INTEGER NOT NULL,
            delivery_address TEXT NOT NULL,
            price DECIMAL(10, 2) NOT NULL,
            status TEXT CHECK(status IN ('Pending', 'Confirmed', 'Processing', 'Delivered', 'Cancelled')) DEFAULT 'Pending',
            updated_at TIMESTAMP DEFAULT (datetime('now', 'localtime')),
            FOREIGN KEY (customer_id) REFERENCES users(id)
        )`);

        // Create deliveries table
        db.run(`CREATE TABLE IF NOT EXISTS deliveries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL,
            driver_id INTEGER,
            status TEXT CHECK(status IN ('Assigned', 'On the Way', 'Delivered', 'Failed')) DEFAULT 'Assigned',
            estimated_arrival TIMESTAMP,
            FOREIGN KEY (order_id) REFERENCES orders(id),
            FOREIGN KEY (driver_id) REFERENCES users(id)
        )`);

        // Create feedbacks table
        db.run(`CREATE TABLE IF NOT EXISTS feedbacks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            feedback TEXT NOT NULL,
            customer_id INTEGER NOT NULL,
            FOREIGN KEY (customer_id) REFERENCES users(id)
        )`);

        // Seed default users if empty
        db.get("SELECT COUNT(*) AS count FROM users", (err, row) => {
            if (!err && row && row.count === 0) {
                console.log("Seeding default users...");
                const stmt = db.prepare("INSERT INTO users (fullname, email, username, password, role) VALUES (?, ?, ?, ?, ?)");
                stmt.run("Admin User", "admin@example.com", "admin", "admin123", "Admin");
                stmt.run("John Doe", "john@example.com", "john_doe", "johnjohn123", "Customer");
                stmt.run("Driver One", "driver1@example.com", "driver_1", "driverpass", "Driver");
                stmt.run("Manager One", "manager@example.com", "manager_1", "managerpass", "ResourceManager");
                stmt.run("Jane Smith", "janesmith@example.com", "jane_smith", "janejane123", "Customer");
                stmt.finalize();
            }
        });

        // Seed default stocks if empty
        db.get("SELECT COUNT(*) AS count FROM stocks", (err, row) => {
            if (!err && row && row.count === 0) {
                console.log("Seeding default stocks...");
                const stmt = db.prepare("INSERT INTO stocks (petrol_type, stock_left, availability) VALUES (?, ?, ?)");
                stmt.run("Ron 95", 750, "Yes");
                stmt.run("Ron 97", 988, "Yes");
                stmt.run("Diesel", 1000, "Yes");
                stmt.finalize();
            }
        });
    });
}

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'customer', 'login.html')));
app.get('/signup', (req, res) => res.sendFile(path.join(__dirname, 'customer', 'signup.html')));
app.get('/admin-dashboard', (req, res) => res.sendFile(path.join(__dirname, 'admin', 'admin-dashboard.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, 'customer', 'dashboard.html')));
app.get('/driver-dashboard', (req, res) => res.sendFile(path.join(__dirname, 'driver', 'driver-dashboard.html')));
app.get('/rm-dashboard', (req, res) => res.sendFile(path.join(__dirname, 'resource manager', 'rm-dashboard.html')));

app.get('/petrol-ordering', (req, res) => res.sendFile(path.join(__dirname, 'customer', 'petrol-ordering.html')));
app.get('/orderconfirmation', (req, res) => res.sendFile(path.join(__dirname, 'customer', 'orderconfirmation.html')));
app.get('/ordersuccess', (req, res) => res.sendFile(path.join(__dirname, 'customer', 'ordersuccess.html')));
app.get('/enterorderid', (req, res) => res.sendFile(path.join(__dirname, 'customer', 'enterorderid.html')));
app.get('/delivery-status', (req, res) => res.sendFile(path.join(__dirname, 'customer', 'delivery-status.html')));
app.get('/feedbacksupport', (req, res) => res.sendFile(path.join(__dirname, 'customer', 'feedbacksupport.html')));
app.get('/feedbacksuccess', (req, res) => res.sendFile(path.join(__dirname, 'customer', 'feedbacksuccess.html')));

app.get('/getorder', (req, res) => res.sendFile(path.join(__dirname, 'driver', 'getorder.html')));
app.get('/pastorders', (req, res) => res.sendFile(path.join(__dirname, 'driver', 'pastorders.html')));

app.get('/managestock', (req, res) => res.sendFile(path.join(__dirname, 'resource manager', 'managestock.html')));

app.get('/manageuser', (req, res) => res.sendFile(path.join(__dirname, 'admin', 'manageuser.html')));
app.get('/edituser', (req, res) => res.sendFile(path.join(__dirname, 'admin', 'edituser.html')));
app.get('/reviewfeedback', (req, res) => res.sendFile(path.join(__dirname, 'admin', 'reviewfeedback.html')));
app.get('/viewallorder', (req, res) => res.sendFile(path.join(__dirname, 'admin', 'viewallorder.html')));

// Handle Sign Up (without bcrypt)
// Handle Sign Up (without bcrypt)
app.post('/signup', (req, res) => {
    const { fullname, email, username, password } = req.body;
    const userType = 'Customer';

    // Check if username already exists
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
        if (err) {
            console.error(err.message);
            return res.json({ success: false, message: 'Database error. Please try again later.' });
        }
        if (user) {
            return res.json({ success: false, message: 'User already exists. Please login.' });
        }

        // Insert user into database
        const insertQuery = `INSERT INTO users (fullname, email, username, password, role) VALUES (?, ?, ?, ?, ?)`;
        db.run(insertQuery, [fullname, email, username, password, userType], function (err) {
            if (err) {
                console.error(err.message);
                return res.json({ success: false, message: 'Error: Could not register user.' });
            }
            console.log('New user registered:', { username, role: userType });

            // Send success message with redirect URL
            return res.json({ success: true, message: 'Sign-up successful! Redirect to login here', redirectUrl: '/' });
        });
    });
});


// Handle Login (without bcrypt)
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, user) => {
        if (err) {
            console.error(err.message);
            return res.send('Database error. Please try again later.');
        }

        if (!user) {
            return res.send('Invalid Credentials.');
            return res.redirect('/'); // Ensure function stops executing
        }

        currentUser = username;

        // Redirect based on user role
        switch (user.role) {
            case 'Admin':
                return res.redirect('/admin-dashboard');
            case 'Customer':
                return res.redirect('/dashboard');
            case 'Driver':
                return res.redirect('/driver-dashboard');
            case 'ResourceManager':
                return res.redirect('/rm-dashboard');
            default:
                return res.redirect('/');
        }
    });
});

// =============================== ORDER LOGIC ==================================

const petrolPrices = {
    'Ron 95': 2.05,
    'Ron 97': 2.50,
    'Diesel': 1.80
};

app.post('/petrol-ordering', (req, res) => {
    const { petrol_type, quantity, delivery_address } = req.body;

    // Validate input
    if (!petrol_type || !quantity || !delivery_address) {
        return res.status(400).send("Missing required fields.");
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
        return res.status(400).send("Invalid quantity.");
    }

    if (!currentUser) {
        return res.status(401).send("Unauthorized: User not logged in.");
    }

    db.get('SELECT stock_left FROM stocks WHERE petrol_type = ?', [petrol_type], (err, stock) => {
        if (err) {
            console.error("Database error:", err.message);
            return res.status(500).send("Failed to check stock availability.");
        }

        if (!stock || stock.stock_left < qty) {
            return res.status(400).send("Insufficient stock.");
        }

        db.get('SELECT id FROM users WHERE username = ?', [currentUser], (err, user) => {
            if (err || !user) {
                console.error("Database error:", err?.message || "User not found.");
                return res.status(500).send("Failed to place order.");
            }

            const price = parseFloat((petrolPrices[petrol_type] * qty).toFixed(2));


            db.run(
                `INSERT INTO orders (customer_id, customer_username, petrol_type, quantity, delivery_address, price, status) 
                 VALUES (?, ?, ?, ?, ?, ?, 'Pending')`,
                [user.id, currentUser, petrol_type, qty, delivery_address, price],
                function (err) {
                    if (err) {
                        console.error("Order Insert Error:", err.message);
                        return res.status(500).send("Failed to place order.");
                    }

                    // Deduct stock
                    db.run(
                        `UPDATE stocks SET stock_left = stock_left - ? WHERE petrol_type = ?`,
                        [qty, petrol_type],
                        (err) => {
                            if (err) {
                                console.error("Stock Deduction Error:", err.message);
                            }
                        }
                    );

                    console.log(`Order placed successfully with Order ID: ${this.lastID}`);
                    res.redirect(`/orderconfirmation?petrol_type=${encodeURIComponent(petrol_type)}&quantity=${encodeURIComponent(qty)}&delivery_address=${encodeURIComponent(delivery_address)}`);
                }
            );
        });
    });
});


//order id for success screen
app.get('/api/latest-order', (req, res) => {
    if (!currentUser) {
        return res.status(401).json({ error: "Unauthorized: User not logged in." });
    }

    db.get(
        `SELECT id FROM orders WHERE customer_username = ? ORDER BY id DESC LIMIT 1`,
        [currentUser],
        (err, row) => {
            if (err) {
                console.error("Database error:", err.message);
                return res.status(500).json({ error: "Failed to retrieve order ID." });
            }

            if (!row) {
                return res.status(404).json({ error: "No orders found." });
            }

            res.json({ order_id: row.id });
        }
    );
});




// Delivery Status API
app.get('/api/delivery-status', (req, res) => {
    const orderId = parseInt(req.query.orderId, 10); // Ensure it's an integer

    if (!orderId || isNaN(orderId)) {
        return res.status(400).json({ success: false, message: 'Invalid Order ID.' });
    }

    const query = `
        SELECT 
            o.id AS orderId, 
            o.petrol_type AS petrolType, 
            o.quantity, 
            o.delivery_address AS deliveryAddress, 
            o.status,  -- ✅ Include order status
            COALESCE(d.estimated_arrival, 'Not Assigned') AS estimatedArrival
        FROM orders o
        LEFT JOIN deliveries d ON o.id = d.order_id
        WHERE o.id = ?`;

    db.get(query, [orderId], (err, order) => {
        if (err) {
            console.error('Database error:', err); // Log full error
            return res.status(500).json({ success: false, message: 'Database error. Please try again.' });
        }

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found.' });
        }

        // Send order details as JSON response
        res.json({
            success: true,
            orderId: order.orderId,
            petrolType: order.petrolType,
            quantity: order.quantity,
            deliveryAddress: order.deliveryAddress,
            status: order.status,  // ✅ Send the order status
            estimatedArrival: order.estimatedArrival
        });
    });
});



// API to submit feedback
app.post("/submit-feedback", (req, res) => {
    const { feedback } = req.body;

    if (!feedback) {
        return res.status(400).json({ success: false, error: "Feedback and customer_id are required." });
    }

    // Get customer_id based on username
    const userQuery = "SELECT id FROM users WHERE username = ?";
    db.get(userQuery, [currentUser], (err, row) => {
        if (err) {
            console.error("Error fetching user ID:", err.message);
            return res.status(500).json({ success: false, error: "Database error" });
        }
        if (!row) {
            return res.status(404).json({ success: false, error: "User not found" });
        }

        const customer_id = row.id;

        // Insert feedback using retrieved customer_id
        const feedbackQuery = "INSERT INTO feedbacks (feedback, customer_id) VALUES (?, ?)";
        db.run(feedbackQuery, [feedback, customer_id], function (err) {
            if (err) {
                console.error("Error inserting feedback:", err.message);
                return res.status(500).json({ success: false, error: "Database error" });
            }
            res.json({ success: true, message: "Feedback submitted successfully!", feedbackId: this.lastID });
        });
    });
});




//driver

// Get all pending and confirmed orders
app.get('/api/get-orders', (req, res) => {
    const query = `SELECT * FROM orders WHERE status IN ('Pending', 'Confirmed') ORDER BY updated_at DESC`;
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).json({ error: 'Database retrieval failed' });
        }
        res.json(rows);
    });
});

// Update order status (Pending → Confirmed)
app.post('/api/update-order-status', (req, res) => {
    const { orderId, newStatus } = req.body;

    if (!orderId || newStatus !== 'Confirmed') {
        return res.status(400).json({ error: 'Invalid request' });
    }

    const query = `UPDATE orders 
                   SET status = 'Confirmed', updated_at = datetime('now', 'localtime') 
                   WHERE id = ? AND status IN ('Pending', 'Cancelled')`; // Allow updating from Cancelled or Pending

    db.run(query, [orderId], function (err) {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).json({ error: 'Database update failed' });
        }
        if (this.changes === 0) {
            return res.status(400).json({ error: 'No eligible order found with the given ID' });
        }
        res.json({ success: true, message: 'Order confirmed', updated_at: new Date().toLocaleString('en-MY', { timeZone: 'Asia/Kuala_Lumpur' }) });
    });
});


// Update order status (Confirmed → Delivered or Cancelled)
app.post('/api/update-driver-order-status', (req, res) => {
    const { orderId, newStatus } = req.body;

    if (!orderId || !['Delivered', 'Cancelled'].includes(newStatus)) {
        return res.status(400).json({ error: 'Invalid status update' });
    }

    const checkQuery = `SELECT status FROM orders WHERE id = ?`;
    db.get(checkQuery, [orderId], (err, row) => {
        if (err || !row) return res.status(500).json({ error: 'Order not found' });

        if (row.status !== 'Confirmed') {
            return res.status(400).json({ error: 'Order is not in Confirmed status' });
        }

        const updatedStatus = newStatus;
        const updateQuery = `UPDATE orders SET status = ?, updated_at = datetime('now', 'localtime') WHERE id = ?`;

        db.run(updateQuery, [updatedStatus, orderId], function (err) {
            if (err) {
                console.error('Database error:', err.message);
                return res.status(500).json({ error: 'Database update failed' });
            }
            res.json({ success: true, message: `Order status updated to ${updatedStatus}`, updated_at: new Date().toLocaleString('en-MY', { timeZone: 'Asia/Kuala_Lumpur' }) });
        });
    });
});

// Get all delivered orders (sorted by updated_at)
app.get('/api/get-delivered-orders', (req, res) => {
    const query = `SELECT * FROM orders WHERE status = 'Delivered' ORDER BY updated_at DESC`;
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).json({ error: 'Database retrieval failed' });
        }
        res.json(rows);
    });
});

// Fetch current stock data
app.get('/api/stock', (req, res) => {
    const query = "SELECT petrol_type, stock_left, availability FROM stocks";

    db.all(query, [], (err, rows) => {
        if (err) {
            console.error("Database error:", err.message);
            return res.status(500).json({ error: "Failed to fetch stock data." });
        }
        const stockData = rows.reduce((result, row) => {
            result[row.petrol_type] = { stock_left: row.stock_left, availability: row.availability };
            return result;
        }, {});
        res.json(stockData);
    });
});

//resource manager
// Update stock data
app.post('/api/stock', (req, res) => {
    const stockUpdates = req.body;

    try {
        const updatePromises = Object.entries(stockUpdates).map(([petrolType, details]) => {
            return new Promise((resolve, reject) => {
                const query = `
                    UPDATE stocks 
                    SET stock_left = ?, availability = ? 
                    WHERE petrol_type = ?`;
                db.run(query, [details.stock_left, details.availability, petrolType], function (err) {
                    if (err) {
                        return reject(err);
                    }
                    resolve();
                });
            });
        });

        Promise.all(updatePromises)
            .then(() => {
                res.json({ message: "Stock data updated successfully!" });
            })
            .catch(err => {
                console.error("Error updating stock data:", err.message);
                res.status(500).json({ error: "Failed to update stock data." });
            });
    } catch (err) {
        console.error("Error:", err.message);
        res.status(500).json({ error: "An unexpected error occurred." });
    }
});


// Get all users
app.get('/users', (req, res) => {
    db.all('SELECT id, fullname, email, username, role FROM users', [], (err, rows) => {
        if (err) {
            console.error(err.message);
            res.status(500).send('Database error.');
            return;
        }
        res.json(rows);
    });
});

// Get user by ID
app.get('/users/:id', (req, res) => {
    const userId = req.params.id;
    db.get('SELECT id, fullname, email, username, role FROM users WHERE id = ?', [userId], (err, row) => {
        if (err) {
            console.error(err.message);
            res.status(500).send('Database error.');
            return;
        }
        if (!row) {
            res.status(404).send('User not found.');
            return;
        }
        res.json(row);
    });
});

// Update user details
app.put('/users/:id', (req, res) => {
    const { fullname, email, username, role, password } = req.body;
    const userId = req.params.id;

    if (!fullname || !email || !username || !role) {
        return res.status(400).send('All fields except password are required.');
    }

    let updateQuery = `UPDATE users SET fullname = ?, email = ?, username = ?, role = ?`;
    let params = [fullname, email, username, role];

    if (password) {
        updateQuery += `, password = ?`;
        params.push(password);
    }

    updateQuery += ` WHERE id = ?`;
    params.push(userId);

    db.run(updateQuery, params, function (err) {
        if (err) {
            console.error(err.message);
            res.status(500).send('Error updating user.');
            return;
        }
        if (this.changes === 0) {
            res.status(404).send('User not found.');
            return;
        }
        res.send('User updated successfully.');
    });
});

// Delete user
app.delete('/users/:id', (req, res) => {
    db.run('DELETE FROM users WHERE id = ?', [req.params.id], function (err) {
        if (err) {
            console.error(err.message);
            res.status(500).send('Error deleting user.');
            return;
        }
        res.send('User deleted successfully.');
    });
});


// Get all feedbacks with customer details
app.get('/feedbacks', (req, res) => {
    const query = `
        SELECT 
            f.id AS feedback_id, 
            f.feedback, 
            u.id AS customer_id, 
            u.fullname AS customer_name, 
            u.email AS customer_email
        FROM feedbacks f
        JOIN users u ON f.customer_id = u.id
        ORDER BY f.id DESC
    `;

    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Error fetching feedbacks:', err);
            return res.status(500).json({ error: 'Database error', details: err.message });
        }

        res.json(rows);
    });
});

//view all orders
app.get('/orders', (req, res) => {
    const query = `
        SELECT 
            o.id AS order_id,
            o.customer_id,
            u.fullname AS customer_name,
            u.email AS customer_email,
            o.petrol_type,
            o.quantity,
            o.delivery_address,
            o.price,
            o.status,
            o.updated_at
        FROM orders o
        JOIN users u ON o.customer_id = u.id
        ORDER BY o.id DESC
    `;

    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Error fetching orders:', err);
            return res.status(500).json({ error: 'Database error', details: err.message });
        }

        res.json(rows);
    });
});





// Start the server
app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
