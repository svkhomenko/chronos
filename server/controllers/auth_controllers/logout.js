const { destroyJWTToken } = require('../../token/tokenTools');
const { sendError } = require('../tools/sendError');

async function logout(req, res) {
    const token = req.headers.authorization;
    
    try {
        await destroyJWTToken(token);
        
        res.status(200).send();
    }
    catch(err) {
        sendError(err, res);
    }    
}

module.exports = logout;

