const mqtt = require("mqtt");
const { db, data } = require("./db.js");
const Booking = require("../models/booking.js");
const filter = require("../tools/filter.js");
const utils = require("../tools/utils.js");

const options = {
  qos: 1,
};

const schedules = new Map();

const HOST = "mqtt://localhost";
const PORT = 1883;

const sub_topics = {
  initialSchedule: "schedule/initial/request",
  scheduleRequest: "schedule/request",
  removeInterval: "schedule/remove/client",
};

const pub_topics = {
  initialSchedule: "schedule/initial/response",
  scheduleResponse: "schedule/response",
};

const mqttClient = mqtt.connect(`${HOST}:${PORT}`);

mqttClient.on("connect", () => {
  console.log("Schedule handler connected to MQTT broker");

  mqttClient.subscribe(sub_topics.initialSchedule, options);
  mqttClient.subscribe(sub_topics.scheduleRequest, options);
  mqttClient.subscribe(sub_topics.removeInterval);

  Booking.watch().on("change", (data) => {
    if (data.operationType === "insert") {
      const date = new Date(data.fullDocument.date);
      publishUpdatedSchedules(schedules, date);
    }
  });
});

mqttClient.on("message", (topic, message) => {
  if (message) {
    message = message.toString();
  }

  switch (topic) {
    case sub_topics.initialSchedule:
      utils.addToMap(schedules, message);
      console.log(schedules);

      var interval = parseDate(message);
      publishSchedule(interval, pub_topics.initialSchedule);
      break;

    case sub_topics.scheduleRequest:
      var intervals = JSON.parse(message);

      var previousIntervalString = JSON.stringify(intervals.previousInterval);
      var newIntervalString = JSON.stringify(intervals.newInterval);

      utils.deductFromMap(schedules, previousIntervalString);
      utils.addToMap(schedules, newIntervalString);

      console.log(schedules);

      var topic = getScheduleResponseTopic(newIntervalString);
      var newInterval = parseDate(newIntervalString);

      publishSchedule(newInterval, topic);
      break;

    case sub_topics.removeInterval:
      utils.deductFromMap(schedules, message);
      break;
  }
});

async function publishSchedule(interval, topic) {
  // fetch bookings from this interval
  const bookings = await Booking.find({
    date: { $gte: interval.from, $lte: interval.to },
  });
  const dentists = data.dentists;
  const schedule = filter.generateSchedule(dentists, bookings, interval);

  mqttClient.publish(topic, JSON.stringify(schedule), options);
}

/**
 * The input is a string with the follwing format: {"from": "<yyyy-mm-dd>", "to":"<yyyy-mm-dd>"}
 * @param {String} stringInterval
 * @returns an object with the following format: {from: <Date>, to: <Date>} where the hours for the
 * "from" date is set to midnight and the hours for the "to" date to midnight
 */
function parseDate(stringInterval) {
  return JSON.parse(stringInterval, (key, value) => {
    if (key == "from") {
      return new Date(value);
    } else if (key == "to") {
      value = new Date(value);
      value.setHours(23, 59, 59);
      return value;
    } else {
      return value;
    }
  });
}

/**
 * Can receive both a string or object containg the from and to dates with the yyyy-mm-dd format
 * @param {String || Object} stringInterval
 * @returns the topic schedule/response/yyyy-mm-dd-yyyy-mm-dd
 */
function getScheduleResponseTopic(stringInterval) {
  if (typeof stringInterval === "string") {
    stringInterval = JSON.parse(stringInterval);
  }
  var intervalString = stringInterval.from + "-" + stringInterval.to;
  var topic = `${pub_topics.scheduleResponse}/${intervalString}`;
  return topic;
}

/**
 *
 * @param {Map} schedules
 * @param {Date} date
 */
function publishUpdatedSchedules(schedules, date) {
  for (const key of schedules.keys()) {
    let interval = parseDate(key);

    if (date >= interval.from && date < interval.to) {
      var topic = getScheduleResponseTopic(key);
      publishSchedule(interval, topic);
    }
  }
}

module.exports = mqttClient;
