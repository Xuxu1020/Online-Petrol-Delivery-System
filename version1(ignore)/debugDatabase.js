const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./database.db");

db.serialize(() => {
    db.each("SELECT name FROM sqlite_master WHERE type='table';", (err, row) => {
        if (err) {
            console.error("Error reading tables:", err.message);
        } else {
            console.log("Found table:", row.name);
        }
    });
});

db.close();
