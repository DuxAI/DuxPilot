const router = require("express").Router();
const { getSlackAccessToken, saveUsersFromSlack, saveChannelAndMsgsFromSlack } = require("../services/slack");


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

    } catch (error) {
        console.log("ERROR:", error);
        res.status(500).end();
    }
}
);


module.exports = router;