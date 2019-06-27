const knex = require('../../config/dbpg');
const express = require('express')
const router = express.Router()
const CircularJSON = require('circular-json')

router.get('/', function(req, res){
    //knex.select().from('sales_orders').then(data=>{
    //    res.send(data)
    //  })
    knex.raw('select  '+
    'so.order_id '+
    ', so.ordered_date '+
    ', so.amount '+
    ', so.room_number '+
    ', so.cub_amount '+
    ', so.cub_ex_rate '+
    ', string_agg(p.name, \',\') party '+
    ', c.name construction_name '+
    'from sales_orders so '+
    ', sales_order_details sod '+
    ', parties p '+
    ', party_accounts pa '+
    ', constructions c '+
    'where so.order_id = sod.order_id '+
    'and sod.party_id = p.party_id '+
    'and p.party_id = pa.party_id '+
    'and so.construction_id = c.construction_id '+
    'group by so.order_id '+
    ', so.amount '+
    ', so.cub_amount '+
    ', so.room_number '+
    ', so.cub_ex_rate '+
    ', c.name '+
    ', so.ordered_date').then(data => {
      res.send(data.rows);
    });
})

router.get('/details/:order_id', function(req, res){
knex.raw('select  '+
'so.order_id '+
', so.ordered_date '+
', so.room_number '+
', so.details order_details '+
', so.payment_details '+
', so.amount '+
', so.cub_amount '+
', so.cub_ex_rate '+
', sod.party_amount '+
', sod.detail_id '+
', sod.cub_amount '+
', sod.entry_amount '+
', sod.entry_cub_amount '+
', sod.further_total_amount '+
', sod.further_cub_amount '+
', sod.amount_remaining '+
', sod.months_qt '+
', sod.monthly_amount '+
', sod.monthly_cub_amount '+
', sod.monthly_qt_parcel '+
', sod.monthly_parcel_amount '+
', sod.monthly_due_days '+
', sod.monthly_parcel_cub_amount '+
', pa.legal_account_name '+
', pa.doc1_type '+
', pa.doc1_value '+
', pa.doc2_type '+
', pa.doc2_value '+
', pa.account_alias_name '+
', cit.name city_name '+
', ufs.code uf '+
', c.name construction_name '+
'from sales_orders so '+
', sales_order_details sod '+
', parties p '+
', party_accounts pa '+
', constructions c '+
', locations l '+
', cities cit '+
', ufs  '+
'where so.order_id = sod.order_id '+
'and sod.party_id = p.party_id '+
'and p.party_id = pa.party_id '+
'and so.construction_id = c.construction_id '+
'and pa.location_id = l.location_id '+
'and l.city_id = cit.city_id '+
'and cit.uf_id = ufs.uf_id '+
'and so.order_id = ? ', [req.params.order_id]).then(data => {
  res.send(data.rows);
});
})

router.post('/', function(req, res){
  const createdAt  = new Date();
  const pushData = {...req.body, created_at: createdAt};
  knex.insert(pushData).returning('*').into('sales_orders').then(function(data){
    res.send(data)
  })
})



router.put('/:order_id', function(req,res){
  const updatedAt  = new Date();
  const pushData = {...req.body, updated_at: updatedAt};
  knex('sales_orders').where({order_id: req.params.order_id}).update(pushData).returning('*').then(function(data){
    res.send(data)
  })
})

router.delete('/:order_id', function(req, res){
  knex('sales_orders').where({order_id: req.params.order_id}).del().returning('*').then(function(data){
    res.send(data);
  })
})

router.post('/adddetail', function(req, res){
  const str = CircularJSON.stringify(req);
  let rowsInserted = 0;

  const orderId = req.body.order_id;
  const saleDetails = req.body.accounts;
  saleDetails.map(detail => {
    
    const inData = {...detail, order_id: orderId}
    
    knex.insert(inData).returning('*').into('sales_order_details').then(function(data){
      rowsInserted += 1;
    })
  })
  setAr(orderId);
  res.status(200).send(orderId)
})

router.post('/setar', function(req, res){
  const retd = setAr(68, res);
 
})

const setAr = (orderId, res) => {
  knex.raw('select  '+
'so.order_id '+
', so.ordered_date '+
', so.room_number '+
', so.details order_details '+
', so.payment_details '+
', so.amount '+
', so.cub_amount '+
', so.cub_ex_rate '+
', sod.party_amount '+
', sod.detail_id '+
', sod.cub_amount '+
', sod.entry_amount '+
', sod.entry_cub_amount '+
', sod.further_total_amount '+
', sod.further_cub_amount '+
', sod.amount_remaining '+
', sod.months_qt '+
', sod.monthly_amount '+
', sod.monthly_cub_amount '+
', sod.monthly_qt_parcel '+
', sod.monthly_parcel_amount '+
', sod.monthly_due_days '+
', sod.monthly_parcel_cub_amount '+
', pa.legal_account_name '+
', pa.doc1_type '+
', pa.doc1_value '+
', pa.doc2_type '+
', pa.doc2_value '+
', pa.account_alias_name '+
', cit.name city_name '+
', ufs.code uf '+
', c.name construction_name '+
'from sales_orders so '+
', sales_order_details sod '+
', parties p '+
', party_accounts pa '+
', constructions c '+
', locations l '+
', cities cit '+
', ufs  '+
'where so.order_id = sod.order_id '+
'and sod.party_id = p.party_id '+
'and p.party_id = pa.party_id '+
'and so.construction_id = c.construction_id '+
'and pa.location_id = l.location_id '+
'and l.city_id = cit.city_id '+
'and cit.uf_id = ufs.uf_id '+
'and so.order_id = ? ', [orderId]).then(data => {
  setArData(data.rows);
  res.send('ui')
});
}

const setArData = (data) => {
  data.map(item => {
    console.log(item)
  })
  
}

module.exports = router