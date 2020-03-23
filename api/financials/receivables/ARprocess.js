const knex = require('../../../config/dbpg');
const express = require('express')
const _ = require('lodash');
const router = express.Router();
const nodemailer = require("nodemailer");
const moment = require('moment');

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
    cubValue = cubValue[0].amount;
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
        textMessage += '<img src="data:image/png;base64,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"';
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