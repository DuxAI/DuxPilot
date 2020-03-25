const router = require("express").Router();
const { saveCalendarData } = require("../services/calendar");

// ROUTES oauth2
router.get("/", async (req, res) => {
    try {
        if (!req.query.refresh_token) {
            //no code, no access!
            return res.status(401).end();
        }
    
        await saveCalendarData(req.query.refresh_token);
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