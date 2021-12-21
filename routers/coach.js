import express from "express";
import { connectionPool } from "../database/config.js";
const coachRouter = express.Router();

import { createCoachPage } from "../render/render.js";
import { isValidEmail } from "../middleware/auth.js";
import nodemailer from "nodemailer";

// PAGES --------------------------------------------
const coachServices = createCoachPage("/coach/services/services.html", {
    title: " Mine Ydelser "
});

const coachCalendar = createCoachPage("/coach/calendar/calendar.html", {
    title: " Min Kalender "
});

const coachHomepage = createCoachPage("/coach/homepage/homepage.html", {
    title: " Min Side "
})

coachRouter.get("/welcome", (req, res) => {
    res.send(coachHomepage);
});

coachRouter.get("/calendar", (req, res) => {
    res.send(coachCalendar);
});

coachRouter.get("/myservices", (req, res) => {
    res.send(coachServices);
});

// ROUTERS ------------------------------------------------------

coachRouter.delete("/bookings/:id", async (req, res) => {

    const sessionBookingId = req.params.id;

    const connect = await connectionPool.getConnection();

    try {
        await connect.execute(`DELETE FROM bookings WHERE session_id = ?`, [sessionBookingId]);

        connect.release();
        return res.status(200).send();

    } catch (err) {
        return res.status(500).send();
    }
});

coachRouter.patch("/bookings/:id", async (req, res) => {

    const sessionId = req.params.id;

    const connect = await connectionPool.getConnection();

    const { email, first_name, last_name, gender, phone_number } = req.body;

    const reciever = req.user["email"];

    await connect.beginTransaction();

    try {
        await connect.execute(`UPDATE bookings SET isConfirmed = 1
        WHERE session_id = ?;`, [sessionId]);

        await connect.execute(`UPDATE training_sessions SET isBooked = 1 WHERE session_id = ?;`, 
        [sessionId]);

        const transporter = nodemailer.createTransport(sgTranport({
            auth: {
                api_key: process.env.SENDGRID_API_KEY
            },
        }));

        const mailOption = {
            from: process.env.NODEMAILER_USER,
            to: reciever,
            subject: "Booking Bekræftelse",
            html:
                `<h1>Information på sportudøver: </h1>
                <p>Navn: ${first_name} ${last_name}</p>
                <p>Køn: ${gender}</p>
                <p>Email: ${email}</p>
                <p>Tlf.: ${phone_number}</p>`
        };

        transporter.sendMail(mailOption, async (error) => {
            if (error) {

                connect.rollback();
                return res.status(500).send();
            }

            await connect.commit();
            connect.release();
            return res.status(200).send();
        });

    } catch (err) {
        connect.rollback();
        return res.status(500).send();
    }
});


coachRouter.get("/bookings", async (req, res) => {

    const connect = await connectionPool.getConnection();

    try {

        const [rows] = await connect.execute(`SELECT b.booking_date, b.booking_start, b.booking_end, b.isConfirmed, 
        b.session_id, a.first_name, a.last_name, a.phone_number, a.gender, s.title, u.email
        FROM bookings b
        JOIN training_sessions ts ON b.session_id = ts.session_id
        JOIN services s ON ts.service_id = s.service_id
        JOIN athletes a ON b.athlete_id = a.user_id
        JOIN users u ON a.user_id = u.user_id
        WHERE s.user_id = ?;`, [req.user["id"]]);

        connect.release();
        return res.send({ bookings: rows });


    } catch (err) {
        return res.status(500).send();
    }

});




coachRouter.get("/", async (req, res) => {

    const connect = await connectionPool.getConnection();

    try {

        const coachType = await connect.execute(`SELECT coachs.coach_type_id 
        FROM coachs WHERE coachs.user_id = ?`, [req.user["id"]]);

        if (coachType[0][0]["coach_type_id"] === 1) {

            const [rows] = await connect.execute(`SELECT u.email, c.phone_number, c.coach_type_id, p.first_name, p.last_name, 
            ci.city_name, ci.postal_code, a.street_name, a.number
            FROM users u
            JOIN coachs c ON c.user_id = u.user_id
            JOIN private_coachs p ON c.user_id = p.user_id
            JOIN address a ON c.address_id = a.address_id
            JOIN cities ci ON a.city_id = ci.city_id
            WHERE u.user_id = ?;`, [req.user["id"]]);

            connect.release();
            return res.send({ coachs: rows });

        } else if (coachType[0][0]["coach_type_id"] === 2) {
            const [rows] = await connect.execute(`SELECT u.email, c.phone_number, c.coach_type_id, cc.company_name, cc.cvr_number, 
            ci.city_name, ci.postal_code, a.street_name, a.number
            FROM users u
            JOIN coachs c ON c.user_id = u.user_id
            JOIN commercial_coachs cc ON c.user_id = cc.user_id
            JOIN address a ON c.address_id = a.address_id
            JOIN cities ci ON a.city_id = ci.city_id
            WHERE u.user_id = ?;`, [req.user["id"]]);

            connect.release();
            return res.send({ coachs: rows });
        }

    } catch (err) {
        return res.status(500).send();
    }

});


coachRouter.delete("/", async (req, res) => {

    const connect = await connectionPool.getConnection();

    try {

        await connect.execute("DELETE FROM users WHERE user_id = ?", [req.user["id"]]);
        connect.release();
        return res.status(200).send();

    } catch (err) {
        return res.status(500).send();
    }

});

