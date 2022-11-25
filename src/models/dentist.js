const { default: mongoose, Schema } = require("mongoose");

const dentistSchema = new Schema({
  id: { type: Number },
  name: { type: String },
  owner: { type: String },
  dentists: { type: Number },
  address: { type: String },
  city: { type: String },
  coordinate: {
    longitude: { type: Number },
    latitude: { type: Number },
  },
  openinghours: {
    monday: { type: String },
    tuesday: { type: String },
    wednesday: { type: String },
    thursday: { type: String },
    friday: { type: String },
  },
});

const dentist = mongoose.model("dentists", dentistSchema)
module.exports = dentist
