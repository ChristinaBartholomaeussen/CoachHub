import express from "express";
const sportsRouter = express.Router();

import { connectionPool } from "../database/config.js";

sportsRouter.get("/", async (req, res) => {

    const connect = await connectionPool.getConnection();

    try{

        const [rows] = await connect.execute("SELECT * FROM sports");
        connect.release();
        return res.send({ sports: rows });

    } catch (err) {
        return res.status(500).send();
    }
});

sportsRouter.post("/", async (req, res) => {

    const connect = await connectionPool.getConnection();

    await connect.beginTransaction();

    try {

        const [ResultHeader] = await connect.execute("INSERT INTO sports (name) VALUES (?);", [req.body.name]);
        const [rows] = await connect.execute("SELECT * FROM sports WHERE sport_id = ?", [ResultHeader["insertId"]]);

        await connect.commit();
        connect.release();
        return res.status(201).send({ sport: rows });

    } catch (error) {

        if (error.code === 'ER_DUP_ENTRY') {
            connect.release();
            return res.status(400).send();
        }

    }

});


export { sportsRouter }