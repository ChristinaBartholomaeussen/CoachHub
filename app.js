import express from "express";
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
import dotenv from "dotenv";
dotenv.config();


import {connection} from "./database/config.js";


connection.connect();
console.log(connection);

app.get("/", (req, res) => {
    
   
});





const PORT = process.env.PORT || 3000

app.listen(PORT, (error) => {
    console.log("Server is running on port", PORT);
});