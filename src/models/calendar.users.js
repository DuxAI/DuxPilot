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
const CalendarUserSchema = mongoose.Schema({
    _id: { type: mongoose.Types.ObjectId, required: true, auto: true },
    user_id: { type: String, default: "" },
    user_name: { type: String, default: "" },
    name: { type: String, default: "" },
    second_name: { type: String, default: "" },
    first_name: { type: String, default: "" },
    profile_pic: { type: String, default: "" }
   
}, { versionKey: false });

/**
 * Calender Model
 *
 * @type {mongoose.Model}
 */
const Calendar_users = myDB.model('users', CalendarUserSchema)

module.exports = Calendar_users;