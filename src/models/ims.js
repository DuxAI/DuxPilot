/**
 * @file This file contains the schema / model setup for the database stored
 *       slack messages.
 * @author Anat Balzam <anatbaz@gmail.com>
 */

v mongoose = require('mongoose');

/**
 * User Schema
 *
 * The msg collection in the DB is a set of key/value pairs which define
 * specific users.
 *
 * @type {mongoose.Schema}
 */
const IMSchema = mongoose.Schema({
        im_id: String,
        im_user: String
}, { versionKey: false });

/**
 * Users Model
 *
 * @type {mongoose.Model}
 */
const IM = mongoose.model('im', IMSchema)

module.exports = IM;