const { verifyJWTToken } = require('../token/tokenTools');
require('dotenv').config();

async function isAuth(req, res, next) {
    const token = req.headers.authorization;
    
    try {
        const decoded = await verifyJWTToken(token, process.env.SECRET);
        next();
    } catch (err) {
        res.status(401).json({ message: "Invalid token" });
    }
}

module.exports = isAuth;

