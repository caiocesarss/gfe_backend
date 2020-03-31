const jwt = require('jsonwebtoken')
const env = require('../config/.env')
const knex = require('../config/dbpg')

const createLog = async ({ token: auth, description }) => {
  const token = jwt.verify(auth, env.authSecret)
  if (!token) throw Error('User Unauthenticated')

  const data = {
    user_id: token.user_id,
    user_name: token.username,
    sigin_date: knex.fn.now(),
    description
  }

  await knex('user_logs').insert(data)
}

module.exports = createLog
