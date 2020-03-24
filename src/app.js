const path = require('path')
const connectToDB = require("./db/mongoose")
const express = require('express')
const slack = require("./routes/slack")
const calendar = require("./routes/calendar")
require('dotenv').config({ path: path.join(__dirname, '.env') });
global.db = connectToDB();

const app = express()
const port = 3000


app.use('/slack', slack);
app.use('/calendar', calendar);

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

