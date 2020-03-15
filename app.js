require('dotenv').config() 
var express = require('express')
var request = require('request')
var app = express()
const port = 3000

app.get('/', (req, res) => res.send('Hello World!'))

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

app.get('/auth', (req, res) => {
    res.sendFile(__dirname + '/add_to_slack.html')
    // console.log(process.env)
})

// app.get('/auth/redirect', (req, res) =>{
//     var options = {
//         uri: 'https://slack.com/api/oauth/authorize?code='
//             +req.query.code+
//             '&client_id='+process.env.CLIENT_ID+
//             '&client_secret='+process.env.CLIENT_SECRET+
//             '&redirect_uri='+process.env.REDIRECT_URI,
//         method: 'GET'
//     }
//     console.log(options)
//     request(options, (error, response, body) => {
//         var JSONresponse = JSON.parse(body)
//         if (!JSONresponse.ok){
//             // console.log(JSONresponse)
//             res.send("Error encountered: \n"+JSON.stringify(JSONresponse)).status(200).end()
//         }else{
//             // console.log(JSONresponse)
//             res.send("Success!")
//         }
// //     })
// })