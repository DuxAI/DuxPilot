require("dotenv").config();
const { Mail_tokens, Mail_users, Message, User } = require("../models");
const { google } = require('googleapis')
// Require oAuth2 from our google instance.
const { OAuth2 } = google.auth
// Create a new instance of oAuth and set our Client ID & Client Secret.

const oAuth2Client = new OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_SECRET_KEY,
    process.env.MAIL_AUTH_URL
);
const SCOPES = [
    'https://www.googleapis.com/auth/gmail.metadata',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email'
];

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
        profile_pic: res.data.photos[0].url,
        email: res.data.emailAddresses[0].value
    }

    let tokenData = {
        user_id: res.data.names[0].metadata.source.id,
        access_token: token.tokens.access_token,
        refresh_token: token.tokens.refresh_token,
        id_token: token.tokens.id_token
    }

    await Mail_users.updateOne({ user_id: res.data.names[0].metadata.source.id }, userData, { upsert: true });
    await Mail_tokens.updateOne({ user_id: res.data.names[0].metadata.source.id }, tokenData, { upsert: true });
    //await User.updateOne({ email: res.data.emailAddresses[0].value }, {user_id: res.data.names[0].metadata.source.id });

    return { user_id: res.data.names[0].metadata.source.id, email: res.data.emailAddresses[0].value}
}

async function messageDataExtract(messages) {
    let object = {};
    for (let index = 0; index < messages.length; index++) {
        switch (messages[index].name) {
            case 'Subject':
                object.subject = messages[index].value;
                break;
            case 'To':
                object.to = messages[index].value;
                break;
            case 'Cc':
                object.cc = messages[index].value;
                break;
            case 'Date':
                object.date_time = messages[index].value;
                break;
            case 'Thread-Topic':
                object.thread_topic = messages[index].value;
                break;
            case 'From':
                object.from = messages[index].value;
                break;
        }
    }
    if (object.cc) {
        object.to = object.to + ', ' + object.cc;
    }
    return object;
}

async function getEmployees(email) {
    return User.findOne({email: email});
}

function checkInvolvedMail(msg, manager) {
    let status = false;
    employees_list = JSON.parse(JSON.stringify(manager)).employees;
    for (let element of  employees_list) {
        if (msg.to.search(element.email) > -1 || msg.from.search(element.email) > -1) {
            status = true;
            break;
        }
    }
    return status;
}

function checkRelevant(msg, manager) {
    //console.log(msg)
   // console.log(JSON.parse(JSON.stringify(manager)).employees)
   console.log(checkInvolvedMail(msg, manager))
    return msg.to.split(',').length < 5 && checkInvolvedMail(msg, manager)
  
}

async function saveMailMessageData(token, user_id, email) {
    try {
        oAuth2Client.setCredentials(token.tokens)
        // Create a new calender instance.
        const gmail = google.gmail({ version: 'v1', auth: oAuth2Client })

        let manager = await getEmployees(email);
        let mailsList = await gmail.users.messages.list({
            userId: user_id
        });

        let messages = [];
        if (mailsList && mailsList.data && mailsList.data.messages.length > 0) {
            mailsList = mailsList.data.messages;
        } else {
            mailsList = [];
        }

        for (let index = 0; index < mailsList.length; index++) {
            let message = await gmail.users.messages.get({
                userId: user_id,
                id: mailsList[index].id,
                format: "metadata"
            });
            let msg = await messageDataExtract(message.data.payload.headers);
            msg = { ...message.data, ...msg };
            let isRelevant = checkRelevant(msg, manager);
            if (isRelevant) {
                console.log(msg);
                messages.push({
                    updateOne: {
                        filter: {
                            msg_id: message.data.id,
                            user_id: user_id
                        },
                        update: msg,
                        upsert: true
                    }
                });
            }
        }

        if (messages.length) {
            await Message.bulkWrite(messages, { ordered: true });
        }
    } catch (err) {
        return console.error(err);
    }
}

module.exports = { saveMailMessageData, createOuthUrlToken, getToken, saveTokenUserData }
