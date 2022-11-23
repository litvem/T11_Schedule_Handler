const mqtt = require("mqtt");
const { db, data } = require("./db.js");
const Booking = require("../models/booking.js");
const filter = require("../tools/filter.js");

const options = {
  qos: 1
}

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

  mqttClient.subscribe(sub_topics.initialSchedule, options);
  mqttClient.subscribe(sub_topics.scheduleRequest);

});

mqttClient.on("message", (topic, message) => {
  message = message.toString();

  switch (topic) {
    case sub_topics.initialSchedule:
      var interval = parseDate(message);
      publishSchedule(interval, pub_topics.initialSchedule);
      break;

    case sub_topics.scheduleRequest:
      var topic = getScheduleResponseTopic(message);
      var interval = parseDate(message);
      publishSchedule(interval, topic);
      break;
  }
});

async function publishSchedule(interval, topic) {
  // fetch bookings from this interval
  const bookings = await Booking.find({
    date: { $gte: interval.from, $lte: interval.to },
  });
  const dentists = data.dentists;
  const initialSchedule = filter.generateSchedule(dentists, bookings, interval);

  mqttClient.publish(topic, JSON.stringify(initialSchedule), options);
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
  message = JSON.parse(message);
  var intervalString = message.from + "-" + message.to;
  var topic = `${pub_topics.scheduleResponse}/${intervalString}`;
  return topic;
}

module.exports = mqttClient;
