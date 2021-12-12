import express from "express";
const app = express();

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
import {sportsRouter} from "./routers/sports.js";
import coachRouter from "./routers/coach.js";
import { authenticateToken, isAuthorized } from "./middleware/auth.js";
import connection from "./database/config.js";



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

    res.send({services: rows})

})


app.get("/", (req, res) => {
    res.send(frontpage);
})








const PORT = process.env.PORT || 8080

app.listen(PORT, (error) => {
    console.log("Server is running on port", PORT);
});