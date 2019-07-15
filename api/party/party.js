const knex = require('../../config/dbpg');
const express = require('express')
const router = express.Router()


router.get('/:categoria', function (req, res) {
  let whereType = '';
  let whereParams = '';
  whereType = "whereRaw";
  whereParams = "1=1";
  if (req.params.categoria === 'fornecedor') {
    whereType = "where";
    whereParams = {is_vendor : 1};
  } 
  if (req.params.categoria === 'cliente') {
    whereType = "where";
    whereParams = {is_customer: 1};
  } 
  
  knex('parties')[whereType](whereParams).select().then(data => {
    res.send(data)
  })
})


router.get('/getById/:party_id', function (req, res) {
  knex.select().from('parties').where('party_id', req.params.party_id).then(data => {
    res.send(data)
  })
})

router.post('/', async function (req, res) {
  const createdAt = new Date();
  const partyData = { name: req.body.name, type: req.body.type, created_at: createdAt, is_vendor: req.body.is_vendor, is_customer: req.body.is_customer }
  const partyId = await knex.insert(partyData).into('parties').then(data => {
    return data[0];
  })
  const resultAL = setPartyAccount(req.body, partyId);
  res.send({ party_id: partyId, location_id: resultAL.locationId, party_account_id: resultAL.accountId })
})

router.post('/setaccount/', async function (req, res) {
  partyId = req.body.party_id;
  try {
    const result = await setPartyAccount(req.body);
    res.send({ party_id: partyId })
  } catch (e) {
    res.status(400)
    res.send(e.message)
  }
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

router.put('/', async function (req, res) {
  const updatedAt = new Date();
  const createdAt = new Date(req.body.created_at);
  const pushData = { ...req.body, created_at: createdAt, updated_at: updatedAt };
  const ret = await knex('parties').where({ party_id: pushData.party_id }).update(pushData).then(function (data) {
    return data[0]
  })
  res.send({ dados: ret })
})

router.delete('/:party_id', async function (req, res) {

  try {
    const result = await knex('parties').where({ party_id: req.params.party_id }).del().then(function (data) {
      return data
    })
    if (result) {
      const accounts = await knex('party_accounts').where({ party_id: req.params.party_id }).select('party_account_id', 'location_id').then(function (data) {
        return data
      })
      accounts.map(async account => {
        const location = await knex('locations').where({ location_id: account.location_id }).del().then(function (data) {
          return data
        })
      })
      const accountsDeleted = await knex('party_accounts').where({ party_id: req.params.party_id }).del().then(function (data) {
        return data
      })
    }
    res.send(200)

  } catch (e) {
    res.status(400)
    res.send(e.message)
  }

})

async function setPartyAccount(data, partyId) {
  const locationData = {
    address_line: data.address_line,
    number: data.number,
    complement: data.complement,
    reference: data.reference,
    district: data.district,
    city_id: data.city,
    state_id: data.uf
  }
  const locationId = await knex.insert(locationData).into('locations').then(data => {
    return data[0];
  })
  let doc1_type = '';
  let doc2_type = '';
  if (data.type == 'F') {
    doc1_type = 'CPF';
    doc2_type = 'RG';
  } else {
    doc1_type = 'CNPJ';
    doc2_type = 'IE';
  }
  const partyAccountData = {
    party_id: data.party_id || partyId,
    account_alias_name: data.account_alias_name,
    account_alias_name: data.account_alias_name,
    legal_account_name: data.legal_account_name,
    doc1_type: doc1_type,
    doc1_value: data.doc1_value,
    doc2_type: doc2_type,
    doc2_value: data.doc2_value,
    location_id: locationId
  }
  const accountId = await knex.insert(partyAccountData).into('party_accounts').then(data => {
    return data[0];
  })
  return { locationId, accountId }
}


module.exports = router