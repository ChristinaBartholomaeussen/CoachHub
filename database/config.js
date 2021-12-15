import dotenv from "dotenv";
dotenv.config();

import mysql from "mysql2/promise";

const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit : 100,
    multipleStatements: true
}

const connectionPool = mysql.createPool(config);


export {connectionPool};