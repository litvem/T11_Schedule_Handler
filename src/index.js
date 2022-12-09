const path = require("path")
require('dotenv').config({path:path.resolve(__dirname, "../.env")})
const mqttClient = require("./communication/mqtt.js");
