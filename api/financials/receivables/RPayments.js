const knex = require('../../../config/dbpg');
const express = require('express')
const router = express.Router()



router.get('/:invoice_id', function(req, res){
 
  knex.select().from('rec_payments').where('invoice_id', req.params.invoice_id).then(data=>{
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



router.delete('/:payment_id', function(req, res){
  knex('rec_payments').where({payment_id: req.params.payment_id}).del().then(data => {
    res.send(data[0]);
  })
})


module.exports = router