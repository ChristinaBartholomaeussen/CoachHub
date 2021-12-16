import dotenv from "dotenv";
dotenv.config();

import express from "express";
const athleteRouter = express.Router();

import { createAthletePage } from "../render/render.js";
import { connectionPool } from "../database/config.js";
import { isValidEmail } from "../middleware/auth.js";

// PAGES -------------------------------------------------------------
const athleteFrontpage = createAthletePage("/athlete/frontpage/frontpage.html", {
    title: " Velkommen ",
});

const homepage = createAthletePage("/athlete/homepage/homepage.html", {
    title: "Min Side"
});

const calendarPage = createAthletePage("/athlete/calendar/calendar.html", {
    title: "Kalender"
});

// ROUTERS --------------------------------------------------------------

athleteRouter.get("/welcome", (req, res) => {
    res.send(athleteFrontpage);
});

athleteRouter.get("/calendar", (req, res) => {
    res.send(calendarPage);
});

athleteRouter.get("/homepage", (req, res) => {
    res.send(homepage);
});

athleteRouter.get("/", async (req, res) => {

    const connect = await connectionPool.getConnection();

    try {
        const [rows] = await connect.execute(`SELECT u.email, a.first_name, a.last_name, 
        a.phone_number, a.date_of_birth FROM users u 
        JOIN athletes a ON a.user_id = u.user_id
        WHERE u.user_id = ?;`, [req.user["id"]]);

        connect.release();
        return res.send({ users: rows });

    } catch (err) {
        return res.status(500).send();
    }

});

athleteRouter.delete("/", async (req, res) => {

    const connect = await connectionPool.getConnection();

    await connect.beginTransaction();

    try {

        await connect.execute(`DELETE FROM users WHERE user_id = ?;`, [req.user["id"]]);

        await connect.commit();
        connect.release();
        return res.status(200).send();

    } catch (err) {
        connect.rollback();
        return res.status(500).send();
    }

});


athleteRouter.patch("/", isValidEmail, async (req, res) => {

    const { email, first_name, last_name, phone_number, date_of_birth } = req.body;
    if (!email || !first_name || !last_name || !phone_number || !date_of_birth) {

        return res.status(400).send();

    } else {

        const connect = await connectionPool.getConnection();
        await connect.beginTransaction();

        try {
            await connect.execute(`UPDATE users u 
            JOIN athletes a ON u.user_id = a.user_id
            SET u.email = ?, a.first_name = ?, a.last_name = ?, a.date_of_birth = ?,
            a.phone_number = ? 
            WHERE u.user_id = ?`, [email, first_name, last_name, date_of_birth, phone_number, req.user["id"]]);

            await connect.commit();
            connect.release();
            return res.status(200).send();

        }
        catch (err) {
            connect.rollback();
            return res.status(500).send();
        }
    }
});

athleteRouter.get("/bookings", async (req, res) => {

    try {

        const [rows] = await connectionPool.query(`SELECT b.*, s.title FROM bookings b
        JOIN training_sessions ts ON b.session_id = ts.session_id
        JOIN services s on ts.service_id = s.service_id
        WHERE b.athlete_id = ?`, [req.user["id"]]);

        return res.send({ bookings: rows });

    } catch (err) {

        return res.sendStatus(500);
    }
});

athleteRouter.post("/bookings", async (req, res) => {

    const connect = await connectionPool.getConnection();

    const { booking_date, booking_start, booking_end, session_id } = req.body;

    await connect.beginTransaction();

    try {
        await connect.execute(`INSERT INTO bookings (booking_date, booking_start, booking_end, athlete_id, session_id)
        VALUES (?, ?, ?, ?, ?)`, [booking_date, booking_start, booking_end, req.user["id"], session_id]);


        await connect.commit();
        connect.release();
        return res.status(200).send();

    } catch (err) {
        connect.rollback();
        return res.status(500).send();
    }

});

export { athleteRouter };