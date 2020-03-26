require("dotenv").config();
const { Event, Calendar_tokens, Calendar_users, Calendar } = require("../models");
const { google } = require('googleapis')
// Require oAuth2 from our google instance.
const { OAuth2 } = google.auth
// Create a new instance of oAuth and set our Client ID & Client Secret.

const oAuth2Client = new OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_SECRET_KEY,
    process.env.CALENDER_AUTH_URL
);
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

async function saveTokenUserData(token) {
    oAuth2Client.setCredentials(token.tokens)
    // Create a new people instance.
    const people = google.people({ version: 'v1', auth: oAuth2Client })
    const res = await people.people.get({
        resourceName: 'people/me',
        personFields: 'emailAddresses,names,photos',
    });
    let userData = {
        user_id: res.data.names[0].metadata.source.id,
        name: res.data.names[0].displayName,
        second_name: res.data.names[0].familyName,
        first_name: res.data.names[0].givenName,
        profile_pic: res.data.photos[0].url
    }

    let tokenData = {
        user_id: res.data.names[0].metadata.source.id,
        access_token: token.tokens.access_token,
        refresh_token: token.tokens.refresh_token,
        id_token: token.tokens.id_token
    }

    await Calendar_users.updateOne({ user_id: res.data.names[0].metadata.source.id }, userData, { upsert: true });
    await Calendar_tokens.updateOne({ user_id: res.data.names[0].metadata.source.id }, tokenData, { upsert: true });
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
        let calendarList = await calendar.calendarList.list();
        let calendarListArray = [];
        let calendarArray = [];
        if (calendarList && calendarList.data && calendarList.data.items.length > 0) {
            calendarArray = calendarList.data.items;
        }
        for (let index = 0; index < calendarArray.length; index++) {
            const element = calendarArray[index];
            calendarListArray.push({
                updateOne: {
                    filter: {
                        id: element.id
                    },
                    update: element,
                    upsert: true
                }
            });
            let events = await calendar.events.list({
                'calendarId': element.id,
                'timeMin': (new Date()).toISOString(),
                'showDeleted': false,
                'singleEvents': true,
                'maxResults': 1000,
                'orderBy': 'startTime'
            });
            if (events && events.data && events.data.items.length > 0) {
                console.log('Total events', events.data.items.length)
                let finalArr = [];
                for (let index = 0; index < events.data.items.length; index++) {
                    let element = events.data.items[index];
                    element.owner = events.data.summary;
                    element.timeZone = events.data.timeZone;
                    element.accessRole = events.data.accessRole;
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
                await Event.bulkWrite(finalArr, { ordered: true });
            }
        }
        if (calendarListArray.length) {
            await Calendar.bulkWrite(calendarListArray, { ordered: true });
        }
    } catch (err) {
        return console.error(err);
    }
}

module.exports = { saveCalendarData, createOuthUrlToken, getToken, saveTokenUserData }