import express from "express";
const app = express();
import helmet from "helmet";

import dotenv from "dotenv";
dotenv.config();

import cookieParser from "cookie-parser";

import http from "http";
const server = http.createServer(app);

import { Server } from "socket.io";
const io = new Server(server);

import escapeHTML from "escape-html";

app.use(helmet());
app.use(cookieParser());
app.use(express.static("public"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/js', express.static('./node_modules/bootstrap/dist/js'));
app.use('/js', express.static('./node_modules/jquery/dist'));
app.use('/css', express.static('./node_modules/bootstrap/dist/css'));
app.use('/build', express.static('./node_modules/toastr/build'));
app.use('/font', express.static('./node_modules/bootstrap-icons/font'));

import { publicRouter } from "./routers/public.js";
import { adminRouter } from "./routers/admin.js";
import { athleteRouter } from "./routers/athlete.js";
import { sportsRouter } from "./routers/sports.js";
import { coachRouter } from "./routers/coach.js";
import { authenticateToken, isAuthorized, isAthlete, isCoach, validateUser } from "./middleware/auth.js";
import { connectionPool } from "./database/config.js";
import { serviceRouter } from "./routers/services.js";

app.use(publicRouter);
app.use("/services", serviceRouter);
app.use("/admin", authenticateToken, isAuthorized, adminRouter);
app.use("/athletes", authenticateToken, isAthlete, athleteRouter);
app.use("/coachs", authenticateToken, isCoach, coachRouter);
app.use("/api/sports", sportsRouter);

const forum = io.of("/forum");

forum.use(validateUser);

forum.on("connection", async (socket) => {

    const connect = await connectionPool.getConnection();

    const [rows] = await connect.execute(`SELECT u.username, cm.* FROM chat_messages cm
    JOIN users u ON cm.user_id = u.user_id`);

    socket.emit("load-messages", { messages: rows, loggedInUser: socket.id });

    socket.broadcast.emit("user-has-joined", socket.id.username);

    socket.on("send-message", async (message) => {

        const connect = await connectionPool.getConnection();
        await connect.beginTransaction();

        try {
            await connect.execute(`INSERT INTO chat_messages (timestamp, user_id, text)
            VALUES (?, ?, ?)`, [new Date(), socket.id.id, message]);

            await connect.commit();
            connect.release();

        } catch (err) {
            connect.rollback();
        }

        socket.broadcast.emit("chat-message", { message: escapeHTML(message), name: socket.id });
    });

    socket.on("disconnect", () => {
        socket.broadcast.emit("user-disconnected", socket.id.username);
    });

});


const PORT = process.env.PORT || 8080

server.listen(PORT, (error) => {
    console.log("Server is running on port", PORT);
});