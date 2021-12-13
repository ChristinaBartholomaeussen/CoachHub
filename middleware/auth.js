import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";

import connection from "../database/config.js";

import { createPage } from "../render/render.js";

const notAuth = createPage("401error.html", {
    title: "Error 401 | Unauthorized "
});


async function tokenIsValid(req, res, next) {

    jwt.verify(req.query.token, process.env.CONFIRMATION_TOKEN_KEY, function(err) {
        if(err) {
            return res.status(410).send({message: "token er udløbet"});
        }
        else {
            next();
        }
    })
}


function authenticateToken(req, res, next) {

    const token = req.cookies.accessToken;

    if (!token || token === undefined) {
        
        return res.status(403).send();
        
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

async function isValidEmail(req, res, next) {

    const [rows] = await connection.execute(`SELECT * FROM users WHERE email = ?`, [req.body.email]);

    if((Object.entries(rows).length === 0) || (rows[0]["user_id"] === req.user["id"] )) {
        console.log("email er valid");
        return next();
    } else {
        console.log("email not valid");
        return res.status(409).send();
    }


}

async function isEnabled(req, res, next) {

    const [rows] = await connection.execute(`SELECT * FROM users WHERE email = ?`, [req.body.email]);

    if (Object.entries(rows).length !== 0) {

        if (rows[0]["isEnabled"] === 0) {
            return res.status(400).send({ role: rows[0]["role_id"] });
        }
        else {
            return next();
        }

    } else {
        return res.status(404).send();
    }

}

export { authenticateToken, isAuthorized, isEnabled, tokenIsValid, isValidEmail };




