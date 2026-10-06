const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env'), quiet: true });
const mysql = require('mysql2/promise');

for (const name of ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME']) {
    if (!process.env[name]) throw new Error(`Missing database setting: ${name}`);
}

let connection = null;

async function getConnection() {
    if (connection !== null) {
        return connection;
    }

    connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: Number(process.env.DB_PORT || 3306)
    });

    return connection;
}

function shouldReconnect(error) {
    const reconnectCodes = new Set([
        'PROTOCOL_CONNECTION_LOST',
        'ECONNRESET',
        'ECONNREFUSED',
        'ENOTFOUND'
    ]);

    return reconnectCodes.has(error?.code);
}

async function query(sql, params) {
    try {
        const activeConnection = await getConnection();
        const [results, ] = await activeConnection.query(sql, params);
        return results;
    } catch (error) {
        if (!shouldReconnect(error)) {
            throw error;
        }

        // Drop stale connection and retry once.
        connection = null;
        const activeConnection = await getConnection();
        const [results, ] = await activeConnection.query(sql, params);
        return results;
    }
}

module.exports = {
    query
}