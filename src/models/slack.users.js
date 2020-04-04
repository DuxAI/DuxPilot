/**
 * @file This file contains the schema / model setup for the database stored
 *       slack messages.
 * @author Anat Balzam <anatbaz@gmail.com>
 */

var mongoose = require('mongoose');
const myDB = mongoose.connection.useDb('users_db');

/**
 * User Schema
 *
 * The msg collection in the DB is a set of key/value pairs which define
 * specific users.
 *
 * @type {mongoose.Schema}
 */
const SlackUserSchema = mongoose.Schema({
        user_id: String,
        user_name: String,
        real_name: String,
        team_id: String
}, { versionKey: false });

/**
 * Users Model
 *
 * @type {mongoose.Model}
 */
const Slack_users = myDB.model('user', SlackUserSchema)

module.exports = Slack_users;