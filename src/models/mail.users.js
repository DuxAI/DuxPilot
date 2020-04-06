/**
 * @file This file contains the schema / model setup for the database stored
 *       slack messages.
 * @author Shubham Pareek
 */

var mongoose = require('mongoose');

const myDB = mongoose.connection.useDb('mail_db');

/**
 * User Schema
 *
 * The users collection in the DB is a set of key/value pairs which define
 * specific users.
 *
 * @type {mongoose.Schema}
 */
const MailUserSchema = mongoose.Schema({
    _id: { type: mongoose.Types.ObjectId, required: true, auto: true },
    user_id: { type: String, default: "" },
    user_name: { type: String, default: "" },
    name: { type: String, default: "" },
    second_name: { type: String, default: "" },
    first_name: { type: String, default: "" },
    profile_pic: { type: String, default: "" },
    email: { type: String, default: "" }
}, { versionKey: false });

/**
 * mail users Model
 *
 * @type {mongoose.Model}
 */
const Mail_users = myDB.model('users', MailUserSchema)

module.exports = Mail_users;