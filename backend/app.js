"use strict";


const express = require("express");
const cors = require("cors");
const session = require('express-session');
const FileStore = require('session-file-store')(session);

const { NotFoundError } = require("./expressError");

const { authenticateJWT } = require("./middleware/auth");
const authRoutes = require("./routes/auth");
const companiesRoutes = require("./routes/companies");
const usersRoutes = require("./routes/users");
const jobsRoutes = require("./routes/jobs");
const patientsRoutes= require("./routes/patients")

const morgan = require("morgan");

const app = express();

// Session, mainly to keep login info throughout nodemon resets during dev
app.use(session({
  store: new FileStore({ path: './sessions' }),
  secret: 'your_secret', // Secret key used for session encryption
  resave: false,
  saveUninitialized: true
}));

// Universal
app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));

// Verifying and storing token on response locals 
app.use(authenticateJWT);

// Routes 
app.use("/auth", authRoutes);
app.use("/companies", companiesRoutes);
app.use("/users", usersRoutes);
app.use("/jobs", jobsRoutes);
app.use("/patients", patientsRoutes)


/** Handle 404 errors -- this matches everything */
app.use(function (req, res, next) {
  return next(new NotFoundError());
});

/** Generic error handler; anything unhandled goes here. */
app.use(function (err, req, res, next) {
  if (process.env.NODE_ENV !== "test") console.error(err.stack);
  const status = err.status || 500;
  const message = err.message;

  return res.status(status).json({
    error: { message, status },
  });
});

module.exports = app;
