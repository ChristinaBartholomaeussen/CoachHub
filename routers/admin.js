import dotenv from "dotenv";
dotenv.config();

import express from "express";
const adminRouter = express.Router();

import { connectionPool } from "../database/config.js";
import { createAdminPage } from "../render/render.js";

import nodemailer from "nodemailer";
import sgTransport from "nodemailer-sendgrid-transport";

const adminPage = createAdminPage("/admin/frontpage/frontpage.html", {
    title: "Admin | Frontpage "
});

const acceptProfilesPage = createAdminPage("/admin/profiles/accept_profiles.html", {
    title: "Admin | Accept Profiles"
});

adminRouter.get("/", (req, res) => {
    res.send(adminPage);
});

adminRouter.get("/accept-profiles", (req, res) => {
    res.send(acceptProfilesPage);
});


adminRouter.get("/profiles", async (req, res) => {

    const status = req.query.status;
    const role = req.query.role;
    try {

        if (status !== undefined && role !== undefined) {

            const [rows] = await connectionPool.query(`SELECT  u.*, ct.coach_type, 
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

        } else {

            return res.status(400).send();
        }
    } catch (err) {

        return res.status(500).send();
    }

});


adminRouter.patch("/profiles/:userId", async (req, res) => {

    const connect = await connectionPool.getConnection();

    await connect.beginTransaction();

    try {

        const [rows] = await connect.execute("SELECT * FROM users WHERE user_id = ? FOR UPDATE;", [req.params.userId]);

        await connect.execute("UPDATE users SET isEnabled = 1 WHERE user_id = ?;", [rows[0]["user_id"]]);

        await connect.commit();
        connect.release();

        const transporter = nodemailer.createTransport(sgTranport({
            auth: {
                api_key: process.env.SENDGRID_API_KEY
            },
        }));

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

                connect.rollback();
                return res.status(500).send();
            }

            return res.status(200).send();
        });

    } catch (err) {
        connect.rollback();
        return res.status(500).send(({error: err}));
    }
});

export { adminRouter };