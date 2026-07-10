import mysql from "mysql2";

// MySQL connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "business"
});

db.connect((err) => {
    if (err) {
        console.log("MySQL error:", err.message);
    } else {
        console.log("MySQL connected");
    }
});

export default db;