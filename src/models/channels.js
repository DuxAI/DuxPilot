/**
 * @file This file contains the schema / model setup for the database stored
 *       slack channels.
 * @author Anat Balzam <anatbaz@gmail.com>
 */

const mongoose = require('mongoose');
const Int32 = require('mongoose-int32');

/**
 * Channel Schema
 *
 * The msg collection in the DB is a set of key/value pairs which define
 * specific msgs.
 *
 * @type {mongoose.Schema}
 */
const ChannelSchema = mongoose.Schema({
        channel_id: String,
        channel_name: String,
        is_channel: Boolean,
        is_group: Boolean,
        is_im: Boolean,
        participant_id_arr: Array,
        team_id: String,
        channel_topic: String,
        channel_purpose: String,
        participants_sum: Int32
    }, { versionKey: false });

/**
 * Channel Model
 *
 * @type {mongoose.Model}
 */
const Channel = mongoose.model('channel', ChannelSchema)

module.exports =  Channel;