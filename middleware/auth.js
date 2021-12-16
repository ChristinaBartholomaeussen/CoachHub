import dotenv from "dotenv";
dotenv.config();

import jwt from "jsonwebtoken";

import cookie from "cookie";

import { connectionPool } from "../database/config.js";
import { createPage } from "../render/render.js";


const notAuth = createPage("./public/error/403error.html", {
    title: "Error 403 | Unauthorized "
});


async function tokenIsValid(req, res, next) {

    jwt.verify(req.query.token, process.env.CONFIRMATION_TOKEN_KEY, function (err) {
        if (err) {
            return res.status(410).send({ message: "token er udløbet" });
        }
        else {
            next();
        }
    })
}


function authenticateToken(req, res, next) {

    const token = req.cookies.accessToken;

    if (!token || token === undefined) {

        return res.status(401).send();

    } else {
        try {

            const user = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
            req.user = user;
            return next();

        } catch {
            return res.status(500).redirect("/");
        }
    }
};

function isAuthorized(req, res, next) {
    if (req.user["role_id"] !== 1) {
        return res.status(403).send(notAuth);
    }
    return next();
};

function isCoach(req, res, next) {
    if (req.user["role_id"] !== 2) {
        return res.status(403).send(notAuth);
    }
    return next();
};



function isAthlete(req, res, next) {
    if (req.user["role_id"] !== 3) {
        return res.status(403).send(notAuth);
    }
    return next();
};


async function isValidEmail(req, res, next) {

    const [rows] = await connectionPool.execute(`SELECT * FROM users WHERE email = ?`, [req.body.email]);

    if (req.user === undefined) {

        if (Object.entries(rows).length === 0) {

            return next();

        } else {
            return res.status(409).send();
        }

    } else {
        if (Object.entries(rows).length === 0 || rows[0]["user_id"] === req.user["id"]) {
            return next();
        } else {
            return res.status(409).send();
        }
    }
};

async function usernameIsValid(req, res, next) {

    const connect = await connectionPool.getConnection();

    const [rows] = await connect.execute(`SELECT * FROM users WHERE username = ?`, [req.body.username]);

    if (Object.entries(rows).length === 0) {
        return next();
    } else {
        return res.status(409).send();
    }
}


async function isEnabled(req, res, next) {

    const connect = await connectionPool.getConnection();

    const [rows] = await connect.execute(`SELECT * FROM users WHERE email = ?`, [req.body.email]);

    if (Object.entries(rows).length !== 0) {

        if (rows[0]["isEnabled"] === 0) {
            connect.release();
            return res.status(400).send({ role: rows[0]["role_id"] });
        }
        else {
            connect.release();
            return next();
        }

    } else {
        connect.release();
        return res.status(404).send();
    }

};

function validateUser(socket, next) {
    try {

        const cookief = socket.handshake.headers.cookie;
        const accessToken = cookie.parse(cookief).accessToken;
        const user = jwt.verify(accessToken, process.env.ACCESS_TOKEN_KEY);

        socket.id = user;

        next();

    } catch (err) {
        next(err);
    }

};

export { authenticateToken, isAuthorized, isEnabled, tokenIsValid, isValidEmail, usernameIsValid, isAthlete, isCoach, validateUser };




