import { admin_password } from "../encryption.js";
import {connectionPool} from "./config.js";

import fetch from "node-fetch";

(async () => {

    const connect = await connectionPool.getConnection();

    await connect.execute(`DROP TABLE IF EXISTS chat_messages,
    bookings, confirmation_tokens, athletes, training_sessions, services,
    sports, commercial_coachs, private_coachs, coachs, coach_types, users,
    roles, address;`);
    
    const cities = `CREATE TABLE IF NOT EXISTS cities (
            city_id INT PRIMARY KEY AUTO_INCREMENT,
            city_name VARCHAR(255),
            postal_code VARCHAR(4),
            UNIQUE KEY unique_postal_code (postal_code)
        );`;

    const address = `CREATE TABLE IF NOT EXISTS address(
            address_id INT AUTO_INCREMENT PRIMARY KEY,
            street_name VARCHAR(250),
            number VARCHAR(3),
            apartment VARCHAR(10),
            city_id INT,
            FOREIGN KEY (city_id) REFERENCES cities(city_id)
        );`;

    const roles = `CREATE TABLE IF NOT EXISTS roles (
            role_id INT PRIMARY KEY,
            role_type VARCHAR(100) NOT NULL
        );`;

    const users = `CREATE TABLE IF NOT EXISTS users (
            user_id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(100) NOT NULL,
            password VARCHAR(250) NOT NULL,
            username VARCHAR(100) NOT NULL,
            isEnabled TINYINT NOT NULL DEFAULT 0,
            role_id INT,
            UNIQUE KEY unique_email (email),
            UNIQUE KEY unique_username (username),
            FOREIGN KEY (role_id) REFERENCES roles(role_id)
        );`;

    const coach_types = `CREATE TABLE IF NOT EXISTS coach_types (
            coach_type_id INT PRIMARY KEY,
            coach_type VARCHAR(30) NOT NULL,
            UNIQUE KEY unique_coach_type (coach_type)
        );`;

    const coachs = `CREATE TABLE IF NOT EXISTS coachs (
            user_id INT PRIMARY KEY,
            phone_number VARCHAR(8) NOT NULL,
            coach_type_id INT,
            address_id INT,
            FOREIGN KEY (address_id) REFERENCES address(address_id),
            FOREIGN KEY (user_id) 
                REFERENCES users(user_id)
                ON DELETE CASCADE,
            FOREIGN KEY (coach_type_id) REFERENCES coach_types(coach_type_id)
        );`;

    const private_coachs = `CREATE TABLE IF NOT EXISTS private_coachs (
            user_id INT PRIMARY KEY,
            first_name VARCHAR(250) NOT NULL,
            last_name VARCHAR(250) NOT NULL,
            FOREIGN KEY (user_id) 
                REFERENCES users(user_id) 
                ON DELETE CASCADE
        );`

    const commercial_coachs = `CREATE TABLE IF NOT EXISTS commercial_coachs (
            user_id INT PRIMARY KEY,
            company_name VARCHAR(250) NOT NULL,
            cvr_number VARCHAR(8) NOT NULL,
            FOREIGN KEY (user_id) 
                REFERENCES users(user_id)
                ON DELETE CASCADE,
            UNIQUE KEY unique_company_name (company_name),
            UNIQUE KEY unique_cvr_number (cvr_number)
        );`;

    const sports = `CREATE TABLE IF NOT EXISTS sports (
                sport_id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(250) NOT NULL,
                UNIQUE KEY unique_name (name)
            );`;

    const services = `CREATE TABLE IF NOT EXISTS services (
            service_id INT PRIMARY KEY AUTO_INCREMENT,
            title VARCHAR(250) NOT NULL,
            description VARCHAR(500) NOT NULL,
            price DOUBLE NOT NULL,
            cancellation_notice VARCHAR(5),
            cancellation_fee DOUBLE,
            address_id INT,
            user_id INT,
            sport_id INT,
            FOREIGN KEY (address_id) 
                REFERENCES address(address_id)
                ON DELETE CASCADE,
            FOREIGN KEY (user_id) 
                REFERENCES users(user_id)
                ON DELETE CASCADE,
            FOREIGN KEY (sport_id) 
                REFERENCES sports(sport_id)
                ON DELETE CASCADE
        );`;

    const training_sessions = `CREATE TABLE IF NOT EXISTS training_sessions (
            session_id INT PRIMARY KEY AUTO_INCREMENT,
            date DATE NOT NULL,
            start TIME NOT NULL,
            end TIME NOT NULL,
            isBooked TINYINT NOT NULL DEFAULT 0,
            service_id INT,
            FOREIGN KEY (service_id) 
                REFERENCES services(service_id)
                ON DELETE CASCADE
        );`;

    const athletes = `CREATE TABLE IF NOT EXISTS athletes (
            first_name VARCHAR(100) NOT NULL,
            last_name VARCHAR(100) NOT NULL,
            gender VARCHAR(50) NOT NULL,
            date_of_birth DATE NOT NULL,
            phone_number VARCHAR(8) NOT NULL,
            user_id INT PRIMARY KEY,
            FOREIGN KEY (user_id) 
                REFERENCES users(user_id)
                ON DELETE CASCADE
        );`;

    const confirmation_tokens = `CREATE TABLE IF NOT EXISTS confirmation_tokens (
            token_id INT PRIMARY KEY AUTO_INCREMENT,
            user_id INT NOT NULL,
            token VARCHAR(255) NOT NULL,
            FOREIGN KEY (user_id) 
                REFERENCES users(user_id)
                ON DELETE CASCADE
        );`;

    const bookings = `CREATE TABLE IF NOT EXISTS bookings (
            booking_date DATE NOT NULL,
            booking_start TIME NOT NULL,
            booking_end TIME NOT NULL,
            isConfirmed TINYINT NOT NULL DEFAULT 0,
            athlete_id INT,
            session_id INT PRIMARY KEY,
            FOREIGN KEY (athlete_id) 
                REFERENCES athletes(user_id)
                ON DELETE CASCADE,
            FOREIGN KEY (session_id) 
                REFERENCES training_sessions(session_id)
                ON DELETE CASCADE
        );`;

    const chat_messages = `CREATE TABLE IF NOT EXISTS chat_messages (
            message_id INT PRIMARY KEY AUTO_INCREMENT,
            timestamp DATETIME NOT NULL,
            user_id INT NOT NULL,
            text VARCHAR(1000) NOT NULL,
            FOREIGN KEY (user_id) 
                REFERENCES users(user_id)
                ON DELETE CASCADE
        );`

    
    //await connectionPool.execute(cities);
    await connect.execute(address);
    await connect.execute(roles);
    await connect.execute(users);
    await connect.execute(coach_types);
    await connect.execute(coachs);
    await connect.execute(private_coachs);
    await connect.execute(commercial_coachs);
    await connect.execute(sports);
    await connect.execute(services);
    await connect.execute(training_sessions);
    await connect.execute(athletes);
    await connect.execute(confirmation_tokens);
    await connect.execute(bookings);
    await connect.execute(chat_messages); 


    await connect.execute(`INSERT INTO sports (name) VALUES 
    ('Fodbold'), ('Håndbold'), ('Badminton'), ('Tennis'), ('Hockey'), ('Bordtennis'), ('Volleyball'), ('Basket ball'), ('Baseball'), ('Rugby'), ('Golf'), ('Amerikansk fodbold')`);


    await connect.execute("INSERT INTO coach_types (coach_type_id, coach_type) VALUES (1, 'Private'), (2, 'Commercial');");
    await connect.execute("INSERT INTO roles(role_id, role_type) VALUES (1, 'admin'), (2, 'coach'), (3, 'athlete')");
    
    await connect.execute(`INSERT INTO users (email, password, username, isEnabled, role_id) 
    VALUES ('c.m.bartholo@gmail.com', '${admin_password}', 'Admin', 1, 1);`); 

    /*const response = await fetch("https://api.dataforsyningen.dk/postnumre");
    const data = await response.json();

    for(const d of data) {
        const name = d["navn"];
        const nr = d["nr"];
        await connectionPool.execute(`INSERT INTO cities (city_name, postal_code) 
        VALUES ('${name}', '${nr}');`);
    };*/

})()
