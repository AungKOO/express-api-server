const express = require("express");
const mongojs = require("mongojs");
const bodyParser = require("body-parser");
const app = express();
const db = mongojs("travel", ["records"]);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

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
        : res.status(200).json({ meta: {
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
        }
   });
    });
});

app.get("/api/test", function (req, res) {
  return res.json(req.query);
});

app.listen(3000, () => console.log("Server is running at port 3000"));
