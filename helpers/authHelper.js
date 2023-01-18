const jwt = require('jsonwebtoken');
const dbConfig = require('../config/secret');

module.exports = {
    VerifyToken: (req, res, next) => {
        if(!req.headers.authorization){
            return res.status(401).json({message: 'No Athorization'});
        }
        const token = req.cookies.auth || req.headers.authorization.split(' ')[1];
        // console.log(token);

        if(!token) {
            return res.status(403).json({message: 'No token provided'});
        }
        return jwt.verify(token, dbConfig.secret, (err, decoded) => {
            if(err) {
                if(err.expiredAt < new Date()) {
                    return res.status(500).json({
                        message: 'Token has expired. Please login again',
                        token: null
                    });
                }
                next();
            }
            req.user = decoded.data;
            next();
        })
    }
};