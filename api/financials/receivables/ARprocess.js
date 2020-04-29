const knex = require('../../../config/dbpg');
const express = require('express')
const _ = require('lodash');
const router = express.Router();
const nodemailer = require('nodemailer');
const ses  = require('node-ses');
const client = ses.createClient({key: 'AKIAJ6TIR4JI5KG22N6Q', secret: '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'});
const sendmail = require('sendmail')({
    logger: {
      debug: console.log,
      info: console.info,
      warn: console.warn,
      error: console.error
    },
      silent: true
  })
const moment = require('moment');
require ('moment/locale/pt-br');

const base64Logo = require('../../../utils/base64Logo')


router.get('/', async function (req, res) {
    const retorno = await processAR();
    res.send({status: 200, data: retorno})
})

router.get('/:invoice_id', async function (req, res) {
    const retorno = await processAR(req.params.invoice_id);
    res.send({status:200, data: retorno})
})

const processAR = async (invoiceId) => {
    
    let cubValue = await knex.raw('select amount from cubs ' +
        ' WHERE YEAR = YEAR(CURRENT_DATE()) AND ' +
        ' month = MONTH(CURRENT_DATE()) ')
        //.on('query', function(data) {console.log(data);})
        .then(function (data) {
            return data[0]
        })
        
    cubValue = !_.isEmpty(cubValue) ? parseFloat(cubValue[0].amount) : 0;

    if (cubValue <=0) {
      return 0
    }
 
    let invoicesToProcess = Array();
    invoicesToProcess.length = 0;

    if (!isNaN(invoiceId)){
        invoicesToProcess = await knex.raw('SELECT * ' +
        'FROM r_invoices r' +
        ' WHERE r.invoice_id =  ' +invoiceId
        +' AND case when (select sum(amount) from rec_payments where invoice_id =  r.invoice_id) >= amount then 1 else 0 end = 0 '
        )
        //.on('query', function(data) {console.log(data);})
        .then(function (data) {
            return data[0]
        })
    } else {
        invoicesToProcess = await knex.raw('SELECT * ' +
        'FROM r_invoices r' +
        ' WHERE YEAR(r.due_date) = YEAR(CURRENT_DATE()) ' +
        ' AND case when (select sum(amount) from rec_payments where invoice_id =  r.invoice_id) >= amount then 1 else 0 end = 0 ' +
        ' AND MONTH(r.due_date) = MONTH(CURRENT_DATE()) ').then(function (data) {
            return data[0];
        })
    }
    retArray = new Array();
    invoicesToProcess.map(invoice=> {
    const calcAmount = invoice.cub_amount * cubValue;
    let referenceDate = new Date(invoice.reference_date);
    let dueDate = new Date(invoice.due_date);
    
    dueDate = moment(dueDate).format('DD/MM/YYYY');
    referenceDate = (moment(referenceDate).format('MMMM'))
    moment.locale('pt-br');
    const cubAmount = invoice.cub_amount;
    const ret = knex('r_invoices').where('invoice_id', invoice.invoice_id).update('amount', calcAmount).then(data => {
        return data[0];
    });
    
    
    let textMessage = 'Bom dia<br /><br />';
    textMessage += `Segue a descrição da parcela referente ao mês de <b>${referenceDate}</b>, com vencimento em ${dueDate}. <br /><br />`;
    textMessage += `<div style="font-family: Courier New">T&iacute;tulo n&deg;: ${invoice.invoice_id} <br /><br />`;
    textMessage += `Quantidade em CUB (A): ${formatNumero(cubAmount, 4)}<br />`;
    textMessage += `Valor do CUB (B): ${formatMoney(cubValue)}<br />`;
    textMessage += `Valor total da parcela (A * B): <b> R$ ${formatMoney(calcAmount)} </b></div>`;
    textMessage += '<br /><br /><br /><br />';
    textMessage += 'Atenciosamente<br /><br /><br />';
    textMessage += `<img src="${base64Logo}"`;
    textMessage += '<br /><br /><br />Francielle - Financeiro<br /><br />';
    textMessage += 'Fone: (47) 3241-5198<br />';
    textMessage += '<a href="mailto:financeiro@excellenceempreendimentos.com.br" target="_blank" rel="noopener noreferrer"><span style="color:#0563C1">financeiro@excellenceempreendimentos.com.br</a><br />';
    textMessage += 'Endereço: Rua 252 nº 425 – Sala 03 – Meia Praia – Itapema – SC<br />';
    textMessage += '<a href="excellenceempreendimentos.com.br" target="_blank">excellenceempreendimentos.com.br</a>';

    /*console.log('fatura: '+invoice.invoice_id);
    console.log('valor cub do mes: '+cubValue);
    console.log('valor da parcela em cub: '+cubAmount);
    console.log('valor ref: '+formatMoney(invoice.invoice_id));
    console.log('valor calculado: '+formatMoney(calcAmount));
    console.log('===============');
    console.log('');*/
    
    //sendAuthMail(textMessage, 'fatura: '+invoice.invoice_id);
    retArray.push({ mes: referenceDate,
                    referenceDate: invoice.reference_date,
                    vencimento: dueDate,
                    invoice_id:invoice.invoice_id, 
                    referenceAmount: formatMoney(invoice.reference_amount),
                    cubAmount: formatNumero(cubAmount, 4),
                    cubValue: formatMoney(cubValue),
                    amount: formatMoney(calcAmount),
                    parcelNo: invoice.parcel_no,
                    parcelQt: invoice.parcel_qt
                })
    })

   
    return retArray;
   // return 1;
}

function formatMoney(n, c, d, t){ 
    //return  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
    //return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    c = isNaN(c = Math.abs(c)) ? 2 : c, d = d == undefined ? "," : d, t = t == undefined ? "." : t, s = n < 0 ? "-" : "", i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "", j = (j = i.length) > 3 ? j % 3 : 0;
    return 'R$ '+s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
      
}

function formatNumero(n, c, d, t){
    //return  new Intl.NumberFormat('pt-BR', { style: 'decimal' }).format(n);
    c = isNaN(c = Math.abs(c)) ? 2 : c, d = d == undefined ? "," : d, t = t == undefined ? "." : t, s = n < 0 ? "-" : "", i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "", j = (j = i.length) > 3 ? j % 3 : 0;
    return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");

}

async function sendAuthMail(messageText, messageTitle){

    client.sendEmail({
        to: 'caio.siqueira@outlook.com',
        from: 'teste@excellenceempreendimentos.com.br',
        subject: 'teste aws ses',
        message: '<h1>Título</h1><p>mensagem</p>'
    }, function(err, data, res){

    })

    return 'OK';
    /*
    //let transporter = nodemailer.createTransport(options[, defaults])
    let transporter = nodemailer.createTransport({
        //host: 'smtp.gmail.com',
        service: 'gmail',
        //port: 587,
        //secure: true,
        auth:{
        user: 'uecaio@gmail.com',
        pass: 'Stein353#$' }
        });

        const message = {
            from: 'uecaio@gmail.com',
            to: 'caiosiqueira@outlook.com',
            subject: 'teste parcela',
            html: messageText,
            };
  

     
    let ret = await transporter.sendMail(message, (error, info) => {
        console.log('start sending...')
        if(error){
            console.log(error)
            return error;
        } else {
            console.log('sent')
            return 'OK';
        }
        //console.log("Message sent: %s", info.messageId);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
      
        // Preview only available when sending through an Ethereal account
        //console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
        
    });
    */
    
   
  }

module.exports = router