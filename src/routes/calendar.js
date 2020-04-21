const router = require("express").Router();
const { saveCalendarData, createOuthUrlToken, getToken, saveTokenUserData } = require("../services/calendar");

router.get("/", async (req, res) => {
    let url = createOuthUrlToken()
    res.redirect(url);
})
// ROUTES oauth2
router.get("/auth/", async (req, res) => {
    try {
        if (!req.query.code) {
            return res.send(500).statusMessage('no code, no access!').end();
        }

        const token = await getToken(req.query.code)
        if (!token) {
            return res.send(500).statusMessage('failed to connect').end();
        }
        
        let user_id = saveTokenUserData(token);
        saveCalendarData(token, user_id);
        return res.send(200).statusMessage('Thanks for signing up to DUX AI!').end();

    } catch (error) {
        console.log("ERROR:", error);
        res.status(500).end();
    }
}
);

module.exports = router;