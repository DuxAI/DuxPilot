const router = require("express").Router();
const UserToken = require("../models/users.tokens")
const {getSlackConnector ,getSlackAccessToken, saveUsersFromSlack, saveChannelAndMsgsFromSlack } = require("../services/slack");


router.get("/", async (req, res) => {
    res.sendFile(__dirname + '/views/index.html')
})
// ROUTES oauth2
router.get("/auth", async (req, res) => {
    try {
        if (!req.query.code) {
            return res.status(500).statusMessage('no code, no access!').end();
        }

        const token = await getSlackAccessToken(req.query.code);
        if (!token) {
            return res.status(500).statusMessage('failed to connect').end();
        }

	const slackConnector = await getSlackConnector(token);

        res.status(200).redirect('/calendar')

        saveUsersFromSlack(slackConnector);
        saveChannelAndMsgsFromSlack(slackConnector);


    } catch (error) {
        console.log("ERROR:", error);
        res.status(500).end();
    }
}
);

//router.get("/pull", async (req, res) => {
 //   try {
        // for await (const usertoken of UserToken.find()) {
        //      const token = usertoken.token;
        //      saveChannelAndMsgsFromSlack(token);
        //     (token);

        // }
   //     if (!slackConnector) {
     //       return res.status(500).statusMessage('failed to connect')
       // }

        //res.status(200).redirect('/calender')

        //saveChannelAndMsgsFromSlack(slackConnector)
   // }
    //catch (error) {
      //  console.log("ERROR:", error);
        //res.status(500).end();
    //}
//});


module.exports = router;
