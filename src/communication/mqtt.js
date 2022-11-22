const mqtt = require("mqtt");
const { db, data } = require("./db.js");
const Booking = require("../models/booking.js");
const filter = require("../tools/filter.js");

const HOST = "mqtt://localhost";
const PORT = 1883;

const sub_topics = {
  initialSchedule: "schedule/initial/request",
  scheduleRequest: "schedule/request",
};

const pub_topics = {
  initialSchedule: "schedule/initial/response",
  scheduleResponse: "schedule/response",
};

const mqttClient = mqtt.connect(`${HOST}:${PORT}`);

mqttClient.on("connect", () => {
  console.log("Schedule handler connected to MQTT broker");
  mqttClient.subscribe(sub_topics.initialSchedule);
});

mqttClient.on("message", (topic, message) => {
  message = message.toString();

  switch (topic) {
    case sub_topics.initialSchedule:
      const interval = parseDate(message);
      publishInitialSchedule(interval);
    // fetch bookings from this interval
  }
});

async function publishInitialSchedule(interval) {
  const bookings = await Booking.find({
    date: { $gte: interval.from, $lte: interval.to },
  });
  const dentists = data.dentists;
  const initialSchedule = filter.generateSchedule(dentists, bookings, interval);

  mqttClient.publish(
    pub_topics.initialSchedule,
    JSON.stringify(initialSchedule)
  );
}

function parseDate(stringInterval) {
  return JSON.parse(stringInterval, (key, value) => {
    if (key) {
      return new Date(value);
    } else {
      return value;
    }
  });
}

function getScheduleResponseTopic(message) {
  message = JSON.parse(message)
  var intervalString = message.from + "-" + message.to;
  var topic = `${pub_topics.scheduleResponse}/${intervalString}`;
  return topic;
}

module.exports = mqttClient;
