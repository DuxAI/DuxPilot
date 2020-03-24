const router = require("express").Router();
const { getSlackAccessToken, saveUsersFromSlack, saveChannelAndMsgsFromSlack , listenerMsg} = require("../services/slack");


router.get('/events',listenerMsg)


router.get("/", async (req, res) => {
    res.sendFile(__dirname + '/add_to_slack.html')
})
// ROUTES oauth2
router.get("/auth", async (req, res) => {
    try {
        if (!req.query.code) {
            //no code, no access!
            return res.status(401).end();
        }
        const token = await getSlackAccessToken(req.query.code);
        saveUsersFromSlack(token);
        saveChannelAndMsgsFromSlack(token);
        res.redirect(200,'/test')

    } catch (error) {
        console.log("ERROR:", error);
        res.status(500).end();
    }
}
);



module.exports = router;