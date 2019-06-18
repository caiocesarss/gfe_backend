const Cliente = require ('./cliente')
const errorHandler = require ('../common/errorHandler');

Cliente.methods(['get', 'post', 'put', 'delete']);
Cliente.updateOptions({new: true, runValidators: true});
Cliente.after('post', errorHandler).after('put', errorHandler);

Cliente.route('count', (req, res, next) => {
    Cliente.count((error, value) => {
        if (error) {
            res,status(500).json({errors: [error]})
        } else {
            res.json({value})
        }
    })
})

module.exports = Cliente