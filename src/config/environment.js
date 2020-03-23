require('dotenv').config();

/* eslint no-process-env:0 */
module.exports.default = {

    env: process.env.env,
    url: process.env.url,
    apiUrl: process.env.apiUrl,
    logLevel: process.env.logLevel,

    db: {
        host: process.env.db_host,
        port: process.env.db_port
    }
    // Grab everything in you .env file here
}