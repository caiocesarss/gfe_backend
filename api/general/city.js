const knex = require('../../config/dbpg');
const express = require('express')
const router = express.Router()


router.get('/', function(req, res){
    knex.select().from('cities').then(data=>{
        res.send(data)
      })
})

router.get('/:uf_id', function(req, res){
  knex.select().from('cities').where('uf_id', req.params.uf_id).then(data=>{
      res.send(data)
    })
})

router.post('/', function(req, res){
  
  knex.insert(req.body).returning('*').into('cities').then(data=>{
    res.send(data)
  })
})

router.patch('/:city_id', function(req,res){
  knex('cities').where({city_id: req.params.city_id}).update(req.body).returning('*').then(data=>{
    res.send(data)
  })
})

router.delete('/:city_id', function(req, res){
  knex('cities').where({city_id: req.params.city_id}).del().returning('*').then(data=>{
    res.send(data);
  })
})


module.exports = router