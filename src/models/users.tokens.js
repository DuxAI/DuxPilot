/**
 * @file This file contains the schema / model setup for the database stored
 *       slack channels.
 * @author Anat Balzam <anatbaz@gmail.com>
 */

const mongoose = require('mongoose');

/**
 * UsersToken Schema
 *
 * The msg collection in the DB is a set of key/value pairs which define
 * specific msgs.
 *
 * @type {mongoose.Schema}
 */
const UsersTokenSchema = mongoose.Schema({
       user_id: String,
       user_scope: String,
       token: String
    }, { versionKey: false });

/**
 * Channel Model
 *
 * @type {mongoose.Model}
 */
const UserToken = mongoose.model('token', UsersTokenSchema)

module.exports =  UserToken;