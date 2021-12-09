import { admin_password } from "../encryption.js";
import connection from "./config.js";

import fetch from "node-fetch";

(async () => {

    await connection.execute(`DROP TABLE IF EXISTS chat_messages, chat_rooms,
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
            token VARCHAR(255) NOT NULL,
            isEnabled TINYINT NOT NULL DEFAULT 0,
            role_id INT,
            UNIQUE KEY unique_email (email),
            UNIQUE KEY unique_token (token),
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
            price DOUBLE(10) NOT NULL,
            duration VARCHAR(5) NOT NULL,
            preperation_time VARCHAR(5),
            cancellation_notice VARCHAR(5),
            cancellation_fee DOUBLE,
            address_id INT,
            user_id INT,
            sport_id INT,
            FOREIGN KEY (address_id) REFERENCES address(address_id),
            FOREIGN KEY (user_id) REFERENCES users(user_id),
            FOREIGN KEY (sport_id) REFERENCES sports(sport_id)
        );`;

    const training_sessions = `CREATE TABLE IF NOT EXISTS training_sessions (
            session_id INT PRIMARY KEY AUTO_INCREMENT,
            date DATE NOT NULL,
            start TIME NOT NULL,
            end TIME NOT NULL,
            service_id INT,
            FOREIGN KEY (service_id) REFERENCES services(service_id)
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
            token VARCHAR(250) NOT NULL,
            created_at INT(11) NOT NULL,
            expires_at INT(11) NOT NULL,
            user_id INT,
            FOREIGN KEY (user_id) 
                REFERENCES users(user_id)
                ON DELETE CASCADE
        );`;

    const bookings = `CREATE TABLE IF NOT EXISTS bookings (
            booking_id INT PRIMARY KEY AUTO_INCREMENT,
            booking_date DATE NOT NULL,
            booking_start TIME NOT NULL,
            booking_end TIME NOT NULL,
            user_id INT,
            session_id INT,
            FOREIGN KEY (user_id) 
                REFERENCES athletes(user_id)
                ON DELETE CASCADE,
            FOREIGN KEY (session_id) REFERENCES training_sessions(session_id)
        );`;

    const chat_rooms = `CREATE TABLE IF NOT EXISTS chat_rooms (
            room_id INT PRIMARY KEY,
            athlete_id INT,
            coach_id INT,
            FOREIGN KEY (athlete_id) 
                REFERENCES athletes(user_id)
                ON DELETE CASCADE,
            FOREIGN KEY (coach_id)
                REFERENCES coachs(user_id)
                ON DELETE CASCADE
        );`;

    const chat_messages = `CREATE TABLE IF NOT EXISTS chat_messages (
            message_id INT PRIMARY KEY,
            timestamp DATETIME NOT NULL,
            receiver_id INT NOT NULL,
            sender_id INT NOT NULL,
            text VARCHAR(1000) NOT NULL,
            chat_room_id INT,
            FOREIGN KEY (chat_room_id) 
                REFERENCES chat_rooms(room_id)
                ON DELETE CASCADE
        );`

    
    await connection.execute(cities);
    await connection.execute(address);
    await connection.execute(roles);
    await connection.execute(users);
    await connection.execute(coach_types);
    await connection.execute(coachs);
    await connection.execute(private_coachs);
    await connection.execute(commercial_coachs);
    await connection.execute(sports);
    await connection.execute(services);
    await connection.execute(training_sessions);

    await connection.execute(athletes);
    await connection.execute(confirmation_tokens);
    await connection.execute(bookings);
    await connection.execute(chat_rooms);
    await connection.execute(chat_messages); 


    await connection.execute(`INSERT INTO sports (name) VALUES 
    ('Fodbold'), ('Håndbold'), ('Badminton'), ('Tennis'), ('Hockey'), ('Bordtennis'), ('Volleyball'), ('Basket ball'), ('Baseball'), ('Rugby'), ('Golf'), ('Amerikansk fodbold')`);


    await connection.execute("INSERT INTO coach_types (coach_type_id, coach_type) VALUES (1, 'Private'), (2, 'Commercial');");
    await connection.execute("INSERT INTO roles(role_id, role_type) VALUES (1, 'admin'), (2, 'coach'), (3, 'athlete')");
    
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    await connection.execute(`INSERT INTO users (email, password, token, isEnabled, role_id) 
    VALUES ('c.m.bartholo@gmail.com', '${admin_password}', '${token}', 1, 1);`);

    /*const response = await fetch("https://api.dataforsyningen.dk/postnumre");
    const data = await response.json();

    for(const d of data) {
        const name = d["navn"];
        const nr = d["nr"];
        await connection.execute(`INSERT INTO cities (city_name, postal_code) 
        VALUES ('${name}', '${nr}');`);
    };*/

})()
