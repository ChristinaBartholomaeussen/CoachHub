import express from "express";
import connection from "../database/config.js";
const coachRouter = express.Router();
import bcrypt from "bcrypt";

import { createCoachPage } from "../render/render.js";
import { authenticateToken } from "../middleware/auth.js";



const coachPersonalFrontpage = createCoachPage("/coach/forside.html", {
    title: "Forside"
});

const coachServices = createCoachPage("/coach/services.html", {
    title: " Mine Ydelser "
});

const coachCalendar = createCoachPage("/coach/calendar.html", {
    title: " Min Kalender "
});

coachRouter.get("/", (req, res) => {
    res.send(coachPersonalFrontpage);
});

coachRouter.get("/bookings", (req, res) => {
    res.send(coachCalendar);
});


coachRouter.get("/api/training-session", async (req, res) => {


    const connect = await connection.getConnection();

    const [rows] = await connect.execute(`SELECT ts.*, s.title FROM training_sessions ts
    JOIN services s ON ts.service_id = s.service_id
    JOIN coachs c ON s.user_id = c.user_id
    WHERE c.user_id = ?`, [req.user["id"]]);

    return res.send({training_sesssions: rows});

});

coachRouter.delete("/training-sessions/:sessionId", async (req, res) => {

    const connect = await connection.getConnection();
    
    
    try {
        await connect.execute(`DELETE ts FROM training_sessions ts
        JOIN services s ON s.service_id = ts.service_id
        JOIN coachs c ON c.user_id = s.user_id
        WHERE c.user_id = ? AND ts.session_id = ?;`,
        [req.user["id"], req.params.sessionId]);

        connect.release();
        return res.status(200).send();

    } catch (err) {
        console.log(err);
        return res.status(500);
    }



});


coachRouter.post("/training-sessions", async (req, res) => {

    let {service_id, date, start, end} = req.body;

    
    if(!service_id || !date || !start || !end || new Date(date) < new Date() || start > end ) {
        return res.status(400).send();
    } else {

        const connect = await connection.getConnection();

        try {
            await connect.execute(`INSERT INTO training_sessions (date, start, end, service_id) VALUES
        (?, ?, ?, ?)`, [date, start, end, service_id]);

        connect.release();
        } catch (err) {
            console.log(err);
            return res.status(500).send();
        }
        

        return res.status(201).send();
    }
    
});



// Services
coachRouter.get("/services", (req, res) => {
    res.send(coachServices);
})

coachRouter.get("/api/services",  async (req, res) => {

    const connect = await connection.getConnection();

    try {

        const [rows] = await connect.execute(`SELECT s.*, sports.name FROM services s
        JOIN sports ON sports.sport_id = s.sport_id
        WHERE s.user_id = ?`, [req.user["id"]]);

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

coachRouter.delete("/services/:service_id", async (req, res) => {

    const connect = await connection.getConnection();

    await connect.beginTransaction();

    try{

        await connect.execute(`DELETE s FROM services s
        JOIN coachs c on s.user_id = c.user_id
        WHERE c.user_id = ? AND s.service_id = ?`, [req.user["id"], req.params.service_id]);

        await connect.commit();
        connect.release();
        return res.status(200).send();
        
    } catch (err) {
        connect.rollback();
        console.log(err);
        return res.status(500).send();
    }

})



export default coachRouter;
