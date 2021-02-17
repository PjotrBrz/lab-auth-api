const { BadRequest } = require('../utils/errorManagement');

exports.checkInput = (inputs, allowedInputs) => {
    const userInputs = Object.keys(inputs);
    
    const isValidOperation = userInputs.every(update => allowedInputs.includes(update));
    const isEqual = userInputs.length === allowedInputs.length;

    if(!isEqual || !isValidOperation) throw new BadRequest('Invalid parameters');

    return Object.keys(inputs);
}

exports.compareInputs = (val1, val2) => {
    if(val1 !== val2) throw new BadRequest('Password confimation failed');
}