const knex = require('../../config/dbpg');
const express = require('express')
const router = express.Router()


router.get('/', function(req, res){
  getObras(req, res)
})

router.post('/', function(req, res){
  const createdAt  = new Date();
  const pushData = {...req.body, created_at: createdAt};
  knex.insert(pushData).returning('*').into('constructions').then(data => {
    res.send(data)
  })
})

router.get('/:construction_id', function(req, res){
  knex('constructions').where({construction_id: req.params.construction_id}).then(data=>{
    res.send(data)
  })
})

router.put('/:construction_id', function(req,res){
  const updatedAt  = new Date();
  const pushData = {...req.body, updated_at: updatedAt};
  knex('constructions').where({construction_id: req.params.construction_id}).update(pushData).returning('*').then(data => {
    res.send(data)
  })
})

router.delete('/:construction_id', function(req, res){
  knex('constructions').where({construction_id: req.params.construction_id}).del().returning('*').then(data => {
    res.send(data);
  })
})

const getObras= (req, res) => {
   knex.select().from('constructions').then(data=>{
     res.send(data)
   })
  }
module.exports = router