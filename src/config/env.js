require("dotenv").config();

const requiredEnvVars = [
  "JWT_SECRET",
  "REFRESH_SECRET",
  "JWT_EXPIRY",
  "REFRESH_EXPIRY",
  "PORT",
  "FRONT_END_URL1",
  "FRONT_END_URL2",
];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;
const JWT_EXPIRY = process.env.JWT_EXPIRY;
const REFRESH_EXPIRY = process.env.REFRESH_EXPIRY;
const PORT = process.env.PORT;
const FRONT_END_URL1 = process.env.FRONT_END_URL1;
const FRONT_END_URL2 = process.env.FRONT_END_URL2;

module.exports = {
  JWT_SECRET,
  REFRESH_SECRET,
  JWT_EXPIRY,
  REFRESH_EXPIRY,
  PORT,
  FRONT_END_URL1,
  FRONT_END_URL2,
};
