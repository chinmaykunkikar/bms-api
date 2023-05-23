const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const routes = express.Router();

const { SERVER_PORT } = require("./configs/env.config");
const {
  STATUS_ERROR,
  MSG_SERVER_RUNNING,
  ERR_SERVER_START,
} = require("./constants/app.constants");

let PORT;
const app = express();

app.use(cors());
app.use(helmet());
app.use(routes);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

SERVER_PORT !== "" ? (PORT = SERVER_PORT) : (PORT = 3000);

app
  .listen(PORT, (error) => {
    if (!error) console.log(MSG_SERVER_RUNNING + PORT);
  })
  .on(STATUS_ERROR, (error) => console.error(ERR_SERVER_START, error));

module.exports = app;
