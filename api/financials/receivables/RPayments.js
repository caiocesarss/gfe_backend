const knex = require('../../../config/dbpg');
const express = require('express')
const router = express.Router()

const createLog = require('../../../functions/createLog')

router.get('/:invoice_id', function(req, res){
 
  knex.select().from('rec_payments').where('invoice_id', req.params.invoice_id).then(data=>{
      res.send(data)
    })
})


router.post('/setinvoicepayment', function(req, res){
  const pushData = {...req.body};
  knex.insert(pushData).into('rec_payments').then(data => {
    const token = req.headers.authorization || ''
    const description = `Criação baixa do contas a pagar: ${data.invoice_id}`
    createLog({ token, description })

    res.send(data)
  })
})


router.put('/setinvoicepayment', function(req, res){
  const pushData = {...req.body};
  //pushData = _.omit(pushData, ['invoice_id']);
  knex('rec_payments').where({payment_id: req.body.payment_id}).update(pushData).then(data =>{
    const token = req.headers.authorization || ''
    const description = `Atualização baixa do contas a pagar: ${pushData.invoice_id}`
    createLog({ token, description })

    res.send(data[0])
  })
})



router.delete('/:payment_id', function(req, res){
  knex('rec_payments').where({payment_id: req.params.payment_id}).del().then(data => {
    const token = req.headers.authorization || ''
    const description = `Exclusão baixa do contas a pagar: ${req.params.payment_id}`
    createLog({ token, description })

    res.send(data[0]);
  })
})


module.exports = router