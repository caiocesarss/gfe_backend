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


const knex = require('knex')({
  client: 'pg',
  connection: {
    host : 'raja.db.elephantsql.com',
    user : 'qbvfhnbk',
    password : '35Fe6Cep10efWcfdehnqnh3xZeC-fGcg',
    database : 'qbvfhnbk'
  }
});

/*
const knex = require('knex')({
  client: 'mysql',
  connection: {
    host : 'localhost',
    user : 'root',
    password : 'mysql123',
    database : 'finex'
  }
});
*/
/*
const knex = require('knex')({
  client: 'mysql',
  connection: {
    host : 'umabrisfx8afs3ja.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
    user : 'q9vsrnrzzxzrox86',
    password : 'lfvixbf69h4rn3z5',
    database : 'xcxwqmgkv2fhtcdl'
  }
});
*/

module.exports = knex