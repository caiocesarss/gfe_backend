const express = require('express');
const auth = require('./auth');

module.exports = function (server) {


    const mainApi = express.Router();
    server.use('/api', mainApi);
    //mainApi.use(auth);

    const Party = require('../api/party/party');
    mainApi.use('/party', Party);

    const PartyAccounts = require('../api/party/partyAccounts');
    mainApi.use('/partyAccounts', PartyAccounts);

    const Construction = require('../api/construction/construction');
    mainApi.use('/construction', Construction);

    /* USERS */
    const User = require('../api/users/users');
    mainApi.use('/users', User);
    /* END USERS */

    /* COMMONS */

    /* END COMMONS */

    /* FINANCIALS */
    const FinGroups = require('../api/financials/common/fingroups');
    mainApi.use('/common/finGroups', FinGroups);

    const DocumentTypes = require('../api/financials/common/documentTypes');
    mainApi.use('/common/documentTypes', DocumentTypes);

    const PayablesInvoice = require('../api/financials/payables/PInvoices');
    mainApi.use('/payables/invoice', PayablesInvoice);

    const ReceivablesInvoice = require('../api/financials/receivables/RInvoices');
    mainApi.use('/receivables/invoice', ReceivablesInvoice);

    const ReceivablesPayment= require('../api/financials/receivables/RPayments');
    mainApi.use('/receivables/payment', ReceivablesPayment);

    const ARProcess = require('../api/financials/receivables/ARprocess');
    mainApi.use('/receivables/arprocess', ARProcess);
    /* END FINANCIALS */

    /* SALES */
    const SalesOrders = require('../api/sales/salesOrders');
    mainApi.use('/salesorders', SalesOrders);
    /* END SALES */


    /* GENERAL */
    const Location = require('../api/general/location');
    mainApi.use('/location', Location);

    const City = require('../api/general/city');
    mainApi.use('/city', City);

    const Uf = require('../api/general/uf');
    mainApi.use('/uf', Uf);

    const selectList = require('../api/common/selectList');
    mainApi.use('/selectlist', selectList);
    /* END GENERAL */

    /* SETTINGS */
    const cub = require('../api/settings/cub');
    mainApi.use('/settings/cub', cub);
    /* END SETTINGS */

    /* SEND MAIL */
    const SendMail = require('../functions/sendmail')
    mainApi.use('/sendmail', SendMail);

    const openApi = express.Router()
    server.use('/oapi', openApi)

    const AuthService = require('../api/users/authService')
    openApi.post('/login', AuthService.login)
    openApi.post('/validateToken', AuthService.validateToken)

}

