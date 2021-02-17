const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmailConfirmation = (email, token) => {

    if(process.env.ENV != 'test') {
        sgMail.send({
            to: email,
            from: 'services@arkcan.com',
            subject: 'Confirmez votre email',
            text: `Confirmez votre email Bonjour, Pour finaliser votre inscription à Arkcan, il ne vous reste plus qu'à confirmer votre adresse email.`,
            html: `This is your token: ${token}`
        });
    }

}

const sendEmailRecovery = (email, token) => {
    if(process.env.ENV != 'test') {
        sgMail.send({
            to: email,
            from: 'services@arkcan.com',
            subject: 'Récupérer votre compte',
            text: `Récupérer votre compte utilisateur`,
            html: `This is your token: ${token}`
        });
    }
}

module.exports = {
    sendEmailConfirmation,
    sendEmailRecovery
}
