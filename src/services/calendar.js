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

    await Calendar_users.updateOne({ user_id: res.data.names[0].metadata.source.id }, userData, { upsert: true },
        async function (err) {
            if (err && err.code === 11000) {
                console.log("Retrying update...")
                // Another upsert occurred during the upsert, try again. You could omit the
                // upsert option here if you don't ever delete docs while this is running.
                await Calendar_users.updateOne({ user_id: res.data.names[0].metadata.source.id }, userData, { upsert: true },
                    function (err) {
                        if (err) {
                            console.trace(err);
                        }
                    });
            }
        });
    await Calendar_tokens.updateOne({ user_id: res.data.names[0].metadata.source.id }, tokenData, { upsert: true },
        async function (err) {
            if (err && err.code === 11000) {
                console.log("Retrying update...")
                // Another upsert occurred during the upsert, try again. You could omit the
                // upsert option here if you don't ever delete docs while this is running.
                await Calendar_tokens.updateOne({ user_id: res.data.names[0].metadata.source.id }, tokenData, { upsert: true },
                    function (err) {
                        if (err) {
                            console.trace(err);
                        }
                    });
            }
        });
    return res.data.names[0].metadata.source.id;
}

async function saveCalendarData(token, user_id) {
    try {
        oAuth2Client.setCredentials(token.tokens)
        // Create a new calender instance.
        const calendar = google.calendar({ version: 'v3', auth: oAuth2Client })

        let calendarResponse = await calendar.calendarList.list();
        let calendarsToPush = [];
        let calendarItems = [];
        if (calendarResponse && calendarResponse.data && calendarResponse.data.items.length > 0) {
            calendarItems = calendarResponse.data.items;
        }
        for (let calendarItem of calendarItems) {
            let calendarId = calendarItem.id;
            calendarItem.user_id = await user_id;
            calendarsToPush.push({
                updateOne: {
                    filter: {
                        id: calendarId,
                        user_id: user_id
                    },
                    update: calendarItem,
                    upsert: true
                }
            });
            saveEventsForCalendarId(calendar, calendarId)
            await Calendar_users.updateOne({ user_id: user_id }, { "$addToSet": { calendarIds: calendarId } }, { upsert: true },
            async function (err) {
                if (err && err.code === 11000) {
                    console.log("Retrying update...")
                    // Another upsert occurred during the upsert, try again. You could omit the
                    // upsert option here if you don't ever delete docs while this is running.
                    await Calendar_users.updateOne({ user_id: user_id }, { "$addToSet": { calendarIds: calendarId } }, { upsert: true },
                        function (err) {
                            if (err) {
                                console.trace(err);
                            }
                        });
                }
            });

        }
        if (calendarsToPush.length) {
            await Calendar.bulkWrite(calendarsToPush, { ordered: false });
        }
    }
    catch (err) {
        return console.error(err);
    }
}


async function saveEventsForCalendarId(calendar, calendarId) {
    // Create a new event start date instance for temp uses in our calendar.
    const eventEndLowerBound = new Date()
    eventEndLowerBound.setDate(eventEndLowerBound.getDate() - 30)
    const eventStartUpperBound = new Date()
    eventStartUpperBound.setDate(eventEndLowerBound.getDate() + 30)

    try {
        console.log("The date of timeMax:", (new Date()).toISOString(), "The date of timeMin:", eventEndLowerBound);
        let events = await calendar.events.list({
            'calendarId': calendarId,
            'timeMin': eventEndLowerBound.toISOString(),
            'timeMax': eventStartUpperBound.toISOString(),
            'showDeleted': false,
            'singleEvents': true,
            'maxResults': 1000,
            'orderBy': 'startTime'
        });
        console.log(events && events.data && events.data.items.length > 0)
        if (events && events.data && events.data.items.length > 0) {
            console.log('Total events', events.data.items.length)
            let eventsToPush = [];
            for (let calendarItem of events.data.items) {
                calendarItem.owner = events.data.summary;
                calendarItem.timeZone = events.data.timeZone;
                calendarItem.accessRole = events.data.accessRole;
                calendarItem.calendarId = calendarId;
                eventsToPush.push({
                    updateOne: {
                        filter: {
                            id: calendarItem.id
                        },
                        update: calendarItem,
                        upsert: true
                    }
                });
            }
            await Event.bulkWrite(eventsToPush, { ordered: false });
        }
    }

    catch (err) {
        return console.error(err);
    }
}

module.exports = { saveCalendarData, createOuthUrlToken, getToken, saveTokenUserData }
