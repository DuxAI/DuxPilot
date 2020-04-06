/**
 * @file This file contains the schema / model setup for the database stored
 *       slack messages.
 * @author Anat Balzam <anatbaz@gmail.com>
 */

const mongoose = require('mongoose');
const Int32 = require('mongoose-int32');
/**
 * Msg Schema
 *
 * The msg collection in the DB is a set of key/value pairs which define
 * specific msgs.
 *
 * @type {mongoose.Schema}
 */
const MsgSchema = mongoose.Schema({
    channel_id: String,
    user_id: String,
    type: String,
    ts: String,
    time_stamp: Int32,
    team: String,
    response_time: Int32
}, { versionKey: false });

/**
 * Msg Model
 *
 * @type {mongoose.Model}
 */
const Msg = mongoose.model('message', MsgSchema)


module.exports =  Msg;