require("dotenv").config();
const connection = require ("../db/mongoose")
const {Channel, Msg, User }= require("../models")
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

    connection();
    //posting the client_id, client_secret and auth code to slack api.
    const result = await axios.post(url, data, headers);
    return result.data.authed_user.access_token;
}

async function saveNewSlackUserToDB(user) {
    const userToSave = new User({
        user_id: user.id,
        user_name: user.name,
        real_name: user.real_name,
        team_id: user.team_id
    })

    await User.updateOne(
        {user_id: user.id}, 
        {$setOnInsert: userToSave}, 
        {upsert: true}, 
        function (err, user) {
            if (err) return console.error(err);
        })
}


async function saveUsersFromSlack(access_token) {
    const slackWebClient = new WebClient(access_token);
    for await (const users of slackWebClient.paginate('users.list')) {
        users_array = users.members;
        users_array.forEach(user => {
            saveNewSlackUserToDB(user);
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
        team_id: channel.shared_team_ids[0],
        channel_topic: channel.topic.value,
        channel_purpose: channel.purpose.value,
        participants_sum: channel.num_members
    });
    await Channel.updateOne(
        {channel_id: channel.id}, 
        {$setOnInsert: channelToSave}, 
        {upsert: true}, 
        function (err, channel) {
            if (err) return console.error(err);
        })
}

async function saveChannelAndMsgsFromSlack(access_token) {
    const slackWebClient = new WebClient(access_token);
    const types = 'public_channel,private_channel,mpim,im';
    for await (const pChannels of slackWebClient.paginate('conversations.list', { types })) {
        for (const channel of pChannels.channels) {
            if (channel.hasOwnProperty('purpose')) {
                saveNewChannelToDB(channel)
            }
            saveMsgsFromChannel(slackWebClient, channel)
        }
       
    }
}

async function saveNewMsgToDB(message, channel) {
    

    const msgToSave = new Msg({
        channel_id: channel.id,
        user_id: message.user,
        type: message.type,
        text: message.text,
        ts: message.ts,
        team: message.team
    });
    await Msg.updateOne(
        {ts: message.ts}, 
        {$setOnInsert: msgToSave}, 
        {upsert: true}, 
        function (err, msg) {
            if (err) return console.error(err);
        })
}
async function saveMsgsFromChannel(slackWebClient, channel) {
    for await (const pMessages of slackWebClient.paginate('conversations.history', { channel: channel.id })) {
        for (const message of pMessages.messages) {
            saveNewMsgToDB(message, channel)
        }
    }
}

module.exports = {getSlackAccessToken, saveChannelAndMsgsFromSlack, saveUsersFromSlack }








