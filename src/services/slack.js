require("dotenv").config();
const { Channel, Msg, Slack_users, UserToken, IM } = require("../models")
const { WebClient } = require('@slack/web-api');
const qs = require("querystring");
const axios = require("axios");
const url = "https://slack.com/api/oauth.v2.access";

async function getSlackAccessToken(code) {
    const headers = {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    };

    const data = qs.stringify({
        client_id: process.env.SLACK_CLIENT_ID,
        client_secret: process.env.SLACK_CLIENT_SECRET,
        code: code
    });


    //posting the client_id, client_secret and auth code to slack api.
    try {
        const result = await axios.post(url, data, headers);
        await saveUserTokenToDB(result.data.authed_user); // TODO; need to encrypt access_token here
        return result.data.authed_user.access_token;
    }
    catch {
        console.log("Failed to autenticate!")
    }
}



async function saveUserTokenToDB(tokenData) {
    const tokenToSave = new UserToken({
        user_id: tokenData.id,
        user_scope: tokenData.scope,
        token: tokenData.access_token
    })
    await UserToken.updateOne(
        { user_id: tokenData.id },
        { $setOnInsert: tokenToSave },
        { upsert: true },
        async function (err, usertoken) {
            if (err && err.code === 11000) {
                console.log("Retrying update...")
                // Another upsert occurred during the upsert, try again. You could omit the
                // upsert option here if you don't ever delete docs while this is running.
                await UserToken.updateOne(
                    { user_id: tokenData.id },
                    { $setOnInsert: tokenToSave },
                    { upsert: true },
                    function (err) {
                        if (err) {
                            console.trace(err);
                        }
                    });
            }
        })
}

async function saveIMToDB(im) {
    const IMToInsert = new IM({
        im_id: im.id,
        im_user: im.user
    })
    console.log(IMToInsert)
    await IM.updateOne(
        { im_id: im.id },
        { $setOnInsert: IMToInsert },
        { upsert: true },
        async function (err, im) {
            if (err && err.code === 11000) {
                console.log("Retrying update...")
                // Another upsert occurred during the upsert, try again. You could omit the
                // upsert option here if you don't ever delete docs while this is running.
                await IM.updateOne(
                    { im_id: im.id },
                    { $setOnInsert: IMToInsert },
                    { upsert: true },
                    function (err) {
                        if (err) {
                            console.trace(err);
                        }
                    });
            }

        })
}


async function saveNewSlackUserToDB(user) {
    const userToSave = new Slack_users({
        user_id: user.id,
        user_name: user.name,
        real_name: user.real_name,
        team_id: user.team_id
    })
    await Slack_users.updateOne(
        { user_id: user.id },
        { $setOnInsert: userToSave },
        { upsert: true },
        async function (err, user) {
            if (err && err.code === 11000) {
                console.log("Retrying update...")
                // Another upsert occurred during the upsert, try again. You could omit the
                // upsert option here if you don't ever delete docs while this is running.
                await Slack_users.updateOne(
                    { user_id: user.id },
                    { $setOnInsert: userToSave },
                    { upsert: true },
                    function (err) {
                        if (err) {
                            console.trace(err);
                        }
                    });
            }

        })
}


async function saveUsersFromSlack(slackWebClient) {
    for await (const users of slackWebClient.paginate('users.list')) {
        users_array = users.members;
        users_array.forEach(async (user) => {
            await saveNewSlackUserToDB(user);
        });
    }
}

async function saveNewChannelToDB(channel) {
    const channelToSave = new Channel({
        channel_id: channel.id,
        channel_name: channel.name,
        is_channel: channel.is_channel,
        is_group: channel.is_group,
        is_im: channel.is_im,
        team_id: channel.shared_team_ids ? channel.shared_team_ids[0] : undefined,
        channel_topic: channel.topic.value,
        channel_purpose: channel.purpose.value,
        participants_sum: channel.num_members
    });
    await Channel.updateOne(
        { channel_id: channel.id },
        { $setOnInsert: channelToSave },
        { upsert: true },
        async function (err, channel) {
            if (err && err.code === 11000) {
                console.log("Retrying update...")
                // Another upsert occurred during the upsert, try again. You could omit the
                // upsert option here if you don't ever delete docs while this is running.
                await Channel.updateOne(
                    { channel_id: channel.id },
                    { $setOnInsert: channelToSave },
                    { upsert: true },
                    function (err) {
                        if (err) {
                            console.trace(err);
                        }
                    });
            }

        })
}

function getSlackConnector(access_token) {
    return new WebClient(access_token);
}

async function saveChannelAndMsgsFromSlack(slackWebClient) {
    const types = 'public_channel,private_channel,mpim,im';
    for await (const pChannels of slackWebClient.paginate('conversations.list', { types })) {
        for (const channel of pChannels.channels) {
            if (channel.hasOwnProperty('purpose')) {
                await saveNewChannelToDB(channel)
            }
            else {
                await saveIMToDB(channel)
            }
            await saveMsgsFromChannel(slackWebClient, channel)
        }

    }
}

async function saveNewMsgToDB(message, channel) {


    const msgToSave = new Msg({
        channel_id: channel.id,
        user_id: message.user,
        type: message.type,
        ts: message.ts,
        team: message.team
    });
    await Msg.updateOne(
        { ts: message.ts },
        { $setOnInsert: msgToSave },
        { upsert: true },
        async function (err, msg) {
            if (err && err.code === 11000) {
                console.log("Retrying update...")
                // Another upsert occurred during the upsert, try again. You could omit the
                // upsert option here if you don't ever delete docs while this is running.
                await Msg.updateOne(
                    { ts: message.ts },
                    { $setOnInsert: msgToSave },
                    { upsert: true },
                    function (err) {
                        if (err) {
                            console.trace(err);
                        }
                    });
            }
        })
}
async function saveMsgsFromChannel(slackWebClient, channel) {
    try {
        for await (const pMessages of slackWebClient.paginate('conversations.history', { channel: channel.id, oldest: '1581845320' })) {
            for (const message of pMessages.messages) {
                console.log(message);
                await saveNewMsgToDB(message, channel)
            }
        }
    }
    catch (e) {
        console.log(e)
    }
}

module.exports = { getSlackConnector, getSlackAccessToken, saveChannelAndMsgsFromSlack, saveUsersFromSlack }








