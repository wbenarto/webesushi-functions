const functions = require("firebase-functions");
const admin = require("firebase-admin");

const express = require("express");
const app = express();

const firebase = require("firebase");

var firebaseConfig = {
  apiKey: "AIzaSyBZavHCTsVqifWxF8BBgiAiVs9YqVUEIOQ",
  authDomain: "webesushi-a3bf0.firebaseapp.com",
  projectId: "webesushi-a3bf0",
  storageBucket: "webesushi-a3bf0.appspot.com",
  messagingSenderId: "238517641970",
  appId: "1:238517641970:web:ff036f0ac2f899c227a66b",
  measurementId: "G-WQD7ZJ3SVH",
};

admin.initializeApp();
firebase.initializeApp(firebaseConfig);

const db = admin.firestore();

app.get("/sushi", (req, res) => {
  db.firestore()
    .collection("sushi")
    .orderBy("name", "asc")
    .get()
    .then((data) => {
      let screams = [];
      data.forEach((doc) => {
        screams.push({
          sushiId: doc.id,
          name: doc.data().name,
          price: doc.data().price,
        });
      });
      return res.json(screams);
    })
    .catch((err) => console.log(err));
});

// creating documents
app.post("/sushi", (req, res) => {
  if (req.method !== "POST") {
    return res.status(400).json({ error: "Method not allowed" });
  }
  const newSushi = {
    name: req.body.name,
    price: req.body.price,
  };

  admin
    .firestore()
    .collection("sushi")
    .add(newSushi)
    .then((doc) => {
      res.json({ message: `document ${doc.id} created successfully` });
    })
    .catch((err) => {
      res.status(500).json({ error: "something went wrong" });
      console.error(err);
    });
});

// Signup Route
app.post("/signup", (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle,
  };

  firebase
    .auth()
    .createUserWithEmailAndPassword(newUser.email, newUser.password)
    .then((data) => {
      return res
        .status(201)
        .json({ message: `user ${data.user.uid} signed up successfully` });
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({ error: err.code });
    });
});

exports.api = functions.https.onRequest(app);
