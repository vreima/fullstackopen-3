const express = require("express");
const app = express();

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

app.get("/info", (req, res) => {
  const date = new Date();
  const info = `Phonebook has info for ${people.persons.length} people\n\n${date}`;
  res.type("text/plain").end(info);
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
