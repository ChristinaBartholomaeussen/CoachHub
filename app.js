import express from "express";
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

import dotenv from "dotenv";
dotenv.config();

import { createPage } from "./render.js";
const frontpage = createPage("frontpage.html", {
    title: "Blabla | Frontpage "
});


app.get("/", (req, res) => {
    res.send(frontpage);
})

import mysql from "mysql2";

import { connection } from "./database/config.js";

/*
const query1 = () => {
    return new Promise((resolve, reject) => {
        connection.query("SELECT * FROM mytest", (error, result) => {
            if(error) {
                return reject(error);
            }
            return resolve(result);
        });
    });
};

async function blabla() {
    const r1 = await query1();
    const promis =[r1];

    try{
        const result = await Promise.all(promis);
        console.log(result);
    }catch(error) {
        console.log(error);
    }
}*/


import bcrypt from "bcrypt";
import {admin_password} from "./encryption.js";

/*app.get("/", async (req, res) => {
    
    //await blabla();

});*/





const PORT = process.env.PORT || 3000

app.listen(PORT, (error) => {
    console.log("Server is running on port", PORT);
});