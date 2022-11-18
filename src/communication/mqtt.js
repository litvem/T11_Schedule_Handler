const mqtt = require("mqtt");

const HOST = "mqtt://localhost";
const PORT = 1883;

const mqttClient = mqtt.connect(`${HOST}:${PORT}`);

mqttClient.on("connect", () => {
  console.log("Schedule handler connected to MQTT broker");
});

module.exports = mqttClient;
