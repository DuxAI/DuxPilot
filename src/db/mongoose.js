require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');

module.exports = async () => {
  const connection = await mongoose.connect(process.env.MONGODB_URI, { useUnifiedTopology: true, useNewUrlParser: true })
    .then(() => console.log('DB Connected!'))
    return connection
    .catch(err => {
      console.log("DB Connection Error: ${err.message}");
    });
};
