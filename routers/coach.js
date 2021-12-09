import express from "express";
import connection from "../database/config.js";
const coachRouter = express.Router();
import bcrypt from "bcrypt";

import { createAdminPage } from "../render/render.js";
import { authenticateToken } from "../middleware/auth.js";



const coachPersonalFrontpage = createAdminPage("/coach/forside.html", {
    title: "Forside"
});

const coachServices = createAdminPage("/coach/services.html", {
    title: " Min Side | Mine Ydelser "
});

coachRouter.get("/services", (req, res) => {
    res.send(coachServices);
})

coachRouter.get("/api/services",  async (req, res) => {

    const connect = await connection.getConnection();

    try {

        const [rows] = await connect.execute(`SELECT s.*, sports.name FROM services s
        JOIN sports ON sports.sport_id = s.sport_id
        WHERE s.user_id`, [req.user["id"]]);

        connect.release();
        return res.send({services: rows});

    } catch(err) {
        connect.rollback();
    }
   
})

coachRouter.post("/services",  async (req, res) => {
    
    const connect = await connection.getConnection();

    await connect.beginTransaction();

    try {
      
        const [rows] = await connect.execute(`SELECT * 
        FROM users u
        JOIN coachs c ON u.user_id = c.user_id
        JOIN address a ON c.address_id = a.address_id
        WHERE u.email = ?;`, [req.user["email"]]);

        await connect.execute(`INSERT INTO services (title, description, price, duration, preperation_time, 
            cancellation_notice, cancellation_fee, address_id, user_id, sport_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`, 
            [req.body.title, req.body.description, req.body.price, req.body.duration, req.body.preperation_time, 
                req.body.cancellation_notice, req.body.cancellation_fee,
                rows[0]["address_id"], 
                rows[0]["user_id"], 
                req.body.sport_id
            ]);


        await connect.commit();
        connect.release();
        return res.status(201).send();

    }catch(err) {
        console.log(err);
        connect.rollback();
        return res.status(500).send();
    }

});


coachRouter.get("/", (req, res) => {
    res.send(coachPersonalFrontpage);
});


coachRouter.post("/", async (req, res) => {

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





export default coachRouter;
