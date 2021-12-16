import express from "express";
const serviceRouter = express.Router();

import { connectionPool } from "../database/config.js";

serviceRouter.get("/", async (req, res) => {

    const sport = req.query.sport;
    const connect = await connectionPool.getConnection();

    try {
        const [rows] = await connect.execute(`SELECT s.service_id, c.city_name, c.city_id, sp.name, s.title, s.description 
            FROM cities c
            JOIN address a ON c.city_id = a.city_id
            JOIN services s ON a.address_id = s.address_id
            JOIN sports sp ON s.sport_id = sp.sport_id
            WHERE sp.name = ?`, [sport]);

        connect.release();
        return res.send({ services: rows })
    } catch (err) {
        return res.status(500).send();
    }
});

serviceRouter.get("/:id", async (req, res) => {

    const serviceId = req.params.id;
    const connect = await connectionPool.getConnection();

    try {

        const [rows] = await connect.execute(`SELECT ts.session_id, s.service_id, s.price, s.cancellation_notice, s.cancellation_fee,
        c.phone_number, a.street_name, a.number, ci.city_name, ci.postal_code,
        pc.first_name, pc.last_name, cc.company_name, cc.cvr_number, u.email
        FROM services s
        JOIN training_sessions ts on ts.service_id = s.service_id
        JOIN address a ON s.address_id = a.address_id
        JOIN coachs c ON a.address_id = c.address_id
        LEFT JOIN private_coachs pc ON pc.user_id = c.user_id
        LEFT JOIN commercial_coachs cc ON c.user_id = cc.user_id
        JOIN users u ON u.user_id = c.user_id
        JOIN cities ci ON a.city_id = ci.city_id
        WHERE s.service_id = ?;`, [serviceId]);

        connect.release();
        return res.send({ services: rows });

    } catch (err) {
        return res.status(500).send();
    }
});


export { serviceRouter }