import express from "express";
const sportsRouter = express.Router();

import connection from "../database/config.js";

sportsRouter.get("/", async (req, res) => {

    const [rows] = await connection.execute("SELECT * FROM sports");

    res.send({ sports: rows });

});

sportsRouter.post("/", async (req, res) => {

    try {
        const [ResultHeader] = await connection.execute("INSERT INTO sports (name) VALUES (?);", [req.body.name]);
        const [rows] = await connection.execute("SELECT * FROM sports WHERE sport_id = ?", [ResultHeader["insertId"]]);
        return res.status(201).send({ sport: rows });

    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).send();
        }

    }



});


export { sportsRouter }