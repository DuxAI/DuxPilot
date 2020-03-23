const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');

module.exports = async function connectToDB() {
  const connection = await mongoose.connect(process.env.MONGODB_URI, { useUnifiedTopology: true, useNewUrlParser: true })
    .then(() => console.log('DB Connected!'))
    .catch(err => {
      console.log("DB Connection Error: ${err.message}");
    });
};
