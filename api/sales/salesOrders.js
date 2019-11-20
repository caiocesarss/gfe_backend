const knex = require('../../config/dbpg');
const express = require('express')
const router = express.Router()
const CircularJSON = require('circular-json');
const { generateAR } = require('./ARProcess');

router.get('/', function (req, res) {
  //knex.select().from('sales_orders').then(data=>{
  //    res.send(data)
  //  })
  knex.raw('select * from sales_orders_v').then(data => {
    res.send(data[0]);
  });
})

router.get('/details/:order_id', function (req, res) {
  const orderId = req.params.order_id;
  knex.raw('select * from sales_orders_det_v where order_id = ? ', [orderId])
    .then(data => {
      res.send(data[0]);
    });
})

router.get('/salenext/:order_id', function (req, res) {
  const orderId = req.params.order_id;
  knex.select(
    ' sales_orders.order_id '
    , ' sales_orders.room_number '
    , ' sales_orders.amount '
    , ' sales_orders.cub_ex_rate '
    , ' sales_orders.cub_amount '
    , ' constructions.name as construction_name '
  ).from('sales_orders').join('constructions', 'sales_orders.construction_id', 'constructions.construction_id')
    .where('sales_orders.order_id', req.params.order_id).then(data => {
      res.send(data[0]);
    })
})

router.get('/detail/furthers/:detail_id', function (req, res) {
  const detailId = req.params.detail_id;
  knex('sales_detail_furthers').where('sale_detail_id', detailId).then(data => {
    res.send(data);
  })
  /*knex.raw('select * from sales_orders_det_v where order_id = ? ', [detailId])
  .then(data => {
    res.send(data[0]);
  });
  */
})

router.post('/', function (req, res) {
  const createdAt = new Date();
  const pushData = { ...req.body, created_at: createdAt };
  knex.insert(pushData).into('sales_orders').then(function (data) {
    res.send(data)
  })
})



router.put('/:order_id', function (req, res) {
  const updatedAt = new Date();
  const pushData = { ...req.body, updated_at: updatedAt };
  knex('sales_orders').where({ order_id: req.params.order_id }).update(pushData).then(function (data) {
    res.send(data)
  })
})

router.delete('/:order_id', function (req, res) {
  knex('sales_orders').where({ order_id: req.params.order_id }).del().then(function (data) {
    res.send(data);
  })
})

router.post('/adddetail', function (req, res) {
  const orderId = req.body.order_id;
  const saleDetails = req.body.accounts;
  let arRet = [];
  saleDetails.map(async detail => {
    const inData = { ...detail, order_id: orderId }
    const intof = detail;
    delete (inData.furthers);
    const detailId = await setOrderDetail(inData);
    if (intof.furthers) {
      intof.furthers.map(fdet => {
        const addtof = { ...fdet, sale_detail_id: detailId }
        knex.insert(addtof).into('sales_detail_furthers').then(function (data) {
        })
      })
    }
    arRet = await generateAR(detailId);
  })
  res.status(200).send(orderId)
})

async function setOrderDetail(inData) {
  const ret = await knex.insert(inData).into('sales_order_details').then(function (data) {
    return data[0];
  })
  return ret;
}

router.post('/setar', function (req, res) {
  const retd = setAr(68, res);

})

const setAr = (orderId, res) => {
  knex.raw('select  ' +
    'so.order_id ' +
    ', so.ordered_date ' +
    ', so.room_number ' +
    ', so.details order_details ' +
    ', so.payment_details ' +
    ', so.amount ' +
    ', so.cub_amount ' +
    ', so.cub_ex_rate ' +
    ', sod.party_amount ' +
    ', sod.detail_id ' +
    ', sod.cub_amount ' +
    ', sod.entry_amount ' +
    ', sod.entry_cub_amount ' +
    ', sod.further_total_amount ' +
    ', sod.further_cub_amount ' +
    ', sod.amount_remaining ' +
    ', sod.months_qt ' +
    ', sod.monthly_amount ' +
    ', sod.monthly_cub_amount ' +
    ', sod.monthly_qt_parcel ' +
    ', sod.monthly_parcel_amount ' +
    ', sod.monthly_due_days ' +
    ', sod.first_due_month ' +
    ', sod.monthly_parcel_cub_amount ' +
    ', pa.legal_account_name ' +
    ', pa.doc1_type ' +
    ', pa.doc1_value ' +
    ', pa.doc2_type ' +
    ', pa.doc2_value ' +
    ', pa.account_alias_name ' +
    ', cit.name city_name ' +
    ', ufs.code uf ' +
    ', c.name construction_name ' +
    'from sales_orders so ' +
    ', sales_order_details sod ' +
    ', parties p ' +
    ', party_accounts pa ' +
    ', constructions c ' +
    ', locations l ' +
    ', cities cit ' +
    ', ufs  ' +
    'where so.order_id = sod.order_id ' +
    'and sod.party_id = p.party_id ' +
    'and p.party_id = pa.party_id ' +
    'and so.construction_id = c.construction_id ' +
    'and pa.location_id = l.location_id ' +
    'and l.city_id = cit.city_id ' +
    'and cit.uf_id = ufs.uf_id ' +
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

router.get('/generateAR', async function (req, res){
  const ret = await generateAR(req.query.detail_id);
  res.send(ret)
})

module.exports = router