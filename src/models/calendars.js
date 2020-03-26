/**
 * @file This file contains the schema / model setup for the database stored
 *       slack messages.
 * @author Shubham Pareek
 */

var mongoose = require('mongoose');

const myDB = mongoose.connection.useDb('calendar_db');

/**
 * User Schema
 *
 * The msg collection in the DB is a set of key/value pairs which define
 * specific users.
 *
 * @type {mongoose.Schema}
 */
const CalendarSchema = mongoose.Schema({
    _id: { type: mongoose.Types.ObjectId, required: true, auto: true },
    id: { type: String, default: "" },
    summary: { type: String, default: "" },
    description: { type: String, default: "" },
    location: { type: String, default: "" },
    timeZone: { type: String, default: "" },
    summaryOverride: { type: String, default: "" },
    colorId: { type: String, default: "" },
    backgroundColor: { type: String, default: "" },
    foregroundColor: { type: String, default: "" },
    hidden: { type: Boolean, default: null },
    selected: { type: Boolean, default: null },
    accessRole: { type: String, default: "" },
    defaultReminders: { type: [Object], default: [] },
    notificationSettings: { type: Object, default: null },
    primary: { type: Boolean, default: null },
    deleted: { type: Boolean, default: null },
    conferenceProperties: { type: Object, default: null}
}, { versionKey: false });

/**
 * Calender Model
 *
 * @type {mongoose.Model}
 */
const Calendar = myDB.model('calendars', CalendarSchema)

module.exports = Calendar;