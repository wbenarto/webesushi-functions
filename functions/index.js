const functions = require("firebase-functions");

const app = require("express")();

const FBAuth = require("./util/fbAuth");

const cors = require('cors')
app.use(cors())

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
  getUserDetails,
  markNotificationsRead,
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
app.get("/user/:handle", getUserDetails);
app.post("/notifications", FBAuth, markNotificationsRead);

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
        if (
          doc.exists &&
          doc.data().userHandle !== snapshot.data().userHandle
        ) {
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
      .catch((err) => {
        console.error(err);
        return;
      });
  });

exports.onUserImageChange = functions.firestore
  .document("/users/{userId}")
  .onUpdate((change) => {
    console.log(change.before.data());
    console.log(change.after.data());
    if (change.before.data().imageUrl !== change.after.data().imageUrl) {
      console.log("image has changed");

      const batch = db.batch();

      return db
        .collection("sushi")
        .where("userHandle", "==", change.before.data().handle)
        .get()
        .then((data) => {
          data.forEach((doc) => {
            const sushi = db.doc(`/sushi/${doc.id}`);
            batch.update(sushi, { userImage: change.after.data().imageUrl });
          });

          return batch.commit();
        });
    }
  });

exports.onSushiDelete = functions.firestore
  .document("/sushi/{sushiId}")
  .onDelete((snapshot, context) => {
    const sushiId = context.params.sushiId;
    const batch = db.batch();
    return db
      .collection("comments")
      .where("sushiId", "==", sushiId)
      .get()
      .then((data) => {
        data.forEach((doc) => {
          batch.delete(db.doc(`/comments/${doc.id}`));
        });
        return db.collection("likes").where("sushiId", "==", "sushiId").get();
      })
      .then((data) => {
        data.forEach((doc) => {
          batch.delete(db.doc(`/likes/${doc.id}`));
        });
        return db
          .collection("notifications")
          .where("sushiId", "==", "sushiId")
          .get();
      })
      .then((data) => {
        data.forEach((doc) => {
          batch.delete(db.doc(`/notifications/${doc.id}`));
        });
        return batch.commit();
      })
      .catch((err) => console.error(err));
  });
