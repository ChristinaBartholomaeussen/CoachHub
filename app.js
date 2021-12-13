import express from "express";
const app = express();

import http from "http";
const server = http.createServer(app);

import { Server } from "socket.io";
const io = new Server(server);



import cookieParser from "cookie-parser";
app.use(cookieParser());
app.use(express.static("public"));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/js', express.static('./node_modules/bootstrap/dist/js'));
app.use('/js', express.static('./node_modules/jquery/dist'));
app.use('/css', express.static('./node_modules/bootstrap/dist/css'));
app.use('/build', express.static('./node_modules/toastr/build'));
app.use('/bootstrap-icons', express.static('./node_modules/bootstrap-icons'));



import dotenv from "dotenv";
dotenv.config();

import { createPage } from "./render/render.js";

import authRouter from "./routers/auth.js";
import adminRouter from "./routers/admin.js";
import athleteRouter from "./routers/athlete.js";
import { sportsRouter } from "./routers/sports.js";
import coachRouter from "./routers/coach.js";
import { authenticateToken, isAuthorized } from "./middleware/auth.js";
import connection from "./database/config.js";

io.on("connection", (socket) => {

    console.log("Welcome ", socket.id);

})


app.use(authRouter);
app.use("/admin", authenticateToken, isAuthorized, adminRouter);
app.use("/athletes", authenticateToken, athleteRouter);
app.use("/coachs", authenticateToken, coachRouter);

app.use("/api/sports", sportsRouter);


const frontpage = createPage("frontpage.html", {
    title: "Blabla | Frontpage "
});


app.get("/services", async (req, res) => {

    const sport = req.query.sport;

    const connect = await connection.getConnection();

    const [rows] = await connect.execute(`SELECT s.service_id, c.city_name, c.city_id, sp.name, s.title, s.description 
    FROM cities c
    JOIN address a ON c.city_id = a.city_id
    JOIN services s ON a.address_id = s.address_id
    JOIN sports sp ON s.sport_id = sp.sport_id
    WHERE sp.name = ?`, [sport]);

    connect.release();
    res.send({ services: rows })
});


app.post("/booking", authenticateToken, async (req, res) => {


    const connect = await connection.getConnection();

    const {booking_date, booking_start, booking_end, session_id} = req.body;

    try{
        await connect.execute(`INSERT INTO bookings (booking_date, booking_start, booking_end, athlete_id, session_id)
        VALUES (?, ?, ?, ?, ?)`, [booking_date, booking_start, booking_end, req.user["id"], session_id]);

        connect.release();
        return res.status(200).send();
    } catch (err) {
        return res.status(500).send();
    }

});

// Finde en specik service ud fra id
app.get("/services/:id", async (req, res) => {

    const serviceId = req.params.id;

    const connect = await connection.getConnection();

    try {

        const [rows] = await connect.execute(`SELECT ts.session_id, s.service_id, s.price, s.duration, s.cancellation_notice, s.cancellation_fee,
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

        return res.send({services: rows});


    } catch (err) {
        console.log(err);
        return res.status(500).send();
    }
});

// Finder ledige træningstider ud fra query param service = xx
app.get("/training_session", async (req, res) => {

    const serviceId = req.query.service;

    const connect = await connection.getConnection();

    try{

        const [rows] = await connect.execute(`select * from training_sessions
        WHERE isBooked = 0 AND service_id = ?;`, [serviceId]);

        return res.send({sessions: rows});


    } catch(err) {
        console.log(err);
        return res.status(500).send();
    }
});


app.get("/", (req, res) => {
    res.send(frontpage);
});





const PORT = process.env.PORT || 8080

server.listen(PORT, (error) => {
    console.log("Server is running on port", PORT);
});