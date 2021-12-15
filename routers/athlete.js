import dotenv from "dotenv";
dotenv.config();

import express from "express";
const athleteRouter = express.Router();

import { createAthletePage } from "../render/render.js";

import connection from "../database/config.js";

import { isValidEmail } from "../middleware/auth.js";

const athleteFrontpage = createAthletePage("/athlete/frontpage.html", {
    title: " Athlete Frontpage"
});

const homepage = createAthletePage("/athlete/homepage.html", {
    title: "Homepage"
});

const calendarPage = createAthletePage("/athlete/calendar.html", {
    title: "Kalender"
});


athleteRouter.get("/bookings", async (req, res) => {

    const connect = await connection.getConnection();

    await connect.beginTransaction();
    
    try{

        const [rows] = await connect.execute(`SELECT b.*, s.title FROM bookings b
        JOIN training_sessions ts ON b.session_id = ts.session_id
        JOIN services s on ts.service_id = s.service_id
        WHERE b.athlete_id = ?`, [req.user["id"]]);

        await connect.commit();
        connect.release();
        return res.send({bookings : rows});


    } catch(err) {
        console.log(err);
        connect.rollback();
        return res.sendStatus(500);
    }



});

athleteRouter.get("/", (req, res) => {
    res.send(athleteFrontpage);
});

athleteRouter.get("/calendar", (req, res) => {
    res.send(calendarPage);
});


athleteRouter.get("/homepage", (req, res) => {
    res.send(homepage);
});

athleteRouter.delete("/", async (req, res) => {

    const connect = await connection.getConnection();

    try {

        await connect.execute(`DELETE FROM users WHERE user_id = ?;`, [req.user["id"]]);

        connect.release();

        return res.status(200).send();

    } catch (err) {
        console.log(err);
        return res.status(500).send();
    }

})


athleteRouter.patch("/", isValidEmail, async (req, res) => {

    const { email, first_name, last_name, phone_number, date_of_birth } = req.body;
    if (!email || !first_name || !last_name || !phone_number || !date_of_birth) {

        return res.status(400).send();

    } else {
        const connect = await connection.getConnection();
        try {
            await connect.execute(`UPDATE users u 
            JOIN athletes a ON u.user_id = a.user_id
            SET u.email = ?, a.first_name = ?, a.last_name = ?, a.date_of_birth = ?,
            a.phone_number = ? 
            WHERE u.user_id = ?`, [email, first_name, last_name, date_of_birth, phone_number, req.user["id"]]);

            connect.release();
            return res.status(200).send();

        }
        catch (err) {
            console.log(err);
            return res.status(500).send();
        }
    }

});



athleteRouter.get("/api", async (req, res) => {

    const connect = await connection.getConnection();

    try {
        const [rows] = await connect.execute(`SELECT u.email, a.first_name, a.last_name, 
        a.phone_number, a.date_of_birth FROM users u 
        JOIN athletes a ON a.user_id = u.user_id
        WHERE u.user_id = ?;`, [req.user["id"]]);

        connect.release();
        return res.send({ users: rows });

    } catch (err) {
        console.log(err);
        return res.status(500).send();
    }

})








export default athleteRouter;