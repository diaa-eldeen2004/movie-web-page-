import dotenv from "dotenv";
dotenv.config();
export const DOMAIN = process.env.DOMAIN;
export const PORT = process.env.PORT;
export const MONGO_DB_URI = process.env.MONGO_DB_URI;
export const EMAIL_USER = process.env.EMAIL_USER;
export const EMAIL_PASS = process.env.EMAIL_PASS;
