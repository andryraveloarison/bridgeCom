// db.js
const { Pool } = require('pg');

const pool = new Pool({
    user: 'default',
    host: 'ep-noisy-mud-a4ztebyt-pooler.us-east-1.aws.neon.tech',
    database: '6GoqKQcE0fTt',
    password: 'verceldb',
    port: 5432,
});

module.exports = pool;
