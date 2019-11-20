const knex = require('../../../config/dbpg');
const express = require('express')
const _ = require('lodash');
const router = express.Router()


router.get('/', function(req, res){
    knex.select().from('p_invoices_v').then(data=>{
        res.send(data)
      })
})

router.get('/:invoice_id', function(req, res){
  knex.select().from('p_invoices').where({invoice_id: req.params.invoice_id}).then(data=>{
      res.send(data)
    })
})

router.post('/setinvoice/', function(req, res){
  const createdAt  = new Date();
  const pushData = {...req.body, created_at: createdAt};
  knex.insert(pushData).into('p_invoices').then(data => {
    res.send(data)
  })
})

router.put('/setinvoice/', function(req,res){
 
  const updatedAt  = new Date();
  let pushData = {...req.body, updated_at: updatedAt};
  pushData = _.omit(pushData, ['created_at']);
  knex('p_invoices').where({invoice_id: req.body.invoice_id}).update(pushData).then(data => {
    res.send(data[0])
  })
})

router.delete('/:invoice_id', function(req, res){
  knex('p_invoices').where({invoice_id: req.params.invoice_id}).del().returning('*').then(data => {
    res.send(data);
  })
})


module.exports = router