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
 * The msg collection in the DB is a set of key/value pairs which define
 * specific users.
 *
 * @type {mongoose.Schema}
 */
const MessageSchema = mongoose.Schema({
    _id: { type: mongoose.Types.ObjectId, required: true, auto: true },
    msg_id: { type: String, default: "" },
    user_id: { type: String},
    threadId: { type: String, default: "" },
    labelIds: { type: [String], default: [] },
    snippet: { type: String, default: "" },
    historyId: { type: String, default: "" },
    internalDate: { type: String, default: "" },
   // payload: { type: Object, default: null },
    from: { type: String },
    to: { type: String },
    subject: { type: String },
    thread_topic: { type: String },
    date_time: { type: String }
    //attachments: 
}, { versionKey: false });

/**
 * messages Model
 *
 * @type {mongoose.Model}
 */
const Message = myDB.model('messages', MessageSchema)

module.exports = Message;