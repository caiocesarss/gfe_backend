const knex = require('../../config/dbpg');
const express = require('express')
const router = express.Router()


router.get('/', function(req, res){
    knex.select().from('sales_orders').then(data=>{
        res.send(data)
      })
})

router.post('/', function(req, res){
  const createdAt  = new Date();
  const pushData = {...req.body, created_at: createdAt};
  knex.insert(pushData).returning('*').into('sales_orders').then(function(data){
    res.send(data)
  })
})



router.put('/:order_id', function(req,res){
  const updatedAt  = new Date();
  const pushData = {...req.body, updated_at: updatedAt};
  knex('sales_orders').where({order_id: req.params.party_id}).update(pushData).returning('*').then(function(data){
    res.send(data)
  })
})

router.delete('/:order_id', function(req, res){
  knex('sales_orders').where({order_id: req.params.party_id}).del().returning('*').then(function(data){
    res.send(data);
  })
})

module.exports = router