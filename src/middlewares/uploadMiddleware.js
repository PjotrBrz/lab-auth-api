const multer = require('multer');
const { BadRequest } = require('./errorMiddleware');

const avatarUpload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Send an image'));
        } cb(undefined, true)
    }
}).single('avatar');

module.exports = {
    avatarUpload
}