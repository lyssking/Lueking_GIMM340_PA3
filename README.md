# Arduino distance collector

The Arduino sends ultrasonic distance readings to Express on EC2. Express inserts them into MySQL on RDS.

## Private configuration

Copy `.env.example` to `.env` in the project folder and enter your database credentials. On EC2, create this file separately: Git does not upload it. Environment variables already set on the server take precedence over `.env`.

Copy `arduinotowifi/arduino_secrets.example.h` to `arduinotowifi/arduino_secrets.h` and enter your Wi-Fi credentials before uploading the sketch. Both secret files are ignored by Git. Example files must contain placeholders only.

Run `npm ci` to install dependencies. Start with `pm2 start index.js --name arduino-api`, or restart your existing PM2 process after updating. `index.js` loads the server in `node.js`.

Before deploying this credential change to EC2, create its `.env` file using the new database password. After pulling, run `npm ci`, then restart the existing PM2 process.

## Verify storage

Serial Monitor should show HTTP 201 and `Distance reading saved`. In Workbench, run:

```sql
SELECT * FROM arduino_data.sensor_readings ORDER BY id DESC LIMIT 20;
```

## Previously exposed credentials

Removing credentials from the current files does not erase Git history. Rotate all previously committed database and Wi-Fi passwords, contacting the school administrator for shared credentials. Repository visibility is managed separately in GitHub Settings. Do not restore old secret-bearing source files from a stash.
