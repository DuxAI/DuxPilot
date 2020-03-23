/**
 * @file This file contains the schema / model setup for the database stored
 *       slack messages.
 * @author Anat Balzam <anatbaz@gmail.com>
 */

var mongoose = require('mongoose');

/**
 * User Schema
 *
 * The msg collection in the DB is a set of key/value pairs which define
 * specific users.
 *
 * @type {mongoose.Schema}
 */
const UserSchema = mongoose.Schema({
        user_id: String,
        user_name: String,
        name: String,
        second_name: String,
        channel_id_list: Array,
        team_id_list: Array
}, { versionKey: false });

/**
 * Users Model
 *
 * @type {mongoose.Model}
 */
const User = mongoose.model('user', UserSchema)

module.exports = User;