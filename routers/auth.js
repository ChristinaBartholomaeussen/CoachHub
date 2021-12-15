import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";

import bcrypt from "bcrypt";

import express from "express";
const authRouter = express.Router();

import jwt from "jsonwebtoken";
import connection from "../database/config.js";

import { authenticateToken, tokenIsValid, isEnabled, isValidEmail, usernameIsValid } from "../middleware/auth.js";

import { createAdminPage, createAthletePage, createCoachPage, createPage } from "../render/render.js";


const loginPage = createPage("./auth/login.html", {
    title: "Login"
});


const createUserPage = createPage("./auth/create_user.html", {
    title: "Opret Ny Bruger"
});


authRouter.get("/login", (req, res) => {
    res.send(loginPage);
});


const forumPageAthlete = createAthletePage("./auth/forum.html", {
    tile: "Forum"
});

const forumPageCoach = createCoachPage("./auth/forum.html", {
    tile: "Forum"
});

const forumPageAdmin = createAdminPage("./auth/forum.html", {
    tile: "Forum"
});



authRouter.get("/forum", authenticateToken, (req, res) => {

    if (req.user["role_id"] === 1) {
        return res.send(forumPageAdmin);
    } else if (req.user["role_id"] === 2) {
        return res.send(forumPageCoach);
    } else {
        return res.send(forumPageAthlete);
    }
});


authRouter.post("/login", isEnabled, async (req, res) => {

    const [rows] = await connection.execute("SELECT * FROM users WHERE email = ?", [req.body.email]);

    if (Object.entries(rows).length !== 0) {

        const isCorrect = await bcrypt.compare(req.body.password, rows[0]["password"]);

        if (isCorrect || req.body.password === rows[0]["password"]) {

            const user = {
                email: rows[0]["email"],
                role_id: rows[0]["role_id"],
                username: rows[0]["username"],
                id: rows[0]["user_id"]
            };

            const token = jwt.sign(user, process.env.ACCESS_TOKEN_KEY);

            return res.cookie('accessToken', token).status(200).send({ role: user["role_id"] });

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

authRouter.post("/coachs", isValidEmail, usernameIsValid, async (req, res) => {

    const { email, password, username, postal_code, street_name, number, phone, coach_type,
        first_name, last_name, company_name, cvr_number } = req.body;

    const connect = await connection.getConnection();

    await connect.beginTransaction();

    try {

        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);

        const userId = await connect.execute("INSERT INTO users (email, password, username, role_id) VALUES (?, ?, ?, ?);",
            [email, hashedPassword, username, 2]);

        const postalCode = await connect.execute("SELECT city_id FROM cities WHERE postal_code = ?;",
            [postal_code]);


        if (postalCode[0][0]["city_id"] === undefined) return res.status(400).send();

        const addressId = await connect.execute("INSERT INTO address (street_name, number, city_id) VALUES (?, ?, ?);",
            [street_name, number, postalCode[0][0]["city_id"]]);


        await connect.execute(`INSERT INTO coachs (user_id, phone_number, coach_type_id, address_id) VALUES
            (?, ?, ?, ?);`, [userId[0]["insertId"], phone, coach_type, addressId[0]["insertId"]]);


        if (coach_type === 1) {

            await connect.execute(`INSERT INTO private_coachs (user_id, first_name, last_name) VALUES
                (?,?,?)`, [userId[0]["insertId"], first_name, last_name]);

        } else if (coach_type === 2) {

            await connect.execute(`INSERT INTO commercial_coachs (user_id, company_name, cvr_number) VALUES
                (?,?,?)`, [userId[0]["insertId"], company_name, cvr_number]);

        }

        await connect.commit();
        connect.release();
        return res.status(200).send();

    } catch (err) {
        connect.rollback();
        console.log(err);
        return res.status(400).send();
    }
});

authRouter.post("/athletes", isValidEmail, usernameIsValid, async (req, res) => {

    const connect = await connection.getConnection();
    await connect.beginTransaction();

    const { email, first_name, last_name, username, password, gender, date_of_birth, phone } = req.body;

    try {

        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);

        const token = jwt.sign({ name: email }, process.env.CONFIRMATION_TOKEN_KEY);

        const [ResultSetHeader] = await connect.execute(`INSERT INTO users (email, password, username, role_id) 
            VALUES (?, ?, ?, ?);`, [email, hashedPassword, username, 3]);

        await connect.execute(`INSERT INTO athletes (first_name, last_name, gender, date_of_birth, phone_number, user_id)
            VALUES (?, ?, ?, ?, ?, ?);`,
            [first_name, last_name, gender,
                date_of_birth, phone, ResultSetHeader["insertId"]]);

        await connect.execute(`INSERT INTO confirmation_tokens (token, user_id)
            VALUES (?, ?);`, [token, ResultSetHeader["insertId"]]);

        const transporter = nodemailer.createTransport({
            port: 465,
            host: "smtp.gmail.com",
            auth: {
                user: process.env.NODEMAILER_USER,
                pass: process.env.NODEMAILER_PASS
            },
            secure: true
        });

        const link = `http://localhost:8080/confirm?token=${token}`; // development link
        //const link = `https://christina-nodejs-eksamen.herokuapp.com/confirm?token=${token}`; //deploy link

        const mailOption = {
            from: process.env.NODEMAILER_USER,
            to: email,
            subject: "Bekræft Oprettelse",
            html:
                `<h1>Velkommen ${first_name} ${last_name}</h1>
                <a href="${link}">Bekræft email</a>`
        }

        transporter.sendMail(mailOption, (error) => {
            if (error) return res.status(500).send();
        });

        await connect.commit();
        connect.release();
        return res.status(201).send();

    } catch (err) {
        console.log(err);
        connect.rollback();
        return res.status(500).send();
    }
});


authRouter.get("/confirm", tokenIsValid, async (req, res) => {

    const connect = await connection.getConnection();
    await connect.beginTransaction();

    try {

        await connect.execute(`UPDATE users u
            JOIN confirmation_tokens ct on u.user_id = ct.user_id
            SET u.isEnabled = 1 
            WHERE ct.token = ?`, [req.query.token]);

        await connect.commit();
        connect.release();
        return res.redirect("/login");

    } catch (err) {
        console.log(err);
        connect.rollback();
        return res.status(500).send();
    }

});

export default authRouter;


