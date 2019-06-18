const knex = require('../../config/dbpg');
const express = require('express')
const router = express.Router()
const validCPF = require('cpf-check');

/*
validador
Para CPF
/^\d{3}\.\d{3}\.\d{3}\-\d{2}$/
Para CNPJ
/^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$/
Para ambos ao mesmo tempo
/(^\d{3}\.\d{3}\.\d{3}\-\d{2}$)|(^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$)/
*/

router.get('/:party_id', function(req, res){
    //getPartyAccounts(req, res)
    knex('party_accounts').where({party_id: req.params.party_id}).then(data=>{
      res.send(data)
    })
})

router.post('/', function(req, res){
    const cpf = req.body.doc1_value;
    const { valid } = validCPF.validate(validCPF.strip(cpf));
    const createdAt  = new Date();
    const pushData = {...req.body, created_at: createdAt};
    if (!valid){
        return (
            res.status(400).send({error: 'CPF inválido'})
        )
    }
    knex.insert(pushData).returning('*').into('party_accounts').then(function(data){
        res.send(data)
    })
})

router.put('/:party_id', function(req,res){
    const updatedAt  = new Date();
    const pushData = {...req.body, updated_at: updatedAt};
    knex('party_accounts').where({party_id: req.params.party_id}).update(pushData).returning('*').then(function(data){
        res.send(data)
    })
})

router.delete('/:party_id', function(req, res){
  knex('party_accounts').where({party_id: req.params.party_id}).del().returning('*').then(function(data){
    res.send(data);
  })
})

const getPartyAccounts = (req, res) => {
   knex.select().from('party_accounts').then(data=>{
     res.send(data)
   })
  }

module.exports = router