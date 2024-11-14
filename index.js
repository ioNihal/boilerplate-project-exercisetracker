const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require("body-parser")
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

const users = [];
const exercises = {};

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

app.post("/api/users", (req, res) => {
  const username = req.body.username;
  const userId = generateId();
  const newUser = { username, _id: userId };
  users.push(newUser);
  res.json(newUser);
});

app.get("/api/users", (req, res) => {
  res.json(users);
});

app.post("/api/users/:_id/exercises", (req, res) => {
  const { _id } = req.params;
  const { description, duration, date } = req.body;
  const user = users.find(u => u._id === _id);

  if (!user) {
    return res.json({ error: "User not found" });
  }

  const exerciseDate = date ? new Date(date) : new Date();
  const newExercise = {
    description,
    duration: parseInt(duration),
    date: exerciseDate.toDateString(),
    _id: _id
  };

  if (!exercises[_id]) {
    exercises[_id] = [];
  }

  exercises[_id].push(newExercise);

  res.json({
    username: user.username,
    description: newExercise.description,
    duration: newExercise.duration,
    date: newExercise.date,
    _id: user._id
  });
});

app.get("/api/users/:_id/logs", (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;
  const user = users.find(u => u._id === _id);

  if (!user) {
    return res.json({ error: "User not found" });
  }

  let userExercises = exercises[_id] || [];

  if (from) {
    const fromDate = new Date(from);
    userExercises = userExercises.filter(ex => new Date(ex.date) >= fromDate);
  }

  if (to) {
    const toDate = new Date(to);
    userExercises = userExercises.filter(ex => new Date(ex.date) <= toDate);
  }

  if (limit) {
    userExercises = userExercises.slice(0, parseInt(limit));
  }

  res.json({
    username: user.username,
    count: userExercises.length,
    _id: user._id,
    log: userExercises.map(({ description, duration, date }) => ({
      description,
      duration,
      date
    }))
  });
});





const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
