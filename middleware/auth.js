import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";

import connection from "../database/config.js";


function authenticateToken (req, res, next) {
    
    const token = req.cookies.accessToken;
    
    try {
        const user = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
        req.user = user;
        next();

    } catch {
        return res.status(403).send();
    }

}

function isAuthorized (req, res, next) {

    if(req.user["role_id"] !== 1) {
        return res.status(403).send();
    }

    return next();
}

async function isEnabled (req, res, next) {

    const [rows] = await connection.execute(`SELECT * FROM users WHERE email = ?`, [req.body.email]);

    if(Object.entries(rows).length !== 0) {

        if(rows[0]["isEnabled"] === 0) {
            return res.status(400).send({role: rows[0]["role_id"]});
        }
        else {
            return next();
        }
        
    } else {
        return res.status(404).send();
    }

}

export {authenticateToken, isAuthorized, isEnabled};




