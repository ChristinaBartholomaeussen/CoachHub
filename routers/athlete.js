import dotenv from "dotenv";
dotenv.config();

import express from "express";
const athleteRouter = express.Router();

import jwt from "jsonwebtoken";

import bcrypt from "bcrypt";

import { createAthletePage } from "../render/render.js";

import connection from "../database/config.js";

import nodemailer from "nodemailer";
import { authenticateToken } from "../middleware/auth.js";

const athleteFrontpage = createAthletePage("/athlete/frontpage.html", {
    title: " Athlete Frontpage"
});

athleteRouter.get("/", (req, res) => {
    
    const tokenId = req.cookies["accessToken"]
    const user = jwt.verify(tokenId, process.env.ACCESS_TOKEN_KEY);
    

    res.send(athleteFrontpage);
})



athleteRouter.post("/", async (req, res) => {

    const conn = await connection.getConnection();
    await conn.beginTransaction();

    try {
        //Tjek om der allerede findes en bruger med den indtastede email
        const [rows] = await conn.execute("SELECT * FROM users WHERE email = ?", [req.body.email]);

        if (Object.entries(rows).length === 0) {

            //hasher password brugeren indtaster, inden det kommer ind i databasen
            const salt = await bcrypt.genSalt();
            const hashedPassword = await bcrypt.hash(req.body.password, salt);

            //Generer en ny confirmation token til brugeren, der udløber efter 2 timer
            const token = jwt.sign({ name: req.body.email }, process.env.CONFIRMATION_TOKEN_KEY, {
                expiresIn: "2h"
            });

            //Generer en radom string, for ikke at expose brugerns id, når vi redirecter til deres egen side
            const userToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);


            //Vi skal bruge den autoincrementerede ID 
            const [ResultSetHeader] = await conn.execute(`INSERT INTO users (email, password, token, role_id) 
            VALUES (?, ?, ?, ?);`, [req.body.email, hashedPassword, userToken, 3]);


            await conn.execute(`INSERT INTO athletes (first_name, last_name, gender, date_of_birth, phone_number, user_id)
            VALUES (?, ?, ?, ?, ?, ?);`,
                [req.body.first_name, req.body.last_name, req.body.gender,
                req.body.date_of_birth, req.body.phone, ResultSetHeader["insertId"]]);


            //Decoder overstående token, så iat og exp kan indsættes i databasen
            const base64String = token.split('.')[1];
            const decodedValue = JSON.parse(Buffer.from(base64String, 'base64').toString('ascii'));


            await conn.execute(`INSERT INTO confirmation_tokens (token, created_at, expires_at, user_id)
            VALUES (?, ?, ?, ?);`, [token, decodedValue["iat"], decodedValue["exp"], ResultSetHeader["insertId"]]);


            const transporter = nodemailer.createTransport({
                port: 465,
                host: "smtp.gmail.com",
                auth: {
                    user: process.env.NODEMAILER_USER,
                    pass: process.env.NODEMAILER_PASS
                },
                secure: true
            });

            const link = `http://localhost:8080/athlete/confirm?token=${token}`;


            const mailOption = {
                from: process.env.NODEMAILER_USER,
                to: req.body.email,
                subject: "Bekræft Oprettelse",
                html:
                    `<h1>Velkommen ${req.body.first_name} ${req.body.last_name}</h1>
                <a href="${link}">Bekræft email</a>`
            }

            transporter.sendMail(mailOption, (error) => {
                if (error) return res.status(500).send();


            });

            await conn.commit();
            return res.status(201).send();

        } else {
            return res.status(409).send();

        }
    } catch (err) {
        console.log(err);
        conn.rollback();
        return res.status(500).send();
    }
});


athleteRouter.get("/confirm", async (req, res) => {

    let token = req.query.token;

    const conn = await connection.getConnection();

    await conn.beginTransaction()

    try {

        await conn.execute(`UPDATE users u
    JOIN confirmation_tokens ct on u.user_id = ct.user_id
    SET u.isEnabled = if (ct.expires_at > UNIX_TIMESTAMP(), 1, u.isEnabled)
    WHERE ct.token = ?`, [token]);

        await conn.commit();

        return res.send({ token: token });

    } catch (err) {
        return res.status(500).send();
    }

});











export default athleteRouter;