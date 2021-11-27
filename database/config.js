import mysql from "mysql";
import dotenv from "dotenv";
dotenv.config();

const connection = mysql.createPool({
    host: 'eu-cdbr-west-01.cleardb.com',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});


export {connection}