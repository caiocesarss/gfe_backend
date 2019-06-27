const port = 5000

const bodyParser = require ('body-parser');
const express = require ('express');
const server = express();
const allowCors = require('./cors');


server.use(bodyParser.urlencoded({extended: true}));
server.use(bodyParser.json());
server.use(allowCors);
//server.use(queryParser);

server.listen(process.env.PORT || port, function(){
    console.log(`### BACKEND IS RUNNING ON PORT ${port}`)
})

module.exports = server;