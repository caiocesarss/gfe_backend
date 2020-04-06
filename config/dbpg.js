/*
const knex = require('knex')({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    user : 'postgres',
    password : 'pg123',
    database : 'finex'
  }
});
*/


/*
const knex = require('knex')({
  client: 'pg',
  connection: {
    host : 'raja.db.elephantsql.com',
    user : 'qbvfhnbk',
    password : '35Fe6Cep10efWcfdehnqnh3xZeC-fGcg',
    database : 'qbvfhnbk'
  }
});
*/
//senha db aws master3368

const knex = require('knex')({
  client: 'mysql',
  connection: {
    host : 'localhost',
    user : 'root',
    password : 'mysql123',
    database : 'finex'
  }
});

/*
const knex = require('knex')({
  client: 'mysql',
  connection: {
    host : 'k2pdcy98kpcsweia.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
    user : 'i9pq6f44vivjm0lw',
    password : 'r5b5jz3pbtrwwkkv',
    database : 'j1cj4aj0z99qvcyr'
  }
});
*/

module.exports = knex