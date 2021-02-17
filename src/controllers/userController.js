const jwt = require('jsonwebtoken');
const sharp = require('sharp');

const User = require('../models/userModel');
const PasswordReset = require('../models/passwordReset');
const { BadRequest, NotFound } = require('../utils/errorManagement');
const { checkInput, compareInputs } = require ('../utils/validateInputs');
const { sendEmailConfirmation, sendEmailRecovery } = require('../utils/sendEmail');

const _generateToken = (userId, expiration) => {
    return jwt.sign({ _id:userId.toString() }, process.env.JWT_TOKEN_RESET, expiration);
}


/** ========================================================
 *      > AUTH ROUTES
 *  ========================================================
 */
exports.registerUser = async(req, res, next) => {
    const allowedInputs = ['username', 'firstname', 'lastname', 'birthdate', 'email', 'password', 'confirmation'];
    try {
        checkInput(req.body, allowedInputs);
        compareInputs(req.body.password, req.body.confirmation);

        const user = new User(req.body);
        await user.save();

        const token = _generateToken(user._id, {});

        sendEmailConfirmation(user.email, token);

        return res.status(201).send({ user, token});
    } catch (error) {
        next(error)
    }
}

exports.loginUser = async(req, res, next) => {
    const allowedInputs = ['login', 'password'];
    try {
        checkInput(req.body, allowedInputs);

        const user = await User.findByCredentials(req.body.login, req.body.password);

        const token = await user.generateAuthToken();
        return res.status(200).send({ user, token });
    } catch (error) {
        next(error)
    }
}

exports.logoutUser = async(req, res, next) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        });
        await req.user.save();

        res.status(200).send();
    } catch (error) {
        next(error)
    }
}

exports.logoutAllUser = async(req, res, next) => {
    try {
        req.user.tokens = [];
        await req.user.save();

        res.status(200).send();
    } catch (error) {
        next(error)
    }
}



/** ========================================================
 *      > RECOVERY ROUTES
 *  ========================================================
 */
exports.askResetPassword = async(req, res, next) => {
    const allowedInputs = ['email'];
    try {
        checkInput(req.body, allowedInputs);

        const user = await User.findOne({ email: req.body.email });
        if(!user) throw new BadRequest('user not found')

        const token = _generateToken(user._id, {expiresIn: '5 minutes'})
        await PasswordReset.updateOne(
            { user: user._id }, 
            { user: user._id, token: token }, 
            { upsert: true }
        );

        // send email with token
        sendEmailRecovery(user.email, token);

        // tmp {remove token here}
        res.status(200).send(token);
    } catch (error) {
        next(error)
    }
}

exports.resetPassword = async(req, res, next) => {
    const allowedInputs = ['password', 'confirmation'];
    try {
        checkInput(req.body, allowedInputs);
        compareInputs(req.body.password, req.body.confirmation);

        const decoded = jwt.verify(req.params.token, process.env.JWT_TOKEN_RESET);

        const user = await User.findById(decoded._id);
        if(!user) throw new NotFound('User not found');

        const token = await PasswordReset.findOne({ token : req.params.token })
        if(!token) throw new NotFound('Token already used');
        await token.delete();

        allowedInputs.forEach((update) => user[update] = req.body[update]);
        user.tokens = [];
        await user.save();

        res.status(200).send(decoded);
    } catch (error) {
        next(error);
    }
}

exports.emailConfirmation = async(req, res, next) => {
    try {
        const decoded = jwt.verify(req.params.token, process.env.JWT_TOKEN_RESET);

        const user = await User.findById(decoded._id);
        if(!user) throw new NotFound('User not found');
        
        if(user.isActive) throw new BadRequest('Account already active');
        user.isActive = true;
        await user.save();

        const token = await user.generateAuthToken();
        res.status(200).send({ user, token});
    } catch (error) {
        next(error);
    }
}



/** ========================================================
 *      > USER ROUTES
 *  ========================================================
 */
exports.getUserProfil = async(req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        
        if(!user) {
            req.user = undefined;
            req.token = undefined;
            throw new NotFound();
        }

        return res.status(200).send(user);
    } catch (error) {
        next(error);
    }
}

exports.editUserProfil = async(req, res, next) => {
    const allowedInputs = ['username', 'firstname', 'lastname']
    try {
        checkInput(req.body, allowedInputs);

        const user = await User.findById(req.user._id);
        if(!user) throw new NotFound();

        allowedInputs.forEach((update) => user[update] = req.body[update]);
        await user.save();

        return res.status(200).send(user);
    } catch (error) {
        next(error)
    }
}

exports.editUserEmail = async(req, res, next) => {
    const allowedInputs = ['email']
    try {
        checkInput(req.body, allowedInputs);

        const user = await User.findById(req.user._id);
        if(!user) throw new NotFound();

        user.tmpEmail = req.body.email;
        await user.save();

        return res.status(200).send(user);
    } catch (error) {
        next(error)
    }
}

exports.editUserPassword = async(req, res, next) => {
    const allowedInputs = ['oldPassword', 'password', 'confirmation'];
    try {
        checkInput(req.body, allowedInputs);
        compareInputs(req.body.password, req.body.confirmation);

        const user = await User.findById(req.user._id);
        if(!user) throw new NotFound()

        allowedInputs.forEach((update) => user[update] = req.body[update]);
        await user.save()

        return res.status(200).send(user);
    } catch (error) {
        next(error)
    }
}

exports.deleteUser = async(req, res, next) => {
    try {
        const user = await User.findByIdAndDelete(req.user._id);
        if(!user) throw new NotFound();
        return res.status(200).send(user);
    } catch (error) {
        next(error)
    }
}



/** ========================================================
 *      > AVATAR ROUTES
 *  ========================================================
 */
exports.getAvatar = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if(!user) throw new NotFound();

        res.set('Content-Type', 'image/png');
        return res.status(200).send(user.avatar);
    } catch (error) {
        next(error);
    }
}

exports.getUserAvatar = async (req, res, next) => {
    try {
        res.set('Content-Type', 'image/png');
        return res.status(200).send(req.user.avatar);
    } catch (error) {
        next(error);
    }
}

exports.postAvatar = async (req, res, next) => {
    try {
        if(!req.file.buffer) throw new BadRequest();

        const userAvatar = await sharp(req.file.buffer)
            .resize({ width: 96, height: 96 })
            .png()
            .toBuffer();

        req.user.avatar = userAvatar;
        await req.user.save();

        res.status(201).send(req.user);
    } catch (error) {
        next(error);
    }
}, (error, req, res, next) => {
    next(error);
}

exports.deleteAvatar = async (req, res, next) => {
    try {
        req.user.avatar = undefined;
        await req.user.save();

        res.status(200).send(req.user);
    } catch (error) {
        next(error);
    }
}
