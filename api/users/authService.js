const _ = require('lodash');
const knex = require('../../config/dbpg');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const env = require('../../config/.env');

const sendErrorsFromDB = (res, dbErrors) => {
    const errors = [];
    _.forIn(dbErrors.errors, error => errors.push(error.message));
    return res.status(400).json({ errors });
};

const login = async (req, res, next) => {

    const username = req.body.username || "";
    const password = req.body.password || "";


    const user = await knex('users').where('username', username).select().then(data => {
        return data[0]
    })

    if (user && bcrypt.compareSync(password, user.password)) {
        const token = jwt.sign({ ...user }, env.authSecret, {
            expiresIn: "1 day"
        });
        const { name, username } = user;
        res.json({ name, username, token });
    } else {
        return res.status(400).send({ errors: ["Usuário/Senha inválidos"] });
    }
}

const validateToken = (req, res, next) => {
    const token = req.body.token || "";
    jwt.verify(token, env.authSecret, function (err, decoded) {
        return res.status(200).send({ valid: !err });
    });
};


  
  module.exports = {login, validateToken}