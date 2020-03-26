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
            //no code, no access!
            return res.status(401).end();
        }
        let token = await getToken(req.query.code)
        await  saveTokenUserData(token);
        await saveCalendarData(token);
        res.status(200).json({
            message: "success"
        })

    } catch (error) {
        console.log("ERROR:", error);
        res.status(500).end();
    }
}
);

module.exports = router;