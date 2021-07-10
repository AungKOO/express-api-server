const express = require("express");
const mongojs = require("mongojs");
const bodyParser = require("body-parser");
const app = express();
const db = mongojs("travel", ["records"]); // db connection
const { body, param, validationResult } = require("express-validator");
app.use(bodyParser.urlencoded({ extended: false })); //middleware
app.use(bodyParser.json()); // middleware
// CRUD
app.get("/api/records", function (req, res) {
  const options = req.query;
  const sort = options.sort || {};
  const filter = options.filter || {};
  const limit = 10;
  const page = parseInt(options.page) || 1;
  const skip = (page - 1) * limit;

  for (i in sort) {
    sort[i] = parseInt(sort[i]);
    console.log(`i: ${i}, sort[i]: ${sort[i]}`);
  }
  console.log("sort:" + sort);
  console.log("filter: " + filter);
  db.records
    .find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit, function (err, data) {
      return err
        ? res.sendStatus(500)
        : res.status(200).json({
            meta: {
              skip,
              limit,
              sort,
              filter,
              page,
              total: data.length,
            },
            data,
            links: {
              self: req.originalUrl,
            },
          });
    });
});

app.post(
  "/api/records",
  [
    body("name").not().isEmpty(),
    body("from").not().isEmpty(),
    body("to").not().isEmpty(),
  ],
  function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const record = {
      name: req.body.name,
      nrc: req.body.nrc,
      from: req.body.from,
      to: req.body.to,
      with: req.body.with,
    };

    db.records.insert(record, function (err, data) {
      if (err) {
        return res.status(500);
      }

      const _id = data._id;

      res.append("Location", "http://localhost:8000/api/records/" + _id);

      return res.status(201).json({ meta: { _id }, data });
    });
  }
);
app.put("/api/records/:id", [param("id").isMongoId()], function (req, res) {
  const _id = req.params.id;
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  db.records.count(
    {
      _id: mongojs.ObjectId(_id),
    },
    function (err, count) {
      if (count) {
        const record = {
          _id: mongojs.ObjectId(_id),
          ...req.body,
        };
        db.records.save(record, function (err, data) {
          return res.status(200).json({
            meta: { _id },
            data,
          });
        });
      } else {
        db.records.save(req.body, function (req, res) {
          return res.status(200).json({
            meta: { _id: data._id },
            data,
          });
        });
      }
    }
  );
});

app.patch("/api/records/:id", function (req, res) {
  const _id = req.params.id;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  db.records.count(
    {
      _id: mongojs.ObjectId(_id),
    },
    function (err, count) {
      if (count) {
        db.records.update(
          { _id: mongojs.ObjectId(_id) },
          { $set: req.body },
          { multi: false },
          function (err, data) {
            db.records.find(
              {
                _id: mongojs.ObjectId(_id),
              },
              function (err, data) {
                return res.status(200).json({ meta: { _id }, data });
              }
            );
          }
        );
      } else {
        return res.sendStatus(404);
      }
    }
  );
});

app.delete("/api/records/:id", function (req, res) {
  const _id = req.params.id;
  db.records.count(
    {
      _id: mongojs.ObjectId(_id),
    },
    function (err, count) {
      if (count) {
        db.records.remove(
          {
            _id: mongojs.ObjectId(_id),
          },
          function (err, data) {
            return err ? res.sendStatus(500) : res.status(204);
          }
        );
      } else {
        return res.sendStatus(404);
      }
    }
  );
});
app.listen(3000, () => console.log("Server is running at port 3000"));
