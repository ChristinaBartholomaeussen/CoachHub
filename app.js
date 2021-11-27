import express from "express";
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
import dotenv from "dotenv";

dotenv.config();


import { connection } from "./database/config.js";


app.get("/", (req, res) => {

    connection.query("SELECT idmytest FROM mytest", function (err, result) {
        res.send(result);
    });


});





const PORT = process.env.PORT || 3000

app.listen(PORT, (error) => {
    console.log("Server is running on port", PORT);
});