const nodemailer = require("nodemailer");


const express = require('express')
const router = express.Router()


router.post('/', async function(req, res){
    try{
    let result = await sendmail()//.catch(console.error);
  console.log(result);

  if (result === 'OK'){
        res.send('tentativa ok')
  } else {
      res.status(400).send(result.error)
  }
} catch (e) {
    console.log(e)
    next(e)
}
})


async function sendmail(message){
  
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: "smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: " 3027926cde3584",
          pass: "957f4a985c0bbe"
        }
    });
  
    const message = {
        from: '"Fred Foo 👻" <foo@example.com>', // sender address
        to: "caiosiqueira@outlook.com, uecaio@gmail.com", // list of receivers
        subject: "POST hello", // Subject line
        text: "Hello world?", // plain text body
        html: "<b>message: "+message+"</b>" // html body
      };
      
    let info = await transporter.sendMail(message, (error, info) => {
        if(error){
            return error;
        } else {
            return 'OK';
        }
        //console.log("Message sent: %s", info.messageId);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
      
        // Preview only available when sending through an Ethereal account
        //console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
        
    });
    
   
  }

  //  sendmail().catch(console.error);

  module.exports = router;
  
