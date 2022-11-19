const { db, data } = require("./communication/db.js");
const mqttClient = require("./communication/mqtt.js");
const filter = require("./tools/filter.js");

const t = '{"from": "2022-11-18", "to": "2022-11-21" }'
setTimeout(
  () =>
    console.log(
      filter.generateSchedule(data.dentists, data.bookings, t)[0].schedule
    ),
  1000
);

