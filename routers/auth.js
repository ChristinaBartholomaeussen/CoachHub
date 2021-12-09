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


    if (Object.entries(rows).length !== 0) {

        const isCorrect = await bcrypt.compare(req.body.password, rows[0]["password"]);

        if (isCorrect) {

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
export default authRouter;


