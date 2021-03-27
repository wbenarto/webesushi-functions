const { db } = require("../util/admin");

exports.getAllSushi = (req, res) => {
  db.collection("sushi")
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
};

exports.createSushi = (req, res) => {
  if (req.method !== "POST") {
    return res.status(400).json({ error: "Method not allowed" });
  }
  const newSushi = {
    name: req.body.name,
    price: req.body.price,
    userHandle: req.user.handle,
  };

  db.collection("sushi")
    .add(newSushi)
    .then((doc) => {
      res.json({ message: `document ${doc.id} created successfully` });
    })
    .catch((err) => {
      res.status(500).json({ error: "something went wrong" });
      console.error(err);
    });
};
