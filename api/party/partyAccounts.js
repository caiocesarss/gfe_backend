const knex = require('../../config/dbpg');
const express = require('express')
const router = express.Router()
const validCPF = require('cpf-check');
const _ = require('lodash');

/*
validador
Para CPF
/^\d{3}\.\d{3}\.\d{3}\-\d{2}$/
Para CNPJ
/^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$/
Para ambos ao mesmo tempo
/(^\d{3}\.\d{3}\.\d{3}\-\d{2}$)|(^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$)/
*/

router.get('/:party_id', function (req, res) {

  knex('party_accounts')
    .join('locations', 'party_accounts.location_id', 'locations.location_id')
    .join('cities', 'locations.city_id', 'cities.city_id')
    .join('ufs', 'cities.uf_id', 'ufs.uf_id')

    .select('party_accounts.*', 'cities.name as city_name', 'ufs.code as uf')
    .where({ party_id: req.params.party_id }).then(data => {
      res.send(data)
    })
})

router.get('/', function (req, res) {
  getPartyAccounts(req, res)

})

router.get('/getPartyAccountById/:account_id', function (req, res) {
  knex('party_accounts')
    .join('locations', 'party_accounts.location_id', 'locations.location_id')
    .join('cities', 'locations.city_id', 'cities.city_id')
    .where('party_accounts.party_account_id', req.params.account_id)
    .select().then(data => {
      res.send(data)
    })
})

router.get('/contactsListByAccount/:account_id', function (req, res) {
  knex('party_contacts').where('party_account_id', req.params.account_id).select().then(function (data) {
    res.send(data)
  })
})

router.get('/contactsListByParty/:party_id', function (req, res) {
  knex('party_contacts').where('party_id', req.params.party_id).select().then(function (data) {
    res.send(data)
  })
})

router.get('/getPartyContactById/:contact_id', function (req, res) {
  knex('party_contacts').where('contact_id', req.params.contact_id).select().then(function (data) {
    res.send(data[0])
  })
})

router.post('/contact', function (req, res) {
  const createdAt = new Date();
  let pushData = { ...req.body, created_at: createdAt }
  if (req.body.party_account_id == 'undefined'){
    pushData = _.omit(pushData, ['party_account_id']);
  }
  
  knex('party_contacts').insert(pushData).then(function (data) {
    res.send(data);
  })
})

router.put('/contact/', function (req, res) {
  const updatedAt = new Date();
  const pushData = {
    party_account_id: req.body.party_account_id,
    contact_type: req.body.contact_type,
    contact_value: req.body.contact_value,
    updated_at: updatedAt
  }
  const ret = knex('party_contacts').where('contact_id', req.body.contact_id).update(pushData).then(function (data) {
    return data[0]
  })

  res.send({data: ret})
})

router.post('/', async function (req, res) {
  const createdAt = new Date();
  const locData = {
    address_line: req.body.address_line,
    number: req.body_number,
    complement: req.body.complement,
    reference: req.body.reference,
    district: req.body.district,
    zip: req.body.zip,
    city_id: req.body.city_id,
    created_at: createdAt
  }
  const locationId = await knex.insert(locData).into('locations').then(function (data) {
    return data[0];
  })

  if (locationId) {
    const pushData = {
      legal_account_name: req.body.legal_account_name,
      doc1_type: req.body.doc1_type,
      doc1_value: req.body.doc1_value,
      doc2_type: req.body.doc2_type,
      doc2_value: req.body.doc2_value,
      doc3_type: req.body.doc3_type,
      doc3_value: req.body.doc3_value,
      doc4_type: req.body.doc4_type,
      doc4_value: req.body.doc4_value,
      account_alias_name: req.body.account_alias_name,
      created_at: createdAt,
      location_id: locationId,
      party_id: req.body.party_id
    };
    const ret = await knex.insert(pushData).into('party_accounts').then(function (data) {
      return data[0];
    })
    accountId = ret
  }
  res.send({ account_id: accountId })
})

router.put('/', async function (req, res) {
  const updatedAt = new Date();
  const pushData = {
    updated_at: updatedAt,
    legal_account_name: req.body.legal_account_name,
    doc1_type: req.body.doc1_type,
    doc1_value: req.body.doc1_value,
    doc2_type: req.body.doc2_type,
    doc2_value: req.body.doc2_value,
    doc3_type: req.body.doc3_type,
    doc3_value: req.body.doc3_value,
    doc4_type: req.body.doc4_type,
    doc4_value: req.body.doc4_value,
    account_alias_name: req.body.account_alias_name,
    updated_at: updatedAt
  };
  const ret = await knex('party_accounts').where({ party_account_id: req.body.party_account_id }).update(pushData).then(function (data) {
    return data
  })
  if (ret) {
    let locData = {
      address_line: req.body.address_line,
      number: req.body_number,
      complement: req.body.complement,
      reference: req.body.reference,
      district: req.body.district,
      zip: req.body.zip,
      city_id: req.body.city_id,
      updated_at: updatedAt
    }
    const ret = await knex('locations').where({ location_id: req.body.location_id }).update(locData).then(function (data) {
      return data
    })
  }
})

router.delete('/:party_id', function (req, res) {
  knex('party_accounts').where({ party_id: req.params.party_id }).del().then(function (data) {
    res.send(data);
  })
})

router.delete('/contact/:contact_id', async function (req, res) {
  const ret = await knex('party_contacts').where({ contact_id: req.params.contact_id }).del().then(function (data) {
    return data;
  })
  if (ret){
    res.sendStatus(200);
  } else {
  res.sendStatus(400)
  }
})

const getPartyAccounts = (req, res) => {
  knex.select().from('party_accounts').then(data => {
    res.send(data)
  })
}

module.exports = router