coachRouter.patch("/", isValidEmail, async (req, res) => {

    const connect = await connectionPool.getConnection();
    await connect.beginTransaction();

    const [rows] = await connect.execute(`SELECT city_id FROM cities WHERE postal_code = ?;`, [req.body.postal_code]);

    if (Object.entries(rows).length === 0) {
        return res.status(400).send();

    } else {

        const { street_name, number, email, phone_number } = req.body;

        const [ResultHeader] = await connect.execute(`INSERT INTO address (street_name, number, city_id)
                VALUES (?, ?, ?);`, [street_name, number, rows[0]["city_id"]]);


        if (req.body.coach_type === 1) {

            const { first_name, last_name } = req.body;

            try {

                await connect.execute(`UPDATE users u 
                    JOIN coachs c ON u.user_id = c.user_id
                    JOIN private_coachs cp on c.user_id = cp.user_id 
                    SET cp.first_name = ?, cp.last_name = ?, u.email = ?, 
                    c.phone_number = ?, c.address_id = ?
                    WHERE u.user_id = ?;`, [first_name, last_name, email, phone_number,
                        ResultHeader["insertId"], req.user["id"]]);


                await connect.commit();
                connect.release();
                return res.status(200);
            } catch (err) {
                connect.rollback();
                return res.status(500).send();
            }

        } else if (req.body.coach_type === 2) {

            const { company_name, cvr_number } = req.body;

            try {

                await connect.execute(`UPDATE users u 
                JOIN coachs c ON u.user_id = c.user_id
                JOIN commercial_coachs cc on c.user_id = cc.user_id 
                SET cc.company_name = ?, cc.cvr_number = ?, u.email = ?, 
                c.phone_number = ?, c.address_id = ?
                WHERE u.user_id = ?;`, [company_name, cvr_number, email, phone_number,
                    ResultHeader["insertId"], req.user["id"]]);

                await connect.commit();
                connect.release();
                return res.status(200);

            } catch (err) {
                connect.rollback();
                return res.status(500).send();
            }
        }
    }
});

coachRouter.get("/training-sessions", async (req, res) => {

    try {

        const [rows] = await connectionPool.query(`SELECT ts.*, s.title FROM training_sessions ts
        JOIN services s ON ts.service_id = s.service_id
        JOIN coachs c ON s.user_id = c.user_id
        WHERE c.user_id = ? AND ts.isBooked = 0`, [req.user["id"]]);

        return res.send({ training_sesssions: rows });

    } catch (err) {
        return res.status(500).send();
    }

});

coachRouter.delete("/training-sessions/:sessionId", async (req, res) => {

    const connect = await connectionPool.getConnection();

    await connect.beginTransaction();

    try {
        await connect.execute(`DELETE ts FROM training_sessions ts
        JOIN services s ON s.service_id = ts.service_id
        JOIN coachs c ON c.user_id = s.user_id
        WHERE c.user_id = ? AND ts.session_id = ?;`,
            [req.user["id"], req.params.sessionId]);

        await connect.commit();
        connect.release();
        return res.status(200).send();

    } catch (err) {
        connect.rollback();
        return res.status(500);
    }

});


coachRouter.post("/training-sessions", async (req, res) => {

    const { service_id, date, start, end } = req.body;

    if (!service_id || !date || !start || !end || new Date(date) < new Date() || start > end) {

        return res.status(400).send();

    } else {

        const connect = await connectionPool.getConnection();

        await connect.beginTransaction();

        try {

            await connect.execute(`INSERT INTO training_sessions (date, start, end, service_id) VALUES
                (?, ?, ?, ?)`, [date, start, end, service_id]);

            await connect.commit();
            connect.release();
            return res.status(201).send();
        } catch (err) {
            return res.status(500).send();
        }
    }
});


coachRouter.get("/services", async (req, res) => {

    try {

        const [rows] = await connectionPool.query(`SELECT s.*, sports.name FROM services s
        JOIN sports ON sports.sport_id = s.sport_id
        WHERE s.user_id = ?`, [req.user["id"]]);

        return res.send({ services: rows });

    } catch (err) {
        return res.status(500).send();
    }

});

coachRouter.post("/services", async (req, res) => {

    const connect = await connectionPool.getConnection();

    await connect.beginTransaction();

    try {

        const [rows] = await connect.execute(`SELECT * 
        FROM users u
        JOIN coachs c ON u.user_id = c.user_id
        JOIN address a ON c.address_id = a.address_id
        WHERE u.email = ?;`, [req.user["email"]]);

        await connect.execute(`INSERT INTO services (title, description, price, 
            cancellation_notice, cancellation_fee, address_id, user_id, sport_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
            [req.body.title, req.body.description, req.body.price,
            req.body.cancellation_notice, req.body.cancellation_fee,
            rows[0]["address_id"],
            rows[0]["user_id"],
            req.body.sport_id
            ]);


        await connect.commit();
        connect.release();
        return res.status(201).send();

    } catch (err) {
        connect.rollback();
        return res.status(500).send();
    }

});

coachRouter.delete("/services/:service_id", async (req, res) => {

    const connect = await connectionPool.getConnection();

    await connect.beginTransaction();

    try {

        await connect.execute(`DELETE s FROM services s
        JOIN coachs c on s.user_id = c.user_id
        WHERE c.user_id = ? AND s.service_id = ?`, [req.user["id"], req.params.service_id]);

        await connect.commit();
        connect.release();
        return res.status(200).send();

    } catch (err) {
        connect.rollback();
        return res.status(500).send();
    }
});



export { coachRouter };
