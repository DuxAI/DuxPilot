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
 * The token collection in the DB is a set of key/value pairs which define
 * specific users.
 *
 * @type {mongoose.Schema}
 */
const MailTokenSchema = mongoose.Schema({
    _id: { type: mongoose.Types.ObjectId, required: true, auto: true },
    user_id: { type: String, default: "" },
    access_token: { type: String, default: "" },
    refresh_token: { type: String, default: "" },
    id_token: { type: String, default: "" }
}, { versionKey: false });

/**
 * tokens Model
 *
 * @type {mongoose.Model}
 */
const Mail_tokens = myDB.model('tokens', MailTokenSchema)

module.exports = Mail_tokens;