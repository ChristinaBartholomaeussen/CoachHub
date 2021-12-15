import dotenv from "dotenv";
dotenv.config();
import express from "express";
const adminRouter = express.Router();
import connection from "../database/config.js";

import nodemailer from "nodemailer";

import { authenticateToken } from "../middleware/auth.js";

import { createAdminPage } from "../render/render.js";


const adminPage = createAdminPage("/admin/frontpage.html", {
    title: "Admin | Frontpage "
});

const acceptProfilesPage = createAdminPage("/admin/acceptProfiles.html", {
    title: "Admin | Accept Profiles"
});


import { isAuthorized } from "../middleware/auth.js";

adminRouter.get("/", (req, res) => {
    res.send(adminPage);
});

adminRouter.get("/profiles", (req, res) => {
    res.send(acceptProfilesPage);
});


//Bruges til fetch
adminRouter.get("/profiles/api", async (req, res) => {

    const status = req.query.status;    //skal være 0 eller 1
    const role = req.query.role;        //skal være 1, 2, 3

    if (status !== undefined && role !== undefined) {

        const [rows] = await connection.execute(`SELECT  u.*, ct.coach_type, 
        c.phone_number, a.street_name, a.number, 
        ci.city_name, ci.postal_code, 
        pc.first_name, pc.last_name, 
        cc.company_name, cc.cvr_number 
        FROM users u
        JOIN coachs c on u.user_id = c.user_id
        JOIN coach_types ct on ct.coach_type_id = c.coach_type_id
        JOIN address a on c.address_id = a.address_id
        JOIN cities ci on a.city_id = ci.city_id
        LEFT JOIN private_coachs pc on pc.user_id = u.user_id
        LEFT JOIN commercial_coachs cc on cc.user_id = u.user_id
        WHERE u.isEnabled = ? AND u.role_id = ?;`, [status, role]);

        return res.send({ coachs: rows });
    }

    return res.status(400).send();

});


adminRouter.patch("/profiles/api/:userId", async (req, res) => {

    const conn = await connection.getConnection();
    
    await conn.beginTransaction();

    try {
        const [rows] = await conn.execute("SELECT * FROM users WHERE user_id = ? FOR UPDATE;", [req.params.userId]);
        
        await conn.execute("UPDATE users SET isEnabled = 1 WHERE user_id = ?;", [rows[0]["user_id"]]);

        await conn.commit();


    const transporter = nodemailer.createTransport({
        port: 465,
        host: "smtp.gmail.com",
        auth: {
            user: process.env.NODEMAILER_USER,
            pass: process.env.NODEMAILER_PASS
        },
        secure: true
    });

    const mailOption = {
        from: process.env.NODEMAILER_USER,
        to: rows[0]["email"],
        subject: "Oprettelse Godkendt",
        html:
            `<h1>Velkommen</h1>
            <p>Tillykke, din bruger er blevet godkendt.</p>`
    }

    transporter.sendMail(mailOption, (error) => {
        if (error) {

            return res.status(500).send();
        }

        conn.release();
        return res.status(200).send();
    });

    

    } catch (err) {
        console.log(err.message);
        conn.rollback();
        return res.status(500).send();
    }
    


    


   



    

});







export default adminRouter;