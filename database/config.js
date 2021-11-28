import mysql from "mysql2";
import dotenv from "dotenv";
dotenv.config();

export let connection;

(async () => {
    connection = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });
})()

function disconnectHandler() {
    console.log("buhu");
}

connection.on('error', err => {
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        // db error reconnect
        disconnectHandler();
    } else {
        throw err;
    }
});

