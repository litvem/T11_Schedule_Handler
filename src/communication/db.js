const { default: mongoose } = require("mongoose");

const Booking = require("../models/booking.js");
const Dentist = require("../models/dentist.js");

var data = {
  dentists: [],
  bookings: [],
};

mongoose.connect(
  "mongodb://localhost:27017/dentistimoDB",
  { useNewUrlParser: true },
  (err) => {
    if (err) {
      console.error("Failed to connect to MongoDB");
      process.exit(1);
    }
    console.log("Connected to Mongo database: dentistimoDB");
    fetchData();
  }
);

async function fetchData() {
  data.dentists = await Dentist.find({});
  data.bookings = await Booking.find({});
}

module.exports = { mongoose, data };
