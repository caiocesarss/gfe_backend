const knex = require('../../config/dbpg');
const express = require('express')
const router = express.Router()
const _ = require('lodash');

router.get('/', function(req, res){
  getObras(req, res)
})

router.post('/', function(req, res){
  const createdAt  = new Date();
  const pushData = {...req.body, created_at: createdAt};
  knex.insert(pushData).into('constructions').then(data => {
    res.send(data)
  })
})

router.get('/:construction_id', function(req, res){
  knex('constructions').where({construction_id: req.params.construction_id}).then(data=>{
    res.send(data)
  })
})

router.put('/', function(req,res){
  const updatedAt  = new Date();
  let pushData = {...req.body, updated_at: updatedAt};
  pushData = _.omit(pushData, ['created_at']);
  pushData.start_date =  new Date(pushData.start_date);
  knex('constructions').where({construction_id: req.body.construction_id}).update(pushData).then(data => {
    if (data != 1){
      res.status(200).send({error: 'Existem registros financeiros ativos para este cliente/fornecedor'}); 
    }
    res.status(200)
  })
})

router.delete('/:construction_id', function(req, res){
  knex('constructions').where({construction_id: req.params.construction_id}).del().then(data => {
    res.send(data);
  })
})

const getObras= (req, res) => {
   knex.select().from('constructions').then(data=>{
     res.send(data)
   })
  }
module.exports = router