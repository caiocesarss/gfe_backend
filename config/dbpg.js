const knex = require('knex')({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    user : 'postgres',
    password : 'pg123',
    database : 'finex'
  }
});

module.exports = knex