const knex = require('../../config/dbpg');
const express = require('express')
const router = express.Router()


router.get('/', function(req, res){
  getParties(req, res)
})

router.post('/', function(req, res){
  const createdAt  = new Date();
  const pushData = {...req.body, created_at: createdAt};
  knex.insert(pushData).returning('*').into('parties').then(function(data){
    res.send(data)
  })
})

router.post("/select/", function(req, res, next) {
  const table = req.body.table;
  const params = req.body;
 
  let whereType = "";
  let whereParams = "";
  if (params) {
    whereType = "where";
    whereParams = params;
  } else {
    whereType = "whereRaw";
    whereParams = "1=1";
  }
  knex('parties')
    [whereType](whereParams)
    .select("*")
    .then(data => {
      res.send(data);
    });
});

router.post("/selectaccounts/", function(req, res, next) {
  const table = req.body.table;
  const params = req.body;
 
  let whereType = "";
  let whereParams = "";
  if (params) {
    whereType = "where";
    whereParams = params;
  } else {
    whereType = "whereRaw";
    whereParams = "1=1";
  }
  /*knex('party_accounts')
    [whereType](whereParams)
    .select("*")
    .then(data => {
      res.send(data);
    });
    */
    
   knex('party_accounts')
  .join('locations', 'party_accounts.location_id', 'locations.location_id')
  .join('cities', 'locations.city_id',  'cities.city_id')
  .join('ufs', 'cities.uf_id',  'ufs.uf_id')
  [whereType](whereParams)
  .select('party_accounts.party_account_id'
          ,'party_accounts.legal_account_name as name'
          ,'party_accounts.account_alias_name as alias_name'
          , 'party_accounts.doc1_value as doc_value'
          , 'cities.name as city_name'
          , 'ufs.code as uf').then(data => {
    res.send(data);
  });
});

router.put('/:party_id', function(req,res){
  const updatedAt  = new Date();
  const pushData = {...req.body, updated_at: updatedAt};
  knex('parties').where({party_id: req.params.party_id}).update(pushData).returning('*').then(function(data){
    res.send(data)
  })
})

router.delete('/:party_id', function(req, res){
  knex('parties').where({party_id: req.params.party_id}).del().returning('*').then(function(data){
    res.send(data);
  })
})

const getParties = (req, res) => {
   knex.select().from('parties').then(data=>{
     res.send(data)
   })
  }
module.exports = router