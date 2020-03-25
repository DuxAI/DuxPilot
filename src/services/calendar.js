require("dotenv").config();
const { Calendar } = require("../models");
const { google } = require('googleapis')
// Require oAuth2 from our google instance.
const { OAuth2 } = google.auth
// Create a new instance of oAuth and set our Client ID & Client Secret.
console.log()

const oAuth2Client = new OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_SECRET_KEY,
    process.env.CALENDER_AUTH_URL
);
console.log(process.env.GOOGLE_CLIENT_ID)
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly',
'https://www.googleapis.com/auth/userinfo.profile'];

function createOuthUrlToken() {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    return authUrl;
}

async function getToken(code) {
   return await oAuth2Client.getToken(code);
}

async function getUserData(token) {
    oAuth2Client.setCredentials(token.tokens)
    // Create a new people instance.
    const people = google.people({ version: 'v1', auth: oAuth2Client })
    const res = await people.people.get({
        resourceName: 'people/me',
        personFields: 'emailAddresses,names,photos',
    });
    console.log(res.data)
    return true;
}

async function saveCalendarData(token) {
    try {
        oAuth2Client.setCredentials(token.tokens)
        // Create a new calender instance.
        const calendar = google.calendar({ version: 'v3', auth: oAuth2Client })
        // Create a new event start date instance for temp uses in our calendar.
        const eventStartTime = new Date()
        eventStartTime.setDate(eventStartTime.getDay() + 2)
        calendar.events.list({
            'calendarId': 'primary',
            'timeMin': (new Date()).toISOString(),
            'showDeleted': false,
            'singleEvents': true,
            'maxResults': 100,
            'orderBy': 'startTime'
        }, async function (err, response) {
            if (err) {
                if (err) return console.error(err);
            } else {
                if (response && response.data && response.data.items.length > 0) {
                    console.log('Total events', response.data.items.length)
                    let finalArr = [];
                    for (let index = 0; index < response.data.items.length; index++) {
                        const element = response.data.items[index];
                        element.owner = response.data.summary;
                        element.timeZone = response.data.timeZone;
                        element.accessRole = response.data.accessRole;
                        finalArr.push({
                            updateOne: {
                                filter: {
                                    id: element.id
                                },
                                update: element,
                                upsert: true
                            }
                        });
                    }

                    await Calendar.bulkWrite(finalArr, { ordered: true });
                    return true;
                } else {
                    return console.error(err);
                }
            }
        });
    } catch (err) {
        return console.error(err);
    }
}

module.exports = { saveCalendarData, createOuthUrlToken, getToken, getUserData }