const path = require('path')
const connectToDB = require("./db/mongoose")
const express = require('express')
const slack = require("./routes/slack")
const calendar = require("./routes/calendar");
const mail = require("./routes/mail")

require('dotenv').config({ path: path.join(__dirname, '.env') });
global.db = connectToDB();

const app = express()
const port = 3000


const { createEventAdapter } = require('@slack/events-api');
// *** Initialize event adapter using signing secret from environment variables ***
const slackEvents = createEventAdapter(process.env.SLACK_SIGNING_SECRET, {
    includeBody: true
  });

// Attach listeners to events by Slack Event "type". See: https://api.slack.com/events/message.im
slackEvents.on('message', (event) => {
  console.log(`Received a message event: user ${event.user} in channel ${event.channel} says ${event.text}`);
});


app.use('/slack/events', slackEvents.expressMiddleware());


app.use('/', slack);
app.use('/calendar', calendar);
app.use('/mail', mail);

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

