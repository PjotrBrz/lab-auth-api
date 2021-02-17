const express = require('express');
const handleErrors = require('./middlewares/errorMiddleware');

require('./utils/dbConnection');

const server = express();
server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use('/api/v1', require('./router'));
server.use(handleErrors);

module.exports = server;
