require("dotenv").config();
const express = require("express");
const Person = require("./models/person");

const app = express();

const cors = require("cors");
app.use(cors());

app.use(express.static("build"));

app.use(express.json());

const morgan = require("morgan");
morgan.token("payload", (req) =>
  req.method === "POST" ? JSON.stringify(req.body) : null
);
const morgan_conf =
  ":method :url :status :res[content-length] - :response-time ms :payload";
app.use(morgan(morgan_conf));

const people = {
  persons: [
    {
      name: "Arto Hellas",
      number: "3231",
      id: 1,
    },
    {
      name: "Ada Lovelace",
      number: "39-44-5323523",
      id: 2,
    },
    {
      name: "Dan Abramov",
      number: "12-43-234345",
      id: 3,
    },
    {
      name: "Mary Poppendieck",
      number: "39-23-6423122",
      id: 4,
    },
  ],
};

app.get("/api/persons", (req, res) => {
  res.json(people.persons);
});

app.post("/api/persons", (req, res) => {
  const data = req.body;

  if (!data.name) {
    return res.status(400).json({
      error: "name missing",
    });
  }

  if (
    people.persons.findIndex(
      (person) => person.name.toLowerCase() === data.name.toLowerCase()
    ) >= 0
  ) {
    return res.status(400).json({
      error: "name must be unique",
    });
  }

  if (!data.number) {
    return res.status(400).json({
      error: "number missing",
    });
  }

  const newPerson = Person({
    name: data.name,
    number: data.number,
  });

  newPerson.save().then((savedPerson) => res.status(201).json(savedPerson));
  // people.persons = people.persons.concat(newPerson);

  // return res.status(201).end();
});

app.delete("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  people.persons = people.persons.filter((person) => person.id !== id);

  res.status(204).end();
});

app.get("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  const person = people.persons.find((person) => person.id === id);

  if (!person) return res.status(404).end();

  res.json(person);
});

app.get("/info", (req, res) => {
  const date = new Date();
  const info = `Phonebook has info for ${people.persons.length} people\n\n${date}`;
  res.type("text/plain").end(info);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
