const path = require('path')
const connectToDB = require("./db/mongoose")
const express = require('express')
const slack = require("./routes/slack")
const calendar = require("./routes/calendar");
const mail = require("./routes/mail")

require('dotenv').config({ path: path.join(__dirname, '.env') });
global.db = connectToDB();

const app = express()
const port = 80

app.use('/', slack);
app.use('/calendar', calendar);
app.use('/mail', mail);

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

