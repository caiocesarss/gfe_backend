const knex = require('../../../config/dbpg');
const express = require('express')
const _ = require('lodash');
const router = express.Router();
const nodemailer = require("nodemailer");
const moment = require('moment');
const base64Logo = require('../../../utils/base64Logo')
new Intl
    .NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
    .format(500.00);

router.get('/', function (req, res) {
    res.send(processAR())
})

router.get('/:invoice_id', function (req, res) {
    res.send(processAR(req.params.invoice_id))
})

const processAR = async (invoiceId) => {
    let cubValue = await knex.raw('select amount from cubs ' +
        ' WHERE YEAR = YEAR(CURRENT_DATE()) AND ' +
        ' month = MONTH(CURRENT_DATE()) ').then(function (data) {
            return data[0]
        })
    cubValue = cubValue[0] ? cubValue[0].amount || 0 : 0;
    if (cubValue >=0) {
      return 0
    }

    let invoicesToProcess;
    if (invoiceId){
        invoicesToProcess = await knex.raw('SELECT invoice_id, cub_amount, reference_date, due_date ' +
        'FROM r_invoices ' +
        'WHERE invoice_id =  ' +invoiceId).then(function (data) {
            return data[0]
        })
    } else {

    invoicesToProcess = await knex.raw('SELECT invoice_id, cub_amount, reference_date, due_date ' +
        'FROM r_invoices ' +
        'WHERE YEAR(due_date) = YEAR(CURRENT_DATE()) AND ' +
        'MONTH(due_date) = MONTH(CURRENT_DATE()) ').then(function (data) {
            return data[0]
        })
    }
        
        invoicesToProcess.map(invoice=> {
        const calcAmount = invoice.cub_amount * cubValue;
        let referenceDate = new Date(invoice.reference_date);
        let dueDate = new Date(invoice.due_date);

        dueDate = moment(dueDate).format('DD/MM/YYYY');
        referenceDate = (moment(referenceDate).format('MMMM'))
        moment.locale('pt-BR');
        const cubAmount = invoice.cub_amount;
        const ret = knex('r_invoices').where('invoice_id', invoice.invoice_id).update('amount', calcAmount).then(data => {
            return data[0];
        })
        let textMessage = 'Bom dia<br /><br />';
        textMessage += `Segue a descrição da parcela referente ao mês de ${referenceDate}, com vencimento em ${dueDate}. <br /><br />`;
        textMessage += `Fatura num: ${invoice.invoice_id} <br /><br />`;
        textMessage += `Quantidade em CUB ${cubAmount} X Valor do CUB de ${cubValue}: = Valor total da parcela <b> R$: ${calcAmount.toFixed(2)} </b>.`;
        textMessage += '<br /><br /><br /><br />';
        textMessage += 'Atenciosamente<br /><br /><br />';
        textMessage += `<img src="${base64Logo}"`;
        textMessage += '<br /><br /><br />Francielle - Financeiro<br /><br />';
        textMessage += 'Fone: (47) 3241-5198<br />';
        textMessage += '<a href="mailto:financeiro@excellenceempreendimentos.com.br" target="_blank" rel="noopener noreferrer"><span style="color:#0563C1">financeiro@excellenceempreendimentos.com.br</a><br />';
        textMessage += 'Endereço: Rua 252 nº 425 – Sala 03 – Meia Praia – Itapema – SC<br />';
        textMessage += '<a href="excellenceempreendimentos.com.br" target="_blank">excellenceempreendimentos.com.br</a>';
    sendmail(textMessage);
    })

    

    return 1;
}


async function sendmail(messageText){
    //let transporter = nodemailer.createTransport(options[, defaults])
    let transporter = nodemailer.createTransport({
        //host: 'smtp.gmail.com',
        service: 'gmail',
        //port: 587,
        //secure: true,
        auth:{
        user: 'uecaio@gmail.com',
        pass: '*****$' }
        });

        const message = {
            from: 'uecaio@gmail.com',
            to: 'caiosiqueira@outlook.com',
            subject: 'teste parcela',
            html: messageText,
            };
  
    // create reusable transporter object using the default SMTP transport
    /*let transporter = nodemailer.createTransport({
        host: "smtp.mailtrap.io",
        port: 2525,
       // auth: {
        //  user: " 3027926cde3584",
        //  pass: "957f4a985c0bbe"
       // }
        auth: {
            user: "8484b8af461946",
            pass: "5cca59c0faa63e"
          }
    });
    */
  /*
    const message = {
        from: '"Fred Foo 👻" <foo@example.com>', // sender address
        to: "caiosiqueira@outlook.com, uecaio@gmail.com", // list of receivers
        subject: "POST hello", // Subject line
        text: "Hello world?", // plain text body
        html: messageText // html body
      };
      */
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
    
    
   
  }

module.exports = router