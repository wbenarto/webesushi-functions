const { db } = require("../util/admin");

exports.getAllSushi = (req, res) => {
  db.collection("sushi")
    .orderBy("name", "asc")
    .get()
    .then((data) => {
      let sushis = [];
      data.forEach((doc) => {
        sushis.push({
          sushiId: doc.id,
          name: doc.data().name,
          desc: doc.data().desc,
          image: doc.data().sushiImage,
          dishPoint: doc.data().dishPoints,
          sustainability: doc.data().sustainabilityPoints,
          ingredients: doc.data().ingredients,
          type: doc.data().type,
          category: doc.data().category,
          likes: doc.data().likeCount,
          userHandle: doc.data().userHandle,
          userImage: doc.data().userImage,
        });
      });
      return res.json(sushis);
    })
    .catch((err) => console.log(err));
};

exports.createSushi = (req, res) => {
  if (req.method !== "POST") {
    return res.status(400).json({ error: "Method not allowed" });
  }

  const newSushi = {
    name: req.body.name,
    desc: req.body.desc,
    userHandle: req.user.handle,
    sushiImage: req.user.imageUrl,
    dishPoints: req.body.dishPoints,
    ingredients: [...req.body.ingredients.split(",")],
    type: req.body.type,
    category: req.body.category,
    difficultyScore: req.body.diffcultyScore,
    steps: req.body.steps,
    createdAt: new Date().toISOString(),
    likeCount: 0,
    commentCount: 0,
  };
  console.log(newSushi + " newsushihere " + req.body.name);
  db.collection("sushi")
    .add(newSushi)
    .then((doc) => {
      const resSushi = newSushi;
      resSushi.sushiId = doc.id;
      res.json(resSushi);
      console.log(res.json(resSushi));
    })
    .catch((err) => {
      res.status(500).json({ error: "something went wrong" });
      console.error(err);
    });
};

exports.deleteSushi = (req, res) => {
  const document = db.doc(`/sushi/${req.params.sushiId}`);
  document
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return res.status(404).json({ error: "Sushi not found" });
      }
      if (doc.data().userHandle !== req.user.handle) {
        return res.status(403).json({ error: "Unauthorized" });
      } else {
        return document.delete();
      }
    })
    .then(() => {
      res.json({ message: "Sushi deleted succesfully" });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};

// fetch one sushi
exports.getSushi = (req, res) => {
  let sushiData = {};

  db.doc(`/sushi/${req.params.sushiId}`)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return res.status(404).json({ error: "Sushi not Found" });
      }
      sushiData = doc.data();
      sushiData.sushiId = doc.id;
      return db
        .collection("comments")
        .orderBy("createdAt", "desc")
        .where("sushiId", "==", req.params.sushiId)
        .get();
    })
    .then((data) => {
      sushiData.comments = [];
      data.forEach((doc) => {
        sushiData.comments.push(doc.data());
      });
      return res.json(sushiData);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err.code });
    });
};

exports.commentOnSushi = (req, res) => {
  if (req.body.body.trim() === "")
    return res.status(400).json({ comment: "Comment must not be empty" });

  const newComment = {
    body: req.body.body,
    createdAt: new Date().toISOString(),
    sushiId: req.params.sushiId,
    userHandle: req.user.handle,
    userImage: req.user.imageUrl,
  };
  console.log("image url" + req.user.imageUrl);
  db.doc(`/sushi/${req.params.sushiId}`)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return res.status(400).json({ error: "Sushi not found" });
      }
      return doc.ref.update({ commentCount: doc.data().commentCount + 1 });
    })
    .then(() => {
      return db.collection("comments").add(newComment);
    })
    .then(() => {
      res.json(newComment);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: "Something went wrong oops" });
    });
};

exports.likeSushi = (req, res) => {
  const likeDocument = db
    .collection("likes")
    .where("userHandle", "==", req.user.handle)
    .where("sushiId", "==", req.params.sushiId)
    .limit(1);

  const sushiDocument = db.doc(`/sushi/${req.params.sushiId}`);

  let sushiData = {};

  sushiDocument
    .get()
    .then((doc) => {
      if (doc.exists) {
        sushiData = doc.data();
        sushiData.sushiId = doc.id;
        return likeDocument.get();
      } else {
        return res.status(404).json({ error: "Sushi not found" });
      }
    })
    .then((data) => {
      if (data.empty) {
        return db
          .collection("likes")
          .add({
            sushiId: req.params.sushiId,
            userHandle: req.user.handle,
          })
          .then(() => {
            sushiData.likeCount++;
            return sushiDocument.update({ likeCount: sushiData.likeCount });
          })
          .then(() => {
            return res.json(sushiData);
          });
      } else {
        return res.status(400).json({ error: "Sushi already liked" });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};

exports.unlikeSushi = (req, res) => {
  const likeDocument = db
    .collection("likes")
    .where("userHandle", "==", req.user.handle)
    .where("sushiId", "==", req.params.sushiId)
    .limit(1);

  const sushiDocument = db.doc(`/sushi/${req.params.sushiId}`);

  let sushiData;

  console.log(likeDocument, sushiDocument);

  sushiDocument
    .get()
    .then((doc) => {
      if (doc.exists) {
        sushiData = doc.data();
        sushiData.sushiId = doc.id;
        return likeDocument.get();
      } else {
        return res.status(404).json({ error: "Scream not found" });
      }
    })
    .then((data) => {
      if (data.empty) {
        return res.status(400).json({ error: "Sushi not liked" });
      } else {
        return db
          .collection("likes")
          .doc(`${data.docs[0].id}`)
          .delete()
          .then(() => {
            sushiData.likeCount--;
            return sushiDocument.update({ likeCount: sushiData.likeCount });
          })
          .then(() => {
            res.json(sushiData);
          });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};
