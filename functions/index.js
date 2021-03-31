const functions = require("firebase-functions");

const app = require("express")();

const FBAuth = require("./util/fbAuth");

const { getAllSushi, createSushi } = require("./handlers/sushi");
const {
  signUp,
  logIn,
  uploadImage,
  addUserDetails,
} = require("./handlers/users");

// Sushi Routes
app.get("/sushi", getAllSushi);
app.post("/sushi", FBAuth, createSushi);
app.post("/user/image", FBAuth, uploadImage);
app.post("/user", FBAuth, addUserDetails);

// Signup Route
app.post("/signup", signUp);
app.post("/login", logIn);

exports.api = functions.https.onRequest(app);
