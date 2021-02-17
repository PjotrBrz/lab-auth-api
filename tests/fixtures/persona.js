const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

exports.persona1 = {
    username: "eloMich",
    firstname: "Eloïse",
    lastname: "Michaud",
    birthdate: "1997-05-13",
    email: "elomich@arkcan.com",
    password: "password",
    confirmation: "password"
}

exports.persona1_login_username = {
    login: 'eloMich',
    password: 'password'
}

exports.persona1_login_email = {
    login: 'elomich@arkcan.com',
    password: 'password'
}

exports.persona2 = {
    username: "robou",
    firstname: "Robin",
    lastname: "Bouchard",
    birthdate: "1998-04-12",
    email: "robou@arkcan.com",
    password: "password",
    confirmation: "password"
}

exports.persona2_login_username = {
    login: 'robou',
    password: 'password'
}

exports.persona2_login_email = {
    login: 'robou@arkcan.com',
    password: 'password'
}

exports.persona3 = {
    isActive: true,
    username: "audonty",
    firstname: "Auda",
    lastname: "Monty",
    birthdate: "1993-06-17",
    email: "audonty@arkcan.com",
    password: "password",
    confirmation: "password"
}

exports.persona3_login_username = {
    login: 'audonty',
    password: 'password'
}

exports.persona3_login_email = {
    login: 'audonty@arkcan.com',
    password: 'password'
}

exports.persona4 = {
    username: "jacPai",
    firstname: "Jacques",
    lastname: "Paiement",
    birthdate: "1961-12-14",
    email: "jacpai@arkcan.com",
    password: "password",
    confirmation: "password"
}

exports.persona5 = {
    username: "fausty",
    firstname: "Faustin",
    lastname: "Michaud",
    birthdate: "2007-02-14",
    email: "fausty@arkcan.com",
    password: "password",
    confirmation: "password"
}

const userOneId = new mongoose.Types.ObjectId();
exports.userOneToken = jwt.sign({ _id: userOneId }, process.env.JWT_TOKEN_RESET);
exports.userOne = {
    _id: userOneId,
    username: "eloMich",
    firstname: "Eloïse",
    lastname: "Michaud",
    birthdate: "1997-05-13",
    email: "elomich@arkcan.com",
    password: "password",
    tokens: [{
        token: jwt.sign({ _id: userOneId }, process.env.JWT_TOKEN_AUTH)
    }]
};

const userTwoId = new mongoose.Types.ObjectId();
exports.userTwoToken = jwt.sign({ _id: userTwoId }, process.env.JWT_TOKEN_RESET);
exports.userTwo = {
    _id: userTwoId,
    username: "robou",
    firstname: "Robin",
    lastname: "Bouchard",
    birthdate: "1998-04-12",
    email: "robou@arkcan.com",
    password: "password"
}
