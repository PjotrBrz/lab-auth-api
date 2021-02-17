const app = require('./server');

const PORT = process.env.PORT;
app.listen(PORT, () => {
    if(process.env.ENV != 'test') console.log(`> App is now listening on port ${PORT}...`);
});
