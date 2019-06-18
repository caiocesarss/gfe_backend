const knex = require("../../config/dbpg");
const express = require("express");
const router = express.Router();

router.post("/", function(req, res, next) {
  const table = req.body.table;
  const params = req.body.params;
  let whereType = "";
  let whereParams = "";
  if (params) {
    whereType = "where";
    whereParams = params;
  } else {
    whereType = "whereRaw";
    whereParams = "1=1";
  }
  knex(table)
    [whereType](whereParams)
    .select("*")
    .then(data => {
      res.send(data);
    });
});

module.exports = router;
