const knex = require('../../config/dbpg');
const express = require('express')
const router = express.Router()


router.get('/', function(req, res){
    knex.select().from('locations').then(data=>{
        res.send(data)
      })
})
router.post('/', function(req, res){
  const createdAt  = new Date();
  const pushData = {...req.body, created_at: createdAt};
  knex.insert(pushData).returning('*').into('locations').then(data=>{
    res.send(data)
  })
})

router.patch('/:location_id', function(req,res){
  const updatedAt  = new Date();
  const pushData = {...req.body, updated_at: updatedAt};
  knex('locations').where({location_id: req.params.location_id}).update(pushData).returning('*').then(data=>{
    res.send(data)
  })
})

router.delete('/:location_id', function(req, res){
  knex('locations').where({location_id: req.params.location_id}).del().returning('*').then(data=>{
    res.send(data);
  })
})


module.exports = router