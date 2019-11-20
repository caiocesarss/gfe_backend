const knex = require('../../config/dbpg');
const express = require('express')
const _ = require('lodash');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const emailRegex = /\S+@\S+\.\S+/;



router.get('/', function (req, res) {
    knex.select().from('users').then(data => {
        res.send(data)
    })
})

router.get('/:user_id', async function (req, res) {
    let ret = await knex.select().from('users').where({ user_id: req.params.user_id }).then(data => {
        return data;
    })
    ret = _.omit(ret[0], ['password']);
    res.send(ret);
})

router.put('/', function(req,res){
    const updatedAt  = new Date();
    let pushData = {...req.body, updated_at: updatedAt};
    pushData = _.omit(pushData, ['created_at']);
    
    const salt = bcrypt.genSaltSync();
    const passwordHash = bcrypt.hashSync(pushData.password, salt);
    if (!bcrypt.compareSync(pushData.confirm_password, passwordHash)) {
        return res.status(400).send({ errors: ["Senhas não conferem."] });
    }
    pushData = _.omit(pushData, ['confirm_password']);
    pushData = {...pushData, password: passwordHash}
    knex('users').where({user_id: req.body.user_id}).update(pushData).then(data => {
      res.send(data[0])
    })
  })

router.post('/', async function (req, res) {
    const createdAt = new Date();
    let pushData = { ...req.body, created_at: createdAt };
    if (!req.body.email.match(emailRegex)) {
        return res.status(400).send({ errors: ["O e-mail informado está inválido"] });
    }
    const salt = bcrypt.genSaltSync();
    const passwordHash = bcrypt.hashSync(pushData.password, salt);
    if (!bcrypt.compareSync(pushData.confirm_password, passwordHash)) {
        return res.status(400).send({ errors: ["Senhas não conferem."] });
    }
   // if (!bcrypt.compareSync(pushData.confirm_password, passwordHash)) {
   //     return res.status(400).send({ errors: ["Senhas não conferem."] });
  //  }
    const user = await knex('users').where('username', pushData.username).select().then(data => {
        return data[0]
    })

    if (user) {
        return res.status(400).send({ errors: ["Usuário já cadastrado."] });
    } else {
        pushData = _.omit(pushData, ['confirm_password']);
        pushData = {...pushData, password: passwordHash}
        knex.insert(pushData).into('users').then(data => {
            res.send(data)
        })

    }

})

router.delete('/:user_id', async function(req, res){
    const ret = knex('users').where({user_id: req.params.user_id}).del().then(data => {
        return (data);
    })
    res.send(200)
})

module.exports = router