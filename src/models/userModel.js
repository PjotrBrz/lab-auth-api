const { Schema, model } = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const { BadRequest } = require('../utils/errorManagement');

const schema = Schema({
    username: {
        type: Schema.Types.String,
        required: true,
        unique: true,
        minlength: 5
    },
    firstname: {
        type: Schema.Types.String,
        required: true
    },
    lastname: {
        type: Schema.Types.String,
        required: true
    },
    birthdate: {
        type: Schema.Types.Date,
        required: true
    },
    description: {
        type: Schema.Types.String
    },
    avatar: {
        type: Schema.Types.Buffer
    },
    email: {
        type: Schema.Types.String,
        required: true,
        unique: true,
        trim: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    password: {
        type: Schema.Types.String,
        required: true
    },
    isActive: {
        type: Schema.Types.Boolean,
        required: true,
        default: false
    },
    tokens: [{
        token: {
            type: Schema.Types.String,
            required: true
        }
    }]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

schema.virtual('fullname').get(function() {
    return `${this.firstname} ${this.lastname}`;
});

// Password hash before saving
schema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 8);
    }
    next();
});

// Authentification method
schema.statics.findByCredentials = async (login, password) => {
    let user = undefined;
    if (validator.isEmail(login)) {
        user = await User.findOne({ email: login });
    } else {
        user = await User.findOne({ username: login });
    }
    if (!user) throw new BadRequest('Unable to login');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new BadRequest('Unable to login');

    const isActive = user.isActive;
    if(!isActive) throw new BadRequest('Account not active');

    return user;
};

// Token generation method
schema.methods.generateAuthToken = async function () {
    const user = this;
    token = jwt.sign({
        _id: user._id.toString()
    },
        process.env.JWT_TOKEN_AUTH,
        { expiresIn: '8 hours' }
    );
    user.tokens = user.tokens.concat({ token });
    await user.save();
    return token;
};

// Hide not needed information
schema.methods.toJSON = function () {
    const userObject = this.toObject();
    delete userObject.password;
    delete userObject.tokens;
    delete userObject.isActive;
    delete userObject.updatedAt;
    delete userObject.avatar;
    delete userObject.__v;
    delete userObject.id;
    return userObject;
};

const User = model('User', schema);

module.exports = User;
