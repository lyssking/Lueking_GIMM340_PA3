const mysql = require('mysql2/promise');

let connection = null;

async function getConnection() {
    if (connection !== null) {
        return connection;
    }

    connection = await mysql.createConnection({
        host: "db-gimm340pa3.cfuyk8gkaz8v.us-east-2.rds.amazonaws.com",
        user: "admin",
        password: "notpassword",
        database: 'arduino_data'
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