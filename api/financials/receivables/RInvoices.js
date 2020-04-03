const knex = require('../../../config/dbpg');
const express = require('express')
const router = express.Router()

const createLog = require('../../../functions/createLog')

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
    const token = req.headers.authorization || ''
    const description = `Criação receber: ${data.invoice_id}`
    createLog({ token, description })

    res.send(data)
  })
})

router.post('/setinvoicepayment', function(req, res){
  const pushData = {...req.body};
  knex.insert(pushData).into('rec_payments').then(data => {
    const token = req.headers.authorization || ''
    const description = `Atualização receber: ${data.invoice_id}`
    createLog({ token, description })

    res.send(data)
  })
})

router.post('/setinvoicepaymentinlot', async function(req, res){
  let pendentValue = req.body.amount
  const ids = req.body.ids
  const paidIds = []

  for (let id of ids) {
    const [item] = await knex('r_invoices')
      .where('invoice_id', id)
      .select('amount')

    const payments = await knex('rec_payments')
      .where('invoice_id', id)
      .select('amount')

    const amount = item.amount - payments.reduce((acc, { amount }) => acc + amount, 0)

    if (amount > 0 && pendentValue > 0) {
      paidIds.push(id)
      const pushData = {
        invoice_id: id,
        payment_date: knex.fn.now(),
        amount: amount > pendentValue ? pendentValue : amount
      }
<<<<<<< HEAD
=======
      pendentValue -= amount
>>>>>>> 19413eee1b4571fcf8bf62252fea8dacac3ada64
      await knex('rec_payments').insert(pushData)
    }
  }

  if (paidIds.length > 0) {
    const token = req.headers.authorization || ''
    const description = `Baixa em lote: ${paidIds.join(', ')}`

    createLog({ token, description })
  }

  return res.status(204).send()
})


router.put('/setinvoicepayment', function(req, res){
  const pushData = {...req.body};
  //pushData = _.omit(pushData, ['invoice_id']);
  knex('rec_payments').where({payment_id: req.body.payment_id}).update(pushData).then(data =>{
    const token = req.headers.authorization || ''
    const description = `Atualização pagamento: ${req.body.payment_id}`
    createLog({ token, description })

    res.send(data[0])
  })
})

router.put('/:invoice_id', function(req,res){
  const updatedAt  = new Date();
  const pushData = {...req.body, updated_at: updatedAt};
  knex('r_invoices').where({invoice_id: req.params.invoice_id}).update(pushData).then(data => {
    const token = req.headers.authorization || ''
    const description = `Atualização receber: ${req.params.invoice_id}`
    createLog({ token, description })

    res.send(data)
  })
})

router.delete('/:invoice_id', function(req, res){
  knex('r_invoices').where({invoice_id: req.params.invoice_id}).del().returning('*').then(data => {
    const token = req.headers.authorization || ''
    const description = `Exclusão receber: ${req.params.invoice_id}`
    createLog({ token, description })

    res.send(data);
  })
})



module.exports = router