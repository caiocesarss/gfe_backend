const knex = require('../../../config/dbpg');
const express = require('express')
const router = express.Router()


router.get('/', function(req, res){
    knex.select().from('r_invoices_v').then(data=>{
        res.send(data)
      })
})

router.get('/:invoice_id', function(req, res){
  knex.select().from('r_invoices_v').where('invoice_id', req.params.invoice_id).then(data=>{
      res.send(data)
    })
})

router.get('/payments/:invoice_id', function(req, res){
 
  knex.select().from('rec_payments').where('invoice_id', req.params.invoice_id).then(data=>{
      res.send(data)
    })
})

router.post('/', function(req, res){
  const createdAt  = new Date();
  const pushData = {...req.body, created_at: createdAt};
  knex.insert(pushData).returning('*').into('r_invoices').then(data => {
    res.send(data)
  })
})

router.post('/setinvoicepayment', function(req, res){
  const pushData = {...req.body};
  knex.insert(pushData).into('rec_payments').then(data => {
    res.send(data)
  })
})


router.put('/setinvoicepayment', function(req, res){
  const pushData = {...req.body};
  //pushData = _.omit(pushData, ['invoice_id']);
  knex('rec_payments').where({payment_id: req.body.payment_id}).update(pushData).then(data =>{
    res.send(data[0])
  })
})

router.put('/:invoice_id', function(req,res){
  const updatedAt  = new Date();
  const pushData = {...req.body, updated_at: updatedAt};
  knex('r_invoices').where({invoice_id: req.params.invoice_id}).update(pushData).then(data => {
    res.send(data)
  })
})

router.delete('/:invoice_id', function(req, res){
  knex('r_invoices').where({invoice_id: req.params.invoice_id}).del().returning('*').then(data => {
    res.send(data);
  })
})



module.exports = router