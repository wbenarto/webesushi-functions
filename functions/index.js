const functions = require("firebase-functions");

const app = require("express")();

const FBAuth = require("./util/fbAuth");
const { db } = require("./util/admin");
const {
  getAllSushi,
  createSushi,
  getSushi,
  commentOnSushi,
  likeSushi,
  unlikeSushi,
  deleteSushi,
} = require("./handlers/sushi");
const {
  signUp,
  logIn,
  uploadImage,
  addUserDetails,
  getAuthenticatedUser,
} = require("./handlers/users");

// Sushi Routes
app.get("/sushi", getAllSushi);
app.post("/sushi", FBAuth, createSushi);
app.get("/sushi/:sushiId", getSushi);
app.post("/sushi/:sushiId/comment", FBAuth, commentOnSushi);
app.get("/sushi/:sushiId/like", FBAuth, likeSushi);
app.get("/sushi/:sushiId/unlike", FBAuth, unlikeSushi);
app.delete("/sushi/:sushiId", FBAuth, deleteSushi);
// TODO deleteSushi, likeSushi, unlikeSushi, commentSushi

// Users Route
app.post("/signup", signUp);
app.post("/login", logIn);
app.post("/user/image", FBAuth, uploadImage);
app.post("/user", FBAuth, addUserDetails);
app.get("/user", FBAuth, getAuthenticatedUser);

exports.api = functions.https.onRequest(app);

exports.createNotificationOnLike = functions.firestore
  .document("likes/{id}")
  .onCreate((snapshot) => {
    db.doc(`/sushi/${snapshot.data().sushiId}`)
      .get()
      .then((doc) => {
        if (doc.exists) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date.toISOString(),
            recipient: doc.data().userHandle,
            sender: snapshot.data().userHandle,
            type: "like",
            read: false,
            sushiId: doc.id,
          });
        }
      })
      .then(() => {
        return;
      })
      .catch((err) => {
        console.error(err);
        return;
      });
  });

exports.deleteNotificationOnUnlike = functions.firestore
  .document("likes/{id}")
  .onDelete((snapshot) => {
    db.doc(`/notifications/${snapshot.id}`)
      .delete()
      .then(() => {
        return;
      })
      .catch((err) => {
        console.error(err);
      });
  });

exports.createNotificationOnComment = functions.firestore
  .document(`comments/{id}`)
  .onCreate((snapshot) => {
    db.doc(`/sushi/${snapshot.data().sushiId}`)
      .get()
      .then((doc) => {
        if (doc.exists) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date.toISOString(),
            recipient: doc.data().userHandle,
            sender: snapshot.data().userHandle,
            type: "comment",
            read: false,
            sushiId: doc.id,
          });
        }
      })
      .then(() => {
        return;
      })
      .catch((err) => {
        console.error(err);
        return;
      });
  });
