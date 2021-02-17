const mongoose = require('mongoose');

const dbUser = process.env.NODE_USER;
const dbPassword = process.env.NODE_PASS;
const dbName = process.env.NODE_NAME;
const dbServer= process.env.NODE_PATH;
const dbOptions = {
    useCreateIndex: "true",
    useNewUrlParser: "true",
    useUnifiedTopology: "true"
}
const dbUrl = `mongodb+srv://${dbUser}:${dbPassword}@${dbServer}/${dbName}`;

mongoose.connect(dbUrl, dbOptions)
mongoose.connection.on("error", err => {
  console.log("err", err)
})
mongoose.connection.on("connected", (err, res) => {
  if(process.env.ENV != 'test') console.log(`> Application now connected to ${dbName}!`);
})

module.exports = mongoose;
