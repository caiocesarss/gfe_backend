const knex = require('../../config/dbpg');
const express = require('express')
const _ = require('lodash');
const router = express.Router()


router.get('/', function(req, res){
    knex.select().from('cubs').then(data=>{
        res.send(data)
      })
})

router.get('/:cub_id', function(req, res){
  knex.select().from('cubs').where({cub_id: req.params.cub_id}).then(data=>{
      res.send(data)
    })
})

router.post('/', function(req, res){
  const createdAt  = new Date();
  const pushData = {...req.body, created_at: createdAt};
  knex.insert(pushData).into('cubs').then(data => {
    res.send(data)
  })
})

router.put('/', function(req,res){
  const updatedAt  = new Date();
  let pushData = {...req.body, updated_at: updatedAt};
  pushData = _.omit(pushData, ['created_at']);
  knex('cubs').where({cub_id: req.body.cub_id}).update(pushData).then(data => {
    res.send(data[0])
  })
})

router.delete('/:cub_id', function(req, res){
  knex('cubs').where({invoice_id: req.params.cub_id}).del().then(data => {
    res.send(data);
  })
})


module.exports = router