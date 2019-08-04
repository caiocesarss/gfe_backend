const knex = require('../../config/dbpg');
const CircularJSON = require('circular-json');

async function generateAR(orderDetailID) {
    const result = await knex('sales_order_details').where('detail_id', orderDetailID).select().then(data => {
        return data;
    })
  
    const order = await knex('sales_orders').where('order_id', result[0].order_id).select().then(data => {
        return data;
    }) 

    if (!result) {
        return false;
    }
    const orderDetail = result[0];
    const createdAt = new Date();
    let qtInserted = 0;
    for (i = 1; i <= orderDetail.months_qt; i++) {
        let dueDate = new Date(order[0].ordered_date);
        
        dueDate.setDate(orderDetail.monthly_due_days);
        dueDate = new Date(dueDate.setMonth(dueDate.getMonth() + i));
        const invoiceDate = new Date();
        let referenceDate = new Date();
        referenceDate.setDate('1');
        referenceDate = new Date(referenceDate.setMonth(referenceDate.getMonth() + i));

        const pushData = {
            invoice_type: 'MENSALIDADE',
            sales_detail_id: orderDetail.detail_id,
            sales_order_id: orderDetail.order_id,
            cub_amount: orderDetail.monthly_cub_amount,
            party_id: orderDetail.party_id,
            party_account_id: orderDetail.party_account_id,
            reference_amount: orderDetail.monthly_amount,
            invoice_date: invoiceDate,
            reference_date: referenceDate,
            due_date: dueDate,
            parcel_no: i,
            parcel_qt: orderDetail.months_qt,
            invoice_status: 'REGISTRADO',
            payment_status: 'ABERTO',
            document_type: 'FATURA',
            created_at: createdAt,
        }
        const result = await knex('r_invoices').insert(pushData).then(data => {
            return data[0];
        })
        if (result > 0) {
            qtInserted++;
        }

    }

    const qtFurthers = await generateARFurthers(orderDetail, order[0].ordered_date);

    return {qt_invoices: qtInserted, qt_furthers: qtFurthers};
}

async function generateARFurthers(orderDetail, orderedDate) {
    let qtInserted = 0;


    const result = await knex('sales_detail_furthers').where('sale_detail_id', orderDetail.detail_id).select().then(data => {
        return data;
    })
    if (!result) {
        return false;
    }

    const furtherDetail = result[0];
    const qtFurthers = Math.ceil(orderDetail.months_qt / 12);
    const createdAt = new Date();
    for (i = 1; i <= qtFurthers; i++) {
        const invoiceDate = new Date();
        let dueDate = new Date(orderedDate);
        dueDate.setMonth(furtherDetail.due_month-1, furtherDetail.due_day);
        dueDate = new Date(dueDate.setYear(dueDate.getFullYear() + i));

        const pushData = {
            invoice_type: 'REFORÇO',
            sales_detail_id: orderDetail.detail_id,
            sales_order_id: orderDetail.order_id,
            cub_amount: furtherDetail.further_cub_amount,
            party_id: orderDetail.party_id,
            party_account_id: orderDetail.party_account_id,
            invoice_date: invoiceDate,
            reference_date: dueDate,
            due_date: dueDate,
            reference_amount: furtherDetail.further_amount,
            parcel_no: i,
            parcel_qt: qtFurthers,
            invoice_status: 'REGISTRADO',
            payment_status:'ABERTO',
            document_type: 'FATURA',
            created_at: createdAt,
        }

        const result = await knex('r_invoices').insert(pushData).then(data => {
            return data[0];
        })
        if (result > 0) {
            qtInserted++;
        }
    }
    return qtInserted;
}

module.exports = { generateAR }