require("dotenv").config();

const { SERVER_PORT, DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT } =
  process.env;

module.exports = {
  SERVER_PORT,
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
  DB_HOST,
  DB_PORT,
};
