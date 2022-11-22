const mqtt = require("mqtt");
const { db, data } = require("./db.js");
const Booking = require("../models/booking.js");
const filter = require("../tools/filter.js");

const DAY = 1000 * 60 * 60 * 24; //day in milliseconds

const HOST = "mqtt://localhost";
const PORT = 1883;

const sub_topics = {
  initialSchedule: "schedule/initial/request",
};

const pub_topics = {
  initialSchedule: "schedule/initial/response",
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
      const interval = getCurrentWeekInterval();
      publishInitialSchedule(interval);
      break;
  }
});

async function publishInitialSchedule(interval) {
  //get all the bookings from the desired interval
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

function getCurrentWeekInterval() {
  var today = new Date();

  today.setHours(1, 0, 0, 0);

  //returns a number from 0 (sunday) to saturday according to the mdn wev docs: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getDay
  //however we want that each week starts in a monday and ends in a sunday
  const dayOfTheWeek = today.getDay();

  var start, end;
  if (dayOfTheWeek == 0) {
    start = new Date(today.getTime() - 7 * DAY);
    end = today;
    end.setHours(23, 59, 59);
  } else {
    start = new Date(today.getTime() - DAY * (dayOfTheWeek - 1));
    end = new Date(today.getTime() + DAY * (7 - dayOfTheWeek));
    end.setHours(23, 59, 59);
  }
  //set the end hours to 23:59:59 to include all of its bookings

  var interval = {
    from: start,
    to: end,
  };

  return interval;
}

module.exports = mqttClient;
