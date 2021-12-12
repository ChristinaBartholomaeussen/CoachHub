import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcrypt";

import express from "express";
const authRouter = express.Router();

import jwt from "jsonwebtoken";
import connection from "../database/config.js";

import {authenticateToken} from "../middleware/auth.js";
import { isEnabled } from "../middleware/auth.js";

import { createPage } from "../render/render.js";



//Create page
const loginPage = createPage("./auth/login.html", {
    title: "Login | Frontpage"
});


const createUserPage = createPage("./auth/create_user.html", {
    title: "Opret Ny Bruger"
});


authRouter.get("/login", (req, res) => {
    res.send(loginPage);
});

/***
 * Awaiter den spcifikke bruger fra databasen. Hvis objektet ikke er tomt
 * tjekkes der, om password i reg.body er det samme som det i databasen. 
 * Hvis disse er ens laves der et nyt objekt med en email og rolle_id. 
 * Ud fra dette bliver der genereret en token ved brug af JWT.
 * Derefter bliver der sat en ny cookie "accessToken" med værdien af den
 * generedede token. Brugeren sendes med retur til frontend.
 */

authRouter.post("/login", isEnabled, async (req, res) => {

    const [rows] = await connection.execute("SELECT * FROM users WHERE email = ?", [req.body.email]);

    console.log(rows)

    if (Object.entries(rows).length !== 0) {

        const isCorrect = await bcrypt.compare(req.body.password, rows[0]["password"]);           
        

        if (isCorrect || req.body.password === rows[0]["password"]) {

            const user = {
                email: rows[0]["email"],
                role_id: rows[0]["role_id"],
                token: rows[0]["token"],
                id: rows[0]["user_id"]
            };

            const token = jwt.sign(user, process.env.ACCESS_TOKEN_KEY);

        
            return res.cookie('accessToken', token).status(200).send({user});

        } else {
            return res.status(401).send();
        } 
    }


});



authRouter.get("/logout", authenticateToken, (req, res) => {
    return res.clearCookie("accessToken").status(200).redirect("/");
});

authRouter.get("/signup", (req, res) => {
    res.send(createUserPage);
});

const newAthlete = createPage("/athlete/createAthlete.html", {
    title: " New Athelet "
});


authRouter.get("/signup/athletes", (req, res) => {
    res.send(newAthlete);
});

const newCoach = createPage("/coach/createCoach.html", {
    title: " New Coach "
});

authRouter.get("/signup/coachs", (req, res) => {
    res.send(newCoach);
});

authRouter.post("/coachs", async (req, res) => {

    console.log(req.body);

    const [rows] = await connection.execute("SELECT * FROM users WHERE email = ?", [req.body.email]);

    if (Object.entries(rows).length === 0) {

        const conn = await connection.getConnection();

        await conn.beginTransaction();

        try {

            //hasher password
            const salt = await bcrypt.genSalt();
            const hashedPassword = await bcrypt.hash(req.body.password, salt);

            //Genererer en random token, for ikke at expose id, når brugeren skal redirectes til sin egen side
            const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);


            //indsætter oplysninger i user tabellen
            const userId = await conn.execute("INSERT INTO users (email, password, token, role_id) VALUES (?, ?, ?, ?);",
                [req.body.email, hashedPassword, token, 2]);


            // henter id for den spefikke by, de tilhører postnummeret
            const postalCode = await conn.execute("SELECT city_id FROM cities WHERE postal_code = ?;",
                [req.body.postal_code]);


            //Hvis postnummeret ikke findes sendes der en statuskode
            if (postalCode[0][0]["city_id"] === undefined) return res.status(400).send();

            //Indsætter oplysninger i adresse tabellen 
            const addressId = await conn.execute("INSERT INTO address (street_name, number, city_id) VALUES (?, ?, ?);",
                [req.body.street_name, req.body.number, postalCode[0][0]["city_id"]]);


            
            //Indsætter oplysninger i coach tabellen
            await conn.execute(`INSERT INTO coachs (user_id, phone_number, coach_type_id, address_id) VALUES
            (?, ?, ?, ?);`, [userId[0]["insertId"], req.body.phone, req.body.coach_type, addressId[0]["insertId"]]);

       
            //Alt efter om typen af coach er private eller virksomheden
            if (req.body.coach_type === 1) {

                await conn.execute(`INSERT INTO private_coachs (user_id, first_name, last_name) VALUES
                (?,?,?)`, [userId[0]["insertId"], req.body.first_name, req.body.last_name]);

            } else if (req.body.coach_type === 2) {

                await conn.execute(`INSERT INTO commercial_coachs (user_id, company_name, cvr_number) VALUES
                (?,?,?)`, [userId[0]["insertId"], req.body.company_name, req.body.cvr_number]);

            }

            //Comitter ændringerne til databasen & sender sender statuskode retur
            await conn.commit();
            return res.status(200).send();

        } catch (err) {
            conn.rollback();
            console.log(err);
            return res.status(400).send();
        }

    }

    return res.status(409).send();

});

export default authRouter;


