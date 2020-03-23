const path = require('path')
const express = require('express')
const slack = require("./routes/slack")
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express()
const port = 3000


app.get('/test', (req, res) => {
    res.sendFile(__dirname + '/add_to_slack.html')
})
app.use('/slack', slack);


app.listen(port, () => console.log(`Example app listening on port ${port}!`))

