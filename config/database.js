const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const url = 'mongodb://localhost/finex'
module.exports = mongoose.connect(url, {useNewUrlParser: true})

mongoose.Error.messages.general.required = "Campo '{PATH}' é obrigatório"

