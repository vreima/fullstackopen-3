require("dotenv").config();
const express = require("express");
const Person = require("./models/person");

const app = express();
const cors = require("cors");
const morgan = require("morgan");

morgan.token("payload", (req) =>
  req.method === "POST" ? JSON.stringify(req.body) : null
);
const morgan_conf =
  ":method :url :status :res[content-length] - :response-time ms :payload";

app.use(cors());
app.use(express.json());
app.use(morgan(morgan_conf));
app.use(express.static("build"));

app.get("/api/persons", (req, res) => {
  Person.find({}).then((persons) => {
    res.json(persons);
  });
});

app.post("/api/persons", (req, res, next) => {
  const data = req.body;

  if (!data.name) {
    return res.status(400).json({
      error: "name missing",
    });
  }

  Person.find({}).then((persons) => {
    if (
      !persons.every(
        (person) => person.name.toLowerCase() !== data.name.toLowerCase()
      )
    )
      return res.status(400).json({
        error: "name must be unique",
      });

    if (!data.number) {
      return res.status(400).json({
        error: "number missing",
      });
    }

    const newPerson = Person({
      name: data.name,
      number: data.number,
    });

    newPerson
      .save()
      .then((savedPerson) => res.status(201).json(savedPerson))
      .catch((error) => next(error));
  });
});

app.delete("/api/persons/:id", (req, res, next) => {
  Person.findOneAndDelete({ _id: req.params.id })
    .then((deleted) => res.status(204).end())
    .catch((error) => next(error));
});

app.put("/api/persons/:id", (req, res, next) => {
  const id = req.params.id;

  const person = {
    name: req.body.name,
    number: req.body.number,
  };

  Person.findByIdAndUpdate(id, person, { new: true })
    .then((result) => {
      if (result) res.json(result);
      else res.status(404).end();
    })
    .catch((error) => next(error));
});

app.get("/api/persons/:id", (req, res, next) => {
  Person.findById(req.params.id)
    .then((person) => {
      if (person) res.json(person);
      else res.status(404).end();
    })
    .catch((error) => next(error));

  // Person.find({})
  //   .then((persons) => {
  //     persons.forEach((person) => {
  //       if (person._id.toString() === req.params.id) {
  //         res.json(person);
  //       }
  //     });
  //     res.status(404).end();
  //   })
  //   .catch((error) => next(error));

  // res.json(person);
  // const id = Number(req.params.id);
  // const person = people.persons.find((person) => person.id === id);

  // if (!person) return res.status(404).end();

  // res.json(person);
});

app.get("/info", (req, res) => {
  Person.find({}).then((persons) => {
    const date = new Date();
    const info = `Phonebook has info for ${persons.length} people\n\n${date}`;
    res.type("text/plain").end(info);
  });
});

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  }

  next(error);
};

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

// tämä tulee kaikkien muiden middlewarejen rekisteröinnin jälkeen!
app.use(errorHandler);
app.use(unknownEndpoint);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
