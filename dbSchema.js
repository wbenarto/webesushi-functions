let db = {
  sushi: [
    {
      name: "",
      desc: "",
      images: "",
      ingredients: [""],
      type: "",
      category: "",
      difficultyScore: '',
      steps: [{step:'', imageURL: ''}]
    },
  ],
  comments: [
    {
      userHandle: "webe",
      sushiId: "123234252",
      body: "First Sushi comment yoo",
      createdAt: "2021-03-30T10:59:52.598Z",
    },
  ],
  instructions: [
    {
      title: "Spoonful of Happiness",
      sushiId: "123234252",
      images: [""],
      steps: [""],
      dishPoints: 10,
      tips: "",
    },
  ],
  notification: [
    {
      recipient: "user",
      sender: "john",
      read: "true | false",
      sushiId: "suishisiow",
      type: "like | comment",
      createdAt: "date",
    },
  ],
};

category = ["raw", "veg", "cook"];
type = ["maki", "inside out", "chef special", "nigiri", "sashimi", "sauces"];

instructions.difficulty = [
  // out of 5 sushi stars
];

const userDetails = {
  credentials: {
    bio: "I love sushi berry berry muchy",
    createdAt: "2021-03-31T05:55:36.728Z",
    email: "webe@email.com",
    handle: "handlenew",
    imageUrl:
      "https://firebasestorage.googleapis.com/v0/b/webesushi-a3bf0.appspot.com/o/73171195.jpg?alt=media",
    location: "San Francisco, US",
    userId: "PY8TZCpRc7TCeXf8cYA5jpNnO3x1",
    website: "http://webesushi.io",
  },
  likes: [
    {
      userHandle: "webe",
      sushiId: "randomness",
    },
    {
      userHandle: "webe2",
      sushiId: "randomness2",
    },
  ],
};
