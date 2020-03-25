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
    kind: { type: String, default: "" },
    etag: { type: String, default: "" },
    id: { type: String, default: "" },
    status: { type: String, default: "" },
    htmlLink: { type: String, default: "" },
    created: { type: Date, default: "" },
    updated: { type: Date, default: "" },
    summary: { type: Object, default: null },
    creator: { type: Object, default: null },
    organizer: { type: Object, default: null },
    start: { type: Object, default: null },
    end: { type: Object, default: null },
    reminders: { type: Object, default: null },
    sequence: { type: Number, default: 0 },
    iCalUID: { type: String, default: "" },
    owner: { type: String, default: "" },
    timeZone: { type: String, default: "" },
    accessRole: { type: String, default: "" },
    conferenceData: { type: Object, default: null },
    hangoutLink: { type: String, default: "" },
    extendedProperties: { type: Object, default: null },
    attendeesOmitted: { type: Boolean, default: null },
    attendees: { type: Array, default: [] },
    transparency: { type: String, default: "" },
    visibility: { type: String, default: "" },
    recurringEventId: { type: String, default: "" },
    originalStartTime: { type: Object, default: "" },
    endTimeUnspecified: { type: Boolean, default: null },
    recurrence: { type: [String], default: [] },
    description: { type: String, default: '' },
    location: { type: String, default: '' },
    colorId: { type: String, default: '' }
}, { versionKey: false });

/**
 * Calender Model
 *
 * @type {mongoose.Model}
 */
const Calendar = myDB.model('calenders', CalendarSchema)

module.exports = Calendar;