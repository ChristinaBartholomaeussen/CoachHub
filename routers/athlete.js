import dotenv from "dotenv";
dotenv.config();

import express from "express";
const athleteRouter = express.Router();

import jwt from "jsonwebtoken";

import bcrypt from "bcrypt";

import { createAthletePage } from "../render/render.js";

import connection from "../database/config.js";


const athleteFrontpage = createAthletePage("/athlete/frontpage.html", {
    title: " Athlete Frontpage"
});

athleteRouter.get("/", (req, res) => {
    res.send(athleteFrontpage);
})











export default athleteRouter;