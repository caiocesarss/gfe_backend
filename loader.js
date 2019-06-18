const server = require ('./config/server')
//require('./config/database')
require('./config/dbpg')
require('./config/routes')(server)
