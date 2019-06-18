const knex = require('../../../config/dbpg');
const express = require('express')
const router = express.Router()


router.get('/', function(req, res){
    knex.select().from('fin_groups').then(data=>{
        res.send(data)
      })
})
router.post('/', function(req, res){
  const createdAt  = new Date();
  const pushData = {...req.body, created_at: createdAt};
  knex.insert(pushData).returning('*').into('fin_groups').then(data => {
    res.send(data)
  })
})

router.put('/:group_id', function(req,res){
  const updatedAt  = new Date();
  const pushData = {...req.body, updated_at: updatedAt};
  knex('fin_groups').where({group_id: req.params.group_id}).update(pushData).returning('*').then(data => {
    res.send(data)
  })
})

router.delete('/:group_id', function(req, res){
  knex('fin_groups').where({group_id: req.params.group_id}).del().returning('*').then(data => {
    res.send(data);
  })
})


module.exports = router