const Obra = require ('./obra')
const errorHandler = require ('../common/errorHandler');

Obra.methods(['get', 'post', 'put', 'delete']);
Obra.updateOptions({new: true, runValidators: true});
Obra.after('post', errorHandler).after('put', errorHandler);

Obra.route('count', (req, res, next) => {
    Obra.count((error, value) => {
        if (error) {
            res,status(500).json({errors: [error]})
        } else {
            res.json({value})
        }
    })
})

module.exports = Obra