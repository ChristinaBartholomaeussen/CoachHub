import express from "express";
import connection from "../database/config.js";
const coachRouter = express.Router();
import bcrypt from "bcrypt";

import { createPage } from "../render/render.js";

const newCoach = createPage("/coach/createCoach.html", {
    title: " New Athelet "
});

coachRouter.get("/", (req, res) => {
    res.send(newCoach);
});

coachRouter.post("/", async (req, res) => {

    const conn = await connection.getConnection();

    console.log(req.body);


    await conn.beginTransaction();
    
    try{

        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        const userId = await conn.execute("INSERT INTO users (email, password, role_id) VALUES (?, ?, ?);",
            [req.body.email, hashedPassword, 2]);


        const [rows] = await conn.execute("SELECT city_id FROM cities WHERE postal_code = ?;",
            [req.body.postal_code]);

            
        const addressId = await conn.execute("INSERT INTO address (street_name, number, city_id) VALUES (?, ?, ?);",
            [req.body.street_name, req.body.number, rows[0]["city_id"]]);

            
        await conn.execute(`INSERT INTO coachs (user_id, phone_number, coach_type_id, address_id) VALUES
       (?, ?, ?, ?);`, [userId[0]["insertId"], req.body.phone, req.body.coach_type, addressId[0]["insertId"]]);

        if (req.body.coach_type === 1) {

            await conn.execute(`INSERT INTO private_coachs (user_id, first_name, last_name) VALUES
           (?,?,?)`, [userId[0]["insertId"], req.body.first_name, req.body.last_name]);

        } else if (req.body.coach_type === 2) {

            await conn.execute(`INSERT INTO commercial_coachs (user_id, company_name, cvr_number) VALUES
        (?,?,?)`, [userId[0]["insertId"], req.body.company_name, req.body.cvr_number]);

        }

        await conn.commit();

        return res.status(200).send();

    } catch (err) {
        console.log(err.message);
        conn.rollback();
        return res.status(500).send();
    }
        

});




export { coachRouter }
