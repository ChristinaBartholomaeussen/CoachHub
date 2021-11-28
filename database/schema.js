import { admin_password } from "../encryption.js";
import { connection } from "./config.js";

(async () => {
    
    connection.connect((err) => {
        if(err) {
            return console.log("bla");
        }

        let createTables = `
        CREATE TABLE IF NOT EXISTS admins (
            admin_id INT PRIMARY KEY AUTO_INCREMENT,
            email VARCHAR(250) NOT NULL,
            password VARCHAR(100) NOT NULL,
            UNIQUE KEY unique_email (email)
        );

        CREATE TABLE IF NOT EXISTS cities (
            city_id INT PRIMARY KEY AUTO_INCREMENT,
            city_name VARCHAR(255),
            postal_code VARCHAR(4),
            UNIQUE KEY unique_city_name (city_name),
            UNIQUE KEY unique_postal_code (postal_code)
        );

        CREATE TABLE IF NOT EXISTS address (
            address_id INT PRIMARY KEY AUTO_INCREMENT,
            street_name VARCHAR(250) NOT NULL,
            number VARCHAR(3) NOT NULL,
            apartment VARCHAR(10),
            city_id INT,
            FOREIGN KEY (city_id) REFERENCES cities(city_id)
        );

        CREATE TABLE IF NOT EXISTS roles (
            role_id INT PRIMARY KEY,
            role_type VARCHAR(100) NOT NULL
        );

        CREATE TABLE IF NOT EXISTS users (
            user_id INT PRIMARY KEY AUTO_INCREMENT,
            email VARCHAR(100) NOT NULL,
            username VARCHAR(250) NOT NULL,
            isEnabled BIT NOT NULL,
            role_id INT,
            FOREIGN KEY (role_id) REFERENCES roles(role_id),
            UNIQUE KEY unique_email (email)
        );

        CREATE TABLE IF NOT EXISTS coach_types (
            coach_type_id INT PRIMARY KEY,
            coach_type VARCHAR(30) NOT NULL,
            UNIQUE KEY unique_coach_type (coach_type)
        );

        CREATE TABLE IF NOT EXISTS coachs (
            user_id INT PRIMARY KEY,
            phone_number VARCHAR(8) NOT NULL,
            coach_type_id INT,
            address_id INT,
            FOREIGN KEY (user_id) REFERENCES users(user_id),
            FOREIGN KEY (coach_type_id) REFERENCES coach_types(coach_type_id),
            FOREIGN KEY (address_id) REFERENCES address(address_id)
        );

        CREATE TABLE IF NOT EXISTS private_coachs (
            user_id INT PRIMARY KEY,
            first_name VARCHAR(250) NOT NULL,
            last_name VARCHAR(250) NOT NULL,
            cpr_number VARCHAR(10) NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(user_id),
            UNIQUE KEY unique_cpr_number (cpr_number)
        );

        CREATE TABLE IF NOT EXISTS commercial_coachs (
            user_id INT PRIMARY KEY,
            company_name VARCHAR(250) NOT NULL,
            cvr_number VARCHAR(8) NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(user_id),
            UNIQUE KEY unique_company_name (company_name),
            UNIQUE KEY unique_cvr_number (cvr_number)
        );

        CREATE TABLE IF NOT EXISTS sports (
            sport_id INT PRIMARY KEY AUTO_INCREMENT,
            name VARCHAR(250) NOT NULL,
            UNIQUE KEY unique_name (name)
        );

        CREATE TABLE IF NOT EXISTS services (
            service_id INT PRIMARY KEY AUTO_INCREMENT,
            title VARCHAR(250) NOT NULL,
            description VARCHAR(500) NOT NULL,
            price INT(10) NOT NULL,
            duration INT(10) NOT NULL,
            preperation_time INT(10),
            cancellation_time INT(10),
            cancellation_notice INT(10),
            cancellation_fee INT(10),
            address_id INT,
            user_id INT,
            sport_id INT,
            FOREIGN KEY (address_id) REFERENCES address(address_id),
            FOREIGN KEY (user_id) REFERENCES users(user_id),
            FOREIGN KEY (sport_id) REFERENCES sports(sport_id)
        );
        
        CREATE TABLE IF NOT EXISTS training_sessions (
            session_id INT PRIMARY KEY AUTO_INCREMENT,
            date DATE NOT NULL,
            start TIME NOT NULL,
            end TIME NOT NULL,
            service_id INT,
            FOREIGN KEY (service_id) REFERENCES services(service_id)
        );


        CREATE TABLE IF NOT EXISTS athletes (
            first_name VARCHAR(100) NOT NULL,
            last_name VARCHAR(100) NOT NULL,
            gender VARCHAR(50) NOT NULL,
            date_of_birth DATE NOT NULL,
            phone_number VARCHAR(8) NOT NULL,
            user_id INT PRIMARY KEY,
            FOREIGN KEY (user_id) REFERENCES users(user_id)
        );

        CREATE TABLE IF NOT EXISTS confirmation_tokens (
            token_id INT PRIMARY KEY AUTO_INCREMENT,
            token VARCHAR(250) NOT NULL,
            user_id INT,
            FOREIGN KEY (user_id) REFERENCES athletes(user_id)
        );

        CREATE TABLE IF NOT EXISTS bookings (
            booking_id INT PRIMARY KEY AUTO_INCREMENT,
            booking_date DATE NOT NULL,
            booking_start TIME NOT NULL,
            booking_end TIME NOT NULL,
            user_id INT,
            session_id INT,
            FOREIGN KEY (user_id) REFERENCES athletes(user_id),
            FOREIGN KEY (session_id) REFERENCES training_sessions(session_id)
        );
        
        INSERT INTO admins (email, password) VALUES ('c.m.bartholo@gmail.com', '${admin_password}');

        `;

        //TODO: Der skal muligvis være en tabel med beskeder mellem træner og atlet

        connection.query(createTables, (err) => {
            if(err) {
                console.log(err);
            }
        });

        connection.end((err) => {
            if(err) {
                console.log(err);
            }
        })
    });
})()
