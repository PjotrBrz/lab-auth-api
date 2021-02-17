const jwt = require('jsonwebtoken');

const User = require('../models/userModel');
const { NotFound } = require('../utils/errorManagement');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_TOKEN_AUTH);

        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token });
        if (!user) throw new NotFound();

        req.token = token;
        req.user = user;

        next();
    } catch (error) {
        return res.status(500).json({
            "status": "error",
            "message": "Authentifiction failed!"
        });
    }
}

module.exports = auth;
