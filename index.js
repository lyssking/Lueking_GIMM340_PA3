const express = require("express");
const db = require("./connection");
const app = express();

app.use(express.json());

async function insertSensorData(deviceId, distance_cm) {
    try {
        const result = await db.query(
            `INSERT INTO sensor_readings (device_id, distance_cm)
             VALUES (?, ?)`,
            [deviceId.trim(), distance_cm]
        );
    } catch (error) {
        console.error("Error inserting sensor data:", error);
        throw error;
    }
}

app.post("/api/sensor", async (req, res) => {
    const { deviceId, distance_cm } = req.body || {};

    if (
        typeof deviceId !== "string" ||
        deviceId.trim().length === 0 ||
        deviceId.length > 64 ||
        !Number.isFinite(distance_cm) ||
        distance_cm < 0 ||
        distance_cm > 99999999.99
    ) {
        return res.status(400).json({
            error: "Provide a deviceId and a valid distance_cm."
        });
    }

    try {
        await insertSensorData(deviceId, distance_cm);

        return res.status(201).json({
            message: "Distance reading saved"
        });
    } catch (error) {
        return res.status(500).json({
            error: "Could not save distance reading"
        });
    }
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});

