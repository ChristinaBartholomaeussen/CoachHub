import express from "express";
const app = express();

import dotenv from "dotenv";
dotenv.config();

import http from "http";
const server = http.createServer(app);

import { Server } from "socket.io";
const io = new Server(server);

import cookieParser from "cookie-parser";
import cookie from "cookie";

import jwt from "jsonwebtoken";

const forum = io.of("/forum");


function validateUser(socket, next) {
    try {

        const cookief = socket.handshake.headers.cookie;
        const accessToken = cookie.parse(cookief).accessToken;
        const user = jwt.verify(accessToken, process.env.ACCESS_TOKEN_KEY);

        socket.id = user;

        next();

    } catch (err) {
        console.log(err);
        next(err);
    }

}

forum.use(validateUser);

forum.on("connectionPool", async(socket) =>  {

    const connect = await connectionPool.getConnection();

    const [rows] = await connect.execute(`SELECT u.username, cm.* FROM chat_messages cm
    JOIN users u ON cm.user_id = u.user_id`);


    socket.emit("load-messages", {messages: rows, loggedInUser: socket.id});


    socket.broadcast.emit("user-has-joined", socket.id.username);

    socket.on("send-message", async (message)  => {

        const connect = await connectionPool.getConnection();
        await connect.beginTransaction();

        try{
            await connect.execute(`INSERT INTO chat_messages (timestamp, user_id, text)
            VALUES (?, ?, ?)`, [new Date(), socket.id.id, message]);

            await connect.commit();
            connect.release();

        } catch (err) {

            connect.rollback();
            console.log(err);
        }

        socket.broadcast.emit("chat-message", {message: message, name: socket.id});
    });

    socket.on("disconnect", () => {
        socket.broadcast.emit("user-disconnected", socket.id.username);
    });

});


app.use(cookieParser());
app.use(express.static("public"));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/js', express.static('./node_modules/bootstrap/dist/js'));
app.use('/js', express.static('./node_modules/jquery/dist'));
app.use('/css', express.static('./node_modules/bootstrap/dist/css'));
app.use('/build', express.static('./node_modules/toastr/build'));
app.use('/bootstrap-icons', express.static('./node_modules/bootstrap-icons'));





import { createPage } from "./render/render.js";

import {authRouter} from "./routers/auth.js";
import {adminRouter} from "./routers/admin.js";
import {athleteRouter} from "./routers/athlete.js";
import { sportsRouter } from "./routers/sports.js";
import {coachRouter} from "./routers/coach.js";
import { authenticateToken, isAuthorized, isAthlete, isCoach } from "./middleware/auth.js";
import {connectionPool} from "./database/config.js";
import {serviceRouter} from "./routers/services.js";


app.use(authRouter);
app.use("/services", serviceRouter);
app.use("/admin", authenticateToken, isAuthorized, adminRouter);
app.use("/athletes", authenticateToken, isAthlete, athleteRouter);
app.use("/coachs", authenticateToken, isCoach, coachRouter);

app.use("/api/sports", sportsRouter);


const frontpage = createPage("frontpage.html", {
    title: "Blabla | Frontpage "
});




// Finder ledige træningstider ud fra query param service = xx
app.get("/training_session", async (req, res) => {

    const serviceId = req.query.service;

    const connect = await connectionPool.getConnection();

    try {

        const [rows] = await connect.execute(`select * from training_sessions
        WHERE isBooked = 0 AND service_id = ?;`, [serviceId]);

        connect.release();
        return res.send({ sessions: rows });


    } catch (err) {
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