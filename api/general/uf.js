const knex = require('../../config/dbpg');
const express = require('express')
const router = express.Router()


router.get('/', function(req, res){
    knex.select().from('ufs').orderBy('code').then(data=>{
        res.send(data)
      })
})
router.post('/', function(req, res){
  
  knex.insert(req.body).returning('*').into('ufs').then(data=>{
    res.send(data)
  })
})

router.patch('/:uf_id', function(req,res){
  knex('ufs').where({uf_id: req.params.uf_id}).update(req.body).returning('*').then(data=>{
    res.send(data)
  })
})

router.delete('/:uf_id', function(req, res){
  knex('ufs').where({uf_id: req.params.uf_id}).del().returning('*').then(data=>{
    res.send(data);
  })
})


module.exports = router