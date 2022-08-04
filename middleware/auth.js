const jwt = require('jsonwebtoken')
require('dotenv').config()
const {SECRET} = process.env

module.exports = (req, res, next) => {
    // Grab token from header
    const token = req.header('x-auth-token');

    if(!token) return res.status(401).json({
        statusCode: 401,
        message: "No token, auth denied"
    });

    try{
        const decoded = jwt.verify(token, SECRET)

        // Assign User to req obj
        req.user = decoded.user;
        next()
    } catch (err){
        res.status(401).json({
            statusCode: 401,
            message: "Token is not valid"
    })
    }
}