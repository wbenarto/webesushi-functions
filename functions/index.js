const functions = require("firebase-functions");

const app = require("express")();

const FBAuth = require("./util/fbAuth");

const { getAllSushi, createSushi } = require("./handlers/sushi");
const { signUp, logIn } = require("./handlers/users");

// Sushi Routes
app.get("/sushi", getAllSushi);
app.post("/sushi", FBAuth, createSushi);

// Signup Route
app.post("/signup", signUp);
app.post("/login", logIn);

exports.api = functions.https.onRequest(app);
