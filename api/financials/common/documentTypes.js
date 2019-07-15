const knex = require('../../../config/dbpg');
const express = require('express')
const router = express.Router()


router.get('/', function(req, res){
    knex.select().from('document_types').then(data=>{
        res.send(data)
      })
})

module.exports = router