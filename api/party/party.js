const knex = require('../../config/dbpg');
const express = require('express')
const router = express.Router()


router.get('/', function (req, res) {
  getParties(req, res)
})

router.post('/', async function (req, res) {
  const createdAt = new Date();


  const partyData = { name: req.body.name, type: req.body.type, created_at: createdAt }
  const partyId = await knex.insert(partyData).into('parties').then(data => {
    return data[0];
  })

  const locationData = {
    address_line: req.body.address_line,
    number: req.body.number,
    complement: req.body.complement,
    reference: req.body.reference,
    district: req.body.district,
    city_id: req.body.city,
    state_id: req.body.uf
  }
  const locationId = await knex.insert(locationData).into('locations').then(data => {
    return data[0];
  })

  let doc1_type = '';
  let doc2_type = '';
  if (req.body.type == 'F') {
    doc1_type = 'CPF';
    doc2_type = 'RG';
  } else {
    doc1_type = 'CNPJ';
    doc2_type = 'IE';
  }

  const partyAccountData = {
    party_id : partyId,
    account_alias_name: req.body.account_alias_name,
    account_alias_name: req.body.account_alias_name,
    legal_account_name: req.body.legal_account_name,
    doc1_type: doc1_type,
    doc1_value: req.body.doc1_value,
    doc2_type: doc2_type,
    doc2_value: req.body.doc2_value,
    location_id: locationId
  }
  const accountId = await knex.insert(partyAccountData).into('party_accounts').then(data => {
    return data[0];
  })

  res.send({party_id: partyId, location_id: locationId, party_account_id: accountId})
})



router.post("/select/", function (req, res, next) {
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

router.post("/selectaccounts/", function (req, res, next) {
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

  knex('party_accounts')
    .leftOuterJoin('locations', 'party_accounts.location_id', 'locations.location_id')
    .leftOuterJoin('cities', 'locations.city_id', 'cities.city_id')
    .leftOuterJoin('ufs', 'cities.uf_id', 'ufs.uf_id')
  [whereType](whereParams)
    .select('party_accounts.party_account_id'
      , 'party_accounts.legal_account_name as name'
      , 'party_accounts.account_alias_name as alias_name'
      , 'party_accounts.doc1_value as doc_value'
      , 'cities.name as city_name'
      , 'ufs.code as uf').then(data => {
        res.send(data);
      });

});

router.put('/:party_id', function (req, res) {
  const updatedAt = new Date();
  const pushData = { ...req.body, updated_at: updatedAt };
  knex('parties').where({ party_id: req.params.party_id }).update(pushData).returning('*').then(function (data) {
    res.send(data)
  })
})

router.delete('/:party_id', function (req, res) {
  knex('parties').where({ party_id: req.params.party_id }).del().returning('*').then(function (data) {
    res.send(data);
  })
})

const getParties = (req, res) => {
  knex.select().from('parties').then(data => {
    res.send(data)
  })
}
module.exports = router