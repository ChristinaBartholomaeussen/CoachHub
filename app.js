import express from "express";
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
import dotenv from "dotenv";
dotenv.config();


import {connection} from "./database/config.js";

connection.query("SELECT * FROM 'users");


app.get("/", (req, res) => {
    var bla = connection.query("SELECT * FROM 'users");
    res.json(bla);
});





const PORT = process.env.PORT || 3000

app.listen(PORT, (error) => {
    console.log("Server is running on port", PORT);
});