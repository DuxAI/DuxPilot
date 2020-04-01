const router = require("express").Router();
const { saveMailMessageData, createOuthUrlToken, getToken, saveTokenUserData } = require("../services/mail");

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
        let user_id = await  saveTokenUserData(token);
        await saveMailMessageData(token, user_id);
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