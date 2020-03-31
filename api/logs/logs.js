const knex = require('../../config/dbpg');
const express = require('express')
const router = express.Router()

router.get('/', async (req, res) => {
  const data = await knex('user_logs').select('*')
  return res.json(data)
})

module.exports = router
