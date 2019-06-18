const knex = require('../../../config/dbpg');
const express = require('express')
const router = express.Router()


router.get('/', function(req, res){
    knex.select().from('p_invoices').then(data=>{
        res.send(data)
      })
})
router.post('/', function(req, res){
  const createdAt  = new Date();
  const pushData = {...req.body, created_at: createdAt};
  knex.insert(pushData).returning('*').into('p_invoices').then(data => {
    res.send(data)
  })
})

router.put('/:invoice_id', function(req,res){
  const updatedAt  = new Date();
  const pushData = {...req.body, updated_at: updatedAt};
  knex('p_invoices').where({invoice_id: req.params.invoice_id}).update(pushData).returning('*').then(data => {
    res.send(data)
  })
})

router.delete('/:invoice_id', function(req, res){
  knex('p_invoices').where({invoice_id: req.params.invoice_id}).del().returning('*').then(data => {
    res.send(data);
  })
})


module.exports = router