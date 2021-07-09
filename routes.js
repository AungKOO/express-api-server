const express = require("express");
const router = express.Router();
const app = express();
// sample data
router.get("/people", function (req, res) {
  const data = [
    {
      name: "Bobo",
      nrc: "A0131",
      from: "Yangon",
      to: "Mandalay",
      with: "5B9876",
    },
    { name: "Nini", nrc: "A1476", from: "Yangon", to: "Bago", with: "3G6457" },
    { name: "Coco", nrc: "B0487", from: "Bago", to: "Yangon", with: "4L2233" },
    {
      name: "Mimi",
      nrc: "C1987",
      from: "Yangon",
      to: "Mandalay",
      with: "9E4343",
    },
    { name: "Nono", nrc: "B0098", from: "Bago", to: "Yangon", with: "4L2233" },
    { name: "Momo", nrc: "C0453", from: "Yangon", to: "Bago", with: "3G6457" },
  ];
  return res.status(200).json(data);
});
router.get("/people/:id", function (req, res) {
    const id = req.params.id;
    return res.status(200).json({id});
});

module.exports = router;